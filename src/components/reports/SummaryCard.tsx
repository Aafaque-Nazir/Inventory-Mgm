'use client'

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
        <div className={`overflow-hidden rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm shadow-xl p-6 hover:bg-white/10 transition-all duration-300 group`}>
            <div className="flex flex-row items-center justify-between pb-4">
                <h3 className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{title}</h3>
                <div className={`p-2.5 rounded-xl ${iconStyle} shadow-lg shadow-black/20`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <div>
                <div className="text-2xl font-bold text-white tracking-tight truncate" title={String(value)}>{value}</div>
                {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}

                {/* Optional visual trend indicator only if specifically requested */}
                {trend && (
                    <div className={`flex items-center text-xs mt-3 font-medium ${trend === 'down' ? 'text-red-400 bg-red-500/10 w-fit px-2 py-1 rounded-lg border border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 w-fit px-2 py-1 rounded-lg border border-emerald-500/20'}`}>
                        {trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1.5" /> : <TrendingUp className="h-3 w-3 mr-1.5" />}
                        {trend === 'down' ? 'Needs Attention' : 'On Track'}
                    </div>
                )}
            </div>
        </div>
    )
}
