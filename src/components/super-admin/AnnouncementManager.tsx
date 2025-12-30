'use client'

import { useState, useTransition, useEffect } from 'react'
import { getAnnouncements, createAnnouncement, toggleAnnouncement, deleteAnnouncement } from '@/app/(authenticated)/super-admin/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
        if (!confirm('Are you sure?')) return
        await deleteAnnouncement(id)
        toast.success('Deleted')
        fetchAnnouncements()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Global Announcements</h2>
                    <p className="text-sm text-muted-foreground">Broadcast messages to all users.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>New Broadcast</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="w-[150px]">
                            <Select value={type} onValueChange={(v: any) => setType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INFO">Info</SelectItem>
                                    <SelectItem value="WARNING">Warning</SelectItem>
                                    <SelectItem value="CRITICAL">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Input
                            placeholder="Type your message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="flex-1"
                        />
                        <Button onClick={handleCreate} disabled={isPending || !message}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Broadcast
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4">
                {announcements.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                        <div className="flex items-center p-4 gap-4">
                            <div className={`p-2 rounded-full ${item.type === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                                    item.type === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                                        'bg-blue-100 text-blue-600'
                                }`}>
                                <Megaphone className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{item.message}</p>
                                <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-muted-foreground">Active</span>
                                    <Switch
                                        checked={item.is_active}
                                        onCheckedChange={() => handleToggle(item.id, item.is_active)}
                                    />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
                {announcements.length === 0 && !loading && (
                    <div className="text-center py-8 text-muted-foreground">No announcements yet.</div>
                )}
            </div>
        </div>
    )
}
