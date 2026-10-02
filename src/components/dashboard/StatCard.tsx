'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

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
    color?: 'blue' | 'cyan' | 'sky' | 'emerald' | 'green' | 'purple' | 'orange' | 'pink'
    delay?: number
}

const colorStyles = {
    blue: {
        text: 'text-emerald-400',
        glow: 'group-hover:shadow-[0_10px_35px_-5px_rgba(16,185,129,0.2)]',
        border: 'group-hover:border-emerald-500/40',
        bg: 'group-hover:bg-[#151d18]'
    },
    cyan: {
        text: 'text-teal-400',
        glow: 'group-hover:shadow-[0_10px_35px_-5px_rgba(20,184,166,0.2)]',
        border: 'group-hover:border-teal-500/40',
        bg: 'group-hover:bg-[#131c18]'
    },
    sky: {
        text: 'text-emerald-300',
        glow: 'group-hover:shadow-[0_10px_35px_-5px_rgba(52,211,153,0.2)]',
        border: 'group-hover:border-emerald-400/40',
        bg: 'group-hover:bg-[#141e18]'
    },
    emerald: {
        text: 'text-emerald-400',
        glow: 'group-hover:shadow-[0_10px_35px_-5px_rgba(16,185,129,0.25)]',
        border: 'group-hover:border-emerald-500/40',
        bg: 'group-hover:bg-[#151d18]'
    },
    green: {
        text: 'text-green-400',
        glow: 'group-hover:shadow-[0_10px_35px_-5px_rgba(34,197,94,0.25)]',
        border: 'group-hover:border-green-500/40',
        bg: 'group-hover:bg-[#151d18]'
    },
    purple: {
        text: 'text-emerald-400',
        glow: 'group-hover:shadow-[0_10px_35px_-5px_rgba(16,185,129,0.2)]',
        border: 'group-hover:border-emerald-500/40',
        bg: 'group-hover:bg-[#151d18]'
    },
    orange: {
        text: 'text-amber-400',
        glow: 'group-hover:shadow-[0_10px_35px_-5px_rgba(245,158,11,0.2)]',
        border: 'group-hover:border-amber-500/40',
        bg: 'group-hover:bg-[#1c1a14]'
    },
    pink: {
        text: 'text-rose-400',
        glow: 'group-hover:shadow-[0_10px_35px_-5px_rgba(244,63,94,0.2)]',
        border: 'group-hover:border-rose-500/40',
        bg: 'group-hover:bg-[#1c1417]'
    }
}

export function StatCard({ title, value, icon, description, trend, color = 'emerald' }: StatCardProps) {
    const styles = colorStyles[color] || colorStyles.emerald
    const [displayValue, setDisplayValue] = useState(0)

    // Simple counting animation for numbers
    useEffect(() => {
        if (typeof value === 'number') {
            let start = 0
            const end = value
            const duration = 1500
            const increment = end / (duration / 16)
            
            const timer = setInterval(() => {
                start += increment
                if (start >= end) {
                    setDisplayValue(end)
                    clearInterval(timer)
                } else {
                    setDisplayValue(Math.floor(start))
                }
            }, 16)
            
            return () => clearInterval(timer)
        } else {
             // If string (e.g. currency), no animation for now or handle differently
        }
    }, [value])


    return (
        <div
            className={cn(
                "group relative rounded-xl sm:rounded-2xl border border-white/10 bg-[#111613] p-3.5 sm:p-4 lg:p-5 backdrop-blur-xl transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]",
                "hover:-translate-y-0.5 hover:bg-[#151c17] hover:border-emerald-500/30",
                styles.glow,
                styles.border,
                styles.bg
            )}
        >
            {/* Inner Glow Gradient */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="relative z-10 space-y-2.5">
                <div className="flex items-center justify-between">
                    <div className={cn(
                        "p-2 rounded-lg bg-[#162019] border border-white/5 backdrop-blur-md transition-colors",
                        "group-hover:bg-[#1c2820] group-hover:scale-105 duration-300",
                        styles.text
                    )}>
                        {icon}
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm px-1.5 py-0.5 rounded-full border",
                            trend.positive
                                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                        )}>
                            <span>{trend.positive ? '↑' : '↓'}</span>
                            <span>{trend.value}%</span>
                        </div>
                    )}
                </div>

                <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{title}</p>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
                        {typeof value === 'number' ? displayValue : value}
                    </h3>
                    {description && (
                        <p className="text-[10px] text-slate-400 font-medium group-hover:text-slate-300 transition-colors">{description}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
