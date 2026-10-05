'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Customer } from '@/types'
import { z } from 'zod'

const customerSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    phone: z.string().max(20).optional().nullable(),
    email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
    address: z.string().max(300).optional().nullable(),
    gstin: z.string().max(15).optional().nullable(),
    notes: z.string().max(500).optional().nullable()
})

export async function getCustomers(search?: string) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized', customers: [] }

        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

        if (!profile?.organization_id) {
            return { error: 'No organization found', customers: [] }
        }

        let query = supabase
            .from('customers')
            .select('*')
            .eq('organization_id', profile.organization_id)
            .order('total_spent', { ascending: false })

        if (search && search.trim()) {
            const s = `%${search.trim()}%`
            query = query.or(`name.ilike.${s},phone.ilike.${s},email.ilike.${s}`)
        }

        const { data, error } = await query.limit(100)

        if (error) {
            // Table might not exist yet if migration hasn't run in hosted Supabase
            console.warn('getCustomers fetch warning:', error.message)
            return { customers: [], error: error.message }
        }

        return { customers: (data as Customer[]) || [] }
    } catch (err: any) {
        console.error('getCustomers exception:', err)
        return { error: err.message, customers: [] }
    }
}

export async function createCustomer(formData: FormData) {
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

        const rawData = {
            name: formData.get('name') as string,
            phone: (formData.get('phone') as string) || null,
            email: (formData.get('email') as string) || null,
            address: (formData.get('address') as string) || null,
            gstin: (formData.get('gstin') as string) || null,
            notes: (formData.get('notes') as string) || null
        }

        const validated = customerSchema.parse(rawData)

        const { data: customer, error } = await supabase
            .from('customers')
            .insert({
                organization_id: profile.organization_id,
                ...validated,
                total_spent: 0,
                total_orders: 0
            })
            .select()
            .single()

        if (error) throw error

        revalidatePath('/customers')
        revalidatePath('/sales')

        return { success: true, customer }
    } catch (err: any) {
        return { error: err.message || 'Failed to create customer' }
    }
}

export async function getCustomerInvoices(customerId: string) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized', invoices: [] }

        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { invoices: data || [] }
    } catch (err: any) {
        return { error: err.message, invoices: [] }
    }
}
