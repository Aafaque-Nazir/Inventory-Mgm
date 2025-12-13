'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, LayoutDashboard, Building, Users, ArrowLeft, Shield, Menu } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

const superAdminNav = [
    { name: 'Organizations', href: '/super-admin', icon: Building },
    // Future: { name: 'All Users', href: '/super-admin/users', icon: Users },
    // Future: { name: 'System Settings', href: '/super-admin/settings', icon: Settings },
]

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [loading, setLoading] = useState(true)
    const [mobileOpen, setMobileOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                router.replace('/login')
                return
            }

            // Check if user is super admin in profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('is_super_admin')
                .eq('id', user.id)
                .single()

            if (profileError || !profile?.is_super_admin) {
                console.error('Access denied: Not a super admin')
                router.replace('/dashboard') // Redirect normal users back to dashboard
                return
            }

            setIsAuthorized(true)
            setLoading(false)
        }

        checkAuth()
    }, [router, supabase])

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAuthorized) {
        return null
    }

    const NavContent = () => (
        <>
            <Link
                href="/dashboard"
                className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors mb-4"
            >
                <ArrowLeft className="mr-3 h-4 w-4" />
                Back to Dashboard
            </Link>
            <div className="border-t pt-4">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Super Admin
                </p>
                {superAdminNav.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <item.icon
                                className={cn(
                                    'mr-3 h-5 w-5 flex-shrink-0',
                                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
                                )}
                            />
                            {item.name}
                        </Link>
                    )
                })}
            </div>
        </>
    )

    return (
        <div className="flex min-h-screen bg-muted/40">
            {/* Desktop Sidebar */}
            <div className="hidden border-r bg-card md:flex md:w-64 md:flex-col">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/super-admin" className="flex items-center gap-2 text-xl font-bold tracking-tight">
                        <Shield className="h-5 w-5 text-purple-500" />
                        <span className="text-purple-500">Super</span>Admin
                    </Link>
                </div>
                <nav className="flex-1 space-y-1 px-3 py-4">
                    <NavContent />
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <div className="flex h-16 items-center border-b px-6">
                                <SheetTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
                                    <Shield className="h-5 w-5 text-purple-500" />
                                    <span className="text-purple-500">Super</span>Admin
                                </SheetTitle>
                            </div>
                            <nav className="flex-1 space-y-1 px-3 py-4">
                                <NavContent />
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="flex items-center gap-2 font-bold">
                        <Shield className="h-5 w-5 text-purple-500" />
                        <span className="text-purple-500">Super</span>Admin
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
