'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2, Search, Users, Building, SignalHigh, Copy, Check, Mail, Key, Calendar, Pencil, Database } from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createTenantUser, deleteOrganization, deleteTenantUser, updateSubscriptionStatus, setSubscriptionPeriod, updateOrganization, seedOrganizationData } from './actions'
import { toast } from 'sonner'
import { Trash2, AlertTriangle } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Organization {
    id: string
    name: string
    slug: string
    subscription_status: string
    subscription_start_date?: string
    subscription_end_date?: string
    created_at: string
}

export default function SuperAdminDashboard() {
    const [orgs, setOrgs] = useState<Organization[]>([])
    const [loading, setLoading] = useState(true)
    const [totalUsers, setTotalUsers] = useState<number | null>(null)

    const supabase = createClient()

    // Subscription period state
    const [periodType, setPeriodType] = useState<'MONTHLY' | 'YEARLY' | 'CUSTOM'>('MONTHLY')
    const [customStartDate, setCustomStartDate] = useState('')
    const [customEndDate, setCustomEndDate] = useState('')
    const [settingPeriod, setSettingPeriod] = useState(false)

    useEffect(() => {
        fetchOrgs()
        fetchTotalUsers()
    }, [])

    const fetchOrgs = async () => {
        try {
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrgs(data || [])
        } catch (error: any) {
            toast.error('Failed to load organizations: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchTotalUsers = async () => {
        try {
            const { count, error } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('is_super_admin', false) // Exclude super admins from count

            if (!error) {
                setTotalUsers(count || 0)
            }
        } catch (error) {
            console.error('Failed to fetch user count')
        }
    }



    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newOrgName, setNewOrgName] = useState('')
    const [newOrgSlug, setNewOrgSlug] = useState('')
    const [createLoading, setCreateLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Filter organizations
    const filteredOrgs = orgs.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalOrgs = orgs.length
    const activeOrgs = orgs.filter(o => o.subscription_status === 'ACTIVE').length

    // User Management State
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
    const [isManageOpen, setIsManageOpen] = useState(false)
    const [orgUsers, setOrgUsers] = useState<any[]>([])
    const [usersLoading, setUsersLoading] = useState(false)
    const [newUserEmail, setNewUserEmail] = useState('')
    const [newUserPassword, setNewUserPassword] = useState('')
    const [newUserName, setNewUserName] = useState('')
    const [newUserRole, setNewUserRole] = useState('STOREKEEPER')
    const [creatingUser, setCreatingUser] = useState(false)

    // Edit Organization State
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
    const [editName, setEditName] = useState('')
    const [editLoading, setEditLoading] = useState(false)

    const handleEditClick = (org: Organization) => {
        setEditingOrg(org)
        setEditName(org.name)
        setIsEditOpen(true)
    }

    const handleUpdateOrg = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingOrg) return

        setEditLoading(true)
        const result = await updateOrganization(editingOrg.id, editName)

        setEditLoading(false)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Organization updated successfully')
            setIsEditOpen(false)
            fetchOrgs()
        }
    }

    useEffect(() => {
        if (selectedOrg && isManageOpen) {
            fetchOrgUsers(selectedOrg.id)
        }
    }, [selectedOrg, isManageOpen])

    // Auto-generate slug from name
    /* Slug generation moved to submission time */

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreateLoading(true)

        try {
            const { data, error } = await supabase
                .from('organizations')
                .insert([{
                    name: newOrgName,
                    slug: newOrgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    subscription_status: 'ACTIVE'
                }])
                .select()

            if (error) throw error

            toast.success('Organization created successfully')
            setIsCreateOpen(false)
            setNewOrgName('')
            setNewOrgSlug('')
            // setCreateLoading(false) (already in finaly)
            fetchOrgs() // Refresh list
        } catch (error: any) {
            // Handle unique constraint violation for slug
            if (error.code === '23505') {
                toast.error('Organization with this slug already exists.')
            } else {
                toast.error('Failed to create organization: ' + error.message)
            }
        } finally {
            setCreateLoading(false)
        }
    }

    const handleDeleteOrg = async (orgId: string) => {
        setLoading(true)
        const result = await deleteOrganization(orgId)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Organization deleted successfully')
            fetchOrgs()
        }
        setLoading(false)
        setOrgToDelete(null)
    }

    const handleDeleteUser = async (userId: string) => {
        if (!selectedOrg) return
        setUsersLoading(true)
        const result = await deleteTenantUser(userId)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('User deleted successfully')
            fetchOrgUsers(selectedOrg.id)
        }
        setUsersLoading(false)
        setUserToDelete(null)
    }

    const [orgToDelete, setOrgToDelete] = useState<string | null>(null)
    const [userToDelete, setUserToDelete] = useState<string | null>(null)

    const fetchOrgUsers = async (orgId: string) => {
        setUsersLoading(true)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('organization_id', orgId)

        if (!error && data) {
            setOrgUsers(data)
        }
        setUsersLoading(false)
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedOrg) return

        setCreatingUser(true)
        const formData = new FormData()
        formData.append('email', newUserEmail)
        formData.append('password', newUserPassword)
        formData.append('fullName', newUserName)
        formData.append('organizationId', selectedOrg.id)
        formData.append('role', newUserRole)

        const result = await createTenantUser(formData)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('User created successfully')
            setNewUserEmail('')
            setNewUserPassword('')
            setNewUserName('')
            fetchOrgUsers(selectedOrg.id)
        }
        setCreatingUser(false)
    }

    return (
        <div className="grid gap-6">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrgs}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                        <SignalHigh className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeOrgs}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers ?? '-'}</div>
                        <p className="text-xs text-muted-foreground">Across all organizations</p>
                    </CardContent>
                </Card>
            </div>
            <Sheet open={isManageOpen} onOpenChange={setIsManageOpen}>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto px-6">
                    <SheetHeader className="border-b pb-4">
                        <SheetTitle className="text-xl">{selectedOrg?.name}</SheetTitle>
                        <SheetDescription asChild>
                            <div className="space-y-3">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                    <Calendar className="h-3 w-3" />
                                    Created: {selectedOrg?.created_at ? new Date(selectedOrg.created_at).toLocaleDateString() : '-'}
                                </span>
                                {/* Subscription Status Control */}
                                <span className="flex items-center gap-2 pt-2">
                                    <Label className="text-xs font-medium">Subscription:</Label>
                                    <Select
                                        value={selectedOrg?.subscription_status || 'ACTIVE'}
                                        onValueChange={async (value) => {
                                            if (!selectedOrg) return
                                            const result = await updateSubscriptionStatus(selectedOrg.id, value)
                                            if (result.error) {
                                                toast.error(result.error)
                                            } else {
                                                toast.success(`Subscription updated to ${value}`)
                                                // Update local state
                                                setSelectedOrg({ ...selectedOrg, subscription_status: value })
                                                fetchOrgs() // Refresh list
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-32 h-7 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">
                                                <span className="flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                                    Active
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="INACTIVE">
                                                <span className="flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                                                    Inactive
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="EXPIRED">
                                                <span className="flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                                    Expired
                                                </span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </span>
                            </div>
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-8">
                        {/* Subscription Period Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-primary" />
                                Set Subscription Period
                            </h3>

                            {/* Current subscription info */}
                            {selectedOrg?.subscription_end_date && (
                                <div className="text-sm text-muted-foreground">
                                    Current expires: <span className="font-medium text-foreground">
                                        {new Date(selectedOrg.subscription_end_date).toLocaleDateString()}
                                    </span>
                                </div>
                            )}

                            <Card className="bg-muted/30">
                                <CardContent className="pt-4 space-y-4">
                                    {/* Period Type Buttons */}
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={periodType === 'MONTHLY' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setPeriodType('MONTHLY')}
                                        >
                                            Monthly
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={periodType === 'YEARLY' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setPeriodType('YEARLY')}
                                        >
                                            Yearly
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={periodType === 'CUSTOM' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setPeriodType('CUSTOM')}
                                        >
                                            Custom
                                        </Button>
                                    </div>

                                    {/* Custom Date Inputs */}
                                    {periodType === 'CUSTOM' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs">Start Date</Label>
                                                <Input
                                                    type="date"
                                                    value={customStartDate}
                                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">End Date</Label>
                                                <Input
                                                    type="date"
                                                    value={customEndDate}
                                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Info text */}
                                    <p className="text-xs text-muted-foreground">
                                        {periodType === 'MONTHLY' && 'Sets subscription to expire 1 month from today'}
                                        {periodType === 'YEARLY' && 'Sets subscription to expire 1 year from today'}
                                        {periodType === 'CUSTOM' && 'Select custom start and end dates'}
                                    </p>

                                    {/* Activate Button */}
                                    <Button
                                        className="w-full"
                                        disabled={settingPeriod || (periodType === 'CUSTOM' && (!customStartDate || !customEndDate))}
                                        onClick={async () => {
                                            if (!selectedOrg) return
                                            setSettingPeriod(true)
                                            const result = await setSubscriptionPeriod(
                                                selectedOrg.id,
                                                periodType,
                                                periodType === 'CUSTOM' ? customStartDate : undefined,
                                                periodType === 'CUSTOM' ? customEndDate : undefined
                                            )
                                            setSettingPeriod(false)
                                            if (result.error) {
                                                toast.error(result.error)
                                            } else {
                                                toast.success(`Subscription activated! Expires: ${new Date(result.endDate!).toLocaleDateString()}`)
                                                setSelectedOrg({ ...selectedOrg, subscription_status: 'ACTIVE', subscription_end_date: result.endDate })
                                                fetchOrgs()
                                            }
                                        }}
                                    >
                                        {settingPeriod ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting...</>
                                        ) : (
                                            'Activate Subscription'
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Seed Data Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center">
                                <Database className="mr-2 h-4 w-4 text-primary" />
                                Demo Data
                            </h3>
                            <Card className="bg-muted/30 border-dashed">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Populate this organization with dummy suppliers, items, and stock history for demonstration purposes.
                                    </p>
                                    <Button
                                        variant="secondary"
                                        className="w-full"
                                        onClick={async () => {
                                            if (!selectedOrg) return
                                            if (!confirm('This will add dummy data to the organization. Continue?')) return

                                            const result = await seedOrganizationData(selectedOrg.id)
                                            if (result.error) {
                                                toast.error(result.error)
                                            } else {
                                                toast.success('Dummy data seeded successfully')
                                                fetchOrgs()
                                            }
                                        }}
                                    >
                                        Seed Demo Data
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 1. Add User Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center">
                                <Plus className="mr-2 h-4 w-4 text-primary" />
                                Add New User
                            </h3>
                            <Card className="bg-muted/30 border-dashed">
                                <CardContent className="pt-6">
                                    <form onSubmit={handleCreateUser} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-medium">Full Name</Label>
                                                <Input
                                                    value={newUserName}
                                                    onChange={(e) => setNewUserName(e.target.value)}
                                                    placeholder="John Doe"
                                                    className="h-9 bg-background"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-medium">Role</Label>
                                                <Select value={newUserRole} onValueChange={setNewUserRole}>
                                                    <SelectTrigger className="h-9 bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                                        <SelectItem value="MANAGER">Manager</SelectItem>
                                                        <SelectItem value="STOREKEEPER">Storekeeper</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium">Email Address</Label>
                                            <Input
                                                type="email"
                                                value={newUserEmail}
                                                onChange={(e) => setNewUserEmail(e.target.value)}
                                                placeholder="user@company.com"
                                                className="h-9 bg-background"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium">Password</Label>
                                            <Input
                                                type="password"
                                                value={newUserPassword}
                                                onChange={(e) => setNewUserPassword(e.target.value)}
                                                placeholder="Min 6 chars"
                                                className="h-9 bg-background"
                                                required
                                            />
                                        </div>
                                        <Button size="sm" type="submit" className="w-full" disabled={creatingUser}>
                                            {creatingUser && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                            Create User Account
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 2. Users List Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center">
                                <Users className="mr-2 h-4 w-4 text-primary" />
                                Existing Users
                            </h3>
                            {usersLoading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : orgUsers.length === 0 ? (
                                <div className="text-center text-sm text-muted-foreground py-8 border rounded-md border-dashed bg-muted/10">
                                    No users found in this organization.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orgUsers.map((user) => (
                                        <div key={user.id} className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {user.full_name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{user.full_name}</p>
                                                        <p className="text-xs text-muted-foreground capitalize">{user.role?.toLowerCase()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="text-[10px]">
                                                        {user.role}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                                        onClick={() => setUserToDelete(user.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {/* Credentials Display for Super Admin */}
                                            <div className="text-xs bg-muted/50 p-2 rounded border space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Email:</span>
                                                    <span className="font-mono">{user.email || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Password:</span>
                                                    <span className="font-mono">{user.temp_password || '••••••'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
                    <p className="text-muted-foreground">Manage tenant organizations and subscriptions.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Organization
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Organization</DialogTitle>
                            <DialogDescription>
                                Add a new tenant to the system. They will be active immediately.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateOrg} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="orgName">Organization Name</Label>
                                <Input
                                    id="orgName"
                                    placeholder="Acme Corp"
                                    value={newOrgName}
                                    onChange={(e) => setNewOrgName(e.target.value)}
                                    required
                                />
                            </div>
                            {/* Slug input removed */}
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={createLoading}>
                                    {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Organization
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Edit Organization Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Organization</DialogTitle>
                        <DialogDescription>
                            Update organization details. Slug cannot be changed after creation.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateOrg} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="editName">Organization Name</Label>
                            <Input
                                id="editName"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            {/* Slug display removed from Edit */}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={editLoading}>
                                {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Tenants</CardTitle>
                            <CardDescription>
                                List of all registered organizations in the system.
                            </CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search organizations..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : filteredOrgs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No organizations found matching your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrgs.map((org) => (
                                    <TableRow key={org.id}>
                                        <TableCell className="font-medium">{org.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={org.subscription_status === 'ACTIVE' ? 'default' : 'destructive'}>
                                                {org.subscription_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mr-2"
                                                onClick={() => {
                                                    setSelectedOrg(org)
                                                    setIsManageOpen(true)
                                                }}
                                            >
                                                Manage
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mr-2"
                                                onClick={() => handleEditClick(org)}
                                            >
                                                <Pencil className="h-3 w-3 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                onClick={() => setOrgToDelete(org.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Delete Org Dialog */}
            <AlertDialog open={!!orgToDelete} onOpenChange={() => setOrgToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the organization
                            and ALL associated data (users, items, orders, etc).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => orgToDelete && handleDeleteOrg(orgToDelete)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Organization
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete User Dialog */}
            <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will revoke their access immediately.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => userToDelete && handleDeleteUser(userToDelete)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
