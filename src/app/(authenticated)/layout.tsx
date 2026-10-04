import { AppLayout } from '@/components/layout/AppLayout'
import { getCurrentUser, getCurrentProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user has an organization
    const profile = await getCurrentProfile()

    const headersList = await headers()
    const pathname = headersList.get('x-current-path') || ''

    // If no org and not already on onboarding page, redirect to onboarding
    if (!profile?.organization_id && !pathname.includes('/onboarding')) {
        redirect('/onboarding')
    }

    return (
        <AppLayout initialProfile={profile} initialEmail={user.email || null}>
            {children}
        </AppLayout>
    )
}
