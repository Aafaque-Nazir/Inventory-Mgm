import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { ApproveOrderButton } from '@/components/purchase-orders/ApproveOrderButton'
import { ReceiveOrderButton } from '@/components/purchase-orders/ReceiveOrderButton'

export const dynamic = 'force-dynamic'

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: order, error } = await supabase
        .from('purchase_orders')
        .select('*, supplier:suppliers(*), profile:profiles!created_by(full_name)')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching order details:', JSON.stringify(error, null, 2))
    }

    if (!order) notFound()

    const { data: items } = await supabase
        .from('purchase_order_items')
        .select('*, item:items(name, sku, unit)')
        .eq('order_id', id)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id || '')
        .single()

    const isManager = profile?.role === 'MANAGER' || profile?.role === 'ADMIN'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchase Order</h1>
                    <p className="text-muted-foreground">Order ID: {order.id}</p>
                </div>
                <div className="flex gap-2">
                    {isManager && order.status === 'DRAFT' && (
                        <ApproveOrderButton orderId={order.id} />
                    )}
                    {isManager && order.status === 'APPROVED' && (
                        <ReceiveOrderButton orderId={order.id} items={items || []} />
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <Badge>{order.status}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Amount</span>
                            <span className="font-mono font-semibold">${order.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Created</span>
                            <span>{format(new Date(order.created_at), 'MMM d, yyyy HH:mm')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Created By</span>
                            <span>{order.profile?.full_name || 'Unknown'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Supplier Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Name</span>
                            <span className="font-medium">{order.supplier?.name}</span>
                        </div>
                        {order.supplier?.contact_person && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Contact</span>
                                <span>{order.supplier.contact_person}</span>
                            </div>
                        )}
                        {order.supplier?.phone && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone</span>
                                <span>{order.supplier.phone}</span>
                            </div>
                        )}
                        {order.supplier?.email && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email</span>
                                <span>{order.supplier.email}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.item?.name}</TableCell>
                                    <TableCell className="font-mono text-sm">{item.item?.sku}</TableCell>
                                    <TableCell className="text-right">
                                        {item.quantity} {item.item?.unit}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        ${item.price.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-semibold">
                                        ${item.line_total.toFixed(2)}
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
