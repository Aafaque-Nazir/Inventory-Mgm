'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartData } from '@/app/actions/dashboard'
import { motion } from 'framer-motion'
import { FileBarChart } from 'lucide-react'

export function RevenueChart({ data }: { data: ChartData }) {
    if (!data || data.length === 0) {
       return (
           <Card className="col-span-4 border-white/5 bg-white/5 backdrop-blur-sm">
               <CardHeader>
                   <CardTitle className="text-white">Revenue Overview</CardTitle>
                   <CardDescription className="text-slate-400">No data available for the selected period</CardDescription>
               </CardHeader>
               <CardContent className="h-[300px] flex items-center justify-center text-slate-500">
                    Create invoices to see analytics
               </CardContent>
           </Card>
       )
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-4"
        >
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                             <CardTitle className="text-white flex items-center gap-2">
                                <FileBarChart className="h-5 w-5 text-blue-500" />
                                Revenue Trends
                             </CardTitle>
                             <CardDescription className="text-slate-400">
                                Total revenue over the last 7 days
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#cbd5e1" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="#cbd5e1" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value}`}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: '#0f172a', 
                                        borderRadius: '12px', 
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
