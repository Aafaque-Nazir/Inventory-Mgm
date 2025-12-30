'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, Mail, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { inviteMember, cancelInvitation, removeMember } from '@/app/actions/team'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const inviteSchema = z.object({
    email: z.string().email(),
    role: z.enum(['STOREKEEPER', 'MANAGER', 'ADMIN']),
})

export function TeamTab({
    members,
    invitations,
    plan,
    maxUsers
}: {
    members: any[],
    invitations: any[],
    plan: string,
    maxUsers: number
}) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)

    // Invite Form
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        startTransition(async () => {
            const result = await inviteMember({}, formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('Invitation sent!')
                setOpen(false)
            }
        })
    }

    const onCancel = (inviteId: string) => {
        if (!confirm('Cancel this invitation?')) return
        const formData = new FormData()
        formData.append('inviteId', inviteId)
        startTransition(() => cancelInvitation(formData))
    }

    const onRemove = (userId: string) => {
        if (!confirm('Remove this member? They will lose access immediately.')) return
        const formData = new FormData()
        formData.append('userId', userId)
        startTransition(async () => {
            const result = await removeMember({}, formData)
            if (result?.error) toast.error(result.error)
            else toast.success('Member removed')
        })
    }

    const userCount = members.length + invitations.length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Team Members</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage who has access to your organization.
                    </p>
                    <p className="text-sm mt-1">
                        <span className={userCount >= maxUsers ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
                            {userCount} / {maxUsers} Users Used
                        </span> (Pro Plan: 5, Free: 1)
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={userCount >= maxUsers}>Add Member</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite new member</DialogTitle>
                            <DialogDescription>
                                Send an invitation link to their email.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input name="email" type="email" placeholder="colleague@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Role</label>
                                <Select name="role" defaultValue="STOREKEEPER">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STOREKEEPER">Storekeeper (View/Add Stock)</SelectItem>
                                        <SelectItem value="MANAGER">Manager (Edit Items)</SelectItem>
                                        <SelectItem value="ADMIN">Admin (Full Access)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                                    Send Invitation
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Active Members */}
                        {members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className="font-medium">{member.full_name}</div>
                                    <div className="text-xs text-muted-foreground">{member.id}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{member.role}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {member.role !== 'ADMIN' && (
                                        <Button variant="ghost" size="icon" onClick={() => onRemove(member.id)} disabled={isPending}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* Pending Invitations */}
                        {invitations.map((invite) => (
                            <TableRow key={invite.id}>
                                <TableCell>
                                    <div className="font-medium">{invite.email}</div>
                                    <div className="text-xs text-muted-foreground">Expires: {new Date(invite.expires_at).toLocaleDateString()}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{invite.role}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Pending</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => onCancel(invite.id)} disabled={isPending}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
