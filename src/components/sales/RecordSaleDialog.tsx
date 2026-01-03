'use client'

import { useState, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, ShoppingCart, Loader2, Printer, Search } from 'lucide-react'
import { createInvoice } from '@/app/actions/invoices'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Item, InvoiceItem } from '@/types'
import { InvoiceTemplate } from '@/components/sales/InvoiceTemplate'
import { getWarehouseCookie } from '@/app/actions/warehouse-cookie' // Server Action

interface RecordSaleDialogProps {
    trigger?: React.ReactNode
    initialItem?: Item
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function RecordSaleDialog({ trigger, initialItem, open: controlledOpen, onOpenChange: setControlledOpen }: RecordSaleDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)

    // Use controlled state if provided, otherwise internal
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen

    const setOpen = (newOpen: boolean) => {
        if (isControlled) {
            setControlledOpen?.(newOpen)
        } else {
            setInternalOpen(newOpen)
        }
    }

    const [step, setStep] = useState<'CART' | 'DETAILS' | 'SUCCESS'>('CART')
    const [items, setItems] = useState<Item[]>([])
    const [cart, setCart] = useState<InvoiceItem[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isPending, startTransition] = useTransition()
    const [lastInvoiceId, setLastInvoiceId] = useState<string | null>(null)
    const [lastInvoiceData, setLastInvoiceData] = useState<any>(null)

    // Customer Details
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('CASH')

    const supabase = createClient()

    // Fetch Items for Search
    useEffect(() => {
        async function fetchItems() {
            if (!open) return
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single()

            if (profile?.organization_id) {
                const warehouseId = await getWarehouseCookie()

                // 1. Fetch ALL items for the organization
                const { data: allItems } = await supabase
                    .from('items')
                    .select('*')
                    .eq('organization_id', profile.organization_id)

                if (!allItems) {
                    setItems([])
                    return
                }

                let finalItems = allItems

                // 2. If warehouse selected, fetch specific stock
                if (warehouseId) {
                    const { data: stockData } = await supabase
                        .from('item_stock')
                        .select('item_id, quantity')
                        .eq('location_id', warehouseId)
                        .in('item_id', allItems.map(i => i.id))

                    // Map stock data to items (override current_stock)
                    finalItems = allItems.map(item => {
                        const stockEntry = stockData?.find(s => s.item_id === item.id)
                        return {
                            ...item,
                            current_stock: stockEntry ? stockEntry.quantity : 0 // Default to 0 if no record for this warehouse
                        }
                    })
                }

                // 3. Filter out items with 0 stock (Optional, or just show them as out of stock)
                setItems(finalItems)
            }
        }
        fetchItems()
    }, [open, supabase])

    // Auto-add initial item if provided
    useEffect(() => {
        if (open && initialItem && items.length > 0 && cart.length === 0) {
            const found = items.find(i => i.id === initialItem.id)
            if (found) {
                // Determine valid quantity to add (1 or 0 if OOS)
                if ((found.current_stock || 0) > 0) {
                    setCart([{
                        item_id: found.id,
                        name: found.name,
                        quantity: 1,
                        unit_price: found.selling_price || 0,
                        total: found.selling_price || 0
                    }])
                    toast.success(`${found.name} added to cart`)
                } else {
                    toast.error(`${found.name} is out of stock`)
                }
            }
        }
    }, [open, items, initialItem])

