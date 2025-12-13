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
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    LogOut,
    User,
    Settings,
    Menu,
    LayoutDashboard,
    Package,
    ArrowRightLeft,
    Users,
    ShoppingCart,
    BarChart3,
    Shield
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { Profile } from '@/types'
import { cn } from '@/lib/utils'

export function Topbar() {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [email, setEmail] = useState<string | null>(null)
    const [open, setOpen] = useState(false)

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Inventory', href: '/items', icon: Package },
        { name: 'Stock Movements', href: '/stock', icon: ArrowRightLeft },
        { name: 'Suppliers', href: '/suppliers', icon: Users },
        { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
    ]

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setEmail(user.email || null)
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
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
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="flex items-center gap-4">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <div className="flex h-16 items-center border-b px-6">
                            <SheetTitle className="text-xl font-bold tracking-tight">Inventory <span className="text-primary">Management</span></SheetTitle>
                        </div>
                        <nav className="flex-1 space-y-1 px-3 py-4">
                            {navigation.map((item) => {
                                const isActive = pathname.startsWith(item.href)
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
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
                            {/* Super Admin Link for Super Admins */}
                            {profile?.is_super_admin && (
                                <Link
                                    href="/super-admin"
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors mt-4 border-t pt-4',
                                        pathname.startsWith('/super-admin')
                                            ? 'bg-purple-500/10 text-purple-500'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    )}
                                >
                                    <Shield className="mr-3 h-5 w-5 flex-shrink-0 text-purple-500" />
                                    Super Admin
                                </Link>
                            )}
                        </nav>
                    </SheetContent>
                </Sheet>
                <h2 className="text-lg font-semibold">Dashboard</h2>
            </div>
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10 border-2 border-primary/10">
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
