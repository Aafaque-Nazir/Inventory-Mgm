/**
 * Master Pricing & Subscription Configuration for InvMaster
 * Single Source of Truth for:
 * 1. Landing Page (Public Website)
 * 2. In-App Pricing Page (/pricing)
 * 3. Razorpay Orders & Subscriptions Backend (/api/razorpay)
 */

export const PLANS_CONFIG = {
    // ── Global Offer Controls ────────────────────────────────────────────────
    // Change isFoundingOfferActive to false when the founding member promotion ends
    isFoundingOfferActive: true,
    foundingOfferBadge: 'Save 58%',
    foundingOfferName: 'Founding Member Deal',

    // ── Starter (Free Tier) ──────────────────────────────────────────────────
    starter: {
        id: 'starter',
        name: 'Starter',
        price: 0,
        displayPrice: '₹0',
        periodText: '/ lifetime free',
        tagline: 'For single-outlet dealers & retailers starting out.',
        features: [
            'Up to 200 Products / SKUs',
            '1 Warehouse / Central Godown',
            '1 Admin User Account',
            'Mobile Camera Barcode Scanner',
            'GST Tax Invoice Generator & HSN',
            '1-Click WhatsApp Invoice Dispatch',
            'Batch Number & Expiry Date Tracking',
        ],
    },

    // ── Pro Plan (Wholesale Tier) ────────────────────────────────────────────
    pro: {
        id: 'pro',
        name: 'Pro Plan',
        tierLabel: 'DISTRIBUTOR',
        tagline: 'For wholesale dealers, FMCG/Pharma distributors & multi-godowns.',
        
        monthly: {
            cycle: 'monthly' as const,
            price: 199,
            regularPrice: 299,
            displayPrice: '₹199',
            periodText: '/ month',
            monthlyEquivalent: 199,
            durationDays: 30,
            billingNote: 'Billed monthly. Cancel anytime with 1-click.',
            razorpayPlanId: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY_ID || '',
        },

        yearly: {
            cycle: 'yearly' as const,
            price: 999,
            regularPrice: 2388, // 199 * 12
            displayPrice: '₹999',
            periodText: '/ year',
            monthlyEquivalent: 83, // ~₹83/mo
            durationDays: 365,
            badge: 'Save 58%',
            savingsText: 'Save ₹1,389/yr',
            billingNote: 'Billed annually (~₹83/mo). 1 full year wholesale access.',
            razorpayPlanId: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY_ID || '',
        },

        features: [
            'Unlimited Products & Inventory SKUs',
            'Up to 5 Godowns & Inter-Warehouse Transfers',
            'Up to 5 Team Members (Admin, Manager, Storekeeper)',
            'Stock Movement Audit Trail & Leakage Prevention',
            'Wholesale Purchase Orders & Supplier History',
            'Sales Returns & Credit Notes System',
            'Real-Time Profit & Loss (P&L) and Margins Analytics',
            'Automated Low-Stock & Expiry Alert Emails',
            'No InvMaster watermark on invoices',
        ],
    },

    // ── Trust & Guarantees ───────────────────────────────────────────────────
    assurances: [
        'All-inclusive pricing — zero maintenance or setup fees',
        'Cancel anytime with 1-click in billing settings',
        'Full CSV stock data export available always',
    ],
}
