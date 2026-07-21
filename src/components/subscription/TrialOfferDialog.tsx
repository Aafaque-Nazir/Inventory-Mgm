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
                // Force reload to ensure all Pro features unlock immediately
                window.location.reload()
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Don't show if already pro or trial used
    const canTry = !trialUsed && planType === 'FREE'

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            {isTrigger && canTry && (
                <div onClick={() => setOpen(true)} className="cursor-pointer">
                    {trigger || <Button variant="default" size="sm">Start Free Trial 🚀</Button>}
                </div>
            )}

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-primary">
                        <Sparkles className="h-6 w-6 text-yellow-500" />
                        Unlock Inventory Pro
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        Experience the full power of our platform with a <strong>5-Day Free Trial</strong>. No credit card required.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 gap-3">
                        <FeatureRow icon={<BarChart3 className="text-blue-500" />} text="Advanced Financial Analytics & KPIs" />
                        <FeatureRow icon={<ScanBarcode className="text-purple-500" />} text="Barcode Scanning App for Mobile" />
                        <FeatureRow icon={<ShieldCheck className="text-green-500" />} text="Security Audit Logs & Tracking" />
                        <FeatureRow icon={<Rocket className="text-orange-500" />} text="AI Stock Predictions & Insights" />
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button
                        onClick={handleStartTrial}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 shadow-lg shadow-blue-500/20"
                    >
                        {loading ? 'Activating...' : 'Start My 5-Day Free Trial'}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                        Trial automatically ends after 5 days. You won't be charged.
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function FeatureRow({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border hover:bg-muted/80 transition-colors">
            <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center p-1.5 shadow-sm">
                {icon}
            </div>
            <span className="font-medium text-sm">{text}</span>
            <Check className="h-4 w-4 ml-auto text-green-500" />
        </div>
    )
}
