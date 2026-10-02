import { NextRequest, NextResponse } from 'next/server'
import { Cashfree } from 'cashfree-pg'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check Keys
        const appId = process.env.CASHFREE_APP_ID
        const secretKey = process.env.CASHFREE_SECRET_KEY

        if (!appId || !secretKey) {
            return NextResponse.json({ error: 'Payment configuration missing' }, { status: 500 })
        }

        // Initialize v4
        Cashfree.XClientId = appId
        Cashfree.XClientSecret = secretKey
        Cashfree.XEnvironment = process.env.CASHFREE_ENV === 'PRODUCTION'
            ? Cashfree.Environment.PRODUCTION
            : Cashfree.Environment.SANDBOX

        // ── Pre-check: Don't create orders for already-active PRO users ──
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, mobile, organization_id, organizations(plan_type, subscription_status, subscription_end_date)')
            .eq('id', user.id)
            .single()

        if (!profile?.organization_id) {
            return NextResponse.json({ error: 'No organization found' }, { status: 400 })
        }

        const org = profile.organizations as any
        if (org?.plan_type === 'PRO' && org?.subscription_status === 'ACTIVE') {
            const endDate = org.subscription_end_date ? new Date(org.subscription_end_date) : null
            if (endDate && endDate > new Date()) {
                return NextResponse.json(
                    { error: 'You already have an active PRO subscription.' },
                    { status: 400 }
                )
            }
        }

        // ── Validate phone (no fake fallback) ──────────────────────────
        if (!profile?.mobile) {
            return NextResponse.json(
                { error: 'Please update your phone number in settings before purchasing.' },
                { status: 400 }
            )
        }

        // ── Cryptographically random order ID ──────────────────────────
        const orderId = `order_${crypto.randomUUID()}`

        const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).replace(/\/$/, '')

        const request = {
            order_amount: 49,
            order_currency: 'INR',
            order_id: orderId,
            customer_details: {
                customer_id: user.id,
                customer_phone: profile.mobile,
                customer_email: user.email!,
                customer_name: profile?.full_name || 'Inventory User'
            },
            order_meta: {
                return_url: `${baseUrl}/pricing?order_id={order_id}`
            }
        }

        const response = await Cashfree.PGCreateOrder('2022-09-01', request)
        const paymentSessionId = response.data.payment_session_id

        // ── Record order in payment_orders for idempotency tracking ────
        const supabaseAdmin = createSupabaseAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        await supabaseAdmin
            .from('payment_orders')
            .insert({
                order_id: orderId,
                organization_id: profile.organization_id,
                user_id: user.id,
                amount: 49,
                status: 'CREATED'
            })

        return NextResponse.json({ paymentSessionId, orderId })

    } catch (error: any) {
        console.error('Cashfree Error:', error)
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
    }
}
