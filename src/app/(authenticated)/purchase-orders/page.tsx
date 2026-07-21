import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CreatePurchaseOrderDialog } from '@/components/purchase-orders/CreatePurchaseOrderDialog'
import { DeleteOrderButton } from '@/components/purchase-orders/DeleteOrderButton'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Eye, ShoppingCart } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PurchaseOrdersPage() {
    const supabase = await createClient()

    // Get current user's organization_id
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

    let ordersQuery = supabase
        .from('purchase_orders')
        .select('*, supplier:suppliers(name), profile:profiles!created_by(full_name)')
        .order('created_at', { ascending: false })

    const warehouseId = (await cookies()).get('warehouse_id')?.value

    if (!isSuperAdmin && organizationId) {
        ordersQuery = ordersQuery.eq('organization_id', organizationId)

        if (warehouseId) {
            ordersQuery = ordersQuery.eq('location_id', warehouseId)
        }
    }


    const { data: orders, error } = await ordersQuery

    if (error) {
        console.error('Error fetching orders:', JSON.stringify(error, null, 2))
    }

    const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        DRAFT: 'secondary',
        APPROVED: 'default',
        RECEIVED: 'outline',
        CANCELLED: 'destructive',
    }

    return (
        <div className="space-y-8 p-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white/90">Purchase Orders</h1>
                    <p className="text-sm text-slate-400">Manage procurement and supplier orders.</p>
                </div>
                <CreatePurchaseOrderDialog warehouseId={warehouseId} />
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white/90">All Orders</h3>
                </div>
                <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-900/30">
                    <Table>
                        <TableHeader className="bg-white/5 hover:bg-white/5">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-slate-400 font-medium">Order ID</TableHead>
                                <TableHead className="text-slate-400 font-medium">Supplier</TableHead>
                                <TableHead className="text-slate-400 font-medium">Status</TableHead>
                                <TableHead className="text-right text-slate-400 font-medium">Total Amount</TableHead>
                                <TableHead className="hidden md:table-cell text-slate-400 font-medium">Created By</TableHead>
                                <TableHead className="hidden md:table-cell text-slate-400 font-medium">Date</TableHead>
                                <TableHead className="w-[100px] text-right text-slate-400 font-medium">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.map((order) => (
                                <TableRow key={order.id} className="border-white/5 hover:bg-white/5 transition-all duration-200 group">
                                    <TableCell className="font-mono text-sm text-slate-300 group-hover:text-white transition-colors">
                                        {order.id.slice(0, 8)}...
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-200 group-hover:text-white transition-colors">
                                        {order.supplier?.name || 'Unknown'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusColors[order.status] || 'default'} className="border-0">
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-bold text-slate-200">
                                        ${order.total_amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-slate-400">{order.profile?.full_name || 'Unknown'}</TableCell>
                                    <TableCell className="hidden text-slate-500 md:table-cell font-light">
                                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 text-slate-400">
                                            <Link href={`/purchase-orders/${order.id}`}>
                                                <Button variant="ghost" size="icon" className="hover:bg-white/10 hover:text-white rounded-lg h-8 w-8">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <DeleteOrderButton orderId={order.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!orders || orders.length === 0) && (
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableCell colSpan={7} className="h-48 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-500">
                                            <ShoppingCart className="h-12 w-12 opacity-20 mb-2" />
                                            <p className="text-lg font-medium text-slate-400">No purchase orders found</p>
                                            <p className="text-sm text-slate-600">Create your first order to get started.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
