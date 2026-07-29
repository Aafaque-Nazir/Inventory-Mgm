"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"


type RevenueChartProps = {
    data: {
        month: string
        revenue: number
    }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <div className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl p-5 sm:p-8 h-full">
            <div className="mb-8">
                <h3 className="text-xl font-bold text-white">Revenue History</h3>
                <p className="text-sm text-slate-400">
                    Monthly Recurring Revenue (MRR) growth over time.
                </p>
            </div>
            <div className="h-[350px] w-full pr-4">
                <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="month"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(15, 23, 42, 0.9)",
                                borderRadius: "16px",
                                border: "1px solid rgba(255,255,255,0.1)",
                                backdropFilter: "blur(8px)",
                                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                                padding: "12px"
                            }}
                            itemStyle={{ color: "#fff", fontWeight: "bold" }}
                            labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                            formatter={(value: number | undefined) => [`₹${value || 0}`, "Revenue"]}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="url(#lineGradient)"
                            strokeWidth={4}
                            dot={{ stroke: "#10b981", strokeWidth: 2, r: 4, fill: "#0f172a" }}
                            activeDot={{ r: 8, stroke: "rgba(16, 185, 129, 0.5)", strokeWidth: 8, fill: "#10b981" }}
                        />
                        <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
