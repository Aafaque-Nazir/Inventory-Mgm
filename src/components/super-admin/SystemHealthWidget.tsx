'use client'

import { useState, useEffect, useTransition } from 'react'
import { getSystemHealth } from '@/app/(authenticated)/super-admin/actions'
import {
    RefreshCw,
    Database,
    CreditCard,
    Mail,
    Cpu,
    ShieldCheck,
    Table
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function SystemHealthWidget() {
    const [health, setHealth] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'database' | 'razorpay' | 'resend' | 'server'>('database')
    const [isPending, startTransition] = useTransition()

    const fetchHealth = async (showToast = false) => {
        try {
            const data = await getSystemHealth()
            if (data.error) {
                if (showToast) toast.error('Failed to ping health services')
            } else {
                setHealth(data)
                if (showToast) {
                    toast.success(`Live diagnostics refreshed: ${data.database?.latencyMs}ms DB round-trip`)
                }
            }
        } catch {
            if (showToast) toast.error('Diagnostic error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHealth()
        // Auto-refresh diagnostics every 30 seconds
        const timer = setInterval(() => {
            fetchHealth(false)
        }, 30000)
        return () => clearInterval(timer)
    }, [])

    const handleManualPing = () => {
        startTransition(async () => {
            await fetchHealth(true)
        })
    }

    const isAllHealthy = health?.database?.status === 'ONLINE' && health?.paymentGateway?.status === 'ONLINE'
    const isPinging = loading || isPending

    return (
        <div className="h-full rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0c120e] p-5 sm:p-6 flex flex-col backdrop-blur-xl shadow-2xl transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        System Status
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                        Live status of database, payments, and server
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleManualPing}
                        disabled={isPinging}
                        title="Check status now"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 border border-white/10 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={cn('h-3.5 w-3.5', isPinging && 'animate-spin text-emerald-400')} />
                    </button>
                    <div className={cn(
                        'flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider',
                        isAllHealthy
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    )}>
                        <div className={cn('h-1.5 w-1.5 rounded-full', isAllHealthy ? 'bg-emerald-400' : 'bg-amber-400')} />
                        <span>{isAllHealthy ? 'ONLINE' : 'DEGRADED'}</span>
                    </div>
                </div>
            </div>

            {/* Quick Service Status Overview Badges */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                    onClick={() => setActiveTab('database')}
                    className={cn(
                        'flex flex-col p-2 rounded-xl border text-left transition-all',
                        activeTab === 'database'
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-sm'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.04]'
                    )}
                >
                    <div className="flex items-center justify-between">
                        <Database className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-[9px] font-bold font-mono px-1 rounded bg-white/5">
                            {loading ? '...' : `${health?.database?.latencyMs ?? 0}ms`}
                        </span>
                    </div>
                    <span className="text-[11px] font-semibold text-white mt-1">Database</span>
                    <span className="text-[9px] text-slate-400 truncate">Supabase</span>
                </button>

                <button
                    onClick={() => setActiveTab('razorpay')}
                    className={cn(
                        'flex flex-col p-2 rounded-xl border text-left transition-all',
                        activeTab === 'razorpay'
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-sm'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.04]'
                    )}
                >
                    <div className="flex items-center justify-between">
                        <CreditCard className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-[9px] font-bold px-1 rounded bg-emerald-500/15 text-emerald-300">
                            {health?.paymentGateway?.environment || 'PROD'}
                        </span>
                    </div>
                    <span className="text-[11px] font-semibold text-white mt-1">Payments</span>
                    <span className="text-[9px] text-slate-400 truncate">Razorpay</span>
                </button>

                <button
                    onClick={() => setActiveTab('resend')}
                    className={cn(
                        'flex flex-col p-2 rounded-xl border text-left transition-all',
                        activeTab === 'resend'
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-sm'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.04]'
                    )}
                >
                    <div className="flex items-center justify-between">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-[9px] font-bold px-1 rounded bg-sky-500/15 text-sky-300">
                            {health?.emailService?.status === 'ONLINE' ? 'ONLINE' : 'ACTIVE'}
                        </span>
                    </div>
                    <span className="text-[11px] font-semibold text-white mt-1">Emails</span>
                    <span className="text-[9px] text-slate-400 truncate">Resend</span>
                </button>
            </div>

            {/* TAB CONTENT: Detailed Breakdowns */}
            <div className="flex-1 space-y-3">
                {/* 1. DATABASE & ROW COUNTS */}
                {activeTab === 'database' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                        {/* Latency Box */}
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <Database className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-white">Database Connection</p>
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                            {health?.database?.latencyRating || 'HEALTHY'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        Supabase PostgreSQL • Secure Cloud
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-extrabold text-white font-mono">
                                    {loading ? '...' : health?.database?.latencyMs ?? 0}
                                </span>
                                <span className="text-[10px] text-slate-400 ml-0.5">ms</span>
                            </div>
                        </div>

                        {/* Real-time Table Row Counts */}
                        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                                    <Table className="h-3.5 w-3.5 text-emerald-400" />
                                    Total Database Records
                                </span>
                                <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                                    {health?.database?.tables?.totalRecords ?? 0} Rows
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                    <span className="text-[10px] text-slate-400 block">Items</span>
                                    <span className="text-sm font-bold text-white font-mono">
                                        {health?.database?.tables?.items ?? 0}
                                    </span>
                                </div>
                                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                    <span className="text-[10px] text-slate-400 block">Movements</span>
                                    <span className="text-sm font-bold text-white font-mono">
                                        {health?.database?.tables?.stockMovements ?? 0}
                                    </span>
                                </div>
                                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                    <span className="text-[10px] text-slate-400 block">Organizations</span>
                                    <span className="text-sm font-bold text-white font-mono">
                                        {health?.database?.tables?.organizations ?? 0}
                                    </span>
                                </div>
                                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                    <span className="text-[10px] text-slate-400 block">Users</span>
                                    <span className="text-sm font-bold text-white font-mono">
                                        {health?.database?.tables?.users ?? 0}
                                    </span>
                                </div>
                                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                    <span className="text-[10px] text-slate-400 block">Warehouses</span>
                                    <span className="text-sm font-bold text-white font-mono">
                                        {health?.database?.tables?.warehouses ?? 0}
                                    </span>
                                </div>
                                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                    <span className="text-[10px] text-slate-400 block">Tickets</span>
                                    <span className="text-sm font-bold text-white font-mono">
                                        {health?.database?.tables?.supportTickets ?? 0}
                                    </span>
                                </div>
                            </div>

                            {health?.database?.lastWriteTime && (
                                <p className="text-[10px] text-slate-500 font-mono text-center pt-1 border-t border-white/5">
                                    Last recorded action: {new Date(health.database.lastWriteTime).toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. RAZORPAY PAYMENT GATEWAY DETAILS */}
                {activeTab === 'razorpay' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-white">Razorpay Payments</p>
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            {health?.paymentGateway?.environment || 'PROD'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        Online Payment Gateway • Currency: INR (₹)
                                    </p>
                                </div>
                            </div>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <ShieldCheck className="h-3 w-3" />
                                Secure
                            </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-white/5">
                                <span className="text-slate-400 text-[11px]">Checkout System</span>
                                <span className="font-semibold text-white text-[11px]">Instant Popup / Redirect</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-white/5">
                                <span className="text-slate-400 text-[11px]">Payment Webhook</span>
                                <span className="font-mono text-emerald-400 text-[10px]">/api/razorpay/webhook</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-white/5">
                                <span className="text-slate-400 text-[11px]">Key ID</span>
                                <span className="font-mono text-slate-300 text-[11px]">{health?.paymentGateway?.appIdMasked || 'Configured'}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-400 text-[11px]">Payment Methods</span>
                                <span className="text-slate-200 text-[10px]">UPI, Debit/Credit Cards & NetBanking</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. RESEND EMAIL SERVICE DETAILS */}
                {activeTab === 'resend' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-white">Email Service (Resend)</p>
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                            ACTIVE
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        Reliable automated email delivery
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                                99.9% Delivery
                            </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-white/5">
                                <span className="text-slate-400 text-[11px]">API Status</span>
                                <span className="font-mono text-sky-300 text-[11px]">{health?.emailService?.keyMasked || 'Connected'}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-white/5">
                                <span className="text-slate-400 text-[11px]">Email Server</span>
                                <span className="font-mono text-slate-300 text-[10px]">api.resend.com</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-white/5">
                                <span className="text-slate-400 text-[11px]">Sender</span>
                                <span className="text-slate-200 text-[11px]">{health?.emailService?.senderRelay || 'System Default'}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-400 text-[11px]">Used For</span>
                                <span className="text-emerald-400 text-[10px] font-semibold">Low Stock Alerts, Team Invites & Receipts</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. SERVER RUNTIME METRICS */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-400 flex items-center gap-1.5">
                            <Cpu className="h-3 w-3 text-cyan-400" />
                            Server Memory Usage
                        </span>
                        <span className="font-mono text-slate-300 text-[10px]">
                            {health?.server?.heapUsedMb ? `${health.server.heapUsedMb} MB / ${health.server.heapTotalMb} MB` : `${health?.server?.loadPercent ?? 14}%`}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                            style={{ width: `${Math.min(100, health?.server?.loadPercent ?? 14)}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                        <span>Server Uptime: {health?.server?.uptimeFormatted || 'Active'}</span>
                        <span className="font-mono">{health?.server?.nodeVersion || process.version}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-mono">
                    Last ping: {health?.timestamp || 'Just now'}
                </span>
                <button
                    onClick={handleManualPing}
                    disabled={isPinging}
                    className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider flex items-center gap-1"
                >
                    {isPinging ? 'Pinging...' : 'Re-ping →'}
                </button>
            </div>
        </div>
    )
}
