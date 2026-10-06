import { LoginForm } from '@/components/auth/LoginForm'
import { Command, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Login - InvMaster',
    description: 'Login to your account',
}

export default function LoginPage() {
    return (
        <div className="relative min-h-[100dvh] flex flex-col justify-between bg-[#080908] text-white overflow-hidden" suppressHydrationWarning>
            {/* Top Navigation Bar */}
            <header className="w-full max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5 relative z-20">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 shadow-md shadow-emerald-500/20 transition-transform group-hover:scale-105">
                        <Command className="h-3.5 w-3.5 text-black" />
                    </div>
                    <span className="text-base font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                        InvMaster
                    </span>
                </Link>

                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 px-3 py-1.5 rounded-lg"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Website</span>
                </Link>
            </header>

            {/* Center Auth Card */}
            <main className="flex-1 flex items-center justify-center px-4 py-2 relative z-10 w-full">
                <div 
                    className="w-full mx-auto"
                    style={{ maxWidth: '380px' }}
                >
                    {/* Compact Card */}
                    <div 
                        className="w-full rounded-2xl border border-white/[0.08] bg-[#111412] p-5 sm:p-6 relative z-10"
                        style={{
                            boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                        }}
                    >
                        <div className="text-center mb-4">
                            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-2.5">
                                <Command className="h-4 w-4 text-emerald-400" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-white">
                                Welcome back
                            </h1>
                            <p className="text-xs text-neutral-400 mt-0.5">
                                Enter your credentials to access your workspace
                            </p>
                        </div>

                        <LoginForm />

                        <p className="mt-3 text-center text-[10px] text-neutral-500 leading-normal">
                            By continuing, you agree to our{' '}
                            <Link href="/terms" className="underline underline-offset-2 hover:text-neutral-300 transition-colors">
                                Terms
                            </Link>
                            {' '}and{' '}
                            <Link href="/privacy" className="underline underline-offset-2 hover:text-neutral-300 transition-colors">
                                Privacy Policy
                            </Link>.
                        </p>
                    </div>
                </div>
            </main>

            {/* Bottom minimal note */}
            <footer className="py-2.5 text-center text-[10px] text-neutral-600 relative z-10" suppressHydrationWarning>
                &copy; {new Date().getFullYear()} InvMaster. All rights reserved.
            </footer>
        </div>
    )
}
