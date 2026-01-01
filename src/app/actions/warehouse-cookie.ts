'use server'

import { cookies } from 'next/headers'

export async function setWarehouseCookie(locationId: string) {
    (await cookies()).set('warehouse_id', locationId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    })
}

export async function getWarehouseCookie() {
    return (await cookies()).get('warehouse_id')?.value
}
