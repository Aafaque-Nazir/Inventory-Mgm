'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Resend } from 'resend'

const inviteSchema = z.object({
    email: z.string().email(),
    role: z.enum(['STOREKEEPER', 'MANAGER', 'ADMIN']),
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function inviteMember(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const role = formData.get('role') as 'STOREKEEPER' | 'MANAGER' | 'ADMIN'

    const validatedFields = inviteSchema.safeParse({ email, role })

    if (!validatedFields.success) {
        return { error: 'Invalid email or role' }
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        // 1. Check Admin Privileges
        const { data: profile } = await supabase
            .from('profiles')
            .select('*, organizations(plan_type, max_users)')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'ADMIN' && !profile?.is_super_admin) {
            return { error: 'Only Admins can invite members' }
        }

        const orgId = profile.organization_id
        const plan = profile.organizations?.plan_type || 'FREE'
        const maxUsers = profile.organizations?.max_users || 1

        // 2. Check User Limit
        // Count existing active profiles + pending invitations
        const { count: usersCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)

        const { count: invitesCount } = await supabase
            .from('invitations')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('status', 'PENDING')

        const totalUsers = (usersCount || 0) + (invitesCount || 0)

        if (totalUsers >= maxUsers) {
            // Special message for Free plan
            if (plan === 'FREE') {
                return { error: `Free Plan is limited to 1 user. Upgrade to Pro to invite your team.` }
            }
            return { error: `User limit reached (${maxUsers} users). Upgrade your plan.` }
        }

        // 3. Create Invitation
        const token = crypto.randomUUID()
        const { error: inviteError } = await supabase.from('invitations').insert({
            organization_id: orgId,
            email,
            role,
            token,
            invited_by: user.id
        })

        if (inviteError) {
            if (inviteError.code === '23505') return { error: 'This user is already invited' }
            throw inviteError
        }

        // 4. Send Email (Mock for now if Key missing, but code ready)
        if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
                from: 'InvMaster <onboarding@resend.dev>',
                to: email,
                subject: 'You have been invited to join an organization',
                html: `<p>You have been invited to join <strong>Inventory App</strong>. <a href="${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${token}">Click here to join</a></p>`
            })
        } else {
            // Email skipped — no API key configured
        }

        revalidatePath('/settings')
        return { message: 'Invitation sent successfully' }

    } catch (error: any) {
        console.error('Invite Error:', error)
        return { error: error.message || 'Failed to invite user' }
    }
}

export async function removeMember(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const userId = formData.get('userId') as string

    // Security: Only Admin of same org can remove
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('organization_id, role')
            .eq('id', user.id)
            .single()

        if (adminProfile?.role !== 'ADMIN') return { error: 'Unauthorized' }

        // Remove org_id from target user
        const { error } = await supabase
            .from('profiles')
            .update({ organization_id: null }) // Make them orphan
            .eq('id', userId)
            .eq('organization_id', adminProfile.organization_id) // Ensure same org

        if (error) throw error

        revalidatePath('/settings')
        return { message: 'Member removed' }

    } catch (error: any) {
        return { error: error.message }
    }
}

export async function cancelInvitation(formData: FormData) {
    const supabase = await createClient()
    const inviteId = formData.get('inviteId') as string

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('organization_id, role')
            .eq('id', user.id)
            .single()

        if (adminProfile?.role !== 'ADMIN') return { error: 'Unauthorized' }

        const { error } = await supabase
            .from('invitations')
            .delete()
            .eq('id', inviteId)
            .eq('organization_id', adminProfile.organization_id)

        if (error) throw error

        revalidatePath('/settings')
        return { message: 'Invitation cancelled' }
    } catch (_error: any) {
        return { error: 'Failed to cancel invitation' }
    }
}
