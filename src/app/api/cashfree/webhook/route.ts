import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

/**
 * Cashfree Webhook Handler
 * Receives automated backend payment updates directly from Cashfree.
 * Verifies signature (MANDATORY), checks idempotency via payment_orders table,
 * and upgrades organization plan.
 */
export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text()
        const signature = req.headers.get('x-webhook-signature')
        const timestamp = req.headers.get('x-webhook-timestamp')

        const secretKey = process.env.CASHFREE_SECRET_KEY

        if (!secretKey) {
            console.error('Webhook Error: CASHFREE_SECRET_KEY not configured')
            return NextResponse.json({ error: 'Webhook misconfigured' }, { status: 500 })
        }

        // ── MANDATORY Signature Verification ───────────────────────────
        // Reject immediately if signature or timestamp headers are missing.
        // Without this, anyone can POST a fake payload and upgrade orgs for free.
        if (!signature || !timestamp) {
            console.error('Webhook Error: Missing signature or timestamp headers')
            return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 })
        }

        const dataToSign = timestamp + rawBody
        const expectedSignature = crypto
            .createHmac('sha256', secretKey)
            .update(dataToSign)
            .digest('base64')

        if (signature !== expectedSignature) {
            console.error('Webhook Error: Invalid signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const payload = JSON.parse(rawBody)
        const eventType = payload?.type

        // Process SUCCESS event
        if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || payload?.data?.payment?.payment_status === 'SUCCESS') {
            const orderData = payload?.data?.order
            const customerDetails = orderData?.customer_details
            const customerId = customerDetails?.customer_id
            const orderId = orderData?.order_id
            const paymentId = payload?.data?.payment?.cf_payment_id?.toString()

            if (!customerId) {
                console.error('Webhook Error: Missing customer_id in payload')
                return NextResponse.json({ error: 'Missing customer_id' }, { status: 400 })
            }

            if (!orderId) {
                console.error('Webhook Error: Missing order_id in payload')
                return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
            }

            const supabaseAdmin = createSupabaseAdmin(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            )

            // ── Idempotency Check ──────────────────────────────────────
            // Check if this order was already processed (by webhook or verify endpoint).
            // This prevents double-upgrades and is the dedup key for webhook + verify race.
            const { data: existingOrder } = await supabaseAdmin
                .from('payment_orders')
                .select('id, status')
                .eq('order_id', orderId)
                .single()

            if (existingOrder?.status === 'SUCCESS') {
                // Already processed — acknowledge but don't re-upgrade
                console.log(`Webhook: Order ${orderId} already processed, skipping`)
                return NextResponse.json({ success: true, message: 'Already processed' })
            }

            // Find user's profile and organization_id
            const { data: profile, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('organization_id')
                .eq('id', customerId)
                .single()

            if (profileError || !profile?.organization_id) {
                console.error('Webhook Error: Profile/Organization not found for customer:', customerId)
                return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
            }

            const startDate = new Date()
            const endDate = new Date()
            endDate.setDate(startDate.getDate() + 30) // 30 Days

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
                console.error('Webhook DB Error:', updateError)
                return NextResponse.json({ error: 'Failed to upgrade subscription' }, { status: 500 })
            }

            // ── Record successful payment for idempotency ──────────────
            await supabaseAdmin
                .from('payment_orders')
                .upsert({
                    order_id: orderId,
                    organization_id: profile.organization_id,
                    user_id: customerId,
                    amount: orderData?.order_amount || 49,
                    status: 'SUCCESS',
                    cashfree_payment_id: paymentId || null,
                    processed_at: new Date().toISOString(),
                    source: 'WEBHOOK',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'order_id' })

            console.log(`Webhook Success: Organization ${profile.organization_id} upgraded to PRO via payment webhook`)
            return NextResponse.json({ success: true, message: 'Subscription upgraded via webhook' })
        }

        // Acknowledge other event types (e.g. PAYMENT_FAILED_WEBHOOK)
        return NextResponse.json({ received: true })

    } catch (error: any) {
        console.error('Cashfree Webhook Exception:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
