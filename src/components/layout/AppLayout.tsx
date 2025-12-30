'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Loader2, AlertCircle, Phone, Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { usePathname } from 'next/navigation'

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [loading, setLoading] = useState(true)
    const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const supabase = createClient()


    useEffect(() => {
        async function checkSubscription() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            // Get user's profile to check if super admin and get org_id
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id, is_super_admin')
                .eq('id', user.id)
                .single()

            if (profile?.is_super_admin) {
                setIsSuperAdmin(true)
                setSubscriptionStatus('ACTIVE') // Super admins always have access
                setLoading(false)
                return
            }

            if (!profile?.organization_id) {
                setSubscriptionStatus('NONE')
                setLoading(false)
                return
            }

            // Get organization subscription status
            const { data: org } = await supabase
                .from('organizations')
                .select('subscription_status')
                .eq('id', profile.organization_id)
                .single()

            setSubscriptionStatus(org?.subscription_status || 'NONE')
            setLoading(false)
        }

        checkSubscription()
        checkSubscription()
    }, [supabase, pathname])

    // Bypassing layout for onboarding to allow full-screen design and avoid subscription checks
    if (pathname === '/onboarding') {
        return <>{children}</>
    }

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Block access if subscription is not active (unless super admin)
    if (!isSuperAdmin && subscriptionStatus !== 'ACTIVE') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background to-muted p-4">
                <Card className="max-w-md w-full shadow-lg border-destructive/20">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <CardTitle className="text-2xl">Subscription {subscriptionStatus === 'EXPIRED' ? 'Expired' : 'Inactive'}</CardTitle>
                        <CardDescription className="text-base">
                            Your organization's subscription is currently not active. Your data is safe and will be available once renewed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <p className="text-sm font-medium text-center">Contact to renew your subscription:</p>
                            <div className="space-y-2">
                                <a
                                    href="mailto:aafaque@example.com"
                                    className="flex items-center gap-3 p-3 rounded-md bg-background hover:bg-accent transition-colors"
                                >
                                    <Mail className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="text-xs text-muted-foreground">aafaque@example.com</p>
                                    </div>
                                </a>
                                <a
                                    href="tel:+919876543210"
                                    className="flex items-center gap-3 p-3 rounded-md bg-background hover:bg-accent transition-colors"
                                >
                                    <Phone className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium">Phone</p>
                                        <p className="text-xs text-muted-foreground">+91 98765 43210</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={async () => {
                                await supabase.auth.signOut()
                                window.location.href = '/login'
                            }}
                        >
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
