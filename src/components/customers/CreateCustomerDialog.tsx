'use client'

import { useState, useTransition } from 'react'
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
import { UserPlus, Loader2 } from 'lucide-react'
import { createCustomer } from '@/app/actions/customers'
import { toast } from 'sonner'

export function CreateCustomerDialog({ trigger, onSuccess }: { trigger?: React.ReactNode, onSuccess?: () => void }) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [address, setAddress] = useState('')
    const [gstin, setGstin] = useState('')
    const [notes, setNotes] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            toast.error('Customer name is required')
            return
        }

        const formData = new FormData()
        formData.append('name', name.trim())
        if (phone) formData.append('phone', phone.trim())
        if (email) formData.append('email', email.trim())
        if (address) formData.append('address', address.trim())
        if (gstin) formData.append('gstin', gstin.trim().toUpperCase())
        if (notes) formData.append('notes', notes.trim())

        startTransition(async () => {
            const res = await createCustomer(formData)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success('Customer added successfully!')
                setOpen(false)
                setName('')
                setPhone('')
                setEmail('')
                setAddress('')
                setGstin('')
                setNotes('')
                onSuccess?.()
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold shadow-lg shadow-emerald-500/20 gap-2">
                        <UserPlus className="h-4 w-4" /> Add Customer
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-[550px] bg-[#111613] border border-white/10 text-white rounded-2xl shadow-2xl">
                <DialogHeader className="p-4 sm:p-6 pb-2 border-b border-white/5">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                        <UserPlus className="h-5 w-5 text-emerald-400" />
                        Add New Customer
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-slate-400">Customer / Business Name *</Label>
                        <Input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Ramesh Traders or Rajesh Kumar"
                            className="bg-black/30 border-white/10 text-white rounded-xl"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-400">Phone Number</Label>
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="10-digit mobile"
                                className="bg-black/30 border-white/10 text-white rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-400">Email Address</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="bg-black/30 border-white/10 text-white rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-400">GSTIN (Optional)</Label>
                            <Input
                                value={gstin}
                                onChange={(e) => setGstin(e.target.value)}
                                placeholder="15-character GSTIN"
                                maxLength={15}
                                className="bg-black/30 border-white/10 text-white rounded-xl uppercase font-mono text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-400">Billing Address</Label>
                            <Input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="City, State, Pincode"
                                className="bg-black/30 border-white/10 text-white rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-slate-400">Notes / Tags</Label>
                        <Input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. VIP wholesale customer, weekly delivery"
                            className="bg-black/30 border-white/10 text-white rounded-xl"
                        />
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="border-white/10 text-slate-300 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold shadow-lg shadow-emerald-500/20"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                                </>
                            ) : (
                                'Save Customer'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
