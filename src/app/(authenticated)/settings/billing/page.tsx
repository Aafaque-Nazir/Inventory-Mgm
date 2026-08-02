import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default async function BillingSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization:organizations(*)')
        .eq('id', user.id)
        .single()

    // @ts-expect-error -- third-party type mismatch
    const org = Array.isArray(profile?.organization) ? profile?.organization[0] : profile?.organization as unknown

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-white">Subscription & Billing</h3>
                <p className="text-slate-400">
                    Manage your subscription plan.
                </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl">
                <div className="p-8 border-b border-white/5 bg-white/5">
                    <h2 className="text-xl font-semibold text-white">Current Plan</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        You are currently on the <span className="font-semibold text-white">{org.plan_type}</span> plan.
                    </p>
                </div>

                <div className="p-8">
                    <div className="rounded-2xl border border-white/5 bg-black/20 p-6 flex flex-col items-start gap-4">
                        <div className="flex justify-between w-full items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    Plan: {org.plan_type}
                                </h3>
                                <p className="text-slate-400 mt-2">
                                    {org.plan_type === 'FREE' ? 'Limited to 1 User & 50 Items' : 'Up to 5 Users & Unlimited Items'}
                                </p>
                            </div>
                            <div className={`px-4 py-1 rounded-full border text-xs font-bold uppercase ${org.plan_type === 'FREE'
                                ? 'border-slate-500/30 bg-slate-500/10 text-slate-400'
                                : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
                                }`}>
                                {org.plan_type === 'FREE' ? 'Standard' : 'Premium'}
                            </div>
                        </div>

                        {org.plan_type === 'FREE' ? (
                            <div className="w-full mt-4 p-4 rounded-xl bg-indigo-900/40 border border-indigo-500/20">
                                <p className="text-sm text-indigo-200 mb-4 font-medium">
                                    Unlock advanced features like team members, unlimited items, and priority support.
                                </p>
                                <Button asChild className="w-full sm:w-auto bg-white text-indigo-950 hover:bg-slate-200 font-bold">
                                    <Link href="/pricing">Upgrade to Pro ($19/mo)</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="w-full mt-4">
                                <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5">
                                    Manage Subscription (Stripe)
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
