'use client'

import { useChat } from '@ai-sdk/react'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Send,
    Trash2,
    Loader2,
    Package,
    TrendingDown,
    BarChart3,
    Truck,
} from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { PremiumAiLogo } from './PremiumAiLogo'
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

    const [input, setInput] = useState('')
    const {
        messages,
        status,
        setMessages,
        error,
        sendMessage,
    } = useChat()
    
    const isLoading = status === 'streaming' || status === 'submitted'
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return
        sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] })
        setInput('')
    }

    // Load chat history on first open
    useEffect(() => {
        if (isOpen && !historyLoaded) {
            loadHistory()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, historyLoaded])

    // Auto-scroll to bottom on new messages or loading state
    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isLoading, isOpen])

    // Scroll to bottom immediately when chat opens or history finishes loading
    useEffect(() => {
        if (isOpen && historyLoaded && messagesEndRef.current) {
            const timer = setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [isOpen, historyLoaded])

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            const timer = setTimeout(() => inputRef.current?.focus(), 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    async function loadHistory() {
        try {
            const history: ChatMessageType[] = await getChatHistory()
            if (history.length > 0) {
                setMessages(
                    history.map((msg) => ({
                        id: msg.id,
                        role: msg.role as 'user' | 'assistant',
                        content: msg.content,
                        parts: [{ type: 'text', text: msg.content }],
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
        if (isLoading) return
        sendMessage({ role: 'user', parts: [{ type: 'text', text: prompt }] })

    }

    const hasMessages = messages.length > 0

    return (
        <>
            {/* Floating trigger button - ALWAYS FIXED ON BOTTOM RIGHT */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.06, y: -2 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 border border-blue-400/30 transition-all duration-200"
                        aria-label="Open AI Assistant"
                    >
                        <PremiumAiLogo size={28} className="h-7 w-7 text-white" />
                        
                        {/* Live AI Dot indicator */}
                        <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-300" />
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat panel - FULLY RESPONSIVE FIXED BOTTOM RIGHT */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col w-[calc(100vw-2rem)] max-w-[400px] h-[calc(100vh-5rem)] max-h-[580px] rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden"
                    >
                        {/* Header - Single Blue Solid Color Theme */}
                        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/10 bg-slate-900/80">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                    <PremiumAiLogo size={22} className="h-5.5 w-5.5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-white tracking-wide">
                                            InvMaster AI
                                        </h3>
                                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                            PRO
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                                        Inventory Assistant
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {hasMessages && (
                                    <button
                                        onClick={handleClear}
                                        disabled={isClearing}
                                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    title="Close chat"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages area with explicit min-h-0 & visible chat-scrollbar */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 chat-scrollbar">
                            {!historyLoaded ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                                    <p className="text-xs text-slate-400">Loading chat history...</p>
                                </div>
                            ) : !hasMessages ? (
                                // Empty state with suggestions
                                <div className="flex flex-col items-center justify-center h-full space-y-5 py-4">
                                    <div className="text-center space-y-2">
                                        <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center mb-3">
                                            <PremiumAiLogo size={32} className="h-8 w-8 text-blue-400" />
                                        </div>
                                        <h4 className="text-base font-bold text-white tracking-tight">
                                            How can I help you today?
                                        </h4>
                                        <p className="text-xs text-slate-400 max-w-[250px] leading-relaxed">
                                            Ask about stock levels, revenue, suppliers, or low stock warnings.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 w-full px-1">
                                        {SUGGESTED_PROMPTS.map((prompt) => (
                                            <button
                                                key={prompt.text}
                                                onClick={() =>
                                                    handleSuggestedPrompt(
                                                        prompt.text
                                                    )
                                                }
                                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-blue-600/20 hover:border-blue-500/40 transition-all duration-200 text-left"
                                            >
                                                <prompt.icon className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" />
                                                <span className="line-clamp-2">{prompt.text}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Message list
                                <div className="space-y-4">
                                    {messages.map((message: unknown) => (
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
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex gap-3 items-start"
                                            >
                                                <div className="h-7 w-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                                                    <PremiumAiLogo size={16} className="h-4 w-4 text-blue-400" />
                                                </div>
                                                <div className="bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-1.5 shadow-md">
                                                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
                                                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
                                                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
                                                </div>
                                            </motion.div>
                                        )}
                                </div>
                            )}

                            {/* Error message */}
                            {error && (
                                <div className="text-center text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 leading-relaxed">
                                    {error.message?.includes('429') || error.message?.includes('Quota')
                                        ? 'API rate limit reached. Please wait 15 seconds before asking again.'
                                        : `Error: ${error.message || 'Something went wrong. Please try again.'}`}
                                </div>
                            )}


                            <div ref={messagesEndRef} className="h-2" />
                        </div>

                        {/* Input area */}
                        <div className="border-t border-white/10 px-3.5 sm:px-4 py-3 bg-slate-900/80">
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
                                    className="flex-1 h-10 rounded-xl bg-slate-950 border border-white/15 px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white flex items-center justify-center transition-all shadow-md shadow-blue-600/20 disabled:cursor-not-allowed flex-shrink-0"
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
