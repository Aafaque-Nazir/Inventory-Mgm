import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { ArrowDown, ArrowUp, Package, History, Activity, Calendar } from 'lucide-react'

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
        <div className="space-y-8 p-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{item.name}</h1>
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-md text-xs font-mono">SKU: {item.sku}</span>
                        {item.category && <span className="text-slate-600">•</span>}
                        {item.category && <span className="text-blue-400">{item.category}</span>}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-slate-400">Current Stock</span>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-white tracking-tight">{item.current_stock}</span>
                            <span className="text-sm font-medium text-slate-500">{item.unit}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-2xl border-white/5 bg-white/5 backdrop-blur-sm shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Package className="h-5 w-5 text-blue-400" />
                            Item Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs text-slate-500 uppercase tracking-wider">Category</span>
                                <p className="font-medium text-slate-200">{item.category || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-slate-500 uppercase tracking-wider">Status</span>
                                <div>
                                    {item.current_stock < item.min_stock ? (
                                        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Low Stock</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">In Stock</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-slate-500 uppercase tracking-wider">Min Stock Level</span>
                                <p className="font-mono font-medium text-slate-200">{item.min_stock} {item.unit}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-slate-500 uppercase tracking-wider">Storage Location</span>
                                <p className="font-medium text-slate-200">Main Warehouse</p>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-white/5">
                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-2">Description</span>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {item.description || 'No description provided for this item.'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-white/5 bg-white/5 backdrop-blur-sm shadow-xl flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Activity className="h-5 w-5 text-blue-400" />
                            Quick Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center gap-6">
                         <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <History className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-300">Total Movements</span>
                                    <span className="text-xs text-slate-500">All time activity</span>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-white">{movements?.length || 0}</span>
                         </div>

                         <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-500/20 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-slate-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-300">Last Updated</span>
                                    <span className="text-xs text-slate-500">Most recent change</span>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-white text-right">
                                {movements?.[0] ? format(new Date(movements[0].created_at), 'MMM d, h:mm a') : 'Never'}
                            </span>
                         </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl border-white/5 bg-white/5 backdrop-blur-sm shadow-xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-white">Stock History</CardTitle>
                    <CardDescription className="text-slate-400">Recent incoming and outgoing stock movements.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-slate-400 pl-6">Date</TableHead>
                                <TableHead className="text-slate-400">Type</TableHead>
                                <TableHead className="text-right text-slate-400">Quantity</TableHead>
                                <TableHead className="text-slate-400">Reason</TableHead>
                                <TableHead className="text-slate-400">By</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {movements?.map((movement) => (
                                <TableRow key={movement.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell className="font-medium text-slate-300 pl-6">
                                        {format(new Date(movement.created_at), 'MMM d, yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                            movement.type === 'IN' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                            : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                        }`}>
                                            {movement.type === 'IN' ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                                            {movement.type}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-bold text-white">
                                        {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                                    </TableCell>
                                    <TableCell className="text-slate-400 text-sm">
                                        {movement.reason || '-'}
                                    </TableCell>
                                    <TableCell className="text-slate-400 text-sm">{movement.profile?.full_name || 'Unknown'}</TableCell>
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
                </CardContent>
            </Card>
        </div>
    )
}
