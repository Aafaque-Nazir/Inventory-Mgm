'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Activity,
    ArrowRight,
    Clock,
    Flame,
    TrendingUp,
    AlertOctagon,
    BarChart3,
    X,
    CheckCircle2
} from 'lucide-react'
import { AiInsight } from '@/app/actions/ai'

const insightIconMap: Record<string, any> = {
    RISK: Flame,
    WARNING: Clock,
    SEASONAL: BarChart3,
    OPPORTUNITY: TrendingUp,
    ACHIEVEMENT: CheckCircle2,
    ALERT: AlertOctagon
}

const colorStyleMap: Record<string, {
    border: string
    bg: string
    badgeBg: string
    badgeText: string
    text: string
    iconBg: string
    iconColor: string
    btnBg: string
    btnHover: string
    btnText: string
}> = {
    red: {
        border: 'border-rose-500/30',
        bg: 'bg-gradient-to-r from-rose-950/30 via-[#120a0b] to-[#0c0607]',
        badgeBg: 'bg-rose-500/15 border-rose-500/30',
        badgeText: 'text-rose-300',
        text: 'text-rose-200',
        iconBg: 'bg-rose-500/15 border-rose-500/30',
        iconColor: 'text-rose-400',
        btnBg: 'bg-rose-500/20 border-rose-500/30',
        btnHover: 'hover:bg-rose-500/30',
        btnText: 'text-rose-200'
    },
    yellow: {
        border: 'border-amber-500/30',
        bg: 'bg-gradient-to-r from-amber-950/25 via-[#131109] to-[#0d0d08]',
        badgeBg: 'bg-amber-500/15 border-amber-500/30',
        badgeText: 'text-amber-300',
        text: 'text-amber-100',
        iconBg: 'bg-amber-500/15 border-amber-500/30',
        iconColor: 'text-amber-400',
        btnBg: 'bg-amber-500/20 border-amber-500/30',
        btnHover: 'hover:bg-amber-500/30',
        btnText: 'text-amber-200'
    },
    green: {
        border: 'border-emerald-500/30',
        bg: 'bg-gradient-to-r from-emerald-950/25 via-[#0c1611] to-[#08100c]',
        badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
        badgeText: 'text-emerald-300',
        text: 'text-emerald-100',
        iconBg: 'bg-emerald-500/15 border-emerald-500/30',
        iconColor: 'text-emerald-400',
        btnBg: 'bg-emerald-500/20 border-emerald-500/30',
        btnHover: 'hover:bg-emerald-500/30',
        btnText: 'text-emerald-200'
    },
    purple: {
        border: 'border-purple-500/30',
        bg: 'bg-gradient-to-r from-purple-950/25 via-[#130d17] to-[#0c0810]',
        badgeBg: 'bg-purple-500/15 border-purple-500/30',
        badgeText: 'text-purple-300',
        text: 'text-purple-100',
        iconBg: 'bg-purple-500/15 border-purple-500/30',
        iconColor: 'text-purple-400',
        btnBg: 'bg-purple-500/20 border-purple-500/30',
        btnHover: 'hover:bg-purple-500/30',
        btnText: 'text-purple-200'
    },
    blue: {
        border: 'border-teal-500/30',
        bg: 'bg-gradient-to-r from-teal-950/25 via-[#0b1615] to-[#070f0e]',
        badgeBg: 'bg-teal-500/15 border-teal-500/30',
        badgeText: 'text-teal-300',
        text: 'text-teal-100',
        iconBg: 'bg-teal-500/15 border-teal-500/30',
        iconColor: 'text-teal-400',
        btnBg: 'bg-teal-500/20 border-teal-500/30',
        btnHover: 'hover:bg-teal-500/30',
        btnText: 'text-teal-200'
    }
}

function getActionHref(action?: string): string {
    if (!action) return '/items'
    const lower = action.toLowerCase()
    if (lower.includes('review') || lower.includes('item')) return '/items'
    if (lower.includes('reorder') || lower.includes('purchase')) return '/purchase-orders'
    if (lower.includes('restock')) return '/items'
    if (lower.includes('manage') || lower.includes('stock')) return '/stock'
    return '/items'
}

