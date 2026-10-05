'use client'

import { useState, useTransition, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RotateCcw, Trash2, Loader2 } from 'lucide-react'
import { recordSalesReturn } from '@/app/actions/returns'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Item, SalesReturnItem } from '@/types'

interface RecordReturnDialogProps {
    invoiceId?: string
    customerName?: string
    customerPhone?: string
    initialItems?: any[]
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function RecordReturnDialog({
    invoiceId,
    customerName: initialCustomerName,
    customerPhone: initialCustomerPhone,
    initialItems,
    trigger,
    onSuccess
}: RecordReturnDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const [customerName, setCustomerName] = useState(initialCustomerName || '')
    const [customerPhone, setCustomerPhone] = useState(initialCustomerPhone || '')
    const linkedInvoiceId = invoiceId || ''
    const [refundMethod, setRefundMethod] = useState<'CASH' | 'UPI' | 'CREDIT_NOTE' | 'OTHER'>('CASH')
    const [reason, setReason] = useState('Customer changed mind')
    const [customReason, setCustomReason] = useState('')

    const [availableItems, setAvailableItems] = useState<Item[]>([])
    const [selectedItems, setSelectedItems] = useState<SalesReturnItem[]>([])

    const supabase = createClient()

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (newOpen && initialItems && initialItems.length > 0) {
            setSelectedItems(initialItems.map(item => ({
                item_id: item.item_id,
                name: item.name,
                quantity: 1,
                unit_price: Number(item.unit_price || 0),
                refund_amount: Number(item.unit_price || 0),
                restock: true,
                condition: 'RESTOCKABLE'
            })))
        }
    }

    // Fetch items when dialog opens
    useEffect(() => {
        if (!open || (initialItems && initialItems.length > 0)) return

        let isCancelled = false
        async function fetchOrgItems() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user || isCancelled) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single()

            if (profile?.organization_id && !isCancelled) {
                const { data } = await supabase
                    .from('items')
                    .select('*')
                    .eq('organization_id', profile.organization_id)

                if (!isCancelled) {
                    setAvailableItems(data || [])
                }
            }
        }

        fetchOrgItems()

