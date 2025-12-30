import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { TeamTab } from '@/components/settings/TeamTab'

export default async function SettingsPage() {
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
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="organization">Organization</TabsTrigger>
                    <TabsTrigger value="team">Team & Access</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>
                                Manage your personal account settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20 border-2 border-primary/10">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="bg-primary/5 text-2xl font-medium text-primary">
                                        {profile.full_name?.[0] || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold">{profile.full_name}</h3>
                                    <p className="text-sm text-muted-foreground">Joined {format(new Date(profile.created_at || new Date()), 'MMMM yyyy')}</p>
                                </div>
                            </div>
                            <div className="grid gap-1 border-t pt-4">
                                <span className="text-sm font-medium text-muted-foreground">Email</span>
                                <span>{user.email}</span>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-sm font-medium text-muted-foreground">Role</span>
                                <span className="capitalize">{profile.role?.toLowerCase()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="organization" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization Details</CardTitle>
                            <CardDescription>
                                Manage your business details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid gap-1">
                                <span className="font-semibold">Name:</span>
                                <span>{org.name}</span>
                            </div>
                            <div className="grid gap-1">
                                <span className="font-semibold">Slug:</span>
                                <span>{org.slug}</span>
                            </div>
                            <div className="grid gap-2">
                                <span className="font-semibold">Current Plan:</span>
                                <div>
                                    <Badge variant="secondary" className="px-3 py-1">
                                        {org.plan_type}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="team" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Management</CardTitle>
                            <CardDescription>
                                Invite and manage your team members. (Pro Plan Feature)
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
                </TabsContent>

                <TabsContent value="billing" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription & Billing</CardTitle>
                            <CardDescription>
                                Manage your subscription plan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <h3 className="text-lg font-bold">Current Plan: {org.plan_type}</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {org.plan_type === 'FREE' ? 'Limited to 1 User & 50 Items' : 'Up to 5 Users & Unlimited Items'}
                                </p>
                                {org.plan_type === 'FREE' && (
                                    <Button asChild>
                                        <Link href="/pricing">Upgrade to Pro ($19/mo)</Link>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    )
}
