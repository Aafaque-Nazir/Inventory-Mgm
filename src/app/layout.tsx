import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "InvMaster | Intelligent Inventory Management",
    template: "%s | InvMaster"
  },
  description: "Stop guessing, start tracking. InvMaster is the AI-powered inventory OS for modern businesses. Features real-time sync, profit analytics, and smart stock predictions.",
  applicationName: "InvMaster",
  authors: [{ name: "Aafaque" }],
  generator: "Next.js",
  keywords: ["inventory management", "stock tracking", "warehouse management", "POS", "supply chain", "business software", "SaaS"],
  referrer: "origin-when-cross-origin",
  creator: "Aafaque",
  publisher: "InvMaster Inc.",
  openGraph: {
    title: "InvMaster | Intelligent Inventory Management",
    description: "AI-powered inventory tracking, profit analytics, and team collaboration. Scale your business with InvMaster.",
    url: "https://nvntory-mgm.vercel.app",
    siteName: "InvMaster",
    images: [
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&h=630&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "InvMaster Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InvMaster | Intelligent Inventory Management",
    description: "Stop guessing, start tracking. Switch to InvMaster today.",
    images: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&h=630&auto=format&fit=crop"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "InvMaster",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnnouncementBanner />
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
