import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProLockProps {
    isPro: boolean
    children: React.ReactNode
    className?: string
    title?: string
    description?: string
}

export function ProLock({
    isPro,
    children,
    className,
    title = "Pro Feature",
    description = "Upgrade to Pro to view this advanced analytic."
}: ProLockProps) {
    if (isPro) {
        return <>{children}</>
    }

    return (
        <div className={cn("relative overflow-hidden group", className)}>
            {/* Blurred Content */}
            <div className="filter blur-sm select-none pointer-events-none opacity-40">
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/10 backdrop-blur-[2px] p-6 text-center z-10 transition-all">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <Lock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-[250px]">
                    {description}
                </p>
                <Button asChild size="sm" variant="default" className="bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold shadow-lg shadow-emerald-500/25 border-0">
                    <Link href="/pricing">Upgrade to Pro</Link>
                </Button>
            </div>
        </div>
    )
}
