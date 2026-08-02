'use client'

import { useState, useEffect, useTransition } from 'react'
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
import { Plus, Loader2 } from 'lucide-react'
import { Item } from '@/types'
import { recordStockMovement } from '@/app/actions/stock'

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
    const [isPending, startTransition] = useTransition()
    const _router = useRouter()
    const supabase = createClient()

    const form = useForm<unknown>({
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
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single()

            if (profile?.organization_id) {
                // 1. Fetch Items
                const { data: allItems } = await supabase
                    .from('items')
                    .select('*')
                    .eq('organization_id', profile.organization_id)
                    .order('name')

                if (!allItems) return

                // Fetch warehouse cookie dynamically using server action

                const { getWarehouseCookie } = await import('@/app/actions/warehouse-cookie')
                const warehouseId = await getWarehouseCookie()

                let finalItems = allItems

                if (warehouseId) {
                    const { data: stockData } = await supabase
                        .from('item_stock')
                        .select('item_id, quantity')
                        .eq('location_id', warehouseId)
                        .in('item_id', allItems.map(i => i.id))

                    finalItems = allItems.map(item => {
                        const stockEntry = stockData?.find(s => s.item_id === item.id)
                        return {
                            ...item,
                            current_stock: stockEntry ? stockEntry.quantity : 0
                        }
                    })
                }

                setItems(finalItems)
            }
        }
        if (open) fetchItems()
    }, [open, supabase])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData()
        formData.append('item_id', values.item_id)
        formData.append('quantity', values.quantity.toString())
        formData.append('type', values.type)
        if (values.reason) formData.append('reason', values.reason)

        startTransition(async () => {
            const result = await recordStockMovement({}, formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(result.message)
                setOpen(false)
                form.reset()
            }
        })
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
                        {defaultType === 'OUT'
                            ? "Record usage or sale. Alerts will be sent if stock gets low."
                            : "Add new stock received from suppliers."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="item_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex justify-between items-center">
                                        Item
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an item" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {items.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.name} (Stock: {item.current_stock})
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
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
