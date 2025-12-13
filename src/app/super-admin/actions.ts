'use server'

import { createClient } from '@supabase/supabase-js'

export async function createTenantUser(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const organizationId = formData.get('organizationId') as string
    const role = formData.get('role') as string

    if (!email || !password || !organizationId) {
        return { error: 'Missing required fields' }
    }

    // Initialize Supabase Admin Client
    // process.env.SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    try {
        // 1. Create the user in Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm for manually created users
            user_metadata: {
                full_name: fullName,
                role: role || 'STOREKEEPER',
                organization_id: organizationId,
                temp_password: password // Store for demo visibility
            }
        })

        if (authError) throw authError

        // 2. Profile creation should be handled by the Database Trigger (handle_new_user)
        // We included the metadata above, so the trigger will pick it up and set org_id correcty.

        return { success: true, userId: authData.user.id }

    } catch (error: any) {
        console.error('Create User Error:', error)
        return { error: error.message }
    }
}

export async function deleteOrganization(orgId: string) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    try {
        // RLS policy check is bypassed by Service Role, but we should ensure only Super Admin calls this via middleware protection on the route.
        // We delete the organization. The database constraints (if set up) will cascade delete Items, Suppliers, etc.
        const { error } = await supabaseAdmin.from('organizations').delete().eq('id', orgId)
        if (error) throw error
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function deleteTenantUser(userId: string) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    try {
        // Delete from Auth. This cascades to public.profiles via ON DELETE CASCADE on profiles.id
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (error) throw error
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function updateSubscriptionStatus(orgId: string, status: string) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    try {
        const { error } = await supabaseAdmin
            .from('organizations')
            .update({ subscription_status: status })
            .eq('id', orgId)

        if (error) throw error
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function setSubscriptionPeriod(
    orgId: string,
    periodType: 'MONTHLY' | 'YEARLY' | 'CUSTOM',
    customStartDate?: string,
    customEndDate?: string
) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    try {
        const now = new Date()
        let startDate = now
        let endDate: Date

        if (periodType === 'MONTHLY') {
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
        } else if (periodType === 'YEARLY') {
            endDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        } else {
            // CUSTOM
            if (!customStartDate || !customEndDate) {
                return { error: 'Custom dates are required' }
            }
            startDate = new Date(customStartDate)
            endDate = new Date(customEndDate)
        }

        const { error } = await supabaseAdmin
            .from('organizations')
            .update({
                subscription_status: 'ACTIVE',
                subscription_start_date: startDate.toISOString(),
                subscription_end_date: endDate.toISOString()
            })
            .eq('id', orgId)

        if (error) throw error
        return { success: true, endDate: endDate.toISOString() }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function updateOrganization(orgId: string, name: string) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    try {
        const { error } = await supabaseAdmin
            .from('organizations')
            .update({ name })
            .eq('id', orgId)

        if (error) throw error
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function seedOrganizationData(orgId: string) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    try {
        // 1. Create Dummy Suppliers
        const suppliersData = [
            { name: 'Acme Supplies', contact_person: 'John Smith', email: 'john@acme.com', phone: '555-0101', address: '123 Industrial Way', organization_id: orgId },
            { name: 'Global Logistics', contact_person: 'Jane Doe', email: 'jane@globallog.com', phone: '555-0102', address: '456 Shipping Lane', organization_id: orgId },
            { name: 'Fresh Farms', contact_person: 'Bob Farmer', email: 'bob@freshfarms.com', phone: '555-0103', address: '789 Green St', organization_id: orgId }
        ]

        const { data: suppliers, error: supplierError } = await supabaseAdmin
            .from('suppliers')
            .insert(suppliersData)
            .select()

        if (supplierError) throw supplierError

        const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
        const itemsData = [
            { name: 'Widget A', sku: `WID-${suffix}-001`, category: 'Parts', unit: 'pcs', current_stock: 100, min_stock: 20, organization_id: orgId },
            { name: 'Gadget B', sku: `GAD-${suffix}-002`, category: 'Electronics', unit: 'units', current_stock: 50, min_stock: 10, organization_id: orgId },
            { name: 'Tool C', sku: `TOOL-${suffix}-003`, category: 'Tools', unit: 'pcs', current_stock: 75, min_stock: 15, organization_id: orgId },
            { name: 'Material D', sku: `MAT-${suffix}-004`, category: 'Raw Materials', unit: 'kg', current_stock: 500, min_stock: 100, organization_id: orgId }
        ]

        const { data: items, error: itemError } = await supabaseAdmin
            .from('items')
            .insert(itemsData)
            .select()

        if (itemError) throw itemError

        // 3. Create Dummy Stock Movements (History)
        const movementsData = items.flatMap(item => [
            { item_id: item.id, type: 'IN', quantity: item.current_stock + 20, reason: 'Initial Stock', organization_id: orgId, created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }, // 7 days ago
            { item_id: item.id, type: 'OUT', quantity: 20, reason: 'Customer Order #1', organization_id: orgId, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() } // 3 days ago
        ])

        const { error: movementError } = await supabaseAdmin
            .from('stock_movements')
            .insert(movementsData)

        if (movementError) throw movementError

        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}
