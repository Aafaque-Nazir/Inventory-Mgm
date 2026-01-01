'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface TopItem {
    name: string
    total: number
    unit: string
}

interface TopItemsTableProps {
    title: string
    items: TopItem[]
    type: 'in' | 'out'
}

export function TopItemsTable({ title, items, type }: TopItemsTableProps) {
    const Icon = type === 'in' ? TrendingUp : TrendingDown
    const colorClass = type === 'in' ? 'text-green-500' : 'text-red-500'

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${colorClass}`} />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-bold">{i + 1}</TableCell>
                                        <TableCell className="max-w-[150px] truncate" title={item.name}>{item.name}</TableCell>
                                        <TableCell className={`text-right font-mono whitespace-nowrap ${colorClass}`}>
                                            {item.total} {item.unit}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
