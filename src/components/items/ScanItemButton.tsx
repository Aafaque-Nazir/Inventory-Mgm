'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScanBarcode } from 'lucide-react'
import { BarcodeScanner } from '@/components/common/BarcodeScanner'
import { CreateItemDialog } from './CreateItemDialog'
import { toast } from 'sonner'

export function ScanItemButton() {
    const [isScanning, setIsScanning] = useState(false)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [scannedData, setScannedData] = useState<{ sku: string, name: string }>({ sku: '', name: '' })

    const handleScanSuccess = async (code: string) => {
        setIsScanning(false)
        setScannedData({ sku: code, name: '' })

        // Optional: Fetch details here too if we want to pre-fill before opening
        toast.info('Fetching product details...')
        try {
            const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`)
            const data = await response.json()

            if (data.status === 1 && data.product) {
                const productName = data.product.product_name || data.product.product_name_en
                if (productName) {
                    setScannedData({ sku: code, name: productName })
                    toast.success('Product found: ' + productName)
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error)
        }

        setShowCreateDialog(true)
    }

    return (
        <>
            <Button
                onClick={() => setIsScanning(true)}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
                <ScanBarcode className="h-4 w-4" />
                Scan to Add
            </Button>

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
            />
        </>
    )
}
