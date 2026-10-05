import { format } from 'date-fns'

interface InvoiceTemplateProps {
    invoice: any
    organization?: {
        name?: string
        gstin?: string
        address?: string
        phone?: string
        email?: string
    }
}

export function InvoiceTemplate({ invoice, organization }: InvoiceTemplateProps) {
    if (!invoice) return null

    const orgName = organization?.name || invoice.organization?.name || 'InvMaster Business'
    const orgGstin = organization?.gstin || invoice.organization?.gstin || ''
    const orgAddress = organization?.address || invoice.organization?.address || ''
    const orgPhone = organization?.phone || invoice.organization?.phone || ''

    const items = Array.isArray(invoice.items) ? invoice.items : []
    const totalAmount = Number(invoice.total_amount || 0)

    // Calculate tax breakdown
    const itemsWithTax = items.map((item: any) => {
        const qty = Number(item.quantity || 1)
        const price = Number(item.unit_price || 0)
        const lineTotal = Number(item.total || (qty * price))
        const gstRate = Number(item.gst_rate || 0)

        let taxable = lineTotal
        let tax = 0
        if (gstRate > 0) {
            taxable = lineTotal / (1 + gstRate / 100)
            tax = lineTotal - taxable
        }

        return {
            ...item,
            taxable,
            tax,
            cgst: tax / 2,
            sgst: tax / 2
        }
    })

    const totalTaxable = itemsWithTax.reduce((sum: number, i: any) => sum + i.taxable, 0)
    const totalCgst = itemsWithTax.reduce((sum: number, i: any) => sum + i.cgst, 0)
    const totalSgst = itemsWithTax.reduce((sum: number, i: any) => sum + i.sgst, 0)

    const hasGst = items.some((i: any) => (i.gst_rate || 0) > 0)
    const hasBatches = items.some((i: any) => !!i.batch_number)

    return (
        <div className="p-6 bg-white text-slate-900 text-xs font-sans w-full max-w-[800px] mx-auto border shadow-sm print:p-0 print:border-0 print:shadow-none" id="printable-invoice">
            {/* Top Bar */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
                <div>
                    <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">{orgName}</h1>
                    {orgAddress && <p className="text-slate-600 max-w-xs">{orgAddress}</p>}
                    {orgPhone && <p className="text-slate-600">Phone: {orgPhone}</p>}
                    {orgGstin && <p className="font-bold text-slate-800">GSTIN: {orgGstin}</p>}
                </div>
                <div className="text-right">
                    <span className="inline-block bg-slate-900 text-white font-bold text-xs uppercase px-2.5 py-1 rounded">
                        {hasGst ? 'TAX INVOICE' : 'RETAIL INVOICE'}
                    </span>
                    <p className="font-mono text-sm font-bold text-slate-900 mt-2">
                        #{invoice.id ? invoice.id.slice(0, 8).toUpperCase() : 'PENDING'}
                    </p>
                    <p className="text-slate-600">
                        Date: {invoice.created_at ? format(new Date(invoice.created_at), 'dd MMM yyyy, hh:mm a') : format(new Date(), 'dd MMM yyyy')}
                    </p>
                    <p className="text-slate-600 font-medium">
                        Payment: <span className="font-bold text-slate-900 uppercase">{invoice.payment_method || 'CASH'}</span>
                    </p>
                </div>
            </div>

            {/* Bill To */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bill To</span>
                <p className="font-bold text-slate-900 text-sm">{invoice.customer_name || 'Walk-in / Cash Customer'}</p>
                {invoice.customer_phone && <p className="text-slate-600">Phone: {invoice.customer_phone}</p>}
            </div>

            {/* Items Table */}
            <table className="w-full mb-4 border-collapse">
                <thead>
                    <tr className="border-y border-slate-300 bg-slate-100 text-slate-700 font-bold">
                        <th className="text-left py-2 px-2">#</th>
                        <th className="text-left py-2 px-2">Item Description</th>
                        <th className="text-center py-2 px-2">HSN</th>
                        {hasBatches && <th className="text-center py-2 px-2">Batch / Exp</th>}
                        <th className="text-right py-2 px-2">Qty</th>
                        <th className="text-right py-2 px-2">Rate (₹)</th>
                        {hasGst && <th className="text-right py-2 px-2">Taxable (₹)</th>}
                        {hasGst && <th className="text-right py-2 px-2">GST %</th>}
                        <th className="text-right py-2 px-2">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {itemsWithTax.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                            <td className="py-2 px-2 text-slate-500">{i + 1}</td>
                            <td className="py-2 px-2 font-medium text-slate-900">
                                {item.name}
                            </td>
                            <td className="py-2 px-2 text-center text-slate-600 font-mono text-[11px]">
                                {item.hsn_code || '-'}
                            </td>
                            {hasBatches && (
                                <td className="py-2 px-2 text-center text-[10px] text-slate-600 font-mono">
                                    {item.batch_number ? `${item.batch_number}${item.expiry_date ? ` (${item.expiry_date})` : ''}` : '-'}
                                </td>
                            )}
                            <td className="py-2 px-2 text-right font-medium text-slate-800">{item.quantity}</td>
                            <td className="py-2 px-2 text-right text-slate-700">₹{Number(item.unit_price).toFixed(2)}</td>
                            {hasGst && (
                                <td className="py-2 px-2 text-right text-slate-700">₹{item.taxable.toFixed(2)}</td>
                            )}
                            {hasGst && (
                                <td className="py-2 px-2 text-right text-slate-700">{item.gst_rate || 0}%</td>
                            )}
                            <td className="py-2 px-2 text-right font-bold text-slate-900">₹{Number(item.total).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Tax Breakup & Grand Total */}
            <div className="flex justify-end mb-6">
                <div className="w-full sm:w-72 space-y-1.5 text-xs">
                    {hasGst && (
                        <>
                            <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                                <span>Taxable Amount</span>
                                <span>₹{totalTaxable.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                                <span>CGST</span>
                                <span>₹{totalCgst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                                <span>SGST</span>
                                <span>₹{totalSgst.toFixed(2)}</span>
                            </div>
                        </>
                    )}
                    <div className="flex justify-between py-2 border-t-2 border-slate-900 font-black text-base text-slate-900">
                        <span>Grand Total</span>
                        <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Footer / Terms */}
            <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-end gap-4 text-[10px] text-slate-500">
                <div>
                    <p className="font-semibold text-slate-700">Terms & Conditions:</p>
                    <p>1. Goods once sold can be returned within 7 days with original invoice.</p>
                    <p>2. This is a computer-generated tax invoice and requires no physical signature.</p>
                </div>
                <div className="text-right">
                    <div className="h-10 mb-1 border-b border-slate-300 w-36"></div>
                    <p className="font-medium text-slate-700">Authorized Signatory</p>
                </div>
            </div>
        </div>
    )
}
