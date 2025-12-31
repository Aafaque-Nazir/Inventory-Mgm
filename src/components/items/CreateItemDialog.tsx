'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'
import { createItem } from '@/app/actions/items'
import { ITEM_CATEGORIES, ITEM_UNITS } from '@/lib/constants'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function CreateItemDialog() {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        startTransition(async () => {
            const result = await createItem({}, formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('Item created successfully')
                setOpen(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                    <DialogDescription>
                        Create a new item. Free plan limited to 50 items.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" placeholder="Apple" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sku">SKU / Barcode</Label>
                        <Input id="sku" name="sku" placeholder="APL-001" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 flex flex-col">
                            <Label>Category</Label>
                            <Select name="category">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ITEM_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <Label>Unit</Label>
                            <Select name="unit" defaultValue="pcs">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ITEM_UNITS.map((u) => (
                                        <SelectItem key={u} value={u}>
                                            {u}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="min_stock">Min Stock</Label>
                            <Input id="min_stock" name="min_stock" type="number" required defaultValue={0} min={0} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="initial_stock">Initial Stock</Label>
                            <Input id="initial_stock" name="initial_stock" type="number" defaultValue={0} min={0} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cost_price">Cost Price (₹)</Label>
                            <Input id="cost_price" name="cost_price" type="number" step="0.01" defaultValue={0} min={0} placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="selling_price">Selling Price (₹)</Label>
                            <Input id="selling_price" name="selling_price" type="number" step="0.01" defaultValue={0} min={0} placeholder="0.00" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Item
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}
