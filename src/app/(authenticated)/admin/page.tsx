import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Package, TrendingUp } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function AdminOverviewPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Verify Super Admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_super_admin) {
        return <div className="p-8">Access Denied</div>
    }

    // Fetch Global Stats
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: orgCount } = await supabase.from('organizations').select('*', { count: 'exact', head: true })
    const { count: itemCount } = await supabase.from('items').select('*', { count: 'exact', head: true })
    const { count: invoiceCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Super Admin Overview</h1>
            <p className="text-muted-foreground">Global system statistics and management.</p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount}</div>
                        <p className="text-xs text-muted-foreground">Registered users across all orgs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orgCount}</div>
                        <p className="text-xs text-muted-foreground">Active tenant companies</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{itemCount}</div>
                        <p className="text-xs text-muted-foreground">Global inventory count</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{invoiceCount}</div>
                        <p className="text-xs text-muted-foreground">Sales recorded globally</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
