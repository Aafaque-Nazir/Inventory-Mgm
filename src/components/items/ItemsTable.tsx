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
import { BarcodeScanner } from '@/components/common/BarcodeScanner'

interface ItemsTableProps {
    items: Item[]
}

export function ItemsTable({ items }: ItemsTableProps) {
    const [search, setSearch] = useState('')
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [editItem, setEditItem] = useState<Item | null>(null)
    const [quickStockItem, setQuickStockItem] = useState<Item | null>(null)
    const [isScanning, setIsScanning] = useState(false)
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
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Search items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <Button variant="outline" size="icon" onClick={() => setIsScanning(true)} title="Scan Barcode">
                    <ScanBarcode className="h-4 w-4" />
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.sku}</TableCell>
                                <TableCell>{item.category || '-'}</TableCell>
                                <TableCell>{item.size || '-'}</TableCell>
                                <TableCell>{item.color || '-'}</TableCell>
                                <TableCell className="font-mono">{item.current_stock}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell>
                                    {item.current_stock < item.min_stock ? (
                                        <Badge variant="destructive">Low</Badge>
                                    ) : (
                                        <Badge variant="secondary">OK</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/items/${item.id}`} className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setEditItem(item)} className="flex items-center gap-2">
                                                <Edit className="h-4 w-4" />
                                                Edit Item
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setQuickStockItem(item)} className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                                Add Stock
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setQuickStockItem(item)} className="flex items-center gap-2">
                                                <TrendingDown className="h-4 w-4 text-red-500" />
                                                Remove Stock
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => setDeleteId(item.id)}
                                                className="flex items-center gap-2 text-destructive"
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
                />
            )}

            <BarcodeScanner
                open={isScanning}
                onOpenChange={setIsScanning}
                onScanSuccess={(code) => setSearch(code)}
            />
        </div>
    )
}
