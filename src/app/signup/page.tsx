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
        <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-[#050505] overflow-x-hidden p-4 md:p-8 pt-24 pb-8">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/5 blur-[150px] rounded-full pointer-events-none" />

            {/* Logo */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center text-xl font-bold tracking-tight z-20">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 shadow-lg shadow-cyan-500/30 mr-3">
                    <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                InvMaster
            </div>

            {/* Form Area */}
            <div className="relative flex w-full max-w-[450px] items-center justify-center z-10 w-full animate-in fade-in zoom-in duration-500">

                <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[450px] relative z-10 p-6 sm:p-8 rounded-[32px] border border-white/5 bg-[#0a0a0a] shadow-2xl">
                    <div className="flex flex-col space-y-2 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                            Create an account
                        </h1>
                        <p className="text-sm text-slate-400">
                            Enter your details to get started with InvMaster
                        </p>
                    </div>

                    <SignupForm />

                </div>
            </div>
        </div>
    )
}
