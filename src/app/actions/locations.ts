'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getLocations(organizationId: string) {
    const supabase = await createClient()

    const { data: locations, error } = await supabase
        .from('locations')
        .select('*')
        .eq('organization_id', organizationId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching locations:', error)
        return []
    }

    return locations
}

export async function createLocation(data: { name: string; address?: string; organizationId: string }) {
    const supabase = await createClient()

    // 1. Get current plan & limit
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('plan_type, subscription_status')
        .eq('id', data.organizationId)
        .single()

    if (orgError) return { error: "Failed to fetch organization details" }

    // 2. Count existing locations
    const { count, error: countError } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', data.organizationId)

    if (countError) return { error: "Failed to count locations" }

    // 3. Enforce Limit (Pro = 2) 
    const MAX_LOCATIONS = 2
    // Allow Enterprise to have unlimited (implied check bypass)
    // If not enterprise, check limit
    if (org.plan_type !== 'ENTERPRISE' && (count || 0) >= MAX_LOCATIONS) {
        return { error: `Pro Plan is limited to ${MAX_LOCATIONS} Warehouses. Upgrade to Enterprise for unlimited.` }
    }

    const { error } = await supabase
        .from('locations')
        .insert({
            name: data.name,
            address: data.address,
            organization_id: data.organizationId
        })

    if (error) return { error: error.message }

    revalidatePath('/settings')
    revalidatePath('/warehouses')
    return { success: true }
}

export async function updateLocation(locationId: string, data: { name?: string; address?: string }) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('locations')
        .update(data)
        .eq('id', locationId)

    if (error) return { error: error.message }

    revalidatePath('/settings')
    revalidatePath('/warehouses')
    return { success: true }
}

export async function deleteLocation(locationId: string) {
    const supabase = await createClient()

    // Prevent deleting default location
    const { data: location } = await supabase
        .from('locations')
        .select('is_default')
        .eq('id', locationId)
        .single()

    if (location?.is_default) {
        return { error: "Cannot delete the Default Warehouse." }
    }

    const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId)

    if (error) return { error: error.message }

    revalidatePath('/settings')
    revalidatePath('/warehouses')
    return { success: true }
}
