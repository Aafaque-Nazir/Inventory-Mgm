import { SignupForm } from '@/components/auth/SignupForm'
import { LayoutDashboard, Rocket } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Sign Up - InvMaster',
    description: 'Create your account',
}

export default function SignupPage() {
    return (
        <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-[#050505] overflow-hidden p-4 md:p-8 pt-24 pb-8">
            {/* Liquid Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px] mix-blend-screen" />
                <div className="absolute top-[40%] -left-[10%] w-[40%] h-[60%] rounded-full bg-emerald-600/20 blur-[150px] mix-blend-screen" />
                <div className="absolute -bottom-[20%] right-[20%] w-[60%] h-[50%] rounded-full bg-blue-600/20 blur-[150px] mix-blend-screen" />
            </div>

            {/* Grain Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay pointer-events-none"></div>

            {/* Logo */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center text-xl font-bold tracking-tight z-20">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] mr-3">
                    <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                InvMaster
            </div>

            {/* Form Area */}
            <div className="relative flex w-full max-w-[450px] items-center justify-center z-10 animate-in fade-in zoom-in duration-700">
                
                {/* Liquid Glow Behind Card */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-500/30 via-blue-500/20 to-emerald-500/30 blur-2xl rounded-[32px] pointer-events-none opacity-50" />

                {/* Glassmorphic Card */}
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 relative z-10 p-6 sm:p-10 rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-[40px] shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.15)] overflow-hidden">
                    
                    {/* Inner subtle noise for texture on the card */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none rounded-[32px]"></div>

                    <div className="flex flex-col space-y-2 text-center md:text-left relative z-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                            Create an account
                        </h1>
                        <p className="text-sm text-slate-400 font-medium">
                            Enter your details to get started with InvMaster
                        </p>
                    </div>

                    <div className="relative z-10 w-full">
                        <SignupForm />
                    </div>

                </div>
            </div>
        </div>
    )
}
