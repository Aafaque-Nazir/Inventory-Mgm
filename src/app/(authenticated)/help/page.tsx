'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { submitSupportTicket } from '@/app/actions/support'
import { Loader2, Send } from 'lucide-react'
import { UserTickets } from '@/components/support/UserTickets'

export default function HelpPage() {
    const [isPending, startTransition] = useTransition()

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        startTransition(async () => {
            const result = await submitSupportTicket({}, formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(result.message)
                    // specific reset or reload
                    ; (event.target as HTMLFormElement).reset()
            }
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
                <p className="text-muted-foreground">
                    Get help with the application or report issues.
                </p>
            </div>

            <Tabs defaultValue="report" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="report">Report a Bug</TabsTrigger>
                    <TabsTrigger value="feature">Feature Request</TabsTrigger>
                    <TabsTrigger value="contact">Contact Support</TabsTrigger>
                    <TabsTrigger value="history">My Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="report" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Report a Bug</CardTitle>
                            <CardDescription>
                                Found something broken? Let us know and we'll fix it.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmit} className="space-y-4">
                                <input type="hidden" name="type" value="BUG" />
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" name="subject" placeholder="e.g., Error when adding stock" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Description</Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        placeholder="Please describe what happened..."
                                        className="min-h-[150px]"
                                        required
                                    />
                                </div>
                                <Button disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Send className="mr-2 h-4 w-4" /> Submit Report
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="feature" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Request a Feature</CardTitle>
                            <CardDescription>
                                Have an idea to make the app better? We'd love to hear it.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmit} className="space-y-4">
                                <input type="hidden" name="type" value="FEATURE_REQUEST" />
                                <div className="space-y-2">
                                    <Label htmlFor="feat-subject">Feature Name</Label>
                                    <Input id="feat-subject" name="subject" placeholder="e.g., Mobile App" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="feat-message">Details</Label>
                                    <Textarea
                                        id="feat-message"
                                        name="message"
                                        placeholder="Describe the feature and why it would be useful..."
                                        className="min-h-[150px]"
                                        required
                                    />
                                </div>
                                <Button disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Send className="mr-2 h-4 w-4" /> Submit Request
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Inquiry</CardTitle>
                            <CardDescription>
                                Need help with your account or billing?
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmit} className="space-y-4">
                                <input type="hidden" name="type" value="GENERAL" />
                                <div className="space-y-2">
                                    <Label htmlFor="contact-subject">Topic</Label>
                                    <Input id="contact-subject" name="subject" placeholder="e.g., Billing Question" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact-message">Message</Label>
                                    <Textarea
                                        id="contact-message"
                                        name="message"
                                        placeholder="How can we help you?"
                                        className="min-h-[150px]"
                                        required
                                    />
                                </div>
                                <Button disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Send className="mr-2 h-4 w-4" /> Send Message
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <UserTickets />
                </TabsContent>
            </Tabs>
        </div >
    )
}
