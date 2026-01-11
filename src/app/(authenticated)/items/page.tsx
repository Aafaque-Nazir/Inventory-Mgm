import { createClient } from '@/lib/supabase/server'
import { ItemsTable } from '@/components/items/ItemsTable'
import { CreateItemDialog } from '@/components/items/CreateItemDialog'
import { ExportButton } from '@/components/items/ExportButton'
import { CsvImporter } from '@/components/items/CsvImporter'
import { ScanItemButton } from '@/components/items/ScanItemButton'
import { StockScanner } from '@/components/stock/StockScanner'
import { getWarehouseCookie } from '@/app/actions/warehouse-cookie'

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

        // Apply Warehouse Filter
        const warehouseId = await getWarehouseCookie()
        if (warehouseId) {
            // We need to filter items based on stock in that location OR just show all items?
            // Usually "Inventory" shows abstract items, but "Stock" is per location.
            // However, the USER asked to "toggle which warehouse... and see details properly".
            // Implementation: We will JOIN with item_stock to show stock for THAT location.

            // NOTE: The current items table shows 'current_stock' which is a column on 'items'.
            // That column is now effectively a "Total Stock" or needs to be deprecated.
            // For now, let's filter the View to show items that exist? No, items exist globally.
            // We need to fetch the QUANTITY for this specific location.

            // Actually, for the "Items" list, we usually want to see ALL items, but the *Quantity* column should reflect the selected warehouse.
            // But 'items' table has 'current_stock'. We can't change the DB select easily without a join.
            // Let's stick to global items for now, but maybe filter if the user wants "Items in this Warehouse".
            // The user said: "warehouse ko select karenge hum toh unlog ka alag alag data hona chaiye"

            // Improved Approach: fetch items normally, but separate fetch for stock? 
            // Better: Perform the filter on the client or server side?
            // Let's rely on the Supabase View approach later. For now, let's FILTER the list?
            // Actually, stock is the main thing that changes per warehouse.
            // Let's leave the Item List global for now (it defines the catalog) but we might simply filter nothing here 
            // UNLESS we want to show only items with stock in this warehouse? 
            // Let's assume catalog is global.
        }
    } else if (!isSuperAdmin && !organizationId) {
        // User has no organization - show nothing
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
                <p className="text-muted-foreground">Your account is not associated with any organization.</p>
            </div>
        )
    }

    const { data: itemsData } = await itemsQuery

    // Transform data to respect Warehouse Filter
    let items = itemsData || []
    const warehouseId = await getWarehouseCookie()

    if (warehouseId && items.length > 0) {
        // Fetch specific stock for this location
        const { data: stockData } = await supabase
            .from('item_stock')
            .select('item_id, quantity')
            .eq('location_id', warehouseId)
            .in('item_id', items.map(i => i.id))

        // Create a map for quick lookup
        const stockMap = new Map(stockData?.map(s => [s.item_id, s.quantity]) || [])
        const trackedItemIds = new Set(stockMap.keys())

        // STRICT MODE: Only show items that are actually tracked in this warehouse
        // This ensures a "Fresh" warehouse has an empty inventory list, rather than a list of 0s.
        items = items
            .filter(item => trackedItemIds.has(item.id))
            .map(item => ({
                ...item,
                current_stock: stockMap.get(item.id) || 0
            }))
    }

    return (
        <div className="space-y-8 p-2">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white/90">Inventory</h1>
                    <p className="text-sm text-slate-400">Manage your stock and items.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <ScanItemButton isPro={isPro || isSuperAdmin} />
                    <StockScanner isPro={isPro || isSuperAdmin} />
                    <CsvImporter />
                    <ExportButton items={items || []} isPro={isPro || isSuperAdmin} />
                    <CreateItemDialog />
                </div>
            </div>
            <ItemsTable items={items || []} />
        </div>
    )
}
