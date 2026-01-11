'use client'

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
        <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl flex flex-col h-full">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white/90">Low Stock Alerts</h3>
            </div>
            <div className="p-0 flex-1">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <AlertTriangle className="h-10 w-10 opacity-20 mb-3" />
                        <p className="text-sm font-medium text-slate-400">All items are well-stocked! 🎉</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-slate-400 pl-6">Item</TableHead>
                                    <TableHead className="text-right text-slate-400">Current</TableHead>
                                    <TableHead className="text-right text-slate-400">Min</TableHead>
                                    <TableHead className="text-slate-400 pr-6">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, i) => (
                                    <TableRow key={i} className="border-white/5 hover:bg-white/5 transition-colors">
                                        <TableCell className="font-medium text-slate-200 pl-6 max-w-[150px] truncate" title={item.name}>{item.name}</TableCell>
                                        <TableCell className="text-right text-slate-400 font-mono">{item.current_stock} <span className="text-slate-600 text-xs">{item.unit}</span></TableCell>
                                        <TableCell className="text-right text-slate-400 font-mono">{item.min_stock} <span className="text-slate-600 text-xs">{item.unit}</span></TableCell>
                                        <TableCell className="pr-6">
                                            <Badge variant={item.current_stock === 0 ? "destructive" : "secondary"}
                                                className={item.current_stock === 0
                                                    ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 border"
                                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 border"
                                                }>
                                                {item.current_stock === 0 ? 'Out of Stock' : 'Low'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    )
}
