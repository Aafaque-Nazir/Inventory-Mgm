import { format } from 'date-fns'

interface InvoiceTemplateProps {
    invoice: unknown // Using any loosely here to accept the partial object from Checkout, but ideally Invoice
}

export function InvoiceTemplate({ invoice }: InvoiceTemplateProps) {
    if (!invoice) return null

    return (
        <div className="p-4 bg-white text-black text-sm font-mono w-full" id="printable-invoice">
            {/* Header */}
            <div className="text-center border-b pb-2 mb-2">
                <h2 className="text-xl font-bold uppercase">Inventory Mgm</h2>
                <p className="text-xs">Date: {format(new Date(invoice.created_at), 'dd/MM/yyyy HH:mm')}</p>
                <p className="text-xs">Invoice #: {invoice.id.slice(0, 8)}</p>
            </div>

            {/* Customer */}
            {(invoice.customer_name || invoice.customer_phone) && (
                <div className="mb-2 pb-2 border-b">
                    <p className="font-bold">Customer:</p>
                    {invoice.customer_name && <p>{invoice.customer_name}</p>}
                    {invoice.customer_phone && <p>{invoice.customer_phone}</p>}
                </div>
            )}

            {/* Items */}
            <table className="w-full mb-2">
                <thead>
                    <tr className="border-b">
                        <th className="text-left">Item</th>
                        <th className="text-right">Qty</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item: unknown, i: number) => (
                        <tr key={i}>
                            <td className="pt-1">{item.name}</td>
                            <td className="text-right pt-1">{item.quantity}</td>
                            <td className="text-right pt-1">{item.unit_price}</td>
                            <td className="text-right pt-1">{item.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Total */}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{invoice.total_amount}</span>
            </div>

            <div className="text-center mt-4 text-xs">
                <p>Thank you for your business!</p>
            </div>
        </div>
    )
}
