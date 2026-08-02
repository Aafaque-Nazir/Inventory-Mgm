'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { PackageCheck } from 'lucide-react'
import { PurchaseOrderItem } from '@/types'

export function ReceiveOrderButton({ orderId, items }: { orderId: string; items: PurchaseOrderItem[] }) {
    const router = useRouter()
    const supabase = createClient()

    async function handleReceive() {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // Update order status
            const { error: orderError } = await supabase
                .from('purchase_orders')
                .update({ status: 'RECEIVED' })
                .eq('id', orderId)

            if (orderError) throw orderError

            // Create stock movements and update inventory
            for (const item of items) {
                // Create stock movement
                await supabase.from('stock_movements').insert({
                    item_id: item.item_id,
                    quantity: item.quantity,
                    type: 'IN',
                    reason: `Purchase Order ${orderId.slice(0, 8)}`,
                    reference_id: orderId,
                    created_by: user?.id,
                })

                // Update item stock
                const { data: currentItem } = await supabase
                    .from('items')
                    .select('current_stock')
                    .eq('id', item.item_id)
                    .single()

                if (currentItem) {
                    await supabase
                        .from('items')
                        .update({
                            current_stock: currentItem.current_stock + item.quantity
                        })
                        .eq('id', item.item_id)
                }
            }

            toast.success('Purchase order received and stock updated')
            router.refresh()
        } catch (_error) {
            toast.error('Failed to receive order')
        }
    }

    return (
        <Button onClick={handleReceive} variant="default">
            <PackageCheck className="mr-2 h-4 w-4" /> Mark as Received
        </Button>
    )
}
