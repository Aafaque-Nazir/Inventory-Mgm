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



export async function getAiInsights(): Promise<AiInsight[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // 1. Get Organization ID
    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile?.organization_id) return []
    const orgId = profile.organization_id

    // 2. Fetch Data (Last 30 Days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: items } = await supabase
        .from('items')
        .select('id, name, quantity, low_stock_threshold, category, cost_price, selling_price')
        .eq('organization_id', orgId)

    const { data: movements } = await supabase
        .from('stock_movements')
        .select('item_id, quantity, type, created_at, items:item_id(category)')
        .eq('organization_id', orgId)
        .in('type', ['OUT', 'SALE'])
        .gte('created_at', thirtyDaysAgo.toISOString())

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
            title: 'Critical Stockout Predicted',
            description: `'${topRisk.name}' is depleting fast and will run out in approx. ${topRisk.days} days.`,
            metric: 'High Urgency',
            action: 'Reorder Now',
            color: 'red',
            priority: 1
        })
    }

    if (highMarginRisks.length > 0) {
        const topMarginRisk = highMarginRisks.sort((a, b) => a.days - b.days)[0]
        insights.push({
            type: 'OPPORTUNITY',
            title: 'Protect High-Margin Revenue',
            description: `'${topMarginRisk.name}' ( ${topMarginRisk.margin}% margin ) is selling fast but has only ${topMarginRisk.days} days of stock left.`,
            metric: 'Revenue Risk',
            action: 'Prioritize Restock',
            color: 'green',
            priority: 2
        })
    }

    if (overstockedItems.length > 0) {
        const topOverstock = overstockedItems.sort((a, b) => b.excessValue - a.excessValue)[0]
        if (topOverstock.excessValue > 0) {
            insights.push({
                type: 'WARNING',
                title: 'Capital Tied in Overstock',
                description: `'${topOverstock.name}' is heavily overstocked. Reducing inventory to 30-day levels could free up ₹${Math.round(topOverstock.excessValue).toLocaleString()}.`,
                metric: 'Overstocked',
                action: 'Launch Flash Sale',
                color: 'purple',
                priority: 3
            })
        }
    }

    if (deadStockItems.length > 0 && deadStockValue > 0) {
        insights.push({
            type: 'WARNING',
            title: 'Dead Stock Detected',
            description: `${deadStockItems.length} items haven't moved in 30 days, locking up ₹${Math.round(deadStockValue).toLocaleString()} in capital.`,
            metric: 'Capital Locked',
            action: 'Liquidate Inventory',
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
            title: `${currentSeason} Demand Surge`,
            description: `'${topCategory[0]}' category is driving the most volume this season. Ensure adequate safety stock across this category.`,
            metric: 'Top Category',
            color: 'blue',
            priority: 5
        })
    }

    return insights.sort((a, b) => a.priority - b.priority).slice(0, 3)
}
