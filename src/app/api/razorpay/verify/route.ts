import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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

        const generated_signature = crypto
            .createHmac('sha256', secretKey)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex')

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 })
        }

        // Initialize Supabase Admin for DB writes
        const supabaseAdmin = createSupabaseAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Find the payment order
        const { data: orderRow, error: orderError } = await supabaseAdmin
            .from('payment_orders')
            .select('*')
            .eq('order_id', razorpay_order_id)
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

        // Fetch current org subscription_end_date so we can extend if already active
        const { data: currentOrg } = await supabaseAdmin
            .from('organizations')
            .select('subscription_end_date')
            .eq('id', orgId)
            .single()

        let baseDate = new Date()
        if (currentOrg?.subscription_end_date) {
            const existingExpiry = new Date(currentOrg.subscription_end_date)
            if (!isNaN(existingExpiry.getTime()) && existingExpiry > baseDate) {
                baseDate = existingExpiry
            }
        }
        const newEndDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()

        // Transaction logic: Update organization plan and payment record
        const { error: orgUpdateError } = await supabaseAdmin
            .from('organizations')
            .update({
                plan_type: 'PRO',
                subscription_status: 'ACTIVE',
                subscription_end_date: newEndDate,
                max_users: 5,
                max_items: 10000,
                trial_used: true
            })
            .eq('id', orgId)

        if (orgUpdateError) {
            console.error('Organization Update Error:', orgUpdateError)
            return NextResponse.json({ success: false, error: 'Failed to update organization plan' }, { status: 500 })
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

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Razorpay Verification Error:', error)
        return NextResponse.json({ success: false, error: 'Internal verification error' }, { status: 500 })
    }
}
