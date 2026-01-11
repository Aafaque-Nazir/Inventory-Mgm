'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAdminTickets(statusFilter?: string) {
    const supabase = await createClient()

    // Check Super Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_super_admin) return { error: 'Forbidden' }

    // Fetch Tickets
    let query = supabase
        .from('support_tickets')
        .select(`
            *,
            profiles:user_id (full_name),
            organizations:organization_id (name)
        `)
        .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) {
        console.error('Fetch tickets error:', error)
        return { error: 'Failed to fetch tickets' }
    }

    return { data }
}

export async function updateTicketStatus(ticketId: string, newStatus: string) {
    const supabase = await createClient()

    // Check Super Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_super_admin) return { error: 'Forbidden' }

    const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', ticketId)

    if (error) return { error: error.message }

    revalidatePath('/super-admin')
    return { message: 'Status updated' }
}

export async function getAdminOverviewStats() {
    const supabase = await createClient()

    // Check Super Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('is_super_admin').eq('id', user.id).single()
    if (!profile?.is_super_admin) return { error: 'Forbidden' }

    // Parallel fetching
    try {
        const [
            { count: totalOrgs },
            { count: totalUsers },
            { count: proOrgs },
            { count: entOrgs },
            { data: recentOrgs },
            { data: allOrgs }
        ] = await Promise.all([
            supabase.from('organizations').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('plan_type', 'PRO'),
            supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('plan_type', 'ENTERPRISE'),
            supabase.from('organizations').select('*').order('created_at', { ascending: false }).limit(5),
            supabase.from('organizations').select('created_at, plan_type').order('created_at', { ascending: true })
        ])

        const mrr = (proOrgs || 0) * 499 + (entOrgs || 0) * 9999

        // Calculate simulated history based on creation dates
        // 1. Group by Month
        const revenueByMonth: Record<string, number> = {}

        // Initialize last 6 months to 0 to ensure chart has range
        for (let i = 5; i >= 0; i--) {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            const key = date.toLocaleString('default', { month: 'short' })
            revenueByMonth[key] = 0
        }

        let runningRevenue = 0;

        // Correct Logic:
        const months = []
        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            d.setDate(1) // Start of month
            d.setHours(0, 0, 0, 0)
            months.push(d)
        }

        const revenueHistory = months.map(monthStart => {
            // End of this month
            const monthEnd = new Date(monthStart)
            monthEnd.setMonth(monthEnd.getMonth() + 1)

            // Calculate revenue active at this point in time
            // We assume current plan was active since creation (Approximation)
            const activeOrgs = (allOrgs || []).filter(o => new Date(o.created_at) < monthEnd)

            const rev = activeOrgs.reduce((sum, org) => {
                if (org.plan_type === 'PRO') return sum + 499
                if (org.plan_type === 'ENTERPRISE') return sum + 9999
                return sum
            }, 0)

            return {
                month: monthStart.toLocaleString('default', { month: 'short' }),
                revenue: rev
            }
        })


        return {
            totalOrgs: totalOrgs || 0,
            totalUsers: totalUsers || 0,
            proOrgs: proOrgs || 0,
            entOrgs: entOrgs || 0,
            recentOrgs: recentOrgs || [],
            mrr,
            revenueHistory
        }
    } catch (error: any) {
        console.error('Admin Stats Error:', error)
        return { error: 'Failed to fetch admin stats' }
    }
}

// --- Organization Management ---

export async function searchOrganizations(query: string = '') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Check Super Admin
    const { data: profile } = await supabase.from('profiles').select('is_super_admin').eq('id', user.id).single()
    if (!profile?.is_super_admin) return { error: 'Forbidden' }

    let dbQuery = supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

    if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
    }

    const { data, error } = await dbQuery
    if (error) return { error: error.message }
    return { data }
}

export async function updateOrganization(orgId: string, updates: { plan_type?: string, status?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('is_super_admin').eq('id', user.id).single()
    if (!profile?.is_super_admin) return { error: 'Forbidden' }

    const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', orgId)

    if (error) return { error: error.message }
    revalidatePath('/super-admin')
    return { message: 'Organization updated successfully' }
}

// --- Announcements ---

export async function getAnnouncements() {
    const supabase = await createClient()
    // No super admin check for viewing list, but usually this is for admin panel
    const { data, error } = await supabase
        .from('system_announcements')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
}

export async function createAnnouncement(message: string, type: 'INFO' | 'WARNING' | 'CRITICAL') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('is_super_admin').eq('id', user.id).single()
    if (!profile?.is_super_admin) return { error: 'Forbidden' }

    const { error } = await supabase
        .from('system_announcements')
        .insert({ message, type, created_by: user.id, is_active: true })

    if (error) return { error: error.message }
    revalidatePath('/')
    return { message: 'Announcement created' }
}

export async function toggleAnnouncement(id: string, isActive: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('is_super_admin').eq('id', user.id).single()
    if (!profile?.is_super_admin) return { error: 'Forbidden' }

    const { error } = await supabase
        .from('system_announcements')
        .update({ is_active: isActive })
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/')
    return { message: 'Announcement updated' }
}

export async function deleteAnnouncement(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('is_super_admin').eq('id', user.id).single()
    if (!profile?.is_super_admin) return { error: 'Forbidden' }

    const { error } = await supabase
        .from('system_announcements')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/')
    return { message: 'Announcement deleted' }
}
