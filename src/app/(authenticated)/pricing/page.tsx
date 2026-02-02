'use client'

import { Check, X, Zap, Loader2, Sparkles } from 'lucide-react'
import { TrialOfferDialog } from '@/components/subscription/TrialOfferDialog'
import { Button } from '@/components/ui/button'
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

            <div className="flex flex-col items-center justify-center text-center gap-4 mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                    Simple, Transparent Pricing
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl">
                    Choose the plan that's right for your business. Upgrade anytime as you grow.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10 max-w-7xl mx-auto">
                {/* Free Plan */}
                <div className={cn(
                    "relative flex flex-col rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:shadow-indigo-500/10",
                    currentPlan === 'FREE' ? "ring-1 ring-white/10" : ""
                )}>
                    <div className="mb-8">
                        <h3 className="text-xl font-medium text-slate-200">Starter</h3>
                        <p className="text-sm text-slate-400 mt-2">Perfect for small shops just starting out.</p>
                        <div className="mt-6 flex items-baseline">
                            <span className="text-4xl font-bold text-white">₹0</span>
                            <span className="ml-1 text-sm font-medium text-slate-500">/mo</span>
                        </div>
                    </div>
                    <ul className="mb-8 space-y-4 flex-1">
                        {[
                            'Single User',
                            'Basic Inventory Tracking',
                            'Basic Reports (KPIs & trends)',
                            'Sales & Invoices 🧾',
                            'Low Stock Table'
                        ].map((feature) => (
                            <li key={feature} className="flex items-center gap-3">
                                <div className="rounded-full bg-slate-800 p-1">
                                    <Check className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                                <span className="text-sm text-slate-300">{feature}</span>
                            </li>
                        ))}
                        <li className="flex items-center gap-3 text-slate-500">
                            <div className="rounded-full bg-slate-800/50 p-1">
                                <X className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-sm">No Financial Analytics</span>
                        </li>
                        <li className="flex items-center gap-3 text-slate-500">
                            <div className="rounded-full bg-slate-800/50 p-1">
                                <X className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-sm">No Barcode Scanning</span>
                        </li>
                    </ul>
                    <Button
                        className="w-full bg-white/5 hover:bg-white/10 text-slate-300 border-0 rounded-xl transition-all duration-200"
                        disabled
                    >
                        {currentPlan === 'FREE' ? 'Current Plan' : 'Downgrade'}
                    </Button>
                </div>

                {/* Pro Plan - Highlighted */}
                <div className={cn(
                    "relative flex flex-col rounded-3xl border border-indigo-500/30 bg-indigo-900/10 backdrop-blur-md p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/20 ring-1 ring-indigo-500/50 scale-105 z-10",
                    currentPlan === 'PRO' ? "ring-indigo-500" : ""
                )}>
                    <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1 text-xs font-medium text-white shadow-lg shadow-indigo-500/40 flex items-center gap-1">
                        MOST POPULAR
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-medium text-indigo-300 flex items-center gap-2">
                                    Pro <Zap className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                </h3>
                                <p className="text-sm text-indigo-200/60 mt-2">For growing businesses that need control.</p>
                            </div>
                            {currentPlan === 'PRO' && subStatus === 'TRIALING' && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                    Trial Active
                                </span>
                            )}
                        </div>
                        <div className="mt-6 flex items-baseline">
                            <span className="text-5xl font-bold text-white">₹399</span>
                            <span className="ml-1 text-sm font-medium text-indigo-200/60">/mo</span>
                        </div>
                    </div>

                    <ul className="mb-8 space-y-4 flex-1">
                        {[
                            { text: '5 Team Members', icon: Check },
                            { text: 'Advanced Financial Analytics 💰', icon: Check },
                            { text: 'Barcode Scanning App 📱', icon: Check },
                            { text: 'Stock Movement Logs (Audit Trail) 📋', icon: Check },
                            { text: 'Warehouse Transfers 🚚', icon: Check },
                            { text: 'Low Stock Email Alerts', icon: Check },
                            { text: 'AI Stock Predictions 🤖', icon: Check },
                            { text: 'Bulk CSV Import/Export 📤', icon: Check },
                        ].map((item) => (
                            <li key={item.text} className="flex items-center gap-3">
                                <div className="rounded-full bg-indigo-500/20 p-1">
                                    <item.icon className="h-3.5 w-3.5 text-indigo-400" />
                                </div>
                                <span className="text-sm text-white font-medium">{item.text}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="flex flex-col gap-3">
                        {currentPlan === 'PRO' && subStatus !== 'TRIALING' ? (
                            <Button className="w-full bg-emerald-500/20 text-emerald-400 cursor-default hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl" disabled>
                                <Check className="mr-2 h-4 w-4" /> Current Plan
                            </Button>
                        ) : (
                            <>
                                {currentPlan === 'PRO' && subStatus === 'TRIALING' && (
                                    <div className="w-full mb-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
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
                                        className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white border-0 rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-300 font-bold"
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

                                <Button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="mr-2 h-4 w-4 fill-white" />
                                            Upgrade to Pro
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Enterprise Plan */}
                <div className="relative flex flex-col rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:shadow-indigo-500/10">
                    <div className="mb-8">
                        <h3 className="text-xl font-medium text-slate-200">Enterprise</h3>
                        <p className="text-sm text-slate-400 mt-2">Custom solutions for large organizations.</p>
                        <div className="mt-6 flex items-baseline">
                            <span className="text-4xl font-bold text-white">Custom</span>
                        </div>
                    </div>
                    <ul className="mb-8 space-y-4 flex-1">
                        {[
                            'Unlimited Users & Roles',
                            'Custom Feature Development',
                            'Dedicated Account Manager',
                            'Custom Integrations (ERP/SAP)',
                            'On-premise Deployment',
                            '24/7 Priority Support'
                        ].map((feature) => (
                            <li key={feature} className="flex items-center gap-3">
                                <div className="rounded-full bg-purple-500/20 p-1">
                                    <Check className="h-3.5 w-3.5 text-purple-400" />
                                </div>
                                <span className="text-sm text-slate-300">{feature}</span>
                            </li>
                        ))}
                    </ul>
                    <Button
                        className="w-full bg-white/10 hover:bg-white/20 text-white border-0 rounded-xl transition-all duration-200"
                        asChild
                    >
                        <a href="mailto:sales@inventory.com?subject=Enterprise%20Plan%20Inquiry">Contact Sales</a>
                    </Button>
                </div>
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
