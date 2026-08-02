import {
    LayoutDashboard,
    Package,
    ArrowRightLeft,
    Users,
    ShoppingCart,
    BarChart3,
    CreditCard,
    Settings,
    Book,
    HelpCircle,
    Store,
    FileText,
    LucideIcon,
} from 'lucide-react'

export type NavItem = {
    name: string
    href: string
    icon: LucideIcon
    isPro?: boolean
}

export type NavGroup = {
    title: string
    items: NavItem[]
}

export const navGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Reports', href: '/reports', icon: BarChart3 },
        ]
    },
    {
        title: 'Inventory',
        items: [
            { name: 'Items', href: '/items', icon: Package },
            { name: 'Stock Movements', href: '/stock', icon: ArrowRightLeft },
            { name: 'Warehouses', href: '/warehouses', icon: Store, isPro: true },
            { name: 'Suppliers', href: '/suppliers', icon: Users },
        ]
    },
    {
        title: 'Sales & Orders',
        items: [
            { name: 'Sales & Invoices', href: '/sales', icon: FileText },
            { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
        ]
    },
    {
        title: 'Finance',
        items: [
            { name: 'Pricing', href: '/pricing', icon: CreditCard },
        ]
    },
    {
        title: 'System',
        items: [
            { name: 'Settings', href: '/settings', icon: Settings },
            { name: 'User Guide', href: '/guide', icon: Book },
            { name: 'Help & Support', href: '/help', icon: HelpCircle },
        ]
    }
]
