'use server'

import { createClient } from '@/lib/supabase/server'
import { AuditLog } from '@/types'

export async function logAction(
    action: string,
    entityType: string,
    entityId: string | null = null,
    details: any = null
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Get Organization ID
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No Organization Found' }

    const { error } = await supabase.from('audit_logs').insert({
        organization_id: profile.organization_id,
        actor_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details
    })

    if (error) {
        console.error('Audit Log Error:', error)
        return { error: 'Failed to log action' }
    }

    return { success: true }
}

export async function getAuditLogs(page: number = 1, limit: number = 20) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { logs: [], total: 0 }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, organizations(plan_type)')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { logs: [], total: 0 }

    // Pro Check (Optional: enforce here or in UI. Enforcing here is safer)
    // @ts-ignore
    // if (profile.organizations?.plan_type !== 'PRO') {
    //     return { logs: [], total: 0, error: 'Pro feature required' }
    // }

    const offset = (page - 1) * limit

    const { data: logs, count } = await supabase
        .from('audit_logs')
        .select('*, profile:profiles(full_name)', { count: 'exact' })
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    return { logs: logs as AuditLog[] || [], total: count || 0 }
}
