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
    const _router = useRouter()

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
            <div className="flex items-center gap-2 px-2.5 py-1.5 border rounded-md bg-muted/50 w-[110px] xs:w-[140px] sm:w-[160px] md:w-[200px] h-9 shrink-0">
                <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground truncate">Switching...</span>
            </div>
        )
    }

    if (locations.length === 0) return null

    return (
        <Select value={selectedWarehouseId || ''} onValueChange={handleSelect}>
            <SelectTrigger className="w-[110px] xs:w-[140px] sm:w-[160px] md:w-[200px] h-9 border-dashed overflow-hidden shrink-0 px-2 sm:px-3">
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden w-full">
                    <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-left text-xs sm:text-sm flex-1"><SelectValue placeholder="Warehouse" /></span>
                </div>
            </SelectTrigger>
            <SelectContent>
                {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                        <div className="flex items-center justify-between w-full gap-2">
                            <span className="truncate">{loc.name}</span>
                            {loc.is_default && (
                                <span className="text-[10px] shrink-0 text-muted-foreground uppercase border px-1 rounded hidden sm:inline-block">Default</span>
                            )}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

