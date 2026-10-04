import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreateSupplierDialog } from '@/components/suppliers/CreateSupplierDialog'
import { EditSupplierDialog } from '@/components/suppliers/EditSupplierDialog'
import { DeleteSupplierDialog } from '@/components/suppliers/DeleteSupplierDialog'
import { Mail, Phone, User } from 'lucide-react'

import { getWarehouseCookie } from '@/app/actions/warehouse-cookie'
import { getCurrentProfile } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function SuppliersPage() {
    const supabase = await createClient()

    // 1. Get profile and warehouse cookie concurrently
    const [profile, warehouseId] = await Promise.all([
        getCurrentProfile(),
        getWarehouseCookie()
    ])

    const organizationId = profile?.organization_id || null
    const isSuperAdmin = profile?.is_super_admin || false

    let suppliersQuery = supabase.from('suppliers').select('*').order('name')
    if (!isSuperAdmin && organizationId) {
        suppliersQuery = suppliersQuery.eq('organization_id', organizationId)
    }

    // 2. Fetch suppliers and warehouse stock filter in parallel if warehouseId is set
    let suppliers: any[] = []

    if (warehouseId) {
        const [suppliersRes, stockItemsRes] = await Promise.all([
            suppliersQuery,
            supabase
                .from('item_stock')
                .select('item:items(supplier_id)')
                .eq('location_id', warehouseId)
        ])

        const allSuppliers = suppliersRes.data || []
        const stockItems = stockItemsRes.data || []

        const relevantSupplierIds = new Set(
            stockItems.map((s: any) => s.item?.supplier_id).filter(Boolean)
        )

        suppliers = allSuppliers.filter(s => relevantSupplierIds.has(s.id))
    } else {
        const { data: allSuppliers } = await suppliersQuery
        suppliers = allSuppliers || []
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90">Suppliers</h1>
                    <p className="text-xs sm:text-sm text-slate-400">Manage your supplier relationships.</p>
                </div>
                <div className="w-full sm:w-auto">
                    <CreateSupplierDialog />
                </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl p-4 sm:p-6">
                <div className="mb-4 sm:mb-6 flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-white/90">All Suppliers</h3>
                </div>
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-900/30">
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
