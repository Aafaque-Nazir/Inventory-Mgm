import { getCustomers } from '@/app/actions/customers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Phone, Mail, MapPin, IndianRupee, ShoppingBag } from 'lucide-react'
import { CreateCustomerDialog } from '@/components/customers/CreateCustomerDialog'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
    const { customers = [] } = await getCustomers()

    const totalCustomers = customers.length
    const totalRevenue = customers.reduce((sum, c) => sum + Number(c.total_spent || 0), 0)
    const totalOrders = customers.reduce((sum, c) => sum + Number(c.total_orders || 0), 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Customers & CRM</h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Track repeat buyers, customer spending, GSTIN profiles, and order histories.
                    </p>
                </div>
                <CreateCustomerDialog />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="rounded-2xl border-white/10 bg-[#111613] p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Customers</span>
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Users className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl font-black text-white">{totalCustomers}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{totalOrders} total orders processed</p>
                    </div>
                </Card>

                <Card className="rounded-2xl border-white/10 bg-[#111613] p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer Revenue</span>
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <IndianRupee className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl font-black text-white">₹{totalRevenue.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Lifetime customer sales</p>
                    </div>
                </Card>

                <Card className="rounded-2xl border-white/10 bg-[#111613] p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Value / Order</span>
                        <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <ShoppingBag className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl font-black text-emerald-300">₹{Math.round(avgOrderValue).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Average customer spend</p>
                    </div>
                </Card>
            </div>

            {/* Customers Table */}
            <Card className="rounded-2xl border-white/10 bg-[#111613] backdrop-blur-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-emerald-400" />
                            <CardTitle className="text-base sm:text-lg text-white">Customer Directory</CardTitle>
                        </div>
                        <span className="text-xs text-slate-500">{totalCustomers} Registered Customers</span>
                    </div>
                    <CardDescription className="text-xs sm:text-sm text-slate-400">
                        Customers are automatically linked when recording POS invoices or added manually.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                        <Table>
                            <TableHeader className="bg-white/[0.02]">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-slate-400 font-medium pl-6">Customer</TableHead>
                                    <TableHead className="text-slate-400 font-medium">Contact</TableHead>
                                    <TableHead className="text-slate-400 font-medium">GSTIN</TableHead>
                                    <TableHead className="text-center text-slate-400 font-medium">Orders</TableHead>
                                    <TableHead className="text-right text-slate-400 font-medium">Total Spent</TableHead>
                                    <TableHead className="text-right text-slate-400 font-medium pr-6">Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.length === 0 && (
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                            No customers found. Customers will be created automatically when you record sales or click &quot;Add Customer&quot;.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {customers.map((cust) => (
                                    <TableRow key={cust.id} className="border-white/5 hover:bg-emerald-500/5 transition-colors">
                                        <TableCell className="pl-6">
                                            <div className="font-semibold text-white">{cust.name}</div>
                                            {cust.notes && <div className="text-xs text-slate-500 truncate max-w-xs">{cust.notes}</div>}
                                            {cust.address && (
                                                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                                    <MapPin className="h-3 w-3 text-slate-500" />
                                                    <span className="truncate max-w-xs">{cust.address}</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {cust.phone ? (
                                                <div className="flex items-center gap-1 text-sm text-slate-300">
                                                    <Phone className="h-3 w-3 text-emerald-400" />
                                                    {cust.phone}
                                                </div>
                                            ) : (
                                                <span className="text-slate-600 text-xs">-</span>
                                            )}
                                            {cust.email && (
                                                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                                    <Mail className="h-3 w-3 text-blue-400" />
                                                    {cust.email}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {cust.gstin ? (
                                                <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                    {cust.gstin}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 text-xs">Unregistered</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="font-bold text-white bg-white/5 px-2.5 py-1 rounded-md text-sm">
                                                {cust.total_orders || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-black text-white text-base">
                                            ₹{Number(cust.total_spent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-right text-slate-400 text-xs pr-6">
                                            {cust.created_at ? format(new Date(cust.created_at), 'dd MMM yyyy') : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
