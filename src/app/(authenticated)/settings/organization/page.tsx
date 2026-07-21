import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default async function OrganizationSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization:organizations(*)')
        .eq('id', user.id)
        .single()

    // @ts-ignore
    const org = Array.isArray(profile?.organization) ? profile?.organization[0] : profile?.organization as any

    if (!org) redirect('/onboarding')

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-white">Organization</h3>
                <p className="text-slate-400">
                    Manage your business details and settings.
                </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl">
                <div className="p-8 border-b border-white/5 bg-white/5">
                    <h2 className="text-xl font-semibold text-white">Organization Details</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        View and manage your organization's information.
                    </p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-2">
                            <span className="text-sm font-medium text-slate-400">Organization Name</span>
                            <div className="px-4 py-3 rounded-xl bg-black/20 border border-white/5 text-white font-medium">
                                {org.name}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <span className="text-sm font-medium text-slate-400">Organization Slug (ID)</span>
                            <div className="px-4 py-3 rounded-xl bg-black/20 border border-white/5 text-slate-400 font-mono text-sm">
                                {org.slug}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <span className="text-sm font-medium text-slate-400">Current Plan</span>
                        <div>
                            <span className={org.plan_type === 'PRO'
                                ? "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/10 text-slate-300 border border-white/10"
                            }>
                                {org.plan_type}
                            </span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-indigo-900/10 border border-indigo-500/10">
                            <div>
                                <h4 className="font-medium text-white">Security & Audit</h4>
                                <p className="text-sm text-slate-400 mt-1">View the audit logs for sensitive actions.</p>
                            </div>
                            <Button variant="outline" asChild className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200">
                                <Link href="/settings/audit">View Audit Logs 🛡️</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
