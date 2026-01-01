import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AddStockMovementDialog } from '@/components/stock/AddStockMovementDialog'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StockScanner } from '@/components/stock/StockScanner'
import { ScanItemButton } from '@/components/items/ScanItemButton'

export const dynamic = 'force-dynamic'

export default async function StockPage() {
    const supabase = await createClient()

    // Get current user's organization_id
    const { data: { user } } = await supabase.auth.getUser()
    let organizationId: string | null = null
    let isSuperAdmin = false
    let isPro = false

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, is_super_admin, organizations(plan_type, subscription_end_date)')
            .eq('id', user.id)
            .single()
        organizationId = profile?.organization_id || null
        isSuperAdmin = profile?.is_super_admin || false

        // Check Pro Status
        // @ts-ignore
        if (profile?.organizations?.plan_type === 'PRO') {
            // @ts-ignore
            const endDate = profile.organizations.subscription_end_date
            if (endDate && new Date(endDate) > new Date()) {
                isPro = true
            }
        }
    }

    let movementsQuery = supabase
        .from('stock_movements')
        .select('*, item:items(name, sku), profile:profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(50)

    if (!isSuperAdmin && organizationId) {
        movementsQuery = movementsQuery.eq('organization_id', organizationId)
    }

    const { data: movements } = await movementsQuery
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Stock Movements</h1>
                <div className="flex flex-wrap gap-2">
                    <ScanItemButton isPro={isPro || isSuperAdmin} />
                    <StockScanner isPro={isPro || isSuperAdmin} />
                    <AddStockMovementDialog
                        defaultType="OUT"
                        defaultReason="Sale"
                        title="Record Sale"
                        trigger={
                            <Button variant="destructive" size="sm" className="sm:size-default">
                                <TrendingDown className="mr-1 sm:mr-2 h-4 w-4" />
                                <span className="hidden xs:inline">Record</span> Sale
                            </Button>
                        }
                    />
                    <AddStockMovementDialog
                        defaultType="IN"
                        title="Add Stock"
                        trigger={
                            <Button size="sm" className="sm:size-default">
                                <TrendingUp className="mr-1 sm:mr-2 h-4 w-4" />
                                <span className="hidden xs:inline">Add</span> Stock
                            </Button>
                        }
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Movements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="hidden md:table-cell">Reason</TableHead>
                                    <TableHead className="hidden md:table-cell">Created By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {movements?.map((movement) => (
                                    <TableRow key={movement.id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(movement.created_at), 'MMM d, yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{movement.item?.name}</div>
                                                <div className="text-sm text-muted-foreground">{movement.item?.sku}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={movement.type === 'IN' ? 'default' : 'destructive'} className="gap-1">
                                                {movement.type === 'IN' ? (
                                                    <ArrowDown className="h-3 w-3" />
                                                ) : (
                                                    <ArrowUp className="h-3 w-3" />
                                                )}
                                                {movement.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {movement.quantity}
                                        </TableCell>
                                        <TableCell className="hidden text-muted-foreground md:table-cell">
                                            {movement.reason || '-'}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{movement.profile?.full_name || 'Unknown'}</TableCell>
                                    </TableRow>
                                ))}
                                {(!movements || movements.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No stock movements yet
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div >
    )
}
