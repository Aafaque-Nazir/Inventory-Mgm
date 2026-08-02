'use client'

import { useTransition } from "react"
import { LayoutDashboard, Loader2, ArrowRight, LogOut } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createOrganization } from "@/app/actions/onboarding"

export default function OnboardingPage() {
    const [isPending, startTransition] = useTransition()

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        startTransition(async () => {
            const result = await createOrganization({}, formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                // Redirect handles success
                toast.success("Organization created successfully!")
            }
        })
    }

    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-stone-900">
                    <Image
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                        alt="Onboarding Background"
                        className="h-full w-full object-cover opacity-30 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-stone-900/90" />
                </div>
                <div className="relative z-20 flex items-center text-2xl font-bold tracking-tight">
                    <LayoutDashboard className="mr-2 h-8 w-8 text-orange-500" />
                    Inventory Management
                </div>
                <div className="relative z-20 mt-auto">
                    <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                        Let&apos;s get you set up.
                    </h2>
                    <p className="text-lg text-stone-300">
                        Give your new workspace a name. This is where you and your team will collaborate, track inventory, and grow your business.
                    </p>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
                    <div className="flex flex-col space-y-2">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Create your Organization
                        </h1>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-8 top-8 text-muted-foreground hover:text-foreground"
                            onClick={async () => {
                                const supabase = createClient()
                                await supabase.auth.signOut()
                                window.location.href = '/login'
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            Enter the name of your company or shop. We&apos;ll create a Free account for you to get started.
                        </p>
                    </div>

                    <form onSubmit={onSubmit}>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="orgName">Organization / Shop Name</Label>
                                <Input
                                    id="orgName"
                                    name="orgName"
                                    placeholder="e.g. Acme Logistics"
                                    type="text"
                                    autoCapitalize="words"
                                    disabled={isPending}
                                    required
                                    className="h-11"
                                />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    You can change this later in settings.
                                </p>
                            </div>

                            <Button disabled={isPending} className="h-11">
                                {isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                )}
                                Create & Continue
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
