'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Building2, Users, CreditCard, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const settingsTabs = [
    { name: 'Profile', href: '/settings/profile', icon: User },
    { name: 'Organization', href: '/settings/organization', icon: Building2 },
    { name: 'Team', href: '/settings/team', icon: Users },
    { name: 'Billing', href: '/settings/billing', icon: CreditCard },
    { name: 'Audit Logs', href: '/settings/audit', icon: ShieldCheck },
]

export function SettingsNav() {
    const pathname = usePathname()

    return (
        <div className="w-full border-b border-white/5 pb-4 mb-6">
            <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1" aria-label="Settings Tabs">
                {settingsTabs.map((tab) => {
                    const isActive = pathname === tab.href || pathname?.startsWith(`${tab.href}/`)
                    const Icon = tab.icon

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 border",
                                isActive
                                    ? "bg-emerald-500 text-[#04160c] font-bold border-emerald-500 shadow-md shadow-emerald-500/20"
                                    : "border-white/10 bg-[#111613] text-slate-400 hover:text-white hover:border-emerald-500/20"
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{tab.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
