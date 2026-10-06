import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    ChevronRight,
    CheckCircle2,
    Activity,
    ScanLine,
    Store,
    ShoppingCart,
    Clock,
    Share2
} from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { LandingNavbar } from '@/components/layout/LandingNavbar'
import { LandingPricingSection } from '@/components/pricing/LandingPricingSection'

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-[#070908] text-slate-50 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden relative font-sans">
            {/* 1. CLEAN OBSIDIAN BACKGROUND */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[#080908]">
                <div className="absolute inset-0 bg-[radial-gradient(#1a261f_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
            </div>

            {/* 2. PREMIUM NAVBAR */}
            <LandingNavbar />

            <main className="flex-1 relative z-10">

                {/* 3. HERO SECTION (Fitted to 100vh with Clean Hierarchy) */}
                <section className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center pt-16 md:pt-20 pb-8 px-4 sm:px-6 overflow-hidden">
                    <div className="container mx-auto relative z-10 flex flex-col items-center text-center max-w-4xl">
                        
                        {/* 1. Category Eyebrow / Kicker */}
                        <p className="mb-3 text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-emerald-400">
                            Wholesale & Godown Inventory OS
                        </p>

                        {/* 2. Focused, Crisp Headline (Pure Solid Typography) */}
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] mb-3 max-w-4xl text-white">
                            Dukaan & Godown ka <span className="text-emerald-400">smart hisaab.</span>
                        </h1>

                        {/* 3. High-Converting Pain & Solution Subtitle */}
                        <p className="max-w-2xl text-xs sm:text-sm md:text-base text-slate-300 font-normal leading-relaxed mb-6">
                            Purpose-built for Indian <strong className="text-white font-semibold">FMCG, Pharma & Wholesale businesses</strong>. Track <strong className="text-white font-semibold">Batch & Expiry</strong> to eliminate dead stock, route goods across multiple godowns without leakage, scan barcodes on mobile camera, and dispatch GST bills on <strong className="text-emerald-400 font-semibold">WhatsApp</strong> in 1 click.
                        </p>

                        {/* 4. Action Drivers (Above the Fold) */}
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center w-full mb-3.5">
                            <Button asChild className="w-full sm:w-auto h-11 rounded-full px-7 text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-md shadow-emerald-500/15 transition-all hover:scale-[1.02] active:scale-95 group">
                                <Link href="/signup">
                                    <span className="flex items-center gap-2">
                                        Start Free (Up to 200 Items)
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full sm:w-auto h-11 rounded-full px-6 text-xs sm:text-sm border-white/15 bg-white/[0.04] hover:bg-white/10 text-white font-semibold transition-all">
                                <Link href="#pricing">
                                    View Pricing (From ₹999/yr)
                                </Link>
                            </Button>
                        </div>

                        {/* 5. Trust Signals / Friction Removers */}
                        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] font-medium text-slate-400 mb-6">
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Free forever tier</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> No credit card required</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Instant 2-min setup</span>
                        </div>

                        {/* 6. Psychological Proof Pillars (Above the Fold) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-3xl pt-1">
                            <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-[#111613]/90 border border-white/10 text-left backdrop-blur-md shadow-lg shadow-black/40">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                    <Clock className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">Batch & Expiry Watch</p>
                                    <p className="text-[10px] text-slate-400 truncate">Stop expired dead stock</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-[#111613]/90 border border-white/10 text-left backdrop-blur-md shadow-lg shadow-black/40">
                                <div className="h-8 w-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                                    <Store className="h-4 w-4 text-teal-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">Multi-Godown Routing</p>
                                    <p className="text-[10px] text-slate-400 truncate">Zero pilferage leakage</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-[#111613]/90 border border-white/10 text-left backdrop-blur-md shadow-lg shadow-black/40">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                    <Share2 className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">1-Click WhatsApp Bills</p>
                                    <p className="text-[10px] text-slate-400 truncate">Fast GST tax invoice dispatch</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wholesale Dashboard Mockup */}
                    <div className="mt-12 md:mt-16 relative w-full max-w-6xl mx-auto rounded-2xl md:rounded-3xl border border-white/10 bg-[#0d120f] shadow-2xl shadow-black/80 overflow-hidden">
                        
                        {/* Mockup Top Bar */}
                        <div className="h-11 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-6 backdrop-blur-sm">
                            <div className="flex gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/70"></div>
                                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70"></div>
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70"></div>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">InvMaster Operating System • Godown Console</span>
                            <div className="h-2 w-12 rounded-full bg-white/10 hidden sm:block"></div>
                        </div>

                        {/* Mockup Body */}
                        <div className="p-4 sm:p-6 md:p-8 bg-[#090e0b]">
                            
                            {/* Realistic Distributor Metric Cards */}
                            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-6">
                                {[
                                    { label: "Today's Wholesale Billing", val: "₹2,48,920", sub: "+18.4% vs yesterday", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                                    { label: "Active Dispatches", val: "42 Invoices", sub: "100% WhatsApp dispatched", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                                    { label: "Near-Expiry (30 Days)", val: "8 Batches", sub: "Auto-alerted to sales team", color: "text-amber-400", bg: "bg-amber-500/10" },
                                    { label: "Godown Sync Status", val: "3 Locations", sub: "Head Godown ↔ Branches", color: "text-teal-400", bg: "bg-teal-500/10" }
                                ].map((stat, i) => (
                                    <div key={i} className="relative bg-[#111613] border border-white/10 rounded-2xl p-4 md:p-5 shadow-sm hover:border-emerald-500/30 transition-all">
                                        <p className="text-xs font-medium text-slate-400 mb-1.5">{stat.label}</p>
                                        <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-1 tracking-tight">{stat.val}</p>
                                        <p className={`text-[10px] md:text-xs font-semibold ${stat.color}`}>{stat.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Live Dispatch Stream & Batch Alert Table */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                                
                                {/* 2 Cols: Active Inward / Outward Feed */}
                                <div className="lg:col-span-2 bg-[#111613] border border-white/10 rounded-2xl p-4 sm:p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-emerald-400" />
                                            <h3 className="text-xs sm:text-sm font-bold text-white">Live Godown & Dispatch Activity</h3>
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            Live Sync
                                        </span>
                                    </div>
                                    <div className="space-y-2.5 text-xs">
                                        {[
                                            { action: "Stock Out", item: "Dettol Liquid 500ml", batch: "Batch #DT-902", godown: "Branch Godown 1", qty: "-120 units", time: "2 min ago" },
                                            { action: "Stock In", item: "Paracetamol 650mg Strips", batch: "Batch #PCM-441 (Exp: 2027)", godown: "Head Warehouse", qty: "+2,000 units", time: "14 min ago" },
                                            { action: "Transfer", item: "Amul Butter 100g", batch: "Batch #AB-118", godown: "Cold Storage -> Shop", qty: "80 units", time: "38 min ago" },
                                            { action: "GST Bill", item: "Sharma Medicals (Inv #INV-00481)", batch: "WhatsApp Sent", godown: "₹48,250", qty: "PAID", time: "1 hr ago" }
                                        ].map((row, i) => (
                                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 gap-2">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 shrink-0">
                                                        {row.action}
                                                    </span>
                                                    <div>
                                                        <span className="font-semibold text-white">{row.item}</span>
                                                        <span className="text-[11px] text-slate-400 block sm:inline sm:ml-2">({row.batch})</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 self-end sm:self-auto text-[11px]">
                                                    <span className="text-slate-400">{row.godown}</span>
                                                    <span className="font-bold text-emerald-400">{row.qty}</span>
                                                    <span className="text-slate-500">{row.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 1 Col: Batch Expiry Monitor */}
                                <div className="bg-[#111613] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Clock className="h-4 w-4 text-amber-400" />
                                            <h3 className="text-xs sm:text-sm font-bold text-white">Batch Expiry Watch</h3>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mb-4">
                                            Early detection prevents dumping and return disputes with retailers.
                                        </p>
                                        <div className="space-y-3">
                                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                                <div className="flex justify-between items-center text-xs font-semibold text-amber-300">
                                                    <span>Nivea Soft Cream 200ml</span>
                                                    <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">24d left</span>
                                                </div>
                                                <p className="text-[10px] text-amber-200/70 mt-1">Batch #NV-228 • 85 jars in stock</p>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                                <div className="flex justify-between items-center text-xs font-semibold text-emerald-300">
                                                    <span>Maggi 2-Minute Noodles</span>
                                                    <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded">Healthy</span>
                                                </div>
                                                <p className="text-[10px] text-emerald-200/70 mt-1">Batch #MG-881 • Exp: Dec 2027</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                                        <span>Automated FEFO dispatch</span>
                                        <span className="text-emerald-400 font-bold">Active</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. INDUSTRY SECTORS */}
                <section className="py-10 border-y border-white/5 bg-white/[0.01] relative z-10">
                    <div className="container mx-auto px-6 text-center">
                        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-6">
                            Engineered for high-throughput wholesale and distributor verticals
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6">
                            {[
                                'FMCG & FOOD DISTRIBUTORS',
                                'PHARMA & DRUG WHOLESALERS',
                                'COSMETICS & PERSONAL CARE',
                                'PACKAGED CONSUMER GOODS',
                                'ELECTRONICS & SPARES',
                                'HARDWARE & AGRO DEALERS'
                            ].map(sector => (
                                <span key={sector} className="text-xs sm:text-sm font-extrabold tracking-wider text-slate-300 border border-white/10 px-3.5 py-1.5 rounded-xl bg-white/[0.03]">
                                    {sector}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. BENTO GRID FEATURES (Distributor Moat) */}
                <section id="features" className="py-24 md:py-32 relative z-10">
                    <div className="container mx-auto px-6">
                        <div className="max-w-3xl mb-16 md:mb-20">
                            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest block mb-2">
                                Operations Without Friction
                            </span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
                                Everything a Distributor Needs. <br />
                                <span className="text-slate-400">Nothing You Don&apos;t.</span>
                            </h2>
                            <p className="text-base sm:text-lg text-slate-400 font-medium">
                                We cut the fluff of generic accounting software. InvMaster gives you real-time stock control, godown routing, and fast billing.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 auto-rows-[340px]">
                            
                            {/* BENTO 1: Batch & Expiry Tracking (Large) */}
                            <div className="col-span-1 md:col-span-2 relative group overflow-hidden rounded-3xl border border-white/10 bg-[#111613] p-7 md:p-9 flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-xl">
                                <div>
                                    <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 text-emerald-400">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Batch Number & Expiry Date Engine</h3>
                                    <p className="text-slate-400 text-sm md:text-base max-w-xl">
                                        Prevent dead stock and retailer return disputes. Every inward entry captures batch numbers and expiry dates. Get automated 30-day expiry notifications so you can clear stock before it&apos;s too late.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> FEFO Dispatch</span>
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Zero Expiry Loss</span>
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Batch Audit Trail</span>
                                </div>
                            </div>

                            {/* BENTO 2: Multi-Godown Transfers */}
                            <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-[#111613] p-7 md:p-9 flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-xl">
                                <div>
                                    <div className="h-11 w-11 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-5 text-teal-400">
                                        <Store className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Multi-Godown Transfers</h3>
                                    <p className="text-slate-400 text-xs sm:text-sm">
                                        Manage central godowns, city branches, and shop floors in one place. Inter-warehouse transfer logs prevent pilferage and stock confusion.
                                    </p>
                                </div>
                                <div className="text-[11px] text-teal-300 font-semibold flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Up to 5 Godowns on Pro
                                </div>
                            </div>

                            {/* BENTO 3: Phone Camera Barcode Scanner */}
                            <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-[#111613] p-7 md:p-9 flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-xl">
                                <div>
                                    <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 text-emerald-400">
                                        <ScanLine className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Camera Barcode Scanner</h3>
                                    <p className="text-slate-400 text-xs sm:text-sm">
                                        No expensive handheld scanner needed. Every storekeeper can use their smartphone camera or plug in any standard USB scanner for instant stock-in.
                                    </p>
                                </div>
                                <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> 100% Free for all tiers
                                </div>
                            </div>

                            {/* BENTO 4: WhatsApp GST Invoicing */}
                            <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-[#111613] p-7 md:p-9 flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-xl">
                                <div>
                                    <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 text-emerald-400">
                                        <Share2 className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">1-Click WhatsApp Invoicing</h3>
                                    <p className="text-slate-400 text-xs sm:text-sm">
                                        Generate compliant GST invoices with HSN, CGST, and SGST breakups. Instantly dispatch formatted bills directly to your retailer&apos;s WhatsApp.
                                    </p>
                                </div>
                                <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Zero print paper waste
                                </div>
                            </div>

                            {/* BENTO 5: Purchase Orders & Supplier Loop */}
                            <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-[#111613] p-7 md:p-9 flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-xl">
                                <div>
                                    <div className="h-11 w-11 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-5 text-teal-400">
                                        <ShoppingCart className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Purchase Orders & Suppliers</h3>
                                    <p className="text-slate-400 text-xs sm:text-sm">
                                        Draft, approve, and receive supplier shipments seamlessly. Update stock automatically upon receipt and snapshot historical cost prices for true P&L.
                                    </p>
                                </div>
                                <div className="text-[11px] text-teal-300 font-semibold flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Full Vendor History
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* 6. THE 3-STEP WHOLESALE WORKFLOW */}
                <section id="workflow" className="py-24 border-t border-white/5 bg-black/40 relative">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <p className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest mb-3">
                            How It Works
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-14">
                            From Godown Receiving to Retailer Dispatch in 3 Steps
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8 text-left">
                            {[
                                {
                                    step: "01",
                                    title: "Scan & Inward Stock",
                                    desc: "Scan barcodes or add items with Batch No., Expiry Date, and Purchase Cost. Assign directly to your primary godown."
                                },
                                {
                                    step: "02",
                                    title: "Route & Transfer",
                                    desc: "Transfer inventory between godowns or branches with instant quantity reconciliation and anti-leakage audit logs."
                                },
                                {
                                    step: "03",
                                    title: "Bill & WhatsApp Send",
                                    desc: "Select items at checkout, apply GST with HSN codes, and hit WhatsApp to send the tax invoice straight to your customer."
                                }
                            ].map((s, idx) => (
                                <div key={idx} className="p-6 rounded-2xl bg-[#0e1410] border border-white/10 hover:border-emerald-500/30 transition-all">
                                    <span className="text-2xl font-black text-emerald-400 font-mono mb-2 block">{s.step}</span>
                                    <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7. PRICING SECTION (Interactive Monthly / Yearly Toggle connected to PLANS_CONFIG) */}
                <LandingPricingSection />

                {/* 8. FINAL CTA */}
                <section className="py-24 md:py-32 relative overflow-hidden border-t border-white/5 text-center">
                    <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 max-w-3xl leading-tight">
                            Apne godown ka control lo. <br />
                            <span className="text-emerald-400">Zero errors, 100% speed.</span>
                        </h2>
                        <p className="text-sm sm:text-lg text-slate-400 mb-10 max-w-xl font-medium">
                            Join smart wholesalers and distributors across India who run on InvMaster. Setup takes less than 2 minutes.
                        </p>
                        <Button asChild size="lg" className="h-12 md:h-14 rounded-full px-8 md:px-10 text-sm md:text-base bg-emerald-500 text-black hover:bg-emerald-400 font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]">
                            <Link href="/signup">
                                Start Free Now
                            </Link>
                        </Button>
                    </div>
                </section>

            </main>

            {/* 9. FOOTER */}
            <footer className="border-t border-white/5 bg-[#020202] py-14 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10">
                        <div className="text-center md:text-left">
                            <Link href="/" className="inline-block mb-3">
                                <BrandLogo size="md" showTagline={false} />
                            </Link>
                            <p className="text-slate-500 text-xs max-w-xs font-medium">
                                The inventory operating system for wholesalers and distributors.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 text-xs font-medium">
                            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">Log in</Link>
                            <Link href="/signup" className="text-slate-400 hover:text-white transition-colors">Sign up</Link>
                            <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</Link>
                            <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
                            <Link href="/refund" className="text-slate-400 hover:text-white transition-colors">Refund Policy</Link>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 text-center md:text-left text-slate-600 text-xs font-medium" suppressHydrationWarning>
                        © {new Date().getFullYear()} InvMaster. Engineered for Indian Wholesale & Distribution.
                    </div>
                </div>
            </footer>
        </div>
    )
}
