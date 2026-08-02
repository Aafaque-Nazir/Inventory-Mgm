import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

/**
 * Cashfree Webhook Handler
 * Receives automated backend payment updates directly from Cashfree.
 * Verifies signature, extracts customer_id & order_id, and upgrades organization plan.
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

        // Verify Webhook Signature (HMAC SHA256) if headers are provided
        if (signature && timestamp) {
            const dataToSign = timestamp + rawBody
            const expectedSignature = crypto
                .createHmac('sha256', secretKey)
                .update(dataToSign)
                .digest('base64')

            if (signature !== expectedSignature) {
                console.error('Webhook Error: Invalid signature')
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
            }
        }

        const payload = JSON.parse(rawBody)
        const eventType = payload?.type

        // Process SUCCESS event
        if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || payload?.data?.payment?.payment_status === 'SUCCESS') {
            const orderData = payload?.data?.order
            const customerDetails = orderData?.customer_details
            const customerId = customerDetails?.customer_id

            if (!customerId) {
                console.error('Webhook Error: Missing customer_id in payload')
                return NextResponse.json({ error: 'Missing customer_id' }, { status: 400 })
            }

            const supabaseAdmin = createSupabaseAdmin(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            )

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
