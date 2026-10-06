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
    trigger?: React.ReactNode
}

export function StockScanner({ isPro = false, trigger }: StockScannerProps) {
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
            {trigger ? (
                <div onClick={() => setIsScanning(true)} className="inline-block cursor-pointer">
                    {trigger}
                </div>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 sm:gap-2 border-dashed sm:size-default relative group overflow-visible"
                    onClick={() => setIsScanning(true)}
                >
                    <ScanBarcode className="h-4 w-4" />
                    <span className="hidden xs:inline">Scan to</span> Action
                </Button>
            )}

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
                            className="h-24 flex flex-col gap-2 hover:bg-emerald-500/10 border hover:border-emerald-500/30"
                            onClick={() => {
                                setShowActionDialog(false)
                                setShowStockDialog(true)
                            }}
                        >
                            <ScanBarcode className="h-8 w-8 text-emerald-400" />
                            <span className="font-semibold text-white">Update Stock</span>
                            <span className="text-xs text-slate-400">Adjust Count (In/Out)</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 hover:bg-emerald-500/10 border hover:border-emerald-500/30"
                            onClick={() => {
                                setShowActionDialog(false)
                                setShowSaleDialog(true) // Trigger RecordSaleDialog
                            }}
                        >
                            <Crown className="h-8 w-8 text-emerald-400" />
                            <span className="font-semibold text-emerald-400">Sell Item</span>
                            <span className="text-xs text-slate-400">Create Invoice & Profit</span>
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

            {/* RecordSaleDialog — controlled mode */}
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
