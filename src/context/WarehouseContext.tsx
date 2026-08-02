'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { setWarehouseCookie } from '@/app/actions/warehouse-cookie'
import { useRouter } from 'next/navigation'

interface Location {
    id: string
    name: string
    is_default: boolean
}

interface WarehouseContextType {
    selectedWarehouseId: string | null
    locations: Location[]
    selectWarehouse: (id: string | null) => void
    isLoading: boolean
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined)

export function WarehouseProvider({ children }: { children: React.ReactNode }) {
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null)
    const [locations, setLocations] = useState<Location[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    // Load initial state (cookie logic handled server-side mostly, but client needs to know list)
    useEffect(() => {
        async function loadLocations() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single()

            if (!profile?.organization_id) return

            const { data: locs } = await supabase
                .from('locations')
                .select('id, name, is_default')
                .eq('organization_id', profile.organization_id)
                .order('is_default', { ascending: false })
                .order('name')

            if (locs) {
                setLocations(locs)
                // Try to find existing cookie value from document.cookie for initial client state
                const match = document.cookie.match(/(^|;)\s*warehouse_id=([^;]+)/)
                const cookieId = match ? match[2] : null

                if (cookieId && locs.find(l => l.id === cookieId)) {
                    setSelectedWarehouseId(cookieId)
                } else if (locs.length > 0) {
                    // Default to first one (Main Warehouse usually)
                    const defaultLoc = locs.find(l => l.is_default) || locs[0]
                    setSelectedWarehouseId(defaultLoc.id)
                    // Set cookie if missing
                    if (!cookieId) {
                        setWarehouseCookie(defaultLoc.id)
                    }
                }
            }
            setIsLoading(false)
        }
        loadLocations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const selectWarehouse = async (id: string | null) => {
        setSelectedWarehouseId(id)
        if (id) {
            await setWarehouseCookie(id)
            router.refresh() // Refresh server components to respect new cookie
        }
    }

    return (
        <WarehouseContext.Provider value={{ selectedWarehouseId, locations, selectWarehouse, isLoading }}>
            {children}
        </WarehouseContext.Provider>
    )
}

export function useWarehouse() {
    const context = useContext(WarehouseContext)
    if (context === undefined) {
        throw new Error('useWarehouse must be used within a WarehouseProvider')
    }
    return context
}
