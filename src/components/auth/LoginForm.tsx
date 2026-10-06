'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react'
import { GoogleSignInButton } from './GoogleSignInButton'
import Link from 'next/link'

export function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const _router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            toast.success('Access granted', {
                description: 'Welcome back to InvMaster'
            })

            // Artificial delay for smooth transition feel
            setTimeout(() => {
                window.location.href = '/dashboard'
            }, 500)

        } catch (error: any) {
            if (error.message === 'Invalid login credentials') {
                toast.error('Access verification failed', { description: 'Please check your password.' })
            } else if (error.message.includes('Email not confirmed')) {
                toast.warning('Email verification required')
            } else {
                toast.error('System error', { description: error.message })
            }
        } finally {
            setLoading(false)
        }
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

            <form onSubmit={handleSubmit} className="space-y-2.5">
                <div className="space-y-1 group">
                    <Label htmlFor="email" className="text-neutral-300 text-[11px] font-medium group-focus-within:text-emerald-400 transition-colors">
                        Email Address
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-8 h-9 bg-[#0B0E0C] border-white/10 text-white placeholder:text-neutral-500 text-xs focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                        />
                    </div>
                </div>

                <div className="space-y-1 group">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-neutral-300 text-[11px] font-medium group-focus-within:text-emerald-400 transition-colors">
                            Password
                        </Label>
                        <Link
                            href="/forgot-password"
                            className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-8 h-9 bg-[#0B0E0C] border-white/10 text-white placeholder:text-neutral-500 text-xs focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                        />
                    </div>
                </div>

                <Button
                    className="w-full h-9 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-all duration-200 rounded-lg text-xs mt-1"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            <span>Sign In</span>
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </>
                    )}
                </Button>
            </form>

            <div className="text-center pt-1">
                <p className="text-xs text-neutral-400">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    )
}
