import { AppLayout } from '@/components/layout/AppLayout'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user has an organization
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    const headersList = await headers()
    const pathname = headersList.get('x-current-path') || ''

    // If no org and not already on onboarding page, redirect to onboarding
    if (!profile?.organization_id && !pathname.includes('/onboarding')) {
        redirect('/onboarding')
    }

    return (
        <AppLayout>{children}</AppLayout>
    )
}
