'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

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
            console.log('Attempting login...')
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            console.log('Login result:', { data, error })

            if (error) throw error

            console.log('Login successful, redirecting...')
            toast.success('Logged in successfully')

            // Force a hard navigation to ensure cookies are sent and middleware runs
            // Check if user is super admin? For now just dashboard, middleware redirects if needed.
            window.location.href = '/dashboard'

        } catch (error: any) {
            console.error('Login error:', error)
            if (error.message === 'Invalid login credentials') {
                toast.error('Invalid credentials. Please check your password or confirm your email address.')
            } else {
                toast.error(error.message || 'An unexpected error occurred')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid gap-6 p-6 sm:p-8 border rounded-xl shadow-lg bg-card/50 backdrop-blur-sm">
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <Button
                        className="w-full h-12 text-base font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        type="submit"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                </div>
            </form>

            {/* Demo Credentials Section */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground mb-2">Demo Credentials</p>
                        <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="text-xs text-muted-foreground font-medium min-w-[90px]">Demo Account:</span>
                                <code className="text-xs bg-black/20 dark:bg-white/10 px-2 py-1 rounded font-mono text-foreground">
                                    projectpreview@gmail.com
                                </code>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="text-xs text-muted-foreground font-medium min-w-[90px]">Password:</span>
                                <code className="text-xs bg-black/20 dark:bg-white/10 px-2 py-1 rounded font-mono text-foreground">
                                    preview
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <span className="text-primary font-medium">
                    Contact Sales
                </span>
            </div>
        </div>
    )
}
