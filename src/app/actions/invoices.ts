'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getWarehouseCookie } from './warehouse-cookie'

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

        const items = JSON.parse(itemsJson)

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

            // Logic similar to recordStockMovement...
            // Fetch current stock
            // Deduct
            // Upsert

            // NOTE: We are "recording a sale", so it IS a stock movement too.
            // We should ideally insert into stock_movements table as well for Audit Log?
            // YES. 

            // A. Insert Movement Log
            await supabase.from('stock_movements').insert({
                item_id,
                quantity: parseFloat(quantity),
                type: 'OUT',
                reason: `Invoice #${invoice.id.slice(0, 8)}`, // Link to invoice
                organization_id: profile.organization_id,
                location_id: warehouseId,
                unit_price: item.unit_price,
                created_by: user.id
            })

            // B. Update Stock Levels (Global + Local)
            if (warehouseId) {
                const { data: currentStock } = await supabase
                    .from('item_stock')
                    .select('quantity')
                    .eq('item_id', item_id)
                    .eq('location_id', warehouseId)
                    .single()

                const newQty = (currentStock?.quantity || 0) - parseFloat(quantity)

                await supabase.from('item_stock').upsert({
                    item_id,
                    location_id: warehouseId,
                    quantity: newQty,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'item_id, location_id' })
            }

            // C. Global Stock (Legacy / Aggregate)
            // Ideally we use RPC, but to ensure it works without DB migrations right now:
            const { data: globalItem } = await supabase.from('items').select('current_stock').eq('id', item_id).single()
            if (globalItem) {
                const newGlobalStock = (globalItem.current_stock || 0) - parseFloat(quantity)
                await supabase.from('items').update({ current_stock: newGlobalStock }).eq('id', item_id)
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
