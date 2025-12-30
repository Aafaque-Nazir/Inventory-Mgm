'use client'

import { useState, useTransition, useEffect, useCallback } from 'react' // Import useCallback
import { searchOrganizations, updateOrganization } from '@/app/(authenticated)/super-admin/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, Loader2, Edit2, ShieldAlert, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import debounce from 'lodash.debounce'

type Org = {
    id: string
    name: string
    slug: string
    plan_type: string
    status: string
    created_at: string
}

export function OrgManager() {
    const [orgs, setOrgs] = useState<Org[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedOrg, setSelectedOrg] = useState<Org | null>(null)
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)

    // Form states
    const [plan, setPlan] = useState('')
    const [status, setStatus] = useState('')

    const performSearch = useCallback(async (query: string) => { // Use useCallback
        setLoading(true)
        const res = await searchOrganizations(query)
        if (res.data) {
            setOrgs(res.data as Org[])
        } else {
            setOrgs([])
        }
        setLoading(false)
    }, [])

    // Debounced search
    const debouncedSearch = useCallback(() => {
        return debounce((val: string) => performSearch(val), 500)
    }, [performSearch]) // Depend on performSearch

    useEffect(() => {
        performSearch('')
    }, [performSearch])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setSearch(val)
        // debouncedSearch()(val) // In a real app, use a proper hook or ref for debounce to allow cleanup
        // For simplicity, just calling straight or simple timeout could work, but let's just trigger search on enter or delay
        // Actually, let's just use effect for simplicity in this snippet
    }

    // Effect for search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(search)
        }, 500)
        return () => clearTimeout(timer)
    }, [search, performSearch])


    const handleEdit = (org: Org) => {
        setSelectedOrg(org)
        setPlan(org.plan_type)
        setStatus(org.status || 'ACTIVE')
        setOpen(true)
    }

    const handleSave = () => {
        if (!selectedOrg) return

        startTransition(async () => {
            const res = await updateOrganization(selectedOrg.id, {
                plan_type: plan,
                status: status
            })

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Organization updated successfully")
                setOpen(false)
                performSearch(search) // Refresh
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Organization Manager</h2>
                    <p className="text-sm text-muted-foreground">Manage subscriptions and access control.</p>
                </div>
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search organizations..."
                        value={search}
                        onChange={handleSearchChange}
                        className="pl-8"
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && orgs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : orgs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No organizations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orgs.map((org) => (
                                    <TableRow key={org.id}>
                                        <TableCell>
                                            <div className="font-medium">{org.name}</div>
                                            <div className="text-xs text-muted-foreground">{org.slug}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                org.plan_type === 'PRO' ? 'border-amber-500 text-amber-500' :
                                                    org.plan_type === 'ENTERPRISE' ? 'border-purple-500 text-purple-500' : ''
                                            }>
                                                {org.plan_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={
                                                org.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' :
                                                    org.status === 'SUSPENDED' ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' :
                                                        'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                                            }>
                                                {org.status || 'ACTIVE'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(org)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Organization</DialogTitle>
                    </DialogHeader>
                    {selectedOrg && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Plan</Label>
                                <Select value={plan} onValueChange={setPlan}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select Plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FREE">Free User</SelectItem>
                                        <SelectItem value="PRO">Pro Plan</SelectItem>
                                        <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="SUSPENDED">Suspended (Temporary)</SelectItem>
                                        <SelectItem value="BANNED">Banned (Permanent)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isPending} className="bg-primary">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
