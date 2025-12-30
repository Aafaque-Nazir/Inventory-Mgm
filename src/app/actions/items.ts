'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const itemSchema = z.object({
    name: z.string().min(2),
    sku: z.string().min(2),
    category: z.string().optional(),
    unit: z.string().min(1),
    min_stock: z.coerce.number().min(0),
    initial_stock: z.coerce.number().min(0).optional(),
})

export async function createItem(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Parse fields
    const rawData = {
        name: formData.get('name'),
        sku: formData.get('sku'),
        category: formData.get('category'),
        unit: formData.get('unit'),
        min_stock: formData.get('min_stock'),
        initial_stock: formData.get('initial_stock'),
    }

    const validatedFields = itemSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message }
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        // 1. Get Organization and Plan
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, is_super_admin, organizations(plan_type, max_items)')
            .eq('id', user.id)
            .single()

        if (!profile?.organization_id) return { error: 'Organization not found' }

        const orgId = profile.organization_id
        // TypeScript workaround for nested join
        const org = profile.organizations as any
        const plan = org?.plan_type || 'FREE'
        const maxItems = org?.max_items || 50
        const isSuperAdmin = profile.is_super_admin

        // 2. Check Item Limit (Only for Free Plan)
        if (plan === 'FREE' && !isSuperAdmin) {
            const { count, error: countError } = await supabase
                .from('items')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', orgId)

            if (countError) throw countError

            if ((count || 0) >= maxItems) {
                return { error: `Free Plan limit reached (${maxItems} items). Upgrade to Pro for unlimited items.` }
            }
        }

        const { initial_stock, ...itemData } = validatedFields.data

        // 3. Insert Item
        const { data: newItem, error: insertError } = await supabase
            .from('items')
            .insert({
                organization_id: orgId,
                ...itemData,
                current_stock: initial_stock || 0
            })
            .select()
            .single()

        if (insertError) throw insertError

        // 4. Initial Stock Movement
        if (initial_stock && initial_stock > 0) {
            await supabase.from('stock_movements').insert({
                organization_id: orgId,
                item_id: newItem.id,
                quantity: initial_stock,
                type: 'IN',
                reason: 'Initial stock',
                created_by: user.id
            })
        }

        revalidatePath('/items')
        revalidatePath('/stock')
        revalidatePath('/dashboard')

        return { message: 'Item created successfully' }

    } catch (error: any) {
        console.error('Create Item Error:', error)
        return { error: error.message || 'Failed to create item' }
    }
}
