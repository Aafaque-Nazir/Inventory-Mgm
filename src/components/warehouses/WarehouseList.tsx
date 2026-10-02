'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Store } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createLocation, deleteLocation, updateLocation } from '@/app/actions/locations'

interface Location {
    id: string
    name: string
    address?: string
    is_default: boolean
}

interface WarehouseListProps {
    locations: Location[]
    organizationId: string
    isPro: boolean
}

export function WarehouseList({ locations, organizationId, isPro }: WarehouseListProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // State for Create
    const [newLocation, setNewLocation] = useState({ name: '', address: '' })

    // State for Edit
    const [editingLocation, setEditingLocation] = useState<Location | null>(null)

    const handleCreate = async () => {
        if (!newLocation.name) return toast.error("Name is required")

        setIsLoading(true)
        const result = await createLocation({
            name: newLocation.name,
            address: newLocation.address,
            organizationId
        })
        setIsLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Warehouse added successfully!")
            setIsCreateOpen(false)
            setNewLocation({ name: '', address: '' })
        }
    }

    const handleEdit = async () => {
        if (!editingLocation || !editingLocation.name) return toast.error("Name is required")

        setIsLoading(true)
        const result = await updateLocation(editingLocation.id, {
            name: editingLocation.name,
            address: editingLocation.address
        })
        setIsLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Warehouse updated successfully!")
            setIsEditOpen(false)
            setEditingLocation(null)
        }
    }

    const openEditDialog = (loc: Location) => {
        setEditingLocation({ ...loc })
        setIsEditOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure? This action cannot be undone if stock is assigned.")) {
            const result = await deleteLocation(id)
            if (result.error) toast.error(result.error)
            else toast.success("Warehouse deleted")
        }
    }

    if (!isPro) {
        return (
            <div className="rounded-2xl border border-white/10 bg-[#111613] backdrop-blur-sm overflow-hidden shadow-2xl p-12 text-center">
                <Store className="h-16 w-16 mx-auto text-slate-600 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Upgrade to Multi-Warehouse</h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    Track inventory across multiple physical locations, shops, or godowns.
                </p>
                <Button asChild className="bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold border-0 shadow-lg shadow-emerald-500/20 rounded-xl px-8">
                    <a href="/pricing">Upgrade to Pro</a>
                </Button>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-[#111613] backdrop-blur-sm overflow-hidden shadow-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white/90">Your Locations</h3>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold border-0 rounded-xl shadow-lg shadow-emerald-500/20">
                            <Plus className="mr-2 h-4 w-4" /> Add Warehouse
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#111613] border-white/10 text-white max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Warehouse</DialogTitle>
                            <DialogDescription className="text-slate-400">Create a new warehouse or store location.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-slate-300">Warehouse Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Downtown Store"
                                    value={newLocation.name}
                                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                                    className="bg-black/50 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address" className="text-slate-300">Address (Optional)</Label>
                                <Input
                                    id="address"
                                    placeholder="e.g., 123 Main St"
                                    value={newLocation.address}
                                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                                    className="bg-black/50 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5">Cancel</Button>
                            <Button onClick={handleCreate} disabled={isLoading} className="bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold">
                                {isLoading ? "Creating..." : "Create Warehouse"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {locations.map((loc) => (
                    <div key={loc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 border border-white/10 bg-black/40 rounded-xl hover:border-emerald-500/30 transition-all duration-200 group">
                        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                            <div className="p-2.5 sm:p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shrink-0">
                                <Store className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-slate-200 group-hover:text-white transition-colors flex flex-wrap items-center gap-2">
                                    <span className="truncate">{loc.name}</span>
                                    {loc.is_default && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 h-5">Default</Badge>}
                                </h4>
                                {loc.address && <p className="text-xs sm:text-sm text-slate-500 mt-1 break-words">{loc.address}</p>}
                            </div>
                        </div>
                        <div className="flex items-center justify-end sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(loc)} className="text-slate-400 hover:text-emerald-400 hover:bg-white/10 rounded-lg h-8 w-8">
                                <Edit className="h-4 w-4" />
                            </Button>
                            {!loc.is_default && (
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(loc.id)} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg h-8 w-8">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-[#111613] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Warehouse</DialogTitle>
                        <DialogDescription className="text-slate-400">Update warehouse details.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name" className="text-slate-300">Warehouse Name</Label>
                            <Input
                                id="edit-name"
                                value={editingLocation?.name || ''}
                                onChange={(e) => setEditingLocation(prev => prev ? { ...prev, name: e.target.value } : null)}
                                className="bg-black/50 border-white/10 text-white focus:border-emerald-500/50"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-address" className="text-slate-300">Address (Optional)</Label>
                            <Input
                                id="edit-address"
                                value={editingLocation?.address || ''}
                                onChange={(e) => setEditingLocation(prev => prev ? { ...prev, address: e.target.value } : null)}
                                className="bg-black/50 border-white/10 text-white focus:border-emerald-500/50"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5">Cancel</Button>
                        <Button onClick={handleEdit} disabled={isLoading} className="bg-emerald-500 hover:bg-emerald-400 text-[#04160c] font-bold">
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
