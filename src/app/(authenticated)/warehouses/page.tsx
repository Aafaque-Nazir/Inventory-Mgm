import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLocations } from '@/app/actions/locations'
import { WarehouseList } from '@/components/warehouses/WarehouseList'
import { Store } from 'lucide-react'

export default async function WarehousesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch Profile & Org Details
    const { data: profile } = await supabase
        .from('profiles')
        .select(`
            *,
            organization:organizations(*)
        `)
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) redirect('/onboarding')

    const orgId = profile.organization_id
    const org = profile.organization

    // Fetch Locations
    const locations = await getLocations(orgId)

    const isPro = org.plan_type === 'PRO' || org.plan_type === 'ENTERPRISE'

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Store className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Warehouses</h2>
                </div>
            </div>

            <WarehouseList
                locations={locations || []}
                organizationId={orgId}
                isPro={isPro}
            />
        </div>
    )
}
