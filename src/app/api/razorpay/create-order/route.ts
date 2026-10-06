import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import crypto from 'crypto'
import { extractOrg } from '@/lib/subscription'
import { PLANS_CONFIG } from '@/config/plans'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check Keys
        const keyId = process.env.RAZORPAY_KEY_ID
        const keySecret = process.env.RAZORPAY_KEY_SECRET

        if (!keyId || !keySecret) {
            return NextResponse.json({ error: 'Payment configuration missing' }, { status: 500 })
        }

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        })

        // ── Pre-check: Don't create orders for already-active PRO users ──
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, organization_id, organizations(plan_type, subscription_status, subscription_end_date)')
            .eq('id', user.id)
            .single()

        let orgId = profile?.organization_id
        if (!orgId) {
            const { data: userOrg } = await supabase
                .from('organizations')
                .select('id')
                .eq('created_by', user.id)
                .maybeSingle()
            if (userOrg?.id) {
                orgId = userOrg.id
            }
        }

        if (!orgId) {
            return NextResponse.json({ error: 'Please create an organization or complete onboarding before upgrading.' }, { status: 400 })
        }

        const org = extractOrg(profile)
        if (org?.plan_type === 'PRO' && org?.subscription_status === 'ACTIVE') {
            const endDate = org.subscription_end_date ? new Date(org.subscription_end_date) : null
            if (!endDate || endDate > new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)) {
                return NextResponse.json(
                    { error: 'You already have an active PRO subscription.' },
                    { status: 400 }
                )
            }
        }

        // ── Parse & Validate Customer Phone Number ────────────────────
        function sanitizeIndianMobile(input: any): string {
            if (!input) return ''
            const digits = String(input).replace(/\D/g, '')
            if (digits.length === 12 && digits.startsWith('91')) {
                return digits.slice(2)
            }
            if (digits.length === 11 && digits.startsWith('0')) {
                return digits.slice(1)
            }
            if (digits.length === 10) {
                return digits
            }
            return ''
        }

        const body = await req.json().catch(() => ({}))
        const effectivePhone = sanitizeIndianMobile(body?.phone) ||
            sanitizeIndianMobile(user.phone) ||
            sanitizeIndianMobile((user.user_metadata as any)?.phone)

        const phoneRegex = /^[6-9]\d{9}$/
        if (!effectivePhone || !phoneRegex.test(effectivePhone)) {
            return NextResponse.json(
                { error: 'Please enter a valid 10-digit mobile number (starting with 6, 7, 8, or 9) for invoice and payment confirmation.' },
                { status: 400 }
            )
        }

        // ── Cryptographically random receipt ID ──────────────────────────
        const receiptId = `rcpt_${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`

        const isYearly = body?.cycle === 'yearly'
        const planConfig = isYearly ? PLANS_CONFIG.pro.yearly : PLANS_CONFIG.pro.monthly
        const priceInRupees = planConfig.price
        const amountInPaise = priceInRupees * 100
        
        let subscriptionId: string | null = null
        let orderId: string | null = null

        // ── 1. Create Recurring Subscription (Autopay) if Plan ID configured ──
        if (planConfig.razorpayPlanId) {
            try {
                const subResponse: any = await razorpay.subscriptions.create({
                    plan_id: planConfig.razorpayPlanId,
                    total_count: isYearly ? 5 : 60,
                    quantity: 1,
                    customer_notify: 1,
                    notes: {
                        customer_id: user.id,
                        org_id: orgId,
                        cycle: planConfig.cycle,
                        duration_days: String(planConfig.durationDays),
                        plan_id: planConfig.razorpayPlanId
                    }
                })
                subscriptionId = subResponse.id
            } catch (subErr: any) {
                console.warn('Subscription creation skipped or failed, falling back to Order:', subErr?.message || subErr)
            }
        }

        // ── 2. Fallback to standard one-time order if no subscription created ──
        if (!subscriptionId) {
            const options = {
                amount: amountInPaise,
                currency: 'INR',
                receipt: receiptId,
                notes: {
                    customer_id: user.id,
                    org_id: orgId,
                    cycle: planConfig.cycle,
                    duration_days: String(planConfig.durationDays),
                    plan_id: planConfig.razorpayPlanId || ''
                }
            }
            const orderResponse = await razorpay.orders.create(options)
            orderId = orderResponse.id
        }

        const trackingId = (subscriptionId || orderId)!

        // ── Record order & save customer phone in Supabase ────────────
        const supabaseAdmin = createSupabaseAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Permanently link phone to user's auth account
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
                ...(user.user_metadata || {}),
                phone: effectivePhone
            }
        }).catch((err) => console.error('Failed to save phone to user_metadata:', err))

        // 2. Also save to profiles table if phone column exists
        try {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({ phone: effectivePhone })
                .eq('id', user.id)

            if (profileError && profileError.code !== 'PGRST204') {
                console.error('Error updating profiles.phone:', profileError)
            }
        } catch {
            // Ignore if column does not exist yet
        }

        // 3. Record order in payment_orders for idempotency tracking
        await supabaseAdmin
            .from('payment_orders')
            .insert({
                order_id: trackingId,
                organization_id: orgId,
                user_id: user.id,
                amount: priceInRupees,
                status: 'CREATED'
            })

        return NextResponse.json({
            subscriptionId,
            orderId,
            amount: priceInRupees,
            cycle: isYearly ? 'yearly' : 'monthly',
            key: keyId
        })

    } catch (error: any) {
        console.error('Razorpay Error:', error)
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
    }
}
