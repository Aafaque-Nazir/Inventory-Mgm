import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b bg-card">
                <div className="container flex h-16 items-center px-4">
                    <Button variant="ghost" size="sm" asChild className="mr-4">
                        <Link href="/signup">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Signup
                        </Link>
                    </Button>
                    <h1 className="text-xl font-bold">Terms of Service</h1>
                </div>
            </header>
            <main className="container max-w-3xl py-12 px-4 space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        By accessing and using this Inventory Management System, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this system's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We provide users with access to a rich collection of resources, including various communications tools, search services, and personalized content through its network of properties which may be accessed through any various medium or device now known or hereafter developed.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. User Conduct</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        You agree to use the Service only for purposes that are legal, proper and in accordance with these Terms and any applicable policies or guidelines. You agree that you will not engage in any activity that interferes with or disrupts the Service or the servers and networks which are connected to the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The content, organization, graphics, design, compilation, magnetic translation, digital conversion and other matters related to the Site are protected under applicable copyrights, trademarks and other proprietary (including but not limited to intellectual property) rights.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Termination</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                </section>

                <div className="pt-8 border-t text-sm text-muted-foreground">
                    Last updated: December 2025
                </div>
            </main>
        </div>
    )
}
