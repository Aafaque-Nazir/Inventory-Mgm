'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Profile } from '@/types'
import { Loader2 } from 'lucide-react'

interface ProfileFormProps {
    profile: Profile
    email: string | null
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
    const [fullName, setFullName] = useState(profile.full_name || '')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSave = async () => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', profile.id)

            if (error) throw error

            toast.success('Profile updated successfully')
            router.refresh()
        } catch (error: unknown) {
            console.error('Update error:', error)
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const getRoleBadgeColor = (role: string | null) => {
        switch (role) {
            case 'ADMIN': return 'default'
            case 'MANAGER': return 'secondary'
            default: return 'outline'
        }
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                {fullName?.[0] || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{profile.full_name || 'User'}</CardTitle>
                            <CardDescription>{email}</CardDescription>
                            <div className="mt-2">
                                <Badge variant={getRoleBadgeColor(profile.role)}>
                                    {profile.role}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={email || ''} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="p-2 border rounded-md bg-muted text-sm text-muted-foreground">
                        {profile.role}
                    </div>
                    <p className="text-xs text-muted-foreground">Role is managed by administrators.</p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleSave} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    )
}