    const filteredItems = items.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const addToCart = (item: Item) => {
        setCart(prev => {
            const existing = prev.find(p => p.item_id === item.id)
            if (existing) {
                if (existing.quantity >= (item.current_stock || 0)) {
                    toast.error(`Only ${item.current_stock} units available`)
                    return prev
                }
                return prev.map(p => p.item_id === item.id
                    ? { ...p, quantity: p.quantity + 1, total: (p.quantity + 1) * p.unit_price }
                    : p)
            }

            if ((item.current_stock || 0) < 1) {
                toast.error('Item is out of stock')
                return prev
            }

            return [...prev, {
                item_id: item.id,
                name: item.name,
                quantity: 1,
                unit_price: item.selling_price || 0,
                total: item.selling_price || 0
            }]
        })
        setSearchTerm('') // Clear search after adding
    }

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(p => p.item_id !== itemId))
    }

    const updateQty = (itemId: string, qty: number) => {
        if (qty < 1) return

        const originalItem = items.find(i => i.id === itemId)
        if (originalItem && qty > (originalItem.current_stock || 0)) {
            toast.error(`Only ${originalItem.current_stock} units available`)
            return
        }

        setCart(prev => prev.map(p => p.item_id === itemId ? { ...p, quantity: qty, total: qty * p.unit_price } : p))
    }

    const cartTotal = cart.reduce((sum, item) => sum + item.total, 0)

    const handleCheckout = async () => {
        if (cart.length === 0) return

        const formData = new FormData()
        formData.append('customer_name', customerName)
        formData.append('customer_phone', customerPhone)
        formData.append('payment_method', paymentMethod)
        formData.append('total_amount', cartTotal.toString())
        formData.append('items', JSON.stringify(cart))

        startTransition(async () => {
            const result = await createInvoice({}, formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Sale Recorded!')
                setLastInvoiceId(result.invoiceId)
                setLastInvoiceData({
                    id: result.invoiceId,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    items: cart,
                    total_amount: cartTotal,
                    created_at: new Date().toISOString()
                })
                setStep('SUCCESS')
            }
        })
    }

    const reset = () => {
        setCart([])
        setCustomerName('')
        setCustomerPhone('')
        setStep('CART')
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                        <ShoppingCart className="h-4 w-4" /> POS / New Sale
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>
                        {step === 'CART' && 'New Sale'}
                        {step === 'DETAILS' && 'Customer Details'}
                        {step === 'SUCCESS' && 'Sale Completed'}
                    </DialogTitle>
                </DialogHeader>

                {step === 'CART' && (
                    <div className="flex flex-1 gap-4 overflow-hidden p-6 pt-0">
                        {/* Left: Search & Items */}
                        <div className="w-1/2 flex flex-col gap-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search item or Scan SKU..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-2">
                                {filteredItems.length === 0 && <p className="text-center text-muted-foreground py-4">No items found</p>}
                                {filteredItems.map(item => (
                                    <div key={item.id}
                                        className="flex justify-between items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-200"
                                        onClick={() => addToCart(item)}
                                    >
                                        <div className="truncate">
                                            <p className="font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Qty: {item.current_stock}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">₹{item.selling_price}</p>
                                            <Button size="icon" variant="ghost" className="h-6 w-6"><Plus className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Cart */}
                        <div className="w-1/2 flex flex-col border-l pl-4">
                            <h3 className="font-semibold mb-2">Current Cart</h3>
                            <div className="flex-1 overflow-y-auto space-y-3">
                                {cart.length === 0 && <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Cart is empty</div>}
                                {cart.map(item => (
                                    <div key={item.item_id} className="flex justify-between items-start text-sm">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <button onClick={() => updateQty(item.item_id, item.quantity - 1)} className="px-1.5 bg-slate-200 dark:bg-slate-800 rounded">-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQty(item.item_id, item.quantity + 1)} className="px-1.5 bg-slate-200 dark:bg-slate-800 rounded">+</button>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <p className="font-bold">₹{item.total}</p>
                                            <button onClick={() => removeFromCart(item.item_id)} className="text-red-500 text-xs mt-1"><Trash2 className="h-3 w-3" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <Button className="w-full mt-4" disabled={cart.length === 0} onClick={() => setStep('DETAILS')}>
                                    Proceed to Checkout
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'DETAILS' && (
                    <div className="space-y-4 pt-4 p-6">
                        <div className="grid gap-2">
                            <Label>Payment Method</Label>
                            <div className="flex gap-2">
                                {['CASH', 'UPI', 'CARD', 'OTHER'].map(m => (
                                    <Button
                                        key={m}
                                        variant={paymentMethod === m ? 'default' : 'outline'}
                                        onClick={() => setPaymentMethod(m)}
                                        className="flex-1"
                                    >
                                        {m}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Customer Name (Optional)</Label>
                            <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Rahul Kumar" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Phone Number (Optional)</Label>
                            <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="e.g. 9876543210" />
                        </div>

                        <div className="flex justify-between gap-4 mt-8 pt-4 border-t">
                            <Button variant="outline" onClick={() => setStep('CART')}>Back</Button>
                            <Button onClick={handleCheckout} disabled={isPending} className="flex-1 bg-green-600 hover:bg-green-700">
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Complete Payment (₹{cartTotal})
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'SUCCESS' && (
                    <div className="flex flex-col items-center justify-center flex-1 space-y-6 pt-4 p-6 bg-slate-50 dark:bg-slate-900 overflow-hidden">

                        {/* Invoice Preview */}
                        <div className="border rounded-lg shadow-lg bg-white overflow-y-auto w-full max-w-full flex-1">
                            <div className="min-w-[600px] p-4">
                                <InvoiceTemplate invoice={lastInvoiceData} />
                            </div>
                        </div>

                        <div className="flex gap-4 w-full pt-4 border-t bg-white dark:bg-slate-950 p-4">
                            <Button className="flex-1 bg-slate-900 text-white hover:bg-slate-800" onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" /> Print Receipt
                            </Button>
                            <Button className="flex-1" variant="outline" onClick={reset}>
                                New Sale
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
