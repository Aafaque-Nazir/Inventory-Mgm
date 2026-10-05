'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getWarehouseCookie } from './warehouse-cookie'
import { sendLowStockAlert } from '@/lib/email'
import { z } from 'zod'

const invoiceItemSchema = z.array(z.object({
    item_id: z.string(),
    name: z.string().optional(),
    quantity: z.union([z.string(), z.number()]),
    unit_price: z.number().optional(),
    cost_price: z.number().optional(),
    hsn_code: z.string().nullable().optional(),
    gst_rate: z.number().optional(),
    batch_number: z.string().nullable().optional(),
    expiry_date: z.string().nullable().optional(),
    total: z.number().optional()
}))

export async function createInvoice(prevState: any, formData: FormData) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        const customer_name = (formData.get('customer_name') as string)?.trim() || null
        const customer_phone = (formData.get('customer_phone') as string)?.trim() || null
        const payment_method = (formData.get('payment_method') as string) || 'CASH'
        const itemsJson = formData.get('items') as string
        const total_amount = parseFloat(formData.get('total_amount') as string)

        if (!itemsJson || isNaN(total_amount)) {
            return { error: 'Invalid invoice data' }
        }

        let rawItems: z.infer<typeof invoiceItemSchema>
        try {
            rawItems = invoiceItemSchema.parse(JSON.parse(itemsJson))
        } catch (_e: any) {
            return { error: 'Invalid invoice items format' }
        }

        // 1. Get Organization ID and Name
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, organization:organizations(name, plan_type)')
            .eq('id', user.id)
            .single()

        if (!profile?.organization_id) return { error: 'No organization found' }

        const orgName = (profile as any)?.organization?.name || 'Your Organization'

        // 2. Fetch Item Details to snapshot cost_price, hsn_code, gst_rate, and min_stock
        const itemIds = rawItems.map(i => i.item_id)
        const { data: dbItems } = await supabase
            .from('items')
            .select('id, name, cost_price, selling_price, hsn_code, gst_rate, min_stock, current_stock')
            .in('id', itemIds)

        const dbItemsMap = new Map((dbItems || []).map(i => [i.id, i]))

        // Build enriched items with snapshotted cost price and tax info
        let calculatedTax = 0
        const enrichedItems = rawItems.map(item => {
            const dbItem = dbItemsMap.get(item.item_id)
            const qty = Number(item.quantity)
            const price = item.unit_price ?? dbItem?.selling_price ?? 0
            const cost = item.cost_price ?? dbItem?.cost_price ?? 0
            const hsn = item.hsn_code ?? dbItem?.hsn_code ?? null
            const gstRate = item.gst_rate ?? dbItem?.gst_rate ?? 0
            const lineTotal = item.total ?? (qty * price)

            // Tax calculation (treating price as MRP / tax inclusive by default for Indian retail)
            if (gstRate > 0) {
                const itemTax = lineTotal - (lineTotal / (1 + gstRate / 100))
                calculatedTax += itemTax
            }

            return {
                item_id: item.item_id,
                name: item.name || dbItem?.name || 'Item',
                quantity: qty,
                unit_price: price,
                cost_price: cost, // Snapshotted for accurate historical P&L
                hsn_code: hsn,
                gst_rate: gstRate,
                batch_number: item.batch_number || null,
                expiry_date: item.expiry_date || null,
                total: lineTotal
            }
        })

        const cgstAmount = Math.round((calculatedTax / 2) * 100) / 100
        const sgstAmount = Math.round((calculatedTax / 2) * 100) / 100
        const subtotal = Math.round((total_amount - calculatedTax) * 100) / 100

        // 3. Customer CRM Auto-link / Upsert
        let customerId: string | null = null
        if (customer_phone || customer_name) {
            try {
                let customerQuery = supabase
                    .from('customers')
                    .select('id, total_spent, total_orders')
                    .eq('organization_id', profile.organization_id)

                if (customer_phone) {
                    customerQuery = customerQuery.eq('phone', customer_phone)
                } else if (customer_name) {
                    customerQuery = customerQuery.eq('name', customer_name)
                }

                const { data: existingCust } = await customerQuery.maybeSingle()

                if (existingCust) {
                    customerId = existingCust.id
                    await supabase
                        .from('customers')
                        .update({
                            total_spent: Number(existingCust.total_spent || 0) + total_amount,
                            total_orders: Number(existingCust.total_orders || 0) + 1,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existingCust.id)
                } else {
                    const { data: newCust } = await supabase
                        .from('customers')
                        .insert({
                            organization_id: profile.organization_id,
                            name: customer_name || 'Customer',
                            phone: customer_phone || null,
                            total_spent: total_amount,
                            total_orders: 1
                        })
                        .select('id')
                        .single()

                    if (newCust) customerId = newCust.id
                }
            } catch (custErr) {
                // Table might not be migrated yet in remote DB, do not block invoice creation
                console.warn('Customer upsert non-blocking error:', custErr)
            }
        }

        // 4. Insert Invoice with full tax breakup and customer link
        const invoicePayload: Record<string, any> = {
            organization_id: profile.organization_id,
            customer_name,
            customer_phone,
            payment_method,
            total_amount,
            items: enrichedItems,
            created_by: user.id
        }

        // Add optional schema fields safely
        if (customerId) invoicePayload.customer_id = customerId
        invoicePayload.subtotal = subtotal
        invoicePayload.tax_amount = calculatedTax
        invoicePayload.cgst_amount = cgstAmount
        invoicePayload.sgst_amount = sgstAmount
        invoicePayload.igst_amount = 0
        invoicePayload.status = 'PAID'

        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert(invoicePayload)
            .select()
            .single()

        if (invoiceError) {
            // Fallback for older invoice schema without new tax columns
            const legacyPayload = {
                organization_id: profile.organization_id,
                customer_name,
                customer_phone,
                payment_method,
                total_amount,
                items: enrichedItems,
                created_by: user.id
            }
            const { data: fallbackInvoice, error: fallbackError } = await supabase
                .from('invoices')
                .insert(legacyPayload)
                .select()
                .single()

            if (fallbackError) throw fallbackError
            return await processPostInvoiceTasks(supabase, user, profile.organization_id, fallbackInvoice, enrichedItems, dbItemsMap, orgName)
        }

        return await processPostInvoiceTasks(supabase, user, profile.organization_id, invoice, enrichedItems, dbItemsMap, orgName)

    } catch (error: any) {
        console.error('Create Invoice Error:', error)
        return { error: error.message || 'Failed to create invoice' }
    }
}

