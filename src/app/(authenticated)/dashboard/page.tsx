import { createClient } from '@/lib/supabase/server'
import { Package, Users, AlertTriangle, ArrowRightLeft } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { AiInsightsCard } from '@/components/dashboard/AiInsightsCard'
import { getWarehouseCookie } from '@/app/actions/warehouse-cookie'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Get current user's organization_id from their profile
    const { data: { user } } = await supabase.auth.getUser()

    let organizationId: string | null = null
    let isSuperAdmin = false

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, is_super_admin')
            .eq('id', user.id)
            .single()

        organizationId = profile?.organization_id || null
        isSuperAdmin = profile?.is_super_admin || false
    }

    // Build specific queries
    // We will build these dyamically based on context to ensure total isolation

    // 1. Base counts (Tenant filtered)
    let itemsCount = 0
    let suppliersCount = 0
    let lowStockCount = 0
    let lowStockList: any[] = []
    let recentMovements: any[] = []

    if (organizationId) {
        // --- BASE QUERIES ---
        const warehouseId = await getWarehouseCookie() // From Cookie

        // Suppliers are global per organization (usually independent of warehouse)
        const { count: sCount } = await supabase
            .from('suppliers')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
        suppliersCount = sCount || 0

        // --- WAREHOUSE SPECIFIC LOGIC ---
        if (warehouseId) {
            // A. Recent Movements (Filtered by Location)
            const { data: movements } = await supabase
                .from('stock_movements')
                .select('*, item:items(name)')
                .eq('organization_id', organizationId)
                .eq('location_id', warehouseId)
                .order('created_at', { ascending: false })
                .limit(5)
            recentMovements = movements || []

            // B. Items & Low Stock (STRICT Isolation)
            // Fetch ONLY items that exist in 'item_stock' for this location
            const { data: locationStock } = await supabase
                .from('item_stock')
                .select('item_id, quantity, item:items(*)')
                .eq('location_id', warehouseId)

            // Map to a clean list of items with local stock
            const trackedItems = locationStock?.map((record: any) => ({
                ...record.item,        // Spread the item details (name, min_stock, etc.)
                current_stock: record.quantity // Override with LOCAL quantity
            })) || []

            // Now calculate metrics based on this LOCAL tracking list
            itemsCount = trackedItems.length

            // Filter Suppliers: Only count suppliers of items present in this warehouse
            const relevantSupplierIds = new Set(trackedItems.map((i: any) => i.supplier_id).filter(Boolean))
            suppliersCount = relevantSupplierIds.size


            const lowStockItems = trackedItems.filter((i: any) => i.current_stock < i.min_stock)
            lowStockCount = lowStockItems.length
            lowStockList = lowStockItems.slice(0, 5)

        } else {
            // --- GLOBAL FALLBACK (No Warehouse Selected) ---
            // Show global views (or aggregated)

            // Items Count
            const { count: iCount } = await supabase
                .from('items')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', organizationId)
            itemsCount = iCount || 0

            // Movements (All)
            const { data: movements } = await supabase
                .from('stock_movements')
                .select('*, item:items(name)')
                .eq('organization_id', organizationId)
                .order('created_at', { ascending: false })
                .limit(5)
            recentMovements = movements || []

            // Low Stock (Based on Global `current_stock` column - Legacy/Aggregate)
            const { data: allItems } = await supabase
                .from('items')
                .select('*')
                .eq('organization_id', organizationId)

            if (allItems) {
                const lowItems = allItems.filter(i => i.current_stock < i.min_stock)
                lowStockCount = lowItems.length
                lowStockList = lowItems.slice(0, 5)
            }
        }
    }      // --- AI Forecast Data Fetching ---
    const { getAiInsights } = await import('@/app/actions/ai')
    const insights = await getAiInsights()

    return (
        <div className="space-y-8 p-2">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white/90">Dashboard</h1>
                <div className="text-sm text-slate-400">Overview</div>
            </div>

            {/* AI Insights Section */}
            <AiInsightsCard insights={insights} />

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Items"
                    value={itemsCount}
                    icon={<Package className="h-6 w-6" />}
                    color="blue"
                    delay={0.1}
                />
                <StatCard
                    title="Total Suppliers"
                    value={suppliersCount}
                    icon={<Users className="h-6 w-6" />}
                    color="purple"
                    delay={0.2}
                />
                <StatCard
                    title="Low Stock Items"
                    value={lowStockCount}
                    icon={<AlertTriangle className="h-6 w-6" />}
                    color="orange"
                    delay={0.3}
                    trend={{ value: lowStockList.length, label: 'Items critical', positive: false }}
                />
                <StatCard
                    title="Recent Activity"
                    value={recentMovements?.length || 0}
                    icon={<ArrowRightLeft className="h-6 w-6" />}
                    color="green"
                    delay={0.4}
                    description="Movements in last 24h"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Movements */}
                <div className="col-span-4 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white/90">Recent Stock Movements</h3>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-900/30">
                        <Table>
                            <TableHeader className="bg-white/5 hover:bg-white/5">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-slate-400">Item</TableHead>
                                    <TableHead className="text-slate-400">Type</TableHead>
                                    <TableHead className="text-slate-400">Quantity</TableHead>
                                    <TableHead className="text-slate-400">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentMovements?.map((movement: any) => (
                                    <TableRow key={movement.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                        <TableCell className="font-medium text-slate-200">{movement.item?.name}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${movement.type === 'IN'
                                                ? 'bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-500/20'
                                                : 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20'
                                                }`}>
                                                {movement.type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-slate-300">{movement.quantity}</TableCell>
                                        <TableCell className="text-slate-400">{format(new Date(movement.created_at), 'MMM d, HH:mm')}</TableCell>
                                    </TableRow>
                                ))}
                                {(!recentMovements || recentMovements.length === 0) && (
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableCell colSpan={4} className="text-center text-slate-500 py-8">No recent movements</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="col-span-3 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white/90">Low Stock Alerts</h3>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-900/30">
                        <Table>
                            <TableHeader className="bg-white/5 hover:bg-white/5">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-slate-400">Item</TableHead>
                                    <TableHead className="text-slate-400">Stock</TableHead>
                                    <TableHead className="text-slate-400">Min</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lowStockList.map((item: any) => (
                                    <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                        <TableCell className="font-medium text-slate-200">{item.name}</TableCell>
                                        <TableCell className="text-red-400 font-bold">{item.current_stock}</TableCell>
                                        <TableCell className="text-slate-400">{item.min_stock}</TableCell>
                                    </TableRow>
                                ))}
                                {lowStockList.length === 0 && (
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableCell colSpan={3} className="text-center text-slate-500 py-8">All items well stocked</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div >
    )
}
