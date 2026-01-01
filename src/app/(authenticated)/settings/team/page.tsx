import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Team Management</h3>
                <p className="text-sm text-muted-foreground">
                    Invite and manage team members.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Team</CardTitle>
                    <CardDescription>
                        Manage who has access to your organization. (Pro Feature)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TeamTab
                        members={members || []}
                        invitations={invitations || []}
                        plan={org.plan_type}
                        maxUsers={org.max_users}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
