'use client'

import { useChat } from 'ai/react'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles,
    X,
    Send,
    Trash2,
    Loader2,
    MessageSquare,
    Package,
    TrendingDown,
    BarChart3,
    Truck,
} from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { getChatHistory, clearChatHistory } from '@/app/actions/chat'
import type { ChatMessage as ChatMessageType } from '@/app/actions/chat'

const SUGGESTED_PROMPTS = [
    { text: 'Show low stock items', icon: TrendingDown },
    { text: 'Revenue this week', icon: BarChart3 },
    { text: 'Dead stock report', icon: Package },
    { text: 'List my suppliers', icon: Truck },
]

export function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [historyLoaded, setHistoryLoaded] = useState(false)
    const [isClearing, setIsClearing] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        setMessages,
        error,
    } = useChat({
        api: '/api/chat',
    })

    // Load chat history on first open
    useEffect(() => {
        if (isOpen && !historyLoaded) {
            loadHistory()
        }
    }, [isOpen, historyLoaded])

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300)
        }
    }, [isOpen])

    async function loadHistory() {
        try {
            const history: ChatMessageType[] = await getChatHistory()
            if (history.length > 0) {
                setMessages(
                    history.map((msg) => ({
                        id: msg.id,
                        role: msg.role,
                        content: msg.content,
                    }))
                )
            }
        } catch (err) {
            console.error('Failed to load chat history:', err)
        } finally {
            setHistoryLoaded(true)
        }
    }

    async function handleClear() {
        setIsClearing(true)
        try {
            const result = await clearChatHistory()
            if (!result.error) {
                setMessages([])
            }
        } catch (err) {
            console.error('Failed to clear history:', err)
        } finally {
            setIsClearing(false)
        }
    }

    function handleSuggestedPrompt(prompt: string) {
        // Programmatically set input and submit
        const syntheticEvent = {
            preventDefault: () => {},
        } as React.FormEvent<HTMLFormElement>

        // Use the setMessages + append pattern
        handleInputChange({
            target: { value: prompt },
        } as React.ChangeEvent<HTMLInputElement>)

        // Submit on next tick after input is set
        setTimeout(() => {
            const form = document.getElementById(
                'chat-form'
            ) as HTMLFormElement
            if (form) {
                form.requestSubmit()
            }
        }, 50)
    }

    const hasMessages = messages.length > 0

    return (
        <>
            {/* Floating trigger button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center hover:shadow-blue-500/40 transition-shadow duration-300 border border-blue-500/20"
                        aria-label="Open AI Chat"
                    >
                        <Sparkles className="h-6 w-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 right-6 z-50 flex flex-col w-[calc(100vw-3rem)] sm:w-[400px] h-[min(600px,calc(100vh-6rem))] rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-slate-950/80">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">
                                        InvMaster AI
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Inventory Assistant
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {hasMessages && (
                                    <button
                                        onClick={handleClear}
                                        disabled={isClearing}
                                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        title="Clear chat history"
                                    >
                                        {isClearing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                                    title="Close chat"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                            {!historyLoaded ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                                </div>
                            ) : !hasMessages ? (
                                // Empty state with suggestions
                                <div className="flex flex-col items-center justify-center h-full space-y-6">
                                    <div className="text-center space-y-2">
                                        <div className="h-14 w-14 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                                            <MessageSquare className="h-7 w-7 text-blue-400" />
                                        </div>
                                        <h4 className="text-base font-semibold text-white">
                                            Ask me anything
                                        </h4>
                                        <p className="text-xs text-slate-500 max-w-[250px]">
                                            I can check stock levels, sales
                                            data, suppliers, and more.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 w-full px-2">
                                        {SUGGESTED_PROMPTS.map((prompt) => (
                                            <button
                                                key={prompt.text}
                                                onClick={() =>
                                                    handleSuggestedPrompt(
                                                        prompt.text
                                                    )
                                                }
                                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 hover:text-white hover:bg-white/10 hover:border-blue-500/20 transition-all duration-200 text-left"
                                            >
                                                <prompt.icon className="h-3.5 w-3.5 flex-shrink-0 text-blue-400/60" />
                                                <span>{prompt.text}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Message list
                                <>
                                    {messages.map((message) => (
                                        <ChatMessage
                                            key={message.id}
                                            role={
                                                message.role as
                                                    | 'user'
                                                    | 'assistant'
                                            }
                                            content={message.content}
                                        />
                                    ))}

                                    {/* Typing indicator */}
                                    {isLoading &&
                                        messages[messages.length - 1]?.role ===
                                            'user' && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex gap-3 items-start"
                                            >
                                                <div className="h-7 w-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                                                    <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
                                                </div>
                                                <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 flex gap-1.5">
                                                    <span className="h-2 w-2 rounded-full bg-blue-400/60 animate-bounce [animation-delay:0ms]" />
                                                    <span className="h-2 w-2 rounded-full bg-blue-400/60 animate-bounce [animation-delay:150ms]" />
                                                    <span className="h-2 w-2 rounded-full bg-blue-400/60 animate-bounce [animation-delay:300ms]" />
                                                </div>
                                            </motion.div>
                                        )}
                                </>
                            )}

                            {/* Error message */}
                            {error && (
                                <div className="text-center text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                    Something went wrong. Please try again.
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input area */}
                        <div className="border-t border-white/5 px-4 py-3 bg-slate-950/80">
                            <form
                                id="chat-form"
                                onSubmit={handleSubmit}
                                className="flex items-center gap-2"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Ask about your inventory..."
                                    disabled={isLoading}
                                    className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-slate-600 text-white flex items-center justify-center transition-colors disabled:cursor-not-allowed"
                                    aria-label="Send message"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
