'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendLowStockAlert } from '@/lib/email'
import { logAction } from './audit'

export type StockMovementState = {
    message?: string
    error?: string
}

import { getWarehouseCookie } from './warehouse-cookie'

export async function recordStockMovement(
    prevState: StockMovementState,
    formData: FormData
) {
    const supabase = await createClient()

    const item_id = formData.get('item_id') as string
    const quantity = parseFloat(formData.get('quantity') as string)
    const type = formData.get('type') as 'IN' | 'OUT'
    const reason = formData.get('reason') as string

    if (!item_id || !quantity || !type) {
        return { error: 'Missing required fields' }
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        // 1. Determine Location
        let location_id = await getWarehouseCookie()

        if (!location_id) {
            // Fallback to default location if no cookie (e.g. mobile app or first load)
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single()

            if (profile?.organization_id) {
                const { data: defaultLoc } = await supabase
                    .from('locations')
                    .select('id')
                    .eq('organization_id', profile.organization_id)
                    .eq('is_default', true)
                    .single()
                location_id = defaultLoc?.id
            }
        }

        if (!location_id) return { error: 'No warehouse selected' }


        // 2. Get current item state and organization details
        const { data: item, error: itemError } = await supabase
            .from('items')
            .select('*, organization:organizations(name, plan_type)')
            .eq('id', item_id)
            .single()

        if (itemError || !item) {
            return { error: 'Item not found' }
        }

        // 3. Insert movement with location_id
        const unitPrice = type === 'OUT' ? item.selling_price : item.cost_price

        const { error: moveError } = await supabase.from('stock_movements').insert({
            item_id,
            quantity,
            type,
            reason,
            organization_id: item.organization_id,
            location_id: location_id, // Critical for Multi-Warehouse
            unit_price: unitPrice || 0,
            created_by: user.id
        })

        if (moveError) throw moveError

        // 4. Update item stock (in item_stock TABLE)
        // We do Upsert: if record exists, add/subtract. if not, create.

        // First fetch current stock at this location
        const { data: currentStockRecord } = await supabase
            .from('item_stock')
            .select('quantity')
            .eq('item_id', item_id)
            .eq('location_id', location_id)
            .single()

        const currentQty = currentStockRecord?.quantity || 0
        const newQty = type === 'IN' ? currentQty + quantity : currentQty - quantity

        if (newQty < 0) {
            return { error: `Insufficient stock at this warehouse. Available: ${currentQty}, Requested: ${quantity}` }
        }

        const { error: stockError } = await supabase
            .from('item_stock')
            .upsert({
                item_id,
                location_id,
                quantity: newQty,
                updated_at: new Date().toISOString()
            }, { onConflict: 'item_id, location_id' })

        if (stockError) throw stockError

        // 5. Update Legacy 'items.current_stock' (Global Aggregate)
        // This keeps the 'items' table roughly in sync for simple views (optional but recommended for legacy compatibility)
        // We can just add/subtract the delta from the global total
        const globalNewStock = type === 'IN'
            ? (item.current_stock || 0) + quantity
            : (item.current_stock || 0) - quantity

        await supabase.from('items').update({ current_stock: globalNewStock }).eq('id', item_id)


        // 6. Check for Low Stock Alert (Only on OUT movements)
        const plan = item.organization?.plan_type || 'FREE'

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_super_admin')
            .eq('id', user.id)
            .single()

        const isSuperAdmin = profile?.is_super_admin

        let alertMessage = ''
        // Check GLOBAL min_stock against LOCATION stock? Or Global?
        // Usually alerts are based on specific location levels or total. 
        // Let's stick to checking the *newQty* at this location vs min_stock (if min_stock is per location - currently it's global).
        // If min_stock is global, we should probably check global stock. 
        // User wants "professional mind": Alert if stock is low *where it's needed*. 
        // For now, let's use the LOCAL quantity vs GLOBAL min_stock as a heuristic, OR the global one.
        // Let's use Global for consistency with previous behavior for now.
        if (type === 'OUT' && globalNewStock <= item.min_stock) {
            if (plan !== 'FREE' || isSuperAdmin) {
                const emailResult = await sendLowStockAlert(
                    user.email || '',
                    item.name,
                    globalNewStock,
                    item.min_stock,
                    item.organization?.name || 'Your Organization'
                )
                if (emailResult?.success) {
                    alertMessage = ' (Low stock alert sent)'
                }
            }
        }

        revalidatePath('/stock')
        revalidatePath('/dashboard')
        revalidatePath('/items')

        // Audit Log
        await logAction('STOCK_UPDATE', 'ITEM', item_id, {
            type,
            quantity,
            reason,
            location_id,
            old_stock: currentQty,
            new_stock: newQty
        })

        return { message: `Stock updated successfully${alertMessage}` }
    } catch (error: any) {
        console.error('Server Action Error:', error)
        return { error: error.message || 'Failed to record movement' }
    }
}
