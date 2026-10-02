'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartData } from '@/app/actions/dashboard'
import { FileBarChart } from 'lucide-react'

export function RevenueChart({ data }: { data: ChartData }) {
    if (!data || data.length === 0) {
       return (
           <div className="col-span-1 lg:col-span-7 xl:col-span-8">
               <Card className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#111613] backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                   <CardHeader className="p-3.5 sm:p-4 pb-2">
                       <CardTitle className="text-sm sm:text-base font-semibold text-white">Revenue Overview</CardTitle>
                       <CardDescription className="text-xs text-slate-400">No data available for the selected period</CardDescription>
                   </CardHeader>
                   <CardContent className="h-[220px] sm:h-[260px] flex items-center justify-center text-xs sm:text-sm text-slate-500">
                        Create invoices or record sales to see trends
                   </CardContent>
               </Card>
           </div>
       )
    }

    return (
        <div className="col-span-1 lg:col-span-7 xl:col-span-8">
            <Card className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#111613] backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardHeader className="p-3.5 sm:p-4 pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                             <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                                <FileBarChart className="h-4 w-4 text-emerald-400" />
                                Revenue Trends
                             </CardTitle>
                             <CardDescription className="text-xs text-slate-400">
                                Total revenue over the last 7 days
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-2 sm:p-4 pt-1 sm:pt-2 pl-0 sm:pl-1">
                    <div className="h-[220px] sm:h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#94a3b8" 
                                    fontSize={11} 
                                    tickLine={false} 
                                    axisLine={false}
                                    dy={6}
                                />
                                <YAxis 
                                    stroke="#94a3b8" 
                                    fontSize={11} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value}`}
                                    width={52}
                                />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: '#0c140e', 
                                        borderRadius: '10px', 
                                        border: '1px solid rgba(16,185,129,0.3)',
                                        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.7)',
                                        fontSize: '12px',
                                        padding: '8px 12px'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ stroke: '#10b981', strokeWidth: 1.5 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10b981"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
