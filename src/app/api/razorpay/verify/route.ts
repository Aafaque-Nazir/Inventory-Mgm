import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { activateProPlan } from '@/lib/subscription-server'


export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { razorpay_order_id, razorpay_subscription_id, razorpay_payment_id, razorpay_signature, cycle } = body

        if (!razorpay_payment_id || !razorpay_signature || (!razorpay_order_id && !razorpay_subscription_id)) {
            return NextResponse.json({ success: false, error: 'Missing payment details' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        // Verify Signature
        const secretKey = process.env.RAZORPAY_KEY_SECRET
        if (!secretKey) {
            console.error('Razorpay Error: RAZORPAY_KEY_SECRET is not configured')
            return NextResponse.json({ success: false, error: 'Payment gateway configuration error' }, { status: 500 })
        }

        // Subscriptions use: payment_id + '|' + subscription_id
        // Standard orders use: order_id + '|' + payment_id
        const expectedMessage = razorpay_subscription_id
            ? `${razorpay_payment_id}|${razorpay_subscription_id}`
            : `${razorpay_order_id}|${razorpay_payment_id}`

        const generated_signature = crypto
            .createHmac('sha256', secretKey)
            .update(expectedMessage)
            .digest('hex')

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 })
        }

        // Initialize Supabase Admin for DB writes
        const supabaseAdmin = createSupabaseAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Find the payment order / subscription record
        const lookupId = (razorpay_subscription_id || razorpay_order_id)!
        const { data: orderRow, error: orderError } = await supabaseAdmin
            .from('payment_orders')
            .select('*')
            .eq('order_id', lookupId)
            .single()

        if (orderError || !orderRow) {
            console.error('Order Not Found:', orderError)
            return NextResponse.json({ success: false, error: 'Order not found in database' }, { status: 404 })
        }

        // Avoid double processing
        if (orderRow.status === 'SUCCESS') {
            return NextResponse.json({ success: true, message: 'Already processed' })
        }

        const orgId = orderRow.organization_id

        // Centralized plan activation based on cycle or order amount (Yearly >= ₹900 -> 365 days, else 30 days)
        const durationDays = cycle === 'yearly' || Number(orderRow.amount) >= 900 ? 365 : 30
        const activationResult = await activateProPlan(orgId, durationDays)
        if (!activationResult.success) {
            console.error('Organization Update Error:', activationResult.error)
            return NextResponse.json({ success: false, error: activationResult.error || 'Failed to update organization plan' }, { status: 500 })
        }

        const { error: orderUpdateError } = await supabaseAdmin
            .from('payment_orders')
            .update({
                status: 'SUCCESS',
                razorpay_payment_id: razorpay_payment_id,
                razorpay_signature: razorpay_signature,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderRow.id)

        if (orderUpdateError) {
            console.error('Payment Record Update Error:', orderUpdateError)
            // Soft failure, plan was upgraded
        }

        return NextResponse.json({ success: true, newEndDate: activationResult.newEndDate })

    } catch (error: any) {
        console.error('Razorpay Verification Error:', error)
        return NextResponse.json({ success: false, error: 'Internal verification error' }, { status: 500 })
    }
}
