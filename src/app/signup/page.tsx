'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { LayoutDashboard, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
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
                        role: 'STOREKEEPER' // Default role, org setup happens in onboarding
                    },
                    emailRedirectTo: `${location.origin}/auth/callback`
                }
            })

            if (error) {
                toast.error(error.message)
                return
            }

            // If email confirmation is enabled in Supabase, data.user will be present but session might be null
            // If email confirmation is enabled in Supabase, data.user will be present but session might be null
            if (data.user && !data.session) {
                setIsSuccess(true)
                toast.success("Signup successful! Please verify your email to continue.")
            } else if (data.session) {
                // If email confirmation is disabled or auto-confirmed
                toast.success("Account created successfully!")
                router.push("/onboarding")
            } else if (!data.user && !data.session) {
                // Edge case
                toast.error("Something went wrong. Please try again.")
            }
        })
    }

    if (isSuccess) {
        return (
            <div className="container flex h-screen w-screen flex-col items-center justify-center">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <LayoutDashboard className="mx-auto h-10 w-10 text-primary" />
                        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
                        <p className="text-sm text-muted-foreground">
                            We&apos;ve sent you a verification link. Please click the link to verify your account and continue.
                        </p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
                        Back to Login
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900">
                    <img
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop"
                        alt="Signup Background"
                        className="h-full w-full object-cover opacity-30 mix-blend-color-dodge"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/90 via-slate-950/90 to-black/90" />
                </div>
                <div className="relative z-20 flex items-center text-2xl font-bold tracking-tight">
                    <LayoutDashboard className="mr-2 h-8 w-8 text-indigo-400" />
                    Inventory Management
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2 border-l-2 border-indigo-500 pl-6">
                        <p className="text-xl font-medium leading-relaxed italic text-indigo-100">
                            &ldquo;Join thousands of businesses streamlining their operations with our advanced inventory solutions.&rdquo;
                        </p>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Create an account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your details below to create your account
                        </p>
                    </div>

                    <form onSubmit={onSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    placeholder="John Doe"
                                    type="text"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    disabled={isPending}
                                    required
                                    className="h-11 bg-background"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
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
                                    className="h-11 bg-background"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    disabled={isPending}
                                    required
                                    minLength={8}
                                    className="h-11 bg-background"
                                />
                            </div>
                            <Button disabled={isPending} className="h-11 font-medium bg-primary hover:bg-primary/90">
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign Up with Email
                            </Button>
                        </div>
                    </form>

                    <p className="px-8 text-center text-xs text-muted-foreground">
                        By clicking continue, you agree to our{' '}
                        <Link href="/terms" className="underline underline-offset-4 hover:text-primary transition-colors">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary transition-colors">
                            Privacy Policy
                        </Link>
                        .
                    </p>

                    <div className="text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="underline">
                            Login
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    )
}
