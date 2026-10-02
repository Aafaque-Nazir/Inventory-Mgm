'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Loader2 } from 'lucide-react'
import { WarehouseProvider } from '@/context/WarehouseContext'

import { usePathname } from 'next/navigation'

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const mainRef = useRef<HTMLElement>(null)
    const [loading, setLoading] = useState(true)
    const [_subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
    const [_isSuperAdmin, setIsSuperAdmin] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        }
    }, [pathname])


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
            <div className="flex h-screen bg-background overflow-hidden">
                <Sidebar />
                <div className="flex flex-1 flex-col min-w-0 min-h-0 h-screen relative overflow-hidden">
                    <div className="shrink-0 z-20 w-full backdrop-blur-xl bg-background/90 border-b shadow-sm">
                        <Topbar />
                    </div>
                    <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto p-3 md:p-5 w-full max-w-full custom-scrollbar">
                        {children}
                    </main>
                </div>
            </div>
        </WarehouseProvider>
    )
}
