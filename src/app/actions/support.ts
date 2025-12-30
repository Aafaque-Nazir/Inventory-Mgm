'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ticketSchema = z.object({
    type: z.enum(['BUG', 'FEATURE_REQUEST', 'GENERAL', 'OTHER']),
    subject: z.string().min(3),
    message: z.string().min(10),
})

export async function submitSupportTicket(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const type = formData.get('type')
    const subject = formData.get('subject')
    const message = formData.get('message')

    const validatedFields = ticketSchema.safeParse({
        type,
        subject,
        message,
    })

    if (!validatedFields.success) {
        return { error: 'Invalid fields: ' + validatedFields.error.issues[0].message }
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

        const { error } = await supabase.from('support_tickets').insert({
            user_id: user.id,
            organization_id: profile?.organization_id,
            type: validatedFields.data.type,
            subject: validatedFields.data.subject,
            message: validatedFields.data.message,
        })

        if (error) throw error

        return { message: 'Ticket submitted successfully!' }
    } catch (error: any) {
        console.error('Ticket submission error:', error)
        return { error: 'Failed to submit ticket. Please try again.' }
    }
}
