import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * Scheduled Cron Job to check and downgrade expired trials and subscriptions.
 * Can be triggered via Vercel Cron, GitHub Actions, or Supabase pg_cron.
 * Protected by CRON_SECRET environment variable.
 */
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        // Security check if CRON_SECRET is configured
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !serviceKey) {
            return NextResponse.json({ error: 'Database service configuration missing' }, { status: 500 })
        }

        const supabaseAdmin = createSupabaseAdmin(supabaseUrl, serviceKey)
        const nowIso = new Date().toISOString()

        // 1. Find organizations whose subscription_end_date has passed and are still marked PRO/ACTIVE/TRIALING
        const { data: expiredOrgs, error: fetchError } = await supabaseAdmin
            .from('organizations')
            .select('id, name, plan_type, subscription_status, subscription_end_date')
            .not('subscription_end_date', 'is', null)
            .lt('subscription_end_date', nowIso)
            .in('subscription_status', ['ACTIVE', 'TRIALING'])

        if (fetchError) {
            console.error('Subscription cron fetch error:', fetchError)
            return NextResponse.json({ error: fetchError.message }, { status: 500 })
        }

        if (!expiredOrgs || expiredOrgs.length === 0) {
            return NextResponse.json({
                message: 'No expired subscriptions found',
                processedCount: 0,
                timestamp: nowIso
            })
        }

        const expiredIds = expiredOrgs.map(o => o.id)

        // 2. Batch downgrade expired organizations to FREE plan
        const { error: updateError } = await supabaseAdmin
            .from('organizations')
            .update({
                plan_type: 'FREE',
                subscription_status: 'EXPIRED',
                max_users: 1,
                max_items: 200
            })
            .in('id', expiredIds)

        if (updateError) {
            console.error('Subscription cron update error:', updateError)
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: `Successfully downgraded ${expiredOrgs.length} expired organization(s)`,
            processedCount: expiredOrgs.length,
            downgradedOrgs: expiredOrgs.map(o => ({ id: o.id, name: o.name, previousPlan: o.plan_type })),
            timestamp: nowIso
        })

    } catch (err: any) {
        console.error('Subscription cron exception:', err)
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
    }
}
