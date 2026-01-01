'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Loader2, AlertCircle, Phone, Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WarehouseProvider } from '@/context/WarehouseContext'

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

            // Get organization subscription status and end date
            const { data: org } = await supabase
                .from('organizations')
                .select('subscription_status, subscription_end_date')
                .eq('id', profile.organization_id)
                .single()

            let status = org?.subscription_status || 'NONE'

            // Check for Expiry
            if ((status === 'ACTIVE' || status === 'TRIALING') && org?.subscription_end_date) {
                const expiryDate = new Date(org.subscription_end_date)
                if (expiryDate < new Date()) {
                    status = 'EXPIRED'
                }
            }

            setSubscriptionStatus(status)
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


    return (
        <WarehouseProvider>
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Topbar />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </WarehouseProvider>
    )
}
