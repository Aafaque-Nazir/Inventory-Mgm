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
        text: 'text-blue-400',
        glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]',
        border: 'group-hover:border-blue-500/30',
        bg: 'group-hover:bg-blue-500/5'
    },
    green: {
        text: 'text-emerald-400',
        glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]',
        border: 'group-hover:border-emerald-500/30',
        bg: 'group-hover:bg-emerald-500/5'
    },
    purple: {
        text: 'text-purple-400',
        glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(147,51,234,0.5)]',
        border: 'group-hover:border-purple-500/30',
        bg: 'group-hover:bg-purple-500/5'
    },
    orange: {
        text: 'text-orange-400',
        glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)]',
        border: 'group-hover:border-orange-500/30',
        bg: 'group-hover:bg-orange-500/5'
    },
    pink: {
        text: 'text-pink-400',
        glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.5)]',
        border: 'group-hover:border-pink-500/30',
        bg: 'group-hover:bg-pink-500/5'
    }
}

export function StatCard({ title, value, icon, description, trend, color = 'blue', delay = 0 }: StatCardProps) {
    const styles = colorStyles[color]

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className={cn(
                "group relative rounded-[2rem] border border-white/[0.08] bg-white/[0.02] p-7 backdrop-blur-xl transition-all duration-500",
                "hover:-translate-y-1 hover:bg-white/[0.04]",
                styles.glow,
                styles.border,
                styles.bg
            )}
        >
            {/* Inner Glow Gradient */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className={cn(
                        "p-2.5 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md transition-colors",
                        "group-hover:bg-white/10 group-hover:scale-110 duration-300",
                        styles.text
                    )}>
                        {icon}
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/5",
                            trend.positive
                                ? "text-emerald-400 bg-emerald-500/5"
                                : "text-rose-400 bg-rose-500/5"
                        )}>
                            <span>{trend.positive ? '↑' : '↓'}</span>
                            <span>{trend.value}%</span>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{title}</p>
                    <h3 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">{value}</h3>
                    {description && (
                        <p className="text-[11px] text-slate-500 font-medium group-hover:text-slate-400 transition-colors">{description}</p>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
