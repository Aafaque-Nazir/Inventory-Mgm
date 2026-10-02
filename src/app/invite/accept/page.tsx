import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { acceptInvitation } from '@/app/invite/accept/actions'

export default async function InvitePage({
    searchParams,
}: {
    searchParams: Promise<{ token: string }>
}) {
    // Await searchParams before accessing properties
    const params = await searchParams
    const token = params.token

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#070908] p-4">
                <Card className="w-full max-w-md border-white/10 bg-[#111613] text-white shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-red-400">Invalid Link</CardTitle>
                        <CardDescription>
                            This invitation link is missing a token.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Link href="/">
                            <Button variant="outline">Go Home</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    const supabase = await createClient()

    // 1. Validate Token
    const { data: invitation, error } = await supabase
        .from('invitations')
        .select(`*, organization:organizations(name)`)
        .eq('token', token)
        .single()

    if (error || !invitation) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#070908] p-4">
                <Card className="w-full max-w-md border-white/10 bg-[#111613] text-white shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-red-400">Invitation Not Found</CardTitle>
                        <CardDescription>
                            This invitation link is invalid or has expired.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Link href="/">
                            <Button variant="outline">Go Home</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    // 2. Check if User is Logged In
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // Redirect to Login with return URL
        // We use 'callbackUrl' or similar. 
        // Or we can show a specific "Login to Accept" card.
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#070908] p-4">
                <Card className="w-full max-w-md border-white/10 bg-[#111613] text-white shadow-2xl">
                    <CardHeader>
                        <CardTitle>Join {invitation.organization.name}</CardTitle>
                        <CardDescription>
                            You have been invited to join <strong>{invitation.organization.name}</strong> as a <strong>{invitation.role}</strong>.
                            <br /><br />
                            Please sign in or create an account to accept.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link href={`/login?next=/invite/accept?token=${token}`}>
                            <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold">
                                Sign In to Accept
                            </Button>
                        </Link>
                        <div className="text-center text-sm text-slate-500">
                            Don&apos;t have an account? <Link href={`/signup?next=/invite/accept?token=${token}`} className="text-emerald-400 hover:text-emerald-300 hover:underline">Sign Up</Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // 3. Check if email matches (Optional security step, but good for UX)
    if (user.email !== invitation.email) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#070908] p-4">
                <Card className="w-full max-w-md border-white/10 bg-[#111613] text-white shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-yellow-400">Email Mismatch</CardTitle>
                        <CardDescription>
                            This invitation was sent to <strong>{invitation.email}</strong>, but you are signed in as <strong>{user.email}</strong>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-400">
                            Please sign out and sign in with the correct account.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <form action="/auth/signout" method="post">
                             <Button variant="outline" type="submit">Sign Out</Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#070908] p-4">
            <Card className="w-full max-w-md border-white/10 bg-[#111613] text-white shadow-2xl">
                <CardHeader>
                    <CardTitle>Welcome to {invitation.organization.name}</CardTitle>
                    <CardDescription>
                        You are about to join the team as a <strong>{invitation.role}</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={acceptInvitation}>
                        <input type="hidden" name="token" value={token} />
                        <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold">
                            Accept Invitation
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
