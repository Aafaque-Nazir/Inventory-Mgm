import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { ArrowDown, ArrowUp, Package, History } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch item details
    const { data: item } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single()

    if (!item) notFound()

    // Fetch stock movements
    const { data: movements } = await supabase
        .from('stock_movements')
        .select('*, profile:profiles(full_name)')
        .eq('item_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
                    <p className="text-muted-foreground">SKU: {item.sku}</p>
                </div>
                <Badge variant={item.current_stock < item.min_stock ? 'destructive' : 'secondary'} className="text-lg px-4 py-1">
                    {item.current_stock} {item.unit}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Item Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Category</span>
                            <span className="font-medium">{item.category || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Current Stock</span>
                            <span className="font-mono font-bold">{item.current_stock} {item.unit}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Minimum Stock</span>
                            <span className="font-mono">{item.min_stock} {item.unit}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Description</span>
                            <span className="max-w-[200px] text-right truncate">{item.description || '-'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            Last updated: {movements?.[0] ? format(new Date(movements[0].created_at), 'MMM d, yyyy HH:mm') : 'Never'}
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between items-center">
                                <span>Total Movements</span>
                                <span className="font-bold">{movements?.length || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Stock History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {movements?.map((movement) => (
                                    <TableRow key={movement.id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(movement.created_at), 'MMM d, yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={movement.type === 'IN' ? 'default' : 'destructive'} className="gap-1">
                                                {movement.type === 'IN' ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                                                {movement.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {movement.quantity}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {movement.reason || '-'}
                                        </TableCell>
                                        <TableCell>{movement.profile?.full_name || 'Unknown'}</TableCell>
                                    </TableRow>
                                ))}
                                {(!movements || movements.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                            No history available
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
