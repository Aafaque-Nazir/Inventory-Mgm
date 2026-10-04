import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/**
 * Deduplicated retrieval of the current authenticated user within a single request cycle.
 * Leverages React.cache so multiple calls across layout, pages, and actions do not re-query Supabase.
 */
export const getCurrentUser = cache(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
})

/**
 * Deduplicated retrieval of the current user profile & organization within a single request cycle.
 */
export const getCurrentProfile = cache(async () => {
    const user = await getCurrentUser()
    if (!user) return null

    const supabase = await createClient()
    const { data: profile } = await supabase
        .from('profiles')
        .select('*, organization:organizations(*)')
        .eq('id', user.id)
        .single()

    return profile
})
