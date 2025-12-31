import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Mail, MapPin } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b bg-card">
                <div className="container flex h-16 items-center px-4">
                    <Button variant="ghost" size="sm" asChild className="mr-4">
                        <Link href="/">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
                        </Link>
                    </Button>
                    <h1 className="text-xl font-bold">Contact Us</h1>
                </div>
            </header>
            <main className="container max-w-3xl py-12 px-4 space-y-8">
                <section className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                        Have questions about our Inventory Management System? We're here to help.
                    </p>

                    <div className="grid gap-6 mt-8">
                        <div className="flex items-start gap-4 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                            <Mail className="h-6 w-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold mb-1">Email Us</h3>
                                <p className="text-sm text-muted-foreground mb-2">For general inquiries and support:</p>
                                <a href="mailto:aafaquebuisness@gmail.com" className="text-primary hover:underline">
                                    aafaquebuisness@gmail.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                            <MapPin className="h-6 w-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold mb-1">Office Address</h3>
                                <p className="text-sm text-muted-foreground">
                                    AAFAQUE SUFIYAN NAZIR<br />
                                    [Your Full Physical Address Here]<br />
                                    [City, State, Zip Code]<br />
                                    India
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="pt-8 border-t text-sm text-muted-foreground">
                    Response Time: We usually reply within 24 hours on business days.
                </div>
            </main>
        </div>
    )
}
