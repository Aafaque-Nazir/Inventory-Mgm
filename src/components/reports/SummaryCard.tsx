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

    // Determine styles based on icon type (for aesthetic variety)
    const getStyles = () => {
        switch (icon) {
            case 'package': return "bg-blue-500/10 text-blue-500 border-blue-200/50"
            case 'trendingUp': return "bg-emerald-500/10 text-emerald-500 border-emerald-200/50"
            case 'trendingDown': return "bg-rose-500/10 text-rose-500 border-rose-200/50" // Only used for "Out of Stock" etc
            case 'alertTriangle': return "bg-amber-500/10 text-amber-500 border-amber-200/50"
            default: return "bg-primary/10 text-primary border-primary/20"
        }
    }
    const iconStyle = getStyles()

    return (
        <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={`p-2 rounded-full ${iconStyle}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}

                {/* Optional visual trend indicator only if specifically requested */}
                {trend && (
                    <div className={`flex items-center text-xs mt-2 ${trend === 'down' ? 'text-red-500' : 'text-green-500'}`}>
                        {trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                        {trend === 'down' ? 'Needs Attention' : 'On Track'}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
