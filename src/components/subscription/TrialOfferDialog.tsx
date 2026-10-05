'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Rocket, BarChart3, ScanBarcode, ShieldCheck, Sparkles, Check } from 'lucide-react'
import { toast } from 'sonner'
import { startFreeTrial } from '@/app/actions/subscription'
import { useRouter } from 'next/navigation'

interface TrialOfferDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    organizationId: string
    trialUsed: boolean
    planType: string
    isTrigger?: boolean
    trigger?: React.ReactNode
}

export function TrialOfferDialog({ open, onOpenChange, organizationId, trialUsed, planType, isTrigger = false, trigger }: TrialOfferDialogProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [internalOpen, setInternalOpen] = useState(false)

    // Controlled vs Uncontrolled logic
    const isOpen = open !== undefined ? open : internalOpen
    const setOpen = onOpenChange || setInternalOpen

    const handleStartTrial = async () => {
        if (!organizationId) {
            toast.error("Organization ID missing. Please refresh the page.")
            return
        }
        setLoading(true)
        try {
            const result = await startFreeTrial(organizationId)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('🎉 Welcome to Pro! 5-Day Trial Activated.')
                setOpen(false)
                router.refresh()
            }
        } catch (_error: any) {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // don&apos;t show if already pro or trial used
    const canTry = !trialUsed && planType === 'FREE'

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            {isTrigger && canTry && (
                <div onClick={() => setOpen(true)} className="cursor-pointer">
                    {trigger || <Button variant="default" size="sm">Start Free Trial 🚀</Button>}
                </div>
            )}

            <DialogContent className="sm:max-w-md bg-[#111613] border border-white/10 text-white rounded-3xl p-6 sm:p-7 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-white tracking-tight">
                        <Sparkles className="h-6 w-6 text-emerald-400" />
                        Unlock Inventory Pro
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2 text-slate-400">
                        Experience the full power of our platform with a <strong className="text-white">5-Day Free Trial</strong>. No credit card required.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 gap-3">
                        <FeatureRow icon={<BarChart3 className="text-emerald-400" />} text="Advanced Financial Analytics & KPIs" />
                        <FeatureRow icon={<ScanBarcode className="text-teal-400" />} text="Barcode Scanning App for Mobile" />
                        <FeatureRow icon={<ShieldCheck className="text-emerald-400" />} text="Security Audit Logs & Tracking" />
                        <FeatureRow icon={<Rocket className="text-emerald-300" />} text="AI Stock Predictions & Insights" />
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button
                        onClick={handleStartTrial}
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold text-base py-6 rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
                    >
                        {loading ? 'Activating...' : 'Start My 5-Day Free Trial'}
                    </Button>
                    <p className="text-xs text-center text-slate-500 mt-2">
                        Trial automatically ends after 5 days. You won&apos;t be charged.
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function FeatureRow({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-emerald-500/30 transition-colors">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center p-1.5 shadow-inner">
                {icon}
            </div>
            <span className="font-medium text-sm text-slate-200">{text}</span>
            <Check className="h-4 w-4 ml-auto text-emerald-400" />
        </div>
    )
}
