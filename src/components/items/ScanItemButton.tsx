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
    const [scannedData, setScannedData] = useState<{
        sku: string,
        name: string,
        category: string,
        unit: string,
        size: string
    }>({ sku: '', name: '', category: '', unit: '', size: '' })

    const handleScanSuccess = async (code: string) => {
        setIsScanning(false)
        setScannedData({ sku: code, name: '', category: '', unit: '', size: '' })

        toast.info('Fetching product details...')
        try {
            const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`)
            const data = await response.json()

            if (data.status === 1 && data.product) {
                const p = data.product
                const productName = p.product_name || p.product_name_en || p.brands || ''
                let category = ''
                let unit = ''
                let size = ''

                // Try to guess category
                const tags = p.categories_tags || []
                if (Array.isArray(tags)) {
                    // Simple logic: check if any tag string contains one of our known categories
                    const knownCategories = [
                        "Electronics", "Mobile Phones", "Laptops", "Fashion", "Clothing", "Shoes",
                        "Home", "Furniture", "Kitchen", "Health", "Beauty", "Food", "Groceries",
                        "Toys", "Sports", "Automotive", "Office"
                    ]

                    for (const tag of tags) {
                        const t = tag.toLowerCase().replace('en:', '').replace(/-/g, ' ')
                        const match = knownCategories.find(c => t.includes(c.toLowerCase()))
                        if (match) {
                            // Map loose match to specific category if possible
                            // For now we don't auto-set to avoid errors, but logic is here for future expansion
                        }
                    }
                }

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
        } catch (error) {
            console.error('Error fetching product:', error)
            handleNewItem(code, "Offline or unknown item. Ready to add!")
        }

        setShowCreateDialog(true)
    }

    const handleNewItem = (code: string, message: string) => {
        // If code looks like a name (has spaces, letters), use it as name too
        const isText = isNaN(Number(code)) && code.length > 3
        const nameGuess = isText ? code : ''
        // If text, we can use it as name, but for SKU maybe we keep it blank or use generic?
        // Let's use it for SKU too for now as it must be unique.

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
                defaultCategory={scannedData.category}
                defaultUnit={scannedData.unit}
                defaultSize={scannedData.size}
                hideTrigger={true}
            />
        </>
    )
}
