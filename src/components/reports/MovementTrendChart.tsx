'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Movement Trends (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="in" fill="#22c55e" name="Stock In" />
                            <Bar dataKey="out" fill="#ef4444" name="Stock Out" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
