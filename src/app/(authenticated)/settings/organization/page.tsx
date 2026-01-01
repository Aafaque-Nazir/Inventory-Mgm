import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Organization</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your business details and settings.
                </p>
            </div>
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
                    <div className="grid gap-2 pt-4">
                        <span className="font-semibold">Security:</span>
                        <div>
                            <Button variant="outline" asChild>
                                <Link href="/settings/audit">View Audit Logs 🛡️</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
