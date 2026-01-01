import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

export default async function ProfileSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your personal account settings.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>
                        This information is visible to your team.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-primary/10">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-primary/5 text-2xl font-medium text-primary">
                                {profile.full_name?.[0] || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-semibold">{profile.full_name}</h3>
                            <p className="text-sm text-muted-foreground">Joined {format(new Date(profile.created_at || new Date()), 'MMMM yyyy')}</p>
                        </div>
                    </div>
                    <div className="grid gap-1 border-t pt-4">
                        <span className="text-sm font-medium text-muted-foreground">Email</span>
                        <span>{user.email}</span>
                    </div>
                    <div className="grid gap-1">
                        <span className="text-sm font-medium text-muted-foreground">Role</span>
                        <span className="capitalize">{profile.role?.toLowerCase()}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
