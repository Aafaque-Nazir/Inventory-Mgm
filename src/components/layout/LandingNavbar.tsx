'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/common/BrandLogo'
import { ChevronRight, Menu, X } from 'lucide-react'

export function LandingNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#070908]/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#070908]/60 transition-all duration-300">
            <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 sm:px-6 md:px-12">
                <Link href="/" className="flex items-center">
                    <BrandLogo size="md" showTagline={false} />
                </Link>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center gap-8 lg:gap-10">
                    <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
                    <Link href="#integrations" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Integrations</Link>
                    <Link href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
                    <Link href="/contact" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Contact</Link>
                </div>

                {/* Desktop & Mobile Actions */}
                <div className="flex items-center gap-3 sm:gap-5">
                    <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-400 hover:text-white transition-colors">Log in</Link>
                    <Link href="/signup">
                        <Button size="sm" className="rounded-full h-9 sm:h-10 px-4 sm:px-6 bg-emerald-500 text-[#04160c] hover:bg-emerald-400 font-bold shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] transition-all hover:scale-105 active:scale-95 border border-emerald-400/30 relative overflow-hidden group text-xs sm:text-sm">
                            <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">Get Access <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></span>
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-shimmer" />
                        </Button>
                    </Link>
                    {/* Mobile Hamburger Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-9 w-9 text-slate-400 hover:text-white hover:bg-white/5"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-b border-emerald-500/20 bg-[#0d120f]/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col space-y-3">
                        <Link
                            href="#features"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-base font-medium text-slate-300 hover:text-white transition-colors py-2 border-b border-white/5"
                        >
                            Features
                        </Link>
                        <Link
                            href="#integrations"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-base font-medium text-slate-300 hover:text-white transition-colors py-2 border-b border-white/5"
                        >
                            Integrations
                        </Link>
                        <Link
                            href="#pricing"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-base font-medium text-slate-300 hover:text-white transition-colors py-2 border-b border-white/5"
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/contact"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-base font-medium text-slate-300 hover:text-white transition-colors py-2 border-b border-white/5"
                        >
                            Contact
                        </Link>
                        <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-base font-medium text-emerald-400 hover:text-emerald-300 transition-colors py-2"
                        >
                            Log in to Dashboard →
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
