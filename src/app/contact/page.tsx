import { Box, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const metadata = {
  title: 'Contact Us - InvMaster',
  description: 'Get in touch with InvMaster',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#070908] text-white relative overflow-hidden flex flex-col">
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

      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-20 flex-1 flex items-center">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center w-full max-w-6xl mx-auto">
            
            {/* Left Content */}
            <div>
                 <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-white tracking-tight">Let&apos;s Talk</h1>
                 <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-12">
                     Have questions about pricing, enterprise plans, or just want to say hello? Use the form below.
                 </p>
                 
                 <div className="space-y-6 sm:space-y-8">
                     <div className="flex items-start gap-4">
                         <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                             <Mail className="h-6 w-6 text-emerald-400" />
                         </div>
                         <div>
                             <h3 className="text-lg font-semibold text-white">Email</h3>
                             <p className="text-slate-400">support@invmaster.com</p>
                         </div>
                     </div>
                     
                     <div className="flex items-start gap-4">
                         <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                             <Phone className="h-6 w-6 text-emerald-400" />
                         </div>
                         <div>
                             <h3 className="text-lg font-semibold text-white">Phone</h3>
                             <p className="text-slate-400">+1 (555) 123-4567</p>
                         </div>
                     </div>

                     <div className="flex items-start gap-4">
                         <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                             <MapPin className="h-6 w-6 text-emerald-400" />
                         </div>
                         <div>
                             <h3 className="text-lg font-semibold text-white">Office</h3>
                             <p className="text-slate-400">
                                 123 Innovation Drive<br/>
                                 Tech City, TC 94043
                             </p>
                         </div>
                     </div>
                 </div>
            </div>

            {/* Right Form */}
            <div className="bg-[#111613] border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-sm shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
                <form className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-slate-300">Name</Label>
                        <Input id="name" placeholder="John Doe" className="bg-black/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-slate-300">Email</Label>
                        <Input id="email" type="email" placeholder="john@company.com" className="bg-black/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message" className="text-slate-300">Message</Label>
                        <textarea 
                            id="message" 
                            rows={4} 
                            placeholder="How can we help?" 
                            className="flex min-h-[80px] w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-emerald-500/50 focus-visible:ring-1 focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold h-11 rounded-xl shadow-sm transition-all">Send Message</Button>
                </form>
            </div>
        </div>
      </div>
    </div>
  )
}
