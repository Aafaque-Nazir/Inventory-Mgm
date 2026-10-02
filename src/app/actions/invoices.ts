'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getWarehouseCookie } from './warehouse-cookie'
import { z } from 'zod'

const invoiceItemSchema = z.array(z.object({
    item_id: z.string(),
    quantity: z.union([z.string(), z.number()]),
    unit_price: z.number().optional()
}))

export async function createInvoice(prevState: any, formData: FormData) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        const customer_name = formData.get('customer_name') as string
        const customer_phone = formData.get('customer_phone') as string
        const payment_method = formData.get('payment_method') as string
        const itemsJson = formData.get('items') as string
        const total_amount = parseFloat(formData.get('total_amount') as string)

        if (!itemsJson || !total_amount) {
            return { error: 'Invalid invoice data' }
        }

        let items: z.infer<typeof invoiceItemSchema>
        try {
            items = invoiceItemSchema.parse(JSON.parse(itemsJson))
        } catch (_e: any) {
            return { error: 'Invalid invoice items format' }
        }


        // 1. Get Organization ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

        if (!profile?.organization_id) return { error: 'No organization found' }

        // 2. Insert Invoice
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                organization_id: profile.organization_id,
                customer_name,
                customer_phone,
                payment_method,
                total_amount,
                items, // JSONB
                created_by: user.id
            })
            .select()
            .single()

        if (invoiceError) throw invoiceError

        // 3. Deduct Stock for each item
        const warehouseId = await getWarehouseCookie() // Or default

        // We will process stock updates sequentially
        // For a production app, this should be a DB function/RPC to be atomic.
        // But for now, we iterate.
        for (const item of items) {
            const { item_id, quantity } = item

            // A. Insert Movement Log
            await supabase.from('stock_movements').insert({
                item_id,
                quantity: Number(quantity),
                type: 'OUT',
                reason: `Invoice #${invoice.id.slice(0, 8)}`,
                organization_id: profile.organization_id,
                location_id: warehouseId,
                unit_price: item.unit_price,
                created_by: user.id
            })

            // B. Atomic Stock Deduction (uses DB-level row locking to prevent race conditions)
            if (warehouseId) {
                const { error: rpcError } = await supabase
                    .rpc('atomic_stock_deduct', {
                        p_item_id: item_id,
                        p_location_id: warehouseId,
                        p_quantity: Number(quantity)
                    })

                if (rpcError) {
                    console.error(`Stock deduction failed for item ${item_id}:`, rpcError.message)
                    // Don't throw — the invoice is already created. Log the error.
                    // In production, this should trigger a reconciliation alert.
                }
            }

            // C. Global Stock (Legacy / Aggregate)
            const { data: globalItem } = await supabase.from('items').select('current_stock').eq('id', item_id).single()
            if (globalItem) {
                const newGlobalStock = (globalItem.current_stock || 0) - Number(quantity)
                await supabase.from('items').update({ current_stock: Math.max(0, newGlobalStock) }).eq('id', item_id)
            }
        }

        revalidatePath('/dashboard')
        revalidatePath('/items')

        return { message: 'Invoice created successfully', invoiceId: invoice.id }

    } catch (error: any) {
        console.error('Create Invoice Error:', error)
        return { error: error.message || 'Failed to create invoice' }
    }
}
