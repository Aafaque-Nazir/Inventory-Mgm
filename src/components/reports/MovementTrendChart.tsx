'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TrendData {
    date: string
    in: number
    out: number
}

interface MovementTrendChartProps {
    data: TrendData[]
}

export function MovementTrendChart({ data }: MovementTrendChartProps) {
    return (
        <div className="col-span-2 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white/90">Movement Trends</h3>
                <p className="text-sm text-slate-400">Stock In vs Stock Out (Last 7 Days)</p>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        barGap={4}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            dy={10}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', color: '#f8fafc' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar
                            dataKey="in"
                            name="Stock In"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                            barSize={32}
                            className="drop-shadow-sm"
                        />
                        <Bar
                            dataKey="out"
                            name="Stock Out"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                            barSize={32}
                            className="drop-shadow-sm"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
