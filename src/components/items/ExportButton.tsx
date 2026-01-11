'use client'

import { Button } from '@/components/ui/button'
import { Download, Crown, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'

interface ExportButtonProps {
    items: any[]
    isPro: boolean
}

export function ExportButton({ items, isPro }: ExportButtonProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [dateRange, setDateRange] = useState('lifetime') // lifetime, 30, 60

    const handleClick = () => {
        if (!isPro) {
            toast.error("Export is a PRO feature. Please upgrade.")
            router.push('/pricing')
            return
        }
        setOpen(true)
    }

    const executeExport = () => {
        if (!items || items.length === 0) {
            toast.error("No items to export")
            return
        }

        // Filter Items
        let filteredItems = [...items]
        const now = new Date()

        if (dateRange === '30') {
            const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
            filteredItems = items.filter(item => new Date(item.created_at) >= thirtyDaysAgo)
        } else if (dateRange === '60') {
            const sixtyDaysAgo = new Date(now.setDate(now.getDate() - 60))
            filteredItems = items.filter(item => new Date(item.created_at) >= sixtyDaysAgo)
        }

        if (filteredItems.length === 0) {
            toast.warning("No items found for the selected date range.")
            return
        }

        // Convert key-value pairs to CSV
        // 1. Get headers
        const headers = ['Name', 'SKU', 'Category', 'Unit', 'Current Stock', 'Min Stock', 'Cost Price', 'Selling Price', 'Size', 'Color', 'Created At']
        const csvContent = [
            headers.join(','),
            ...filteredItems.map(item => [
                `"${item.name}"`,
                `"${item.sku}"`,
                `"${item.category || ''}"`,
                `"${item.unit}"`,
                item.current_stock,
                item.min_stock,
                item.cost_price || 0,
                item.selling_price || 0,
                `"${item.size || ''}"`,
                `"${item.color || ''}"`,
                `"${item.created_at || ''}"`
            ].join(','))
        ].join('\n')

        // Create Blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `inventory_export_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setOpen(false)
        toast.success(`Exported ${filteredItems.length} items`)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    onClick={(e) => {
                        if (!isPro) {
                            e.preventDefault()
                            handleClick()
                        }
                    }}
                    className={!isPro ? "opacity-70" : "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white rounded-xl backdrop-blur-sm transition-all"}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                    {!isPro && <Crown className="ml-2 h-4 w-4 text-amber-500 fill-amber-500" />}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Export Inventory</DialogTitle>
                    <DialogDescription>
                        Select a date range to filter your export.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="range" className="text-right">
                            Range
                        </Label>
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="lifetime">Lifetime (All Items)</SelectItem>
                                <SelectItem value="30">Last 30 Days</SelectItem>
                                <SelectItem value="60">Last 60 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={executeExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Download CSV
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
