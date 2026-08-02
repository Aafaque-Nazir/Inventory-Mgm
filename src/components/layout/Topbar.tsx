'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    LogOut,
    User,
    Settings,
    Menu,
    Shield,
    Crown,
    MoreVertical
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { Profile } from '@/types'
import { cn } from '@/lib/utils'
import { WarehouseSwitcher } from '@/components/warehouses/WarehouseSwitcher'
import { navGroups } from '@/lib/navigation'

export function Topbar() {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [email, setEmail] = useState<string | null>(null)
    const [open, setOpen] = useState(false)



    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setEmail(user.email || null)
                const { data } = await supabase
                    .from('profiles')
                    .select('*, organization:organizations(plan_type)')
                    .eq('id', user.id)
                    .single()
                setProfile(data)
            }
        }
        getProfile()
    }, [supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    const getRoleBadgeColor = (role: string | undefined) => {
        switch (role) {
            case 'ADMIN': return 'default'
            case 'MANAGER': return 'secondary'
            default: return 'outline'
        }
    }

    return (
        <header className="flex h-16 items-center justify-between px-3 sm:px-6 bg-transparent">
            <div className="flex items-center gap-2 sm:gap-4">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col w-[280px] p-0">
                        <div className="flex h-16 items-center border-b px-6">
                            <SheetTitle className="text-xl font-bold tracking-tight">Inventory <span className="text-primary">Management</span></SheetTitle>
                            <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
                        </div>

                        <nav className="flex-1 space-y-6 overflow-y-auto py-6 px-3 custom-scrollbar">
                            {navGroups.map((group, groupIndex) => (
                                <div key={group.title} className="space-y-2">
                                    <h4 className="px-4 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">
                                        {group.title}
                                    </h4>
                                    <div className="space-y-1">
                                        {group.items.map((item) => {
                                            const isActive = pathname.startsWith(item.href)
                                            const locked = item.name === 'Reports' && (!profile?.organization?.plan_type || profile.organization.plan_type === 'FREE') && !profile?.is_super_admin

                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => setOpen(false)}
                                                    className={cn(
                                                        "group flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 border border-transparent mx-2",
                                                        isActive
                                                            ? "bg-primary/5 text-primary border-primary/10 shadow-sm"
                                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                                                                PRO
                                                            </span>
                                                        )}
                                                        {locked && <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />}
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                    {groupIndex < navGroups.length - 1 && (
                                        <div className="px-4 py-2">
                                            <div className="h-px bg-border/50" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Super Admin Link */}
                            {profile?.is_super_admin && (
                                <div className="mt-6 px-2">
                                    <div className="px-2 mb-2 text-xs font-semibold text-purple-600/70 uppercase tracking-wider">Administration</div>
                                    <Link
                                        href="/super-admin"
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors mx-2",
                                            pathname.startsWith('/super-admin')
                                                ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                                                : "bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Shield className="h-4 w-4" />
                                            <span>Super Admin</span>
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </nav>

                        {/* Footer User Profile */}
                        <div className="p-4 border-t bg-muted/20">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="w-full p-0 h-auto hover:bg-transparent justify-start">
                                        <div className="flex items-center gap-3 w-full">
                                            <Avatar className="h-9 w-9 border border-border shadow-sm">
                                                <AvatarImage src="" />
                                                <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                                    {profile?.full_name?.[0] || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                                <span className="text-sm font-semibold truncate w-full text-foreground/90">
                                                    {profile?.full_name || 'User'}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate w-full">
                                                    {profile?.role || 'Member'}
                                                </span>
                                            </div>
                                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" side="top" className="w-56" sideOffset={10}>
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings/profile" className="cursor-pointer" onClick={() => setOpen(false)}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={handleSignOut}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </SheetContent>
                </Sheet>
                <div className="flex items-center gap-2 sm:gap-3">
                    <h2 className="text-lg font-semibold hidden md:block shrink-0">
                        {pathname.startsWith('/super-admin')
                            ? 'Super Admin'
                            : pathname.startsWith('/items')
                            ? 'Items'
                            : pathname.startsWith('/stock')
                            ? 'Stock'
                            : pathname.startsWith('/warehouses')
                            ? 'Warehouses'
                            : pathname.startsWith('/purchase-orders')
                            ? 'Purchase Orders'
                            : pathname.startsWith('/sales')
                            ? 'Sales'
                            : pathname.startsWith('/reports')
                            ? 'Reports'
                            : pathname.startsWith('/settings')
                            ? 'Settings'
                            : pathname.startsWith('/guide')
                            ? 'User Guide'
                            : pathname.startsWith('/help')
                            ? 'Help & Support'
                            : pathname.startsWith('/suppliers')
                            ? 'Suppliers'
                            : 'Dashboard'}
                    </h2>
                    {profile?.is_super_admin ? (
                        <Badge
                            className="bg-purple-600 hover:bg-purple-700 text-[10px] px-2 h-5 font-semibold tracking-wide uppercase border-purple-500/20 hidden sm:inline-flex"
                        >
                            SUPER ADMIN
                        </Badge>
                    ) : profile?.organization?.plan_type && (
                        <Badge
                            variant="secondary"
                            className={cn(
                                "text-[10px] px-2 h-5 font-semibold tracking-wide uppercase hidden sm:inline-flex",
                                profile.organization.plan_type === 'FREE' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                                profile.organization.plan_type === 'PRO' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                                profile.organization.plan_type === 'ENTERPRISE' && "bg-purple-500/10 text-purple-500 border-purple-500/20",
                            )}
                        >
                            {profile.organization.plan_type} PLAN
                        </Badge>
                    )}
                    {!pathname.startsWith('/super-admin') && (
                        <div className="ml-0 sm:ml-2">
                            <WarehouseSwitcher />
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full shrink-0">
                            <Avatar className="h-10 w-10 border-2 border-primary/10 shrink-0">
                                <AvatarImage src="" alt={profile?.full_name || ''} />
                                <AvatarFallback className="bg-primary/5 text-primary font-medium">
                                    {profile?.full_name?.[0] || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-2 p-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold leading-none">{profile?.full_name || 'User'}</p>
                                    {profile?.is_super_admin ? (
                                        <Badge className="bg-purple-600 hover:bg-purple-700 text-[10px] px-1.5 py-0 h-5">
                                            SUPER ADMIN
                                        </Badge>
                                    ) : profile?.role && (
                                        <Badge variant={getRoleBadgeColor(profile.role)} className="text-[10px] px-1.5 py-0 h-5">
                                            {profile.role}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs leading-none text-muted-foreground truncate">
                                    {email || 'Loading...'}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="cursor-pointer p-2 flex items-center">
                                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer p-2">
                            <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer p-2 text-destructive focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
