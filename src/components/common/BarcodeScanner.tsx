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
                // Check for secure context
                if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                    setScanError("Camera access requires a Secure Context (HTTPS). If testing on mobile via IP, please enable 'Insecure origins treated as secure' in chrome://flags or use localhost.")
                    // Don't return, let it try, but the error helps
                } else {
                    setScanError(null)
                }

                // Clear previous instance if any
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(console.error)
                }

                try {
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
                            // Error
                        }
                    )
                    scannerRef.current = scanner
                } catch (e) {
                    console.error("Scanner init error:", e)
                    setScanError("Failed to initialize camera. Ensure permissions are granted.")
                }
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
                    {scanError && (
                        <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                            {scanError}
                        </div>
                    )}
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
