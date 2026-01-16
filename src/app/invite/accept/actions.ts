'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function acceptInvitation(formData: FormData) {
    const token = formData.get('token') as string
    const supabase = await createClient()
    
    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Validate Token & Get Invite
    const { data: invite, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single()

    if (error || !invite) {
        throw new Error('Invalid invitation')
    }

    // 3. Update Profile
    // We update the existing profile to link to the new organization
    // Note: If they already belong to an org, this will OVERWRITE it.
    // In a multi-tenant system where user can belong to ONE org at a time, this is simple.
    // If they can belong to multiple, we need a many-to-many table. 
    // Based on schema 'profiles.organization_id', it's one-to-many (User belongs to one Org).
    
    // Check if user is already in an org?
    // Ideally, we warn them, but for now we assume accepting an invite switches them.
    
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            organization_id: invite.organization_id,
            role: invite.role
        })
        .eq('id', user.id)

    if (updateError) {
        console.error('Profile Update Error:', updateError)
        throw new Error('Failed to update profile')
    }

    // 4. Delete Invitation
    await supabase
        .from('invitations')
        .delete()
        .eq('token', token)

    // 5. Redirect
    redirect('/dashboard')
}
