'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAdminOverviewStats } from './actions'
import { TicketSystem } from '@/components/super-admin/TicketSystem'
import { OrgManager } from '@/components/super-admin/OrgManager'
import { AnnouncementManager } from '@/components/super-admin/AnnouncementManager'
import { Building2, Users, CreditCard, TrendingUp, Activity, Megaphone, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { RevenueChart } from '@/components/super-admin/RevenueChart'

export default function SuperAdminPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await getAdminOverviewStats()
                if (data.error) {
                    console.error('Stats error:', data.error)
                } else {
                    setStats(data)
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h2>
                    <p className="text-muted-foreground">Overview of system performance and support.</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="orgs">Organizations</TabsTrigger>
                    <TabsTrigger value="broadcast">Broadcasting</TabsTrigger>
                    <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? '...' : `₹${stats?.mrr || 0}`}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? '...' : stats?.totalOrgs}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? '...' : stats?.totalUsers}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pro Subscriptions</CardTitle>
                                <CreditCard className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? '...' : stats?.proOrgs}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Enterprise Plan</CardTitle>
                                <TrendingUp className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? '...' : stats?.entOrgs}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Organizations */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Recent Organizations</CardTitle>
                                <CardDescription>
                                    New companies joined recently.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {loading ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">Loading recent activity...</div>
                                    ) : stats?.recentOrgs?.map((org: any) => (
                                        <div key={org.id} className="flex items-center">
                                            <div className="h-9 w-9 rounded-full border bg-muted flex items-center justify-center">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{org.name}</p>
                                                <p className="text-sm text-muted-foreground">{org.slug}</p>
                                            </div>
                                            <div className="ml-auto font-medium">
                                                <span className={`text-xs px-2 py-1 rounded-full ${org.plan_type === 'PRO' ? 'bg-amber-100 text-amber-700' :
                                                    org.plan_type === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {org.plan_type}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>System Health</CardTitle>
                                <CardDescription>Operational status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Activity className="h-4 w-4 text-green-500" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">All Systems Operational</p>
                                        <p className="text-sm text-muted-foreground">Database, Auth, and Storage online.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Revenue Chart */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <RevenueChart data={stats?.revenueHistory || []} />
                    </div>
                </TabsContent>

                <TabsContent value="orgs">
                    <OrgManager />
                </TabsContent>

                <TabsContent value="broadcast">
                    <AnnouncementManager />
                </TabsContent>

                <TabsContent value="tickets">
                    <Card>
                        <CardContent className="pt-6">
                            <TicketSystem />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
