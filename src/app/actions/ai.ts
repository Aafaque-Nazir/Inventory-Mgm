'use server'

import { createClient } from '@/lib/supabase/server'

export interface AiInsight {
    type: 'RISK' | 'OPPORTUNITY' | 'SEASONAL' | 'WARNING' | 'ACHIEVEMENT'
    title: string
    description: string
    metric?: string
    action?: string
    color: 'red' | 'green' | 'blue' | 'yellow' | 'purple'
    priority: number
}



import { getCurrentProfile } from '@/lib/auth'

export async function getAiInsights(orgIdParam?: string | null): Promise<AiInsight[]> {
    const supabase = await createClient()
    let orgId = orgIdParam

    if (!orgId) {
        const profile = await getCurrentProfile()
        orgId = profile?.organization_id || null
    }

    if (!orgId) return []

    // 2. Fetch Data (Last 30 Days) concurrently
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [itemsRes, movementsRes] = await Promise.all([
        supabase
            .from('items')
            .select('id, name, current_stock, min_stock, category, cost_price, selling_price')
            .eq('organization_id', orgId),
        supabase
            .from('stock_movements')
            .select('item_id, quantity, type, created_at, items:item_id(category)')
            .eq('organization_id', orgId)
            .in('type', ['OUT', 'SALE'])
            .gte('created_at', thirtyDaysAgo.toISOString())
    ])

    const rawItems = itemsRes.data
    const movements = movementsRes.data

    const items = (rawItems || []).map(item => ({
        ...item,
        quantity: item.current_stock ?? 0,
        low_stock_threshold: item.min_stock ?? 0
    }))

    if (!items || !movements || items.length === 0) return []



    // --- FALLBACK ALGORITHM ---
    return generateHardcodedInsights(items, movements)
}

function generateHardcodedInsights(items: any[], movements: any[]): AiInsight[] {
    const insights: AiInsight[] = []

    // Calculate daily consumption for each item
    const itemUsage: Record<string, number> = {}
    movements.forEach(m => {
        itemUsage[m.item_id] = (itemUsage[m.item_id] || 0) + m.quantity
    })

    const atRiskItems = []
    const overstockedItems = []
    let deadStockValue = 0
    const deadStockItems = []
    const highMarginRisks = []

    for (const item of items) {
        const totalUsed30Days = itemUsage[item.id] || 0
        const dailyVelocity = totalUsed30Days / 30
        const profitMargin = item.selling_price && item.selling_price > 0
            ? ((item.selling_price - (item.cost_price || 0)) / item.selling_price)
            : 0

        if (dailyVelocity > 0) {
            const daysRemaining = item.quantity / dailyVelocity

            if (daysRemaining < 7) {
                atRiskItems.push({ name: item.name, days: Math.ceil(daysRemaining) })
            }

            if (profitMargin > 0.4 && daysRemaining < 14 && daysRemaining >= 7) {
                highMarginRisks.push({ name: item.name, margin: Math.round(profitMargin * 100), days: Math.ceil(daysRemaining) })
            }

            if (daysRemaining > 90 && item.quantity > 50) {
                const excessValue = (item.quantity - (dailyVelocity * 30)) * (item.cost_price || 0)
                overstockedItems.push({ name: item.name, excessValue })
            }
        } else if (item.quantity > 0) {
            deadStockValue += (item.quantity * (item.cost_price || 0))
            deadStockItems.push(item.name)
        }
    }

    if (atRiskItems.length > 0) {
        const topRisk = atRiskItems.sort((a, b) => a.days - b.days)[0]
        insights.push({
            type: 'RISK',
            title: 'Running Out of Stock',
            description: `'${topRisk.name}' is selling quickly and will run out in approx. ${topRisk.days} days.`,
            metric: 'Urgent',
            action: 'Reorder Now',
            color: 'red',
            priority: 1
        })
    }

    if (highMarginRisks.length > 0) {
        const topMarginRisk = highMarginRisks.sort((a, b) => a.days - b.days)[0]
        insights.push({
            type: 'OPPORTUNITY',
            title: 'Top Seller Running Low',
            description: `'${topMarginRisk.name}' (${topMarginRisk.margin}% margin) has only ${topMarginRisk.days} days of stock remaining.`,
            metric: 'High Margin',
            action: 'Restock Soon',
            color: 'green',
            priority: 2
        })
    }

    if (overstockedItems.length > 0) {
        const topOverstock = overstockedItems.sort((a, b) => b.excessValue - a.excessValue)[0]
        if (topOverstock.excessValue > 0) {
            insights.push({
                type: 'WARNING',
                title: 'Excess Stock Alert',
                description: `'${topOverstock.name}' has excess units. Normalizing to 30 days can recover ₹${Math.round(topOverstock.excessValue).toLocaleString()} in cash flow.`,
                metric: 'Overstocked',
                action: 'Manage Stock',
                color: 'purple',
                priority: 3
            })
        }
    }

    if (deadStockItems.length > 0 && deadStockValue > 0) {
        insights.push({
            type: 'WARNING',
            title: 'Slow Moving Stock',
            description: `${deadStockItems.length} items have had no sales in 30 days (₹${Math.round(deadStockValue).toLocaleString()} total value).`,
            metric: 'No Movement',
            action: 'Review Items',
            color: 'yellow',
            priority: 4
        })
    }

    const categoryVelocity: Record<string, number> = {}
    movements.forEach(m => {
        const cat = (m.items as any)?.category || 'Uncategorized'
        categoryVelocity[cat] = (categoryVelocity[cat] || 0) + m.quantity
    })

    const topCategory = Object.entries(categoryVelocity).sort(([, a], [, b]) => b - a)[0]
    const month = new Date().getMonth()
    const seasons = ['Winter', 'Winter', 'Spring', 'Spring', 'Summer', 'Summer', 'Monsoon', 'Monsoon', 'Autumn', 'Autumn', 'Winter', 'Winter']
    const currentSeason = seasons[month]

    if (topCategory && topCategory[1] > 0) {
        insights.push({
            type: 'SEASONAL',
            title: `Top Selling Category (${currentSeason})`,
            description: `'${topCategory[0]}' is currently your most active category. Keep items in this category well-stocked.`,
            metric: 'Top Category',
            color: 'blue',
            priority: 5
        })
    }

    return insights.sort((a, b) => a.priority - b.priority).slice(0, 3)
}
