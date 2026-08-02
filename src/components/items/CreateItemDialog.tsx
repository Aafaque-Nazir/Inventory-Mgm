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
import { Plus, Loader2, ScanBarcode, ChevronsUpDown, Check } from 'lucide-react'
import { createItem } from '@/app/actions/items'
import { ITEM_CATEGORIES, ITEM_UNITS } from '@/lib/constants'
import { BarcodeScanner } from '@/components/common/BarcodeScanner'
import {
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CreateItemDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultSku?: string
    defaultName?: string
    defaultCategory?: string
    defaultUnit?: string
    defaultSize?: string
    defaultColor?: string
    hideTrigger?: boolean
}

export function CreateItemDialog({
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    defaultSku = '',
    defaultName = '',
    defaultCategory = '',
    defaultUnit = 'pcs',
    defaultSize = '',
    defaultColor = '',
    hideTrigger = false
}: CreateItemDialogProps = {}) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined

    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = (newOpen: boolean) => {
        if (isControlled) {
            controlledOnOpenChange?.(newOpen)
        } else {
            setInternalOpen(newOpen)
        }
    }

    const [isScanning, setIsScanning] = useState(false)
    const [sku, setSku] = useState(defaultSku)
    const [name, setName] = useState(defaultName)
    const [category, setCategory] = useState(defaultCategory)
    const [unit, setUnit] = useState(defaultUnit)
    const [size, setSize] = useState(defaultSize)
    const [color, setColor] = useState(defaultColor)

    const [isPending, startTransition] = useTransition()
    const _router = useRouter()

    // Sync state with props when dialog opens/closes
    const [prevOpen, setPrevOpen] = useState(open)
    if (open !== prevOpen) {
        setPrevOpen(open)
        if (open) {
            // Only reset from defaults if we are opening
            setSku(defaultSku)
            setName(defaultName)
            if (defaultCategory) setCategory(defaultCategory)
            if (defaultUnit) setUnit(defaultUnit)
            if (defaultSize) setSize(defaultSize)
            if (defaultColor) setColor(defaultColor)
        }
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        // Ensure state values are present if user didn't type them
        if (sku && !formData.get('sku')) formData.set('sku', sku)
        if (name && !formData.get('name')) formData.set('name', name)

        // Ensure combobox values are set
        if (category) formData.set('category', category)
        if (unit) formData.set('unit', unit)

        startTransition(async () => {
            const result = await createItem({}, formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('Item created successfully')
                setOpen(false)
                // Reset form
                setSku('')
                setName('')
            }
        })
    }

    async function fetchProductDetails(barcode: string) {
        setSku(barcode)
        toast.info('Fetching product details...')
        try {
            const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
            const data = await response.json()

            if (data.status === 1 && data.product) {
                const productName = data.product.product_name || data.product.product_name_en
                if (productName) {
                    setName(productName)
                    toast.success('Product found: ' + productName)
                } else {
                    toast.info('Product found but no name available')
                }
            } else {
                toast.info('Product not found in database')
            }
        } catch (error: any) {
            console.error('Error fetching product:', error)
            toast.error('Failed to fetch product details')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!hideTrigger && (
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                    <DialogDescription>
                        Create a new item. Free plan limited to 50 items.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Apple"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sku">SKU / Barcode</Label>
                        <div className="flex gap-2">
                            <Input
                                id="sku"
                                name="sku"
                                placeholder="APL-001"
                                required
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => setIsScanning(true)} title="Scan Barcode">
                                <ScanBarcode className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 flex flex-col">
                            <Label>Category</Label>
                            <FormCombobox
                                items={ITEM_CATEGORIES}
                                value={category}
                                onChange={setCategory}
                                placeholder="Select category"
                                allowCustom={true}
                            />
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <Label>Unit</Label>
                            <FormCombobox
                                items={ITEM_UNITS}
                                value={unit}
                                onChange={setUnit}
                                placeholder="Select unit"
                            />
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="hsn_code">HSN Code</Label>
                            <Input id="hsn_code" name="hsn_code" placeholder="e.g. 123456" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gst_rate">GST Rate (%)</Label>
                            <Select name="gst_rate" defaultValue="0">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select GST" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">0% (Exempt)</SelectItem>
                                    <SelectItem value="5">5%</SelectItem>
                                    <SelectItem value="12">12%</SelectItem>
                                    <SelectItem value="18">18%</SelectItem>
                                    <SelectItem value="28">28%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="size">Size</Label>
                            <Input id="size" name="size" placeholder="e.g. XL, 42, 10kg" value={size} onChange={(e) => setSize(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="color">Color</Label>
                            <Input id="color" name="color" placeholder="e.g. Red, Black" value={color} onChange={(e) => setColor(e.target.value)} />
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
            <BarcodeScanner
                open={isScanning}
                onOpenChange={setIsScanning}
                onScanSuccess={(code) => fetchProductDetails(code)}
            />
        </Dialog >
    )
}

function FormCombobox({ items, value, onChange, placeholder, allowCustom = false }: {
    items: string[]
    value: string
    onChange: (val: string) => void
    placeholder: string
    allowCustom?: boolean
}) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")

    // Filter items based on search
    const filteredItems = search
        ? items.filter(item => item.toLowerCase().includes(search.toLowerCase()))
        : items

    // If value is custom (not in items), add it to top
    const displayItems = value && !items.includes(value)
        ? [value, ...filteredItems]
        : filteredItems

    const handleSelect = (item: string) => {
        onChange(item)
        setOpen(false)
        setSearch("")
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    {value
                        ? value
                        : <span className="text-muted-foreground">{placeholder}</span>}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <div className="flex flex-col">
                    {/* Search Input */}
                    <div className="flex items-center border-b px-3">
                        <input
                            className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                            placeholder={`Search ${placeholder.toLowerCase()}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Items List */}
                    <div className="max-h-[200px] overflow-auto p-1">
                        {displayItems.length === 0 && !allowCustom && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                No results found.
                            </div>
                        )}

                        {displayItems.length === 0 && allowCustom && search && (
                            <div className="p-2">
                                <p className="text-xs text-muted-foreground mb-2">No results found.</p>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleSelect(search)}
                                >
                                    + Add &quot;{search}&quot;
                                </Button>
                            </div>
                        )}

                        {displayItems.map((item) => (
                            <div
                                key={item}
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                    value === item && "bg-accent"
                                )}
                                onClick={() => handleSelect(item)}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === item ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
