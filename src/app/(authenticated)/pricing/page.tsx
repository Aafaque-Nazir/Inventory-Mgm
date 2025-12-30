'use client'

import { Check, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function PricingPage() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Upgrade your plan</h2>
                    <p className="text-muted-foreground mt-2">
                        Unlock the full potential of your inventory with our Pro features.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
                {/* Free Plan */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl">Starter</CardTitle>
                        <CardDescription>Perfect for small shops just starting out.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                        <ul className="mt-6 space-y-2 text-sm">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> 1 User Limit</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> up to 50 Items</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Basic Inventory Tracking</li>
                            <li className="flex items-center text-muted-foreground"><X className="mr-2 h-4 w-4" /> No Email Alerts</li>
                            <li className="flex items-center text-muted-foreground"><X className="mr-2 h-4 w-4" /> No Reports</li>
                            <li className="flex items-center text-muted-foreground"><X className="mr-2 h-4 w-4" /> No Team Access</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                    </CardFooter>
                </Card>

                {/* Pro Plan - Highlighted */}
                <Card className="flex flex-col border-primary shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                        MOST POPULAR
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            Pro <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        </CardTitle>
                        <CardDescription>For growing businesses that need control.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-3xl font-bold">$19<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                        <ul className="mt-6 space-y-2 text-sm font-medium">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> 5 Team Members</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Unlimited Items</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Low Stock Email Alerts</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Advanced Reports & Analytics</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Priority Email Support</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md">
                            Upgrade to Pro
                        </Button>
                    </CardFooter>
                </Card>

                {/* Enterprise Plan */}
                <Card className="flex flex-col bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-xl">Enterprise</CardTitle>
                        <CardDescription>Custom solutions for large organizations.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-3xl font-bold">Custom</div>
                        <ul className="mt-6 space-y-2 text-sm">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Unlimited Users</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Unlimited Everything</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Dedicated Account Manager</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Custom Integrations (ERP)</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> SLA & Security Audit</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="secondary" className="w-full">Contact Sales</Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Testimonials or Trust Signals */}
            <div className="mt-12 text-center">
                <p className="text-muted-foreground text-sm">
                    Trusted by 500+ businesses worldwide.
                    <br />
                    Secure payments via Stripe. Cancel anytime.
                </p>
            </div>
        </div>
    )
}
