'use client'

import { useWarehouse } from '@/context/WarehouseContext'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Store, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'


export function WarehouseSwitcher() {
    const [isSwitching, setIsSwitching] = useState(false)
    const { locations, selectedWarehouseId, selectWarehouse, isLoading } = useWarehouse()
    const router = useRouter()

    const handleSelect = async (value: string) => {
        setIsSwitching(true)
        await selectWarehouse(value)
        // The router.refresh() in selectWarehouse is async but doesn't return a promise that resolves when refresh is done.
        // However, usually we can just show the state.
        // For better UX, we can unset it after a timeout or rely on the page reload behavior (if it was a real nav).
        // Since it's a refresh, the component might re-render.
        // Let's keep it simple: set switching, let the context handler do the refresh.
        setTimeout(() => setIsSwitching(false), 2000) // Fallback reset
    }

    if (isLoading || isSwitching) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50 w-[200px] h-9">
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                <span className="text-sm text-muted-foreground">Switching...</span>
            </div>
        )
    }

    if (locations.length === 0) return null

    return (
        <Select value={selectedWarehouseId || ''} onValueChange={handleSelect}>
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

