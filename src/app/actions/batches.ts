'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ItemBatch } from '@/types'
import { z } from 'zod'

const batchSchema = z.object({
    item_id: z.string().min(1, 'Item is required'),
    batch_number: z.string().min(1, 'Batch number is required').max(50),
    expiry_date: z.string().optional().nullable(),
    manufacturing_date: z.string().optional().nullable(),
    quantity: z.number().min(0, 'Quantity must be non-negative'),
    location_id: z.string().optional().nullable()
})

export async function getItemBatches(itemId: string) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized', batches: [] }

        const { data, error } = await supabase
            .from('item_batches')
            .select('*')
            .eq('item_id', itemId)
            .order('expiry_date', { ascending: true, nullsFirst: false })

        if (error) {
            console.warn('getItemBatches warning:', error.message)
            return { batches: [], error: error.message }
        }

        return { batches: (data as ItemBatch[]) || [] }
    } catch (err: any) {
        return { error: err.message, batches: [] }
    }
}

export async function getExpiringBatches(daysThreshold: number = 30) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized', batches: [] }

        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

        if (!profile?.organization_id) return { error: 'No organization', batches: [] }

        const targetDate = new Date()
        targetDate.setDate(targetDate.getDate() + daysThreshold)
        const targetDateStr = targetDate.toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('item_batches')
            .select('*, item:items(id, name, sku, unit)')
            .eq('organization_id', profile.organization_id)
            .gt('quantity', 0)
            .lte('expiry_date', targetDateStr)
            .order('expiry_date', { ascending: true })

        if (error) {
            console.warn('getExpiringBatches warning:', error.message)
            return { batches: [] }
        }

        return { batches: data || [] }
    } catch (err: any) {
        return { error: err.message, batches: [] }
    }
}

export async function createItemBatch(formData: FormData) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

        if (!profile?.organization_id) return { error: 'No organization found' }

        const rawData = {
            item_id: formData.get('item_id') as string,
            batch_number: formData.get('batch_number') as string,
            expiry_date: (formData.get('expiry_date') as string) || null,
            manufacturing_date: (formData.get('manufacturing_date') as string) || null,
            quantity: parseFloat(formData.get('quantity') as string || '0'),
            location_id: (formData.get('location_id') as string) || null
        }

        const validated = batchSchema.parse(rawData)

        const { data: batch, error } = await supabase
            .from('item_batches')
            .insert({
                organization_id: profile.organization_id,
                ...validated
            })
            .select()
            .single()

        if (error) throw error

        revalidatePath('/items')
        return { success: true, batch }
    } catch (err: any) {
        return { error: err.message || 'Failed to create batch' }
    }
}