async function processPostInvoiceTasks(
    supabase: any,
    user: any,
    organizationId: string,
    invoice: any,
    items: any[],
    dbItemsMap: Map<string, any>,
    orgName: string
) {
    const warehouseId = await getWarehouseCookie()

    for (const item of items) {
        const { item_id, quantity, unit_price, batch_number } = item

        // A. Insert Movement Log
        await supabase.from('stock_movements').insert({
            item_id,
            quantity: Number(quantity),
            type: 'OUT',
            reason: `Invoice #${invoice.id.slice(0, 8)}`,
            organization_id: organizationId,
            location_id: warehouseId || null,
            unit_price: unit_price,
            created_by: user.id
        })

        // B. Atomic Stock Deduction at Warehouse
        if (warehouseId) {
            const { error: rpcError } = await supabase
                .rpc('atomic_stock_deduct', {
                    p_item_id: item_id,
                    p_location_id: warehouseId,
                    p_quantity: Number(quantity)
                })

            if (rpcError) {
                console.error(`Stock deduction failed for item ${item_id}:`, rpcError.message)
            }
        }

        // C. Decrement Batch stock if batch_number specified
        if (batch_number) {
            try {
                const { data: batchRow } = await supabase
                    .from('item_batches')
                    .select('id, quantity')
                    .eq('item_id', item_id)
                    .eq('batch_number', batch_number)
                    .maybeSingle()

                if (batchRow) {
                    const newBatchQty = Math.max(0, Number(batchRow.quantity) - Number(quantity))
                    await supabase
                        .from('item_batches')
                        .update({ quantity: newBatchQty, updated_at: new Date().toISOString() })
                        .eq('id', batchRow.id)
                }
            } catch (batchErr) {
                console.warn('Batch decrement non-blocking error:', batchErr)
            }
        }

        // D. Global Stock & Low Stock Alert
        const dbItem = dbItemsMap.get(item_id)
        const currentStock = dbItem?.current_stock ?? 0
        const newGlobalStock = Math.max(0, currentStock - Number(quantity))

        await supabase
            .from('items')
            .update({ current_stock: newGlobalStock })
            .eq('id', item_id)

        // E. Send Low Stock Alert when stock drops to or below min_stock
        const minStock = dbItem?.min_stock ?? 0
        if (newGlobalStock <= minStock && user.email) {
            try {
                await sendLowStockAlert(
                    user.email,
                    item.name,
                    newGlobalStock,
                    minStock,
                    orgName
                )
            } catch (alertErr) {
                console.warn('Low stock alert error:', alertErr)
            }
        }
    }

    revalidatePath('/dashboard')
    revalidatePath('/items')
    revalidatePath('/sales')
    revalidatePath('/stock')

    return {
        message: 'Invoice created successfully',
        invoiceId: invoice.id,
        invoice
    }
}

export async function getInvoice(id: string) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        const { data: invoice, error } = await supabase
            .from('invoices')
            .select('*, organization:organizations(name, gstin, address, phone, email)')
            .eq('id', id)
            .single()

        if (error) throw error

        return { invoice }
    } catch (err: any) {
        return { error: err.message || 'Invoice not found' }
    }
}
