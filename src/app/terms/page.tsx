import { Box } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - InvMaster',
  description: 'Terms of Service for InvMaster',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#070908] text-white relative overflow-hidden">
       <nav className="border-b border-white/10 bg-[#070908]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Box className="h-6 w-6 text-[#04160c]" />
            </div>
            <span className="text-xl font-bold tracking-tight">InvMaster</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20 max-w-4xl relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-emerald-400 tracking-tight">Terms of Service</h1>
        <p className="text-slate-400 mb-12 text-lg">Last updated: February 6, 2025</p>

        <div className="prose prose-invert prose-emerald max-w-none">
          <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-300 leading-relaxed">
            By accessing and using InvMaster, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. Provision of Services</h2>
          <p className="text-slate-300 leading-relaxed">
            InvMaster is constantly innovating in order to provide the best possible experience for its users. You acknowledge and agree that the form and nature of the services which InvMaster provides may change from time to time without prior notice to you.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. Use of Services</h2>
          <p className="text-slate-300 leading-relaxed">
            You agree to use the Services only for purposes that are permitted by (a) the Terms and (b) any applicable law, regulation or generally accepted practices or guidelines in the relevant jurisdictions.
          </p>
          
           <h2 className="text-2xl font-bold text-white mt-10 mb-4">4. User Account Security</h2>
          <p className="text-slate-300 leading-relaxed">
            You are responsible for maintaining the confidentiality of your password and account details, and are fully responsible for all activities that occur under your password or account.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">5. Termination</h2>
          <p className="text-slate-300 leading-relaxed">
            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </div>
      </div>
       {/* Background decoration */}
      <div className="fixed top-[20%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/15 blur-[140px] rounded-full -z-10 pointer-events-none"></div>
    </div>
  )
}
