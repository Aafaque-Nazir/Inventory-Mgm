'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, TrendingUp, AlertOctagon, PackageX } from 'lucide-react'
import { AiInsight } from '@/app/actions/ai'

const iconMap = {
    RISK: AlertOctagon,
    SEASONAL: TrendingUp,
    OPPORTUNITY: PackageX
}

const colorMap = {
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200'
}

export function AiInsightsCard({ insights }: { insights: AiInsight[] }) {
    if (!insights || insights.length === 0) return null

    return (
        <Card className="col-span-full border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-white to-indigo-50/20 dark:from-slate-950 dark:to-indigo-950/20">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-500 fill-indigo-500" />
                    <CardTitle className="text-lg text-indigo-950 dark:text-indigo-100">AI Smart Insights</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {insights.map((insight, idx) => {
                        const Icon = iconMap[insight.type] || Sparkles
                        // @ts-ignore
                        const colorClass = colorMap[insight.color] || colorMap.blue

                        return (
                            <div key={idx} className={`p-4 rounded-lg border ${colorClass} flex flex-col gap-3 transition-all hover:shadow-md`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <Icon className="h-4 w-4" />
                                        {insight.title}
                                    </div>
                                    {insight.metric && (
                                        <span className="text-xs font-bold px-2 py-1 rounded bg-white/50 backdrop-blur-sm">
                                            {insight.metric}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm opacity-90 leading-relaxed">
                                    {insight.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
