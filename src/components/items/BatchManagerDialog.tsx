'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
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
import { Layers, Plus, Calendar, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { getItemBatches, createItemBatch } from '@/app/actions/batches'
import { toast } from 'sonner'
import { ItemBatch } from '@/types'
import { format, differenceInDays } from 'date-fns'

interface BatchManagerDialogProps {
    itemId: string
    itemName: string
    trigger?: React.ReactNode
}

export function BatchManagerDialog({ itemId, itemName, trigger }: BatchManagerDialogProps) {
    const [open, setOpen] = useState(false)
    const [batches, setBatches] = useState<ItemBatch[]>([])
    const [loading, setLoading] = useState(false)
    const [isPending, startTransition] = useTransition()

    // New batch state
    const [showAddForm, setShowAddForm] = useState(false)
    const [batchNumber, setBatchNumber] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [manufacturingDate, setManufacturingDate] = useState('')
    const [quantity, setQuantity] = useState('0')

    const loadBatches = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getItemBatches(itemId)
            setBatches(res.batches || [])
        } catch {
            toast.error('Failed to load batches')
        } finally {
            setLoading(false)
        }
    }, [itemId])

    useEffect(() => {
        if (open) {
            loadBatches()
        }
    }, [open, loadBatches])

    const handleCreateBatch = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!batchNumber.trim()) {
            toast.error('Batch number is required')
            return
        }

        const formData = new FormData()
        formData.append('item_id', itemId)
        formData.append('batch_number', batchNumber.trim().toUpperCase())
        if (expiryDate) formData.append('expiry_date', expiryDate)
        if (manufacturingDate) formData.append('manufacturing_date', manufacturingDate)
        formData.append('quantity', quantity)

        startTransition(async () => {
            const res = await createItemBatch(formData)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success('Batch added successfully!')
                setShowAddForm(false)
                setBatchNumber('')
                setExpiryDate('')
                setManufacturingDate('')
                setQuantity('0')
                loadBatches()
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 px-2 gap-1.5">
                        <Layers className="h-3.5 w-3.5" /> Batches
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-[620px] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-[#111613] border border-white/10 text-white rounded-2xl shadow-2xl">
                <DialogHeader className="p-4 sm:p-6 pb-3 border-b border-white/5 flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
                            <Layers className="h-5 w-5 text-emerald-400" />
                            Batch & Expiry Tracking
                        </DialogTitle>
                        <p className="text-xs text-slate-400 mt-0.5">Item: <span className="text-white font-semibold">{itemName}</span></p>
                    </div>

                    <Button
                        size="sm"
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold text-xs gap-1.5 mr-6"
                    >
                        <Plus className="h-3.5 w-3.5" /> {showAddForm ? 'View List' : 'Add Batch'}
                    </Button>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {showAddForm ? (
                        <form onSubmit={handleCreateBatch} className="space-y-4 bg-black/40 p-4 rounded-xl border border-white/10">
                            <h3 className="text-sm font-bold text-emerald-400">Register New Batch</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-400">Batch / Lot Number *</Label>
                                    <Input
                                        required
                                        value={batchNumber}
                                        onChange={(e) => setBatchNumber(e.target.value)}
                                        placeholder="e.g. BATCH-2026-A"
                                        className="bg-black/30 border-white/10 text-white rounded-xl uppercase font-mono text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-400">Initial Quantity</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="bg-black/30 border-white/10 text-white rounded-xl text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-400">Manufacturing Date</Label>
                                    <Input
                                        type="date"
                                        value={manufacturingDate}
                                        onChange={(e) => setManufacturingDate(e.target.value)}
                                        className="bg-black/30 border-white/10 text-white rounded-xl text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-400">Expiry Date</Label>
                                    <Input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="bg-black/30 border-white/10 text-white rounded-xl text-xs"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAddForm(false)}
                                    className="text-slate-400"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isPending}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold"
                                >
                                    {isPending ? 'Saving...' : 'Save Batch'}
                                </Button>
                            </div>
                        </form>
                    ) : null}

                    {/* Batches Table */}
                    {loading ? (
                        <div className="py-8 text-center text-slate-400 text-xs">Loading batches...</div>
                    ) : batches.length === 0 ? (
                        <div className="py-10 text-center border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
                            No batches registered for this item yet. Click &quot;Add Batch&quot; above to track lots and expiry dates.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {batches.map((batch) => {
                                const daysLeft = batch.expiry_date ? differenceInDays(new Date(batch.expiry_date), new Date()) : null
                                const isExpired = daysLeft !== null && daysLeft <= 0
                                const isNearExpiry = daysLeft !== null && daysLeft > 0 && daysLeft <= 30

                                return (
                                    <div
                                        key={batch.id}
                                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                            isExpired
                                                ? 'bg-rose-500/10 border-rose-500/30'
                                                : isNearExpiry
                                                    ? 'bg-amber-500/10 border-amber-500/30'
                                                    : 'bg-black/40 border-white/10'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-white text-sm">
                                                    {batch.batch_number}
                                                </span>
                                                {isExpired && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                                        <AlertTriangle className="h-3 w-3" /> Expired
                                                    </span>
                                                )}
                                                {isNearExpiry && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                        <Clock className="h-3 w-3" /> Expiring in {daysLeft}d
                                                    </span>
                                                )}
                                                {!isExpired && !isNearExpiry && batch.expiry_date && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                        <CheckCircle2 className="h-3 w-3" /> Fresh
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                                                {batch.expiry_date && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 text-slate-500" />
                                                        Expiry: {format(new Date(batch.expiry_date), 'dd MMM yyyy')}
                                                    </span>
                                                )}
                                                {batch.manufacturing_date && (
                                                    <span>Mfg: {format(new Date(batch.manufacturing_date), 'dd MMM yyyy')}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-[10px] text-slate-400 uppercase font-medium">Batch Stock</span>
                                            <p className="font-black text-white text-base">{batch.quantity} units</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
