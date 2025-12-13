'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

interface LowStockItem {
    name: string
    current_stock: number
    min_stock: number
    unit: string
}

interface LowStockTableProps {
    items: LowStockItem[]
}

export function LowStockTable({ items }: LowStockTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Low Stock Alerts
                </CardTitle>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">All items are well-stocked! 🎉</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Current</TableHead>
                                <TableHead className="text-right">Min</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-right">{item.current_stock} {item.unit}</TableCell>
                                    <TableCell className="text-right">{item.min_stock} {item.unit}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.current_stock === 0 ? "destructive" : "secondary"}>
                                            {item.current_stock === 0 ? 'Out of Stock' : 'Low'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
