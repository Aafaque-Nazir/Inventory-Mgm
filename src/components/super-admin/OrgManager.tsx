'use client'

import { useState, useTransition, useEffect, useCallback } from 'react' // Import useCallback
import { searchOrganizations, updateOrganization, deleteOrganization } from '@/app/(authenticated)/super-admin/actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, Loader2, Edit2, ShieldAlert, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

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
    const [deleteOpen, setDeleteOpen] = useState(false)

    // Form states
    const [plan, setPlan] = useState('')
    const [status, setStatus] = useState('')

    const performSearch = useCallback(async (query: string) => {
        setLoading(true)
        const res = await searchOrganizations(query)
        if (res.data) {
            setOrgs(res.data as Org[])
        } else {
            setOrgs([])
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        performSearch('')
    }, [performSearch])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setSearch(val)
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

    const handleDelete = () => {
        if (!selectedOrg) return

        startTransition(async () => {
            const res = await deleteOrganization(selectedOrg.id)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Organization deleted permanently")
                setDeleteOpen(false)
                setOpen(false)
                performSearch(search)
            }
        })
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Organization Manager</h2>
                    <p className="text-sm text-slate-400">Manage subscriptions, quotas, and global access control.</p>
                </div>
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                        placeholder="Search organizations or slugs..."
                        value={search}
                        onChange={handleSearchChange}
                        className="pl-11 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-xl"
                    />
                </div>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl">
                {/* Header Row */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-5 border-b border-white/5 bg-white/5 text-[10px] uppercase font-black tracking-widest text-slate-500">
                    <div className="col-span-4 pl-4">Company / Entity</div>
                    <div className="col-span-2">Plan Type</div>
                    <div className="col-span-2">Current Status</div>
                    <div className="col-span-2">Registration</div>
                    <div className="col-span-2 text-right pr-4">Options</div>
                </div>

                <div className="divide-y divide-white/5">
                    {loading && orgs.length === 0 ? (
                        <div className="p-20 flex flex-col items-center justify-center text-slate-500 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                            <p className="font-medium animate-pulse">Scanning infrastructure...</p>
                        </div>
                    ) : orgs.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                            <div className="p-4 rounded-full bg-white/5 border border-white/5 opacity-20">
                                <Search className="h-8 w-8 text-white" />
                            </div>
                            <p className="text-slate-500 font-medium tracking-tight italic">No organizations matched your criteria.</p>
                        </div>
                    ) : (
                        orgs.map((org) => (
                            <div key={org.id} className="flex flex-col gap-4 p-5 md:grid md:grid-cols-12 md:items-center md:gap-4 hover:bg-white/[0.03] transition-colors group">
                                {/* Name Section */}
                                <div className="md:col-span-4 md:pl-4 flex items-center justify-between md:block">
                                    <div>
                                        <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">{org.name}</div>
                                        <div className="text-xs text-slate-500 font-mono tracking-tighter">org_slug: {org.slug}</div>
                                    </div>
                                    {/* Mobile Edit Button (Visible only on mobile for quick access) */}
                                    <div className="md:hidden">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(org)}
                                            className="h-8 w-8 p-0 rounded-lg bg-white/5 text-slate-400"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Plan Section */}
                                <div className="md:col-span-2 flex items-center justify-between md:block">
                                    <span className="text-[10px] font-bold uppercase text-slate-500 md:hidden">Plan</span>
                                    <div className={`w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${org.plan_type === 'PRO' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' :
                                        org.plan_type === 'ENTERPRISE' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' :
                                            'bg-slate-500/20 text-slate-400 border border-slate-500/20'
                                        }`}>
                                        {org.plan_type}
                                    </div>
                                </div>

                                {/* Status Section */}
                                <div className="md:col-span-2 flex items-center justify-between md:block">
                                    <span className="text-[10px] font-bold uppercase text-slate-500 md:hidden">Status</span>
                                    <div className={`w-fit px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${org.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        org.status === 'SUSPENDED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${org.status === 'ACTIVE' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' :
                                            org.status === 'SUSPENDED' ? 'bg-amber-400' : 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,113,0.5)]'
                                            }`} />
                                        {org.status || 'ACTIVE'}
                                    </div>
                                </div>

                                {/* Date Section */}
                                <div className="md:col-span-2 md:text-sm text-slate-400 font-medium flex items-center justify-between md:block">
                                    <span className="text-[10px] font-bold uppercase text-slate-500 md:hidden">Joined</span>
                                    <span className="text-sm">
                                        {new Date(org.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>

                                {/* Options Section (Desktop) */}
                                <div className="hidden md:block col-span-2 text-right pr-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(org)}
                                        className="h-9 w-9 p-0 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all shadow-xl"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md bg-[#0f172a] border-white/10 rounded-3xl shadow-2xl backdrop-blur-3xl">
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                <ShieldAlert className="h-6 w-6 text-indigo-400" />
                            </div>
                            Update Infrastructure
                        </DialogTitle>
                    </DialogHeader>

                    {selectedOrg && (
                        <div className="space-y-6 py-6">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Target Organization</p>
                                <p className="text-lg font-bold text-white">{selectedOrg.name}</p>
                                <p className="text-xs text-indigo-400 italic">/{selectedOrg.slug}</p>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Subscription Tier</Label>
                                <Select value={plan} onValueChange={setPlan}>
                                    <SelectTrigger className="h-12 bg-black/40 border-white/10 text-white rounded-xl focus:ring-indigo-500/50">
                                        <SelectValue placeholder="Select Tier" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl shadow-2xl">
                                        <SelectItem value="FREE">Standard (Free)</SelectItem>
                                        <SelectItem value="PRO">Professional Plan</SelectItem>
                                        <SelectItem value="ENTERPRISE">Global Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Global Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="h-12 bg-black/40 border-white/10 text-white rounded-xl focus:ring-indigo-500/50">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl shadow-2xl">
                                        <SelectItem value="ACTIVE" className="text-emerald-400">Green (Active)</SelectItem>
                                        <SelectItem value="SUSPENDED" className="text-amber-400 cursor-not-allowed opacity-50">Amber (Suspended)</SelectItem>
                                        <SelectItem value="BANNED" className="text-rose-400">Black (Revoked Access)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-3 sm:gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="flex-1 h-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold"
                        >
                            Abort
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isPending}
                            className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-500/20"
                        >
                            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                            Sync Config
                        </Button>
                    </DialogFooter>

                    <div className="p-4 mt-2 border-t border-white/5 bg-red-500/5 rounded-b-3xl">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-red-400 font-medium">
                                <span className="font-bold block uppercase tracking-wider mb-0.5">Danger Zone</span>
                                Irreversible action. Data will be lost.
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteOpen(true)}
                                className="h-9 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg text-xs uppercase font-bold tracking-widest transition-all"
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Terminate
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-md bg-[#0f172a] border-red-500/20 rounded-3xl shadow-2xl backdrop-blur-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 animate-pulse">
                                <AlertTriangle className="h-6 w-6 text-red-500" />
                            </div>
                            Confirm Termination
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-6 space-y-4">
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Are you absolutely sure you want to delete <span className="text-white font-bold">{selectedOrg?.name}</span>?
                            This action cannot be undone. All data associated with this organization (items, orders, suppliers) will be permanently deleted.
                        </p>

                        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 flex gap-3 items-start">
                            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                            <div className="text-xs text-red-200/80">
                                This will also detach any existing users from this organization, potentially leaving them as orphans.
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteOpen(false)}
                            className="flex-1 h-12 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20"
                        >
                            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "YES, DELETE IT"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div >
    )
}
