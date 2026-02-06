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
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
       <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Box className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">InvMaster</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20 flex-1 flex items-center">
        <div className="grid lg:grid-cols-2 gap-20 items-center w-full max-w-6xl mx-auto">
            
            {/* Left Content */}
            <div>
                 <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Let's Talk</h1>
                 <p className="text-xl text-slate-400 mb-12">
                     Have questions about pricing, enterprise plans, or just want to say hello? using the form below.
                 </p>
                 
                 <div className="space-y-8">
                     <div className="flex items-start gap-4">
                         <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                             <Mail className="h-6 w-6 text-blue-400" />
                         </div>
                         <div>
                             <h3 className="text-lg font-semibold text-white">Email</h3>
                             <p className="text-slate-400">support@invmaster.com</p>
                         </div>
                     </div>
                     
                     <div className="flex items-start gap-4">
                         <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                             <Phone className="h-6 w-6 text-blue-400" />
                         </div>
                         <div>
                             <h3 className="text-lg font-semibold text-white">Phone</h3>
                             <p className="text-slate-400">+1 (555) 123-4567</p>
                         </div>
                     </div>

                     <div className="flex items-start gap-4">
                         <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                             <MapPin className="h-6 w-6 text-blue-400" />
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
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                <form className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-slate-300">Name</Label>
                        <Input id="name" placeholder="John Doe" className="bg-black/40 border-white/10 text-white placeholder:text-slate-600" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-slate-300">Email</Label>
                        <Input id="email" type="email" placeholder="john@company.com" className="bg-black/40 border-white/10 text-white placeholder:text-slate-600" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message" className="text-slate-300">Message</Label>
                        <textarea 
                            id="message" 
                            rows={4} 
                            placeholder="How can we help?" 
                            className="flex min-h-[80px] w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12">Send Message</Button>
                </form>
            </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full -z-10 pointer-events-none"></div>
    </div>
  )
}
