'use client'

import { format } from 'date-fns'
import { ArrowRight, Package, Truck, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

interface Activity {
    id: string
    type: 'IN' | 'OUT'
    quantity: number
    created_at: string
    item?: { name: string }
    reason?: string
}

const iconMap = {
    IN: Truck,
    OUT: ShoppingCart
}

export function RecentActivityList({ activities }: { activities: Activity[] }) {
    return (
        <div className="col-span-3 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
             <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                    <p className="text-xs text-slate-400">Latest stock movements across the system</p>
                </div>
                <Link href="/reports" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                    View All <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            <div className="space-y-4">
                {activities?.map((activity) => {
                    const Icon = iconMap[activity.type] || Package
                    const isPositive = activity.type === 'IN'

                    return (
                        <div 
                            key={activity.id}
                            className="group flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/5 transition-all"
                        >
                             <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                                 isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                             }`}>
                                 <Icon className="h-5 w-5" />
                             </div>
                             
                             <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2">
                                     <p className="font-medium text-sm text-slate-200 truncate">{activity.item?.name || 'Unknown Item'}</p>
                                     <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                         isPositive 
                                            ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' 
                                            : 'text-blue-400 bg-blue-500/5 border-blue-500/20'
                                     }`}>
                                         {activity.type}
                                     </span>
                                 </div>
                                 <p className="text-xs text-slate-500 truncate">
                                     {activity.reason || (isPositive ? 'Stock Received' : 'Stock Adjusted')}
                                 </p>
                             </div>

                             <div className="text-right">
                                 <p className={`font-bold text-sm ${isPositive ? 'text-emerald-400' : 'text-slate-200'}`}>
                                     {isPositive ? '+' : '-'}{activity.quantity}
                                 </p>
                                 <p className="text-[10px] text-slate-500">
                                     {format(new Date(activity.created_at), 'MMM d, HH:mm')}
                                 </p>
                             </div>
                        </div>
                    )
                })}

                {(!activities || activities.length === 0) && (
                     <div className="py-8 text-center text-slate-500 text-sm">
                         No recent activity recorded
                     </div>
                )}
            </div>
        </div>
    )
}
