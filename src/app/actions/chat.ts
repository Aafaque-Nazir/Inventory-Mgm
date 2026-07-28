'use server'

import { createClient } from '@/lib/supabase/server'

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    created_at: string
}

/**
 * Fetch the last 50 chat messages for the current user.
 * Returns messages in chronological order (oldest first).
 */
export async function getChatHistory(): Promise<ChatMessage[]> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Failed to fetch chat history:', error)
        return []
    }

    // Reverse to get chronological order (oldest first)
    return (data || []).reverse()
}

/**
 * Clear all chat messages for the current user.
 */
export async function clearChatHistory(): Promise<{ error?: string }> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id)

    if (error) {
        console.error('Failed to clear chat history:', error)
        return { error: 'Failed to clear chat history' }
    }

    return {}
}
