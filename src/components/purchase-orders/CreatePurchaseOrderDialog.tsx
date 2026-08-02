'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { Item, Supplier } from '@/types'
import { Card } from '@/components/ui/card'

const lineItemSchema = z.object({
    item_id: z.string().min(1, 'Item is required'),
    quantity: z.coerce.number().min(0.01, 'Quantity must be positive'),
    price: z.coerce.number().min(0, 'Price must be positive'),
})

const formSchema = z.object({
    supplier_id: z.string().min(1, 'Supplier is required'),
    items: z.array(lineItemSchema).min(1, 'At least one item is required'),
})

export function CreatePurchaseOrderDialog({ warehouseId }: { warehouseId?: string }) {
    const [open, setOpen] = useState(false)
    const [items, setItems] = useState<Item[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            supplier_id: '',
            items: [{ item_id: '', quantity: 1, price: 0 }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    })

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single()

            if (profile?.organization_id) {
                const [itemsRes, suppliersRes] = await Promise.all([
                    supabase.from('items').select('*').eq('organization_id', profile.organization_id).order('name'),
                    supabase.from('suppliers').select('*').eq('organization_id', profile.organization_id).order('name'),
                ])
                if (itemsRes.data) setItems(itemsRes.data)
                if (suppliersRes.data) setSuppliers(suppliersRes.data)
            }
        }
        if (open) fetchData()
    }, [open, supabase])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // Calculate total
            const total = values.items.reduce((sum: number, item: { item_id: string; quantity: number; price: number; }) =>
                sum + (item.quantity * item.price), 0
            )

            // Create PO
            const { data: po, error: poError } = await supabase
                .from('purchase_orders')
                .insert({
                    supplier_id: values.supplier_id,
                    total_amount: total,
                    created_by: user?.id,
                    status: 'DRAFT',
                    location_id: warehouseId // Add location_id
                })
                .select()
                .single()

            if (poError) throw poError

            // Create line items
            const lineItems = values.items.map((item: { item_id: string; quantity: number; price: number; }) => ({
                order_id: po.id,
                item_id: item.item_id,
                quantity: item.quantity,
                price: item.price,
                line_total: item.quantity * item.price,
            }))

            const { error: itemsError } = await supabase
                .from('purchase_order_items')
                .insert(lineItems)

            if (itemsError) throw itemsError

            toast.success('Purchase order created successfully')
            setOpen(false)
            form.reset()
            router.refresh()
        } catch (_error: any) {
            toast.error('Failed to create purchase order')
        }
    }

    const watchedItems = form.watch('items')
    const total = watchedItems?.reduce((sum: number, item: { item_id: string; quantity: number; price: number; }) =>
        sum + ((item.quantity || 0) * (item.price || 0)), 0
    ) || 0

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Order
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Purchase Order</DialogTitle>
                    <DialogDescription>
                        Create a new purchase order for inventory.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="supplier_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Supplier</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a supplier" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {suppliers.map((supplier) => (
                                                <SelectItem key={supplier.id} value={supplier.id}>
                                                    {supplier.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <FormLabel>Items</FormLabel>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ item_id: '', quantity: 1, price: 0 })}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Item
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <Card key={field.id} className="p-4">
                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-5">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.item_id`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Item</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select item" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {items.map((item) => (
                                                                    <SelectItem key={item.id} value={item.id}>
                                                                        {item.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Qty</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.01" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.price`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Price</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.01" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-1 flex items-end">
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                            <div className="text-lg font-semibold">
                                Total: ${total.toFixed(2)}
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Order</Button>
                            </DialogFooter>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
