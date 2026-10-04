import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { TrendingDown, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getWarehouseCookie } from '@/app/actions/warehouse-cookie'
import { getCurrentProfile } from '@/lib/auth'
import { isProPlan, extractOrg } from '@/lib/subscription'
import dynamicImport from 'next/dynamic'

const StockScanner = dynamicImport(() => import('@/components/stock/StockScanner').then(m => m.StockScanner))
const ScanItemButton = dynamicImport(() => import('@/components/items/ScanItemButton').then(m => m.ScanItemButton))
const RecordSaleDialog = dynamicImport(() => import('@/components/sales/RecordSaleDialog').then(m => m.RecordSaleDialog))
const AddStockMovementDialog = dynamicImport(() => import('@/components/stock/AddStockMovementDialog').then(m => m.AddStockMovementDialog))

export const dynamic = 'force-dynamic'

export default async function StockPage() {
    const supabase = await createClient()

    // 1. Get profile and warehouse cookie concurrently
    const [profile, warehouseId] = await Promise.all([
        getCurrentProfile(),
        getWarehouseCookie()
    ])

    const organizationId = profile?.organization_id || null
    const isSuperAdmin = profile?.is_super_admin || false
    const org = extractOrg(profile)
    const isPro = isProPlan(org, isSuperAdmin)

    let movementsQuery = supabase
        .from('stock_movements')
        .select('*, item:items(name, sku), profile:profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(50)

    if (!isSuperAdmin && organizationId) {
        movementsQuery = movementsQuery.eq('organization_id', organizationId)

        if (warehouseId) {
            movementsQuery = movementsQuery.eq('location_id', warehouseId)
        }
    }

    const { data: movements } = await movementsQuery
    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90">Stock Movements</h1>
                    <p className="text-xs sm:text-sm text-slate-400">Track inventory history and adjustments.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <ScanItemButton isPro={isPro || isSuperAdmin} />
                    <StockScanner isPro={isPro || isSuperAdmin} />
                    <RecordSaleDialog
                        trigger={
                            <Button size="sm" className="sm:size-default bg-pink-600 hover:bg-pink-700 text-white border-0 rounded-xl shadow-lg shadow-pink-500/25 transition-all duration-300">
                                <TrendingDown className="mr-1 sm:mr-2 h-4 w-4" />
                                <span className="hidden xs:inline">Record</span> Sale
                            </Button>
                        }
                    />
                    <AddStockMovementDialog
                        defaultType="IN"
                        title="Add Stock"
                        trigger={
                            <Button size="sm" className="sm:size-default bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-300">
                                <TrendingUp className="mr-1 sm:mr-2 h-4 w-4" />
                                <span className="hidden xs:inline">Add</span> Stock
                            </Button>
                        }
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl p-4 sm:p-6">
                <div className="mb-4 sm:mb-6 flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-white/90">Recent Movements</h3>
                </div>
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-900/30">
                    <Table>
                        <TableHeader className="bg-white/5 hover:bg-white/5">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-slate-400 font-medium">Date</TableHead>
                                <TableHead className="text-slate-400 font-medium">Item</TableHead>
                                <TableHead className="text-slate-400 font-medium">Type</TableHead>
                                <TableHead className="text-right text-slate-400 font-medium">Quantity</TableHead>
                                <TableHead className="hidden md:table-cell text-slate-400 font-medium">Reason</TableHead>
                                <TableHead className="hidden md:table-cell text-slate-400 font-medium">Created By</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {movements?.map((movement) => (
                                <TableRow key={movement.id} className="border-white/5 hover:bg-white/5 transition-all duration-200 group">
                                    <TableCell className="font-medium text-slate-300">
                                        {format(new Date(movement.created_at), 'MMM d, yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium text-slate-200 group-hover:text-white transition-colors">{movement.item?.name}</div>
                                            <div className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">{movement.item?.sku}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`gap-1 border-0 ${movement.type === 'IN'
                                            ? 'bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-500/20'
                                            : 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20'
                                            }`}>
                                            {movement.type === 'IN' ? (
                                                <ArrowDown className="h-3 w-3" />
                                            ) : (
                                                <ArrowUp className="h-3 w-3" />
                                            )}
                                            {movement.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-bold text-slate-200">
                                        {movement.quantity}
                                    </TableCell>
                                    <TableCell className="hidden text-slate-400 md:table-cell font-light">
                                        {movement.reason || '-'}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-slate-400">{movement.profile?.full_name || 'Unknown'}</TableCell>
                                </TableRow>
                            ))}
                            {(!movements || movements.length === 0) && (
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableCell colSpan={6} className="text-center text-slate-500 py-12">
                                        No stock movements yet
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div >
    )
}
