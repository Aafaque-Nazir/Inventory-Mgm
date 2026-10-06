'use client'

import Link from "next/link"
import { useState, useTransition } from "react"
import { Loader2, Mail, Command, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
    const [isPending, startTransition] = useTransition()
    const [isSent, setIsSent] = useState(false)
    const [email, setEmail] = useState('')

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!email) return

        startTransition(async () => {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${location.origin}/auth/callback?next=/auth/update-password`,
            })
            if (error) {
                toast.error("Password reset failed", { description: error.message })
            } else {
                setIsSent(true)
                toast.success("Password reset link dispatched!")
            }
        })
    }

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

            {/* Center Card */}
            <main className="flex-1 flex items-center justify-center px-4 py-2 relative z-10 w-full">
                <div 
                    className="w-full mx-auto"
                    style={{ maxWidth: '380px' }}
                >
                    <div 
                        className="w-full rounded-2xl border border-white/[0.08] bg-[#111412] p-5 sm:p-6 relative z-10"
                        style={{
                            boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                        }}
                    >
                        {isSent ? (
                            <div className="text-center space-y-3.5">
                                <div className="mx-auto h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Check your email</h2>
                                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                                        We sent a password reset link to <span className="text-white font-medium">{email}</span>.
                                    </p>
                                </div>
                                <div className="pt-2 space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full h-9 text-xs border-white/10 hover:bg-white/10 text-neutral-300 rounded-lg"
                                        onClick={() => setIsSent(false)}
                                    >
                                        Try another email
                                    </Button>
                                    <Button
                                        className="w-full h-9 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-xs"
                                        asChild
                                    >
                                        <Link href="/login">
                                            Return to Login
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                <div className="text-center mb-3">
                                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-2.5">
                                        <Command className="h-4 w-4 text-emerald-400" />
                                    </div>
                                    <h1 className="text-xl font-bold tracking-tight text-white">
                                        Reset password
                                    </h1>
                                    <p className="text-xs text-neutral-400 mt-0.5">
                                        Enter your email to receive recovery instructions
                                    </p>
                                </div>

                                <form onSubmit={onSubmit} className="space-y-3">
                                    <div className="space-y-1 group">
                                        <Label htmlFor="email" className="text-neutral-300 text-[11px] font-medium group-focus-within:text-emerald-400 transition-colors">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                                            <Input
                                                id="email"
                                                name="email"
                                                placeholder="name@company.com"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                autoCapitalize="none"
                                                autoComplete="email"
                                                autoCorrect="off"
                                                disabled={isPending}
                                                required
                                                className="pl-8 h-9 bg-[#0B0E0C] border-white/10 text-white placeholder:text-neutral-500 text-xs focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        disabled={isPending}
                                        type="submit"
                                        className="w-full h-9 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-all duration-200 rounded-lg text-xs mt-1"
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                                Sending link...
                                            </>
                                        ) : (
                                            <>
                                                <span>Send Reset Link</span>
                                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="text-center pt-1">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                                    >
                                        <ArrowLeft className="h-3 w-3" />
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="py-2.5 text-center text-[10px] text-neutral-600 relative z-10" suppressHydrationWarning>
                &copy; {new Date().getFullYear()} InvMaster. All rights reserved.
            </footer>
        </div>
    )
}
