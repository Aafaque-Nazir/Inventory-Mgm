'use client'

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
        <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl flex flex-col h-full">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${type === 'in' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                    <Icon className={`h-5 w-5 ${colorClass}`} />
                </div>
                <h3 className="text-lg font-semibold text-white/90">{title}</h3>
            </div>
            <div className="p-0 flex-1">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <Icon className="h-10 w-10 opacity-20 mb-3" />
                        <p className="text-sm font-medium text-slate-400">No data available</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="w-[50px] pl-6 text-slate-400">#</TableHead>
                                    <TableHead className="text-slate-400">Item</TableHead>
                                    <TableHead className="text-right text-slate-400 pr-6">Quantity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, i) => (
                                    <TableRow key={i} className="border-white/5 hover:bg-white/5 transition-colors">
                                        <TableCell className="font-bold text-slate-500 pl-6">{i + 1}</TableCell>
                                        <TableCell className="text-slate-200 font-medium max-w-[150px] truncate" title={item.name}>{item.name}</TableCell>
                                        <TableCell className={`text-right font-mono pr-6 ${colorClass}`}>
                                            {item.total} <span className="text-slate-600 text-xs ml-1">{item.unit}</span>
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
