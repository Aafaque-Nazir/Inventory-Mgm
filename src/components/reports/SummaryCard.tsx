'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, TrendingUp, TrendingDown, AlertTriangle, DollarSign, BarChart3, ShoppingCart } from 'lucide-react'

const iconMap = {
    package: Package,
    users: Users,
    trendingUp: TrendingUp,
    trendingDown: TrendingDown,
    alertTriangle: AlertTriangle,
    dollarSign: DollarSign,
    barChart: BarChart3,
    shoppingCart: ShoppingCart,
}

interface SummaryCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: keyof typeof iconMap
    trend?: 'up' | 'down' | 'neutral'
}

export function SummaryCard({ title, value, subtitle, icon, trend }: SummaryCardProps) {
    const Icon = iconMap[icon]
    const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : ''

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${trendColor}`}>{value}</div>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </CardContent>
        </Card>
    )
}
