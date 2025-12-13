'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { Plus } from 'lucide-react'

const formSchema = z.object({
    name: z.string().min(2),
    sku: z.string().min(2),
    category: z.string().optional(),
    unit: z.string().min(1),
    min_stock: z.coerce.number().min(0),
    initial_stock: z.coerce.number().min(0).optional(),
})

export function CreateItemDialog() {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            sku: '',
            category: '',
            unit: 'pcs',
            min_stock: 0,
            initial_stock: 0,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            console.log('Submitting item:', values)
            const { initial_stock, ...itemData } = values

            // Create the item with initial stock
            const { data, error } = await supabase
                .from('items')
                .insert({
                    ...itemData,
                    current_stock: initial_stock || 0
                })
                .select()
                .single()

            if (error) {
                console.error('Supabase error:', error)
                throw error
            }

            // If initial stock > 0, create a stock movement record
            if (initial_stock && initial_stock > 0) {
                const { data: { user } } = await supabase.auth.getUser()
                await supabase.from('stock_movements').insert({
                    item_id: data.id,
                    quantity: initial_stock,
                    type: 'IN',
                    reason: 'Initial stock',
                    created_by: user?.id,
                })
            }

            console.log('Item created:', data)
            toast.success('Item created successfully')
            setOpen(false)
            form.reset()
            router.refresh()
        } catch (error: any) {
            console.error('Failed to create item:', error)
            toast.error(error.message || 'Failed to create item')
        }
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
                        Create a new item in your inventory.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Apple" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sku"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SKU / Barcode</FormLabel>
                                    <FormControl>
                                        <Input placeholder="APL-001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Fruits" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit</FormLabel>
                                        <FormControl>
                                            <Input placeholder="kg" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="min_stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Min Stock</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="initial_stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Initial Stock</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}
