'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const onboardingSchema = z.object({
    orgName: z.string().min(3, "Business name must be at least 3 characters"),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
})

export async function createOrganization(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const orgName = formData.get('orgName') as string
    // Auto-generate slug from name if not provided (simple version)
    const rawSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const slug = rawSlug + '-' + Math.floor(Math.random() * 1000) // Ensure uniqueness roughly

    const validatedFields = onboardingSchema.safeParse({
        orgName,
        slug,
    })

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message }
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        // 1. Create Organization
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name: validatedFields.data.orgName,
                slug: validatedFields.data.slug,
                plan_type: 'FREE', // Default to Free
                max_users: 1,
                max_items: 50,
                created_by: user.id
            })
            .select()
            .single()

        if (orgError) throw orgError

        // 2. Update User Profile with Org ID and Role
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                organization_id: org.id,
                role: 'ADMIN', // Creator is always Admin
                full_name: user.user_metadata.full_name || 'Admin',
                is_super_admin: false
            })

        if (profileError) throw profileError

        // 3. Revalidate and Redirect
        revalidatePath('/')

    } catch (error: any) {
        console.error('Onboarding Error:', error)
        return { error: error.message || 'Failed to create organization' }
    }

    // Redirect must happen outside try/catch in Server Actions
    redirect('/dashboard')
}
