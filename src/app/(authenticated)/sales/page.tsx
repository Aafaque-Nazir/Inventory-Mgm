import { createClient } from '@/lib/supabase/server'
import { RecordSaleDialog } from '@/components/sales/RecordSaleDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'

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
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales & Invoices</h1>
                    <p className="text-muted-foreground">Record sales and view history.</p>
                </div>
                <div>
                    <RecordSaleDialog />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                        No sales recorded yet.
                                    </TableCell>
                                </TableRow>
                            )}
                            {invoices.map((inv) => (
                                <TableRow key={inv.id}>
                                    <TableCell className="font-mono">{inv.id.slice(0, 8)}</TableCell>
                                    <TableCell>{format(new Date(inv.created_at), 'MMM d, HH:mm')}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{inv.customer_name || 'Guest'}</div>
                                        <div className="text-xs text-muted-foreground">{inv.customer_phone}</div>
                                    </TableCell>
                                    <TableCell>{inv.payment_method}</TableCell>
                                    <TableCell className="text-right font-bold">₹{inv.total_amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
