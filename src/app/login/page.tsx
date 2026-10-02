import { LoginForm } from '@/components/auth/LoginForm'
import { Command } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Login - InvMaster',
    description: 'Login to your account',
}

export default function LoginPage() {
    return (
        <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-[#070908] overflow-hidden p-4 md:p-8 pt-24 pb-8">
            {/* Ambient Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-600/15 blur-[140px] mix-blend-screen" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-teal-800/10 blur-[150px] mix-blend-screen" />
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-emerald-800/15 blur-[160px] mix-blend-screen" />
            </div>
            
            {/* Grain Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

            {/* Logo */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center text-xl font-bold tracking-tight z-20">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] mr-3">
                    <Command className="h-5 w-5 text-black" />
                </div>
                InvMaster
            </div>

            <div className="relative flex w-full max-w-[450px] items-center justify-center z-10 animate-in fade-in zoom-in duration-700">
                {/* Emerald Glow Behind Card */}
                <div className="absolute -inset-1 bg-emerald-500/10 blur-2xl rounded-[32px] pointer-events-none opacity-60" />

                {/* Elevated Obsidian Card */}
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 relative z-10 p-6 sm:p-10 rounded-[32px] border border-white/10 bg-[#111613] backdrop-blur-[40px] shadow-[0_12px_40px_0_rgba(0,0,0,0.7),inset_0_1px_1px_0_rgba(255,255,255,0.08)] overflow-hidden">
                    
                    {/* Inner subtle noise for texture on the card */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none rounded-[32px]"></div>

                    <div className="flex flex-col space-y-2 text-center md:text-left relative z-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                            Welcome back
                        </h1>
                        <p className="text-sm text-slate-400 font-medium">
                            Enter your credentials to access your workspace
                        </p>
                    </div>

                    <div className="relative z-10 w-full">
                        <LoginForm />
                    </div>

                    <div className="text-center text-sm text-slate-400 mt-6 relative z-10">
                        <Link href="/forgot-password" className="font-medium underline hover:text-white transition-colors underline-offset-4">
                            Forgot your password?
                        </Link>
                    </div>

                    <p className="px-2 text-center text-sm text-slate-500 relative z-10 mt-4 leading-relaxed">
                        By clicking continue, you agree to our{" "}
                        <Link href="/terms" className="font-medium underline underline-offset-4 hover:text-white transition-colors">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="font-medium underline underline-offset-4 hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    )
}
