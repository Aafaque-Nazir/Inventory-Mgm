import { createClient } from '@/lib/supabase/server'
import { ItemsTable } from '@/components/items/ItemsTable'
import { CreateItemDialog } from '@/components/items/CreateItemDialog'

export const dynamic = 'force-dynamic'

export default async function ItemsPage() {
    const supabase = await createClient()

    // Get current user's organization_id from their profile
    const { data: { user } } = await supabase.auth.getUser()

    let organizationId: string | null = null
    let isSuperAdmin = false

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, is_super_admin')
            .eq('id', user.id)
            .single()

        organizationId = profile?.organization_id || null
        isSuperAdmin = profile?.is_super_admin || false
    }

    // Build query with tenant filter (unless Super Admin)
    let itemsQuery = supabase.from('items').select('*').order('name')

    if (!isSuperAdmin && organizationId) {
        itemsQuery = itemsQuery.eq('organization_id', organizationId)
    } else if (!isSuperAdmin && !organizationId) {
        // User has no organization - show nothing
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
                <p className="text-muted-foreground">Your account is not associated with any organization.</p>
            </div>
        )
    }

    const { data: items } = await itemsQuery

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
                <CreateItemDialog />
            </div>
            <ItemsTable items={items || []} />
        </div>
    )
}
