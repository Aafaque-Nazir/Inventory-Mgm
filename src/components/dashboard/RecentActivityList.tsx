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
        <div className="col-span-1 lg:col-span-5 xl:col-span-4 rounded-xl sm:rounded-2xl border border-white/10 bg-[#111613] p-3.5 sm:p-4 backdrop-blur-xl flex flex-col justify-between shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
             <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-sm sm:text-base font-semibold text-white">Recent Activity</h3>
                    <p className="text-[11px] text-slate-400">Latest stock movements across warehouses</p>
                </div>
                <Link href="/reports" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
                    View All <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            <div className="space-y-1.5 sm:space-y-2 flex-1 overflow-y-auto max-h-[260px] pr-0.5 custom-scrollbar">
                {activities?.map((activity) => {
                    const Icon = iconMap[activity.type] || Package
                    const isPositive = activity.type === 'IN'

                    return (
                        <div 
                            key={activity.id}
                            className="group flex items-center gap-2.5 sm:gap-3 p-2 rounded-lg border border-transparent hover:border-white/5 hover:bg-[#162019] transition-all"
                        >
                             <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                 isPositive ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20'
                             }`}>
                                 <Icon className="h-4 w-4" />
                             </div>
                             
                             <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-1.5">
                                     <p className="font-medium text-xs sm:text-sm text-slate-200 truncate">{activity.item?.name || 'Unknown Item'}</p>
                                     <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                         isPositive 
                                             ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                                             : 'text-teal-400 bg-teal-500/10 border-teal-500/20'
                                     }`}>
                                         {activity.type}
                                     </span>
                                 </div>
                                 <p className="text-[11px] text-slate-400 truncate">
                                     {activity.reason || (isPositive ? 'Stock Received' : 'Stock Adjusted')}
                                 </p>
                             </div>

                             <div className="text-right shrink-0">
                                 <p className={`font-bold text-xs sm:text-sm ${isPositive ? 'text-emerald-400' : 'text-slate-200'}`}>
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
                     <div className="py-6 text-center text-slate-500 text-xs sm:text-sm">
                         No recent activity recorded
                     </div>
                )}
            </div>
        </div>
    )
}
