import { redirect } from 'next/navigation'
import { getLocations } from '@/app/actions/locations'
import { WarehouseList } from '@/components/warehouses/WarehouseList'
import { getCurrentProfile } from '@/lib/auth'

export default async function WarehousesPage() {
    const profile = await getCurrentProfile()

    if (!profile) redirect('/login')
    if (!profile?.organization_id) redirect('/onboarding')

    const orgId = profile.organization_id
    const org = (profile.organization || (profile as any).organizations) as any

    // Fetch Locations
    const locations = await getLocations(orgId)

    const isPro = org.plan_type === 'PRO' || org.plan_type === 'ENTERPRISE'

    return (
        <div className="flex-1 space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90">Warehouses</h1>
                    <p className="text-xs sm:text-sm text-slate-400">Manage your inventory locations.</p>
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
