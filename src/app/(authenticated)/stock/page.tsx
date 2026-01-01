import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AddStockMovementDialog } from '@/components/stock/AddStockMovementDialog'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StockScanner } from '@/components/stock/StockScanner'

export const dynamic = 'force-dynamic'

export default async function StockPage() {
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
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Stock Movements</h1>
                <div className="flex gap-2">
                    <StockScanner />
                    <AddStockMovementDialog
                        defaultType="OUT"
                        defaultReason="Sale"
                        title="Record Sale"
                        trigger={
                            <Button variant="destructive">
                                <TrendingDown className="mr-2 h-4 w-4" /> Record Sale
                            </Button>
                        }
                    />
                    <AddStockMovementDialog
                        defaultType="IN"
                        title="Add Stock"
                        trigger={
                            <Button>
                                <TrendingUp className="mr-2 h-4 w-4" /> Add Stock
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
