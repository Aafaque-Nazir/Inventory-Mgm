'use client'

import Link from "next/link"
import { useState, useTransition } from "react"
import { Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
    const [isPending, startTransition] = useTransition()
    const [isSent, setIsSent] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string

        startTransition(async () => {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${location.origin}/auth/callback?next=/auth/update-password`,
            })
            if (error) {
                toast.error(error.message)
            } else {
                setIsSent(true)
                toast.success("Password reset email sent!")
            }
        })
    }

    if (isSent) {
        return (
            <div className="container flex h-screen w-screen flex-col items-center justify-center">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <Mail className="mx-auto h-10 w-10 text-primary" />
                        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
                        <p className="text-sm text-muted-foreground">
                            We have sent a password reset link to your email address.
                        </p>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Forgot Password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email address and we will send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="grid gap-4">
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
                            />
                        </div>
                        <Button disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Reset Link
                        </Button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <Link href="/login" className="underline hover:text-primary">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