        return () => {
            isCancelled = true
        }
    }, [open, initialItems, supabase])

    const addItemToReturn = (item: Item) => {
        const existing = selectedItems.find(i => i.item_id === item.id)
        if (existing) {
            setSelectedItems(prev => prev.map(i => i.item_id === item.id ? {
                ...i,
                quantity: i.quantity + 1,
                refund_amount: (i.quantity + 1) * i.unit_price
            } : i))
            return
        }

        setSelectedItems(prev => [...prev, {
            item_id: item.id,
            name: item.name,
            quantity: 1,
            unit_price: item.selling_price || 0,
            refund_amount: item.selling_price || 0,
            restock: true,
            condition: 'RESTOCKABLE'
        }])
    }

    const updateItemQty = (itemId: string, qty: number) => {
        if (qty <= 0) return
        setSelectedItems(prev => prev.map(i => i.item_id === itemId ? {
            ...i,
            quantity: qty,
            refund_amount: qty * i.unit_price
        } : i))
    }

    const updateCondition = (itemId: string, condition: 'RESTOCKABLE' | 'DAMAGED') => {
        setSelectedItems(prev => prev.map(i => i.item_id === itemId ? {
            ...i,
            condition,
            restock: condition === 'RESTOCKABLE'
        } : i))
    }

    const removeItem = (itemId: string) => {
        setSelectedItems(prev => prev.filter(i => i.item_id !== itemId))
    }

    const totalRefund = selectedItems.reduce((sum, i) => sum + i.refund_amount, 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (selectedItems.length === 0) {
            toast.error('Please add at least one item to return')
            return
        }

        const finalReason = reason === 'Other' ? customReason : reason

        const formData = new FormData()
        if (linkedInvoiceId) formData.append('invoice_id', linkedInvoiceId)
        if (customerName) formData.append('customer_name', customerName)
        if (customerPhone) formData.append('customer_phone', customerPhone)
        formData.append('total_refund_amount', totalRefund.toString())
        formData.append('refund_method', refundMethod)
        formData.append('reason', finalReason)
        formData.append('items', JSON.stringify(selectedItems))

        startTransition(async () => {
            const res = await recordSalesReturn({}, formData)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success('Sales return processed and stock adjusted!')
                setOpen(false)
                setSelectedItems([])
                onSuccess?.()
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-white gap-2">
                        <RotateCcw className="h-4 w-4" /> Sales Return / Credit Note
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-[#111613] border border-white/10 text-white rounded-2xl shadow-2xl">
                <DialogHeader className="p-4 sm:p-6 pb-3 border-b border-white/5">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                        <RotateCcw className="h-5 w-5 text-emerald-400" />
                        Record Sales Return & Credit Note
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {/* Header Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-400">Customer Name</Label>
                            <Input
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Walk-in customer"
                                className="bg-black/30 border-white/10 text-white rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-400">Customer Phone</Label>
                            <Input
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="10-digit mobile"
                                className="bg-black/30 border-white/10 text-white rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-400">Refund Method</Label>
                            <select
                                value={refundMethod}
                                onChange={(e) => setRefundMethod(e.target.value as any)}
                                className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                            >
                                <option value="CASH">Cash Refund</option>
                                <option value="UPI">UPI / Online</option>
                                <option value="CREDIT_NOTE">Store Credit / Credit Note</option>
                                <option value="OTHER">Other Adjustment</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-400">Return Reason</Label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                            >
                                <option value="Customer changed mind">Customer changed mind</option>
                                <option value="Defective / Damaged product">Defective / Damaged product</option>
                                <option value="Wrong item ordered/delivered">Wrong item ordered/delivered</option>
                                <option value="Expired / Near expiry">Expired / Near expiry</option>
                                <option value="Other">Other reason</option>
                            </select>
                        </div>
                    </div>

                    {reason === 'Other' && (
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-400">Specify Reason</Label>
                            <Input
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Provide context..."
                                className="bg-black/30 border-white/10 text-white rounded-xl"
                            />
                        </div>
                    )}

                    {/* Add Items Section */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-white flex justify-between items-center">
                            <span>Items to Return</span>
                            {availableItems.length > 0 && (
                                <select
                                    onChange={(e) => {
                                        const itm = availableItems.find(i => i.id === e.target.value)
                                        if (itm) addItemToReturn(itm)
                                        e.target.value = ''
                                    }}
                                    defaultValue=""
                                    className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                                >
                                    <option value="" disabled>+ Add Item to Return</option>
                                    {availableItems.map(i => (
                                        <option key={i.id} value={i.id} className="bg-slate-900 text-white">
                                            {i.name} (₹{i.selling_price})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </Label>

                        {selectedItems.length === 0 ? (
                            <div className="p-6 text-center border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
                                No items added yet. Select an item above to add to this return.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {selectedItems.map((item) => (
                                    <div key={item.item_id} className="p-3 bg-black/40 border border-white/10 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="font-semibold text-white text-sm">{item.name}</p>
                                            <p className="text-xs text-slate-400">Unit Price: ₹{item.unit_price}</p>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-[10px] text-slate-400">Qty:</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItemQty(item.item_id, parseFloat(e.target.value) || 1)}
                                                    className="w-16 h-8 bg-black/30 border-white/10 text-white text-center rounded-lg text-xs"
                                                />
                                            </div>

                                            <select
                                                value={item.condition}
                                                onChange={(e) => updateCondition(item.item_id, e.target.value as any)}
                                                className="bg-black/30 border border-white/10 text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                                            >
                                                <option value="RESTOCKABLE">Restockable</option>
                                                <option value="DAMAGED">Damaged (No restock)</option>
                                            </select>

                                            <div className="font-bold text-white text-sm min-w-[70px] text-right">
                                                ₹{item.refund_amount.toFixed(2)}
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeItem(item.item_id)}
                                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Total & Action */}
                    <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <span className="text-xs text-slate-400">Total Refund / Credit:</span>
                            <p className="text-2xl font-black text-emerald-400">₹{totalRefund.toFixed(2)}</p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="flex-1 sm:flex-initial border-white/10 text-slate-300 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending || selectedItems.length === 0}
                                className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold shadow-lg shadow-emerald-500/20"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...
                                    </>
                                ) : (
                                    'Process Return & Restock'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
