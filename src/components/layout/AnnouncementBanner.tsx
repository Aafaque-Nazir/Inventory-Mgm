'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Info, Megaphone, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Announcement = {
    id: string
    message: string
    type: 'INFO' | 'WARNING' | 'CRITICAL'
}

export function AnnouncementBanner() {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null)
    const [visible, setVisible] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchAnnouncement = async () => {
            const { data } = await supabase
                .from('system_announcements')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (data) setAnnouncement(data)
        }
        fetchAnnouncement()

        // Realtime subscription
        const channel = supabase
            .channel('public:system_announcements')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'system_announcements' }, () => {
                fetchAnnouncement()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    if (!announcement || !visible) return null

    const styles = {
        INFO: 'bg-blue-600 text-white',
        WARNING: 'bg-amber-500 text-white',
        CRITICAL: 'bg-red-600 text-white'
    }

    const icons = {
        INFO: <Info className="h-4 w-4" />,
        WARNING: <Megaphone className="h-4 w-4" />,
        CRITICAL: <AlertCircle className="h-4 w-4" />
    }

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4 pointer-events-none">
            <div className={`
                pointer-events-auto flex items-center justify-between gap-4 p-2 pl-4 rounded-full shadow-2xl border border-white/10 backdrop-blur-md
                transition-all duration-500 ease-in-out transform hover:scale-[1.02]
                ${styles[announcement.type]} bg-opacity-90 dark:bg-opacity-90
            `}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 shadow-inner">
                        {icons[announcement.type]}
                    </span>
                    <p className="text-sm font-medium truncate">
                        {announcement.message}
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setVisible(false)}
                        className="h-8 w-8 rounded-full hover:bg-black/20 text-white transition-colors"
                    >
                        <span className="sr-only">Dismiss</span>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
