import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DeleteOrderButton } from '@/components/purchase-orders/DeleteOrderButton'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Eye, ShoppingCart } from 'lucide-react'
import { getWarehouseCookie } from '@/app/actions/warehouse-cookie'
import { getCurrentProfile } from '@/lib/auth'
import dynamicImport from 'next/dynamic'

const CreatePurchaseOrderDialog = dynamicImport(
    () => import('@/components/purchase-orders/CreatePurchaseOrderDialog').then((m) => m.CreatePurchaseOrderDialog)
)

export const dynamic = 'force-dynamic'

export default async function PurchaseOrdersPage() {
    const supabase = await createClient()

    // 1. Concurrently get profile and warehouse cookie
    const [profile, warehouseId] = await Promise.all([
        getCurrentProfile(),
        getWarehouseCookie()
    ])

    const organizationId = profile?.organization_id || null
    const isSuperAdmin = profile?.is_super_admin || false

    let ordersQuery = supabase
        .from('purchase_orders')
        .select('*, supplier:suppliers(name), profile:profiles!created_by(full_name)')
        .order('created_at', { ascending: false })

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
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90">Purchase Orders</h1>
                    <p className="text-xs sm:text-sm text-slate-400">Manage procurement and supplier orders.</p>
                </div>
                <div className="w-full sm:w-auto">
                    <CreatePurchaseOrderDialog warehouseId={warehouseId} />
                </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl p-4 sm:p-6">
                <div className="mb-4 sm:mb-6 flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-white/90">All Orders</h3>
                </div>
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-900/30">
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
