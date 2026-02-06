'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Box,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  Zap,
  CheckCircle2,
  Mail,
  Users,
  CreditCard,
  Lock,
  Store,
  Sparkles,
  ArrowRightLeft,
  QrCode,
  X,
  Crown,
  Play
} from 'lucide-react'
import { motion, useScroll, useTransform, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useRef } from 'react'

const fadeIn: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

const stagger: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
}

export default function Home() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      
      {/* Dynamic Background - BLUE & BLACK Theme */}
      <div className="fixed inset-0 z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
         <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] bg-sky-900/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
         <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] bg-blue-800/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-12">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <Box className="h-6 w-6 text-white" />
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20"></div>
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              InvMaster
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative hover:after:w-full after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-500 after:transition-all after:duration-300">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative hover:after:w-full after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-500 after:transition-all after:duration-300">Pricing</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative hover:after:w-full after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-500 after:transition-all after:duration-300">How it Works</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full px-6 bg-white text-black hover:bg-slate-200 font-semibold shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10" ref={containerRef}>
        {/* Hero Section */}
        <section className="relative flex min-h-screen flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
             
             <motion.div 
               style={{ y, opacity }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-500/10 via-sky-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" 
             />

            <motion.div
                initial="initial"
                animate="animate"
                variants={stagger}
                className="container mx-auto relative z-10 flex flex-col items-center text-center max-w-5xl"
            >
                <motion.div variants={fadeIn} className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400"></span>
                    </span>
                    <span className="text-xs font-semibold text-blue-200 tracking-wide uppercase">New: AI Stock Predictions</span>
                </motion.div>

                <motion.h1
                    variants={fadeIn}
                    className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl leading-[1.1] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50"
                >
                    Inventory control <br/>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-400 to-blue-400 animate-gradient-x">reimagined.</span>
                </motion.h1>

                <motion.p
                    variants={fadeIn}
                    className="max-w-2xl text-lg text-slate-400 md:text-xl leading-relaxed mb-10"
                >
                    Stop wrestling with spreadsheets. InvMaster gives you real-time visibility, automated alerts, and AI-driven insights. It's not just software; it's your <span className="text-blue-400 font-medium">growth engine</span>.
                </motion.p>

                <motion.div
                    variants={fadeIn}
                    className="flex flex-col sm:flex-row gap-4 items-center justify-center"
                >
                    <Link href="/signup">
                        <Button size="lg" className="h-14 rounded-full px-8 text-base bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] transition-all hover:scale-105 active:scale-95 group">
                            Start Tracking Free 
                            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex -space-x-2">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="h-8 w-8 rounded-full border-2 border-black bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold overflow-hidden">
                                     <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" width={32} height={32} />
                                </div>
                            ))}
                        </div>
                        <p>Trusted by <span className="text-white font-bold">500+</span> teams</p>
                    </div>
                </motion.div>

                {/* Dashboard Mockup */}
                <motion.div
                    variants={fadeIn}
                    className="mt-20 relative w-full perspective-1000"
                >
                    <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden group transform transition-all duration-700 hover:rotate-x-2 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60"></div>
                        <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay group-hover:bg-blue-500/10 transition-colors duration-500"></div>
                        
                         {/* Mockup Header */}
                         <div className="h-8 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
                             <div className="flex gap-1.5">
                                 <div className="h-2.5 w-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                 <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                 <div className="h-2.5 w-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                             </div>
                             <div className="mx-auto h-4 w-40 rounded-full bg-white/5"></div>
                         </div>

                        <Image
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
                            alt="Dashboard Preview"
                            className="w-full h-auto object-cover opacity-90"
                            width={1400}
                            height={800}
                            priority
                        />
                        
                        {/* Floating elements */}
                         <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1, duration: 0.8 }}
                            className="absolute -right-6 bottom-20 z-20 hidden md:flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-md shadow-xl"
                        >
                             <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                 <CheckCircle2 className="h-5 w-5 text-green-500" />
                             </div>
                             <div>
                                 <p className="text-sm font-bold text-white">Stock Updated</p>
                                 <p className="text-xs text-slate-400">Just now via Mobile App</p>
                             </div>
                         </motion.div>

                    </div>
                    {/* Shadow/Glow under mockup */}
                    <div className="absolute -inset-10 bg-blue-500/20 blur-[60px] -z-10 rounded-[40px] opacity-40"></div>
                </motion.div>

            </motion.div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 relative">
             <div className="container mx-auto px-6 relative z-10">
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6">Designed for speed. <br/> Built for scale.</h2>
                    <p className="text-lg text-slate-400">Every interaction is crafted to save you milliseconds. Multiply those savings by your team, and you get hours back every week.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Feature 1 */}
                    <div className="col-span-1 md:col-span-2 row-span-2 relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10">
                         <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                         <div className="relative z-10 h-full flex flex-col">
                             <div className="mb-auto">
                                 <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
                                     <BarChart3 className="h-6 w-6 text-blue-400" />
                                 </div>
                                 <h3 className="text-2xl font-bold text-white mb-2">Real-time Analytics</h3>
                                 <p className="text-slate-400 max-w-sm">Watch your profits grow with live P&L tracking. Deep dive into item-level performance and spot trends before they happen.</p>
                             </div>
                             <div className="mt-8 border border-white/10 rounded-xl bg-black/40 backdrop-blur overflow-hidden h-48 relative">
                                 {/* Decorative Chart UI */}
                                 <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-between px-4 pb-4 gap-1">
                                     {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                                         <motion.div 
                                            key={i} 
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${h}%` }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.05, duration: 0.5 }}
                                            className="w-full bg-blue-500/50 rounded-t-sm hover:bg-blue-400 transition-colors"
                                         />
                                     ))}
                                 </div>
                             </div>
                         </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10">
                         <div className="absolute top-0 right-0 p-32 bg-sky-500/20 blur-[80px]"></div>
                        <div className="h-12 w-12 rounded-2xl bg-sky-500/20 flex items-center justify-center mb-6">
                            <Zap className="h-6 w-6 text-sky-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Instant Action</h3>
                        <p className="text-slate-400 text-sm">Keyboard shortcuts for everything. Add stock, create orders, and check reports without lifting your mouse.</p>
                    </div>

                    {/* Feature 3 */}
                    <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10">
                         <div className="absolute top-0 right-0 p-32 bg-blue-500/20 blur-[80px]"></div>
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
                            <ShieldCheck className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Role-Based Access</h3>
                        <p className="text-slate-400 text-sm">Granular permissions. Give storekeepers access to 'Warehouses' only, while managers see 'Sales'.</p>
                    </div>

                     {/* Feature 4 (Wide) */}
                     <div className="col-span-1 md:col-span-3 relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12 transition-all hover:bg-white/10">
                         <div className="grid md:grid-cols-2 gap-12 items-center">
                             <div>
                                 <div className="inline-flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 mb-6">
                                     <Sparkles className="h-3 w-3" /> AI Powered
                                 </div>
                                 <h3 className="text-3xl font-bold text-white mb-4">Stockout Prediction</h3>
                                 <p className="text-slate-400 text-lg mb-6">Our AI analyzes your sales velocity and lead times to warn you days before you run out of stock. Never lose a sale again.</p>
                                 <Button variant="outline" className="rounded-full border-white/10 hover:bg-white/10 hover:text-white">Learn more</Button>
                             </div>
                             <div className="relative">
                                  {/* Glass card decoration */}
                                  <div className="absolute -inset-4 bg-green-500/20 blur-3xl opacity-20"></div>
                                  <div className="relative rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl p-6">
                                      <div className="flex items-center gap-4 mb-4">
                                          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                                              <Box className="h-5 w-5 text-slate-400" />
                                          </div>
                                          <div className="flex-1">
                                              <div className="h-2 w-24 bg-slate-700 rounded mb-2"></div>
                                              <div className="h-2 w-16 bg-slate-800 rounded"></div>
                                          </div>
                                          <div className="text-right">
                                              <div className="text-red-400 font-bold text-sm">Low Stock</div>
                                          </div>
                                      </div>
                                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                          <motion.div 
                                            initial={{ width: "100%" }}
                                            whileInView={{ width: "15%" }}
                                            transition={{ duration: 1.5, ease: "easeInOut" }}
                                            className="h-full bg-red-500" 
                                          />
                                      </div>
                                      <div className="mt-2 flex justify-between text-xs text-slate-500">
                                          <span>12 units remaining</span>
                                          <span className="text-red-400">Restock recommended</span>
                                      </div>
                                  </div>
                             </div>
                         </div>
                    </div>
                </div>
             </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-24 relative">
             <div className="container mx-auto px-6 relative z-10">
                 <div className="text-center mb-16">
                     <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">From chaos to control in minutes</h2>
                     <p className="text-lg text-slate-400">No complex setup. No training required. Just sign up and start shipping.</p>
                 </div>

                 <div className="grid md:grid-cols-3 gap-8 relative">
                     {/* Connecting Line (Desktop) */}
                     <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0 border-t border-dashed border-slate-700 z-0"></div>

                     {[
                         {
                             step: "01",
                             title: "Connect",
                             desc: "Import your products via CSV or connect your existing store (Shopify, WooCommerce) in one click.",
                             icon: <QrCode className="h-6 w-6 text-blue-400" />
                         },
                         {
                             step: "02",
                             title: "Automate",
                             desc: "Set low-stock alerts and let our AI predict when you need to reorder based on sales velocity.",
                             icon: <Zap className="h-6 w-6 text-cyan-400" />
                         },
                         {
                             step: "03",
                             title: "Scale",
                             desc: "Use real-time analytics to cut dead stock, optimize margins, and expand to new locations.",
                             icon: <BarChart3 className="h-6 w-6 text-sky-400" />
                         }
                     ].map((item, i) => (
                         <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                             <div className="h-24 w-24 rounded-3xl bg-black border border-white/10 flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                 <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center backdrop-blur-md">
                                     {item.icon}
                                 </div>
                                 <div className="absolute top-2 right-4 text-xs font-bold text-slate-700 font-mono">
                                     {item.step}
                                 </div>
                             </div>
                             <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                             <p className="text-slate-400 leading-relaxed max-w-xs">{item.desc}</p>
                         </div>
                     ))}
                 </div>
             </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 relative overflow-hidden">
             {/* Background Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-900/40 blur-[120px] rounded-full -z-10"></div>
             
             <div className="container mx-auto px-6">
                 <div className="text-center mb-16">
                     <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
                     <p className="text-slate-400 text-lg">Start for free. Grow without limits.</p>
                 </div>

                 <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                     {/* Free Plan */}
                     <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 flex flex-col hover:border-white/20 transition-all group">
                         <div className="mb-8">
                             <h3 className="text-lg font-medium text-slate-300 mb-2">Starter</h3>
                             <div className="flex items-baseline gap-1">
                                 <span className="text-5xl font-bold text-white tracking-tight">₹0</span>
                                 <span className="text-slate-500">/month</span>
                             </div>
                             <p className="mt-4 text-slate-400 text-sm">Perfect for hobbyists and side projects.</p>
                         </div>
                         <ul className="space-y-4 mb-8 flex-1">
                             {['1 Admin User', 'Up to 50 Items', 'Basic Reporting', 'Mobile App Access'].map((feat, i) => (
                                 <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                                     <CheckCircle2 className="h-5 w-5 text-slate-500" /> {feat}
                                 </li>
                             ))}
                         </ul>
                         <Link href="/signup">
                            <Button variant="outline" className="w-full rounded-2xl h-12 border-white/10 bg-transparent hover:bg-white/5 hover:text-white transition-all">Get Started</Button>
                         </Link>
                     </div>

                     {/* Pro Plan */}
                     <div className="relative rounded-3xl border border-blue-500/50 bg-black/60 backdrop-blur-xl p-8 flex flex-col shadow-2xl shadow-blue-500/10 scale-105 z-10">
                         <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-sky-500 px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg">
                             MOST POPULAR
                         </div>
                         <div className="mb-8">
                             <h3 className="text-lg font-medium text-blue-300 mb-2">Pro</h3>
                             <div className="flex items-baseline gap-1">
                                 <span className="text-5xl font-bold text-white tracking-tight">₹399</span>
                                 <span className="text-slate-500">/month</span>
                             </div>
                             <p className="mt-4 text-slate-400 text-sm">For growing businesses that need power.</p>
                         </div>
                         <ul className="space-y-4 mb-8 flex-1">
                             {[
                                 'Unlimited Users', 
                                 'Multi-Warehouse Support', 
                                 'Advanced Analytics & P&L', 
                                 'AI Stock Predictions',
                                 'Priority Email Support',
                                 'Bulk Data Export'
                            ].map((feat, i) => (
                                 <li key={i} className="flex items-center gap-3 text-white text-sm">
                                     <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                         <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                                     </div> 
                                     {feat}
                                 </li>
                             ))}
                         </ul>
                         <Link href="/signup">
                            <Button className="w-full rounded-2xl h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25">Start Free Trial</Button>
                         </Link>
                     </div>
                 </div>
             </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative overflow-hidden">
             <div className="container mx-auto px-6 relative z-10 text-center">
                 <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8">Ready to evolve?</h2>
                 <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">Join thousands of modern teams using InvMaster to streamline their operations.</p>
                 <Link href="/signup">
                    <Button size="lg" className="h-16 rounded-full px-10 text-lg bg-white text-black hover:bg-slate-200 font-bold shadow-2xl hover:scale-105 transition-transform">
                        Start your 14-day free trial
                    </Button>
                 </Link>
             </div>
        </section>

      </main>

      <footer className="border-t border-white/5 bg-black py-12 relative z-10">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Box className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">InvMaster</span>
                </div>
                <div className="flex gap-8 text-sm text-slate-400">
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                </div>
                <div className="text-slate-600 text-sm">
                    © 2025 InvMaster Inc.
                </div>
            </div>
        </div>
      </footer>

    </div>
  )
}
