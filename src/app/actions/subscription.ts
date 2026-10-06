'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addDays } from 'date-fns'

export async function startFreeTrial(targetOrganizationId?: string) {
    const supabase = await createServerClient()

    // 1. Verify User Session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 2. Fetch User Profile & Role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id, role, is_super_admin')
        .eq('id', user.id)
        .single()

    if (profileError || !profile?.organization_id) {
        return { error: 'Organization profile not found' }
    }

    // Security Check: Only ADMIN or Super Admin can trigger trial, and must match their own org
    if (profile.role !== 'ADMIN' && !profile.is_super_admin) {
        return { error: 'Only Organization Admins can initiate a free trial.' }
    }

    const organizationId = profile.organization_id

    if (targetOrganizationId && targetOrganizationId !== organizationId && !profile.is_super_admin) {
        return { error: 'Forbidden: Cannot manage trial for another organization.' }
    }

    // 3. Verify Organization & Trial Status
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

    if (org.plan_type === 'PRO') {
        return { error: 'You are already on a premium plan.' }
    }

    // 4. Start Trial (5 Days) - Use Admin Client to bypass RLS
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
        return { error: 'Failed to activate trial. Please try again or contact support.' }
    }

    revalidatePath('/')
    return { success: true, message: 'Welcome to Pro! Your 5-day trial has started.' }
}

