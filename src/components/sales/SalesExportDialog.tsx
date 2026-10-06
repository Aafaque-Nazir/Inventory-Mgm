'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FileSpreadsheet, Download, Loader2, FileCheck2, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { getSalesForExport } from '@/app/actions/invoices'
import { format } from 'date-fns'

interface SalesExportDialogProps {
    trigger?: React.ReactNode
}

export function SalesExportDialog({ trigger }: SalesExportDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [exportFormat, setExportFormat] = useState<'gstr1' | 'tally' | 'summary'>('gstr1')
    const [dateRange, setDateRange] = useState<string>('30')

    const handleExport = async () => {
        setLoading(true)
        try {
            const rangeDays = dateRange === 'all' ? 0 : parseInt(dateRange, 10)
            const result = await getSalesForExport(rangeDays)

            if (result.error || !result.invoices) {
                toast.error(result.error || 'Failed to fetch sales records')
                setLoading(false)
                return
            }

            const invoices = result.invoices
            if (invoices.length === 0) {
                toast.warning('No invoices found for the selected time period.')
                setLoading(false)
                return
            }

            let csvData: any[] = []
            const todayStr = format(new Date(), 'yyyy-MM-dd')

            if (exportFormat === 'gstr1') {
                // Flatten invoice line-items for GST Filing (GSTR-1 B2B / B2CS)
                invoices.forEach((inv: any) => {
                    const items = Array.isArray(inv.items) ? inv.items : []
                    const invDate = inv.created_at ? format(new Date(inv.created_at), 'dd-MM-yyyy') : ''
                    const custGstin = inv.customer?.gstin || ''
                    const invType = custGstin ? 'B2B' : 'B2CS'

                    if (items.length === 0) {
                        csvData.push({
                            'Invoice No': inv.id ? inv.id.slice(0, 8).toUpperCase() : '',
                            'Invoice Date': invDate,
                            'Customer Name': inv.customer_name || 'Walk-in Customer',
                            'Customer Phone': inv.customer_phone || '',
                            'Customer GSTIN': custGstin || 'URP (Unregistered)',
                            'Invoice Type': invType,
                            'HSN Code': '-',
                            'Item Description': 'General Goods',
                            'Quantity': 1,
                            'Rate (₹)': Number(inv.total_amount || 0).toFixed(2),
                            'Taxable Value (₹)': Number(inv.subtotal || inv.total_amount || 0).toFixed(2),
                            'GST Rate (%)': 0,
                            'CGST (₹)': Number(inv.cgst_amount || 0).toFixed(2),
                            'SGST (₹)': Number(inv.sgst_amount || 0).toFixed(2),
                            'IGST (₹)': Number(inv.igst_amount || 0).toFixed(2),
                            'Total Invoice Value (₹)': Number(inv.total_amount || 0).toFixed(2),
                            'Payment Mode': inv.payment_method || 'CASH'
                        })
                    } else {
                        items.forEach((item: any) => {
                            const qty = Number(item.quantity || 1)
                            const price = Number(item.unit_price || 0)
                            const lineTotal = Number(item.total || (qty * price))
                            const gstRate = Number(item.gst_rate || 0)

                            let taxable = lineTotal
                            let cgst = 0
                            let sgst = 0
                            if (gstRate > 0) {
                                taxable = lineTotal / (1 + gstRate / 100)
                                const tax = lineTotal - taxable
                                cgst = tax / 2
                                sgst = tax / 2
                            }

                            csvData.push({
                                'Invoice No': inv.id ? inv.id.slice(0, 8).toUpperCase() : '',
                                'Invoice Date': invDate,
                                'Customer Name': inv.customer_name || 'Walk-in Customer',
                                'Customer Phone': inv.customer_phone || '',
                                'Customer GSTIN': custGstin || 'URP (Unregistered)',
                                'Invoice Type': invType,
                                'HSN Code': item.hsn_code || '-',
                                'Item Description': item.name || 'Item',
                                'Quantity': qty,
                                'Rate (₹)': price.toFixed(2),
                                'Taxable Value (₹)': taxable.toFixed(2),
                                'GST Rate (%)': `${gstRate}%`,
                                'CGST (₹)': cgst.toFixed(2),
                                'SGST (₹)': sgst.toFixed(2),
                                'IGST (₹)': '0.00',
                                'Total Line Value (₹)': lineTotal.toFixed(2),
                                'Payment Mode': inv.payment_method || 'CASH'
                            })
                        })
                    }
                })
            } else if (exportFormat === 'tally') {
                // Tally Voucher / Accounting Format
                invoices.forEach((inv: any) => {
                    const invDate = inv.created_at ? format(new Date(inv.created_at), 'dd-MM-yyyy') : ''
                    const custGstin = inv.customer?.gstin || ''
                    const totalTax = Number(inv.tax_amount || (Number(inv.cgst_amount || 0) + Number(inv.sgst_amount || 0)))
                    const taxableVal = Number(inv.subtotal || (Number(inv.total_amount || 0) - totalTax))

                    csvData.push({
                        'Date': invDate,
                        'Voucher Type': 'Sales',
                        'Voucher No': inv.id ? inv.id.slice(0, 8).toUpperCase() : '',
                        'Party Name': inv.customer_name || 'Cash Sales',
                        'Party GSTIN': custGstin || '',
                        'Sales Ledger': custGstin ? 'B2B Sales' : 'B2C Local Sales',
                        'Gross Total (₹)': Number(inv.total_amount || 0).toFixed(2),
                        'Taxable Amount (₹)': taxableVal.toFixed(2),
                        'CGST (₹)': Number(inv.cgst_amount || 0).toFixed(2),
                        'SGST (₹)': Number(inv.sgst_amount || 0).toFixed(2),
                        'Payment Method': inv.payment_method || 'CASH',
                        'Narration': `Invoice #${inv.id ? inv.id.slice(0, 8).toUpperCase() : ''} generated from InvMaster`
                    })
                })
            } else {
                // Simple 1-Row-Per-Invoice Register
                csvData = invoices.map((inv: any) => ({
                    'Invoice No': inv.id ? inv.id.slice(0, 8).toUpperCase() : '',
                    'Date': inv.created_at ? format(new Date(inv.created_at), 'dd-MM-yyyy, hh:mm a') : '',
                    'Customer Name': inv.customer_name || 'Walk-in Customer',
                    'Phone': inv.customer_phone || '-',
                    'Status': inv.status || 'PAID',
                    'Payment Mode': inv.payment_method || 'CASH',
                    'Subtotal (₹)': Number(inv.subtotal || 0).toFixed(2),
                    'Tax (₹)': Number(inv.tax_amount || 0).toFixed(2),
                    'Total Amount (₹)': Number(inv.total_amount || 0).toFixed(2)
                }))
            }

            const csvContent = Papa.unparse(csvData)
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            
            const filePrefix = exportFormat === 'gstr1' ? 'GSTR1_Sales_Report' : exportFormat === 'tally' ? 'Tally_DayBook_Export' : 'Sales_Register'
            link.href = url
            link.setAttribute('download', `${filePrefix}_${todayStr}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success(`Successfully exported ${invoices.length} invoices! Ready to share with your CA.`)
            setOpen(false)
        } catch (err: any) {
            console.error('Export Error:', err)
            toast.error(err.message || 'Failed to generate export file')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:text-white rounded-xl gap-2 h-9 text-xs font-semibold shadow-sm transition-all"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                        <span>Export (CA / Tally)</span>
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-[520px] bg-[#0e1410] border border-white/10 text-white rounded-2xl shadow-2xl p-5 sm:p-6">
                <DialogHeader className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                            <FileSpreadsheet className="h-4 w-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-base sm:text-lg font-bold text-white">
                                Export Sales for CA & Tally
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-400">
                                Download pre-formatted spreadsheets for GSTR-1 GST filing and accounting import.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Format Selector */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-300">Choose Export Format</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            
                            {/* Format 1: GSTR-1 */}
                            <button
                                type="button"
                                onClick={() => setExportFormat('gstr1')}
                                className={`text-left p-3 rounded-xl border transition-all ${exportFormat === 'gstr1'
                                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm'
                                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-emerald-400">GSTR-1 Format</span>
                                    <FileCheck2 className="h-3.5 w-3.5 text-emerald-400" />
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Full B2B/B2CS tax breakup, HSN codes & GSTIN for your CA.
                                </p>
                            </button>

                            {/* Format 2: Tally */}
                            <button
                                type="button"
                                onClick={() => setExportFormat('tally')}
                                className={`text-left p-3 rounded-xl border transition-all ${exportFormat === 'tally'
                                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm'
                                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-emerald-400">Tally Day-Book</span>
                                    <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Voucher date, party name, ledgers & amounts for Tally / Busy.
                                </p>
                            </button>

                        </div>
                    </div>

                    {/* Date Range Selector */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-300">Select Date Range</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            {[
                                { id: '30', label: 'Last 30 Days' },
                                { id: '60', label: 'Last 60 Days' },
                                { id: '90', label: 'Quarter (90d)' },
                                { id: 'all', label: 'All Sales' }
                            ].map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setDateRange(r.id)}
                                    className={`py-2 px-2.5 rounded-xl border text-center transition-all font-medium ${dateRange === r.id
                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                                        }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pro Tip Box */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400">
                        <p className="text-emerald-300 font-semibold mb-0.5">💡 Direct CA Sharing:</p>
                        <span>Download this CSV and send it directly on WhatsApp or Email to your CA for effortless monthly GST return filing.</span>
                    </div>
                </div>

                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="w-full sm:w-auto text-slate-400 hover:text-white hover:bg-white/10 rounded-xl h-9 text-xs"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={loading}
                        className="w-full sm:w-auto flex-1 bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold rounded-xl h-9 text-xs shadow-md shadow-emerald-500/25 transition-all gap-1.5"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#04160c]" />
                                Generating Export...
                            </>
                        ) : (
                            <>
                                <Download className="h-3.5 w-3.5" />
                                Download {exportFormat === 'gstr1' ? 'GSTR-1 Sheet' : 'Tally File'}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
