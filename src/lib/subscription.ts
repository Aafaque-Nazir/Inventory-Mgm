export interface OrgSubscriptionInfo {
    plan_type?: string | null
    subscription_status?: string | null
    subscription_end_date?: string | null
    max_users?: number | null
    max_items?: number | null
}

/**
 * Robust check if an organization (or super admin) has an active PRO or higher plan.
 * Handles:
 * - Super Admins (always true)
 * - ENTERPRISE plan (always true)
 * - PRO plan with ACTIVE status (true if no end_date or end_date > now)
 * - PRO plan with TRIALING status (true if end_date > now)
 * - Expired or Cancelled plans (false)
 * - Free plans (false)
 */
export function isProPlan(
    org?: OrgSubscriptionInfo | null,
    isSuperAdmin?: boolean
): boolean {
    if (isSuperAdmin) return true
    if (!org) return false

    const plan = (org.plan_type || '').toUpperCase()
    if (plan === 'ENTERPRISE') return true

    if (plan === 'PRO') {
        const status = (org.subscription_status || 'ACTIVE').toUpperCase()
        if (status === 'EXPIRED' || status === 'CANCELLED') {
            return false
        }

        // If there's an explicit expiry date, check it
        if (org.subscription_end_date) {
            const expiry = new Date(org.subscription_end_date)
            if (!isNaN(expiry.getTime())) {
                return expiry > new Date()
            }
        }

        // If status is ACTIVE/TRIALING and no expiry is set, treat as active
        return status === 'ACTIVE' || status === 'TRIALING'
    }

    return false
}

/**
 * Safely extracts organization information from a profile query result
 * regardless of whether PostgREST returns 'organization' or 'organizations' (object or array).
 */
export function extractOrg(profile: any): OrgSubscriptionInfo | null {
    if (!profile) return null
    if (profile.organization && typeof profile.organization === 'object') {
        return profile.organization
    }
    if (profile.organizations) {
        if (Array.isArray(profile.organizations)) {
            return profile.organizations[0] || null
        }
        if (typeof profile.organizations === 'object') {
            return profile.organizations
        }
    }
    return null
}