export function AiInsightsCard({ insights }: { insights: AiInsight[] }) {
    const [dismissed, setDismissed] = useState(false)

    if (dismissed || !insights || insights.length === 0) return null

    // SMART ADJUSTMENT: If only 1 insight exists, render a sleek, compact single-row alert bar
    // That eliminates the giant empty 2/3 black space and takes only ~46px height!
    if (insights.length === 1) {
        const insight = insights[0]
        const styles = colorStyleMap[insight.color] || colorStyleMap.yellow
        const IconComponent = insightIconMap[insight.type] || Activity
        const href = getActionHref(insight.action)

        return (
            <div className={`relative overflow-hidden rounded-xl border ${styles.border} ${styles.bg} p-2.5 sm:px-4 sm:py-2.5 backdrop-blur-xl shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 group`}>
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Concept Status Icon */}
                    <div className={`h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 ${styles.iconBg} ${styles.iconColor} shadow-inner`}>
                        <IconComponent className="h-3.5 w-3.5" />
                    </div>

                    {/* Calm Status Tag */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 hidden md:inline-block">
                            Stock Alert
                        </span>
                    </div>

                    {/* Text Details */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs min-w-0">
                        <span className="font-bold text-white tracking-tight">{insight.title}:</span>
                        <span className="text-slate-300/90 leading-tight">{insight.description}</span>
                        {insight.metric && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${styles.badgeBg} ${styles.badgeText} uppercase tracking-wider shrink-0`}>
                                {insight.metric}
                            </span>
                        )}
                    </div>
                </div>

                {/* Interactive Action Button & Dismiss */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {insight.action && (
                        <Link
                            href={href}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${styles.btnBg} ${styles.btnHover} ${styles.btnText} hover:shadow-sm`}
                        >
                            <span>{insight.action}</span>
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    )}
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-white/5 transition-colors"
                        title="Dismiss alert"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        )
    }

    // MULTIPLE INSIGHTS: Smart responsive grid fitted dynamically to count (2 cols or 3 cols, no empty columns)
    const gridCols = insights.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

    return (
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-[#0c120e]/90 p-3 sm:p-4 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Activity className="h-3.5 w-3.5" />
                    </div>
                    <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">Stock Alerts & Updates</h2>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 transition-colors"
                >
                    <X className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-[11px]">Dismiss</span>
                </button>
            </div>

            <div className={`grid gap-2.5 sm:gap-3 ${gridCols}`}>
                {insights.map((insight, idx) => {
                    const styles = colorStyleMap[insight.color] || colorStyleMap.blue
                    const IconComponent = insightIconMap[insight.type] || Activity
                    const href = getActionHref(insight.action)

                    return (
                        <div
                            key={idx}
                            className={`group relative p-3 rounded-xl border ${styles.border} ${styles.bg} transition-all duration-200 flex flex-col justify-between`}
                        >
                            <div>
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-1.5 font-semibold">
                                        <div className={`h-6 w-6 rounded-md border flex items-center justify-center shrink-0 ${styles.iconBg} ${styles.iconColor}`}>
                                            <IconComponent className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-semibold tracking-tight text-white">{insight.title}</span>
                                    </div>
                                    {insight.metric && (
                                        <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${styles.badgeBg} ${styles.badgeText} uppercase tracking-wider`}>
                                            {insight.metric}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-300/85 leading-relaxed font-normal mb-3 text-left">
                                    {insight.description}
                                </p>
                            </div>

                            {insight.action && (
                                <Link
                                    href={href}
                                    className={`mt-auto pt-2 border-t border-white/5 flex items-center justify-between text-xs font-semibold ${styles.btnText} hover:opacity-100 opacity-85 transition-all`}
                                >
                                    <span>{insight.action}</span>
                                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                </Link>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
