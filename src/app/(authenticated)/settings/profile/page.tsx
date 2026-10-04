import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { getCurrentUser, getCurrentProfile } from '@/lib/auth'

export default async function ProfileSettingsPage() {
    const [user, profile] = await Promise.all([
        getCurrentUser(),
        getCurrentProfile()
    ])

    if (!user || !profile) redirect('/login')

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-white">Profile</h3>
                <p className="text-slate-400">
                    Manage your personal account settings.
                </p>
            </div>

            <div className="rounded-2xl sm:rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl">
                <div className="p-4 sm:p-6 md:p-8 border-b border-white/5 bg-white/5">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">Your Profile</h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        This information is visible to your team.
                    </p>
                </div>

                <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-white/10 shadow-xl">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-indigo-600 text-3xl font-bold text-white">
                                {profile.full_name?.[0] || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-white">{profile.full_name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">
                                    {profile.role?.toLowerCase()}
                                </span>
                                <span className="text-sm text-slate-500">Joined {format(new Date(profile.created_at || new Date()), 'MMMM yyyy')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 border-t border-white/5 pt-6">
                        <div className="grid gap-2">
                            <span className="text-sm font-medium text-slate-400">Email Address</span>
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/20 border border-white/5 text-slate-200">
                                <span className="flex-1">{user.email}</span>
                                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Verified</span>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <span className="text-sm font-medium text-slate-400">Role & Permissions</span>
                            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                <p className="text-sm text-indigo-300">
                                    You are a <span className="font-semibold capitalize">{profile.role?.toLowerCase()}</span> in this organization.
                                    {profile.role === 'ADMIN'
                                        ? " You have full access to all features and settings."
                                        : " You have limited access based on your role."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
