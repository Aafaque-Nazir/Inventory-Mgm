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
  Crown
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50 selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Box className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Inv<span className="text-primary">Master</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">How it Works</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full px-6">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-20 pb-10">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] bg-purple-500/10 rounded-full blur-[110px]" />
          </div>

          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="container mx-auto relative z-10 px-4 text-center md:px-6 flex flex-col items-center"
          >
            <motion.div variants={fadeIn} className="mb-4 flex max-w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm z-20">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-slate-300">Free Tier Available Now</span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl leading-tight"
            >
              Inventory Management <br />
              <span className="text-white">
                For Modern Teams
              </span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="mx-auto mt-6 max-w-2xl text-base text-slate-400 md:text-lg"
            >
              Collaborate with your storekeepers, get automated low-stock alerts, and track every movement. Visual, Fast, and Secure.
            </motion.p>

            <motion.div
              variants={fadeIn}
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/signup">
                <Button size="lg" className="h-12 rounded-full px-8 text-base shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  Start for Free <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" className="h-12 rounded-full border-white/10 bg-white/5 px-8 text-base backdrop-blur-sm transition-all hover:bg-white/10">
                  Explore Features
                </Button>
              </Link>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div
              variants={fadeIn}
              className="mt-12 relative mx-auto max-w-5xl rounded-xl border border-white/10 bg-slate-900/50 shadow-2xl backdrop-blur-sm p-2 w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
              <Image
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
                alt="Dashboard Preview"
                className="rounded-lg opacity-80"
                width={1200}
                height={600}
                style={{ width: '100%', height: 'auto' }}
                priority
              />
            </motion.div>
          </motion.div>
        </section>

        {/* The Problem Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <motion.div variants={fadeIn} className="space-y-6">
                <div className="inline-block rounded-lg bg-red-500/10 px-3 py-1 text-sm font-medium text-red-500 ring-1 ring-inset ring-red-500/20">
                  The Problem
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                  Inventory Chaos is Costing You Money
                </h2>
                <p className="text-lg text-slate-400">
                  Spreadsheets are prone to errors. Sticky notes get lost. Without a system, you are flying blind.
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200">Stockouts & Lost Sales</h4>
                      <p className="text-sm text-slate-500">Running out of popular items means customers go to competitors.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                      <Box className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200">Overstocking Waste</h4>
                      <p className="text-sm text-slate-500">Cash tied up in dust-gathering inventory that never sells.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200">Theft & unaccountability</h4>
                      <p className="text-sm text-slate-500">Without logs, items disappear and no one knows who took them.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div variants={fadeIn} className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-2xl opacity-50 rounded-full" />
                <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-sm">
                  {/* Abstract visuals representing chaos */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded bg-red-500/5 border border-red-500/10">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-sm text-red-200 font-mono">CRITICAL: Stock mismatch (SKU-102)</span>
                      </div>
                      <span className="text-xs text-red-400">Just now</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-white/5 opacity-60">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400 font-mono">Excel_Sheet_Final_v2_FINAL.xlsx</span>
                      </div>
                      <span className="text-xs text-slate-500">Corrupted</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-white/5 opacity-60">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400 font-mono">Stock Count (Sticky Note)</span>
                      </div>
                      <span className="text-xs text-slate-500">Lost</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* The Solution Section */}
        <section className="relative py-24 bg-slate-900/30 border-y border-white/5">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <div className="inline-block rounded-lg bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500 ring-1 ring-inset ring-green-500/20 mb-4">
                The Solution
              </div>
              <motion.h2 variants={fadeIn} className="text-3xl font-bold tracking-tight sm:text-5xl">
                Turn Chaos into Control
              </motion.h2>
              <motion.p variants={fadeIn} className="mx-auto mt-4 max-w-2xl text-slate-400">
                InvMaster replaces guesswork with data. It travels with you, scales with you, and keeps your team aligned.
              </motion.p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div variants={fadeIn} className="bg-slate-950 border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:border-green-500/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="h-24 w-24 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Real-Time Sync</h3>
                <p className="text-slate-400 text-sm">Update stock on mobile, see it on desktop instantly. Everyone sees the same numbers.</p>
              </motion.div>
              <motion.div variants={fadeIn} className="bg-slate-950 border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShieldCheck className="h-24 w-24 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Smart Safety Nets</h3>
                <p className="text-slate-400 text-sm">Permission controls prevent unauthorized edits. Logs capture every mistake.</p>
              </motion.div>
              <motion.div variants={fadeIn} className="bg-slate-950 border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BarChart3 className="h-24 w-24 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Growth Ready</h3>
                <p className="text-slate-400 text-sm">Start with 50 items. Scale to 50,000. We handle the infrastructure.</p>
              </motion.div>
            </div>
          </div>
        </section>
        {/* Features Grid */}
        <section id="features" className="container mx-auto py-24 md:py-32 px-4 md:px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16 space-y-4"
          >
            <motion.h2 variants={fadeIn} className="text-3xl font-bold tracking-tight sm:text-5xl">
              Power-Packed Features
            </motion.h2>
            <motion.p variants={fadeIn} className="mx-auto max-w-2xl text-slate-400">
              Everything you need to run your inventory like a pro.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                icon: Store,
                title: "Multi-Warehouse",
                desc: "Manage stock across multiple locations. Switch warehouses with a click.",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
                isPro: true
              },
              {
                icon: BarChart3,
                title: "Profit Analytics",
                desc: "Real-time P&L analysis. Know your margins on every single item sold.",
                color: "text-green-500",
                bg: "bg-green-500/10",
                isPro: true
              },
              {
                icon: Sparkles,
                title: "AI Predictions",
                desc: "Our AI predicts when you'll run out of stock based on past sales velocity.",
                color: "text-purple-500",
                bg: "bg-purple-500/10",
                isPro: true
              },
              {
                icon: ArrowRightLeft,
                title: "Stock Movement Logs",
                desc: "Full audit trail. See every 'In' and 'Out' transaction with timestamps.",
                color: "text-orange-500",
                bg: "bg-orange-500/10",
                isPro: true
              },
              {
                icon: QrCode,
                title: "Barcode Scanning",
                desc: "Use your phone camera to scan items. Add or deduct stock instantly.",
                color: "text-pink-500",
                bg: "bg-pink-500/10",
                isPro: true
              },
              {
                icon: Mail,
                title: "Smart Alerts",
                desc: "Get notified via Email when critical items hit low stock levels.",
                color: "text-yellow-500",
                bg: "bg-yellow-500/10",
                isPro: true
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/50 p-8 transition-all hover:border-primary/50 hover:bg-slate-900 hover:shadow-2xl hover:shadow-primary/5"
              >
                {/* PRO Badge */}
                {f.isPro && (
                  <div className="absolute top-6 right-6 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-200/10 to-amber-500/10 px-3 py-1 text-xs font-bold text-amber-500 border border-amber-500/20 ring-1 ring-amber-500/10 backdrop-blur-md">
                    <Crown className="h-3.5 w-3.5 fill-amber-500" />
                    <span>PRO</span>
                  </div>
                )}

                <div className={cn("mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl", f.bg, f.color)}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="relative py-24 bg-slate-900/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Simple, Transparent Pricing</h2>
              <p className="text-slate-400 max-w-2xl">Start for free, upgrade when you grow. No hidden fees.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="rounded-3xl border border-white/10 bg-slate-950 p-8 flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-200">Starter</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">₹0</span>
                    <span className="text-sm text-slate-500">/month</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-400">For small shops and solo founders.</p>
                </div>
                <ul className="space-y-3 flex-1">
                  <li className="flex gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> 1 User (Admin)
                  </li>
                  <li className="flex gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> Up to 50 Items
                  </li>
                  <li className="flex gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> Basic Reports
                  </li>
                  <li className="flex gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> <strong>Sales & Invoices</strong> 🧾
                  </li>
                  <li className="flex gap-3 text-sm text-slate-500/50 line-through">
                    <X className="h-5 w-5 shrink-0" /> Multi-Warehouse
                  </li>
                </ul>
                <Link href="/signup">
                  <Button variant="outline" className="w-full rounded-full h-12 border-white/20 hover:bg-white/10 text-white">
                    Start for Free
                  </Button>
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="relative rounded-3xl border border-primary/50 bg-slate-900 p-8 flex flex-col gap-6 shadow-2xl shadow-primary/10 transition-transform hover:scale-105 duration-300">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg shadow-blue-500/20">
                  Most Popular
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Pro</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">₹9</span>
                    <span className="text-sm text-slate-500">/month</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-400">For growing teams and serious businesses.</p>
                </div>
                <ul className="space-y-4 flex-1">
                  <li className="flex gap-3 text-sm text-white">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> <strong>5 Team Members</strong>
                  </li>
                  <li className="flex gap-3 text-sm text-white">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> <strong>Multi-Warehouse (2 Warehouses)</strong> 🏢
                  </li>
                  <li className="flex gap-3 text-sm text-white">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> <strong>Barcode Scanning App</strong> 📱
                  </li>
                  <li className="flex gap-3 text-sm text-white">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> Financial Analytics & Profits 💰
                  </li>
                  <li className="flex gap-3 text-sm text-white">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> Stock Movement Logs
                  </li>
                  <li className="flex gap-3 text-sm text-white">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> AI Stock Predictions 🤖
                  </li>
                  <li className="flex gap-3 text-sm text-white">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> Low Stock Email Alerts 📧
                  </li>
                  <li className="flex gap-3 text-sm text-white">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> Bulk CSV Import/Export 📤
                  </li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full rounded-full h-12 bg-gradient-to-r from-primary to-indigo-600 hover:to-indigo-500 text-white shadow-lg shadow-primary/25 font-bold">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Get Started in 3 Steps</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl font-bold text-white border border-white/10">1</div>
                <h3 className="text-xl font-bold">Sign Up</h3>
                <p className="text-slate-400">Create your account. No credit card required for the Free plan.</p>
              </div>
              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl font-bold text-white border border-white/10">2</div>
                <h3 className="text-xl font-bold">Create Organization</h3>
                <p className="text-slate-400">Name your workspace. You'll be the Admin automatically.</p>
              </div>
              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl font-bold text-white border border-white/10">3</div>
                <h3 className="text-xl font-bold">Invite Team</h3>
                <p className="text-slate-400">Add your managers and storekeepers to start collaborating.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="container mx-auto relative z-10 px-4 md:px-6">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto"
            >
              <motion.h2 variants={fadeIn} className="text-4xl font-bold tracking-tight sm:text-6xl">Ready to take control?</motion.h2>
              <motion.p variants={fadeIn} className="text-xl text-slate-400">
                Join our premium inventory platform. Stop guessing, start tracking.
              </motion.p>
              <motion.div variants={fadeIn} className="flex flex-col gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="h-16 rounded-full px-12 text-lg shadow-2xl shadow-primary/30">
                    Get Started Now
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="space-y-4 col-span-2">
              <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Box className="h-5 w-5 text-white" />
                </div>
                <span>InvMaster</span>
              </div>
              <p className="max-w-xs text-sm text-slate-500">
                The modern inventory OS for growing businesses.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="mailto:aafaquebuisness@gmail.com" className="hover:text-white transition-colors">aafaquebuisness@gmail.com</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between border-t border-white/5 pt-8 md:flex-row">
            <p className="text-sm text-slate-500">
              &copy; 2025 InvMaster. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
