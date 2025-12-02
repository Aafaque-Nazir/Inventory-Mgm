'use client'

import { useState, useEffect } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { Item } from '@/types'

const formSchema = z.object({
    item_id: z.string().min(1, 'Item is required'),
    quantity: z.coerce.number().min(0.01, 'Quantity must be positive'),
    type: z.enum(['IN', 'OUT']),
    reason: z.string().optional(),
})

interface AddStockMovementDialogProps {
    defaultType?: 'IN' | 'OUT'
    defaultReason?: string
    trigger?: React.ReactNode
    title?: string
}

export function AddStockMovementDialog({ defaultType = 'IN', defaultReason = '', trigger, title = 'Add Stock Movement' }: AddStockMovementDialogProps) {
    const [open, setOpen] = useState(false)
    const [items, setItems] = useState<Item[]>([])
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            item_id: '',
            quantity: 0,
            type: defaultType,
            reason: defaultReason,
        },
    })

    useEffect(() => {
        async function fetchItems() {
            const { data } = await supabase.from('items').select('*').order('name')
            if (data) setItems(data)
        }
        if (open) fetchItems()
    }, [open, supabase])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            console.log('Stock movement values:', values)
            const { data: { user } } = await supabase.auth.getUser()

            // Insert stock movement
            const { error: movementError } = await supabase.from('stock_movements').insert({
                item_id: values.item_id,
                quantity: values.quantity,
                type: values.type,
                reason: values.reason || null,
                created_by: user?.id,
            })

            if (movementError) {
                console.error('Movement error:', movementError)
                throw movementError
            }

            // Update item stock
            const item = items.find(i => i.id === values.item_id)
            if (item) {
                const newStock = values.type === 'IN'
                    ? item.current_stock + values.quantity
                    : item.current_stock - values.quantity

                const { error: updateError } = await supabase
                    .from('items')
                    .update({ current_stock: newStock })
                    .eq('id', values.item_id)

                if (updateError) {
                    console.error('Update error:', updateError)
                    throw updateError
                }
            }

            toast.success('Stock movement recorded successfully')
            setOpen(false)
            form.reset()
            router.refresh()
        } catch (error: any) {
            console.error('Stock movement failed:', error)
            toast.error(error.message || 'Failed to record stock movement')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Movement
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Record a stock IN or OUT movement.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="item_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Item</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an item" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {items.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.name} ({item.sku})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="IN">IN</SelectItem>
                                                <SelectItem value="OUT">OUT</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Purchase Order, Sale" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
