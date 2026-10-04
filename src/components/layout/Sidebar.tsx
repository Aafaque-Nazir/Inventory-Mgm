'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
    Lock,
    Settings,
    Crown,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    LogOut,
    MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/common/BrandLogo'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { navGroups, NavItem } from '@/lib/navigation'

import { useUser } from '@/context/UserContext'

function subscribeToSidebar(callback: () => void) {
    window.addEventListener('storage', callback)
    return () => window.removeEventListener('storage', callback)
}

function getSidebarSnapshot() {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sidebar-collapsed') === 'true'
}

function getServerSidebarSnapshot() {
    return false
}

export function Sidebar() {
    const pathname = usePathname()
    const supabase = createClient()
    const { profile, isSuperAdmin, planType, trialDays } = useUser()
    const persistedCollapsed = useSyncExternalStore(subscribeToSidebar, getSidebarSnapshot, getServerSidebarSnapshot)
    const [overrideCollapsed, setOverrideCollapsed] = useState<boolean | null>(null)
    const collapsed = overrideCollapsed !== null ? overrideCollapsed : persistedCollapsed
    const userProfile = profile

    const toggleCollapse = () => {
        const next = !collapsed
        setOverrideCollapsed(next)
        localStorage.setItem('sidebar-collapsed', String(next))
    }

    const isLocked = (item: NavItem) => item.name === 'Reports' && planType === 'FREE' && !isSuperAdmin

    return (
        <TooltipProvider delayDuration={0}>
            <div
                className={cn(
                    "hidden border-r bg-card md:flex flex-col transition-all duration-300 ease-in-out sticky top-0 h-screen shrink-0 z-40 shadow-sm",
                    collapsed ? "w-[80px]" : "w-[280px]"
                )}
            >
                {/* Toggle Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-accent z-50 hidden md:flex"
                    onClick={toggleCollapse}
                >
                    {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </Button>

                {/* Header */}
                <div className={cn(
                    "flex h-16 items-center border-b px-5 transition-all duration-300",
                    collapsed ? "justify-center px-2" : "justify-between"
                )}>
                    <Link href="/dashboard" className="flex items-center overflow-hidden">
                        <BrandLogo size="md" collapsed={collapsed} />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 min-h-0 space-y-6 overflow-y-auto py-6 px-3 no-scrollbar">

                    {/* Trial Banner - Only show when expanded */}
                    {!collapsed && trialDays !== null && trialDays > 0 && (
                        <div className="mx-2 mb-6 rounded-xl bg-orange-500/10 p-4 border border-orange-500/10 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Sparkles className="h-12 w-12" />
                            </div>
                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                <BadgeIcon className="h-4 w-4 text-orange-600" />
                                <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">Pro Trial</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3 relative z-10 font-medium">
                                <span className="text-foreground font-bold">{trialDays} days</span> remaining in your trial.
                            </p>
                            <Button variant="default" size="sm" className="w-full h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-sm border-0" asChild>
                                <Link href="/pricing">Upgrade Plan</Link>
                            </Button>
                        </div>
                    )}

                    {navGroups.map((group, groupIndex) => (
                        <div key={group.title} className="space-y-2">
                            {!collapsed && (
                                <h4 className="px-4 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">
                                    {group.title}
                                </h4>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname.startsWith(item.href)
                                    const locked = isLocked(item)

                                    if (collapsed) {
                                        return (
                                            <Tooltip key={item.href}>
                                                <TooltipTrigger asChild>
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            "flex h-10 w-10 items-center justify-center rounded-lg transition-all mx-auto relative group",
                                                            isActive
                                                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                        )}
                                                    >
                                                        <item.icon className="h-5 w-5" />
                                                        {item.isPro && !isActive && (
                                                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background block" />
                                                        )}
                                                        {locked && <Crown className="absolute -bottom-1 -right-1 h-3 w-3 text-amber-500 fill-amber-500" />}
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent side="right" className="font-medium">
                                                    {item.name}
                                                    {item.isPro && <span className="ml-2 text-xs text-emerald-400 font-bold">PRO</span>}
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    }

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "group flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 border border-transparent mx-2",
                                                isActive
                                                    ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className={cn(
                                                    "h-4.5 w-4.5 transition-colors",
                                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                                )} />
                                                <span>{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {item.isPro && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        PRO
                                                    </span>
                                                )}
                                                {locked && <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />}
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                            {/* Add Separator except for last item */}
                            {!collapsed && groupIndex < navGroups.length - 1 && (
                                <div className="px-4 py-2">
                                    <div className="h-px bg-border/50" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Super Admin Link */}
                    {isSuperAdmin && (
                        <div className="mt-6 px-2">
                            {!collapsed && <div className="px-2 mb-2 text-xs font-semibold text-purple-600/70 uppercase tracking-wider">Administration</div>}
                            <Link
                                href="/super-admin"
                                className={cn(
                                    "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    collapsed ? "justify-center" : "justify-between",
                                    pathname.startsWith('/super-admin')
                                        ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                                        : "bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100"
                                )}
                            >
                                {collapsed ? (
                                    <Lock className="h-5 w-5" />
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <Lock className="h-4 w-4" />
                                            <span>Super Admin</span>
                                        </div>
                                    </>
                                )}
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Footer User Profile */}
                <div className="p-4 border-t bg-muted/20">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className={cn(
                                "w-full p-0 h-auto hover:bg-transparent",
                                collapsed ? "justify-center" : "justify-start"
                            )}>
                                <div className={cn(
                                    "flex items-center gap-3 w-full",
                                    collapsed ? "justify-center" : ""
                                )}>
                                    <Avatar className="h-9 w-9 border border-border shadow-sm">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                            {userProfile?.full_name?.[0] || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    {!collapsed && (
                                        <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                            <span className="text-sm font-semibold truncate w-full text-foreground/90">
                                                {userProfile?.full_name || 'User'}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate w-full">
                                                {userProfile?.role || 'Member'}
                                            </span>
                                        </div>
                                    )}
                                    {!collapsed && <MoreVertical className="h-4 w-4 text-muted-foreground" />}
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={collapsed ? "center" : "end"} side={collapsed ? "right" : "top"} className="w-56" sideOffset={10}>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/settings/profile" className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={async () => {
                                await supabase.auth.signOut()
                                window.location.href = '/login'
                            }}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </TooltipProvider>
    )
}

function BadgeIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
        </svg>
    )
}
