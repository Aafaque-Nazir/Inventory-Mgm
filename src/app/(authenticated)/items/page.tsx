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

import { Button } from '@/components/ui/button'
import { ScanBarcode, Boxes, Upload, Download, Plus } from 'lucide-react'

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

    // 3. Check for expiring batches (within 30 days)
    let expiringBatches: any[] = []
    if (organizationId) {
        try {
            const targetDate = new Date()
            targetDate.setDate(targetDate.getDate() + 30)
            const targetDateStr = targetDate.toISOString().split('T')[0]

            const { data: batchData } = await supabase
                .from('item_batches')
                .select('id, batch_number, expiry_date, quantity, item:items(name, sku)')
                .eq('organization_id', organizationId)
                .gt('quantity', 0)
                .lte('expiry_date', targetDateStr)
                .order('expiry_date', { ascending: true })
                .limit(5)

            expiringBatches = batchData || []
        } catch {
            // Non-blocking if table is fresh
        }
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Inventory Catalog</h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">Product tracking, barcode SKU lookup, batch expiry dates & warehouse stock.</p>
                </div>

                {/* Clean, Unified SaaS Action Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Barcode Scanning Tools Segment */}
                    <div className="inline-flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 gap-1 w-full sm:w-auto justify-between sm:justify-start">
                        <ScanItemButton
                            isPro={isPro || isSuperAdmin}
                            trigger={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg gap-1.5 transition-all flex-1 sm:flex-initial"
                                >
                                    <ScanBarcode className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Scan to Add</span>
                                </Button>
                            }
                        />
                        <div className="h-4 w-px bg-white/10" />
                        <StockScanner
                            isPro={isPro || isSuperAdmin}
                            trigger={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg gap-1.5 transition-all flex-1 sm:flex-initial"
                                >
                                    <Boxes className="h-3.5 w-3.5 text-teal-400" />
                                    <span>Stock Scanner</span>
                                </Button>
                            }
                        />
                    </div>

                    {/* Data Tools Segment */}
                    <div className="inline-flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 gap-1 w-full sm:w-auto justify-between sm:justify-start">
                        <CsvImporter
                            trigger={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg gap-1.5 transition-all flex-1 sm:flex-initial"
                                >
                                    <Upload className="h-3.5 w-3.5 text-blue-400" />
                                    <span>Import CSV</span>
                                </Button>
                            }
                        />
                        <div className="h-4 w-px bg-white/10" />
                        <ExportButton
                            items={items || []}
                            isPro={isPro || isSuperAdmin}
                            trigger={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg gap-1.5 transition-all flex-1 sm:flex-initial"
                                >
                                    <Download className="h-3.5 w-3.5 text-purple-400" />
                                    <span>Export CSV</span>
                                </Button>
                            }
                        />
                    </div>

                    {/* Primary Hero CTA */}
                    <CreateItemDialog
                        trigger={
                            <Button className="h-10 px-5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl shadow-sm text-xs sm:text-sm gap-2 transition-all flex items-center justify-center w-full sm:w-auto">
                                <Plus className="h-4 w-4" />
                                <span>+ Add Item</span>
                            </Button>
                        }
                    />
                </div>
            </div>

            {/* Expiring Batches Alert Banner */}
            {expiringBatches.length > 0 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                            ⚠️
                        </div>
                        <div>
                            <p className="font-bold text-sm text-white">
                                {expiringBatches.length} batch(es) nearing expiry within 30 days
                            </p>
                            <p className="text-xs text-amber-200/80">
                                {expiringBatches.map((b: any) => `${b.item?.name || 'Item'} (Lot ${b.batch_number} - Exp ${b.expiry_date})`).join(' • ')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <ItemsTable items={items || []} />
        </div>
    )
}
