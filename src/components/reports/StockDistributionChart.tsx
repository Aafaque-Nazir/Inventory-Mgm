'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface DataPoint {
    name: string
    value: number
}

interface StockDistributionChartProps {
    data: DataPoint[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function StockDistributionChart({ data }: StockDistributionChartProps) {
    return (
        <div className="col-span-1 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white/90">Stock Distribution</h3>
                <p className="text-xs sm:text-sm text-slate-400">By Category</p>
            </div>
            <div className="h-[240px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <PieChart>
                        <Pie
                            data={data as unknown[]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', color: '#f8fafc' }}
                            itemStyle={{ color: '#f8fafc' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
