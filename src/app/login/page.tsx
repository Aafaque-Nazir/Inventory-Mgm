import { LoginForm } from '@/components/auth/LoginForm'
import { Command } from 'lucide-react'

export default function LoginPage() {
    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900">
                    <img
                        src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2232&auto=format&fit=crop"
                        alt="Login Background"
                        className="h-full w-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-black/90 mix-blend-multiply" />
                </div>
                <div className="relative z-20 flex items-center text-2xl font-bold tracking-tight">
                    <Command className="mr-2 h-8 w-8 text-indigo-400" />
                    CommodityMgm
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2 border-l-2 border-indigo-500 pl-6">
                        <p className="text-xl font-medium leading-relaxed italic text-indigo-100">
                            &ldquo;The future of logistics is here. Seamlessly track, manage, and optimize your entire supply chain with precision.&rdquo;
                        </p>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email to sign in to your account
                        </p>
                    </div>
                    <LoginForm />
                </div>
            </div>
        </div>
    )
}
