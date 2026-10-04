
import { createClient } from '@/lib/supabase/server'
import { Package, AlertTriangle, ArrowRightLeft, DollarSign } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { AiInsightsCard } from '@/components/dashboard/AiInsightsCard'
import { RecentActivityList } from '@/components/dashboard/RecentActivityList'
import { getDashboardMetrics, getRevenueChartData } from '@/app/actions/dashboard'
import { getAiInsights } from '@/app/actions/ai'
import { getWarehouseCookie } from '@/app/actions/warehouse-cookie'
import { getCurrentProfile } from '@/lib/auth'
import dynamicImport from 'next/dynamic'

const RevenueChart = dynamicImport(
    () => import('@/components/dashboard/RevenueChart').then((mod) => mod.RevenueChart),
    {
        ssr: true,
        loading: () => (
            <div className="col-span-1 lg:col-span-7 xl:col-span-8 h-[280px] rounded-xl sm:rounded-2xl border border-white/10 bg-[#111613] p-4 animate-pulse flex items-center justify-center text-xs text-slate-500">
                Loading revenue trends...
            </div>
        ),
    }
)

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()

    // 1. Get user profile and warehouse cookie in parallel
    const [profile, warehouseId] = await Promise.all([
        getCurrentProfile(),
        getWarehouseCookie()
    ])

    const organizationId = profile?.organization_id || null

    // 2. Fetch all dashboard data concurrently in parallel
    let movementsQuery = organizationId
        ? supabase
            .from('stock_movements')
            .select('*, item:items(name)')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(6)
        : null

    if (movementsQuery && warehouseId) {
        movementsQuery = movementsQuery.eq('location_id', warehouseId)
    }

    const [metrics, chartData, movementsResult, insights] = await Promise.all([
        getDashboardMetrics(organizationId, warehouseId),
        getRevenueChartData('7d', organizationId),
        movementsQuery ? movementsQuery : Promise.resolve({ data: [] }),
        getAiInsights(organizationId),
    ])

    const recentMovements = movementsResult.data || []

    return (
        <div className="space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Dashboard</h1>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Overview of your inventory and sales performance</p>
                </div>
            </div>

            {/* AI Insights Section */}
            <AiInsightsCard insights={insights} />

            {/* Stats Grid */}
            <div className="grid gap-2.5 sm:gap-3.5 grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Items"
                    value={metrics?.itemsCount || 0}
                    icon={<Package className="h-4 w-4 sm:h-5 sm:w-5" />}
                    color="emerald"
                    delay={0.1}
                />
                <StatCard
                    title="Stock Value"
                    value={`₹${(metrics?.totalStockValue || 0).toLocaleString()}`}
                    icon={<DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />}
                    color="emerald"
                    delay={0.2}
                />
                <StatCard
                    title="Low Stock"
                    value={metrics?.lowStockCount || 0}
                    icon={<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />}
                    color="orange"
                    delay={0.3}
                    trend={metrics?.lowStockCount ? { value: metrics.lowStockCount, label: 'Items', positive: false } : undefined}
                />
                <StatCard
                    title="Recent Activity"
                    value={recentMovements?.length || 0}
                    icon={<ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5" />}
                    color="green"
                    delay={0.4}
                    description="Movements in last 24h"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-2.5 sm:gap-3.5 grid-cols-1 lg:grid-cols-12">
                {/* Revenue Chart */}
                <RevenueChart data={chartData} />
                
                {/* Recent Activity List */}
                <RecentActivityList activities={recentMovements} />
            </div>
        </div>
    )
}
