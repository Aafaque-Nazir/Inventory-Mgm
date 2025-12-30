import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b bg-card">
                <div className="container flex h-16 items-center px-4">
                    <Button variant="ghost" size="sm" asChild className="mr-4">
                        <Link href="/signup">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Signup
                        </Link>
                    </Button>
                    <h1 className="text-xl font-bold">Privacy Policy</h1>
                </div>
            </header>
            <main className="container max-w-3xl py-12 px-4 space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Information Collection</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We collect information from you when you register on our site, place an order, subscribe to our newsletter, respond to a survey or fill out a form. When ordering or registering on our site, as appropriate, you may be asked to enter your: name, e-mail address, mailing address, phone number or credit card information.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Use of Information</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Any of the information we collect from you may be used in one of the following ways:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>To personalize your experience</li>
                            <li>To improve our website</li>
                            <li>To improve customer service</li>
                            <li>To process transactions</li>
                            <li>To send periodic emails</li>
                        </ul>
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. Information Protection</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Cookies</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We use cookies (small files that a site or its service provider transfers to your computers hard drive through your Web browser) to enable the sites or service providers systems to recognize your browser and capture and remember certain information.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Third Party Links</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Occasionally, at our discretion, we may include or offer third party products or services on our website. These third party sites have separate and independent privacy policies. We therefore have no responsibility or liability for the content and activities of these linked sites.
                    </p>
                </section>

                <div className="pt-8 border-t text-sm text-muted-foreground">
                    Last updated: December 2025
                </div>
            </main>
        </div>
    )
}
