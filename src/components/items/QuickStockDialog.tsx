'use client'

import { useTransition, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { recordStockMovement } from '@/app/actions/stock'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
    quantity: z.coerce.number().min(0.01, 'Quantity must be positive'),
    type: z.enum(['IN', 'OUT']),
    reason: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface QuickStockDialogProps {
    item: Item
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultType?: 'IN' | 'OUT'
}

export function QuickStockDialog({ item, open, onOpenChange, defaultType = 'IN' }: QuickStockDialogProps) {
    const [isPending, startTransition] = useTransition()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: 0,
            type: defaultType,
            reason: '',
        },
    })

    // Reset form when dialog opens or defaultType changes
    useEffect(() => {
        if (open) {
            form.reset({
                quantity: 0,
                type: defaultType,
                reason: '',
            })
        }
    }, [open, defaultType, form])

    async function onSubmit(values: FormValues) {
        const formData = new FormData()
        formData.append('item_id', item.id)
        formData.append('quantity', values.quantity.toString())
        formData.append('type', values.type)
        if (values.reason) formData.append('reason', values.reason)

        startTransition(async () => {
            const result = await recordStockMovement({}, formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(result.message)
                onOpenChange(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Quick Stock Update</DialogTitle>
                    <DialogDescription>
                        Adjust stock for {item.name}. Current: {item.current_stock} {item.unit}
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Stock
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
