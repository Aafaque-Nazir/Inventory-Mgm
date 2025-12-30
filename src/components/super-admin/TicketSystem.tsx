'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { getAdminTickets, updateTicketStatus } from '@/app/(authenticated)/super-admin/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'

type Ticket = {
    id: string
    type: string
    subject: string
    message: string
    status: string
    created_at: string
    profiles: { full_name: string } | null
    organizations: { name: string } | null
}

export function TicketSystem() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('ALL')
    const [isPending, startTransition] = useTransition()

    const fetchTickets = useCallback(async () => {
        setLoading(true)
        const result = await getAdminTickets(filter === 'ALL' ? undefined : filter)
        if (result.error) {
            toast.error(result.error)
        } else {
            setTickets(result.data as Ticket[])
        }
        setLoading(false)
    }, [filter])

    useEffect(() => {
        fetchTickets()
    }, [fetchTickets])

    const handleStatusUpdate = (id: string, newStatus: string) => {
        startTransition(async () => {
            const res = await updateTicketStatus(id, newStatus)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(`Ticket marked as ${newStatus}`)
                fetchTickets() // Refresh list
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Support Tickets</h2>
                    <p className="text-sm text-muted-foreground">Manage incoming support requests.</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchTickets} disabled={loading}>
                    <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tickets.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-500">Open</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'OPEN').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-500">Resolved</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'RESOLVED').length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : tickets.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">No tickets found.</div>
                ) : (
                    tickets.map((ticket) => (
                        <Card key={ticket.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-3">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={ticket.type === 'BUG' ? 'destructive' : 'secondary'}>
                                                {ticket.type}
                                            </Badge>
                                            <span className="font-semibold text-lg">{ticket.subject}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            by <span className="font-medium text-foreground">{ticket.profiles?.full_name || 'Unknown'}</span>
                                            {' '} from <span className="font-medium text-foreground">{ticket.organizations?.name || 'Unknown Org'}</span>
                                            {' • '} {new Date(ticket.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={
                                            ticket.status === 'OPEN' ? 'outline' :
                                                ticket.status === 'IN_PROGRESS' ? 'default' :
                                                    'outline'
                                        } className={
                                            ticket.status === 'OPEN' ? 'text-orange-500 border-orange-500/20 bg-orange-500/10' :
                                                ticket.status === 'RESOLVED' ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''
                                        }>
                                            {ticket.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="bg-muted/50 p-4 rounded-md text-sm whitespace-pre-wrap font-mono text-muted-foreground border">
                                    {ticket.message}
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Select
                                        defaultValue={ticket.status}
                                        onValueChange={(val) => handleStatusUpdate(ticket.id, val)}
                                        disabled={isPending}
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OPEN">Mark Open</SelectItem>
                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                                            <SelectItem value="CLOSED">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
