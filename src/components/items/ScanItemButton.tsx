'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScanBarcode, Crown } from 'lucide-react'
import { BarcodeScanner } from '@/components/common/BarcodeScanner'
import { CreateItemDialog } from './CreateItemDialog'
import { QuickStockDialog } from '@/components/items/QuickStockDialog'
import { getItemBySku } from '@/app/actions/items'
import { toast } from 'sonner'
import type { Item } from '@/types'

import { useRouter } from 'next/navigation'

interface ScanItemButtonProps {
    isPro?: boolean
    trigger?: React.ReactNode
}

export function ScanItemButton({ isPro = false, trigger }: ScanItemButtonProps) {
    const router = useRouter()
    const [isScanning, setIsScanning] = useState(false)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showStockDialog, setShowStockDialog] = useState(false)
    const [existingItem, setExistingItem] = useState<Item | null>(null)

    const [scannedData, setScannedData] = useState<{
        sku: string,
        name: string,
        category: string,
        unit: string,
        size: string
    }>({ sku: '', name: '', category: '', unit: '', size: '' })

    const handleScanSuccess = async (code: string) => {
        setIsScanning(false)

        // 1. Check if item already exists
        toast.info('Checking inventory...')
        const existingResult = await getItemBySku(code)

        if (existingResult.item) {
            toast.success(`Item found: ${existingResult.item.name}`)
            setExistingItem(existingResult.item)
            setShowStockDialog(true)
            return
        }

        // 2. If not found, fetch details for creation
        setScannedData({ sku: code, name: '', category: '', unit: '', size: '' })
        toast.info('Fetching product details...')

        try {
            const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`)
            const data = await response.json()

            if (data.status === 1 && data.product) {
                const p = data.product
                const productName = p.product_name || p.product_name_en || p.brands || ''
                const _category = ''
                let unit = ''
                let size = ''

                // Try to extract quantity/unit
                if (p.quantity) {
                    const q = p.quantity.toLowerCase()
                    if (q.includes('ml')) { unit = 'ml'; size = p.quantity }
                    else if (q.includes('l') || q.includes('liter')) { unit = 'ltr (liter)'; size = p.quantity }
                    else if (q.includes('kg')) { unit = 'kg'; size = p.quantity }
                    else if (q.includes('mg')) { unit = 'mg'; size = p.quantity }
                    else if (q.includes('g') && !q.includes('kg')) { unit = 'g'; size = p.quantity }
                    else { size = p.quantity }
                }

                if (productName) {
                    setScannedData({
                        sku: code,
                        name: productName,
                        category: '',
                        unit,
                        size
                    })
                    toast.success('Product found: ' + productName)
                } else {
                    handleNewItem(code, "Details not found online. Ready to create!")
                }
            } else {
                handleNewItem(code, "New item detected! Enter details.")
            }
        } catch (error: any) {
            console.error('Error fetching product:', error)
            handleNewItem(code, "Offline or unknown item. Ready to add!")
        }

        setShowCreateDialog(true)
    }

    const handleNewItem = (code: string, message: string) => {
        // If code looks like a name (has spaces, letters), use it as name too
        const isText = isNaN(Number(code)) && code.length > 3
        const nameGuess = isText ? code : ''

        setScannedData({
            sku: code,
            name: nameGuess,
            category: '',
            unit: '',
            size: ''
        })
        toast.info(message)
    }

    return (
        <>
            {trigger ? (
                <div onClick={() => setIsScanning(true)} className="inline-block cursor-pointer">
                    {trigger}
                </div>
            ) : (
                <Button
                    onClick={() => setIsScanning(true)}
                    className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold shadow-lg shadow-emerald-500/20 relative group overflow-visible"
                >
                    <ScanBarcode className="h-4 w-4" />
                    <span className="hidden xs:inline">Scan to Add</span>
                    <span className="xs:hidden">Scan</span>
                </Button>
            )}

            <BarcodeScanner
                open={isScanning}
                onOpenChange={setIsScanning}
                onScanSuccess={handleScanSuccess}
            />

            <CreateItemDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                defaultSku={scannedData.sku}
                defaultName={scannedData.name}
                defaultCategory={scannedData.category}
                defaultUnit={scannedData.unit}
                defaultSize={scannedData.size}
                hideTrigger={true}
            />

            {existingItem && (
                <QuickStockDialog
                    item={existingItem}
                    open={showStockDialog}
                    onOpenChange={setShowStockDialog}
                />
            )}
        </>
    )
}
