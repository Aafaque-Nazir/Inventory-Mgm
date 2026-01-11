'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { getAdminTickets, updateTicketStatus } from '@/app/(authenticated)/super-admin/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CheckCircle2, AlertCircle, RefreshCcw, TrendingUp } from 'lucide-react'
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
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Support Tickets</h2>
                    <p className="text-sm text-slate-400">Manage incoming support requests and system bugs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white rounded-xl h-10">
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchTickets}
                        disabled={loading}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl h-10 px-4"
                    >
                        <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <TrendingUp className="h-16 w-16" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Tickets</p>
                    <div className="text-3xl font-bold text-white">{tickets.length}</div>
                </div>
                <div className="p-6 rounded-3xl bg-orange-500/5 border border-orange-500/10 backdrop-blur-sm shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity">
                        <AlertCircle className="h-16 w-16 text-orange-500" />
                    </div>
                    <p className="text-sm font-medium text-orange-500/70 mb-1">Open</p>
                    <div className="text-3xl font-bold text-white">{tickets.filter(t => t.status === 'OPEN').length}</div>
                </div>
                <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-sm shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity">
                        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-emerald-500/70 mb-1">Resolved</p>
                    <div className="text-3xl font-bold text-white">{tickets.filter(t => t.status === 'RESOLVED').length}</div>
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 text-slate-500 animate-pulse">
                        <Loader2 className="h-10 w-10 animate-spin mb-4" />
                        <p>Loading support cases...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center p-20 rounded-3xl border border-dashed border-white/10 bg-white/5">
                        <p className="text-slate-500">No tickets found for current filters.</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <div key={ticket.id} className="rounded-3xl border border-white/5 bg-white/5 overflow-hidden hover:bg-white/[0.07] transition-all duration-300 group">
                            <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border-none ${ticket.type === 'BUG' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'
                                            }`}>
                                            {ticket.type}
                                        </Badge>
                                        <h4 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">{ticket.subject}</h4>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 border border-white/5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            <span className="font-medium text-slate-200">{ticket.profiles?.full_name || 'Unknown'}</span>
                                        </div>
                                        <span className="opacity-30">•</span>
                                        <span className="font-medium text-slate-500">{ticket.organizations?.name || 'Unknown Org'}</span>
                                        <span className="opacity-30">•</span>
                                        <span className="text-slate-500">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={`rounded-full px-4 py-1.5 shadow-lg border-none ${ticket.status === 'OPEN' ? 'bg-orange-500/10 text-orange-400 shadow-orange-500/10' :
                                        ticket.status === 'IN_PROGRESS' ? 'bg-indigo-500 text-white shadow-indigo-500/20' :
                                            'bg-emerald-500/10 text-emerald-400 shadow-emerald-500/10'
                                        }`}>
                                        {ticket.status}
                                    </Badge>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="bg-black/30 p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap font-mono text-slate-300 border border-white/5 mb-6">
                                    {ticket.message}
                                </div>
                                <div className="flex justify-end items-center gap-4">
                                    <span className="text-xs text-slate-500 font-medium italic">Update status to:</span>
                                    <Select
                                        defaultValue={ticket.status}
                                        onValueChange={(val) => handleStatusUpdate(ticket.id, val)}
                                        disabled={isPending}
                                    >
                                        <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white rounded-xl h-10 shadow-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                                            <SelectItem value="OPEN">Mark Open</SelectItem>
                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                                            <SelectItem value="CLOSED">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
