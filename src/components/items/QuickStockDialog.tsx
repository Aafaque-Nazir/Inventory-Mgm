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
import { Item } from '@/types'

const formSchema = z.object({
    quantity: z.coerce.number().min(0.01, 'Quantity must be positive'),
    type: z.enum(['IN', 'OUT']),
    reason: z.string().optional(),
})

interface QuickStockDialogProps {
    item: Item
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function QuickStockDialog({ item, open, onOpenChange }: QuickStockDialogProps) {
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: 0,
            type: 'IN',
            reason: '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // Insert stock movement
            const { error: movementError } = await supabase.from('stock_movements').insert({
                item_id: item.id,
                quantity: values.quantity,
                type: values.type,
                reason: values.reason,
                created_by: user?.id,
            })

            if (movementError) throw movementError

            // Update item stock
            const newStock = values.type === 'IN'
                ? item.current_stock + values.quantity
                : item.current_stock - values.quantity

            const { error: updateError } = await supabase
                .from('items')
                .update({ current_stock: newStock })
                .eq('id', item.id)

            if (updateError) throw updateError

            toast.success('Stock updated successfully')
            onOpenChange(false)
            form.reset()
            router.refresh()
        } catch (error: any) {
            console.error('Stock movement error:', error)
            toast.error(error.message || 'Failed to update stock')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Quick Stock Update</DialogTitle>
                    <DialogDescription>
                        Adjust stock for {item.name} (Current: {item.current_stock} {item.unit})
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                                <SelectItem value="IN">IN (Add)</SelectItem>
                                                <SelectItem value="OUT">OUT (Remove)</SelectItem>
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
                                        <Input placeholder="e.g., Sale, Damage, Adjustment" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Update Stock</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
