'use client'

import { Check, X, Zap, Loader2, Sparkles, Phone, ShieldCheck, ArrowRight, Shield, CreditCard, RotateCcw, Clock } from 'lucide-react'
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

    // Phone Dialog State
    const [phoneModalOpen, setPhoneModalOpen] = useState(false)
    const [phone, setPhone] = useState('')
    const [phoneError, setPhoneError] = useState('')

    const supabase = createClient()

    // Verify Payment Effect handled in Razorpay popup callback
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
                body: JSON.stringify({ phone: phoneToUse })
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

            const options = {
                key: data.key,
                amount: data.amount,
                currency: "INR",
                name: "Inventory Pro",
                description: "Pro Plan Subscription",
                order_id: data.orderId,
                handler: function (response: any) {
                    verifyPayment({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature
                    })
                },
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

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-10">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            {/* Header */}
            <div className="text-center space-y-2 pt-1 sm:pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Transparent Pricing & Plans</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                    Predictable Plans for Growing Operations
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                    Pick the plan that fits your inventory scale. Switch or cancel anytime with zero lock-in.
                </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
                
                {/* 1. Starter (Free) Plan */}
                <div className={cn(
                    "relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0e1410]/80 backdrop-blur-xl p-5 sm:p-6 transition-all duration-200 hover:border-white/20 shadow-lg",
                    currentPlan === 'FREE' && "ring-1 ring-white/15"
                )}>
                    <div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-bold text-white">Starter</h3>
                            {currentPlan === 'FREE' && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                                    Current Plan
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                            Essential tools for small shops and single retail outlets just getting started.
                        </p>

                        <div className="my-4 pb-4 border-b border-white/5 flex items-baseline gap-1.5">
                            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">₹0</span>
                            <span className="text-xs text-slate-400 font-medium">/ month</span>
                        </div>

                        <div className="space-y-2.5 mb-6">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Included features</p>
                            <ul className="space-y-2.5 text-xs">
                                {[
                                    '1 Team Member (Admin)',
                                    'Basic Inventory & SKU Tracking',
                                    'Sales & Invoice Generation',
                                    'Standard Stock Level Reports',
                                    'Low Stock Alert Table',
                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-2.5 text-slate-300">
                                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                                {[
                                    'Financial & Profit Analytics',
                                    'Barcode & QR Code Scanner',
                                    'Multi-Warehouse Transfers',
                                    'AI Restock Predictions'
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
                            className="w-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl h-10 text-xs font-semibold transition-colors"
                            disabled
                        >
                            {currentPlan === 'FREE' ? 'Active Plan' : 'Free Tier'}
                        </Button>
                    </div>
                </div>

                {/* 2. Pro Plan (Highlighted) */}
                <div className={cn(
                    "relative flex flex-col justify-between rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-[#112419] to-[#0d1a13] backdrop-blur-xl p-5 sm:p-6 shadow-[0_0_35px_-5px_rgba(16,185,129,0.18)] ring-1 ring-emerald-500/40 transition-all duration-200 hover:border-emerald-500/70",
                    currentPlan === 'PRO' && "ring-2 ring-emerald-400"
                )}>
                    {/* Badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500 text-[#04160c] text-[11px] font-bold tracking-wide uppercase shadow-md shadow-emerald-500/30">
                        <Zap className="h-3 w-3 fill-current" />
                        Most Popular
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-bold text-white">Pro</h3>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    GROWTH
                                </span>
                            </div>
                            {currentPlan === 'PRO' && subStatus === 'TRIALING' ? (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    Trial Active
                                </span>
                            ) : currentPlan === 'PRO' ? (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Current Plan
                                </span>
                            ) : null}
                        </div>
                        <p className="text-xs text-emerald-200/70 mt-1 min-h-[32px]">
                            High-velocity tools, AI forecasts, and multi-warehouse operations.
                        </p>

                        <div className="my-4 pb-4 border-b border-emerald-500/20 flex items-baseline gap-1.5">
                            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">₹49</span>
                            <span className="text-xs text-emerald-300/70 font-medium">/ month</span>
                            <span className="ml-auto text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                Launch Price
                            </span>
                        </div>

                        <div className="space-y-2.5 mb-6">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Everything in Starter, plus</p>
                            <ul className="space-y-2.5 text-xs">
                                {[
                                    'Up to 5 Team Members',
                                    'Advanced Financial & Profit Analytics',
                                    'Barcode & QR Scanner (Camera & Hardware)',
                                    'Stock Movement Audit Trail & Logs',
                                    'Multi-Warehouse Transfers & Routing',
                                    'Automated Low Stock Email Alerts',
                                    'AI Restock & Sales Forecasts',
                                    'Bulk CSV Import & Export'
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
                                className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl h-10 text-xs font-semibold cursor-default"
                                disabled
                            >
                                <Check className="mr-2 h-4 w-4" /> Current Active Plan
                            </Button>
                        ) : (
                            <>
                                {currentPlan === 'PRO' && subStatus === 'TRIALING' && (
                                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                                        <p className="text-xs font-semibold text-amber-300">
                                            Trial Expiring Soon
                                        </p>
                                        <p className="text-[11px] text-amber-200/70 mt-0.5">
                                            Upgrade now to keep your data and Pro access uninterrupted.
                                        </p>
                                    </div>
                                )}

                                {currentPlan === 'FREE' && !trialUsed && (
                                    <Button
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold border-0 rounded-xl h-10 text-xs shadow-md shadow-emerald-500/20 transition-all"
                                        onClick={() => {
                                            toast.info("Opening trial offer...")
                                            setShowTrialDialog(true)
                                        }}
                                    >
                                        <Sparkles className="mr-1.5 h-4 w-4 fill-[#04160c]" />
                                        Start 5-Day Free Trial
                                    </Button>
                                )}

                                <Button
                                    onClick={handleUpgradeClick}
                                    disabled={loading}
                                    variant={currentPlan === 'FREE' && !trialUsed ? 'outline' : 'default'}
                                    className={cn(
                                        "w-full rounded-xl h-10 text-xs font-bold transition-all",
                                        currentPlan === 'FREE' && !trialUsed
                                            ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                                            : "bg-emerald-500 hover:bg-emerald-400 text-[#04160c] border-0 shadow-md shadow-emerald-500/25"
                                    )}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className={cn("mr-1.5 h-4 w-4", currentPlan === 'FREE' && !trialUsed ? "text-emerald-400" : "fill-[#04160c]")} />
                                            {currentPlan === 'FREE' && !trialUsed ? 'Or Pay ₹49/mo Directly' : 'Upgrade to Pro — ₹49/mo'}
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* 3. Enterprise Plan */}
                <div className="relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0e1410]/80 backdrop-blur-xl p-5 sm:p-6 transition-all duration-200 hover:border-white/20 shadow-lg">
                    <div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-bold text-white">Enterprise</h3>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                CUSTOM
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                            Dedicated infrastructure, custom integrations, and SLA guarantees for large fleets.
                        </p>

                        <div className="my-4 pb-4 border-b border-white/5 flex items-baseline gap-1.5">
                            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Custom</span>
                            <span className="text-xs text-slate-400 font-medium">/ tailored quote</span>
                        </div>

                        <div className="space-y-2.5 mb-6">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Enterprise capabilities</p>
                            <ul className="space-y-2.5 text-xs">
                                {[
                                    'Unlimited Team Members & Roles',
                                    'Custom ERP & SAP API Integrations',
                                    'Dedicated Technical Account Manager',
                                    'Custom Feature & Module Development',
                                    'On-Premises or Private Cloud Option',
                                    '99.9% Uptime SLA & 24/7 Phone Support'
                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-2.5 text-slate-300">
                                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl h-10 text-xs font-semibold transition-colors"
                            asChild
                        >
                            <a href="mailto:sales@inventory.com?subject=Enterprise%20Plan%20Inquiry">
                                Contact Sales <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                            </a>
                        </Button>
                    </div>
                </div>

            </div>

            {/* Trust Signals Footer */}
            <div className="border-t border-white/5 pt-6 mt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/[0.02]">
                        <Shield className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-200">256-Bit SSL</span>
                        <span className="text-[10px] text-slate-500">Bank-grade security</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/[0.02]">
                        <CreditCard className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-200">Razorpay PG</span>
                        <span className="text-[10px] text-slate-500">UPI, Cards & NetBanking</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/[0.02]">
                        <Clock className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-200">Instant Activation</span>
                        <span className="text-[10px] text-slate-500">No waiting time</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/[0.02]">
                        <RotateCcw className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-200">Cancel Anytime</span>
                        <span className="text-[10px] text-slate-500">No lock-in or contracts</span>
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
                        <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-400">Plan:</span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    PRO Monthly
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-400 mr-1.5">Total:</span>
                                <span className="text-lg font-extrabold text-white">₹49</span>
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
                                        Proceed to Pay ₹49
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
