import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TeamTab } from '@/components/settings/TeamTab'

export default async function TeamSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select(`
            *,
            organization:organizations(*)
        `)
        .eq('id', user.id)
        .single()

    // @ts-ignore
    const org = Array.isArray(profile?.organization) ? profile?.organization[0] : profile?.organization as any
    const orgId = profile.organization_id

    // Fetch Team Members
    const { data: members } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', orgId)

    // Fetch Pending Invitations
    const { data: invitations } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', orgId)
        .eq('status', 'PENDING')

    return (
        <div className="space-y-8 max-w-6xl">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-white">Team Management</h3>
                <p className="text-slate-400">
                    Invite and manage team members.
                </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl">
                <div className="p-8 border-b border-white/5 bg-white/5">
                    <h2 className="text-xl font-semibold text-white">Team</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Manage who has access to your organization. (Pro Feature)
                    </p>
                </div>

                <div className="p-8">
                    <TeamTab
                        members={members || []}
                        invitations={invitations || []}
                        plan={org.plan_type}
                        maxUsers={org.max_users}
                    />
                </div>
            </div>
        </div>
    )
}
