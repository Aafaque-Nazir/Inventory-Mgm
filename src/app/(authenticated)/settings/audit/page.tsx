import { format } from 'date-fns'
import { ProLock } from '@/components/common/ProLock'
import { getAuditLogs } from '@/app/actions/audit'
import { createClient } from '@/lib/supabase/server'

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
        const orgs = profile?.organizations as any
        if (orgs?.plan_type === 'PRO') {
            const endDate = orgs.subscription_end_date
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
        <div className="space-y-8 max-w-6xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Security Audit Logs</h1>
                <p className="text-slate-400">Track critical actions within your organization.</p>
            </div>

            <ProLock isPro={isPro || isSuperAdmin} title="Audit Logs" description="Upgrade to Pro to view detailed security logs.">
                <div className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs uppercase font-semibold text-slate-400">
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2">Action</div>
                        <div className="col-span-3">User</div>
                        <div className="col-span-2">Entity</div>
                        <div className="col-span-3">Details</div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {logs && logs.length > 0 ? (
                            logs.map((log) => (
                                <div key={log.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors">
                                    <div className="col-span-2 font-medium text-slate-300">
                                        {format(new Date(log.created_at), 'MMM d, HH:mm')}
                                    </div>
                                    <div className="col-span-2">
                                        <Badge variant="outline" className="border-white/10 text-slate-300 bg-white/5">
                                            {log.action}
                                        </Badge>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="text-sm text-white font-medium">
                                            {log.profile?.full_name || 'Unknown'}
                                        </div>
                                        <div className="text-xs text-slate-500 truncate">
                                            ID: {log.actor_id?.slice(0, 8)}...
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-sm text-slate-300">
                                        {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ''}
                                    </div>
                                    <div className="col-span-3 text-sm text-slate-400 truncate" title={JSON.stringify(log.details, null, 2)}>
                                        {formatDetails(log.details)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-500">
                                No logs found.
                            </div>
                        )}
                    </div>
                </div>
            </ProLock>
        </div>
    )
}
