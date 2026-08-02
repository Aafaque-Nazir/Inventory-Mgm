'use client'

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
import { Item } from '@/types'

const formSchema = z.object({
    name: z.string().min(2),
    sku: z.string().min(2),
    category: z.string().optional(),
    unit: z.string().min(1),
    min_stock: z.coerce.number().min(0),
    cost_price: z.coerce.number().min(0),
    selling_price: z.coerce.number().min(0),
    size: z.string().optional(),
    color: z.string().optional(),
    hsn_code: z.string().optional(),
    gst_rate: z.coerce.number().min(0).max(100).optional(),
})

interface EditItemDialogProps {
    item: Item
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditItemDialog({ item, open, onOpenChange }: EditItemDialogProps) {
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: item.name,
            sku: item.sku,
            category: item.category || '',
            unit: item.unit,
            min_stock: item.min_stock,
            cost_price: item.cost_price || 0,
            selling_price: item.selling_price || 0,
            size: item.size || '',
            color: item.color || '',
            hsn_code: item.hsn_code || '',
            gst_rate: item.gst_rate || 0,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const { error } = await supabase
                .from('items')
                .update(values)
                .eq('id', item.id)

            if (error) throw error

            toast.success('Item updated successfully')
            onOpenChange(false)
            form.reset()
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to update item')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Item</DialogTitle>
                    <DialogDescription>
                        Update item information.
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
                                        <Input {...field} />
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
                                    <FormLabel>SKU</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
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
                                            <Input {...field} />
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
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="cost_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cost Price (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="selling_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Selling Price (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="size"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Size</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="e.g. XL" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="e.g. Red" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="hsn_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>HSN Code</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="e.g. 123456" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gst_rate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GST Rate (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} placeholder="e.g. 18" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
                        <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
