'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAdminOverviewStats } from './actions'
import { TicketSystem } from '@/components/super-admin/TicketSystem'
import { OrgManager } from '@/components/super-admin/OrgManager'
import { AnnouncementManager } from '@/components/super-admin/AnnouncementManager'
import { Building2, Users, CreditCard, TrendingUp, DollarSign } from 'lucide-react'
import { RevenueChart } from '@/components/super-admin/RevenueChart'

import { StatCard } from '@/components/dashboard/StatCard'

export default function SuperAdminPage() {
    const [stats, setStats] = useState<unknown>(null)
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
        <div className="flex-1 space-y-10 p-4 md:p-8 pt-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                        Super Admin <span className="text-indigo-400">Dashboard</span>
                    </h2>
                    <p className="text-slate-400 text-sm md:text-lg">System performance, growth, and organizational health.</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-8">
                <div className="p-1 w-full md:w-fit rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl overflow-x-auto touch-pan-x">
                    <TabsList className="bg-transparent h-12 gap-1 p-0 flex w-max md:w-full">
                        <TabsTrigger
                            value="overview"
                            className="h-10 px-6 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 font-medium transition-all whitespace-nowrap"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="orgs"
                            className="h-10 px-6 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 font-medium transition-all whitespace-nowrap"
                        >
                            Organizations
                        </TabsTrigger>
                        <TabsTrigger
                            value="broadcast"
                            className="h-10 px-6 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 font-medium transition-all whitespace-nowrap"
                        >
                            Broadcasting
                        </TabsTrigger>
                        <TabsTrigger
                            value="tickets"
                            className="h-10 px-6 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 font-medium transition-all whitespace-nowrap"
                        >
                            Support
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-10 outline-none">
                    {/* Stats Cards - Sleek Overhaul */}
                    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        <StatCard
                            title="Revenue"
                            value={loading ? '...' : `₹${stats?.mrr || 0}`}
                            icon={<DollarSign className="h-5 w-5" />}
                            color="green"
                            trend={{ value: 14.2, label: "Growth", positive: true }}
                            delay={0.1}
                        />
                        <StatCard
                            title="Organizations"
                            value={loading ? '...' : stats?.totalOrgs || 0}
                            icon={<Building2 className="h-5 w-5" />}
                            color="blue"
                            delay={0.2}
                        />
                        <StatCard
                            title="Total Users"
                            value={loading ? '...' : stats?.totalUsers || 0}
                            icon={<Users className="h-5 w-5" />}
                            color="purple"
                            delay={0.3}
                        />
                        <StatCard
                            title="Pro Orgs"
                            value={loading ? '...' : stats?.proOrgs || 0}
                            icon={<CreditCard className="h-5 w-5" />}
                            color="orange"
                            trend={{ value: 5.4, label: "Upgrades", positive: true }}
                            delay={0.4}
                        />
                        <StatCard
                            title="Enterprise"
                            value={loading ? '...' : stats?.entOrgs || 0}
                            icon={<TrendingUp className="h-5 w-5" />}
                            color="pink"
                            delay={0.5}
                        />
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                        {/* Revenue Chart Section */}
                        <div className="md:col-span-2 lg:col-span-4 rounded-3xl overflow-hidden">
                            <RevenueChart data={stats?.revenueHistory || []} />
                        </div>

                        {/* System Health Section - Sleek & Modern */}
                        <div className="md:col-span-2 lg:col-span-3">
                            <div className="h-full rounded-[2rem] border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 flex flex-col backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tight">System Health</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Operational Status</p>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Online</span>
                                    </div>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-4">
                                        <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                        <div>
                                            <p className="text-xs font-bold text-white uppercase tracking-wider">All Systems Operational</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Core services performance: 100%</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Latency</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-bold text-white">38</span>
                                                <span className="text-[10px] text-slate-500">ms</span>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Uptime</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-bold text-white">99.9</span>
                                                <span className="text-[10px] text-slate-500">%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Server Load</span>
                                            <span className="text-xs font-bold text-white">12.4%</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full w-[12.4%] bg-indigo-500/50" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/[0.05] flex items-center justify-between font-mono">
                                    <span className="text-[10px] text-slate-600 uppercase">Nv_V20.10.x</span>
                                    <button className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Access Logs →</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Organizations */}
                    <div className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl">
                        <div className="p-6 sm:p-8 border-b border-white/5 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">Recent Organizations</h3>
                                <p className="text-sm text-slate-400">New companies that joined the platform recently</p>
                            </div>
                            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white hover:bg-white/10 transition-all">View All</button>
                        </div>
                        <div className="p-5 sm:p-6">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {loading ? (
                                    <div className="col-span-full py-12 text-center text-slate-500 animate-pulse">Loading amazing new companies...</div>
                                ) : stats?.recentOrgs?.map((org: unknown) => (
                                    <div key={org.id} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-indigo-500/20 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                <Building2 className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{org.name}</p>
                                                <p className="text-xs text-slate-400 truncate">/{org.slug}</p>
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider shadow-lg ${org.plan_type === 'PRO' ? 'bg-amber-500 text-white shadow-amber-500/20' :
                                                org.plan_type === 'ENTERPRISE' ? 'bg-purple-500 text-white shadow-purple-500/20' :
                                                    'bg-slate-700 text-slate-300'
                                                }`}>
                                                {org.plan_type}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="orgs" className="outline-none">
                    <OrgManager />
                </TabsContent>

                <TabsContent value="broadcast" className="outline-none">
                    <AnnouncementManager />
                </TabsContent>

                <TabsContent value="tickets" className="outline-none">
                    <div className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl p-8">
                        <TicketSystem />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
