import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreateSupplierDialog } from '@/components/suppliers/CreateSupplierDialog'
import { EditSupplierDialog } from '@/components/suppliers/EditSupplierDialog'
import { DeleteSupplierDialog } from '@/components/suppliers/DeleteSupplierDialog'
import { Mail, Phone, User } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SuppliersPage() {
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

    let suppliersQuery = supabase.from('suppliers').select('*').order('name')

    if (!isSuperAdmin && organizationId) {
        suppliersQuery = suppliersQuery.eq('organization_id', organizationId)
    }

    const { data: allSuppliers } = await suppliersQuery

    // --- WAREHOUSE FILTERING START ---
    const { getWarehouseCookie } = await import('@/app/actions/warehouse-cookie')
    const warehouseId = await getWarehouseCookie()

    let suppliers = allSuppliers || []

    if (warehouseId && suppliers.length > 0) {
        // 1. Get all items that have STOCK in this warehouse
        const { data: stockItems } = await supabase
            .from('item_stock')
            .select('item:items(supplier_id)')
            .eq('location_id', warehouseId)

        // 2. Extract unique Supplier IDs from those items
        // Note: item_stock -> item -> supplier_id
        const relevantSupplierIds = new Set(
            stockItems?.map((s: any) => s.item?.supplier_id).filter(Boolean)
        )

        // 3. Filter the main suppliers list
        suppliers = suppliers.filter(s => relevantSupplierIds.has(s.id))
    }
    // --- WAREHOUSE FILTERING END ---

    return (
        <div className="space-y-8 p-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white/90">Suppliers</h1>
                    <p className="text-sm text-slate-400">Manage your supplier relationships.</p>
                </div>
                <CreateSupplierDialog />
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white/90">All Suppliers</h3>
                </div>
                <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-900/30">
                    <Table>
                        <TableHeader className="bg-white/5 hover:bg-white/5">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-slate-400 font-medium">Name</TableHead>
                                <TableHead className="hidden md:table-cell text-slate-400 font-medium">Contact Person</TableHead>
                                <TableHead className="text-slate-400 font-medium">Phone</TableHead>
                                <TableHead className="hidden md:table-cell text-slate-400 font-medium">Email</TableHead>
                                <TableHead className="hidden md:table-cell text-slate-400 font-medium">Address</TableHead>
                                <TableHead className="w-[100px] text-right text-slate-400 font-medium">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {suppliers?.map((supplier) => (
                                <TableRow key={supplier.id} className="border-white/5 hover:bg-white/5 transition-all duration-200 group">
                                    <TableCell className="font-medium text-slate-200 group-hover:text-white transition-colors">
                                        {supplier.name}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-slate-400 group-hover:text-slate-300">
                                        {supplier.contact_person ? (
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-slate-500 group-hover:text-slate-400" />
                                                {supplier.contact_person}
                                            </div>
                                        ) : (
                                            <span className="text-slate-600">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-slate-400 group-hover:text-slate-300">
                                        {supplier.phone ? (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-slate-500 group-hover:text-slate-400" />
                                                {supplier.phone}
                                            </div>
                                        ) : (
                                            <span className="text-slate-600">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-slate-400 group-hover:text-slate-300">
                                        {supplier.email ? (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-slate-500 group-hover:text-slate-400" />
                                                {supplier.email}
                                            </div>
                                        ) : (
                                            <span className="text-slate-600">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden text-slate-500 md:table-cell font-light">
                                        {supplier.address || '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 text-slate-400">
                                            <EditSupplierDialog supplier={supplier} />
                                            <DeleteSupplierDialog supplierId={supplier.id} supplierName={supplier.name} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!suppliers || suppliers.length === 0) && (
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableCell colSpan={6} className="text-center text-slate-500 py-12">
                                        No suppliers yet
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
