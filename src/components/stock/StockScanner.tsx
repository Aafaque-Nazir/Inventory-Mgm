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

interface StockScannerProps {
    isPro?: boolean
}

export function StockScanner({ isPro = false }: StockScannerProps) {
    const router = useRouter()
    const [isScanning, setIsScanning] = useState(false)
    const [selectedItem, setSelectedItem] = useState<Item | null>(null)
    const [showStockDialog, setShowStockDialog] = useState(false)

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
            setShowStockDialog(true)
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
                <span className="hidden xs:inline">Scan to</span> Update
            </Button>

            <BarcodeScanner
                open={isScanning}
                onOpenChange={setIsScanning}
                onScanSuccess={handleScanSuccess}
            />

            {selectedItem && (
                <QuickStockDialog
                    item={selectedItem}
                    open={showStockDialog}
                    onOpenChange={setShowStockDialog}
                />
            )}
        </>
    )
}
