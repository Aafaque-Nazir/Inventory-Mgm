import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CreatePurchaseOrderDialog } from '@/components/purchase-orders/CreatePurchaseOrderDialog'
import { DeleteOrderButton } from '@/components/purchase-orders/DeleteOrderButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Eye, ShoppingCart } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PurchaseOrdersPage() {
    const supabase = await createClient()

    console.log('Fetching purchase orders...')
    const { data: orders, error } = await supabase
        .from('purchase_orders')
        .select('*, supplier:suppliers(name), profile:profiles!created_by(full_name)')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching orders:', JSON.stringify(error, null, 2))
    } else {
        console.log(`Fetched ${orders?.length || 0} orders`)
    }

    const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        DRAFT: 'secondary',
        APPROVED: 'default',
        RECEIVED: 'outline',
        CANCELLED: 'destructive',
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
                <CreatePurchaseOrderDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Total Amount</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders?.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-sm">
                                            {order.id.slice(0, 8)}...
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {order.supplier?.name || 'Unknown'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusColors[order.status] || 'default'}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            ${order.total_amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell>{order.profile?.full_name || 'Unknown'}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {format(new Date(order.created_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/purchase-orders/${order.id}`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <DeleteOrderButton orderId={order.id} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!orders || orders.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                                                <ShoppingCart className="h-8 w-8 opacity-50" />
                                                <p>No purchase orders found.</p>
                                                <p className="text-sm">Create your first order to get started.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
