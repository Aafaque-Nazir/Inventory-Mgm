'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteSupplierDialogProps {
    supplierId: string
    supplierName: string
}

export function DeleteSupplierDialog({ supplierId, supplierName }: DeleteSupplierDialogProps) {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function onDelete() {
        try {
            const { error } = await supabase
                .from('suppliers')
                .delete()
                .eq('id', supplierId)

            if (error) throw error

            toast.success('Supplier deleted successfully')
            router.refresh()
            setOpen(false)
        } catch (err: any) {
            const error = err as Error;
            console.error('Delete supplier error:', error)
            toast.error(error.message || 'Failed to delete supplier. They may have linked purchase orders.')
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Supplier?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete {supplierName}? This action cannot be undone.
                        If this supplier is linked to existing Purchase Orders, you might not be able to delete them.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
