import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, TrendingUp, Package, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
    const supabase = await createClient()

    // Stock summary
    const { data: items } = await supabase.from('items').select('*')
    const totalItems = items?.length || 0
    const lowStockItems = items?.filter(i => i.current_stock < i.min_stock) || []
    const totalStockValue = items?.reduce((sum, i) => sum + i.current_stock, 0) || 0

    // Stock movements summary
    const { data: movements } = await supabase
        .from('stock_movements')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const totalIn = movements?.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.quantity, 0) || 0
    const totalOut = movements?.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.quantity, 0) || 0

    // Purchase orders summary
    const { data: orders } = await supabase.from('purchase_orders').select('*')
    const draftOrders = orders?.filter(o => o.status === 'DRAFT').length || 0
    const approvedOrders = orders?.filter(o => o.status === 'APPROVED').length || 0

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalItems}</div>
                        <p className="text-xs text-muted-foreground">
                            Total stock units: {totalStockValue.toFixed(0)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{lowStockItems.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Items below minimum stock
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock IN (30d)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{totalIn.toFixed(0)}</div>
                        <p className="text-xs text-muted-foreground">
                            Units received
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock OUT (30d)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{totalOut.toFixed(0)}</div>
                        <p className="text-xs text-muted-foreground">
                            Units dispatched
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Low Stock Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">Current</TableHead>
                                    <TableHead className="text-right">Min</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lowStockItems.slice(0, 10).map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="text-right text-destructive font-mono">
                                            {item.current_stock}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{item.min_stock}</TableCell>
                                        <TableCell>
                                            <Badge variant="destructive">Low</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {lowStockItems.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            All items are well stocked
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Purchase Orders Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">DRAFT</Badge>
                                    <span className="text-sm text-muted-foreground">Pending orders</span>
                                </div>
                                <span className="text-2xl font-bold">{draftOrders}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge>APPROVED</Badge>
                                    <span className="text-sm text-muted-foreground">Awaiting delivery</span>
                                </div>
                                <span className="text-2xl font-bold">{approvedOrders}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">RECEIVED</Badge>
                                    <span className="text-sm text-muted-foreground">Completed</span>
                                </div>
                                <span className="text-2xl font-bold">
                                    {orders?.filter(o => o.status === 'RECEIVED').length || 0}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Stock Snapshot</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Current Stock</TableHead>
                                <TableHead className="text-right">Min Stock</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items?.slice(0, 20).map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                                    <TableCell>{item.category || '-'}</TableCell>
                                    <TableCell className="text-right font-mono">{item.current_stock}</TableCell>
                                    <TableCell className="text-right font-mono">{item.min_stock}</TableCell>
                                    <TableCell>
                                        {item.current_stock < item.min_stock ? (
                                            <Badge variant="destructive">Low</Badge>
                                        ) : (
                                            <Badge variant="secondary">OK</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
