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
import { motion } from "framer-motion"

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
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 p-6 rounded-2xl bg-white/5 border border-white/10"
             >
                 <div className="mx-auto h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                     <LayoutDashboard className="h-8 w-8 text-green-500" />
                 </div>
                 <div className="space-y-2">
                     <h3 className="text-xl font-bold text-white">Check your email</h3>
                     <p className="text-slate-400">We've sent a verification link to your inbox.</p>
                 </div>
                 <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 hover:text-white" onClick={() => router.push('/login')}>
                     Back to Login
                 </Button>
             </motion.div>
         )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-6"
        >
            <GoogleSignInButton />

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-slate-500">
                        Or click below
                    </span>
                </div>
            </div>

            <form onSubmit={onSubmit}>
                <div className="grid gap-5">
                    <div className="grid gap-2 group">
                        <Label htmlFor="fullName" className="text-slate-300 group-focus-within:text-cyan-400 transition-colors">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                            <Input
                                id="fullName"
                                name="fullName"
                                placeholder="John Doe"
                                type="text"
                                autoCapitalize="none"
                                autoCorrect="off"
                                disabled={isPending}
                                required
                                className="pl-10 h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="grid gap-2 group">
                        <Label htmlFor="email" className="text-slate-300 group-focus-within:text-cyan-400 transition-colors">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                            <Input
                                id="email"
                                name="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={isPending}
                                required
                                className="pl-10 h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2 group">
                        <Label htmlFor="password" className="text-slate-300 group-focus-within:text-cyan-400 transition-colors">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                disabled={isPending}
                                required
                                minLength={8}
                                className="pl-10 h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                            />
                        </div>
                    </div>
                    
                    <Button disabled={isPending} className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/40 transition-all duration-300">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </form>

            <p className="px-8 text-center text-xs text-slate-500">
                By clicking continue, you agree to our{' '}
                <Link href="/terms" className="underline underline-offset-4 hover:text-cyan-400 transition-colors">
                    Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-cyan-400 transition-colors">
                    Privacy Policy
                </Link>
                .
            </p>

            <div className="text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors hover:underline underline-offset-4">
                    Sign In
                </Link>
            </div>
        </motion.div>
    )
}
