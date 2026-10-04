import { createClient } from '@/lib/supabase/server'
import { ItemsTable } from '@/components/items/ItemsTable'
import { getWarehouseCookie } from '@/app/actions/warehouse-cookie'
import { getCurrentProfile } from '@/lib/auth'
import { isProPlan, extractOrg } from '@/lib/subscription'
import dynamicImport from 'next/dynamic'

const CreateItemDialog = dynamicImport(
    () => import('@/components/items/CreateItemDialog').then((m) => m.CreateItemDialog)
)
const ExportButton = dynamicImport(
    () => import('@/components/items/ExportButton').then((m) => m.ExportButton)
)
const CsvImporter = dynamicImport(
    () => import('@/components/items/CsvImporter').then((m) => m.CsvImporter)
)
const ScanItemButton = dynamicImport(
    () => import('@/components/items/ScanItemButton').then((m) => m.ScanItemButton)
)
const StockScanner = dynamicImport(
    () => import('@/components/stock/StockScanner').then((m) => m.StockScanner)
)

export const dynamic = 'force-dynamic'

export default async function ItemsPage() {
    const supabase = await createClient()

    // 1. Concurrently get profile and warehouse cookie
    const [profile, warehouseId] = await Promise.all([
        getCurrentProfile(),
        getWarehouseCookie()
    ])

    const organizationId = profile?.organization_id || null
    const isSuperAdmin = profile?.is_super_admin || false
    const org = extractOrg(profile)
    const isPro = isProPlan(org, isSuperAdmin)

    if (!isSuperAdmin && !organizationId) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
                <p className="text-muted-foreground">Your account is not associated with any organization.</p>
            </div>
        )
    }

    // 2. Optimized single-query fetching based on warehouse filter
    let items: any[] = []

    if (warehouseId && organizationId && !isSuperAdmin) {
        // Direct single join query: fetch only items tracked in this warehouse with location quantity
        const { data: stockData } = await supabase
            .from('item_stock')
            .select('quantity, item:items(*)')
            .eq('location_id', warehouseId)

        items = (stockData || [])
            .filter((s: any) => s.item)
            .map((s: any) => ({
                ...s.item,
                current_stock: s.quantity
            }))
            .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''))
    } else {
        let itemsQuery = supabase.from('items').select('*').order('name')
        if (!isSuperAdmin && organizationId) {
            itemsQuery = itemsQuery.eq('organization_id', organizationId)
        }
        const { data: itemsData } = await itemsQuery
        items = itemsData || []
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90">Inventory</h1>
                    <p className="text-xs sm:text-sm text-slate-400">Manage your stock and items.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-wrap sm:w-auto">
                    <ScanItemButton isPro={isPro || isSuperAdmin} />
                    <StockScanner isPro={isPro || isSuperAdmin} />
                    <CsvImporter />
                    <ExportButton items={items || []} isPro={isPro || isSuperAdmin} />
                    <div className="col-span-2 sm:col-auto">
                        <CreateItemDialog />
                    </div>
                </div>
            </div>
            <ItemsTable items={items || []} />
        </div>
    )
}
