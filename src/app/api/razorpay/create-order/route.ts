import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import crypto from 'crypto'
import { extractOrg } from '@/lib/subscription'

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

        const amount = 4900 // Razorpay works in paise (₹49 = 4900 paise)
        
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: receiptId,
            notes: {
                customer_id: user.id,
                org_id: orgId
            }
        }

        const response = await razorpay.orders.create(options)
        const orderId = response.id

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
                order_id: orderId,
                organization_id: orgId,
                user_id: user.id,
                amount: 49,
                status: 'CREATED'
            })

        return NextResponse.json({ orderId, amount: 49, key: keyId })

    } catch (error: any) {
        console.error('Razorpay Error:', error)
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
    }
}
