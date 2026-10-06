'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, User, Mail, Lock, ArrowRight, LayoutDashboard } from "lucide-react"
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export function SignupForm() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isSuccess, setIsSuccess] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const fullName = formData.get("fullName") as string

        startTransition(async () => {
            const supabase = createClient()

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'STOREKEEPER'
                    },
                    emailRedirectTo: `${location.origin}/auth/callback`
                }
            })

            if (error) {
                toast.error("Registration failed", { description: error.message })
                return
            }

            if (data.user && !data.session) {
                setIsSuccess(true)
                toast.success("Account created successfully")
            } else if (data.session) {
                toast.success("Account created successfully")
                router.push("/onboarding")
            } else {
                toast.error("Something went wrong")
            }
        })
    }

    if (isSuccess) {
        return (
            <div className="text-center space-y-4 p-5 rounded-2xl bg-[#111613] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <LayoutDashboard className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Check your email</h3>
                    <p className="text-xs text-slate-400">We&apos;ve sent a verification link to your inbox.</p>
                </div>
                <Button
                    variant="outline"
                    className="w-full h-9 text-xs border-white/10 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
                    onClick={() => router.push('/login')}
                >
                    Back to Login
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <GoogleSignInButton />

            <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center text-[10px] font-semibold tracking-wider uppercase">
                    <span className="bg-[#111412] px-2 text-neutral-500">
                        Or continue with email
                    </span>
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-2.5">
                <div className="space-y-1 group">
                    <Label htmlFor="fullName" className="text-neutral-300 text-[11px] font-medium group-focus-within:text-emerald-400 transition-colors">
                        Full Name
                    </Label>
                    <div className="relative">
                        <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                        <Input
                            id="fullName"
                            name="fullName"
                            placeholder="John Doe"
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isPending}
                            required
                            className="pl-8 h-9 bg-[#0B0E0C] border-white/10 text-white placeholder:text-neutral-500 text-xs focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                        />
                    </div>
                </div>

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
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isPending}
                            required
                            className="pl-8 h-9 bg-[#0B0E0C] border-white/10 text-white placeholder:text-neutral-500 text-xs focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                        />
                    </div>
                </div>

                <div className="space-y-1 group">
                    <Label htmlFor="password" className="text-neutral-300 text-[11px] font-medium group-focus-within:text-emerald-400 transition-colors">
                        Password
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Min. 8 characters"
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
                            Creating account...
                        </>
                    ) : (
                        <>
                            <span>Create Account</span>
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </>
                    )}
                </Button>
            </form>

            <div className="text-center pt-1">
                <p className="text-xs text-neutral-400">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    )
}
