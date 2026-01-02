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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function GuidePage() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6 max-w-5xl mx-auto">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Book className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Guide</h2>
                    <p className="text-muted-foreground">
                        Master the Inventory Management System with this comprehensive guide.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-indigo-500" />
                            Inventory Management
                        </CardTitle>
                        <CardDescription>Managing your product catalog.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Adding Items</AccordionTrigger>
                                <AccordionContent>
                                    Go to the <strong>Inventory</strong> page and click "Add Item". Fill in details like Name, SKU, and Base Price.
                                    You can also scan a barcode to quickly add a pre-existing item if configured.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Bulk Import</AccordionTrigger>
                                <AccordionContent>
                                    Use the "Import CSV" button to add hundreds of items at once. Download the sample CSV first to ensure your format is correct.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Exporting Data</AccordionTrigger>
                                <AccordionContent>
                                    Click "Export CSV" to download your catalog. You can filter by date range (Last 30 days, 60 days, or Lifetime) to get specific insights.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowRightLeft className="h-5 w-5 text-green-500" />
                            Stock Operations
                        </CardTitle>
                        <CardDescription>Handling stock in, out, and transfers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="stock-1">
                                <AccordionTrigger>Stock In/Out</AccordionTrigger>
                                <AccordionContent>
                                    Navigate to <strong>Stock Movements</strong>. Use "Stock In" when receiving goods and "Stock Out" when selling or consuming them.
                                    You can use the built-in Barcode Scanner for faster entry.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="stock-2">
                                <AccordionTrigger>Warehouse Transfers (PRO)</AccordionTrigger>
                                <AccordionContent>
                                    Move items between warehouses easily. Select the source warehouse, destination, and the items to transfer.
                                    Stock will be automatically adjusted in both locations.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-orange-500" />
                            Multi-Warehouse (PRO)
                        </CardTitle>
                        <CardDescription>Managing multiple locations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Organize your stock across different physical locations like "Main Store", "Warehouse A", etc.
                        </p>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="wh-1">
                                <AccordionTrigger>Switching Warehouses</AccordionTrigger>
                                <AccordionContent>
                                    Use the **Warehouse Switcher** in the top navigation bar to toggle your view.
                                    The entire dashboard will update to show data only for the selected location.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-blue-500" />
                            Suppliers & POs
                        </CardTitle>
                        <CardDescription>Procurement management.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="po-1">
                                <AccordionTrigger>Creating Purchase Orders</AccordionTrigger>
                                <AccordionContent>
                                    Go to **Purchase Orders**. Create a new PO for a supplier.
                                    Once the goods arrive, you can mark the PO as "Received" to automatically increase your stock levels.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="po-2">
                                <AccordionTrigger>Managing Suppliers</AccordionTrigger>
                                <AccordionContent>
                                    Keep a directory of all your vendors in the **Suppliers** tab. Track contact details and payment terms.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-purple-500" />
                            Reports & Analytics (PRO)
                        </CardTitle>
                        <CardDescription>Insights into your business.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Gain visibility with reports on low stock, sales trends, and stock value.
                            Export these reports to share with your team.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-gray-500" />
                            Settings
                        </CardTitle>
                        <CardDescription>Configuration and Team.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li><strong>Profile:</strong> Update your personal details and password.</li>
                            <li><strong>Organization:</strong> Manage company details and logo.</li>
                            <li><strong>Team:</strong> Invite members to collaborate (Pro plan includes 5 seats).</li>
                            <li><strong>Billing:</strong> Manage your subscription and view invoices.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
