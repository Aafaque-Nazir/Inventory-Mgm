'use client'

interface PremiumAiLogoProps {
    className?: string
    size?: number
    animated?: boolean
    color?: string
}

export function PremiumAiLogo({
    className = 'h-6 w-6 text-blue-500',
    size = 24,
    animated = true,
    color = 'currentColor',
}: PremiumAiLogoProps) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-full h-full ${animated ? 'animate-pulse' : ''}`}
            >
                {/* Sleek, premium 4-point star / AI sparkle */}
                <path d="M12 2v20M2 12h20M12 2a10 10 0 0 1-10 10 10 10 0 0 1 10-10z" className="hidden" />
                <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z" fill={color} stroke="none" />
            </svg>
        </div>
    )
}
