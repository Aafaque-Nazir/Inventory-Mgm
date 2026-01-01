'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface BarcodeScannerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onScanSuccess: (decodedText: string) => void
}

export function BarcodeScanner({ open, onOpenChange, onScanSuccess }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)
    const [scanError, setScanError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            // Initialize scanner when dialog opens
            // Timeout to ensure DOM is ready
            const timer = setTimeout(() => {
                // Clear previous instance if any
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(console.error)
                }

                const scanner = new Html5QrcodeScanner(
                    "reader",
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        formatsToSupport: [
                            Html5QrcodeSupportedFormats.EAN_13,
                            Html5QrcodeSupportedFormats.EAN_8,
                            Html5QrcodeSupportedFormats.CODE_128,
                            Html5QrcodeSupportedFormats.CODE_39,
                            Html5QrcodeSupportedFormats.UPC_A
                        ]
                    },
                    /* verbose= */ false
                )

                scanner.render(
                    (decodedText) => {
                        // Success
                        onScanSuccess(decodedText)
                        onOpenChange(false)
                        scanner.clear().catch(console.error)
                        toast.success(`Scanned: ${decodedText}`)
                    },
                    (errorMessage) => {
                        // Error (ignore mostly as it fires on every frame without code)
                        // console.log(errorMessage)
                    }
                )

                scannerRef.current = scanner
            }, 100)

            return () => clearTimeout(timer)
        } else {
            // Cleanup when dialog closes
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error)
                scannerRef.current = null
            }
        }
    }, [open, onOpenChange, onScanSuccess])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Scan Barcode</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4">
                    <div id="reader" className="w-full max-w-[400px]"></div>
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                        Point your camera at a barcode to scan.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
