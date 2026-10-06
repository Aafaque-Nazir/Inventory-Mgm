import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Zap, Sparkles, CheckCircle2 } from 'lucide-react'

export default async function BillingSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization:organizations(*)')
        .eq('id', user.id)
        .single()

    const org = Array.isArray(profile?.organization) ? profile?.organization[0] : profile?.organization as any

    const isPro = org?.plan_type === 'PRO'
    const endDate = org?.subscription_end_date ? new Date(org.subscription_end_date) : null
    const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-white">Subscription & Billing</h3>
                <p className="text-slate-400 text-sm">
                    Manage your organization's subscription plan, godowns, and billing details.
                </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0e1410]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Active Plan</span>
                            <h2 className="text-2xl font-extrabold text-white mt-0.5 flex items-center gap-2.5">
                                <span>{isPro ? 'Pro Plan (Distributor Growth)' : 'Starter Plan (Free)'}</span>
                                <span className={`px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${isPro
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-white/10 text-slate-300 border border-white/10'
                                    }`}>
                                    {org?.subscription_status || org?.plan_type || 'FREE'}
                                </span>
                            </h2>
                        </div>
                        <Button asChild className="bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold text-xs h-9 rounded-xl shadow-md shadow-emerald-500/20">
                            <Link href="/pricing">
                                <Zap className="h-3.5 w-3.5 mr-1.5 fill-current" />
                                {isPro ? 'Manage or Extend Plan' : 'Upgrade to Pro'}
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                    {/* Plan Summary Card */}
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-white/5 text-xs">
                            <div>
                                <span className="text-slate-400 block mb-1">Max Products / SKUs</span>
                                <span className="text-sm font-bold text-white">{isPro ? 'Unlimited (100k+)' : 'Up to 200 Products'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-1">Allowed Godowns / Warehouses</span>
                                <span className="text-sm font-bold text-white">{isPro ? 'Up to 5 Godowns' : '1 Central Godown'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-1">Team Accounts</span>
                                <span className="text-sm font-bold text-white">{isPro ? 'Up to 5 Users (Roles)' : '1 Admin Account'}</span>
                            </div>
                        </div>

                        {isPro && endDate && (
                            <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-slate-400">
                                    Subscription Valid Until: <strong className="text-white">{endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                                </span>
                                {daysRemaining !== null && (
                                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                        {daysRemaining} days remaining
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {!isPro && (
                        <div className="rounded-2xl p-5 bg-[#101612] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-emerald-400" />
                                    <h4 className="text-sm font-bold text-white">Founding Member Offer — Save 58%</h4>
                                </div>
                                <p className="text-xs text-slate-300 max-w-xl">
                                    Get Pro for just <strong>₹999/year (~₹83/month)</strong>. Unlock unlimited SKUs, up to 5 Godowns, wholesale purchase orders, and team roles.
                                </p>
                            </div>
                            <Button asChild className="bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-extrabold text-xs h-9 rounded-xl shadow-md shadow-emerald-500/25 shrink-0">
                                <Link href="/pricing">View Plans</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
