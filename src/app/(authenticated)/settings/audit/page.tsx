import { format } from 'date-fns'
import { ProLock } from '@/components/common/ProLock'
import { getAuditLogs } from '@/app/actions/audit'
import { createClient } from '@/lib/supabase/server'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function AuditLogsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let isPro = false
    let isSuperAdmin = false

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, is_super_admin, organizations(plan_type, subscription_end_date)')
            .eq('id', user.id)
            .single()

        isSuperAdmin = profile?.is_super_admin || false

        // Check Pro (Logic should be centralized but copying here for now to be safe)
        // @ts-ignore
        if (profile?.organizations?.plan_type === 'PRO') {
            // @ts-ignore
            const endDate = profile.organizations.subscription_end_date
            if (endDate && new Date(endDate) > new Date()) {
                isPro = true
            }
        }
    }

    const { logs } = await getAuditLogs(1, 100)

    function formatDetails(details: any) {
        if (!details) return '-'
        return Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(', ')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Security Audit Logs</h1>
                <p className="text-muted-foreground">Track critical actions within your organization.</p>
            </div>

            <ProLock isPro={isPro || isSuperAdmin} title="Audit Logs" description="Upgrade to Pro to view detailed security logs.">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs && logs.length > 0 ? (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(log.created_at), 'MMM d, HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{log.action}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {log.profile?.full_name || 'Unknown'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                ID: {log.actor_id?.slice(0, 8)}...
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ''}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={JSON.stringify(log.details, null, 2)}>
                                            {formatDetails(log.details)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No logs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </ProLock>
        </div>
    )
}
