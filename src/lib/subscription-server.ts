import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export interface ActivateProPlanResult {
    success: boolean
    newEndDate?: string
    error?: string
}

/**
 * Centrally activates or extends the PRO subscription for an organization.
 * Used by both Razorpay verify route and Razorpay webhook handler to ensure
 * consistency and prevent duplicated business logic.
 */
export async function activateProPlan(
    orgId: string,
    durationDays: number = 30
): Promise<ActivateProPlanResult> {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !serviceKey) {
            return { success: false, error: 'Database configuration missing' }
        }

        const supabaseAdmin = createSupabaseAdmin(supabaseUrl, serviceKey)

        // 1. Fetch current subscription_end_date to extend seamlessly if already active
        const { data: currentOrg, error: fetchError } = await supabaseAdmin
            .from('organizations')
            .select('subscription_end_date, plan_type')
            .eq('id', orgId)
            .single()

        if (fetchError || !currentOrg) {
            console.error('activateProPlan: Failed to fetch organization:', fetchError)
            return { success: false, error: 'Organization not found' }
        }

        let baseDate = new Date()
        if (currentOrg.subscription_end_date) {
            const existingExpiry = new Date(currentOrg.subscription_end_date)
            if (!isNaN(existingExpiry.getTime()) && existingExpiry > baseDate) {
                baseDate = existingExpiry
            }
        }

        const newEndDate = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString()

        // 2. Update organization to PRO plan with generous user & item limits
        const { error: updateError } = await supabaseAdmin
            .from('organizations')
            .update({
                plan_type: 'PRO',
                subscription_status: 'ACTIVE',
                subscription_end_date: newEndDate,
                max_users: 5,
                max_items: 100000,
                trial_used: true
            })
            .eq('id', orgId)

        if (updateError) {
            console.error('activateProPlan: Failed to update organization plan:', updateError)
            return { success: false, error: updateError.message }
        }

        return { success: true, newEndDate }
    } catch (err: any) {
        console.error('activateProPlan: Unexpected exception:', err)
        return { success: false, error: err.message || 'Internal subscription error' }
    }
}
