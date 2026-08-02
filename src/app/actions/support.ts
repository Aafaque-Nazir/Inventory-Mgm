'use server'

import { createClient } from '@/lib/supabase/server'
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

        // Send email notification to Admin
        try {
            const { Resend } = await import('resend')
            const resend = new Resend(process.env.RESEND_API_KEY)

            await resend.emails.send({
                from: 'InvMaster Support <onboarding@resend.dev>',
                to: 'aafaquebuisness@gmail.com',
                subject: `New Support Ticket: ${validatedFields.data.subject}`,
                html: `
                    <h1>New Ticket from ${user.email}</h1>
                    <p><strong>Type:</strong> ${validatedFields.data.type}</p>
                    <p><strong>Subject:</strong> ${validatedFields.data.subject}</p>
                    <p><strong>Message:</strong></p>
                    <blockquote style="border-left: 4px solid #ccc; padding-left: 10px;">
                        ${validatedFields.data.message}
                    </blockquote>
                    <p>Organization ID: ${profile?.organization_id}</p>
                `
            })
        } catch (emailError: any) {
            console.error('Failed to send support email:', emailError)
            // Don't fail the request if email fails, just log it
        }

        return { message: 'Ticket submitted successfully!' }
    } catch (error: any) {
        console.error('Ticket submission error:', error)
        return { error: 'Failed to submit ticket. Please try again.' }
    }

}


export async function getUserTickets() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Fetch tickets error:', error)
        return { error: 'Failed to fetch tickets' }
    }

    return { data: tickets }
}
