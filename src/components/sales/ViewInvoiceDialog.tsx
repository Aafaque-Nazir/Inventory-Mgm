'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, Eye, Share2 } from 'lucide-react'
import { InvoiceTemplate } from './InvoiceTemplate'

interface ViewInvoiceDialogProps {
    invoice: any
    trigger?: React.ReactNode
}

export function ViewInvoiceDialog({ invoice, trigger }: ViewInvoiceDialogProps) {
    const [open, setOpen] = useState(false)

    if (!invoice) return null

    const handleWhatsAppShare = () => {
        const orgName = invoice.organization?.name || 'InvMaster Business'
        const custName = invoice.customer_name || 'Customer'
        const total = Number(invoice.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })
        const invId = invoice.id ? invoice.id.slice(0, 8).toUpperCase() : 'BILL'

        const rawPhone = invoice.customer_phone ? String(invoice.customer_phone).replace(/\D/g, '') : ''
        const targetPhone = rawPhone.length === 10 ? `91${rawPhone}` : (rawPhone.length === 12 && rawPhone.startsWith('91') ? rawPhone : '')

        const items = Array.isArray(invoice.items) ? invoice.items : []
        const itemLines = items.slice(0, 4).map((it: any) => `• ${it.name} (x${it.quantity}) - ₹${Number(it.total || 0).toFixed(0)}`).join('\n')
        const moreCount = items.length > 4 ? `\n• ...aur ${items.length - 4} items` : ''

        const text = `🧾 *Tax Invoice #${invId}*
*From:* ${orgName}
*Bill To:* ${custName}
*Total Amount:* ₹${total}
*Payment:* ${invoice.payment_method || 'CASH'}

*Items Summary:*
${itemLines}${moreCount}

Thank you for your business! 🙏`

        const url = targetPhone
            ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`
            : `https://wa.me/?text=${encodeURIComponent(text)}`

        window.open(url, '_blank')
    }

    const handlePrint = () => {
        const printContent = document.getElementById(`printable-invoice-${invoice.id}`)
        if (!printContent) return

        const win = window.open('', '_blank', 'width=900,height=700')
        if (win) {
            win.document.write(`
                <html>
                <head>
                    <title>Invoice #${invoice.id.slice(0, 8)}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body class="p-6 bg-white">
                    ${printContent.innerHTML}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.close();
                        };
                    </script>
                </body>
                </html>
            `)
            win.document.close()
        }
    }

    return (
        <>
            <div onClick={() => setOpen(true)} className="cursor-pointer">
                {trigger || (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-[850px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-[#111613] border-white/10 text-white rounded-2xl shadow-2xl">
                    <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-10 sm:pr-12">
                        <div className="flex items-center gap-2">
                            <DialogTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                <span>Tax Invoice</span>
                                <span className="text-emerald-400 font-mono text-xs sm:text-sm bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                                    #{invoice.id.slice(0, 8).toUpperCase()}
                                </span>
                            </DialogTitle>
                        </div>
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                            <Button
                                onClick={handleWhatsAppShare}
                                size="sm"
                                className="border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 font-bold gap-1.5 h-9 text-xs rounded-xl transition-all"
                            >
                                <Share2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                <span>WhatsApp</span>
                            </Button>
                            <Button
                                onClick={handlePrint}
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-black gap-1.5 h-9 text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all"
                            >
                                <Printer className="h-3.5 w-3.5 shrink-0" />
                                <span>Print / PDF</span>
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 text-slate-900 rounded-b-2xl">
                        <div id={`printable-invoice-${invoice.id}`}>
                            <InvoiceTemplate invoice={invoice} />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
