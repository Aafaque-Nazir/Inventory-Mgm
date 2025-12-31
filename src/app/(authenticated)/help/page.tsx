'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Send, Mail } from 'lucide-react'
import { useForm, ValidationError } from '@formspree/react';

export default function HelpPage() {
    const [state, handleSubmit] = useForm("xdaknaew");

    if (state.succeeded) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 text-center">
                <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600">
                    <Send className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Message Sent!</h2>
                <p className="text-muted-foreground max-w-md">
                    Thanks for reaching out. We have received your message and will get back to you shortly at <strong>aafaquebuisness@gmail.com</strong>.
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>Send Another Message</Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 p-4">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
                <p className="text-muted-foreground">
                    Have a question or facing an issue? Send us a message directly.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>
                        Fill out the form below or email us at <a href="mailto:aafaquebuisness@gmail.com" className="text-primary hover:underline">aafaquebuisness@gmail.com</a>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Your Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                required
                            />
                            <ValidationError
                                prefix="Email"
                                field="email"
                                errors={state.errors}
                                className="text-sm text-red-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                name="subject"
                                placeholder="What is this regarding?"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                name="message"
                                placeholder="How can we help you?"
                                className="min-h-[150px]"
                                required
                            />
                            <ValidationError
                                prefix="Message"
                                field="message"
                                errors={state.errors}
                                className="text-sm text-red-500"
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={state.submitting}>
                            <Send className="mr-2 h-4 w-4" />
                            {state.submitting ? 'Sending...' : 'Send Message'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground">
                <p>or</p>
                <a
                    href="mailto:aafaquebuisness@gmail.com"
                    className="inline-flex items-center mt-2 text-primary hover:underline"
                >
                    <Mail className="mr-2 h-4 w-4" />
                    Open in Email Client
                </a>
            </div>
        </div>
    )
}
