'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addDays } from 'date-fns'

export async function startFreeTrial(organizationId: string) {
    const supabase = await createServerClient()

    // 1. Verify User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 2. Verify Organization & Trial Status
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, trial_used, plan_type')
        .eq('id', organizationId)
        .single()

    if (orgError || !org) {
        return { error: 'Organization not found' }
    }

    if (org.trial_used) {
        return { error: 'Free trial already used for this organization.' }
    }

    if (org.plan_type === 'PRO' || org.plan_type === 'ENTERPRISE') {
        return { error: 'You are already on a premium plan.' }
    }

    // 3. Start Trial (5 Days) - Use Admin Client to bypass RLS
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
        return { error: 'Server misconfiguration: Missing Service Key' }
    }

    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey
    )

    const endDate = addDays(new Date(), 5).toISOString()

    const { error: updateError } = await adminClient
        .from('organizations')
        .update({
            plan_type: 'PRO',
            subscription_end_date: endDate,
            trial_used: true,
            subscription_status: 'TRIALING'
        })
        .eq('id', organizationId)

    if (updateError) {
        console.error('Trial Start Error:', updateError)
        return { error: `DB Error: ${updateError.message}` }
    }

    revalidatePath('/')
    return { success: true, message: 'Welcome to Pro! Your 5-day trial has started.' }
}
