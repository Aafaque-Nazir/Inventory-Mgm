'use client'

import { useState, useRef, useTransition } from 'react'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Upload, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { bulkCreateItems } from '@/app/actions/items'

interface CsvItem {
    name: string
    sku: string
    category: string
    unit: string
    min_stock: string
    initial_stock: string
    cost_price: string
    selling_price: string
    size: string
    color: string
}

interface CsvImporterProps {
    trigger?: React.ReactNode
}

export function CsvImporter({ trigger }: CsvImporterProps = {}) {
    const [open, setOpen] = useState(false)
    const [data, setData] = useState<CsvItem[]>([])
    const [__fileName, setFileName] = useState('')
    const [isPending, startTransition] = useTransition()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFileName(file.name)

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h: string) => h.toLowerCase().replace(/\s+/g, '_').trim(), // Normalize headers
            complete: (results: any) => {
                const parsedData = results.data.map((row: any) => ({
                    name: row.name || row.item_name || '',
                    sku: row.sku || row.barcode || '',
                    category: row.category || '',
                    unit: row.unit || 'pcs',
                    min_stock: row.min_stock || '0',
                    initial_stock: row.initial_stock || row.quantity || '0',
                    cost_price: row.cost_price || row.buying_price || '0',
                    selling_price: row.selling_price || row.price || '0',
                    size: row.size || '',
                    color: row.color || ''
                }))
                setData(parsedData)
            },
            error: (error: Error) => {
                toast.error('Failed to parse CSV: ' + error.message)
            }
        })
    }

    const updateRow = (index: number, field: keyof CsvItem, value: string) => {
        const newData = [...data]
        newData[index] = { ...newData[index], [field]: value }
        setData(newData)
    }

    const validateRow = (item: CsvItem) => {
        return !!(item.name && item.sku && item.unit)
    }

    const allValid = data.length > 0 && data.every(validateRow)

    const handleImport = () => {
        if (!allValid) {
            toast.error('Please fix invalid rows before importing.')
            return
        }

        startTransition(async () => {
            const result = await bulkCreateItems(data)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(result.message)
                setOpen(false)
                setData([])
                setFileName('')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" /> Import CSV
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Import Items via CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file. Required columns: Name, SKU, Unit.
                        <br />
                        Supported: Category, Min Stock, Initial Stock, Cost Price, Selling Price, Size, Color.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto min-h-[200px] border rounded-md p-4">
                    {data.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <div className="text-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 w-full"
                                onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-sm font-medium">Click to upload CSV</p>
                                <p className="text-xs text-muted-foreground mt-1">or drag and drop here</p>
                            </div>
                            <Button variant="link" onClick={() => {
                                const csvContent = "Name,SKU,Category,Unit,Min Stock,Initial Stock,Cost Price,Selling Price,Size,Color\nApple iPhone,IPH-13,Electronics,pcs,5,10,50000,60000,128GB,Midnight"
                                const blob = new Blob([csvContent], { type: 'text/csv' })
                                const url = window.URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = 'sample_inventory.csv'
                                a.click()
                            }}>
                                Download Sample CSV
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Name *</TableHead>
                                    <TableHead className="w-[150px]">SKU *</TableHead>
                                    <TableHead className="w-[100px]">Unit *</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Cost (₹)</TableHead>
                                    <TableHead>Sell (₹)</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Color</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, idx) => {
                                    const isValid = validateRow(row)
                                    return (
                                        <TableRow key={idx} className={isValid ? '' : 'bg-red-50 dark:bg-red-950/20'}>
                                            <TableCell>
                                                <Input
                                                    value={row.name}
                                                    onChange={(e) => updateRow(idx, 'name', e.target.value)}
                                                    className={!row.name ? 'border-red-500' : ''}
                                                    placeholder="Required"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={row.sku}
                                                    onChange={(e) => updateRow(idx, 'sku', e.target.value)}
                                                    className={!row.sku ? 'border-red-500' : ''}
                                                    placeholder="Required"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={row.unit}
                                                    onChange={(e) => updateRow(idx, 'unit', e.target.value)}
                                                    className={!row.unit ? 'border-red-500' : ''}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={row.category}
                                                    onChange={(e) => updateRow(idx, 'category', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={row.initial_stock}
                                                    onChange={(e) => updateRow(idx, 'initial_stock', e.target.value)}
                                                    className="w-20"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={row.cost_price}
                                                    onChange={(e) => updateRow(idx, 'cost_price', e.target.value)}
                                                    className="w-20"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={row.selling_price}
                                                    onChange={(e) => updateRow(idx, 'selling_price', e.target.value)}
                                                    className="w-20"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={row.size}
                                                    onChange={(e) => updateRow(idx, 'size', e.target.value)}
                                                    className="w-20"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={row.color}
                                                    onChange={(e) => updateRow(idx, 'color', e.target.value)}
                                                    className="w-20"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <DialogFooter className="mt-4">
                    {data.length > 0 && (
                        <div className="flex gap-2 w-full justify-between items-center">
                            <Button variant="ghost" onClick={() => setData([])}>
                                Clear & Upload New
                            </Button>
                            <div className="flex gap-2 items-center">
                                {!allValid && (
                                    <span className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="h-4 w-4" />
                                        Fix invalid rows
                                    </span>
                                )}
                                <Button onClick={handleImport} disabled={!allValid || isPending}>
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                    Import {data.length} Items
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
