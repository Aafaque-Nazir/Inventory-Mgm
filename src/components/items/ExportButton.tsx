'use client'

import { Button } from '@/components/ui/button'
import { Download, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ExportButtonProps {
    items: any[]
    isPro: boolean
}

export function ExportButton({ items, isPro }: ExportButtonProps) {
    const router = useRouter()

    const handleExport = () => {
        if (!isPro) {
            toast.error("Export is a PRO feature. Please upgrade.")
            router.push('/pricing')
            return
        }

        if (!items || items.length === 0) {
            toast.error("No items to export")
            return
        }

        // Convert key-value pairs to CSV
        // 1. Get headers
        const headers = ['Name', 'SKU', 'Category', 'Unit', 'Current Stock', 'Min Stock', 'Price']
        const csvContent = [
            headers.join(','),
            ...items.map(item => [
                `"${item.name}"`,
                `"${item.sku}"`,
                `"${item.category || ''}"`,
                `"${item.unit}"`,
                item.current_stock,
                item.min_stock,
                item.price || 0
            ].join(','))
        ].join('\n')

        // Create Blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Button
            variant="outline"
            onClick={handleExport}
            className={!isPro ? "opacity-70" : ""}
        >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
            {!isPro && <Crown className="ml-2 h-4 w-4 text-amber-500 fill-amber-500" />}
        </Button>
    )
}
