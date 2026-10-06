import React from 'react'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
    className?: string
    size?: 'sm' | 'md' | 'lg'
    collapsed?: boolean
    showTagline?: boolean
}

export function BrandLogo({
    className,
    size = 'md',
    collapsed = false,
    showTagline = true,
}: BrandLogoProps) {
    const iconSizeClasses = {
        sm: 'h-7 w-7',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
    }

    const titleSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-xl',
    }

    return (
        <div className={cn('flex items-center gap-2.5 select-none group', className)}>
            {/* Custom Isometric Hex-Prism Brand Icon */}
            <div
                className={cn(
                    'relative shrink-0 flex items-center justify-center rounded-xl bg-[#0f1712] border border-emerald-500/30 p-1.5 transition-colors duration-200 group-hover:border-emerald-400',
                    iconSizeClasses[size]
                )}
            >
                {/* Custom Isometric Box / Neural Supply Cube SVG */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                >
                    {/* Top Face */}
                    <path
                        d="M12 2.5L20 7.2L12 12L4 7.2L12 2.5Z"
                        fill="#10b981"
                        stroke="#34d399"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                    />
                    {/* Left Face */}
                    <path
                        d="M4 7.2L12 12V21.5L4 16.5V7.2Z"
                        fill="#059669"
                        stroke="#10b981"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                    />
                    {/* Right Face */}
                    <path
                        d="M12 12L20 7.2V16.5L12 21.5V12Z"
                        fill="#047857"
                        stroke="#059669"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                    />
                    {/* Core Dot / Anchor */}
                    <circle cx="12" cy="12" r="1.5" fill="#a7f3d0" />
                </svg>
            </div>

            {/* Typography */}
            {!collapsed && (
                <div className="flex flex-col leading-tight min-w-0">
                    <div className="flex items-center gap-1">
                        <span className={cn('font-bold tracking-tight text-white', titleSizeClasses[size])}>
                            Inv<span className="text-emerald-400">Master</span>
                        </span>
                        <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 tracking-wider uppercase">
                            OS
                        </span>
                    </div>
                    {showTagline && (
                        <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase truncate">
                            Inventory Intelligence
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
