'use client'

import { useEffect, useRef } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { WarehouseProvider } from '@/context/WarehouseContext'
import { UserProvider } from '@/context/UserContext'
import { usePathname } from 'next/navigation'
import { Profile } from '@/types'

interface AppLayoutProps {
    children: React.ReactNode
    initialProfile?: (Profile & { [key: string]: any }) | null
    initialEmail?: string | null
}

export function AppLayout({ children, initialProfile = null, initialEmail = null }: AppLayoutProps) {
    const pathname = usePathname()
    const mainRef = useRef<HTMLElement>(null)

    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        }
    }, [pathname])

    // Bypassing layout for onboarding to allow full-screen design
    if (pathname === '/onboarding') {
        return <>{children}</>
    }

    return (
        <UserProvider initialProfile={initialProfile} initialEmail={initialEmail}>
            <WarehouseProvider initialOrgId={initialProfile?.organization_id}>
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
        </UserProvider>
    )
}
