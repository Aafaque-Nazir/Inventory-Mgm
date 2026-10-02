
import { createClient } from '@/lib/supabase/server'
import { Package, AlertTriangle, ArrowRightLeft, DollarSign } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { AiInsightsCard } from '@/components/dashboard/AiInsightsCard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { RecentActivityList } from '@/components/dashboard/RecentActivityList'
import { getDashboardMetrics, getRevenueChartData } from '@/app/actions/dashboard'
import { getWarehouseCookie } from '@/app/actions/warehouse-cookie'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Get current user's organization_id from their profile
    const { data: { user } } = await supabase.auth.getUser()

    let organizationId: string | null = null

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

        organizationId = profile?.organization_id || null
    }

    // --- FETCH DATA ---
    const warehouseId = await getWarehouseCookie()

    // 1. Metrics from optimized Action
    const metrics = await getDashboardMetrics()
    
    // 2. Chart Data
    const chartData = await getRevenueChartData('7d')

    // 3. Recent Activity (Movements)
    let recentMovements: any[] = []
    
    if (organizationId) {
        let query = supabase
            .from('stock_movements')
            .select('*, item:items(name)')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(6)
        
        if (warehouseId) {
            query = query.eq('location_id', warehouseId)
        }

        const { data } = await query
        recentMovements = data || []
    }

     // --- AI Forecast Data Fetching ---
    const { getAiInsights } = await import('@/app/actions/ai')
    const insights = await getAiInsights()

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
