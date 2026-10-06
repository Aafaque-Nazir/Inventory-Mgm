'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { PLANS_CONFIG } from '@/config/plans'
import { cn } from '@/lib/utils'

export function LandingPricingSection() {
    const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly')
    const proTier = PLANS_CONFIG.pro[billingCycle]
    const starterTier = PLANS_CONFIG.starter

    return (
        <section id="pricing" className="py-16 md:py-24 relative z-10">
            <div className="container mx-auto px-4 sm:px-6">
                
                {/* Header */}
                <div className="max-w-2xl mx-auto text-center mb-8 md:mb-10">
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
                        Simple, All-Inclusive Plans
                    </p>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                        Transparent Pricing. Zero Hidden Fees.
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                        Start 100% free with all essential godown tools. Upgrade to Pro only when your inventory catalog expands beyond 200 items or you need multi-godown routing.
                    </p>

                    {/* Billing Cycle Switcher */}
                    <div className="mt-6 flex items-center justify-center">
                        <div className="inline-flex p-1 bg-white/[0.04] border border-white/10 rounded-2xl backdrop-blur-md">
                            <button
                                type="button"
                                onClick={() => setBillingCycle('monthly')}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                                    billingCycle === 'monthly'
                                        ? "bg-white/15 text-white shadow-sm"
                                        : "text-slate-400 hover:text-white"
                                )}
                            >
                                Monthly Billing ({PLANS_CONFIG.pro.monthly.displayPrice}/mo)
                            </button>
                            <button
                                type="button"
                                onClick={() => setBillingCycle('yearly')}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                                    billingCycle === 'yearly'
                                        ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                                        : "text-emerald-400 hover:text-emerald-300"
                                )}
                            >
                                <span>Yearly Billing ({PLANS_CONFIG.pro.yearly.displayPrice}/yr)</span>
                                {PLANS_CONFIG.isFoundingOfferActive && (
                                    <span className={cn(
                                        "text-[10px] uppercase px-1.5 py-0.5 rounded-md font-extrabold tracking-wider",
                                        billingCycle === 'yearly'
                                            ? "bg-black text-emerald-300"
                                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    )}>
                                        {PLANS_CONFIG.foundingOfferBadge}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2-Column Cards Grid */}
                <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto items-stretch">
                    
                    {/* Starter (Free) Plan */}
                    <div className="rounded-3xl border border-white/10 bg-[#111613] p-6 sm:p-8 flex flex-col justify-between shadow-xl hover:border-white/20 transition-all">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-xl font-bold text-white">{starterTier.name}</h3>
                                <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                    FREE FOREVER
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mb-6">{starterTier.tagline}</p>

                            <div className="mb-6 pb-6 border-b border-white/10">
                                <span className="text-4xl sm:text-5xl font-black text-white">{starterTier.displayPrice}</span>
                                <span className="text-xs text-slate-400 font-medium"> {starterTier.periodText}</span>
                            </div>

                            <ul className="space-y-3 mb-8 text-xs text-slate-300">
                                {starterTier.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2.5">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button asChild variant="outline" className="w-full rounded-2xl h-12 border-white/20 bg-white/5 text-white font-bold hover:bg-white hover:text-black transition-all text-xs">
                            <Link href="/signup">
                                Get Started Free
                            </Link>
                        </Button>
                    </div>

                    {/* Pro Plan */}
                    <div className="relative rounded-3xl border border-emerald-500/30 bg-[#0e1410] p-6 sm:p-8 flex flex-col justify-between shadow-xl">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-white">{PLANS_CONFIG.pro.name}</h3>
                                    {billingCycle === 'yearly' && PLANS_CONFIG.isFoundingOfferActive && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 tracking-wider uppercase">
                                            {PLANS_CONFIG.foundingOfferBadge}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] font-semibold text-slate-400">
                                    {PLANS_CONFIG.pro.tierLabel}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mb-6">{PLANS_CONFIG.pro.tagline}</p>

                            <div className="mb-6 pb-6 border-white/10 border-b flex items-baseline justify-between">
                                <div>
                                    <span className="text-4xl sm:text-5xl font-black text-white">{proTier.displayPrice}</span>
                                    <span className="text-xs text-slate-400 font-medium">
                                        {billingCycle === 'yearly' ? ` / year (~₹${proTier.monthlyEquivalent}/mo)` : ' / month'}
                                    </span>
                                </div>
                                {billingCycle === 'yearly' ? (
                                    <span className="text-xs text-slate-500 line-through">
                                        Reg. ₹{proTier.regularPrice}
                                    </span>
                                ) : (
                                    <span className="text-xs text-slate-400 font-medium">
                                        Cancel anytime
                                    </span>
                                )}
                            </div>

                            <ul className="space-y-3 mb-8 text-xs text-slate-100 font-medium">
                                {PLANS_CONFIG.pro.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2.5">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button asChild className="w-full rounded-2xl h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-md shadow-emerald-500/15 transition-all text-xs">
                            <Link href="/signup">
                                Start 5-Day Free Pro Trial
                            </Link>
                        </Button>
                    </div>

                </div>

                {/* Clean Guarantee / Assurance Row */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-slate-400 text-center font-medium">
                    {PLANS_CONFIG.assurances.map((assurance, idx) => (
                        <span key={idx} className="flex items-center gap-1.5 text-slate-300">
                            {idx === 0 ? (
                                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            )}
                            {assurance}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    )
}
