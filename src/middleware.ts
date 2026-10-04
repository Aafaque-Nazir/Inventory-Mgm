import { createServerClient} from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Create a new Headers object to modify request headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-current-path', request.nextUrl.pathname)

    let response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })

    const path = request.nextUrl.pathname

    // Fast-path 1: Public informational pages & webhooks do not require auth checks
    if (
        path === '/terms' ||
        path === '/privacy' ||
        path === '/refund' ||
        path === '/contact' ||
        path.startsWith('/api/razorpay/webhook')
    ) {
        return response
    }

    // Check if any Supabase auth cookies are present
    const allCookies = request.cookies.getAll()
    const hasAuthCookie = allCookies.some(
        c => c.name.startsWith('sb-') && c.name.includes('-auth-token')
    )

    // Fast-path 2: If accessing public landing or login/signup without an auth cookie, no need to query Supabase
    if (!hasAuthCookie) {
        if (path === '/' || path.startsWith('/login') || path.startsWith('/signup') || path.startsWith('/forgot-password')) {
            return response
        }
        if (path.startsWith('/dashboard') || path.startsWith('/super-admin')) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options: _options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Auth protection for dashboard and super-admin
    if (!user && (path.startsWith('/dashboard') || path.startsWith('/super-admin'))) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Enforce super-admin role for /super-admin routes
    if (user && path.startsWith('/super-admin')) {
        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('is_super_admin')
            .eq('id', user.id)
            .single()

        if (!adminProfile?.is_super_admin) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // Redirect logged-in users away from login page
    if (user && path.startsWith('/login')) {
        // Optionally, we could check if they are super admin and redirect to /super-admin
        // But for now, let's default to dashboard, and dashboard can show a link to Super Admin if applicable
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect logged-in users to dashboard, but let guests see the landing page
    if (path === '/' && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
