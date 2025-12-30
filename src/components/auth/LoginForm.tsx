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
                toast.error('Invalid credentials. Please check your password.')
            } else if (error.message.includes('Email not confirmed')) {
                toast.warning('Please verify your email address before logging in.')
            } else {
                toast.error(error.message || 'An unexpected error occurred')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid gap-6">
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
                            className="h-11 bg-background"
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
                            className="h-11 bg-background"
                        />
                    </div>
                    <Button
                        className="w-full h-11 bg-primary hover:bg-primary/90 transition-colors"
                        type="submit"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                </div>
            </form>
        </div>
    )
}
