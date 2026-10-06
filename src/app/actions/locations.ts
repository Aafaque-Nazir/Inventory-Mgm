'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { getCurrentProfile } from '@/lib/auth'

export async function getLocations(organizationId?: string) {
    const supabase = await createClient()
    let targetOrgId = organizationId

    if (!targetOrgId) {
        const profile = await getCurrentProfile()
        targetOrgId = profile?.organization_id
    }

    if (!targetOrgId) return []

    const { data: locations, error } = await supabase
        .from('locations')
        .select('*')
        .eq('organization_id', targetOrgId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching locations:', error)
        return []
    }

    return locations
}

export async function createLocation(data: { name: string; address?: string; organizationId?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, role, is_super_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No organization found' }
    if (profile.role !== 'ADMIN' && !profile.is_super_admin) {
        return { error: 'Only Admins can create warehouses' }
    }

    const orgId = profile.organization_id

    // 1. Get current plan & limit
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('plan_type, subscription_status')
        .eq('id', orgId)
        .single()

    if (orgError) return { error: "Failed to fetch organization details" }

    // 2. Count existing locations
    const { count, error: countError } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)

    if (countError) return { error: "Failed to count locations" }

    // 3. Enforce Limit (Free = 1, Pro = 5 Godowns)
    const isPro = org.plan_type === 'PRO' || profile.is_super_admin
    const maxLocations = isPro ? 5 : 1

    if (!isPro && (count || 0) >= 1) {
        return { error: 'Free Plan includes 1 Warehouse/Godown. Upgrade to Pro to manage up to 5 Godowns.' }
    }

    if ((count || 0) >= maxLocations && !profile.is_super_admin) {
        return { error: `Pro Plan supports up to ${maxLocations} Warehouses/Godowns.` }
    }

    const { error } = await supabase
        .from('locations')
        .insert({
            name: data.name,
            address: data.address,
            organization_id: orgId
        })

    if (error) return { error: error.message }

    revalidatePath('/settings')
    revalidatePath('/warehouses')
    return { success: true }
}

export async function updateLocation(locationId: string, data: { name?: string; address?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, role, is_super_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'Unauthorized' }
    if (profile.role !== 'ADMIN' && !profile.is_super_admin) {
        return { error: 'Only Admins can update warehouses' }
    }

    const { error } = await supabase
        .from('locations')
        .update(data)
        .eq('id', locationId)
        .eq('organization_id', profile.organization_id)

    if (error) return { error: error.message }

    revalidatePath('/settings')
    revalidatePath('/warehouses')
    return { success: true }
}

export async function deleteLocation(locationId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, role, is_super_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'Unauthorized' }
    if (profile.role !== 'ADMIN' && !profile.is_super_admin) {
        return { error: 'Only Admins can delete warehouses' }
    }

    // Prevent deleting default location
    const { data: location } = await supabase
        .from('locations')
        .select('is_default')
        .eq('id', locationId)
        .eq('organization_id', profile.organization_id)
        .single()

    if (!location) {
        return { error: "Warehouse not found" }
    }

    if (location?.is_default) {
        return { error: "Cannot delete the Default Warehouse." }
    }

    const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId)
        .eq('organization_id', profile.organization_id)

    if (error) return { error: error.message }

    revalidatePath('/settings')
    revalidatePath('/warehouses')
    return { success: true }
}
