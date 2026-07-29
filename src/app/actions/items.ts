'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { logAction } from './audit'

const itemSchema = z.object({
    name: z.string().min(2),
    sku: z.string().min(2),
    category: z.string().optional(),
    unit: z.string().min(1),
    min_stock: z.coerce.number().min(0),
    initial_stock: z.coerce.number().min(0).optional(),
    cost_price: z.coerce.number().min(0).optional().default(0),
    selling_price: z.coerce.number().min(0).optional().default(0),
    size: z.string().optional(),
    color: z.string().optional(),
    hsn_code: z.string().optional(),
    gst_rate: z.coerce.number().min(0).max(100).optional().default(0),
})

const bulkItemSchema = z.array(itemSchema)

import { getWarehouseCookie } from './warehouse-cookie'

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
        cost_price: formData.get('cost_price'),
        selling_price: formData.get('selling_price'),
        size: formData.get('size'),
        color: formData.get('color'),
        hsn_code: formData.get('hsn_code'),
        gst_rate: formData.get('gst_rate'),
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
            .select('organization_id, is_super_admin, organizations(plan_type, max_items, subscription_end_date)')
            .eq('id', user.id)
            .single()

        if (!profile?.organization_id) return { error: 'Organization not found' }

        const orgId = profile.organization_id
        // TypeScript workaround for nested join
        const org = profile.organizations as any
        let plan = org?.plan_type || 'FREE'
        const maxItems = org?.max_items || 50
        const isSuperAdmin = profile.is_super_admin

        // Check for Expiry
        if (plan === 'PRO' && org?.subscription_end_date) {
            const expiry = new Date(org.subscription_end_date)
            if (expiry < new Date()) {
                plan = 'FREE' // Treat as FREE if expired
            }
        }

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

        // 4. Initial Stock Movement & Item Stock Entry
        const postCreationPromises: any[] = []

        if (initial_stock && initial_stock > 0) {

            // Determine Location for Initial Stock
            let location_id = await getWarehouseCookie() // From Cookie

            if (!location_id) {
                const { data: defaultLoc } = await supabase
                    .from('locations')
                    .select('id')
                    .eq('organization_id', orgId)
                    .eq('is_default', true)
                    .single()
                location_id = defaultLoc?.id
            }

            if (location_id) {
                // A. Insert into item_stock
                postCreationPromises.push(
                    supabase.from('item_stock').insert({
                        item_id: newItem.id,
                        location_id: location_id,
                        quantity: initial_stock,
                    })
                )

                // B. Insert Movement
                postCreationPromises.push(
                    supabase.from('stock_movements').insert({
                        organization_id: orgId,
                        item_id: newItem.id,
                        quantity: initial_stock,
                        type: 'IN',
                        reason: 'Initial stock',
                        location_id: location_id,
                        unit_price: itemData.cost_price,
                        created_by: user.id
                    })
                )
            } else {
                // Fallback if no location found
                postCreationPromises.push(
                    supabase.from('stock_movements').insert({
                        organization_id: orgId,
                        item_id: newItem.id,
                        quantity: initial_stock,
                        type: 'IN',
                        reason: 'Initial stock (No Location)',
                        unit_price: itemData.cost_price,
                        created_by: user.id
                    })
                )
            }
        }

        // Audit Log (Add to parallel execution)
        postCreationPromises.push(
            logAction('ITEM_CREATE', 'ITEM', newItem.id, { name: newItem.name, sku: newItem.sku })
        )

        // Execute all independent side-effects in parallel
        await Promise.all(postCreationPromises)

        revalidatePath('/dashboard')
        revalidatePath('/items')

        return { message: 'Item created successfully' }

    } catch (error: any) {
        console.error('Create Item Error:', error)
        if (error.message?.includes('duplicate key value violates unique constraint "items_sku_key"')) {
            return { error: 'An item with this SKU already exists.' }
        }
        return { error: error.message || 'Failed to create item' }
    }
}

export async function bulkCreateItems(rawItems: any[]) {
    let items: z.infer<typeof bulkItemSchema>
    try {
        items = bulkItemSchema.parse(rawItems)
    } catch (e) {
        return { error: 'Invalid items format in bulk import' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    try {
        // 1. Get Organization and Plan
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, is_super_admin, organizations(plan_type, max_items, subscription_end_date)')
            .eq('id', user.id)
            .single()

        if (!profile?.organization_id) return { error: 'Organization not found' }

        const orgId = profile.organization_id
        const org = profile.organizations as any
        let plan = org?.plan_type || 'FREE'
        const maxItems = org?.max_items || 50
        const isSuperAdmin = profile.is_super_admin

        // Check for Expiry
        if (plan === 'PRO' && org?.subscription_end_date) {
            const expiry = new Date(org.subscription_end_date)
            if (expiry < new Date()) {
                plan = 'FREE' // Treat as FREE if expired
            }
        }

        // 2. Validate Item Count for Free Plan
        if (plan === 'FREE' && !isSuperAdmin) {
            const { count } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('organization_id', orgId)
            const currentCount = count || 0

            if (currentCount + items.length > maxItems) {
                return { error: `Import failed. You have ${currentCount} items. Importing ${items.length} more would exceed the limit of ${maxItems}. Please upgrade to Pro.` }
            }
        }

        // 3. Prepare Data
        const cleanItems = items.map(item => ({
            organization_id: orgId,
            name: item.name,
            sku: item.sku,
            category: item.category,
            unit: item.unit,
            min_stock: Number(item.min_stock) || 0,
            current_stock: Number(item.initial_stock) || 0,
            cost_price: Number(item.cost_price) || 0,
            selling_price: Number(item.selling_price) || 0,
            size: item.size || null,
            color: item.color || null,
            hsn_code: item.hsn_code || null,
            gst_rate: Number(item.gst_rate) || 0
        }))

        // 4. Bulk Insert
        const { data: insertedItems, error } = await supabase
            .from('items')
            .insert(cleanItems)
            .select()

        if (error) throw error

        // 5. Create Initial Stock Movements
        const movements = insertedItems
            .filter(item => item.current_stock > 0)
            .map(item => ({
                organization_id: orgId,
                item_id: item.id,
                quantity: item.current_stock,
                type: 'IN',
                reason: 'Bulk Import',
                unit_price: item.cost_price,
                created_by: user.id
            }))

        if (movements.length > 0) {
            await supabase.from('stock_movements').insert(movements)
        }

        revalidatePath('/items')
        revalidatePath('/dashboard')

        // Audit Log
        await logAction('BULK_IMPORT', 'ITEM', null, { count: items.length })

        return { message: `Successfully imported ${items.length} items` }

    } catch (error: any) {
        console.error('Bulk Import Error:', error)
        if (error.message?.includes('duplicate key value violates unique constraint "items_sku_key"')) {
            return { error: 'One or more items have a SKU that already exists.' }
        }
        return { error: error.message || 'Failed to import items' }
    }
}

export async function getItemBySku(sku: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

        if (!profile?.organization_id) return { error: 'Organization not found' }

        const { data: item, error } = await supabase
            .from('items')
            .select('*')
            .eq('organization_id', profile.organization_id)
            .eq('sku', sku)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return { error: 'Item not found' }
            }
            throw error
        }

        return { item }
    } catch (error: any) {
        console.error('Get Item By SKU Error:', error)
        return { error: error.message || 'Failed to fetch item' }
    }
}
