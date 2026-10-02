import { NextRequest, NextResponse } from 'next/server'
import { Cashfree } from 'cashfree-pg'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
    try {
        // 1. Auth check first
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized Session' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

        if (!profile?.organization_id) {
            return NextResponse.json({ error: 'No organization found' }, { status: 400 })
        }

        const body = await req.json()
        const { orderId } = body

        if (!orderId || typeof orderId !== 'string') {
            return NextResponse.json({ error: 'Valid Order ID required' }, { status: 400 })
        }

        // 2. Initialize Cashfree inside handler
        const appId = process.env.CASHFREE_APP_ID
        const secretKey = process.env.CASHFREE_SECRET_KEY

        if (!appId || !secretKey) {
            return NextResponse.json({ error: 'Server payment configuration missing' }, { status: 500 })
        }

        Cashfree.XClientId = appId
        Cashfree.XClientSecret = secretKey
        Cashfree.XEnvironment = process.env.CASHFREE_ENV === 'PRODUCTION'
            ? Cashfree.Environment.PRODUCTION
            : Cashfree.Environment.SANDBOX

        // 3. Admin client for privileged operations
        const supabaseAdmin = createSupabaseAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // ── Idempotency Check ──────────────────────────────────────────
        // If this order was already processed (by this endpoint or by webhook),
        // return success without re-upgrading. Prevents replay attacks.
        const { data: existingOrder } = await supabaseAdmin
            .from('payment_orders')
            .select('id, status')
            .eq('order_id', orderId)
            .single()

        if (existingOrder?.status === 'SUCCESS') {
            return NextResponse.json({
                success: true,
                message: 'Payment already verified and processed'
            })
        }

        // 4. Verify Order Details & Customer Ownership (Prevents Order ID spoofing)
        const orderResponse = await Cashfree.PGFetchOrder('2023-08-01', orderId)
        const orderData = orderResponse.data

        if (orderData?.customer_details?.customer_id !== user.id) {
            return NextResponse.json({ error: 'Order does not belong to this account' }, { status: 403 })
        }

        // 5. Fetch Order Payments Status
        const response = await Cashfree.PGOrderFetchPayments('2023-08-01', orderId)
        const payments = response.data

        // Check if any payment is successful
        const successfulPayment = payments?.find((p: any) => p.payment_status === 'SUCCESS')

        if (!successfulPayment) {
            return NextResponse.json({ error: 'Payment not successful' }, { status: 400 })
        }

        // 6. Upgrade Organization using Admin Client
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(startDate.getDate() + 30) // Add 30 Days

        const { error: updateError } = await supabaseAdmin
            .from('organizations')
            .update({
                plan_type: 'PRO',
                subscription_status: 'ACTIVE',
                subscription_start_date: startDate.toISOString(),
                subscription_end_date: endDate.toISOString(),
                max_users: 5
            })
            .eq('id', profile.organization_id)

        if (updateError) {
            console.error('DB Update Error:', updateError)
            return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
        }

        // ── Record successful payment for idempotency ──────────────────
        // This is the dedup key — once recorded as SUCCESS, neither this
        // endpoint nor the webhook will re-process this order.
        await supabaseAdmin
            .from('payment_orders')
            .upsert({
                order_id: orderId,
                organization_id: profile.organization_id,
                user_id: user.id,
                amount: orderData?.order_amount || 49,
                status: 'SUCCESS',
                cashfree_payment_id: successfulPayment.cf_payment_id?.toString() || null,
                processed_at: new Date().toISOString(),
                source: 'VERIFY',
                updated_at: new Date().toISOString()
            }, { onConflict: 'order_id' })

        return NextResponse.json({
            success: true,
            message: 'Subscription upgraded to PRO'
        })

    } catch (error: any) {
        console.error('Cashfree Verification Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
