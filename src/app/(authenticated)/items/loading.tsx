import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Skeleton className="h-10 w-full md:max-w-sm rounded-xl bg-white/5" />
        <Skeleton className="h-5 w-32 bg-white/5" />
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20 bg-white/10" />
                <Skeleton className="h-4 w-20 bg-white/10 hidden md:block" />
                <Skeleton className="h-4 w-20 bg-white/10 hidden md:block" />
            </div>
        </div>
        <div className="divide-y divide-white/5">
             {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                         <Skeleton className="h-10 w-10 rounded-md bg-white/10" />
                         <div className="space-y-2">
                             <Skeleton className="h-4 w-32 bg-white/10" />
                             <Skeleton className="h-3 w-20 bg-white/10 md:hidden" />
                         </div>
                     </div>
                     <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
                     <Skeleton className="h-8 w-8 rounded-lg bg-white/10" />
                </div>
             ))}
        </div>
      </div>
    </div>
  )
}
