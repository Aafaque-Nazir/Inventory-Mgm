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
    Settings
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/items', icon: Package },
    { name: 'Stock Movements', href: '/stock', icon: ArrowRightLeft },
    { name: 'Suppliers', href: '/suppliers', icon: Users },
    { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Pricing', href: '/pricing', icon: CreditCard },
    { name: 'Help & Support', href: '/help', icon: HelpCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const supabase = createClient()
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const [planType, setPlanType] = useState<string>('FREE')

    useEffect(() => {
        async function checkRole() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Fetch Profile and Org Plan
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_super_admin, organizations(plan_type)')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    if (profile.is_super_admin) setIsSuperAdmin(true)
                    // @ts-ignore
                    if (profile.organizations?.plan_type) setPlanType(profile.organizations.plan_type)
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
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="text-xl font-bold tracking-tight">Inventory <span className="text-primary">Management</span></Link>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {finalNavigation.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    const isLocked = item.name === 'Reports' && planType === 'FREE' && !isSuperAdmin

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
                            {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
