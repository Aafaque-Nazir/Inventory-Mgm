import { createClient } from '@/lib/supabase/server'
import { RecordSaleDialog } from '@/components/sales/RecordSaleDialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { CreditCard, Banknote, ShoppingBag } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SalesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Please login</div>

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()

    let invoices = []
    if (profile?.organization_id) {
        const { data } = await supabase
            .from('invoices')
            .select('*')
            .eq('organization_id', profile.organization_id)
            .order('created_at', { ascending: false })
            .limit(50)
        invoices = data || []
    }

    return (
        <div className="space-y-8 p-2">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                     <h1 className="text-3xl font-bold tracking-tight text-white">Sales & Invoices</h1>
                     <p className="text-sm text-slate-400 mt-1">Record sales, track revenue, and manage customer invoices.</p>
                </div>
                <div>
                    <RecordSaleDialog />
                </div>
            </div>

            <Card className="rounded-2xl border-white/5 bg-white/5 backdrop-blur-sm shadow-xl">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-blue-400" />
                        <CardTitle className="text-white">Recent Transactions</CardTitle>
                    </div>
                     <CardDescription className="text-slate-400">Latest 50 invoices from all channels</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-hidden rounded-xl border border-white/5 mx-auto">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-slate-400 font-medium pl-6">Invoice #</TableHead>
                                    <TableHead className="text-slate-400 font-medium">Date</TableHead>
                                    <TableHead className="text-slate-400 font-medium">Customer</TableHead>
                                    <TableHead className="text-slate-400 font-medium">Method</TableHead>
                                    <TableHead className="text-right text-slate-400 font-medium pr-6">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.length === 0 && (
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                            No sales recorded yet. Start by creating an invoice.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {invoices.map((inv: unknown) => (
                                    <TableRow key={inv.id} className="border-white/5 hover:bg-blue-500/5 transition-colors group">
                                        <TableCell className="font-mono text-sm pl-6">
                                            <span className="text-blue-400 group-hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/10 transition-colors">
                                                #{inv.id.slice(0, 8)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-sm">
                                            {format(new Date(inv.created_at), 'MMM d, h:mm a')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-200 group-hover:text-white transition-colors">{inv.customer_name || 'Guest Customer'}</div>
                                            <div className="text-xs text-slate-500">{inv.customer_phone || '-'}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                {inv.payment_method === 'CASH' ? (
                                                    <Banknote className="h-4 w-4 text-emerald-400" />
                                                ) : (
                                                    <CreditCard className="h-4 w-4 text-purple-400" />
                                                )}
                                                <span className="capitalize">{inv.payment_method?.toLowerCase().replace('_', ' ')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-white pr-6 text-base">
                                            ₹{inv.total_amount.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
