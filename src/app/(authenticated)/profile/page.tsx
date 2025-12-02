import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        return <div>Profile not found</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <ProfileForm profile={profile} email={user.email || null} />
        </div>
    )
}
