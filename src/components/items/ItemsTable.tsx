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
import dynamicImport from 'next/dynamic'

const EditItemDialog = dynamicImport(() => import('./EditItemDialog').then(m => m.EditItemDialog), { ssr: false })
const QuickStockDialog = dynamicImport(() => import('./QuickStockDialog').then(m => m.QuickStockDialog), { ssr: false })

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
        } catch (_error: any) {
            toast.error('Failed to delete item')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                 <div className="relative w-full md:max-w-sm group">
                    <Input
                        placeholder="Search items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-black/50 border-white/10 text-white placeholder:text-slate-500 hover:bg-black/60 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all rounded-xl h-11"
                    />
                    <ScanBarcode className="absolute left-3 top-3 h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                 </div>
                 <div className="text-sm text-slate-400">
                     Showing <span className="font-bold text-white">{filteredItems.length}</span> items
                 </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111613] backdrop-blur-sm overflow-x-auto shadow-2xl">
                <Table>
                    <TableHeader className="bg-white/[0.02]">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-slate-400 font-medium pl-6">Name</TableHead>
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
                        {filteredItems.length === 0 && (
                             <TableRow className="hover:bg-transparent border-white/5">
                                 <TableCell colSpan={9} className="h-60 text-center text-slate-500">
                                     No items found.
                                 </TableCell>
                             </TableRow>
                        )}
                        {filteredItems.map((item, _index) => (
                            <TableRow key={item.id} className="border-white/5 hover:bg-emerald-500/5 transition-all duration-200 group">
                                <TableCell className="font-medium pl-6">
                                    <div className="flex flex-col">
                                        <span className="text-slate-200 group-hover:text-white transition-colors font-semibold">{item.name}</span>
                                        <span className="text-xs text-slate-500 md:hidden">{item.sku}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-slate-400 group-hover:text-slate-300 font-mono text-xs">{item.sku}</TableCell>
                                <TableCell className="hidden md:table-cell text-slate-400 group-hover:text-slate-300">
                                    {item.category ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                                            {item.category}
                                        </span>
                                    ) : (
                                        <span className="text-slate-600">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-slate-400 group-hover:text-slate-300">{item.size || <span className="text-slate-600">-</span>}</TableCell>
                                <TableCell className="hidden md:table-cell text-slate-400 group-hover:text-slate-300">{item.color || <span className="text-slate-600">-</span>}</TableCell>
                                <TableCell className="font-mono font-bold text-slate-200 group-hover:text-white">{item.current_stock}</TableCell>
                                <TableCell className="hidden md:table-cell text-slate-500 text-xs">{item.unit}</TableCell>
                                <TableCell>
                                    {item.current_stock < item.min_stock ? (
                                        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_-3px_rgba(239,68,68,0.3)]">Low Stock</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]">In Stock</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-[#0d1410] border-white/10 text-slate-200">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem asChild className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer transition-colors">
                                                <Link href={`/items/${item.id}`} className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setEditItem(item)} className="flex items-center gap-2 focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer transition-colors">
                                                <Edit className="h-4 w-4" />
                                                Edit Item
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem onClick={() => { setQuickStockItem(item); setQuickStockType('IN'); }} className="flex items-center gap-2 focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer text-emerald-400">
                                                <TrendingUp className="h-4 w-4" />
                                                Add Stock
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { setQuickStockItem(item); setQuickStockType('OUT'); }} className="flex items-center gap-2 focus:bg-orange-600/20 focus:text-orange-400 cursor-pointer text-orange-400">
                                                <TrendingDown className="h-4 w-4" />
                                                Remove Stock
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem
                                                onClick={() => setDeleteId(item.id)}
                                                className="flex items-center gap-2 text-red-400 focus:bg-red-600/20 focus:text-red-400 cursor-pointer"
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
