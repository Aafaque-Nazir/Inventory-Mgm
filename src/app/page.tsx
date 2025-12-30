'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Box,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  Layers,
  Zap,
  Search,
  RefreshCcw,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Clock
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
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Box className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Inv<span className="text-primary">Master</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#problem" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Problem</Link>
            <Link href="#solution" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Solution</Link>
            <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/login">
              <Button size="sm" className="rounded-full px-6">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] bg-purple-500/10 rounded-full blur-[110px]" />
          </div>

          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="container mx-auto relative z-10 px-4 text-center md:px-6"
          >
            <motion.div variants={fadeIn} className="mx-auto mb-6 flex max-w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              <span className="text-xs font-medium text-slate-300">Next-Gen Inventory Control</span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl"
            >
              Control Your Chaos, <br />
              <span className="bg-gradient-to-r from-primary via-blue-400 to-purple-500 bg-clip-text text-transparent">
                Scale Your Business
              </span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="mx-auto mt-8 max-w-2xl text-lg text-slate-400 md:text-xl"
            >
              Stop wrestling with spreadsheets. Experience a premium inventory management system designed for speed, clarity, and growth.
            </motion.p>

            <motion.div
              variants={fadeIn}
              className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/login">
                <Button size="lg" className="h-14 rounded-full px-10 text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  Start Free Trial <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#problem">
                <Button size="lg" variant="outline" className="h-14 rounded-full border-white/10 bg-white/5 px-10 text-lg backdrop-blur-sm transition-all hover:bg-white/10">
                  See the Difference
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="mt-20 flex justify-center opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0"
            >
              <div className="grid grid-cols-2 items-center gap-12 md:grid-cols-4 lg:gap-24">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6" /> <span className="font-semibold">SECURE</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-yellow-500" /> <span className="font-semibold">ULTRA FAST</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCcw className="h-6 w-6 text-blue-500" /> <span className="font-semibold">REAL-TIME</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-6 w-6 text-purple-500" /> <span className="font-semibold">SCALABLE</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* The Problem Section */}
        <section id="problem" className="relative py-24 md:py-32 overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="flex flex-col gap-12 lg:flex-row lg:items-center"
            >
              <motion.div variants={fadeIn} className="flex-1 space-y-6">
                <div className="inline-block rounded-lg bg-red-500/10 px-3 py-1 text-sm font-medium text-red-500 ring-1 ring-inset ring-red-500/20">
                  The Problem
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                  Inventory Shouldn't Feel Like A Losing Battle
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold">Stock-out Disasters</h4>
                      <p className="text-slate-400">Losing sales because you didn't know you were out of stock? It happens more than you think.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                      <TrendingDown className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold">Tied-up Capital</h4>
                      <p className="text-slate-400">Overstocking items that don't sell is like burning money in your warehouse.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold">Manual Error Fatigue</h4>
                      <p className="text-slate-400">Spending hours on spreadsheets just to find one typo that ruined your whole month's report.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div variants={fadeIn} className="flex-1 relative">
                <div className="aspect-square relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900 group">
                  <img
                    src="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1000&auto=format&fit=crop"
                    alt="Man looking frustrated at boxes"
                    className="object-cover w-full h-full opacity-60 grayscale group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10">
                    <p className="text-sm italic text-slate-300">"Prior to using InvMaster, we were losing roughly 15% of our revenue to inventory mismanagement. It was a nightmare."</p>
                    <p className="mt-2 text-xs font-bold text-slate-500 tracking-wider">— SUPPLY CHAIN MANAGER</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* The Solution Section */}
        <section id="solution" className="relative py-24 md:py-32 bg-slate-900/50">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="flex flex-col-reverse gap-12 lg:flex-row lg:items-center"
            >
              <motion.div variants={fadeIn} className="flex-1">
                <div className="aspect-video relative rounded-3xl overflow-hidden border border-primary/20 bg-slate-900 shadow-2xl shadow-primary/10">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop"
                    alt="Clean analytics dashboard"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center animate-pulse shadow-2xl shadow-primary">
                      <Box className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div variants={fadeIn} className="flex-1 space-y-6">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
                  The Solution
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                  Intelligent Control For The Modern Enterprise
                </h2>
                <p className="text-lg text-slate-400">
                  InvMaster transforms your operations from reactive to proactive. Get visibility into every corner of your warehouse, instantly.
                </p>
                <ul className="space-y-4">
                  {[
                    "One source of truth for all locations",
                    "Automated low-stock alerts and reordering",
                    "Predictive analytics to forecast demand",
                    "Seamless supplier collaboration portal"
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      variants={fadeIn}
                      className="flex items-center gap-3"
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <div className="pt-6">
                  <Link href="/login">
                    <Button className="group rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20">
                      Experience the Clarity <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto py-24 md:py-32 px-4 md:px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16 space-y-4"
          >
            <motion.h2 variants={fadeIn} className="text-3xl font-bold tracking-tight sm:text-5xl">Powerful Tools, Simplified</motion.h2>
            <motion.p variants={fadeIn} className="mx-auto max-w-2xl text-slate-400">Everything you need to manage your business at scale, without the complexity.</motion.p>
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
                icon: Box,
                title: "Smart Inventory",
                desc: "Real-time tracking with barcode support and multi-location management.",
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              {
                icon: BarChart3,
                title: "Deep Analytics",
                desc: "Visual charts and reports to understand your stock levels and trends.",
                color: "text-purple-500",
                bg: "bg-purple-500/10"
              },
              {
                icon: ShieldCheck,
                title: "Enterprise Security",
                desc: "Role-based access control and detailed audit logs for full compliance.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
              },
              {
                icon: Search,
                title: "Advanced Search",
                desc: "Find anything in seconds with powerful filtering and search queries.",
                color: "text-yellow-500",
                bg: "bg-yellow-500/10"
              },
              {
                icon: RefreshCcw,
                title: "Automatic Sync",
                desc: "Everything stays in sync across all devices and team members instantly.",
                color: "text-rose-500",
                bg: "bg-rose-500/10"
              },
              {
                icon: Layers,
                title: "Bulk Operations",
                desc: "Save time with powerful bulk adjustment and import/export tools.",
                color: "text-sky-500",
                bg: "bg-sky-500/10"
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/50 p-8 transition-all hover:border-primary/50 hover:bg-slate-900 hover:shadow-2xl hover:shadow-primary/5"
              >
                <div className={cn("mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl", f.bg, f.color)}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] bg-primary/10 rounded-full blur-[120px]" />
          </div>

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
                Join hundreds of businesses that have transformed their inventory management with InvMaster.
                Start your 14-day free trial today.
              </motion.p>
              <motion.div variants={fadeIn} className="flex flex-col gap-4 sm:flex-row">
                <Link href="/login">
                  <Button size="lg" className="h-16 rounded-full px-12 text-lg shadow-2xl shadow-primary/30">
                    Get Started Now
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-16 rounded-full px-12 text-lg border-white/10 bg-white/5 backdrop-blur-sm">
                    Book a Demo
                  </Button>
                </Link>
              </motion.div>
              <motion.p variants={fadeIn} className="text-sm text-slate-500">No credit card required. Cancel anytime.</motion.p>
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
                The world's most elegant inventory management system. Built for speed, designed for humans.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between border-t border-white/5 pt-8 md:flex-row">
            <p className="text-sm text-slate-500">
              &copy; 2025 InvMaster. All rights reserved. Made by Aafaque.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              {/* social links placeholder */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
