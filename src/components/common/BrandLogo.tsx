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
                    'relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#102419] to-[#0a150e] border border-emerald-500/30 p-1.5 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] transition-all duration-300 group-hover:border-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.45)]',
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
                        fill="url(#emerald-top)"
                        stroke="#34d399"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                    />
                    {/* Left Face */}
                    <path
                        d="M4 7.2L12 12V21.5L4 16.5V7.2Z"
                        fill="url(#emerald-left)"
                        stroke="#10b981"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                    />
                    {/* Right Face */}
                    <path
                        d="M12 12L20 7.2V16.5L12 21.5V12Z"
                        fill="url(#emerald-right)"
                        stroke="#059669"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                    />
                    {/* Glowing Core Dot / Inventory Anchor */}
                    <circle cx="12" cy="12" r="1.5" fill="#a7f3d0" className="animate-pulse" />

                    <defs>
                        <linearGradient id="emerald-top" x1="4" y1="2.5" x2="20" y2="12" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#10b981" stopOpacity="0.9" />
                            <stop offset="1" stopColor="#059669" stopOpacity="0.75" />
                        </linearGradient>
                        <linearGradient id="emerald-left" x1="4" y1="7.2" x2="12" y2="21.5" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#047857" stopOpacity="0.85" />
                            <stop offset="1" stopColor="#022c22" stopOpacity="0.95" />
                        </linearGradient>
                        <linearGradient id="emerald-right" x1="20" y1="7.2" x2="12" y2="21.5" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#065f46" stopOpacity="0.75" />
                            <stop offset="1" stopColor="#022c22" stopOpacity="0.9" />
                        </linearGradient>
                    </defs>
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
