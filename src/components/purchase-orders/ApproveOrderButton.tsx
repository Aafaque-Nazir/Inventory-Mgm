'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Check } from 'lucide-react'

export function ApproveOrderButton({ orderId }: { orderId: string }) {
    const router = useRouter()
    const supabase = createClient()

    async function handleApprove() {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            const { error } = await supabase
                .from('purchase_orders')
                .update({
                    status: 'APPROVED',
                    approved_by: user?.id,
                })
                .eq('id', orderId)

            if (error) throw error

            toast.success('Purchase order approved')
            router.refresh()
        } catch (_error: any) {
            toast.error('Failed to approve order')
        }
    }

    return (
        <Button onClick={handleApprove}>
            <Check className="mr-2 h-4 w-4" /> Approve
        </Button>
    )
}
