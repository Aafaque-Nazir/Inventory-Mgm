'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getWarehouseCookie } from './warehouse-cookie'
import { logAction } from './audit'
import { z } from 'zod'

const returnItemSchema = z.object({
    item_id: z.string(),
    name: z.string(),
    quantity: z.number().min(0.01, 'Quantity must be positive'),
    unit_price: z.number().min(0),
    refund_amount: z.number().min(0),
    restock: z.boolean().default(true),
    condition: z.enum(['RESTOCKABLE', 'DAMAGED']).default('RESTOCKABLE')
})

const salesReturnSchema = z.object({
    invoice_id: z.string().optional().nullable(),
    customer_name: z.string().optional().nullable(),
    customer_phone: z.string().optional().nullable(),
    total_refund_amount: z.number().min(0),
    refund_method: z.enum(['CASH', 'UPI', 'CREDIT_NOTE', 'OTHER']).default('CASH'),
    reason: z.string().optional().nullable(),
    items: z.array(returnItemSchema).min(1, 'At least one item must be returned')
})

export async function recordSalesReturn(prevState: any, formData: FormData) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

        if (!profile?.organization_id) return { error: 'Organization not found' }

        const rawPayload = {
            invoice_id: (formData.get('invoice_id') as string) || null,
            customer_name: (formData.get('customer_name') as string) || null,
            customer_phone: (formData.get('customer_phone') as string) || null,
            total_refund_amount: parseFloat(formData.get('total_refund_amount') as string || '0'),
            refund_method: (formData.get('refund_method') as any) || 'CASH',
            reason: (formData.get('reason') as string) || null,
            items: JSON.parse(formData.get('items') as string || '[]')
        }

        const validated = salesReturnSchema.parse(rawPayload)
        const warehouseId = await getWarehouseCookie()

        // 1. Insert Sales Return Record
        const { data: returnRecord, error: returnError } = await supabase
            .from('sales_returns')
            .insert({
                organization_id: profile.organization_id,
                invoice_id: validated.invoice_id,
                customer_name: validated.customer_name,
                customer_phone: validated.customer_phone,
                total_refund_amount: validated.total_refund_amount,
                refund_method: validated.refund_method,
                reason: validated.reason,
                items: validated.items,
                created_by: user.id
            })
            .select()
            .single()

        if (returnError) throw returnError

        // 2. Restock items that are RESTOCKABLE and marked restock
        for (const item of validated.items) {
            if (item.restock && item.condition === 'RESTOCKABLE') {
                // A. Insert Stock IN movement
                await supabase.from('stock_movements').insert({
                    item_id: item.item_id,
                    quantity: item.quantity,
                    type: 'IN',
                    reason: `Sales Return #${returnRecord.id.slice(0, 8)} (${validated.reason || 'Restocked'})`,
                    organization_id: profile.organization_id,
                    location_id: warehouseId || null,
                    unit_price: item.unit_price,
                    created_by: user.id
                })

                // B. Update location stock if warehouse selected
                if (warehouseId) {
                    const { data: currentStock } = await supabase
                        .from('item_stock')
                        .select('quantity')
                        .eq('item_id', item.item_id)
                        .eq('location_id', warehouseId)
                        .single()

                    const newQty = (currentStock?.quantity || 0) + item.quantity

                    await supabase
                        .from('item_stock')
                        .upsert({
                            item_id: item.item_id,
                            location_id: warehouseId,
                            quantity: newQty,
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'item_id, location_id' })
                }

                // C. Update global stock on items table
                const { data: globalItem } = await supabase
                    .from('items')
                    .select('current_stock')
                    .eq('id', item.item_id)
                    .single()

                if (globalItem) {
                    const newGlobalStock = (globalItem.current_stock || 0) + item.quantity
                    await supabase
                        .from('items')
                        .update({ current_stock: newGlobalStock })
                        .eq('id', item.item_id)
                }
            }
        }

        // 3. If linked to an invoice, update invoice status
        if (validated.invoice_id) {
            await supabase
                .from('invoices')
                .update({ status: 'RETURNED' })
                .eq('id', validated.invoice_id)
        }

        // 4. Audit Log
        await logAction('STOCK_UPDATE', 'ITEM', returnRecord.id, {
            type: 'SALES_RETURN',
            refund_amount: validated.total_refund_amount,
            reason: validated.reason,
            items_count: validated.items.length
        })

        revalidatePath('/sales')
        revalidatePath('/dashboard')
        revalidatePath('/items')
        revalidatePath('/stock')

        return { success: true, returnId: returnRecord.id }
    } catch (err: any) {
        console.error('recordSalesReturn error:', err)
        return { error: err.message || 'Failed to record return' }
    }
}

export async function getSalesReturns() {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized', returns: [] }

        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

        if (!profile?.organization_id) return { error: 'No organization', returns: [] }

        const { data, error } = await supabase
            .from('sales_returns')
            .select('*')
            .eq('organization_id', profile.organization_id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.warn('getSalesReturns warning:', error.message)
            return { returns: [], error: error.message }
        }

        return { returns: data || [] }
    } catch (err: any) {
        return { error: err.message, returns: [] }
    }
}
