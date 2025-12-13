import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreateSupplierDialog } from '@/components/suppliers/CreateSupplierDialog'
import { EditSupplierDialog } from '@/components/suppliers/EditSupplierDialog'
import { DeleteSupplierDialog } from '@/components/suppliers/DeleteSupplierDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

    const { data: suppliers } = await suppliersQuery

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
                <CreateSupplierDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Suppliers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact Person</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suppliers?.map((supplier) => (
                                    <TableRow key={supplier.id}>
                                        <TableCell className="font-medium">{supplier.name}</TableCell>
                                        <TableCell>
                                            {supplier.contact_person ? (
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    {supplier.contact_person}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {supplier.phone ? (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    {supplier.phone}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {supplier.email ? (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    {supplier.email}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {supplier.address || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <EditSupplierDialog supplier={supplier} />
                                                <DeleteSupplierDialog supplierId={supplier.id} supplierName={supplier.name} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!suppliers || suppliers.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No suppliers yet
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
