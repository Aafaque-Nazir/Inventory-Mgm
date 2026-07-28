import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { tool } from 'ai'

/**
 * Creates all read-only tools scoped to a specific organization.
 * These tools are called by the LLM to fetch real inventory data.
 */
export function createChatTools(organizationId: string) {
    return {
        getStockLevels: tool({
            description:
                'Get stock levels for items in the inventory. Can optionally filter by category or search by item name/SKU. Returns item name, SKU, current stock, min stock threshold, category, cost price, and selling price.',
            parameters: z.object({
                category: z
                    .string()
                    .optional()
                    .describe('Filter by item category (e.g., "Mobile Phones", "Shoes")'),
                search: z
                    .string()
                    .optional()
                    .describe('Search term to filter items by name or SKU'),
                limit: z
                    .number()
                    .optional()
                    .default(20)
                    .describe('Max number of items to return (default 20)'),
            }),
            execute: async ({ category, search, limit }) => {
                const supabase = await createClient()
                let query = supabase
                    .from('items')
                    .select(
                        'name, sku, current_stock, min_stock, category, cost_price, selling_price, unit'
                    )
                    .eq('organization_id', organizationId)
                    .order('current_stock', { ascending: true })
                    .limit(limit ?? 20)

                if (category) {
                    query = query.ilike('category', `%${category}%`)
                }
                if (search) {
                    query = query.or(
                        `name.ilike.%${search}%,sku.ilike.%${search}%`
                    )
                }

                const { data, error } = await query
                if (error) return { error: error.message }
                if (!data || data.length === 0)
                    return { message: 'No items found matching the criteria.' }
                return { items: data, count: data.length }
            },
        }),

        getLowStockItems: tool({
            description:
                'Get items that are below their minimum stock threshold (low stock / critical stock). These items need to be reordered soon.',
            parameters: z.object({}),
            execute: async () => {
                const supabase = await createClient()
                const { data, error } = await supabase
                    .from('items')
                    .select(
                        'name, sku, current_stock, min_stock, category, cost_price, selling_price'
                    )
                    .eq('organization_id', organizationId)
                    .order('current_stock', { ascending: true })

                if (error) return { error: error.message }

                const lowStockItems = (data || []).filter(
                    (item) => item.current_stock < item.min_stock
                )

                if (lowStockItems.length === 0)
                    return {
                        message:
                            'Great news! All items are above their minimum stock thresholds.',
                    }

                return { items: lowStockItems, count: lowStockItems.length }
            },
        }),

        getDeadStockItems: tool({
            description:
                'Get dead stock items — items that have stock but no movement (IN or OUT) in the last 30 days. These are tying up capital and should be considered for liquidation or promotions.',
            parameters: z.object({}),
            execute: async () => {
                const supabase = await createClient()
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

                // Get all items with stock
                const { data: items } = await supabase
                    .from('items')
                    .select('id, name, sku, current_stock, cost_price, category')
                    .eq('organization_id', organizationId)
                    .gt('current_stock', 0)

                if (!items || items.length === 0)
                    return { message: 'No items with stock found.' }

                // Get items that had movement in last 30 days
                const { data: movements } = await supabase
                    .from('stock_movements')
                    .select('item_id')
                    .eq('organization_id', organizationId)
                    .gte('created_at', thirtyDaysAgo.toISOString())

                const movedItemIds = new Set(
                    (movements || []).map((m) => m.item_id)
                )

                const deadItems = items.filter(
                    (item) => !movedItemIds.has(item.id)
                )

                if (deadItems.length === 0)
                    return {
                        message:
                            'No dead stock detected. All items with stock have had movement in the last 30 days.',
                    }

                const totalDeadValue = deadItems.reduce(
                    (acc, item) =>
                        acc + item.current_stock * (item.cost_price || 0),
                    0
                )

                return {
                    items: deadItems.map((i) => ({
                        name: i.name,
                        sku: i.sku,
                        quantity: i.current_stock,
                        locked_value: i.current_stock * (i.cost_price || 0),
                        category: i.category,
                    })),
                    count: deadItems.length,
                    total_locked_value: totalDeadValue,
                }
            },
        }),

        getSalesData: tool({
            description:
                'Get sales / revenue data from invoices. Returns total revenue, number of orders, and daily breakdown for the specified period.',
            parameters: z.object({
                period: z
                    .enum(['7d', '30d'])
                    .default('7d')
                    .describe('Time period: "7d" for last 7 days, "30d" for last 30 days'),
            }),
            execute: async ({ period }) => {
                const supabase = await createClient()
                const days = period === '30d' ? 30 : 7
                const startDate = new Date()
                startDate.setDate(startDate.getDate() - days)

                const { data: invoices, error } = await supabase
                    .from('invoices')
                    .select('created_at, total_amount, payment_method')
                    .eq('organization_id', organizationId)
                    .gte('created_at', startDate.toISOString())
                    .order('created_at', { ascending: true })

                if (error) return { error: error.message }
                if (!invoices || invoices.length === 0)
                    return {
                        message: `No sales recorded in the last ${days} days.`,
                        total_revenue: 0,
                        total_orders: 0,
                    }

                const totalRevenue = invoices.reduce(
                    (acc, inv) => acc + (inv.total_amount || 0),
                    0
                )

                // Payment method breakdown
                const paymentBreakdown: Record<string, number> = {}
                invoices.forEach((inv) => {
                    const method = inv.payment_method || 'OTHER'
                    paymentBreakdown[method] =
                        (paymentBreakdown[method] || 0) + (inv.total_amount || 0)
                })

                return {
                    period: `Last ${days} days`,
                    total_revenue: totalRevenue,
                    total_orders: invoices.length,
                    average_order_value:
                        Math.round((totalRevenue / invoices.length) * 100) / 100,
                    payment_breakdown: paymentBreakdown,
                }
            },
        }),

        getSuppliers: tool({
            description:
                'Get the list of suppliers for this organization. Returns supplier name, contact person, phone, email, and address.',
            parameters: z.object({
                search: z
                    .string()
                    .optional()
                    .describe('Search term to filter suppliers by name'),
            }),
            execute: async ({ search }) => {
                const supabase = await createClient()
                let query = supabase
                    .from('suppliers')
                    .select('name, contact_person, phone, email, address')
                    .eq('organization_id', organizationId)
                    .order('name', { ascending: true })

                if (search) {
                    query = query.ilike('name', `%${search}%`)
                }

                const { data, error } = await query
                if (error) return { error: error.message }
                if (!data || data.length === 0)
                    return { message: 'No suppliers found.' }

                return { suppliers: data, count: data.length }
            },
        }),

        getRecentMovements: tool({
            description:
                'Get recent stock movements (IN and OUT). Returns the item name, movement type, quantity, reason, and timestamp.',
            parameters: z.object({
                limit: z
                    .number()
                    .optional()
                    .default(10)
                    .describe('Number of recent movements to fetch (default 10)'),
                type: z
                    .enum(['IN', 'OUT'])
                    .optional()
                    .describe('Filter by movement type: "IN" or "OUT"'),
            }),
            execute: async ({ limit, type }) => {
                const supabase = await createClient()
                let query = supabase
                    .from('stock_movements')
                    .select(
                        'quantity, type, reason, created_at, unit_price, items:item_id(name, sku)'
                    )
                    .eq('organization_id', organizationId)
                    .order('created_at', { ascending: false })
                    .limit(limit ?? 10)

                if (type) {
                    query = query.eq('type', type)
                }

                const { data, error } = await query
                if (error) return { error: error.message }
                if (!data || data.length === 0)
                    return { message: 'No recent stock movements found.' }

                return {
                    movements: data.map((m) => ({
                        // @ts-expect-error - Supabase join typing
                        item_name: m.items?.name || 'Unknown',
                        // @ts-expect-error - Supabase join typing
                        item_sku: m.items?.sku || '',
                        type: m.type,
                        quantity: m.quantity,
                        unit_price: m.unit_price,
                        reason: m.reason,
                        date: m.created_at,
                    })),
                    count: data.length,
                }
            },
        }),

        getDashboardMetrics: tool({
            description:
                'Get high-level dashboard metrics: total number of items, low stock count, and total stock value for the organization.',
            parameters: z.object({}),
            execute: async () => {
                const supabase = await createClient()
                const { data: items, error } = await supabase
                    .from('items')
                    .select('current_stock, min_stock, cost_price')
                    .eq('organization_id', organizationId)

                if (error) return { error: error.message }
                if (!items || items.length === 0)
                    return {
                        total_items: 0,
                        low_stock_count: 0,
                        total_stock_value: 0,
                        message: 'No items in inventory yet.',
                    }

                const lowStockCount = items.filter(
                    (i) => (i.current_stock || 0) < (i.min_stock || 0)
                ).length
                const totalStockValue = items.reduce(
                    (acc, i) =>
                        acc + (i.current_stock || 0) * (i.cost_price || 0),
                    0
                )

                return {
                    total_items: items.length,
                    low_stock_count: lowStockCount,
                    total_stock_value:
                        Math.round(totalStockValue * 100) / 100,
                }
            },
        }),
    }
}
