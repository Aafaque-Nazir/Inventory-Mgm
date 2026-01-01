'use client'

import { useWarehouse } from '@/context/WarehouseContext'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Store } from 'lucide-react'

export function WarehouseSwitcher() {
    const { locations, selectedWarehouseId, selectWarehouse, isLoading } = useWarehouse()

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50 animate-pulse w-[180px]">
                <Store className="h-4 w-4 text-muted-foreground" />
                <div className="h-4 w-20 bg-muted-foreground/20 rounded"></div>
            </div>
        )
    }

    if (locations.length === 0) return null

    return (
        <Select value={selectedWarehouseId || ''} onValueChange={selectWarehouse}>
            <SelectTrigger className="w-[200px] h-9 border-dashed">
                <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select Warehouse" />
                </div>
            </SelectTrigger>
            <SelectContent>
                {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                        <span className="flex items-center gap-2">
                            {loc.name}
                            {loc.is_default && (
                                <span className="ml-1 text-[10px] text-muted-foreground uppercase border px-1 rounded">Default</span>
                            )}
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
