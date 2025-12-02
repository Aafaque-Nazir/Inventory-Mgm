import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Box, BarChart3, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden border-b bg-background text-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
            alt="Warehouse Background"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Master Your Inventory
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              The premium solution for modern commodity management. Track stock, manage suppliers, and analyze performance with elegance.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center pt-4">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-base">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-24 md:py-32">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Box className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Smart Inventory</h3>
            <p className="text-muted-foreground">
              Real-time tracking of all your commodities. Know exactly what you have, where it is, and when to restock.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Advanced Analytics</h3>
            <p className="text-muted-foreground">
              Gain deep insights into your supply chain. Visualize trends, track costs, and optimize your operations.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Secure & Reliable</h3>
            <p className="text-muted-foreground">
              Enterprise-grade security for your data. Role-based access control ensures your information stays safe.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; 2025 CommodityMgm. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
