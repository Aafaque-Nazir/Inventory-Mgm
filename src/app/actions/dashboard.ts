'use server'

import { createClient } from '@/lib/supabase/server'
import { getWarehouseCookie } from './warehouse-cookie'
import { addDays, format, subDays } from 'date-fns'

export interface DashboardMetric {
    label: string
    value: number
    change?: number
    trend?: 'up' | 'down' | 'neutral'
}

export type ChartData = {
    date: string
    revenue: number
    orders: number
}[]

import { getCurrentProfile } from '@/lib/auth'

export async function getDashboardMetrics(orgId?: string | null, wId?: string | null) {
    const supabase = await createClient()
    let organizationId = orgId

    if (!organizationId) {
        const profile = await getCurrentProfile()
        organizationId = profile?.organization_id || null
    }

    if (!organizationId) return null

    const warehouseId = wId !== undefined ? wId : await getWarehouseCookie()

    // 1. Fetch Item Stats
    let itemsCount = 0
    let lowStockCount = 0
    let totalStockValue = 0

    if (warehouseId) {
        // Local Scope
         const { data: stockItems } = await supabase
            .from('item_stock')
            .select(`
                quantity,
                item:items (id, min_stock, cost_price, selling_price)
            `)
            .eq('location_id', warehouseId)
        
        if (stockItems) {
            itemsCount = stockItems.length
            lowStockCount = stockItems.filter(i => i.quantity < ((i.item as any)?.min_stock || 0)).length
            totalStockValue = stockItems.reduce((acc, curr) => {
                const item = curr.item as any
                const unitPrice = item?.selling_price || item?.cost_price || 0
                return acc + (curr.quantity * unitPrice)
            }, 0)
        }

    } else {
        // Global Scope
        const { data: allItems } = await supabase
            .from('items')
            .select('current_stock, min_stock, cost_price, selling_price')
            .eq('organization_id', organizationId)
        
        if (allItems) {
            itemsCount = allItems.length
            lowStockCount = allItems.filter(i => (i.current_stock || 0) < (i.min_stock || 0)).length
            totalStockValue = allItems.reduce((acc, curr) => {
                const unitPrice = curr.selling_price || curr.cost_price || 0
                return acc + ((curr.current_stock || 0) * unitPrice)
            }, 0)
        }
    }

    return {
        itemsCount,
        lowStockCount,
        totalStockValue,
    }
}

export async function getRevenueChartData(period: '7d' | '30d' = '7d', orgId?: string | null): Promise<ChartData> {
    const supabase = await createClient()
    let organizationId = orgId

    if (!organizationId) {
        const profile = await getCurrentProfile()
        organizationId = profile?.organization_id || null
    }

    if (!organizationId) return []

    const days = period === '30d' ? 30 : 7
    const startDate = subDays(new Date(), days)

    // Fetch invoices in range
    const { data: invoices } = await supabase
        .from('invoices')
        .select(`created_at, total_amount`)
        .eq('organization_id', organizationId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })
    
    // Group by day
    const groupedData = new Map<string, { revenue: number, orders: number }>()

    // Initialize all days
    for (let i = 0; i <= days; i++) {
        const d = addDays(startDate, i)
        const dateKey = format(d, 'MMM dd')
        groupedData.set(dateKey, { revenue: 0, orders: 0 })
    }

    // Populate actuals
    invoices?.forEach(inv => {
        const dateKey = format(new Date(inv.created_at), 'MMM dd')
        const current = groupedData.get(dateKey) || { revenue: 0, orders: 0 }
        groupedData.set(dateKey, {
            revenue: current.revenue + (inv.total_amount || 0),
            orders: current.orders + 1
        })
    })

    return Array.from(groupedData.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders
    }))
}
