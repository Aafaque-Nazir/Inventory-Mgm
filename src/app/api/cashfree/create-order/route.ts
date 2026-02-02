import { NextRequest, NextResponse } from 'next/server'
import { Cashfree } from 'cashfree-pg'
import { createClient } from '@/lib/supabase/server'

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
            return NextResponse.json({ error: 'Missing Keys' }, { status: 500 })
        }

        // Initialize v4
        // @ts-ignore
        Cashfree.XClientId = appId
        // @ts-ignore
        Cashfree.XClientSecret = secretKey
        // @ts-ignore
        Cashfree.XEnvironment = process.env.CASHFREE_ENV === 'PRODUCTION'
            ? Cashfree.Environment.PRODUCTION
            : Cashfree.Environment.SANDBOX

        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, mobile')
            .eq('id', user.id)
            .single()

        const orderId = 'order_' + Date.now() + '_' + user.id.slice(0, 5)

        const request = {
            order_amount: 9,
            order_currency: 'INR',
            order_id: orderId,
            customer_details: {
                customer_id: user.id,
                customer_phone: profile?.mobile || '9999999999',
                customer_email: user.email!,
                customer_name: profile?.full_name || 'Inventory User'
            },
            order_meta: {
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?order_id={order_id}`
            }
        }

        // @ts-ignore
        const response = await Cashfree.PGCreateOrder('2022-09-01', request)
        const paymentSessionId = response.data.payment_session_id

        return NextResponse.json({ paymentSessionId, orderId })

    } catch (error: any) {
        console.error('Cashfree Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
