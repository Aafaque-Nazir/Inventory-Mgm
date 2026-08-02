import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function RefundPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b bg-card">
                <div className="container flex h-16 items-center px-4">
                    <Button variant="ghost" size="sm" asChild className="mr-4">
                        <Link href="/">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
                        </Link>
                    </Button>
                    <h1 className="text-xl font-bold">Cancellation & Refund Policy</h1>
                </div>
            </header>
            <main className="container max-w-3xl py-12 px-4 space-y-8">
                <div className="text-sm text-muted-foreground">
                    Last updated on 01-01-2026 01:36:48
                </div>

                <p className="text-muted-foreground leading-relaxed">
                    AAFAQUE SUFIYAN NAZIR believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
                </p>

                <ul className="list-disc pl-5 space-y-4 text-muted-foreground leading-relaxed">
                    <li>
                        Cancellations will be considered only if the request is made immediately after placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
                    </li>
                    <li>
                        AAFAQUE SUFIYAN NAZIR does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
                    </li>
                    <li>
                        In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within 2 Days days of receipt of the products. In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 2 Days days of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.
                    </li>
                    <li>
                        In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them. In case of any Refunds approved by the AAFAQUE SUFIYAN NAZIR, it&apos;ll take 1-2 Days days for the refund to be processed to the end customer.
                    </li>
                </ul>
            </main>
        </div>
    )
}
