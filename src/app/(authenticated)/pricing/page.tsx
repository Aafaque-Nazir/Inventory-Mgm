'use client'

import { Check, X, Zap, Loader2, Sparkles, Phone, ShieldCheck, ArrowRight, Shield, CreditCard, RotateCcw, Clock, Building2 } from 'lucide-react'
import { TrialOfferDialog } from '@/components/subscription/TrialOfferDialog'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Script from 'next/script'
import { PLANS_CONFIG } from '@/config/plans'

export default function PricingPage() {
    const [loading, setLoading] = useState(false)
    const [currentPlan, setCurrentPlan] = useState<string>('FREE')
    const [isLoadingPlan, setIsLoadingPlan] = useState(true)
    const router = useRouter()
    const searchParams = useSearchParams()
    const [trialUsed, setTrialUsed] = useState(false)
    const [subStatus, setSubStatus] = useState<string>('')
    const [orgId, setOrgId] = useState<string>('')
    const [showTrialDialog, setShowTrialDialog] = useState(false)

    // Billing Cycle State: Yearly by default for best SMB retention and savings
    const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly')

    // Phone Dialog State
    const [phoneModalOpen, setPhoneModalOpen] = useState(false)
    const [phone, setPhone] = useState('')
    const [phoneError, setPhoneError] = useState('')

    const supabase = createClient()

    useEffect(() => {
        // Reserved for future query-param based flows if needed
    }, [searchParams])

    const verifyPayment = async (payload: any) => {
        setLoading(true)
        try {
            const res = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const data = await res.json()

            if (data.success) {
                toast.success("Payment Successful! Welcome to Pro.")
                setCurrentPlan('PRO')
                setSubStatus('ACTIVE')
                window.history.replaceState({}, document.title, window.location.pathname)
                router.refresh()
            } else {
                toast.error(data.error || "Payment verification failed")
            }
        } catch (_error: any) {
            toast.error("Verification failed or Payment was cancelled")
        } finally {
            window.history.replaceState({}, document.title, window.location.pathname)
            setLoading(false)
        }
    }

    // Load Plan Details & Prefill Phone
    useEffect(() => {
        async function fetchPlan() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id, organizations(plan_type, trial_used, subscription_status)')
                    .eq('id', user.id)
                    .single()

                const orgs = profile?.organizations as any
                if (orgs?.plan_type) {
                    setCurrentPlan(orgs.plan_type)
                    setTrialUsed(orgs.trial_used || false)
                    setSubStatus(orgs.subscription_status || '')
                }
                if (profile?.organization_id) setOrgId(profile.organization_id)

                try {
                    const authPhone = (user.user_metadata as any)?.phone || user.phone
                    const rawDigits = authPhone ? String(authPhone).replace(/\D/g, '') : ''
                    const digits10 = rawDigits.length === 12 && rawDigits.startsWith('91')
                        ? rawDigits.slice(2)
                        : (rawDigits.length === 10 ? rawDigits : '')

                    if (digits10 && /^[6-9]\d{9}$/.test(digits10)) {
                        setPhone(digits10)
                    } else {
                        const cached = localStorage.getItem('inv_billing_phone')
                        if (cached && /^[6-9]\d{9}$/.test(cached)) {
                            setPhone(cached)
                        }
                    }
                } catch {
                    // ignore
                }
            }
            setIsLoadingPlan(false)
        }
        fetchPlan()
    }, [supabase])

    const handleUpgradeClick = () => {
        setPhoneError('')
        setPhoneModalOpen(true)
    }

    const handleConfirmPayment = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        const cleanDigits = phone.replace(/\D/g, '')
        if (!cleanDigits || cleanDigits.length !== 10 || !/^[6-9]/.test(cleanDigits)) {
            setPhoneError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.')
            return
        }
        setPhoneError('')

        try {
            localStorage.setItem('inv_billing_phone', cleanDigits)
        } catch {
            // ignore
        }

        setPhoneModalOpen(false)
        await initiatePayment(cleanDigits)
    }

    const loadRazorpayScript = () => {
        return new Promise<boolean>((resolve) => {
            if (typeof window !== 'undefined' && (window as any).Razorpay) {
                resolve(true)
                return
            }
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.async = true
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const initiatePayment = async (phoneToUse: string) => {
        setLoading(true)
        try {
            const scriptLoaded = await loadRazorpayScript()
            if (!scriptLoaded || !(window as any).Razorpay) {
                toast.error("Could not load Razorpay checkout. Please check your internet connection or disable adblocker.")
                setLoading(false)
                return
            }

            const res = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phoneToUse, cycle: billingCycle })
            })

            let data: any = null
            try {
                data = await res.json()
            } catch {
                toast.error(`Order creation failed (Status ${res.status}). Please verify server configuration.`)
                setLoading(false)
                return
            }

            if (!res.ok || data?.error) {
                toast.error(data?.error || `Order creation failed (${res.status})`)
                setLoading(false)
                return
            }

            const options: any = {
                key: data.key,
                name: "InvMaster Pro",
                description: billingCycle === 'yearly' ? 'InvMaster Pro Annual Subscription' : 'InvMaster Pro Monthly Subscription',
                prefill: {
                    contact: phoneToUse
                },
                theme: {
                    color: "#10b981"
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false)
                        toast.info("Payment cancelled")
                    }
                }
            }

            if (data.subscriptionId) {
                // Razorpay Recurring Subscription (UPI Autopay / e-Mandate)
                options.subscription_id = data.subscriptionId
                options.handler = function (response: any) {
                    verifyPayment({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_subscription_id: response.razorpay_subscription_id,
                        razorpay_signature: response.razorpay_signature,
                        cycle: billingCycle
                    })
                }
            } else {
                // Fallback: One-time order
                options.amount = data.amount * 100 // in paise
                options.currency = "INR"
                options.order_id = data.orderId
                options.handler = function (response: any) {
                    verifyPayment({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        cycle: billingCycle
                    })
                }
            }

            const rzp = new (window as any).Razorpay(options)
            rzp.on('payment.failed', function (response: any) {
                toast.error(response.error?.description || "Payment failed")
                setLoading(false)
            })
            rzp.open()

        } catch (error: any) {
            console.error("Payment Error:", error)
            toast.error(error?.message || "Failed to initiate payment")
            setLoading(false)
        }
    }

    if (isLoadingPlan) {
        return (
            <div className="flex h-[60vh] w-full items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
            </div>
        )
    }

    const currentProConfig = PLANS_CONFIG.pro[billingCycle]
    const proPrice = currentProConfig.price
    const proMonthlyEquivalent = currentProConfig.monthlyEquivalent

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            {/* Header */}
            <div className="text-center space-y-3 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Simple, Transparent Pricing for Wholesalers</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                    Built for Fast Inventory, Not Bloated ERPs
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                    Manage godowns, batch expiry, purchase orders, and GST bills with zero hidden fees. Upgrade or cancel anytime.
                </p>

                {/* Billing Cycle Toggle */}
                <div className="pt-2 flex items-center justify-center">
                    <div className="inline-flex p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                        <button
                            type="button"
                            onClick={() => setBillingCycle('monthly')}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                                billingCycle === 'monthly'
                                    ? "bg-white/15 text-white shadow-sm"
                                    : "text-slate-400 hover:text-white"
                            )}
                        >
                            Monthly ({PLANS_CONFIG.pro.monthly.displayPrice}/mo)
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingCycle('yearly')}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                                billingCycle === 'yearly'
                                    ? "bg-emerald-500 text-[#04160c] shadow-md shadow-emerald-500/25"
                                    : "text-emerald-400 hover:text-emerald-300"
                            )}
                        >
                            <span>Yearly ({PLANS_CONFIG.pro.yearly.displayPrice}/yr)</span>
                            {PLANS_CONFIG.isFoundingOfferActive && (
                                <span className={cn(
                                    "text-[10px] uppercase px-1.5 py-0.5 rounded-full font-extrabold tracking-wider",
                                    billingCycle === 'yearly' ? "bg-[#04160c] text-emerald-300" : "bg-emerald-500/20 text-emerald-300"
                                )}>
                                    {PLANS_CONFIG.pro.yearly.badge}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* 2-Tier Pricing Grid: Free vs Pro */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-4xl mx-auto">
                
                {/* 1. Starter (Free) Plan */}
                <div className={cn(
                    "relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#0e1410]/90 backdrop-blur-xl p-6 sm:p-7 transition-all duration-200 hover:border-white/20 shadow-xl",
                    currentPlan === 'FREE' && "ring-1 ring-white/15"
                )}>
                    <div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Starter</h3>
                            {currentPlan === 'FREE' && (
                                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                                    Current Plan
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                            Ideal for small retail shops and single godown businesses getting started with digitized inventory.
                        </p>

                        <div className="my-5 pb-5 border-b border-white/5 flex items-baseline gap-1.5">
                            <span className="text-4xl font-extrabold text-white tracking-tight">₹0</span>
                            <span className="text-xs text-slate-400 font-medium">/ lifetime free</span>
                        </div>

                        <div className="space-y-3 mb-6">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Included In Free</p>
                            <ul className="space-y-2.5 text-xs">
                                {[
                                    'Up to 200 Products / SKUs',
                                    '1 Warehouse / Central Godown',
                                    '1 Admin Account',
                                    'Mobile Camera Barcode Scanner (No hardware needed)',
                                    'GST Tax Invoicing with HSN codes',
                                    '1-Click WhatsApp Invoice Dispatch',
                                    'Batch Number & Expiry Tracking',
                                    'Basic Stock In / Stock Out Movements'
                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-2.5 text-slate-300">
                                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                                {[
                                    'Multi-Godown Inter-Warehouse Transfers',
                                    'Multi-User Team Roles (Manager, Storekeeper)',
                                    'Stock Audit Trail & Activity Logs',
                                    'Wholesale Purchase Orders & Receiving',
                                    'Real-Time P&L & Dead Stock Analytics',
                                    'Automated Low-Stock Email Alerts'
                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-2.5 text-slate-500">
                                        <X className="h-4 w-4 text-slate-600 shrink-0" />
                                        <span className="line-through">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            className="w-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl h-11 text-xs font-semibold cursor-default"
                            disabled
                        >
                            {currentPlan === 'FREE' ? 'Active Plan' : 'Free Tier'}
                        </Button>
                    </div>
                </div>

                {/* 2. Pro Plan (Distributor Growth) */}
                <div className={cn(
                    "relative flex flex-col justify-between rounded-3xl border border-emerald-500/30 bg-[#0e1410] p-6 sm:p-7 shadow-xl ring-1 ring-emerald-500/30 transition-all duration-200 hover:border-emerald-500/50",
                    currentPlan === 'PRO' && "ring-2 ring-emerald-400"
                )}>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-white">Pro Plan</h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 tracking-wider uppercase">
                                    {billingCycle === 'yearly' && PLANS_CONFIG.isFoundingOfferActive ? PLANS_CONFIG.pro.yearly.badge : 'Pro Tier'}
                                </span>
                            </div>
                            {currentPlan === 'PRO' && subStatus === 'TRIALING' ? (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    Trial Active
                                </span>
                            ) : currentPlan === 'PRO' ? (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Current Plan
                                </span>
                            ) : (
                                <span className="text-[10px] font-semibold text-slate-400">
                                    Distributor Tier
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-emerald-200/70 mt-1 min-h-[32px]">
                            Engineered for high-volume distributors, FMCG/Pharma dealers, and multi-godown operations.
                        </p>

                        <div className="my-5 pb-5 border-b border-emerald-500/20 flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-white tracking-tight">₹{proPrice}</span>
                            <span className="text-xs text-emerald-300/70 font-medium">
                                / {billingCycle === 'yearly' ? `year (~₹${proMonthlyEquivalent}/mo)` : 'month'}
                            </span>
                            {currentProConfig.regularPrice && (
                                <span className="ml-auto text-xs text-slate-400 line-through">
                                    Reg. ₹{currentProConfig.regularPrice}
                                </span>
                            )}
                        </div>

                        <div className="space-y-3 mb-6">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Everything in Starter, plus</p>
                            <ul className="space-y-2.5 text-xs">
                                {[
                                    'Unlimited Products & Inventory SKUs',
                                    'Up to 5 Godowns & Multi-Warehouse Stock Routing',
                                    'Up to 5 Team Members with Granular Roles (Admin, Manager, Storekeeper)',
                                    'Stock Movement Audit Trail & Leakage Protection',
                                    'Wholesale Purchase Order Loop (Draft -> Approve -> Receive)',
                                    'Sales Returns & Credit Notes System',
                                    'Real-Time Profit & Loss (P&L) and Margins Analytics',
                                    'Automated Low-Stock & Expiry Alert Emails',
                                    'Bulk CSV Catalog Import & Export',
                                    'Clean Invoices without any InvMaster watermark'
                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-2.5 text-slate-100 font-medium">
                                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-2 space-y-2">
                        {currentPlan === 'PRO' && subStatus !== 'TRIALING' ? (
                            <Button
                                className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl h-11 text-xs font-semibold cursor-default"
                                disabled
                            >
                                <Check className="mr-2 h-4 w-4" /> Current Active Plan
                            </Button>
                        ) : (
                            <>
                                {currentPlan === 'PRO' && subStatus === 'TRIALING' && (
                                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                                        <p className="text-xs font-semibold text-amber-300">
                                            Trial Active
                                        </p>
                                        <p className="text-[11px] text-amber-200/70 mt-0.5">
                                            Lock in your Pro membership today to avoid any interruption in multi-godown sync.
                                        </p>
                                    </div>
                                )}

                                {currentPlan === 'FREE' && !trialUsed && (
                                    <Button
                                        className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl h-11 text-xs font-bold transition-all"
                                        onClick={() => {
                                            toast.info("Opening trial offer...")
                                            setShowTrialDialog(true)
                                        }}
                                    >
                                        <Sparkles className="mr-1.5 h-4 w-4 fill-emerald-300" />
                                        Start 5-Day Free Trial
                                    </Button>
                                )}

                                <Button
                                    onClick={handleUpgradeClick}
                                    disabled={loading}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold border-0 rounded-xl shadow-md shadow-emerald-500/15 transition-all h-11 text-xs"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Connecting Gateway...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="mr-1.5 h-4 w-4 fill-[#04160c]" />
                                            Upgrade to Pro — ₹{proPrice}{billingCycle === 'yearly' ? (PLANS_CONFIG.isFoundingOfferActive ? ' /yr (Founding Deal)' : ' /yr') : ' /mo'}
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

            </div>

            {/* Trust Signals Footer */}
            <div className="border-t border-white/5 pt-6 mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                        <Shield className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-200">256-Bit SSL</span>
                        <span className="text-[10px] text-slate-500">Bank-grade data security</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                        <CreditCard className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-200">Razorpay PG</span>
                        <span className="text-[10px] text-slate-500">UPI, Cards & NetBanking</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                        <Clock className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-200">Instant Activation</span>
                        <span className="text-[10px] text-slate-500">No waiting time</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                        <RotateCcw className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-200">Zero Lock-In</span>
                        <span className="text-[10px] text-slate-500">Keep full control of data</span>
                    </div>
                </div>
            </div>

            <TrialOfferDialog
                open={showTrialDialog}
                onOpenChange={setShowTrialDialog}
                organizationId={orgId}
                trialUsed={trialUsed}
                planType={currentPlan}
            />

            {/* Phone Collection Dialog for Razorpay PG */}
            <Dialog open={phoneModalOpen} onOpenChange={setPhoneModalOpen}>
                <DialogContent className="sm:max-w-md bg-[#0f1712] border border-white/10 text-white backdrop-blur-xl shadow-2xl rounded-2xl p-5 sm:p-6">
                    <DialogHeader className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                                    Billing Mobile Number
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-400">
                                    Required for Razorpay payment gateway authorization & SMS receipt.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleConfirmPayment} className="space-y-4 pt-2">
                        {/* Plan & Amount Summary */}
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-400">Plan:</span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    {billingCycle === 'yearly' ? 'PRO Yearly (Founding Deal)' : 'PRO Monthly'}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-400 mr-1.5">Total:</span>
                                <span className="text-xl font-extrabold text-white">₹{proPrice}</span>
                            </div>
                        </div>

                        {/* Mobile Number Input */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                                Mobile Number <span className="text-emerald-400">*</span>
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute left-3 flex items-center gap-1 text-xs font-semibold text-slate-400 pointer-events-none select-none">
                                    <span>🇮🇳 +91</span>
                                    <div className="h-3.5 w-px bg-slate-700 mx-1" />
                                </div>
                                <Input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    placeholder="9876543210"
                                    value={phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                        setPhone(val)
                                        if (phoneError) setPhoneError('')
                                    }}
                                    className="h-11 pl-20 pr-3 bg-black/60 border-white/10 hover:border-white/20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 text-white placeholder:text-slate-500 rounded-xl text-sm font-mono tracking-wider transition-all"
                                />
                            </div>

                            {phoneError && (
                                <p className="text-xs font-medium text-rose-400 flex items-center gap-1.5 mt-1">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" />
                                    {phoneError}
                                </p>
                            )}
                            {!phoneError && phone.length === 10 && /^[6-9]\d{9}$/.test(phone) && (
                                <p className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 mt-1">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    Valid Indian mobile number
                                </p>
                            )}
                        </div>

                        {/* Security Badge */}
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-black/30 border border-white/10 text-slate-400 text-xs">
                            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                            <span>Encrypted 256-bit checkout via Razorpay</span>
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setPhoneModalOpen(false)}
                                className="w-full sm:w-auto text-slate-400 hover:text-white hover:bg-white/10 rounded-xl h-9 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)}
                                className="w-full sm:w-auto flex-1 bg-emerald-500 hover:bg-emerald-400 text-[#04160c] border-0 rounded-xl shadow-md shadow-emerald-500/25 transition-all font-bold h-9 text-xs"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-[#04160c]" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        Proceed to Pay ₹{proPrice}
                                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
