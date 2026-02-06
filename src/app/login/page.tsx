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
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 overflow-hidden bg-black">
             {/* Left Column: Visuals */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex items-center justify-center overflow-hidden">
                {/* Backgrounds */}
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                
                 {/* Animated Blobs - BLUE variants */}
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600/30 rounded-full blur-[150px] animate-pulse duration-10000" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-sky-600/30 rounded-full blur-[150px] animate-pulse duration-7000 delay-1000" />

                <div className="relative z-20 flex items-center text-2xl font-bold tracking-tight absolute top-10 left-10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30 mr-3">
                        <Command className="h-6 w-6 text-white" />
                    </div>
                    InvMaster
                </div>

                <div className="relative z-20 mt-auto max-w-lg text-center pb-20">
                     <div className="inline-flex items-center justify-center mb-6 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md border border-white/10">
                        <Sparkles className="mr-2 h-4 w-4 text-blue-300" />
                        <span className="text-sm font-medium text-slate-200">Trusted by market leaders</span>
                     </div>
                    <blockquote className="space-y-4">
                        <p className="text-3xl font-bold leading-tight text-white drop-shadow-md">
                            &quot;The insights we get from InvMaster are pure gold. It turned our chaotic warehouse into a finely tuned engine.&quot;
                        </p>
                        <footer className="text-lg text-blue-200 font-medium pt-4">
                            Sofia Davis <br/> 
                            <span className="text-sm text-slate-400 font-normal">Head of Operations, Logistics Inc.</span>
                        </footer>
                    </blockquote>
                </div>
            </div>

             {/* Right Column: Form */}
            <div className="lg:p-8 relative w-full h-full flex items-center justify-center bg-black">
                 {/* Background Glow for Form */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] relative z-10 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
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
