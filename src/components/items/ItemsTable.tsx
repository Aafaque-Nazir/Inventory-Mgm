'use client'

import { useState } from 'react'
import { Item } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash2, TrendingUp, TrendingDown, Eye, ScanBarcode } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import Link from 'next/link'
import { EditItemDialog } from './EditItemDialog'
import { QuickStockDialog } from './QuickStockDialog'

interface ItemsTableProps {
    items: Item[]
}

export function ItemsTable({ items }: ItemsTableProps) {
    const [search, setSearch] = useState('')
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [editItem, setEditItem] = useState<Item | null>(null)
    const [quickStockItem, setQuickStockItem] = useState<Item | null>(null)
    const [quickStockType, setQuickStockType] = useState<'IN' | 'OUT'>('IN')
    const router = useRouter()
    const supabase = createClient()

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase())
    )

    async function handleDelete() {
        if (!deleteId) return
        try {
            const { error } = await supabase.from('items').delete().eq('id', deleteId)
            if (error) throw error
            toast.success('Item deleted successfully')
            setDeleteId(null)
            router.refresh()
        } catch (error) {
            toast.error('Failed to delete item')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Input
                    placeholder="Search items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 md:max-w-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500 hover:bg-white/10 focus:ring-indigo-500/50 transition-all rounded-xl"
                />
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-white/5 hover:bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-slate-400 font-medium">Name</TableHead>
                            <TableHead className="hidden md:table-cell text-slate-400 font-medium">SKU</TableHead>
                            <TableHead className="hidden md:table-cell text-slate-400 font-medium">Category</TableHead>
                            <TableHead className="hidden md:table-cell text-slate-400 font-medium">Size</TableHead>
                            <TableHead className="hidden md:table-cell text-slate-400 font-medium">Color</TableHead>
                            <TableHead className="text-slate-400 font-medium">Stock</TableHead>
                            <TableHead className="hidden md:table-cell text-slate-400 font-medium">Unit</TableHead>
                            <TableHead className="text-slate-400 font-medium">Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map((item, index) => (
                            <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-all duration-200 group">
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span className="text-slate-200 group-hover:text-white transition-colors">{item.name}</span>
                                        <span className="text-xs text-muted-foreground md:hidden">{item.sku}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-slate-400 group-hover:text-slate-300">{item.sku}</TableCell>
                                <TableCell className="hidden md:table-cell text-slate-400 group-hover:text-slate-300">
                                    {item.category && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {item.category}
                                        </span>
                                    )}
                                    {!item.category && '-'}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-slate-400 group-hover:text-slate-300">{item.size || '-'}</TableCell>
                                <TableCell className="hidden md:table-cell text-slate-400 group-hover:text-slate-300">{item.color || '-'}</TableCell>
                                <TableCell className="font-mono font-bold text-slate-200">{item.current_stock}</TableCell>
                                <TableCell className="hidden md:table-cell text-slate-400">{item.unit}</TableCell>
                                <TableCell>
                                    {item.current_stock < item.min_stock ? (
                                        <Badge variant="destructive" className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/20">Low Stock</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20">In Stock</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-200">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                                                <Link href={`/items/${item.id}`} className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setEditItem(item)} className="flex items-center gap-2 focus:bg-white/10 focus:text-white cursor-pointer">
                                                <Edit className="h-4 w-4" />
                                                Edit Item
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem onClick={() => { setQuickStockItem(item); setQuickStockType('IN'); }} className="flex items-center gap-2 focus:bg-white/10 focus:text-white cursor-pointer">
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                                Add Stock
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { setQuickStockItem(item); setQuickStockType('OUT'); }} className="flex items-center gap-2 focus:bg-white/10 focus:text-white cursor-pointer">
                                                <TrendingDown className="h-4 w-4 text-red-500" />
                                                Remove Stock
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem
                                                onClick={() => setDeleteId(item.id)}
                                                className="flex items-center gap-2 text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this item. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {editItem && (
                <EditItemDialog
                    item={editItem}
                    open={!!editItem}
                    onOpenChange={(open) => !open && setEditItem(null)}
                />
            )}

            {quickStockItem && (
                <QuickStockDialog
                    item={quickStockItem}
                    open={!!quickStockItem}
                    onOpenChange={(open) => !open && setQuickStockItem(null)}
                    defaultType={quickStockType}
                />
            )}

        </div>
    )
}
