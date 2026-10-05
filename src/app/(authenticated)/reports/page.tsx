import { createClient } from '@/lib/supabase/server'
import { LowStockTable } from '@/components/reports/LowStockTable'
import { TopItemsTable } from '@/components/reports/TopItemsTable'
import { SummaryCard } from '@/components/reports/SummaryCard'
import { format, subDays } from 'date-fns'
import { ProLock } from '@/components/common/ProLock'
import { getWarehouseCookie } from '@/app/actions/warehouse-cookie'
import { getCurrentProfile } from '@/lib/auth'
import { isProPlan, extractOrg } from '@/lib/subscription'
import dynamicImport from 'next/dynamic'

const StockDistributionChart = dynamicImport(
    () => import('@/components/reports/StockDistributionChart').then((m) => m.StockDistributionChart),
    {
        ssr: true,
        loading: () => <div className="h-[280px] rounded-2xl border border-white/5 bg-white/5 animate-pulse" />
    }
)

const MovementTrendChart = dynamicImport(
    () => import('@/components/reports/MovementTrendChart').then((m) => m.MovementTrendChart),
    {
        ssr: true,
        loading: () => <div className="h-[280px] rounded-2xl border border-white/5 bg-white/5 animate-pulse" />
    }
)

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
    const supabase = await createClient()

    // 1. Get Profile and Warehouse ID concurrently
    const [profile, warehouseId] = await Promise.all([
        getCurrentProfile(),
        getWarehouseCookie()
    ])

    const organizationId = profile?.organization_id || null
    const isSuperAdmin = profile?.is_super_admin || false
    const org = extractOrg(profile)
    const isPro = isProPlan(org, isSuperAdmin)

    if (!organizationId && !isSuperAdmin) {
        return <div className="p-8">No organization found for reports/analytics.</div>
    }

    let items: any[] = []
    let movements: any[] = []
    let invoices: any[] = []

    const startDate = subDays(new Date(), 30).toISOString()

    if (organizationId) {
        if (warehouseId) {
            const [stockRes, movementsRes, invoicesRes] = await Promise.all([
                supabase
                    .from('item_stock')
                    .select('item_id, quantity, item:items(*)')
                    .eq('location_id', warehouseId),
                supabase
                    .from('stock_movements')
                    .select('created_at, type, quantity, item_id, unit_price')
                    .eq('organization_id', organizationId)
                    .eq('location_id', warehouseId)
                    .gte('created_at', startDate)
                    .order('created_at', { ascending: true }),
                supabase
                    .from('invoices')
                    .select('created_at, total_amount, items')
                    .eq('organization_id', organizationId)
                    .gte('created_at', startDate)
            ])

            items = stockRes.data?.map((record: any) => ({
                ...record.item,
                current_stock: record.quantity
            })) || []
            movements = movementsRes.data || []
            invoices = invoicesRes.data || []
        } else {
            const [itemsRes, movementsRes, invoicesRes] = await Promise.all([
                supabase
                    .from('items')
                    .select('*')
                    .eq('organization_id', organizationId),
                supabase
                    .from('stock_movements')
                    .select('created_at, type, quantity, item_id, unit_price')
                    .gte('created_at', startDate)
                    .order('created_at', { ascending: true })
                    .eq('organization_id', organizationId),
                supabase
                    .from('invoices')
                    .select('created_at, total_amount, items')
                    .eq('organization_id', organizationId)
                    .gte('created_at', startDate)
            ])

            items = itemsRes.data || []
            movements = movementsRes.data || []
            invoices = invoicesRes.data || []
        }
    }

    // --- KPI Calculations (Context Aware) ---
    const totalItems = items.length
    const _totalStock = items.reduce((sum, i) => sum + Number(i.current_stock || 0), 0)
    const lowStockItems = items.filter(i => i.current_stock < i.min_stock)

    // --- Stock Distribution Data (by Category) ---
    const categoryMap = new Map<string, number>()
    items.forEach(item => {
        const cat = item.category || 'Uncategorized'
        const current = categoryMap.get(cat) || 0
        categoryMap.set(cat, current + Number(item.current_stock || 0))
    })
    const distributionData = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    // --- Movement Trends Data (Last 7 Days) ---
    const trendMap = new Map<string, { in: number, out: number }>()
    for (let i = 6; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'MMM dd')
        trendMap.set(d, { in: 0, out: 0 })
    }
    movements.forEach(m => {
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
    movements.forEach(m => {
        const map = m.type === 'IN' ? itemMovementIn : itemMovementOut
        const current = map.get(m.item_id) || 0
        map.set(m.item_id, current + Number(m.quantity))
    })

    const getTopItems = (map: Map<string, number>, _type: 'in' | 'out') => {
        return Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, total]) => {
                const item = items.find(i => i.id === id)
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
    // ----------------------------------------

    // Financial Metrics
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const totalValuation = items.reduce((sum, i) => sum + (Number(i.current_stock || 0) * Number(i.cost_price || 0)), 0)
    const totalPotentialRevenue = items.reduce((sum, i) => sum + (Number(i.current_stock || 0) * Number(i.selling_price || 0)), 0)
    const estimatedProfit = totalPotentialRevenue - totalValuation

    // 1. Total Sales (Realized from Invoices)
    const totalSalesRealized = invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0)

    // 2. Stock Purchases (Realized from IN movements)
    // Fallback: If unit_price is 0, try to use current item cost_price as best guess
    const totalStockPurchases = movements
        .filter(m => m.type === 'IN')
        .reduce((sum, m) => {
            let cost = Number(m.unit_price || 0)
            if (cost === 0) {
                const item = items.find(i => i.id === m.item_id)
                cost = Number(item?.cost_price || 0)
            }
            return sum + (Number(m.quantity) * cost)
        }, 0)

    // 3. Net Profit (Realized) = Sales - Cost of Goods Sold (COGS)
    // We calculate COGS only for the items SOLD in the invoices
    let totalCOGS = 0
    invoices.forEach(inv => {
        if (Array.isArray(inv.items)) {
            inv.items.forEach((lineItem: any) => {
                // Use snapshotted cost price at time of sale if available, falling back to current item cost
                const item = items.find(i => i.id === lineItem.item_id)
                const cost = lineItem.cost_price !== undefined ? Number(lineItem.cost_price) : Number(item?.cost_price || 0)
                totalCOGS += (Number(lineItem.quantity) * cost)
            })
        }
    })
    const netProfitRealized = totalSalesRealized - totalCOGS


    return (
        <div className="space-y-8 p-2">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white/90">Analytics & Reports</h1>
                <p className="text-sm text-slate-400">Insights into your inventory performance.</p>
            </div>

            {/* KPI Summary Cards - Always Visible */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard title="Total Items" value={totalItems} icon="package" />
                <SummaryCard title="Inventory Value" value={formatCurrency(totalValuation)} icon="trendingUp" />
                <ProLock isPro={isPro} title="Profit Est." className="h-full">
                    <SummaryCard title="Est. Profit" subtitle="(Unrealized)" value={formatCurrency(estimatedProfit)} icon="trendingUp" trend={estimatedProfit > 0 ? 'up' : 'neutral'} />
                </ProLock>
                <SummaryCard title="Low Stock Alerts" value={lowStockItems.length} icon="alertTriangle" trend={lowStockItems.length > 0 ? 'down' : 'neutral'} />
            </div>

            {/* Financial Performance Section - PRO ONLY */}
            <ProLock isPro={isPro} title="Financial Analytics" description="Unlock detailed revenue and profit analysis.">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight">Financial Performance (Last 30 Days)</h2>
                        <span className="text-xs text-muted-foreground bg-white/5 border border-white/10 px-2 py-1 rounded w-fit">Realized</span>
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                        <SummaryCard
                            title="Total Sales (Revenue)"
                            value={formatCurrency(totalSalesRealized)}
                            icon="trendingUp"
                        />
                        <SummaryCard
                            title="Stock Purchases (Cost)"
                            value={formatCurrency(totalStockPurchases)}
                            icon="package"
                        />
                        <SummaryCard
                            title="Net Profit"
                            value={formatCurrency(netProfitRealized)}
                            icon="trendingUp"
                            trend={netProfitRealized >= 0 ? 'up' : 'down'}
                        />
                    </div>
                </div>
            </ProLock>

            {/* Charts Row - FREE */}
            <div className="grid gap-4 lg:grid-cols-3">
                <StockDistributionChart data={distributionData} />
                <MovementTrendChart data={trendData} />
            </div>

            {/* Tables Row */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Free: Low Stock */}
                <LowStockTable items={lowStockData} />

                {/* Free: Top Items */}
                <div className="lg:col-span-2 grid gap-4 grid-cols-1 md:grid-cols-2">
                    <TopItemsTable title="Top 5 Stock In (7 Days)" items={topInItems} type="in" />
                    <TopItemsTable title="Top 5 Stock Out (7 Days)" items={topOutItems} type="out" />
                </div>
            </div>
        </div>
    )
}
