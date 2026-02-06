'use client'

import { Sparkles, TrendingUp, AlertOctagon, PackageX } from 'lucide-react'
import { AiInsight } from '@/app/actions/ai'
import { motion } from 'framer-motion'

const iconMap = {
    RISK: AlertOctagon,
    SEASONAL: TrendingUp,
    OPPORTUNITY: PackageX
}

const colorMap = {
    red: 'bg-red-500/10 text-red-300 border-red-500/20 hover:bg-red-500/20',
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20',
    yellow: 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
}

export function AiInsightsCard({ insights }: { insights: AiInsight[] }) {
    if (!insights || insights.length === 0) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="col-span-full relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6 shadow-2xl backdrop-blur-md"
        >
            {/* Glowing orb effect - BLUE/CYAN */}
            <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />
            <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-cyan-600/10 blur-[100px]" />

            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 border-b border-blue-500/10 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
                        <Sparkles className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">AI Smart Insights</h2>
                        <p className="text-xs text-slate-400">Powered by Predictive Intelligence</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {insights.map((insight, idx) => {
                        const Icon = iconMap[insight.type] || Sparkles
                        // @ts-ignore
                        const colorClass = colorMap[insight.color] || colorMap.blue

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className={`group relative p-4 rounded-xl border ${colorClass} transition-all duration-300`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <Icon className="h-5 w-5" />
                                        <span className="text-sm tracking-wide">{insight.title}</span>
                                    </div>
                                    {insight.metric && (
                                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/5 uppercase tracking-wider backdrop-blur-sm border border-white/5 group-hover:bg-white/10 transition-colors">
                                            {insight.metric}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed font-light">
                                    {insight.description}
                                </p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </motion.div>
    )
}
