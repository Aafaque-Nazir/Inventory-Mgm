import { createClient } from '@/lib/supabase/server'
import { ItemsTable } from '@/components/items/ItemsTable'
import { CreateItemDialog } from '@/components/items/CreateItemDialog'
import { ExportButton } from '@/components/items/ExportButton'
import { CsvImporter } from '@/components/items/CsvImporter'
import { ScanItemButton } from '@/components/items/ScanItemButton'
import { StockScanner } from '@/components/stock/StockScanner'

export const dynamic = 'force-dynamic'

export default async function ItemsPage() {
    const supabase = await createClient()

    // Get current user's organization_id from their profile
    const { data: { user } } = await supabase.auth.getUser()

    let organizationId: string | null = null
    let isSuperAdmin = false
    let isPro = false

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, is_super_admin, organizations(plan_type, subscription_end_date)')
            .eq('id', user.id)
            .single()

        organizationId = profile?.organization_id || null
        isSuperAdmin = profile?.is_super_admin || false

        // Check Pro Status
        // @ts-ignore
        if (profile?.organizations?.plan_type === 'PRO') {
            // @ts-ignore
            const endDate = profile.organizations.subscription_end_date
            if (endDate && new Date(endDate) > new Date()) {
                isPro = true
            }
        }
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
                    <p className="text-muted-foreground">Manage your stock and items.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <ScanItemButton />
                    <StockScanner />
                    <CsvImporter />
                    <ExportButton items={items || []} isPro={isPro || isSuperAdmin} />
                    <CreateItemDialog />
                </div>
            </div>
            <ItemsTable items={items || []} />
        </div>
    )
}
