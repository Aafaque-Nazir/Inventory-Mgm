'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'
import { Profile } from '@/types'
import { differenceInDays } from 'date-fns'
import { isProPlan, extractOrg } from '@/lib/subscription'

export interface UserContextType {
    profile: (Profile & { [key: string]: any }) | null
    email: string | null
    isSuperAdmin: boolean
    isPro: boolean
    planType: string
    trialDays: number | null
    setProfile: React.Dispatch<React.SetStateAction<(Profile & { [key: string]: any }) | null>>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
    children: React.ReactNode
    initialProfile: (Profile & { [key: string]: any }) | null
    initialEmail: string | null
}

export function UserProvider({ children, initialProfile, initialEmail }: UserProviderProps) {
    const [profile, setProfile] = useState<(Profile & { [key: string]: any }) | null>(initialProfile)

    const derived = useMemo(() => {
        const isSuperAdmin = Boolean(profile?.is_super_admin)
        const org = extractOrg(profile)
        const pro = isProPlan(org, isSuperAdmin)

        const effectivePlan = pro ? (org?.plan_type || 'PRO') : 'FREE'
        let calculatedTrialDays: number | null = null

        if (org?.subscription_end_date && org.subscription_status === 'TRIALING') {
            const expiry = new Date(org.subscription_end_date)
            if (!isNaN(expiry.getTime())) {
                const days = differenceInDays(expiry, new Date())
                calculatedTrialDays = days >= 0 ? days + 1 : 0
            }
        }

        return {
            isSuperAdmin,
            isPro: pro,
            planType: effectivePlan,
            trialDays: calculatedTrialDays,
        }
    }, [profile])

    return (
        <UserContext.Provider
            value={{
                profile,
                email: initialEmail,
                isSuperAdmin: derived.isSuperAdmin,
                isPro: derived.isPro,
                planType: derived.planType,
                trialDays: derived.trialDays,
                setProfile,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
