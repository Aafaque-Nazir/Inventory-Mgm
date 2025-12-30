'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendLowStockAlert } from '@/lib/email'

export type StockMovementState = {
    message?: string
    error?: string
}

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

        // 1. Get current item state and organization details
        const { data: item, error: itemError } = await supabase
            .from('items')
            .select('*, organization:organizations(name, plan_type)')
            .eq('id', item_id)
            .single()

        if (itemError || !item) {
            return { error: 'Item not found' }
        }

        // 2. Insert movement
        const { error: moveError } = await supabase.from('stock_movements').insert({
            item_id,
            quantity,
            type,
            reason,
            organization_id: item.organization_id, // Ensure it matches item's org
            created_by: user.id
        })

        if (moveError) throw moveError

        // 3. Update item stock
        const newStock = type === 'IN'
            ? Number(item.current_stock) + quantity
            : Number(item.current_stock) - quantity

        const { error: updateError } = await supabase
            .from('items')
            .update({ current_stock: newStock })
            .eq('id', item_id)

        if (updateError) throw updateError

        // 4. Check for Low Stock Alert (Only on OUT movements)
        // CHECK: Only send for PRO or ENTERPRISE plans (or Super Admin)
        const plan = item.organization?.plan_type || 'FREE'

        // Is the current user a Super Admin? We need to check or assume permission based on this action's context
        // For efficiency, we can just check if plan is NOT free. 
        // But to be precise for the "Super Admin" request, let's re-fetch or assume Pro features for now.
        // Actually, let's just stick to the plan for email alerts for simplicity, BUT since the user asked,
        // we should probably fetch the user's role.

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_super_admin')
            .eq('id', user.id)
            .single()

        const isSuperAdmin = profile?.is_super_admin

        if (type === 'OUT' && newStock <= item.min_stock) {
            if (plan !== 'FREE' || isSuperAdmin) {
                console.log('Triggering low stock alert...')
                await sendLowStockAlert(
                    user.email || '',
                    item.name,
                    newStock,
                    item.min_stock,
                    item.organization?.name || 'Your Organization'
                )
            } else {
                console.log('Low stock alert skipped (Free Plan)')
            }
        }

        revalidatePath('/stock')
        revalidatePath('/dashboard')
        revalidatePath('/items')

        return { message: 'Stock movement recorded successfully' }
    } catch (error: any) {
        console.error('Server Action Error:', error)
        return { error: error.message || 'Failed to record movement' }
    }
}
