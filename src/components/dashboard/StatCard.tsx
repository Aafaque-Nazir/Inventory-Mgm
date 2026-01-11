'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    description?: string
    trend?: {
        value: number
        label: string
        positive?: boolean
    }
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink'
    delay?: number
}

const colorStyles = {
    blue: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        border: 'border-blue-500/20',
        ring: 'ring-blue-500/10',
        gradient: 'from-blue-500/20 to-transparent'
    },
    green: {
        bg: 'bg-green-500/10',
        text: 'text-green-500',
        border: 'border-green-500/20',
        ring: 'ring-green-500/10',
        gradient: 'from-green-500/20 to-transparent'
    },
    purple: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-500',
        border: 'border-purple-500/20',
        ring: 'ring-purple-500/10',
        gradient: 'from-purple-500/20 to-transparent'
    },
    orange: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-500',
        border: 'border-orange-500/20',
        ring: 'ring-orange-500/10',
        gradient: 'from-orange-500/20 to-transparent'
    },
    pink: {
        bg: 'bg-pink-500/10',
        text: 'text-pink-500',
        border: 'border-pink-500/20',
        ring: 'ring-pink-500/10',
        gradient: 'from-pink-500/20 to-transparent'
    }
}

export function StatCard({ title, value, icon, description, trend, color = 'blue', delay = 0 }: StatCardProps) {
    const styles = colorStyles[color]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                "relative overflow-hidden rounded-2xl border bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10 hover:shadow-lg",
                styles.border
            )}
        >
            {/* Ambient Gradient Background */}
            <div className={cn("absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br opacity-20 blur-3xl", styles.gradient)} />

            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</h3>

                    {description && (
                        <p className="mt-1 text-xs text-slate-500">{description}</p>
                    )}

                    {trend && (
                        <div className={cn(
                            "mt-3 flex items-center text-xs font-medium",
                            trend.positive ? "text-green-400" : "text-red-400"
                        )}>
                            <span>{trend.positive ? '+' : ''}{trend.value}%</span>
                            <span className="ml-1 text-slate-500">{trend.label}</span>
                        </div>
                    )}
                </div>

                <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl border shadow-inner",
                    styles.bg,
                    styles.text,
                    styles.border
                )}>
                    {icon}
                </div>
            </div>
        </motion.div>
    )
}
