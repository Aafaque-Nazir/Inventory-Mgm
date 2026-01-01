import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

    // @ts-ignore
    const org = Array.isArray(profile?.organization) ? profile?.organization[0] : profile?.organization as any

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Subscription & Billing</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your subscription plan.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>
                        You are currently on the {org.plan_type} plan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4">
                        <h3 className="text-lg font-bold">Plan: {org.plan_type}</h3>
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
        </div>
    )
}
