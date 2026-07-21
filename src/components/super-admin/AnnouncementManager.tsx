'use client'

import { useState, useTransition, useEffect } from 'react'
import { getAnnouncements, createAnnouncement, toggleAnnouncement, deleteAnnouncement } from '@/app/(authenticated)/super-admin/actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Megaphone, Trash2, BellRing } from 'lucide-react'
import { toast } from 'sonner'

type Announcement = {
    id: string
    message: string
    type: 'INFO' | 'WARNING' | 'CRITICAL'
    is_active: boolean
    created_at: string
}

export function AnnouncementManager() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [type, setType] = useState<'INFO' | 'WARNING' | 'CRITICAL'>('INFO')
    const [isPending, startTransition] = useTransition()

    const fetchAnnouncements = async () => {
        setLoading(true)
        const res = await getAnnouncements()
        if (res.data) setAnnouncements(res.data as Announcement[])
        setLoading(false)
    }

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    const handleCreate = () => {
        if (!message) return

        startTransition(async () => {
            const res = await createAnnouncement(message, type)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success('Announcement broadcasted')
                setMessage('')
                fetchAnnouncements()
            }
        })
    }

    const handleToggle = (id: string, current: boolean) => {
        startTransition(async () => {
            await toggleAnnouncement(id, !current)
            fetchAnnouncements()
        })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to cease this broadcast?')) return
        await deleteAnnouncement(id)
        toast.success('Broadcast destroyed')
        fetchAnnouncements()
    }

    return (
        <div className="space-y-10">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Global Announcements</h2>
                    <p className="text-sm text-slate-400">Broadcast mission-critical messages to all organization terminals.</p>
                </div>
                <div className="p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0 hidden sm:block">
                    <Megaphone className="h-6 w-6" />
                </div>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden group">
                <div className="p-8 border-b border-white/5 bg-white/5">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <BellRing className="h-5 w-5 text-indigo-400" />
                        New System Broadcast
                    </h3>
                    <div className="flex flex-col lg:flex-row gap-5">
                        <div className="w-full lg:w-[200px]">
                            <Select value={type} onValueChange={(v: any) => setType(v)}>
                                <SelectTrigger className="h-12 bg-black/40 border-white/10 text-white rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                                    <SelectItem value="INFO" className="text-blue-400">Standard Info</SelectItem>
                                    <SelectItem value="WARNING" className="text-amber-400">Warning Alert</SelectItem>
                                    <SelectItem value="CRITICAL" className="text-rose-400 font-bold">Critical Alert</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 relative">
                            <Input
                                placeholder="Enter broadcast payload..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-xl"
                            />
                        </div>
                        <Button
                            onClick={handleCreate}
                            disabled={isPending || !message}
                            className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Megaphone className="h-5 w-5" />}
                            Transmit
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Active Transmissions</h3>
                {announcements.length === 0 && !loading ? (
                    <div className="text-center py-20 rounded-3xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-white/5 border border-white/5 opacity-10">
                            <Megaphone className="h-10 w-10 text-white" />
                        </div>
                        <p className="text-slate-500 font-medium italic">Silence on the airwaves...</p>
                    </div>
                ) : (
                    announcements.map((item) => (
                        <div key={item.id} className={`rounded-2xl border transition-all duration-300 group relative overflow-hidden backdrop-blur-sm ${item.is_active ? 'bg-white/5 border-white/10 shadow-xl' : 'bg-black/20 border-white/5 opacity-60'
                            }`}>
                            <div className={`absolute top-0 left-0 w-1 h-full ${item.type === 'CRITICAL' ? 'bg-rose-500' :
                                item.type === 'WARNING' ? 'bg-amber-500' :
                                    'bg-indigo-500'
                                }`} />
                            <div className="flex flex-col sm:flex-row items-start sm:items-center p-5 sm:p-6 gap-4 sm:gap-6">
                                <div className={`p-3 rounded-2xl shrink-0 ${item.type === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                    item.type === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                        'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                    }`}>
                                    <Megaphone className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0 w-full text-left">
                                    <p className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight mb-1">{item.message}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                        <span className="uppercase tracking-widest">{item.type}</span>
                                        <span className="opacity-20">•</span>
                                        <span>{new Date(item.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-white/5 sm:pl-6">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${item.is_active ? 'text-emerald-400' : 'text-slate-600'}`}>
                                            {item.is_active ? 'Online' : 'Offline'}
                                        </span>
                                        <Switch
                                            checked={item.is_active}
                                            onCheckedChange={() => handleToggle(item.id, item.is_active)}
                                            className="data-[state=checked]:bg-emerald-500"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(item.id)}
                                        className="h-10 w-10 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all active:scale-90 shrink-0"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
