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
import { Plus, Loader2, ChevronsUpDown, Check } from 'lucide-react'
import { createItem } from '@/app/actions/items'
import { cn } from '@/lib/utils'
import { ITEM_CATEGORIES, ITEM_UNITS } from '@/lib/constants'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function CreateItemDialog() {
    const [open, setOpen] = useState(false)
    const [category, setCategory] = useState("")
    const [unit, setUnit] = useState("pcs")
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
                // Reset form manually or relying on unmount
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
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            "justify-between font-normal",
                                            !category && "text-muted-foreground"
                                        )}
                                    >
                                        {category || "Select category"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search category..." />
                                        <CommandList>
                                            <CommandEmpty>No category found.</CommandEmpty>
                                            <CommandGroup>
                                                {ITEM_CATEGORIES.map((cat) => (
                                                    <CommandItem
                                                        key={cat}
                                                        value={cat}
                                                        onSelect={(currentValue) => {
                                                            setCategory(currentValue === category ? "" : currentValue)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                category === cat ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {cat}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <input type="hidden" name="category" value={category} />
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <Label>Unit</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            "justify-between font-normal",
                                            !unit && "text-muted-foreground"
                                        )}
                                    >
                                        {unit || "Select unit"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search unit..." />
                                        <CommandList>
                                            <CommandEmpty>No unit found.</CommandEmpty>
                                            <CommandGroup>
                                                {ITEM_UNITS.map((u) => (
                                                    <CommandItem
                                                        key={u}
                                                        value={u}
                                                        onSelect={(currentValue) => {
                                                            setUnit(currentValue === unit ? "" : currentValue)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                unit === u ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {u}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <input type="hidden" name="unit" value={unit} />
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
