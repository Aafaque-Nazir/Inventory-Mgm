import { createClient } from '@/lib/supabase/server'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'

export default async function AdminOrganizationsPage() {
    const supabase = await createClient()

    // Fetch Orgs with User Count (Simulated via join or separate query if needed)
    // Supabase simple join:
    const { data: orgs } = await supabase
        .from('organizations')
        .select(`
            *,
            profiles(count)
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">All Organizations</h1>
            <p className="text-muted-foreground">Manage all tenant organizations.</p>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Organization Name</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orgs?.map((org: unknown) => (
                            <TableRow key={org.id}>
                                <TableCell className="font-medium">{org.name}</TableCell>
                                <TableCell>
                                    <Badge variant={org.plan_type === 'PRO' ? 'default' : 'secondary'}>
                                        {org.plan_type}
                                    </Badge>
                                </TableCell>
                                <TableCell>{org.profiles?.[0]?.count || 0} Users</TableCell>
                                <TableCell>{format(new Date(org.created_at), 'dd MMM yyyy')}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="uppercase text-xs">Active</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
