'use server'

import { createClient } from '@/lib/supabase/server'

export interface AiInsight {
    type: 'RISK' | 'OPPORTUNITY' | 'SEASONAL'
    title: string
    description: string
    metric?: string
    color: 'red' | 'green' | 'blue' | 'yellow'
}

export async function getAiInsights(): Promise<AiInsight[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // 1. Get Organization ID
    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile?.organization_id) return []
    const orgId = profile.organization_id

    const insights: AiInsight[] = []

    // 2. Fetch Data (Last 30 Days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: items } = await supabase
        .from('items')
        .select('id, name, quantity, low_stock_threshold, category')
        .eq('organization_id', orgId)

    const { data: movements } = await supabase
        .from('stock_movements')
        .select('item_id, quantity, type, created_at, items(category)')
        .eq('organization_id', orgId)
        .eq('type', 'STOCK_OUT')
        .gte('created_at', thirtyDaysAgo.toISOString())

    if (!items || !movements) return []

    // --- ALGORITHM 1: Velocity & Stockout Risk ---
    // Calculate daily consumption for each item
    const itemUsage: Record<string, number> = {}
    movements.forEach(m => {
        itemUsage[m.item_id] = (itemUsage[m.item_id] || 0) + m.quantity
    })

    const atRiskItems = []

    for (const item of items) {
        const totalUsed30Days = itemUsage[item.id] || 0
        const dailyVelocity = totalUsed30Days / 30

        if (dailyVelocity > 0) {
            const daysRemaining = item.quantity / dailyVelocity

            // If stock will last less than 7 days (Lead Time), it's Critical
            if (daysRemaining < 7) {
                atRiskItems.push({
                    name: item.name,
                    days: Math.ceil(daysRemaining)
                })
            }
        }
    }

    if (atRiskItems.length > 0) {
        const topRisk = atRiskItems.sort((a, b) => a.days - b.days)[0] // Item running out soonest
        insights.push({
            type: 'RISK',
            title: 'Stockout Risk Alert',
            description: `Based on current velocity, '${topRisk.name}' will run out in ${topRisk.days} days. Restock immediately.`,
            metric: `${atRiskItems.length} Items at risk`,
            color: 'red'
        })
    }

    // --- ALGORITHM 2: Seasonal & Category Trends ---
    // Group movements by Category
    const categoryVelocity: Record<string, number> = {}
    movements.forEach(m => {
        // @ts-ignore
        const cat = m.items?.category || 'Uncategorized'
        categoryVelocity[cat] = (categoryVelocity[cat] || 0) + m.quantity
    })

    // Find Top Category
    const topCategory = Object.entries(categoryVelocity).sort(([, a], [, b]) => b - a)[0]

    // Determine Season
    const month = new Date().getMonth() // 0-11
    let season = "Regular"
    if (month >= 11 || month <= 1) season = "Winter"
    else if (month >= 2 && month <= 5) season = "Summer"
    else if (month >= 6 && month <= 8) season = "Monsoon"
    else season = "Autumn"

    if (topCategory && topCategory[1] > 0) {
        insights.push({
            type: 'SEASONAL',
            title: `${season} Trend Detected`,
            description: `It's ${season}, and '${topCategory[0]}' is your highest performing category. Consider increasing stock for similar items.`,
            metric: `${topCategory[0]} Trending`,
            color: 'blue'
        })
    }

    // --- ALGORITHM 3: Dead Stock ---
    // Items with stock > 0 but NO output in 30 days
    const deadStockCount = items.filter(i => i.quantity > 0 && !itemUsage[i.id]).length

    if (deadStockCount > 0) {
        insights.push({
            type: 'OPPORTUNITY',
            title: 'Dead Stock Detected',
            description: `${deadStockCount} items haven't moved in 30 days. Consider running a discount/sale to free up capital.`,
            metric: 'Free up Cash',
            color: 'yellow'
        })
    }

    return insights
}
