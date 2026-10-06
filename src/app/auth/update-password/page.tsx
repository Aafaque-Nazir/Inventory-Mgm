'use client'

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock, Command, ArrowLeft, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function UpdatePasswordPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Passwords do not match", { description: "Please ensure both fields are identical." })
            return
        }

        startTransition(async () => {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                toast.error("Update failed", { description: error.message })
            } else {
                toast.success("Password updated successfully!", { description: "Redirecting to your workspace..." })
                setTimeout(() => {
                    router.push("/dashboard")
                }, 500)
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
                        <div className="text-center mb-3">
                            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-2.5">
                                <Command className="h-4 w-4 text-emerald-400" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-white">
                                Set new password
                            </h1>
                            <p className="text-xs text-neutral-400 mt-0.5">
                                Enter your new security credentials below
                            </p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-3">
                            <div className="space-y-1 group">
                                <Label htmlFor="password" className="text-neutral-300 text-[11px] font-medium group-focus-within:text-emerald-400 transition-colors">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Min. 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isPending}
                                        required
                                        minLength={8}
                                        className="pl-8 h-9 bg-[#0B0E0C] border-white/10 text-white placeholder:text-neutral-500 text-xs focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 group">
                                <Label htmlFor="confirmPassword" className="text-neutral-300 text-[11px] font-medium group-focus-within:text-emerald-400 transition-colors">
                                    Confirm New Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={isPending}
                                        required
                                        minLength={8}
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
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <span>Update Password</span>
                                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>

            <footer className="py-2.5 text-center text-[10px] text-neutral-600 relative z-10" suppressHydrationWarning>
                &copy; {new Date().getFullYear()} InvMaster. All rights reserved.
            </footer>
        </div>
    )
}
