'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Warehouses <Badge variant="secondary">Pro Feature</Badge>
                    </CardTitle>
                    <CardDescription>Manage multiple warehouses and store locations.</CardDescription>
                </CardHeader>
                <CardContent className="py-8 text-center bg-muted/20">
                    <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Upgrade to Multi-Warehouse</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Track inventory across multiple physical locations, shops, or godowns.
                    </p>
                    <Button variant="default" asChild>
                        <a href="/pricing">Upgrade to Pro</a>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Warehouses</CardTitle>
                    <CardDescription>Manage your physical inventory locations.</CardDescription>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Warehouse
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Warehouse</DialogTitle>
                            <DialogDescription>Create a new warehouse or store location.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Warehouse Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Downtown Store"
                                    value={newLocation.name}
                                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Address (Optional)</Label>
                                <Input
                                    id="address"
                                    placeholder="e.g., 123 Main St"
                                    value={newLocation.address}
                                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={isLoading}>
                                {isLoading ? "Creating..." : "Create Warehouse"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {locations.map((loc) => (
                        <div key={loc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-md">
                                    <Store className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold flex items-center gap-2">
                                        {loc.name}
                                        {loc.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                                    </h4>
                                    {loc.address && <p className="text-sm text-muted-foreground">{loc.address}</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(loc)}>
                                    <Edit className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                {!loc.is_default && (
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(loc.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Warehouse</DialogTitle>
                            <DialogDescription>Update warehouse details.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Warehouse Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editingLocation?.name || ''}
                                    onChange={(e) => setEditingLocation(prev => prev ? { ...prev, name: e.target.value } : null)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-address">Address (Optional)</Label>
                                <Input
                                    id="edit-address"
                                    value={editingLocation?.address || ''}
                                    onChange={(e) => setEditingLocation(prev => prev ? { ...prev, address: e.target.value } : null)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button onClick={handleEdit} disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </CardContent>
        </Card>
    )
}
