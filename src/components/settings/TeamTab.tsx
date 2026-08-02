'use client'

import { useState, useTransition } from 'react'
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
import { Badge } from '@/components/ui/badge'

const _inviteSchema = z.object({
    email: z.string().email(),
    role: z.enum(['STOREKEEPER', 'MANAGER', 'ADMIN']),
})

export function TeamTab({
    members,
    invitations,
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
        startTransition(async () => {
            const result = await cancelInvitation(formData)
            if (result?.error) toast.error(result.error)
            else toast.success(result?.message || 'Invitation cancelled')
        })
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
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-sm">
                        <span className={userCount >= maxUsers ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                            {userCount} / {maxUsers} Users Used
                        </span>
                        <span className="text-slate-500 ml-1">(Pro Plan: 5, Free: 1)</span>
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            disabled={userCount >= maxUsers}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-xl disabled:opacity-50"
                        >
                            Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-modal border-white/10 bg-black/90 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-white">Invite new member</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Send an invitation link to their email.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email</label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="colleague@example.com"
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Role</label>
                                <Select name="role" defaultValue="STOREKEEPER">
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                                        <SelectItem value="STOREKEEPER">Storekeeper (View/Add Stock)</SelectItem>
                                        <SelectItem value="MANAGER">Manager (Edit Items)</SelectItem>
                                        <SelectItem value="ADMIN">Admin (Full Access)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                                    Send Invitation
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs uppercase font-semibold text-slate-400">
                    <div className="col-span-5 md:col-span-4">User</div>
                    <div className="col-span-3">Role</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-white/5">
                    {/* Active Members */}
                    {members.map((member) => (
                        <div key={member.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors">
                            <div className="col-span-5 md:col-span-4">
                                <div className="font-medium text-white">{member.full_name}</div>
                                <div className="text-xs text-slate-500 truncate">{member.id}</div>
                            </div>
                            <div className="col-span-3">
                                <Badge variant="outline" className="border-white/10 text-slate-300">
                                    {member.role}
                                </Badge>
                            </div>
                            <div className="col-span-2">
                                <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20">
                                    Active
                                </Badge>
                            </div>
                            <div className="col-span-2 text-right">
                                {member.role !== 'ADMIN' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onRemove(member.id)}
                                        disabled={isPending}
                                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Pending Invitations */}
                    {invitations.map((invite) => (
                        <div key={invite.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors bg-white/[0.02]">
                            <div className="col-span-5 md:col-span-4">
                                <div className="font-medium text-slate-300">{invite.email}</div>
                                <div className="text-xs text-slate-500">Expires: {new Date(invite.expires_at).toLocaleDateString()}</div>
                            </div>
                            <div className="col-span-3">
                                <Badge variant="outline" className="border-dashed border-white/20 text-slate-400">
                                    {invite.role}
                                </Badge>
                            </div>
                            <div className="col-span-2">
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    Pending
                                </Badge>
                            </div>
                            <div className="col-span-2 text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onCancel(invite.id)}
                                    disabled={isPending}
                                    className="text-slate-400 hover:text-white hover:bg-white/10"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {members.length === 0 && invitations.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No team members found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
