'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, Eye } from 'lucide-react'
import { InvoiceTemplate } from './InvoiceTemplate'

interface ViewInvoiceDialogProps {
    invoice: any
    trigger?: React.ReactNode
}

export function ViewInvoiceDialog({ invoice, trigger }: ViewInvoiceDialogProps) {
    const [open, setOpen] = useState(false)

    if (!invoice) return null

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
                <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-[850px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-[#111613] border-white/10 text-white rounded-2xl">
                    <DialogHeader className="p-4 sm:p-6 pb-2 border-b border-white/5 flex flex-row items-center justify-between">
                        <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                            <span>Tax Invoice</span>
                            <span className="text-emerald-400 font-mono text-sm bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                #{invoice.id.slice(0, 8)}
                            </span>
                        </DialogTitle>
                        <Button
                            onClick={handlePrint}
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold gap-2 mr-6"
                        >
                            <Printer className="h-4 w-4" /> Print / PDF
                        </Button>
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
