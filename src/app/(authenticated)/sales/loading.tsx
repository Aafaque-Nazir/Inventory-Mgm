import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-8 p-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-2">
                 <Skeleton className="h-8 w-48 bg-white/5" />
                 <Skeleton className="h-4 w-64 bg-white/5" />
            </div>
            <Skeleton className="h-10 w-32 rounded-md bg-white/5" />
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl">
             <div className="p-6 border-b border-white/5">
                 <div className="flex items-center gap-2">
                     <Skeleton className="h-5 w-5 rounded-full bg-white/10" />
                     <Skeleton className="h-6 w-40 bg-white/10" />
                 </div>
             </div>
             <div className="divide-y divide-white/5">
                 {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                         <div className="space-y-2">
                             <Skeleton className="h-4 w-24 bg-white/10" />
                             <Skeleton className="h-3 w-16 bg-white/10" />
                         </div>
                         <div className="space-y-2 text-right">
                             <Skeleton className="h-4 w-32 bg-white/10" />
                             <Skeleton className="h-3 w-24 bg-white/10" />
                         </div>
                         <Skeleton className="h-6 w-20 bg-white/10" />
                    </div>
                 ))}
             </div>
        </div>
    </div>
  )
}
