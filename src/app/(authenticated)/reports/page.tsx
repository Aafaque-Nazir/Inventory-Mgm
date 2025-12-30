import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StockDistributionChart } from '@/components/reports/StockDistributionChart'
import { MovementTrendChart } from '@/components/reports/MovementTrendChart'
import { LowStockTable } from '@/components/reports/LowStockTable'
import { TopItemsTable } from '@/components/reports/TopItemsTable'
import { SummaryCard } from '@/components/reports/SummaryCard'
import { format, subDays } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
    const supabase = await createClient()

    // Get current user's organization_id
    const { data: { user } } = await supabase.auth.getUser()

    let organizationId: string | null = null
    let isSuperAdmin = false
    let planType = 'FREE'

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, is_super_admin, organizations(plan_type)')
            .eq('id', user.id)
            .single()
        organizationId = profile?.organization_id || null
        isSuperAdmin = profile?.is_super_admin || false
        // @ts-ignore
        if (profile?.organizations?.plan_type) {
            // @ts-ignore
            planType = profile.organizations.plan_type
        }
    }

    if (!organizationId && !isSuperAdmin) {
        return <div className="p-8">No organization found for reports/analytics.</div>
    }

    if (planType === 'FREE' && !isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="p-4 bg-muted rounded-full">
                    <BarChart3 className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Advanced Analytics is a Pro Feature</h2>
                <p className="text-muted-foreground max-w-md">
                    Upgrade your plan to unlock detailed reports, stock movement trends, and predictive analytics.
                </p>
                <Button asChild>
                    <Link href="/pricing">Upgrade to Pro</Link>
                </Button>
            </div>
        )
    }

    // --- Fetch All Items ---
    let itemsQuery = supabase.from('items').select('*')
    if (!isSuperAdmin) itemsQuery = itemsQuery.eq('organization_id', organizationId!)
    const { data: items } = await itemsQuery

    // --- Fetch All Suppliers ---
    let suppliersQuery = supabase.from('suppliers').select('*', { count: 'exact', head: true })
    if (!isSuperAdmin) suppliersQuery = suppliersQuery.eq('organization_id', organizationId!)
    const { count: suppliersCount } = await suppliersQuery

    // --- KPI Summary Data ---
    const totalItems = items?.length || 0
    const totalStock = items?.reduce((sum, i) => sum + Number(i.current_stock || 0), 0) || 0
    const lowStockItems = items?.filter(i => i.current_stock < i.min_stock) || []
    const outOfStockItems = items?.filter(i => i.current_stock === 0) || []

    // --- Stock Distribution Data (by Category) ---
    const categoryMap = new Map<string, number>()
    items?.forEach(item => {
        const cat = item.category || 'Uncategorized'
        const current = categoryMap.get(cat) || 0
        categoryMap.set(cat, current + Number(item.current_stock || 0))
    })
    const distributionData = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    // --- Movement Trends Data (Last 7 Days) ---
    const startDate = subDays(new Date(), 7).toISOString()
    let moveQuery = supabase
        .from('stock_movements')
        .select('created_at, type, quantity, item_id')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })
    if (!isSuperAdmin) moveQuery = moveQuery.eq('organization_id', organizationId!)
    const { data: movements } = await moveQuery

    const trendMap = new Map<string, { in: number, out: number }>()
    for (let i = 6; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'MMM dd')
        trendMap.set(d, { in: 0, out: 0 })
    }
    movements?.forEach(m => {
        const d = format(new Date(m.created_at), 'MMM dd')
        if (trendMap.has(d)) {
            const current = trendMap.get(d)!
            if (m.type === 'IN') current.in += Number(m.quantity)
            else current.out += Number(m.quantity)
        }
    })
    const trendData = Array.from(trendMap.entries()).map(([date, val]) => ({ date, ...val }))

    // --- Top 5 Items by Movement (Last 7 days) ---
    const itemMovementIn = new Map<string, number>()
    const itemMovementOut = new Map<string, number>()
    movements?.forEach(m => {
        const map = m.type === 'IN' ? itemMovementIn : itemMovementOut
        const current = map.get(m.item_id) || 0
        map.set(m.item_id, current + Number(m.quantity))
    })

    const getTopItems = (map: Map<string, number>, type: 'in' | 'out') => {
        return Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, total]) => {
                const item = items?.find(i => i.id === id)
                return { name: item?.name || 'Unknown', total, unit: item?.unit || '' }
            })
    }
    const topInItems = getTopItems(itemMovementIn, 'in')
    const topOutItems = getTopItems(itemMovementOut, 'out')

    // --- Low Stock Data ---
    const lowStockData = lowStockItems.slice(0, 10).map(i => ({
        name: i.name,
        current_stock: Number(i.current_stock),
        min_stock: Number(i.min_stock),
        unit: i.unit
    }))

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>

            {/* KPI Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <SummaryCard title="Total Items" value={totalItems} icon="package" />
                <SummaryCard title="Total Stock Units" value={totalStock} icon="trendingUp" />
                <SummaryCard title="Low Stock Alerts" value={lowStockItems.length} icon="alertTriangle" trend={lowStockItems.length > 0 ? 'down' : 'neutral'} />
                <SummaryCard title="Out of Stock" value={outOfStockItems.length} icon="trendingDown" trend={outOfStockItems.length > 0 ? 'down' : 'neutral'} />
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StockDistributionChart data={distributionData} />
                <MovementTrendChart data={trendData} />
            </div>

            {/* Tables Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <TopItemsTable title="Top 5 Stock In (7 Days)" items={topInItems} type="in" />
                <TopItemsTable title="Top 5 Stock Out (7 Days)" items={topOutItems} type="out" />
                <LowStockTable items={lowStockData} />
            </div>
        </div>
    )
}
