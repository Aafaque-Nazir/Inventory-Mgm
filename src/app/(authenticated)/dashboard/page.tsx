import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, AlertTriangle, ArrowRightLeft } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { count: itemsCount } = await supabase.from('items').select('*', { count: 'exact', head: true })
    const { count: suppliersCount } = await supabase.from('suppliers').select('*', { count: 'exact', head: true })

    const { data: allItems } = await supabase.from('items').select('*')
    const lowStockCount = allItems?.filter(i => i.current_stock < i.min_stock).length || 0
    const lowStockList = allItems?.filter(i => i.current_stock < i.min_stock).slice(0, 5) || []

    const { data: recentMovements } = await supabase
        .from('stock_movements')
        .select('*, item:items(name)')
        .order('created_at', { ascending: false })
        .limit(5)

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
            </div>

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
        </div>
    )
}
