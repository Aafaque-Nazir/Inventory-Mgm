import { LoginForm } from '@/components/auth/LoginForm'
import { Command, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Login - InvMaster',
    description: 'Login to your account',
}

export default function LoginPage() {
    return (
        <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-[#050505] overflow-x-hidden p-4 md:p-8 pt-24 pb-8">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />

            {/* Logo */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center text-xl font-bold tracking-tight z-20">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-lg mr-3">
                    <Command className="h-5 w-5 text-black" />
                </div>
                InvMaster
            </div>

            <div className="relative flex w-full max-w-[450px] items-center justify-center z-10 w-full animate-in fade-in zoom-in duration-500">

                <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[450px] relative z-10 p-6 sm:p-8 rounded-[32px] border border-white/5 bg-[#0a0a0a] shadow-2xl">
                    <div className="flex flex-col space-y-2 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                            Welcome back
                        </h1>
                        <p className="text-sm text-slate-400">
                            Enter your credentials to access your workspace
                        </p>
                    </div>

                    <LoginForm />

                    <div className="text-center text-sm text-slate-500 mt-6">
                        <Link href="/forgot-password" className="underline hover:text-blue-400 transition-colors underline-offset-4">
                            Forgot your password?
                        </Link>
                    </div>

                    <p className="px-8 text-center text-sm text-slate-500">
                        By clicking continue, you agree to our{" "}
                        <Link href="/terms" className="underline underline-offset-4 hover:text-blue-400 transition-colors">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline underline-offset-4 hover:text-blue-400 transition-colors">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    )
}
