'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Package,
    ArrowRightLeft,
    Users,
    ShoppingCart,
    BarChart3,
    CreditCard,
    Lock,
    HelpCircle,
    Settings,
    Crown,
    Sparkles,
    Clock,
    Store,
    Book
} from 'lucide-react'
import { differenceInDays } from 'date-fns'
import { Button } from '@/components/ui/button'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/items', icon: Package },
    { name: 'Stock Movements', href: '/stock', icon: ArrowRightLeft },
    { name: 'Suppliers', href: '/suppliers', icon: Users },
    { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Warehouses', href: '/warehouses', icon: Store },
    { name: 'Pricing', href: '/pricing', icon: CreditCard },
    { name: 'User Guide', href: '/guide', icon: Book },
    { name: 'Help & Support', href: '/help', icon: HelpCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const supabase = createClient()
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const [planType, setPlanType] = useState<string>('FREE')
    const [trialDays, setTrialDays] = useState<number | null>(null)

    useEffect(() => {
        async function checkRole() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Fetch Profile and Org Plan
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_super_admin, organizations(plan_type, subscription_end_date, subscription_status)')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    if (profile.is_super_admin) setIsSuperAdmin(true)

                    let effectivePlan = 'FREE'
                    // @ts-ignore
                    if (profile.organizations?.plan_type) {
                        // @ts-ignore
                        effectivePlan = profile.organizations.plan_type

                        // Check for Expiry
                        // @ts-ignore
                        if (profile.organizations?.subscription_end_date) {
                            // @ts-ignore
                            // @ts-ignore
                            const expiry = new Date(profile.organizations.subscription_end_date)

                            // Check for Trial
                            // @ts-ignore
                            if (profile.organizations.subscription_status === 'TRIALING') {
                                const days = differenceInDays(expiry, new Date())
                                setTrialDays(days >= 0 ? days + 1 : 0)
                            }
                            if (expiry < new Date()) {
                                effectivePlan = 'FREE' // Downgrade locally
                            }
                        }
                    }
                    setPlanType(effectivePlan)
                }
            }
        }
        checkRole()
    }, [])

    const finalNavigation = [
        ...navigation,
        ...(isSuperAdmin ? [{ name: 'Super Admin', href: '/super-admin', icon: Lock }] : [])
    ]

    return (
        <div className="hidden border-r bg-card md:flex md:w-64 md:flex-col">
            <div className="flex bg-card h-16 items-center border-b px-6">
                <Link href="/dashboard" className="text-xl font-bold tracking-tight">Inventory <span className="text-primary">Management</span></Link>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {trialDays !== null && trialDays > 0 && (
                    <div className="mb-4 rounded-md bg-gradient-to-r from-orange-500/10 to-pink-500/10 p-3 border border-orange-500/20">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-4 w-4 text-orange-500" />
                            <span className="text-xs font-bold text-orange-600">Pro Trial Active</span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {trialDays} days remaining
                        </p>
                        <Button variant="outline" size="sm" className="w-full mt-2 h-7 text-xs border-orange-200 bg-white/50 hover:bg-white hover:text-orange-700" asChild>
                            <Link href="/pricing">Upgrade Now</Link>
                        </Button>
                    </div>
                )}
                {finalNavigation.map((item) => {
                    if (item.name === 'Settings') {
                        return (
                            <div key="settings-group" className="space-y-1">
                                <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">
                                    <div className="flex items-center">
                                        <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                                        Settings
                                    </div>
                                </div>
                                <div className="ml-4 space-y-1 border-l pl-2">
                                    <Link
                                        href="/settings/profile"
                                        className={cn(
                                            'block rounded-md px-3 py-2 text-sm transition-colors',
                                            pathname.startsWith('/settings/profile') ? 'text-primary font-medium bg-primary/5' : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        href="/settings/organization"
                                        className={cn(
                                            'block rounded-md px-3 py-2 text-sm transition-colors',
                                            pathname.startsWith('/settings/organization') ? 'text-primary font-medium bg-primary/5' : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        Organization
                                    </Link>
                                    <Link
                                        href="/warehouses"
                                        className={cn(
                                            'block rounded-md px-3 py-2 text-sm transition-colors flex items-center justify-between',
                                            pathname.startsWith('/warehouses') ? 'text-primary font-medium bg-primary/5' : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        <span>Warehouses</span>
                                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-1 rounded ml-2">PRO</span>
                                    </Link>
                                    <Link
                                        href="/settings/team"
                                        className={cn(
                                            'block rounded-md px-3 py-2 text-sm transition-colors',
                                            pathname.startsWith('/settings/team') ? 'text-primary font-medium bg-primary/5' : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        Team
                                    </Link>
                                    <Link
                                        href="/settings/billing"
                                        className={cn(
                                            'block rounded-md px-3 py-2 text-sm transition-colors',
                                            pathname.startsWith('/settings/billing') ? 'text-primary font-medium bg-primary/5' : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        Billing
                                    </Link>
                                </div>
                            </div>
                        )
                    }

                    const isActive = pathname.startsWith(item.href)
                    const isLocked = item.name === 'Reports' && planType === 'FREE' && !isSuperAdmin

                    // Skip separate Warehouses link if we moved it to Settings (User asked to move 'Locations' to sidebar, 
                    // and 'settings' to sidebar. I put Warehouses as a top level item before. 
                    // User said: "wo right wali settings h usko navigation laga setting kliye jo side bar me h" 
                    // This implies grouping. Let's keep 'Warehouses' in the Settings group mostly? 
                    // actually the user said "settings mese location bahar nikal and usko side bar me daal" (Remove location from settings and put in sidebar).
                    // So Warehouses should probably stay Top Level? 
                    // BUT then "right wali settings h usko navigation laga setting kliye jo side bar me h".
                    // This means the Tab items (Profile, Org, Billing) should go to Sidebar under Settings.
                    // So Warehouses -> Top Level. Settings -> Group with Profile, Org, Billing, Team.

                    if (item.name === 'Warehouses') {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                <div className="flex items-center">
                                    <item.icon
                                        className={cn(
                                            'mr-3 h-5 w-5 flex-shrink-0',
                                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
                                        )}
                                    />
                                    {item.name}
                                    <span className="ml-2 rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold leading-none text-indigo-500 border border-indigo-500/20">
                                        PRO
                                    </span>
                                </div>
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <div className="flex items-center">
                                <item.icon
                                    className={cn(
                                        'mr-3 h-5 w-5 flex-shrink-0',
                                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
                                    )}
                                />
                                {item.name}
                            </div>
                            {isLocked && <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
