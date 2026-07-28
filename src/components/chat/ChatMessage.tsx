'use client'

import { motion } from 'framer-motion'
import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
    role: 'user' | 'assistant'
    content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
    const isAssistant = role === 'assistant'

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
        >
            {isAssistant && (
                <div className="flex-shrink-0 mt-1">
                    <div className="h-7 w-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-400" />
                    </div>
                </div>
            )}

            <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isAssistant
                        ? 'bg-white/5 border border-white/5 text-slate-200'
                        : 'bg-blue-600 text-white'
                }`}
            >
                {isAssistant ? (
                    <AssistantContent content={content} />
                ) : (
                    <p className="whitespace-pre-wrap">{content}</p>
                )}
            </div>

            {!isAssistant && (
                <div className="flex-shrink-0 mt-1">
                    <div className="h-7 w-7 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-300" />
                    </div>
                </div>
            )}
        </motion.div>
    )
}

/**
 * Renders assistant messages with basic markdown-like formatting:
 * - Bold text (**text**)
 * - Bullet lists (- item or * item)
 * - Numbered lists (1. item)
 * - Line breaks
 */
function AssistantContent({ content }: { content: string }) {
    const lines = content.split('\n')

    return (
        <div className="space-y-1.5">
            {lines.map((line, i) => {
                const trimmed = line.trim()

                // Empty line = spacer
                if (!trimmed) return <div key={i} className="h-1" />

                // Bullet list
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    return (
                        <div key={i} className="flex gap-2 items-start">
                            <span className="text-blue-400 mt-0.5">•</span>
                            <span className="flex-1">
                                <FormattedText text={trimmed.slice(2)} />
                            </span>
                        </div>
                    )
                }

                // Numbered list
                const numberedMatch = trimmed.match(/^(\d+)\.\s(.+)/)
                if (numberedMatch) {
                    return (
                        <div key={i} className="flex gap-2 items-start">
                            <span className="text-blue-400 font-medium min-w-[1.25rem] text-right">
                                {numberedMatch[1]}.
                            </span>
                            <span className="flex-1">
                                <FormattedText text={numberedMatch[2]} />
                            </span>
                        </div>
                    )
                }

                // Regular paragraph
                return (
                    <p key={i}>
                        <FormattedText text={trimmed} />
                    </p>
                )
            })}
        </div>
    )
}

/** Handles **bold** formatting within text */
function FormattedText({ text }: { text: string }) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)

    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                        <strong key={i} className="font-semibold text-white">
                            {part.slice(2, -2)}
                        </strong>
                    )
                }
                return <span key={i}>{part}</span>
            })}
        </>
    )
}
