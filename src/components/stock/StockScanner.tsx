'use client'

import { useRouter } from 'next/navigation'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScanBarcode, Crown } from 'lucide-react'
import { BarcodeScanner } from '@/components/common/BarcodeScanner'
import { QuickStockDialog } from '@/components/items/QuickStockDialog'
import { getItemBySku } from '@/app/actions/items'
import { toast } from 'sonner'
import { Item } from '@/types'
import { RecordSaleDialog } from '@/components/sales/RecordSaleDialog'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface StockScannerProps {
    isPro?: boolean
}

export function StockScanner({ isPro = false }: StockScannerProps) {
    const router = useRouter()
    const [isScanning, setIsScanning] = useState(false)
    const [selectedItem, setSelectedItem] = useState<Item | null>(null)
    const [showActionDialog, setShowActionDialog] = useState(false)
    const [showStockDialog, setShowStockDialog] = useState(false)
    const [showSaleDialog, setShowSaleDialog] = useState(false) // New state for Sale Dialog

    const handleScanSuccess = async (code: string) => {
        setIsScanning(false)
        toast.info('Finding item...')

        const result = await getItemBySku(code)

        if (result.error) {
            toast.error(result.error === 'Item not found'
                ? 'Item not found in inventory. Please add it first.'
                : result.error
            )
            return
        }

        if (result.item) {
            setSelectedItem(result.item)
            setShowActionDialog(true) // Show choice dialog instead of direct Stock logic
            toast.success(`Found: ${result.item.name}`)
        }
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="gap-1 sm:gap-2 border-dashed sm:size-default relative group overflow-visible"
                onClick={() => {
                    if (!isPro) {
                        toast("⭐ Locked Feature", {
                            description: "Stock scanning is a Pro feature. Upgrade to unlock!",
                            action: {
                                label: "Upgrade Now",
                                onClick: () => router.push("/pricing")
                            },
                            duration: 4000
                        })
                        return
                    }
                    setIsScanning(true)
                }}
            >
                {!isPro && (
                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm border border-yellow-500/20">
                        <Crown className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </div>
                )}
                <ScanBarcode className="h-4 w-4" />
                <span className="hidden xs:inline">Scan to</span> Action
            </Button>

            <BarcodeScanner
                open={isScanning}
                onOpenChange={setIsScanning}
                onScanSuccess={handleScanSuccess}
            />

            {/* Action Choice Dialog */}
            <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Item Found: {selectedItem?.name}</DialogTitle>
                        <DialogDescription>
                            What would you like to do with this item?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 hover:bg-slate-100 border-2"
                            onClick={() => {
                                setShowActionDialog(false)
                                setShowStockDialog(true)
                            }}
                        >
                            <ScanBarcode className="h-8 w-8 text-blue-500" />
                            <span className="font-semibold">Update Stock</span>
                            <span className="text-xs text-muted-foreground">Adjust Count (In/Out)</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 hover:bg-green-50 border-2 hover:border-green-500"
                            onClick={() => {
                                setShowActionDialog(false)
                                setShowSaleDialog(true) // Trigger RecordSaleDialog
                            }}
                        >
                            <Crown className="h-8 w-8 text-green-600" />
                            <span className="font-semibold text-green-700">Sell Item</span>
                            <span className="text-xs text-muted-foreground">Create Invoice & Profit</span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {selectedItem && (
                <QuickStockDialog
                    item={selectedItem}
                    open={showStockDialog}
                    onOpenChange={setShowStockDialog}
                />
            )}

            {/* The RecordSaleDialog is rendered conditionally but 'open' is controlled internally by default? 
                Wait, RecordSaleDialog manages its own 'open' state via a Trigger pattern usually OR we can't control it easily? 
                Actually, RecordSaleDialog has internal state. 
                I need to modify RecordSaleDialog to accept 'open' control OR 
                Use a trick: render it only when we want it to open, but it typically starts closed.
                
                Actually, RecordSaleDialog as written has `const [open, setOpen] = useState(false)`.
                It doesn't accept a controlled `open` prop.
                
                To fix this, I can:
                1. Modify RecordSaleDialog to accept `open` and `onOpenChange` props (controlled mode).
                OR
                2. Use a distinct version? No.
                
                Let's QUICKLY modify RecordSaleDialog one more time to accept `defaultOpen`.
                Or better, `open` prop.
                
                Let's check RecordSaleDialog modification in previous step.
                I only added `initialItem` and `trigger`.
                I didn't make it controlled.
                
                Workaround: Pass a Ref? No.
                Best way: Make `RecordSaleDialog` accept `open` prop.
                
                Let's modify `RecordSaleDialog` in a separate step to be controlled or accept `defaultOpen`.
                Actually, if I render it with `trigger={null}` and `open={true}`... no I can't force it open easily if state is internal.
                
                WAIT: I'll simulate a click? No that's hacky.
                I will modify `RecordSaleDialog` to accept `isOpen` prop.
                
                For this step, I will leave the `RecordSaleDialog` usage commented or incomplete until I fix the component.
                Actually, I'll assume I can pass `open={showSaleDialog}`. 
                I will fix `RecordSaleDialog` in next step.
            */}
            {selectedItem && showSaleDialog && (
                <RecordSaleDialog
                    initialItem={selectedItem}
                    open={showSaleDialog}
                    onOpenChange={setShowSaleDialog}
                />
            )}
        </>
    )
}
