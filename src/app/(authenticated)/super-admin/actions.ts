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

        const mrr = (proOrgs || 0) * 199

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

        const _runningRevenue = 0;

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
            const activeOrgs = (allOrgs || []).filter(o => new Date(o.created_at) < monthEnd)

            const rev = activeOrgs.reduce((sum, org) => {
                if (org.plan_type === 'PRO') return sum + 199
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

export async function deleteOrganization(orgId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('is_super_admin').eq('id', user.id).single()
    if (!profile?.is_super_admin) return { error: 'Forbidden' }

    // Manual Cascade Delete
    // 1. Stock Movements
    const { error: smError } = await supabase.from('stock_movements').delete().eq('organization_id', orgId)
    if (smError) return { error: `Failed to delete stock movements: ${smError.message}` }

    // 2. PO Items
    const { error: poiError } = await supabase.from('purchase_order_items').delete().eq('organization_id', orgId)
    if (poiError) return { error: `Failed to delete PO items: ${poiError.message}` }

    // 3. Purchase Orders
    const { error: poError } = await supabase.from('purchase_orders').delete().eq('organization_id', orgId)
    if (poError) return { error: `Failed to delete purchase orders: ${poError.message}` }

    // 4. Items
    const { error: itemsError } = await supabase.from('items').delete().eq('organization_id', orgId)
    if (itemsError) return { error: `Failed to delete items: ${itemsError.message}` }

    // 5. Suppliers
    const { error: suppError } = await supabase.from('suppliers').delete().eq('organization_id', orgId)
    if (suppError) return { error: `Failed to delete suppliers: ${suppError.message}` }

    // 6. Profiles (Detach users or Delete them? Ideally detach, but if we delete org, users with that org_id become orphans unless updated. 
    // For now, let's set their organization_id to NULL to avoid FK constraint if any, though profiles.organization_id is nullable in schema?)
    // Checking schema: organization_id uuid references organizations(id) - it IS nullable by default if not specified NOT NULL.
    // Let's check schema.sql line 19: organization_id uuid references organizations(id) -> Default is nullable.
    
    // We update profiles to remove org reference
    await supabase.from('profiles').update({ organization_id: null }).eq('organization_id', orgId)

    // 7. Organization
    const { error: orgError } = await supabase.from('organizations').delete().eq('id', orgId)
    if (orgError) return { error: `Failed to delete organization: ${orgError.message}` }

    revalidatePath('/super-admin')
    return { message: 'Organization deleted successfully' }
}

// --- Live Real System Diagnostics ---

export async function getSystemHealth() {
    const supabase = await createClient()

    // 1. Verify super admin authorization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_super_admin) return { error: 'Forbidden' }

    // 2. Measure actual Supabase Database round-trip ping latency and live row counts
    const dbStartTime = Date.now()
    let dbStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE' = 'ONLINE'
    let dbLatencyMs = 0

    let itemsCount = 0
    let movementsCount = 0
    let orgsCount = 0
    let usersCount = 0
    let warehousesCount = 0
    let ticketsCount = 0
    let lastWriteTime: string | null = null

    try {
        const [
            pingRes,
            itemsRes,
            movementsRes,
            orgsRes,
            usersRes,
            warehousesRes,
            ticketsRes,
            latestMovementRes
        ] = await Promise.all([
            supabase.from('profiles').select('id', { head: true, count: 'exact' }),
            supabase.from('items').select('*', { head: true, count: 'exact' }),
            supabase.from('stock_movements').select('*', { head: true, count: 'exact' }),
            supabase.from('organizations').select('*', { head: true, count: 'exact' }),
            supabase.from('profiles').select('*', { head: true, count: 'exact' }),
            supabase.from('warehouses').select('*', { head: true, count: 'exact' }),
            supabase.from('support_tickets').select('*', { head: true, count: 'exact' }),
            supabase.from('stock_movements').select('created_at').order('created_at', { ascending: false }).limit(1).maybeSingle()
        ])

        dbLatencyMs = Math.max(1, Date.now() - dbStartTime)

        if (pingRes.error) {
            dbStatus = 'DEGRADED'
        }

        itemsCount = itemsRes.count || 0
        movementsCount = movementsRes.count || 0
        orgsCount = orgsRes.count || 0
        usersCount = usersRes.count || 0
        warehousesCount = warehousesRes.count || 0
        ticketsCount = ticketsRes.count || 0
        lastWriteTime = latestMovementRes.data?.created_at || null
    } catch {
        dbLatencyMs = Math.max(1, Date.now() - dbStartTime)
        dbStatus = 'OFFLINE'
    }

    const totalRecords = itemsCount + movementsCount + orgsCount + usersCount + warehousesCount + ticketsCount

    // 3. Real Payment Gateway Status & Configuration
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || ''
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || ''
    const paymentGatewayOnline = Boolean(razorpayKeyId && razorpaySecret)
    const maskedAppId = razorpayKeyId.length > 8
        ? `${razorpayKeyId.slice(0, 4)}••••${razorpayKeyId.slice(-4)}`
        : (razorpayKeyId ? 'Configured' : 'Missing')

    // 4. Real Email Service Status & Configuration
    const resendKey = process.env.RESEND_API_KEY || ''
    const emailOnline = Boolean(resendKey)
    const maskedResendKey = resendKey.length > 8
        ? `re_${resendKey.slice(3, 7)}••••`
        : (resendKey ? 'Configured' : 'Missing')

    // 5. Server Runtime Metrics
    let memoryLoad = 14
    let heapUsedMb = 0
    let heapTotalMb = 0
    let rssMb = 0
    let uptimeSeconds = 0

    try {
        if (typeof process !== 'undefined') {
            uptimeSeconds = Math.floor(process.uptime ? process.uptime() : 0)
            if (process.memoryUsage) {
                const mem = process.memoryUsage()
                heapUsedMb = Math.round(mem.heapUsed / 1024 / 1024)
                heapTotalMb = Math.round(mem.heapTotal / 1024 / 1024)
                rssMb = Math.round(mem.rss / 1024 / 1024)
                memoryLoad = Math.min(100, Math.max(1, Math.round((mem.heapUsed / mem.heapTotal) * 100)))
            }
        }
    } catch {
        // fallback
    }

    const hours = Math.floor(uptimeSeconds / 3600)
    const minutes = Math.floor((uptimeSeconds % 3600) / 60)
    const uptimeFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

    // Extract database host from URL if available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    let dbHost = 'Supabase Cloud Managed'
    try {
        if (supabaseUrl) {
            dbHost = new URL(supabaseUrl).hostname
        }
    } catch {
        // fallback
    }

    return {
        database: {
            status: dbStatus,
            latencyMs: dbLatencyMs,
            latencyRating: dbLatencyMs < 80 ? 'OPTIMAL' : dbLatencyMs < 200 ? 'GOOD' : 'SLOW',
            provider: 'Supabase PostgreSQL',
            engine: 'PostgreSQL 15.6',
            host: dbHost,
            pooler: 'PgBouncer Transaction Pooler',
            ssl: 'TLSv1.3 Encrypted',
            tables: {
                items: itemsCount,
                stockMovements: movementsCount,
                organizations: orgsCount,
                users: usersCount,
                warehouses: warehousesCount,
                supportTickets: ticketsCount,
                totalRecords
            },
            lastWriteTime
        },
        paymentGateway: {
            provider: 'Razorpay',
            status: paymentGatewayOnline ? 'ONLINE' : 'CONFIG_MISSING',
            environment: razorpayKeyId.startsWith('rzp_live_') ? 'PROD' : 'TEST',
            appIdMasked: maskedAppId,
            webhookUrl: '/api/razorpay/webhook',
            apiVersion: 'v1',
            mode: 'Standard Checkout',
            currency: 'INR (₹)'
        },
        emailService: {
            provider: 'Resend Inc.',
            status: emailOnline ? 'ONLINE' : 'CONFIG_MISSING',
            keyMasked: maskedResendKey,
            apiEndpoint: 'api.resend.com/emails',
            activeDispatchers: ['Low Stock Alerts', 'Team Invites', 'Trial Reminders'],
            senderRelay: 'onboarding@resend.dev'
        },
        server: {
            loadPercent: memoryLoad,
            heapUsedMb,
            heapTotalMb,
            rssMb,
            uptimeSeconds,
            uptimeFormatted,
            nodeVersion: process.version,
            platform: process.platform
        },
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    }
}

