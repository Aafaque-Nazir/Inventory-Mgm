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
import { motion } from 'framer-motion'
import Link from 'next/link'

export function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-4"
        >
            <GoogleSignInButton />

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-[10px] font-semibold tracking-widest uppercase">
                    <span className="bg-[#0a0a0a] px-3 text-slate-500">
                        Or continue with email
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2 group">
                        <Label htmlFor="email" className="text-slate-400 text-xs font-semibold uppercase tracking-wider group-focus-within:text-white transition-colors">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-white transition-colors" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-11 h-14 bg-black/50 border-white/5 text-white placeholder:text-slate-600 focus:bg-black focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all rounded-xl"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2 group">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-slate-400 text-xs font-semibold uppercase tracking-wider group-focus-within:text-white transition-colors">Password</Label>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-white transition-colors" />
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-11 h-14 bg-black/50 border-white/5 text-white placeholder:text-slate-600 focus:bg-black focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all rounded-xl"
                            />
                        </div>
                    </div>
                    <Button
                        className="w-full h-14 bg-white hover:bg-slate-200 text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 rounded-xl"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                Sign In <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>

            <div className="text-center">
                <p className="text-sm text-slate-400">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors hover:underline underline-offset-4">
                        Create an account
                    </Link>
                </p>
            </div>
        </motion.div>
    )
}
