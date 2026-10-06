import { Box } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - InvMaster',
  description: 'Privacy Policy for InvMaster',
}

export default function PrivacyPage() {
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
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-emerald-400 tracking-tight">Privacy Policy</h1>
        <p className="text-slate-400 mb-12 text-lg">Last updated: February 6, 2025</p>

        <div className="prose prose-invert prose-emerald max-w-none">
          <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. Introduction</h2>
          <p className="text-slate-300 leading-relaxed">
            Welcome to InvMaster. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website or use our services.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. Data We Collect</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li><strong className="text-white">Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong className="text-white">Contact Data:</strong> includes email address and telephone numbers.</li>
            <li><strong className="text-white">Technical Data:</strong> includes IP address, login data, browser type and version.</li>
            <li><strong className="text-white">Usage Data:</strong> includes information about how you use our website and services.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. How We Use Your Data</h2>
          <p className="text-slate-300 leading-relaxed">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 mt-4">
             <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
             <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">4. Data Security</h2>
          <p className="text-slate-300 leading-relaxed">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">5. Contact Us</h2>
          <p className="text-slate-300 leading-relaxed">
            If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:support@invmaster.com" className="text-emerald-400 hover:underline">support@invmaster.com</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
