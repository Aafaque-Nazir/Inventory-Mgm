'use client'

import { Check, X, Zap, Loader2, Sparkles } from 'lucide-react'
import { TrialOfferDialog } from '@/components/subscription/TrialOfferDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import Script from 'next/script'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

declare global {
    interface Window {
        Cashfree: any;
    }
}

export default function PricingPage() {
    const [loading, setLoading] = useState(false)
    const [currentPlan, setCurrentPlan] = useState<string>('FREE')
    const [isLoadingPlan, setIsLoadingPlan] = useState(true)
    const router = useRouter()
    const searchParams = useSearchParams()
    // const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null // BROKEN: Causes infinite loop
    const [trialUsed, setTrialUsed] = useState(false)
    const [subStatus, setSubStatus] = useState<string>('')
    const [orgId, setOrgId] = useState<string>('')
    const [showTrialDialog, setShowTrialDialog] = useState(false)
    const supabase = createClient()

    // Verify Payment Effect
    useEffect(() => {
        const orderId = searchParams?.get('order_id')
        if (orderId) {
            verifyCashfreePayment(orderId)
        }
    }, [searchParams])

    const verifyCashfreePayment = async (orderId: string) => {
        setLoading(true)
        try {
            const res = await fetch('/api/cashfree/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId })
            })
            const data = await res.json()

            if (data.success) {
                toast.success("Payment Successful! Welcome to Pro.")
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname)
                // Force Reload
                window.location.reload()
            } else {
                toast.error(data.error || "Payment verification failed")
            }
        } catch (error) {
            toast.error("Verification failed or Payment was cancelled")
        } finally {
            // Clean URL even on failure to prevent loop/retry on refresh
            window.history.replaceState({}, document.title, window.location.pathname)
            setLoading(false)
        }
    }

    // Load Plan Details
    useEffect(() => {
        async function fetchPlan() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id, organizations(plan_type, trial_used, subscription_status)')
                    .eq('id', user.id)
                    .single()

                // @ts-ignore
                if (profile?.organizations?.plan_type) {
                    // @ts-ignore
                    setCurrentPlan(profile.organizations.plan_type)
                    // @ts-ignore
                    setTrialUsed(profile.organizations.trial_used || false)
                    // @ts-ignore
                    setSubStatus(profile.organizations.subscription_status || '')
                }
                if (profile?.organization_id) setOrgId(profile.organization_id)
            }
            setIsLoadingPlan(false)
        }
        fetchPlan()
    }, [supabase])

    // ... existing plan fetch effect ...

    const handlePayment = async () => {
        setLoading(true)
        try {
            // 1. Create Order & Get Session
            const res = await fetch('/api/cashfree/create-order', {
                method: 'POST'
            })
            const data = await res.json()

            if (data.error) {
                toast.error(data.error)
                setLoading(false)
                return
            }

            // 2. Initialize Cashfree SDK
            const cashfree = new window.Cashfree({
                mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PRODUCTION' ? "production" : "sandbox"
            });

            // 3. Open Checkout
            cashfree.checkout({
                paymentSessionId: data.paymentSessionId,
                returnUrl: `${window.location.origin}/pricing?order_id=${data.orderId}`
            });

        } catch (error) {
            console.error("Payment Error:", error)
            toast.error("Failed to initiate payment")
            setLoading(false)
        }
    }

    if (isLoadingPlan) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <Script
                id="cashfree-js"
                src="https://sdk.cashfree.com/js/v3/cashfree.js"
                strategy="lazyOnload"
            />

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
                <Card className={cn("flex flex-col", currentPlan === 'FREE' ? "border-primary border-2 shadow-lg ring-1 ring-primary/20" : "")}>
                    <CardHeader>
                        <CardTitle className="text-xl">Starter</CardTitle>
                        <CardDescription>Perfect for small shops just starting out.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-3xl font-bold">₹0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                        <ul className="mt-6 space-y-2 text-sm">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Single User</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Basic Inventory Tracking</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Basic Reports (KPIs & trends)</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Low Stock Table</li>
                            <li className="flex items-center text-muted-foreground"><X className="mr-2 h-4 w-4" /> No Financial Analytics</li>
                            <li className="flex items-center text-muted-foreground"><X className="mr-2 h-4 w-4" /> No Barcode Scanning</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" disabled>
                            {currentPlan === 'FREE' ? 'Current Plan' : 'Downgrade'}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Pro Plan - Highlighted */}
                <Card className={cn("flex flex-col shadow-lg relative overflow-hidden", currentPlan === 'PRO' ? "border-green-500 border-2 ring-1 ring-green-500/20" : "border-primary")}>
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                        MOST POPULAR
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            Pro <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            {currentPlan === 'PRO' && subStatus === 'TRIALING' && (
                                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
                                    Trial Active
                                </span>
                            )}
                        </CardTitle>
                        <CardDescription>For growing businesses that need control.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-3xl font-bold">₹1499<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                        <ul className="mt-6 space-y-2 text-sm font-medium">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> 5 Team Members</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> <strong>Advanced Financial Analytics</strong> 💰</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> <strong>Barcode Scanning App</strong> 📱</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Low Stock Email Alerts</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> AI Stock Predictions 🤖</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Bulk CSV Import/Export 📤</li>
                        </ul>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        {currentPlan === 'PRO' && subStatus !== 'TRIALING' ? (
                            <Button className="w-full bg-green-600 hover:bg-green-700 cursor-default" disabled>
                                <Check className="mr-2 h-4 w-4" /> Current Plan
                            </Button>
                        ) : (
                            <>
                                {currentPlan === 'PRO' && subStatus === 'TRIALING' && (
                                    <div className="w-full mb-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-center">
                                        <p className="text-sm font-medium text-indigo-400">
                                            ⚠️ Trial Mode Active
                                        </p>
                                        <p className="text-xs text-indigo-300/80 mt-1">
                                            Upgrade now to keep your data & features forever.
                                        </p>
                                    </div>
                                )}

                                {currentPlan === 'FREE' && !trialUsed && (
                                    <Button
                                        className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-md text-white font-bold h-10"
                                        onClick={() => {
                                            toast.info("Loading offer details...")
                                            console.log("Opening trial dialog for org:", orgId)
                                            setShowTrialDialog(true)
                                        }}
                                    >
                                        <Sparkles className="mr-2 h-4 w-4 fill-white" />
                                        Start 5-Day Free Trial
                                    </Button>
                                )}

                                <div className="w-full">
                                    <Button
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                                        onClick={handlePayment}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4 fill-current" />}
                                        {loading ? 'Processing...' : 'Upgrade to Pro'}
                                    </Button>
                                </div>
                            </>
                        )}
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
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Unlimited Users & Roles</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> <strong>Custom Feature Development</strong></li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Dedicated Account Manager</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Custom Integrations (ERP/SAP)</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> on-premise Deployment Options</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> 24/7 Priority Phone Support</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="secondary" className="w-full" asChild>
                            <a href="mailto:sales@inventory.com?subject=Enterprise%20Plan%20Inquiry">Contact Sales</a>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Trust Signals */}
            <div className="mt-12 text-center">
                <p className="text-muted-foreground text-sm">
                    Trusted by 500+ businesses worldwide.
                    <br />
                    Secure payments via Cashfree Payments. Cancel anytime.
                </p>
            </div>
            <TrialOfferDialog
                open={showTrialDialog}
                onOpenChange={setShowTrialDialog}
                organizationId={orgId}
                trialUsed={trialUsed}
                planType={currentPlan}
            />
        </div >
    )
}
