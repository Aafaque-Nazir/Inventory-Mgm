'use client'

import {
    Book,
    Package,
    ArrowRightLeft,
    Users,
    ShoppingCart,
    BarChart3,
    Store,
    Settings,
    CreditCard
} from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function GuidePage() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6 max-w-5xl mx-auto">
            <div className="flex flex-col items-center justify-center text-center gap-4 mb-10">
                <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                    <Book className="h-8 w-8 text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">User Guide</h2>
                    <p className="text-slate-400 max-w-2xl text-lg">
                        Master the Inventory Management System with this comprehensive guide.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl hover:bg-white/10 transition-all duration-300">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                <Package className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white/90">Inventory Management</h3>
                                <p className="text-sm text-slate-400">Managing your product catalog.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1" className="border-white/10">
                                <AccordionTrigger className="text-slate-200 hover:text-white">Adding Items</AccordionTrigger>
                                <AccordionContent className="text-slate-400">
                                    Go to the <strong className="text-white">Inventory</strong> page and click "Add Item". Fill in details like Name, SKU, and Base Price.
                                    You can also scan a barcode to quickly add a pre-existing item if configured.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2" className="border-white/10">
                                <AccordionTrigger className="text-slate-200 hover:text-white">Bulk Import</AccordionTrigger>
                                <AccordionContent className="text-slate-400">
                                    Use the "Import CSV" button to add hundreds of items at once. Download the sample CSV first to ensure your format is correct.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3" className="border-none">
                                <AccordionTrigger className="text-slate-200 hover:text-white">Exporting Data</AccordionTrigger>
                                <AccordionContent className="text-slate-400">
                                    Click "Export CSV" to download your catalog. You can filter by date range (Last 30 days, 60 days, or Lifetime) to get specific insights.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl hover:bg-white/10 transition-all duration-300">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <ArrowRightLeft className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white/90">Stock Operations</h3>
                                <p className="text-sm text-slate-400">Handling stock in, out, and transfers.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="stock-1" className="border-white/10">
                                <AccordionTrigger className="text-slate-200 hover:text-white">Stock In/Out</AccordionTrigger>
                                <AccordionContent className="text-slate-400">
                                    Navigate to <strong className="text-white">Stock Movements</strong>. Use "Stock In" when receiving goods and "Stock Out" when selling or consuming them.
                                    You can use the built-in Barcode Scanner for faster entry.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="stock-2" className="border-none">
                                <AccordionTrigger className="text-slate-200 hover:text-white">Warehouse Transfers (PRO)</AccordionTrigger>
                                <AccordionContent className="text-slate-400">
                                    Move items between warehouses easily. Select the source warehouse, destination, and the items to transfer.
                                    Stock will be automatically adjusted in both locations.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl hover:bg-white/10 transition-all duration-300">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                <Store className="h-5 w-5 text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white/90">Multi-Warehouse (PRO)</h3>
                                <p className="text-sm text-slate-400">Managing multiple locations.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-slate-400 mb-4">
                            Organize your stock across different physical locations like "Main Store", "Warehouse A", etc.
                        </p>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="wh-1" className="border-none">
                                <AccordionTrigger className="text-slate-200 hover:text-white">Switching Warehouses</AccordionTrigger>
                                <AccordionContent className="text-slate-400">
                                    Use the <strong className="text-white">Warehouse Switcher</strong> in the top navigation bar to toggle your view.
                                    The entire dashboard will update to show data only for the selected location.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl hover:bg-white/10 transition-all duration-300">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <ShoppingCart className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white/90">Suppliers & POs</h3>
                                <p className="text-sm text-slate-400">Procurement management.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="po-1" className="border-white/10">
                                <AccordionTrigger className="text-slate-200 hover:text-white">Creating Purchase Orders</AccordionTrigger>
                                <AccordionContent className="text-slate-400">
                                    Go to <strong className="text-white">Purchase Orders</strong>. Create a new PO for a supplier.
                                    Once the goods arrive, you can mark the PO as "Received" to automatically increase your stock levels.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="po-2" className="border-none">
                                <AccordionTrigger className="text-slate-200 hover:text-white">Managing Suppliers</AccordionTrigger>
                                <AccordionContent className="text-slate-400">
                                    Keep a directory of all your vendors in the <strong className="text-white">Suppliers</strong> tab. Track contact details and payment terms.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl hover:bg-white/10 transition-all duration-300">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                <BarChart3 className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white/90">Reports & Analytics (PRO)</h3>
                                <p className="text-sm text-slate-400">Insights into your business.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-slate-400">
                            Gain visibility with reports on low stock, sales trends, and stock value.
                            Export these reports to share with your team.
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl hover:bg-white/10 transition-all duration-300">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-500/10 rounded-lg border border-slate-500/20">
                                <Settings className="h-5 w-5 text-slate-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white/90">Settings</h3>
                                <p className="text-sm text-slate-400">Configuration and Team.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <ul className="list-disc list-inside text-sm text-slate-400 space-y-2">
                            <li><strong className="text-slate-200">Profile:</strong> Update your personal details and password.</li>
                            <li><strong className="text-slate-200">Organization:</strong> Manage company details and logo.</li>
                            <li><strong className="text-slate-200">Team:</strong> Invite members to collaborate (Pro plan includes 5 seats).</li>
                            <li><strong className="text-slate-200">Billing:</strong> Manage your subscription and view invoices.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
