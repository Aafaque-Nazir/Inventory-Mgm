import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { CreditCard, Banknote, ShoppingBag, RotateCcw, TrendingUp, IndianRupee } from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth'
import dynamicImport from 'next/dynamic'
import { ViewInvoiceDialog } from '@/components/sales/ViewInvoiceDialog'
import { RecordReturnDialog } from '@/components/sales/RecordReturnDialog'

const RecordSaleDialog = dynamicImport(
    () => import('@/components/sales/RecordSaleDialog').then((m) => m.RecordSaleDialog)
)

export const dynamic = 'force-dynamic'

export default async function SalesPage() {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile) return <div>Please login</div>

    let invoices: any[] = []
    let returns: any[] = []

    if (profile?.organization_id) {
        // Fetch Invoices
        const { data: invData } = await supabase
            .from('invoices')
            .select('*, organization:organizations(name, gstin, address, phone)')
            .eq('organization_id', profile.organization_id)
            .order('created_at', { ascending: false })
            .limit(50)
        invoices = invData || []

        // Fetch Returns
        const { data: retData } = await supabase
            .from('sales_returns')
            .select('*')
            .eq('organization_id', profile.organization_id)
            .order('created_at', { ascending: false })
            .limit(50)
        returns = retData || []
    }

    const totalSales = invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0)
    const totalRefunds = returns.reduce((sum, ret) => sum + Number(ret.total_refund_amount || 0), 0)
    const netSales = Math.max(0, totalSales - totalRefunds)

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                     <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Sales & Invoicing</h1>
                     <p className="text-xs sm:text-sm text-slate-400 mt-1">POS checkout, GST tax invoices, customer returns, and credit notes.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <RecordReturnDialog />
                    <RecordSaleDialog />
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="rounded-2xl border-white/10 bg-[#111613] p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Sales</span>
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl font-black text-white">₹{totalSales.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{invoices.length} invoices recorded</p>
                    </div>
                </Card>

                <Card className="rounded-2xl border-white/10 bg-[#111613] p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Returns & Refunds</span>
                        <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                            <RotateCcw className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl font-black text-rose-400">₹{totalRefunds.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{returns.length} returns processed</p>
                    </div>
                </Card>

                <Card className="rounded-2xl border-white/10 bg-[#111613] p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Realized</span>
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <IndianRupee className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl font-black text-emerald-300">₹{netSales.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">After deductions & refunds</p>
                    </div>
                </Card>
            </div>

            {/* Invoices List */}
            <Card className="rounded-2xl border-white/10 bg-[#111613] backdrop-blur-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-emerald-400" />
                            <CardTitle className="text-base sm:text-lg text-white">Recent Invoices & Receipts</CardTitle>
                        </div>
                        <span className="text-xs text-slate-500">Showing last 50 transactions</span>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                        <Table>
                            <TableHeader className="bg-white/[0.02]">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-slate-400 font-medium pl-6">Invoice #</TableHead>
                                    <TableHead className="text-slate-400 font-medium">Date</TableHead>
                                    <TableHead className="text-slate-400 font-medium">Customer</TableHead>
                                    <TableHead className="text-slate-400 font-medium">Payment</TableHead>
                                    <TableHead className="text-slate-400 font-medium">Status</TableHead>
                                    <TableHead className="text-right text-slate-400 font-medium">Total (₹)</TableHead>
                                    <TableHead className="text-center text-slate-400 font-medium pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.length === 0 && (
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                                            No sales recorded yet. Click &quot;POS / New Sale&quot; to create your first invoice.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {invoices.map((inv: any) => (
                                    <TableRow key={inv.id} className="border-white/5 hover:bg-emerald-500/5 transition-colors group">
                                        <TableCell className="font-mono text-sm pl-6">
                                            <span className="text-emerald-400 group-hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 transition-colors">
                                                #{inv.id.slice(0, 8)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-sm">
                                            {format(new Date(inv.created_at), 'MMM d, h:mm a')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-200 group-hover:text-white transition-colors">{inv.customer_name || 'Walk-in Customer'}</div>
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
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                                inv.status === 'RETURNED'
                                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            }`}>
                                                {inv.status || 'PAID'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-white text-base">
                                            ₹{Number(inv.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-center pr-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <ViewInvoiceDialog invoice={inv} />
                                                <RecordReturnDialog
                                                    invoiceId={inv.id}
                                                    customerName={inv.customer_name || ''}
                                                    customerPhone={inv.customer_phone || ''}
                                                    initialItems={Array.isArray(inv.items) ? inv.items : []}
                                                    trigger={
                                                        <button title="Process Return" className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                                            <RotateCcw className="h-4 w-4" />
                                                        </button>
                                                    }
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Returns & Credit Notes Table */}
            {returns.length > 0 && (
                <Card className="rounded-2xl border-white/10 bg-[#111613] backdrop-blur-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                    <CardHeader className="p-4 sm:p-6">
                        <div className="flex items-center gap-2">
                            <RotateCcw className="h-5 w-5 text-rose-400" />
                            <CardTitle className="text-base sm:text-lg text-white">Sales Returns & Credit Notes</CardTitle>
                        </div>
                        <CardDescription className="text-xs sm:text-sm text-slate-400">Processed returns with stock reversals</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        <div className="overflow-x-auto rounded-xl border border-white/10">
                            <Table>
                                <TableHeader className="bg-white/[0.02]">
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="text-slate-400 font-medium pl-6">Return #</TableHead>
                                        <TableHead className="text-slate-400 font-medium">Date</TableHead>
                                        <TableHead className="text-slate-400 font-medium">Customer</TableHead>
                                        <TableHead className="text-slate-400 font-medium">Reason</TableHead>
                                        <TableHead className="text-slate-400 font-medium">Refund Mode</TableHead>
                                        <TableHead className="text-right text-slate-400 font-medium pr-6">Refund Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {returns.map((ret: any) => (
                                        <TableRow key={ret.id} className="border-white/5 hover:bg-rose-500/5 transition-colors">
                                            <TableCell className="font-mono text-sm pl-6 text-rose-400">
                                                #{ret.id.slice(0, 8)}
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-sm">
                                                {format(new Date(ret.created_at), 'MMM d, h:mm a')}
                                            </TableCell>
                                            <TableCell className="text-slate-200">
                                                {ret.customer_name || 'Walk-in Customer'}
                                            </TableCell>
                                            <TableCell className="text-slate-300 text-sm">
                                                {ret.reason || 'Customer Return'}
                                            </TableCell>
                                            <TableCell>
                                                <span className="capitalize text-slate-400 text-xs px-2 py-1 bg-white/5 rounded">
                                                    {ret.refund_method?.toLowerCase().replace('_', ' ')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-rose-400 pr-6 text-base">
                                                ₹{Number(ret.total_refund_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
