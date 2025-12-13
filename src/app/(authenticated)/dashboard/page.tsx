import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, AlertTriangle, ArrowRightLeft } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'

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

    // Build queries with tenant filter (unless Super Admin)
    let itemsQuery = supabase.from('items').select('*', { count: 'exact', head: true })
    let suppliersQuery = supabase.from('suppliers').select('*', { count: 'exact', head: true })
    let allItemsQuery = supabase.from('items').select('*')
    let movementsQuery = supabase.from('stock_movements').select('*, item:items(name)').order('created_at', { ascending: false }).limit(5)

    // Apply tenant filter if NOT super admin
    if (!isSuperAdmin && organizationId) {
        itemsQuery = itemsQuery.eq('organization_id', organizationId)
        suppliersQuery = suppliersQuery.eq('organization_id', organizationId)
        allItemsQuery = allItemsQuery.eq('organization_id', organizationId)
        movementsQuery = movementsQuery.eq('organization_id', organizationId)
    } else if (!isSuperAdmin && !organizationId) {
        // User has no organization - show nothing
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Your account is not associated with any organization. Please contact your administrator.</p>
            </div>
        )
    }

    const { count: itemsCount } = await itemsQuery
    const { count: suppliersCount } = await suppliersQuery
    const { data: allItems } = await allItemsQuery
    const { data: recentMovements } = await movementsQuery

    const lowStockCount = allItems?.filter(i => i.current_stock < i.min_stock).length || 0
    const lowStockList = allItems?.filter(i => i.current_stock < i.min_stock).slice(0, 5) || []

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{itemsCount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{suppliersCount || 0}</div>
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
                                {recentMovements?.map((movement) => (
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
                                {lowStockList.map((item) => (
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
