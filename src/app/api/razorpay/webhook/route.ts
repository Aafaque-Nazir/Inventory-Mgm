import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { activateProPlan } from '@/lib/subscription-server'


export async function POST(req: NextRequest) {
    try {
        const bodyText = await req.text()
        const signature = req.headers.get('x-razorpay-signature')
        
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

        if (!signature || !webhookSecret) {
            console.error('Webhook Error: Missing signature or RAZORPAY_WEBHOOK_SECRET')
            return NextResponse.json({ error: 'Configuration Error' }, { status: 400 })
        }

        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(bodyText)
            .digest('hex')

        if (expectedSignature !== signature) {
            console.error('Webhook Error: Invalid Signature')
            return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 })
        }

        const event = JSON.parse(bodyText)

        // ── 1. Recurring Subscription Charged (UPI Autopay / e-Mandate) ──
        if (event.event === 'subscription.charged') {
            const subscriptionEntity = event.payload?.subscription?.entity
            const paymentEntity = event.payload?.payment?.entity
            const subId = subscriptionEntity?.id
            const paymentId = paymentEntity?.id

            if (subId) {
                const supabaseAdmin = createSupabaseAdmin(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                )

                // Try finding by subscription order
                const { data: orderRow } = await supabaseAdmin
                    .from('payment_orders')
                    .select('*')
                    .eq('order_id', subId)
                    .maybeSingle()

                const orgId = orderRow?.organization_id || subscriptionEntity?.notes?.org_id
                const cycle = subscriptionEntity?.notes?.cycle
                const durationDays = cycle === 'yearly' || Number(orderRow?.amount) >= 900 ? 365 : 30

                if (orgId) {
                    await activateProPlan(orgId, durationDays)

                    if (orderRow) {
                        await supabaseAdmin
                            .from('payment_orders')
                            .update({
                                status: 'SUCCESS',
                                razorpay_payment_id: paymentId || orderRow.razorpay_payment_id,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', orderRow.id)
                    }
                }
            }
            return NextResponse.json({ success: true })
        }
        
        // ── 2. Standard One-Time Order Paid ─────────────────────────────
        if (event.event === 'payment.captured' || event.event === 'order.paid') {
            const paymentEntity = event.payload.payment?.entity || event.payload.order?.entity
            const orderId = paymentEntity.order_id
            const paymentId = paymentEntity.id

            if (!orderId) {
                 return NextResponse.json({ success: true, message: 'No order ID in payload' })
            }

            const supabaseAdmin = createSupabaseAdmin(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            )

            const { data: orderRow, error: orderError } = await supabaseAdmin
                .from('payment_orders')
                .select('*')
                .eq('order_id', orderId)
                .single()

            if (!orderError && orderRow && orderRow.status !== 'SUCCESS') {
                const orgId = orderRow.organization_id
                const durationDays = Number(orderRow.amount) >= 900 ? 365 : 30
                await activateProPlan(orgId, durationDays)

                await supabaseAdmin
                    .from('payment_orders')
                    .update({
                        status: 'SUCCESS',
                        razorpay_payment_id: paymentId,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', orderRow.id)
            }
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Razorpay Webhook Exception:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
