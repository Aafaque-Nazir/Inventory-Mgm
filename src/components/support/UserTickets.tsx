'use client'

import { useEffect, useState } from 'react'
import { getUserTickets } from '@/app/actions/support'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type Ticket = {
    id: string
    subject: string
    message: string
    status: string
    created_at: string
    type: string
}

export function UserTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetch() {
            const res = await getUserTickets()
            if (res.data) {
                setTickets(res.data as Ticket[])
            }
            setLoading(false)
        }
        fetch()
    }, [])

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
    }

    const statusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
            case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
            case 'RESOLVED': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
            case 'CLOSED': return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
            default: return 'bg-secondary text-secondary-foreground'
        }
    }

    const typeIcon = (type: string) => {
        switch (type) {
            case 'BUG': return <AlertCircle className="h-4 w-4 text-red-500" />
            case 'FEATURE_REQUEST': return <MessageSquare className="h-4 w-4 text-purple-500" />
            default: return <MessageSquare className="h-4 w-4 text-blue-500" />
        }
    }

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle>My Ticket History</CardTitle>
                <CardDescription>
                    Track the status of your support requests.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full px-6 pb-6">
                    <div className="space-y-4">
                        {tickets.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground space-y-2">
                                <MessageSquare className="h-10 w-10 mx-auto opacity-20" />
                                <p>No tickets found.</p>
                                <p className="text-sm">Submit one if you need help!</p>
                            </div>
                        ) : tickets.map((ticket) => (
                            <div key={ticket.id} className="flex flex-col gap-2 rounded-lg border p-4 shadow-sm hover:bg-muted/50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {typeIcon(ticket.type)}
                                            <span className="font-semibold text-sm">{ticket.subject}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1 pl-6">
                                            {ticket.message}
                                        </p>
                                    </div>
                                    <Badge className={statusColor(ticket.status)}>
                                        {ticket.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground pl-6 pt-2">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                                    </div>
                                    {/* Placeholder for future activity/update time */}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
