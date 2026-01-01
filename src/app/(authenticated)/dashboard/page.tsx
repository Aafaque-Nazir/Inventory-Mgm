import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, AlertTriangle, ArrowRightLeft } from 'lucide-react'
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

    if (!isSuperAdmin && organizationId) {
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
    } else if (!isSuperAdmin && !organizationId) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Your account is not associated with any organization.</p>
            </div>
        )
    } else {
        // Super Admin View (Simplified)
        const { count: iCount } = await supabase.from('items').select('*', { count: 'exact', head: true })
        itemsCount = iCount || 0
        const { count: sCount } = await supabase.from('suppliers').select('*', { count: 'exact', head: true })
        suppliersCount = sCount || 0
    }

    // --- AI Forecast Data Fetching ---
    const { getAiInsights } = await import('@/app/actions/ai')
    const insights = await getAiInsights()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            {/* AI Insights Section */}
            <AiInsightsCard insights={insights} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{itemsCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{suppliersCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recentMovements?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Movements in last 24h</p>
                    </CardContent>
                </Card>
            </div >

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Stock Movements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentMovements?.map((movement: any) => (
                                    <TableRow key={movement.id}>
                                        <TableCell>{movement.item?.name}</TableCell>
                                        <TableCell>
                                            <span className={movement.type === 'IN' ? 'text-green-500' : 'text-red-500'}>
                                                {movement.type}
                                            </span>
                                        </TableCell>
                                        <TableCell>{movement.quantity}</TableCell>
                                        <TableCell>{format(new Date(movement.created_at), 'MMM d, HH:mm')}</TableCell>
                                    </TableRow>
                                ))}
                                {(!recentMovements || recentMovements.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">No recent movements</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Low Stock Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Min</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lowStockList.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="text-destructive">{item.current_stock}</TableCell>
                                        <TableCell>{item.min_stock}</TableCell>
                                    </TableRow>
                                ))}
                                {lowStockList.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center">All items well stocked</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div >
    )
}
