'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MapPin, Trash2, Edit, Store } from 'lucide-react'
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
            <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl p-12 text-center">
                <Store className="h-16 w-16 mx-auto text-slate-600 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Upgrade to Multi-Warehouse</h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    Track inventory across multiple physical locations, shops, or godowns.
                </p>
                <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/25 rounded-xl px-8">
                    <a href="/pricing">Upgrade to Pro</a>
                </Button>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl p-6">
            <div className="flex flex-row items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white/90">Your Locations</h3>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-500 hover:bg-indigo-600 text-white border-0 rounded-xl shadow-lg shadow-indigo-500/20">
                            <Plus className="mr-2 h-4 w-4" /> Add Warehouse
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-white/10 text-white">
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
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address" className="text-slate-300">Address (Optional)</Label>
                                <Input
                                    id="address"
                                    placeholder="e.g., 123 Main St"
                                    value={newLocation.address}
                                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5">Cancel</Button>
                            <Button onClick={handleCreate} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {isLoading ? "Creating..." : "Create Warehouse"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {locations.map((loc) => (
                    <div key={loc.id} className="flex items-center justify-between p-4 border border-white/5 bg-slate-900/30 rounded-xl hover:bg-white/5 transition-all duration-200 group">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                <Store className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-200 group-hover:text-white transition-colors flex items-center gap-2">
                                    {loc.name}
                                    {loc.is_default && <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[10px] px-1.5 h-5">Default</Badge>}
                                </h4>
                                {loc.address && <p className="text-sm text-slate-500 mt-1">{loc.address}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(loc)} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
                                <Edit className="h-4 w-4" />
                            </Button>
                            {!loc.is_default && (
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(loc.id)} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white">
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
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-address" className="text-slate-300">Address (Optional)</Label>
                            <Input
                                id="edit-address"
                                value={editingLocation?.address || ''}
                                onChange={(e) => setEditingLocation(prev => prev ? { ...prev, address: e.target.value } : null)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5">Cancel</Button>
                        <Button onClick={handleEdit} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
