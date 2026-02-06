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
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 overflow-hidden bg-black">
             {/* Left Column: Visuals */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex items-center justify-center overflow-hidden">
                {/* Backgrounds */}
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                
                 {/* Animated Blobs - CYAN/BLUE mix */}
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-cyan-600/20 rounded-full blur-[150px] animate-pulse duration-10000" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-[150px] animate-pulse duration-7000 delay-1000" />

                <div className="relative z-20 flex items-center text-2xl font-bold tracking-tight absolute top-10 left-10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 shadow-lg shadow-cyan-500/30 mr-3">
                        <LayoutDashboard className="h-6 w-6 text-white" />
                    </div>
                    InvMaster
                </div>

                <div className="relative z-20 mt-auto max-w-lg text-center pb-20">
                     <div className="inline-flex items-center justify-center mb-6 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md border border-white/10">
                        <Rocket className="mr-2 h-4 w-4 text-cyan-300" />
                        <span className="text-sm font-medium text-slate-200">Start your growth journey</span>
                     </div>
                    <blockquote className="space-y-4">
                        <p className="text-3xl font-bold leading-tight text-white drop-shadow-md">
                            &quot;InvMaster isn't just a tool; it's the backbone of our operations. We scaled from 1 store to 15 without skipping a beat.&quot;
                        </p>
                        <footer className="text-lg text-cyan-200 font-medium pt-4">
                            Marcus Chen <br/> 
                            <span className="text-sm text-slate-400 font-normal">CEO, RetailFlow</span>
                        </footer>
                    </blockquote>
                </div>
            </div>

             {/* Right Column: Form */}
            <div className="lg:p-8 relative w-full h-full flex items-center justify-center bg-black">
                 {/* Background Glow for Form */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] relative z-10 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
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
