import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendLowStockAlert(
    email: string,
    itemName: string,
    currentStock: number,
    minStock: number,
    organizationName: string
) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email alert.')
        return
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'InvMaster Alerts <onboarding@resend.dev>', // Default Resend test domain
            to: [email],
            subject: `⚠️ Low Stock Alert: ${itemName}`,
            html: `
        <h1>Low Stock Warning</h1>
        <p><strong>Item:</strong> ${itemName}</p>
        <p><strong>Current Stock:</strong> <span style="color: red; font-weight: bold;">${currentStock}</span></p>
        <p><strong>Minimum Threshold:</strong> ${minStock}</p>
        <p><strong>Organization:</strong> ${organizationName}</p>
        <hr />
        <p>Please reorder this item soon to avoid stockouts.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Go to Dashboard</a>
      `,
        })

        if (error) {
            console.error('Resend error:', error)
            return { success: false, error }
        } else {
            console.log('Low stock alert sent:', data)
            return { success: true }
        }
    } catch (err) {
        console.error('Failed to send email alert:', err)
        return { success: false, error: err }
    }
}
