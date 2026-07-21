'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
    Box,
    BarChart3,
    ShieldCheck,
    ChevronRight,
    Zap,
    CheckCircle2,
    Sparkles,
    QrCode,
    Activity,
    ScanLine,
    Smartphone,
    Eye,
    TrendingUp,
    LineChart,
    Settings,
    ShoppingCart,
    User,
    AlertCircle
} from 'lucide-react'
import { motion, useScroll, useTransform, Variants } from 'framer-motion'
import { useRef } from 'react'

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
}

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

export default function Home() {
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    // Deep parallax for hero
    const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "40%"])
    const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0])

    // Dashboard 3D Tilt Effect on Scroll
    const rotateX = useTransform(scrollYProgress, [0, 0.3], [20, 0])
    const scaleDashboard = useTransform(scrollYProgress, [0, 0.3], [0.85, 1])
    const opacityDashboard = useTransform(scrollYProgress, [0, 0.2], [0.5, 1])

    return (
        <div className="flex min-h-screen flex-col bg-[#050505] text-slate-50 selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden relative font-sans">

            {/* 1. ANTIGRAVITY BACKGROUND */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Subtle Grid */}
                <div className="absolute inset-0 bg-[#0a0a0a]"></div>
                {/* Dynamic Glowing Orbs */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px]" />
                <div className="absolute top-[30%] right-[-10%] w-[40%] h-[60%] bg-indigo-600/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] bg-sky-600/10 rounded-full blur-[180px]" />
                {/* Noise Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay"></div>
            </div>

            {/* 2. PREMIUM NAVBAR */}
            <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#050505]/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#050505]/40 transition-all duration-300">
                <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-6 md:px-12">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-white/10 shadow-2xl group-hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <Box className="h-5 w-5 text-white relative z-10" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors duration-300">
                            InvMaster
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center gap-10">
                        <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
                        <Link href="#integrations" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Integrations</Link>
                        <Link href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
                        <Link href="/contact" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Contact</Link>
                    </div>
                    <div className="flex items-center gap-5">
                        <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-400 hover:text-white transition-colors">Log in</Link>
                        <Link href="/signup">
                            <Button size="sm" className="rounded-full h-10 px-6 bg-white text-black hover:bg-slate-200 font-semibold shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] transition-all hover:scale-105 active:scale-95 border border-white/10 relative overflow-hidden group">
                                <span className="relative z-10 flex items-center gap-2">Get Access <ChevronRight className="h-4 w-4" /></span>
                                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:animate-shimmer" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-1 relative z-10" ref={containerRef}>

                {/* 3. HERO SECTION (Mind-Blowing Parallax) */}
                <section className="relative flex min-h-[100vh] flex-col items-center justify-center pt-24 md:pt-32 pb-20 px-6 overflow-hidden perspective-1000">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        style={{ y: yHero, opacity: opacityHero }}
                        className="container mx-auto relative z-10 flex flex-col items-center text-center max-w-5xl"
                    >
                        <motion.div variants={fadeUp} className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer group">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                            </span>
                            <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase group-hover:text-white transition-colors">InvMaster 2.0 AI Engine is Live</span>
                            <ChevronRight className="h-3 w-3 text-slate-500 group-hover:text-white transition-colors" />
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 relative"
                        >
                            <span className="text-white">
                                Inventory
                            </span>
                            <br />
                            <span className="text-blue-400">
                                perfected.
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="max-w-2xl text-lg md:text-2xl text-slate-400 font-medium leading-relaxed mb-12"
                        >
                            The modern operating system for top-tier fulfillment. Stop guessing, start scaling with AI-driven velocity insights.
                        </motion.p>

                        <motion.div
                            variants={fadeUp}
                            className="flex flex-col sm:flex-row gap-6 items-center justify-center w-full"
                        >
                            <Link href="/signup" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto h-14 md:h-16 rounded-full px-10 text-base md:text-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-[0_0_40px_-10px_rgba(37,99,235,0.8)] transition-all hover:scale-105 active:scale-95 group relative overflow-hidden">
                                    <span className="relative z-10 flex items-center gap-2">
                                        Start Free Trial
                                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Button>
                            </Link>
                            <span className="text-sm font-medium text-slate-500">No credit card required.</span>
                        </motion.div>
                    </motion.div>

                    {/* Dashboard Mockup - 3D Reveal */}
                    <motion.div
                        style={{ rotateX, scale: scaleDashboard, opacity: opacityDashboard }}
                        className="mt-24 relative w-full max-w-6xl mx-auto rounded-3xl md:rounded-[40px] border border-white/10 bg-[#0a0a0a] shadow-[0_0_100px_rgba(37,99,235,0.15)] origin-top transform-style-3d overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-black/50 z-10 block pointer-events-none h-full w-full opacity-90"></div>

                        {/* Mockup Top Bar */}
                        <div className="h-12 border-b border-white/5 bg-white/[0.02] flex items-center px-6 gap-3 backdrop-blur-sm">
                            <div className="flex gap-2">
                                <div className="h-3 w-3 rounded-full bg-slate-700/50"></div>
                                <div className="h-3 w-3 rounded-full bg-slate-700/50"></div>
                                <div className="h-3 w-3 rounded-full bg-slate-700/50"></div>
                            </div>
                        </div>

                        {/* Unique Dashboard UI Replacement */}
                        <div className="relative w-full aspect-[16/10] md:aspect-video bg-[#030303] flex font-sans">
                            {/* Sidebar - Collapsed on Mobile, Expanded on Desktop */}
                            <div className="hidden md:flex flex-col w-56 border-r border-white/5 bg-black/40 p-5 gap-8 z-10 shrink-0">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
                                        <Box className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-white tracking-wide">InvMaster</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {['Overview', 'Inventory', 'Orders', 'Analytics', 'Settings'].map((item, i) => (
                                        <div key={item} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${i === 0 ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
                                            {i === 0 && <Activity className="w-4 h-4" />}
                                            {i === 1 && <Box className="w-4 h-4" />}
                                            {i === 2 && <ShoppingCart className="w-4 h-4" />}
                                            {i === 3 && <LineChart className="w-4 h-4" />}
                                            {i === 4 && <Settings className="w-4 h-4" />}
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 flex flex-col p-4 md:p-8 z-10 relative">
                                {/* Background glow in main area */}
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

                                {/* Topbar */}
                                <div className="flex justify-between items-center mb-8 relative z-10">
                                    <div>
                                        <h2 className="text-lg md:text-xl font-bold text-white mb-1">Command Center</h2>
                                        <p className="text-xs text-slate-500">Real-time fulfillment metrics</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden md:flex bg-black/50 border border-white/10 rounded-full px-4 py-1.5 items-center gap-2 shadow-sm">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                                            <span className="text-xs font-semibold text-slate-300">System Online</span>
                                        </div>
                                        <div className="h-9 w-9 xl:h-10 xl:w-10 rounded-full border border-white/10 bg-slate-800 flex items-center justify-center shadow-inner relative overflow-hidden group cursor-pointer hover:border-white/20 transition-colors">
                                            <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <User className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors relative z-10" />
                                        </div>
                                    </div>
                                </div>

                                {/* Metric Cards */}
                                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-8 relative z-10">
                                    {[
                                        { label: "Total Revenue", val: "$128,450", sub: "+14.2% this week", color: "text-blue-400", bg: "bg-blue-500/10" },
                                        { label: "Active Orders", val: "1,204", sub: "98 processing", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                                        { label: "Low Stock Items", val: "24", sub: "Requires attention", color: "text-amber-400", bg: "bg-amber-500/10" },
                                        { label: "Fulfillment Rate", val: "99.8%", sub: "+0.2% improvement", color: "text-indigo-400", bg: "bg-indigo-500/10" }
                                    ].map((stat, i) => (
                                        <div key={i} className="relative bg-black/40 border border-white/5 rounded-2xl p-4 md:p-5 hover:bg-black/60 transition-all group overflow-hidden cursor-default shadow-sm hover:shadow-md hover:border-white/10">
                                            <div className={`absolute inset-0 ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                            <p className="text-xs font-medium text-slate-500 mb-2 relative z-10">{stat.label}</p>
                                            <p className="text-2xl lg:text-3xl font-black text-white mb-1 tracking-tight relative z-10">{stat.val}</p>
                                            <p className={`text-[10px] md:text-xs font-medium ${stat.color} group-hover:opacity-100 opacity-80 transition-opacity relative z-10`}>{stat.sub}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts and Activity */}
                                <div className="flex-1 flex gap-6 relative z-10 min-h-0">
                                    {/* Main Chart */}
                                    <div className="flex-[2] bg-black/40 border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col relative overflow-hidden group">
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-blue-900/10 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-sm font-semibold text-white">Order Volume <span className="text-slate-500 font-normal ml-2 hidden sm:inline">(7 Days)</span></h3>
                                            <div className="flex gap-1 items-center bg-white/5 rounded-md p-1 border border-white/5">
                                                <div className="px-2 py-1 bg-white/10 rounded text-[10px] text-white font-medium cursor-pointer shadow-sm">Week</div>
                                                <div className="px-2 py-1 text-[10px] text-slate-500 font-medium hover:text-white cursor-pointer transition-colors">Month</div>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 pt-4 relative z-10 border-b border-white/5 pb-2 min-h-[120px]">
                                            {[40, 60, 45, 80, 55, 90, 75].map((height, i) => (
                                                <div key={i} className="relative w-full flex justify-center group/bar h-full items-end">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        whileInView={{ height: `${height}%` }}
                                                        transition={{ duration: 1.5, delay: 0.1 + (i * 0.1), type: "spring", bounce: 0.4 }}
                                                        viewport={{ once: true, margin: "-100px" }}
                                                        className="w-full max-w-[40px] bg-blue-500/20 rounded-t border-t-2 border-blue-500 relative cursor-pointer group-hover/bar:bg-blue-500/40 transition-colors"
                                                    >
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none shadow-lg whitespace-nowrap z-20">
                                                            ★ {height * 12}
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-3 text-[10px] font-medium text-slate-500 px-1">
                                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="flex-1 border border-white/5 bg-black/40 rounded-2xl p-5 md:p-6 hidden lg:flex flex-col">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-sm font-semibold text-white">Live Activity</h3>
                                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        </div>
                                        <div className="flex flex-col gap-6 flex-1 overflow-hidden relative">
                                            <div className="absolute left-[11px] top-6 bottom-4 w-px bg-white/10"></div>
                                            {[
                                                { icon: <Box className="w-3 h-3 text-emerald-400" />, text: "Shipment #8920 dispatched", time: "Just now" },
                                                { icon: <AlertCircle className="w-3 h-3 text-amber-400" />, text: "Low stock: Earbuds", time: "2m ago" },
                                                { icon: <TrendingUp className="w-3 h-3 text-blue-400" />, text: "New B2B order", time: "15m ago" },
                                                { icon: <Settings className="w-3 h-3 text-slate-400" />, text: "Auto reorder trig", time: "1h ago" },
                                            ].map((log, i) => (
                                                <div key={i} className="flex gap-4 items-start relative z-10 group cursor-pointer">
                                                    <div className="w-6 h-6 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center shrink-0 shadow group-hover:border-white/20 transition-colors">
                                                        {log.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-200 font-medium group-hover:text-white transition-colors">{log.text}</p>
                                                        <p className="text-[10px] text-slate-500 mt-1">{log.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Soft Gradient Fade into next section */}
                    <div className="absolute bottom-0 left-0 right-0 h-64 bg-black/50 pointer-events-none z-20"></div>
                </section>

                {/* 4. SOCIAL PROOF */}
                <section className="py-12 border-y border-white/5 bg-white/[0.01] relative z-10">
                    <div className="container mx-auto px-6 text-center">
                        <p className="text-sm font-semibold text-slate-500 tracking-widest uppercase mb-8">Powering modern fulfillment for top brands</p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20 opacity-40 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100">
                            {/* Placeholders for logos (using text for demonstration) */}
                            {['ACME CORP', 'GLOBAL SHIP', 'TECH LOGISTICS', 'QUANTUM RETAIL', 'NEXUS', 'ZEPHYR'].map(logo => (
                                <span key={logo} className="text-xl md:text-2xl font-black tracking-tighter mix-blend-difference">{logo}</span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. BENTO GRID FEATURES (Anti-generic) */}
                <section id="features" className="py-32 relative z-10">
                    <div className="container mx-auto px-6">
                        <div className="mb-24 md:mb-32">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                                Engineered for <br /><span className="text-slate-500">maximum velocity.</span>
                            </h2>
                            <p className="text-xl text-slate-400 max-w-2xl font-medium">
                                Traditional systems slow you down. InvMaster uses a state-based architecture and machine learning to make inventory management instantaneous.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 md:gap-8 auto-rows-[400px]">
                            {/* BENTO ITEM 1: Large Feature */}
                            <div className="col-span-1 md:col-span-2 row-span-1 md:row-span-2 relative group overflow-hidden rounded-[32px] border border-white/10 bg-[#0a0a0a] transition-all hover:border-white/20 flex flex-col justify-between">
                                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <div className="p-10 relative z-10">
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                                        <Activity className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">Real-time Visibility Engine</h3>
                                    <p className="text-slate-400 text-lg max-w-md">Absolute truth across all warehouses. See stock movements, reservations, and dispatch statuses the millisecond they happen.</p>
                                </div>
                                <div className="relative mt-auto h-[40%] md:h-[50%] overflow-hidden border-t border-white/5 bg-black">
                                    <div className="absolute inset-0 bg-[#091629] opacity-50 z-10"></div>
                                    <div className="absolute bottom-0 w-full px-10 pb-10 flex items-end gap-2 isolate">
                                        {[30, 45, 20, 60, 80, 50, 90, 100, 70, 85].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                whileInView={{ height: `${h}%` }}
                                                transition={{ delay: i * 0.05, duration: 0.8, type: "spring" }}
                                                viewport={{ once: true, margin: "-100px" }}
                                                className="w-full bg-blue-500/80 rounded-t-md hover:bg-blue-400 transition-colors"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* BENTO ITEM 2: Notification System */}
                            <div className="relative group overflow-hidden rounded-[32px] border border-white/10 bg-[#0a0a0a] p-10 transition-all hover:border-white/20 flex flex-col justify-between">
                                <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[80px]"></div>
                                <div className="relative z-10">
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                                        <ScanLine className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">Barcode & RFID Ready</h3>
                                    <p className="text-slate-400">Scan via our native mobile app or connect enterprise scanners. Instant SKU recognition and automated routing.</p>
                                </div>
                            </div>

                            {/* BENTO ITEM 3: Mobile Experience */}
                            <div className="relative group overflow-hidden rounded-[32px] border border-white/10 bg-[#0a0a0a] p-10 transition-all hover:border-white/20 flex flex-col justify-between">
                                <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 blur-[80px]"></div>
                                <div className="relative z-10">
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                                        <Smartphone className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">Pocket Operations</h3>
                                    <p className="text-slate-400">Manage everything from the warehouse floor. Cycle counts, receiving, and picking, all fully optimized for touch.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. DESIGN PHILOSOPHY / HOW IT WORKS */}
                <section id="integrations" className="py-32 relative text-center">
                    {/* Huge background text */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-[15vw] leading-none text-white/[0.02] whitespace-nowrap pointer-events-none select-none">
                        FLUID
                    </div>

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-8">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            <span className="text-xs font-bold text-white tracking-widest uppercase">The Workflow</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-16">Seamless by design.</h2>

                        <div className="max-w-4xl mx-auto flex flex-col space-y-20 md:space-y-24">
                            {[
                                { title: "Connect everything instantly.", desc: "Sync with Shopify, Amazon, and WooCommerce in one click. InvMaster centralizes your catalog automatically.", icon: <LineChart className="w-8 h-8 text-white" /> },
                                { title: "Define the rules, let AI execute.", desc: "Set reorder points or let our algorithm dynamically predict them based on seasonal trends and supplier lead times.", icon: <Settings className="w-8 h-8 text-white" /> },
                                { title: "Ship faster with zero errors.", desc: "Custom picking routes for warehouse staff. Scan to verify. Box. Ship. Your error rate plummets to 0.01%.", icon: <Box className="w-8 h-8 text-white" /> }
                            ].map((step, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6 }}
                                    className="flex flex-col md:flex-row items-center gap-8 md:gap-16 text-left group"
                                >
                                    <div className="shrink-0 relative">
                                        <div className="w-24 h-24 rounded-3xl bg-black border border-white/10 flex items-center justify-center transform group-hover:rotate-6 transition-all duration-500 shadow-2xl relative z-10">
                                            {step.icon}
                                        </div>
                                        {/* Connecting Line (except last) */}
                                        {idx !== 2 && <div className="hidden md:block absolute top-[100%] left-1/2 -translate-x-1/2 w-[1px] h-24 bg-white/20"></div>}
                                    </div>
                                    <div>
                                        <span className="text-blue-500 font-mono text-sm font-bold mb-2 block">STEP 0{idx + 1}</span>
                                        <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{step.title}</h3>
                                        <p className="text-lg text-slate-400">{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7. PREMIUM PRICING */}
                <section id="pricing" className="py-32 relative overflow-hidden">
                    {/* Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%vw] max-w-[1000px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full -z-10 pointer-events-none"></div>

                    <div className="container mx-auto px-6">
                        <div className="max-w-2xl mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Unmatched ROI.</h2>
                            <p className="text-xl text-slate-400">Stop paying for bloated ERP systems. Get enterprise power with startup agility.</p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {/* Starter Plan */}
                            <div className="rounded-[32px] border border-white/10 bg-[#080808] p-8 md:p-10 flex flex-col hover:border-white/20 transition-all flex-1 shadow-lg">
                                <h3 className="text-xl font-bold text-white mb-1">Starter</h3>
                                *<p className="text-sm text-slate-400 mb-6 h-10">Perfect for hobbyists and side projects.</p>

                                <div className="mb-8">
                                    <span className="text-5xl font-black text-white">₹0</span>
                                    <span className="text-sm text-slate-500 font-medium"> / mo</span>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {['1 Admin User', 'Up to 50 Items', 'Basic Reporting', 'Mobile App Access'].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-slate-300 font-medium tracking-wide">
                                            <CheckCircle2 className="h-4 w-4 text-slate-500" /> {feat}
                                        </li>
                                    ))}
                                </ul>

                                <Button variant="outline" className="w-full rounded-2xl h-12 border-white/20 bg-transparent text-white font-bold hover:bg-white hover:text-black transition-all">Get Started</Button>
                            </div>

                            {/* Enterprise Plan (Glowing) */}
                            <div className="relative rounded-[32px] border border-blue-500/50 bg-[#050914] p-8 md:p-10 flex flex-col shadow-[0_0_40px_rgba(37,99,235,0.1)] flex-1 overflow-hidden group">
                                {/* Subtle animated gradient background */}
                                <div className="absolute inset-0 bg-blue-600/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                                <div className="relative z-10 flex justify-between items-start mb-1">
                                    <h3 className="text-xl font-bold text-white">Pro</h3>
                                    <div className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] uppercase font-bold text-blue-400 border border-blue-500/20 tracking-wider">
                                        MOST POPULAR
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 mb-6 relative z-10 h-10">For growing businesses that need power.</p>

                                <div className="mb-8 relative z-10 flex items-end gap-1">
                                    <span className="text-5xl font-black text-white">₹399</span>
                                    <span className="text-sm text-blue-400/80 font-medium mb-1"> / mo</span>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1 relative z-10">
                                    {[
                                        'Unlimited Users & Roles',
                                        'Multi-Warehouse Tracking',
                                        'Advanced Profit & Loss',
                                        'AI Stock Predictions',
                                        'Priority 24/7 Support',
                                        'Export/Import Suite'
                                    ].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-white font-medium tracking-wide">
                                            <div className="h-5 w-5 rounded-full bg-blue-600/80 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="h-3 w-3 text-white" />
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <Button className="w-full rounded-2xl h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all relative z-10">Start 14-Day Free Trial</Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 8. FINAL CTA */}
                <section className="py-40 relative overflow-hidden border-t border-white/5">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[300px] bg-indigo-600/30 blur-[200px] rounded-t-full pointer-events-none"></div>

                    <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 max-w-4xl leading-[1.1]">
                            Control the chaos. <br /> Master your scale.
                        </h2>
                        <p className="text-xl text-slate-400 mb-12 max-w-2xl font-medium">
                            Join the elite class of fulfillment operations taking control with InvMaster.
                        </p>
                        <Link href="/signup">
                            <Button size="lg" className="h-16 md:h-20 rounded-full px-12 md:px-16 text-xl bg-white text-black hover:bg-slate-200 font-bold shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform">
                                Get Priority Access
                            </Button>
                        </Link>
                    </div>
                </section>

            </main>

            {/* 9. ELITE FOOTER */}
            <footer className="border-t border-white/5 bg-[#020202] py-16 relative z-10 text-center md:text-left">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-12">
                        <div>
                            <Link href="/" className="flex items-center justify-center md:justify-start gap-3 group mb-4">
                                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                                    <Box className="h-5 w-5 text-black" />
                                </div>
                                <span className="text-xl font-black tracking-tight text-white">
                                    InvMaster
                                </span>
                            </Link>
                            <p className="text-slate-500 text-sm max-w-xs font-medium">
                                The definitive inventory operating system.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                            <Link href="/login" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Log in</Link>
                            <Link href="/signup" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Sign up</Link>
                            <Link href="/contact" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Contact</Link>
                            <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Privacy Policy</Link>
                            <Link href="/terms" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Terms</Link>
                            <Link href="/refund" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Refund Policy</Link>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-slate-600 text-sm font-medium">
                            © {new Date().getFullYear()} InvMaster Inc. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    )
}
