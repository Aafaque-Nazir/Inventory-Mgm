'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Send, Mail } from 'lucide-react'
import { useForm, ValidationError } from '@formspree/react';

export default function HelpPage() {
    const [state, handleSubmit] = useForm("xdaknaew");

    if (state.succeeded) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="p-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/20 text-emerald-400">
                    <Send className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold text-white">Message Sent!</h2>
                <p className="text-slate-400 max-w-md text-lg">
                    Thanks for reaching out. We have received your message and will get back to you shortly at <strong className="text-emerald-400">aafaquebuisness@gmail.com</strong>.
                </p>
                <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                >
                    Send Another Message
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 p-4">
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">Help & Support</h1>
                <p className="text-slate-400 text-lg">
                    Have a question or facing an issue? Send us a message directly.
                </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl p-8">
                <div className="mb-8 border-b border-white/5 pb-6">
                    <h2 className="text-2xl font-semibold text-white mb-2">Contact Support</h2>
                    <p className="text-slate-400">
                        Fill out the form below or email us at <a href="mailto:aafaquebuisness@gmail.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">aafaquebuisness@gmail.com</a>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">Your Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            required
                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 h-12"
                        />
                        <ValidationError
                            prefix="Email"
                            field="email"
                            errors={state.errors}
                            className="text-sm text-red-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-slate-300">Subject</Label>
                        <Input
                            id="subject"
                            name="subject"
                            placeholder="What is this regarding?"
                            required
                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-slate-300">Message</Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="How can we help you?"
                            className="min-h-[150px] bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 resize-y"
                            required
                        />
                        <ValidationError
                            prefix="Message"
                            field="message"
                            errors={state.errors}
                            className="text-sm text-red-400"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold h-12 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300"
                        disabled={state.submitting}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        {state.submitting ? 'Sending...' : 'Send Message'}
                    </Button>
                </form>
            </div>

            <div className="text-center text-sm text-slate-500">
                <p>or</p>
                <a
                    href="mailto:aafaquebuisness@gmail.com"
                    className="inline-flex items-center mt-3 text-indigo-400 hover:text-indigo-300 transition-colors px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5"
                >
                    <Mail className="mr-2 h-4 w-4" />
                    Open in Email Client
                </a>
            </div>
        </div>
    )
}
