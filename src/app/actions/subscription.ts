'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addDays } from 'date-fns'

export async function startFreeTrial(organizationId: string) {
    const supabase = await createClient()

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

    // 3. Start Trial (5 Days)
    const endDate = addDays(new Date(), 5).toISOString()

    const { error: updateError } = await supabase
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
        return { error: 'Failed to start trial. Please contact support.' }
    }

    revalidatePath('/')
    return { success: true, message: 'Welcome to Pro! Your 5-day trial has started.' }
}
