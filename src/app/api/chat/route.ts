import { createClient } from '@/lib/supabase/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText } from 'ai'
import { createChatTools } from './tools'

export const maxDuration = 30

const SYSTEM_PROMPT = `You are InvMaster AI — a smart, friendly inventory assistant for a business using InvMaster (an inventory management platform).

YOUR ROLE:
- You help users understand their inventory, stock levels, sales, suppliers, and business metrics.
- You are READ-ONLY. You NEVER modify data. You only retrieve and analyze information.
- You answer in a clear, concise, and helpful manner.
- When presenting data, use formatted lists or tables for clarity.
- If numbers involve currency, use ₹ (Indian Rupees) symbol.
- Keep responses focused and actionable — not overly verbose.

CAPABILITIES (via tools):
- Check stock levels for any item or category
- Find low stock / critical stock items
- Identify dead stock (items with no movement)
- View sales data and revenue trends
- List suppliers and their contact info
- Show recent stock movements (IN/OUT)
- Provide dashboard metrics (totals, values)

BOUNDARIES:
- If asked to create, update, or delete anything — politely decline and explain you are read-only.
- If asked something outside inventory management — politely redirect to inventory-related topics.
- If you don't have enough data to answer, say so honestly rather than guessing.
- Never expose internal system details, database structure, or API keys.

PERSONALITY:
- Professional but approachable
- Use simple English (the users may not be native English speakers)
- Brief answers are better than long ones
- Use emojis sparingly for emphasis (📦 📊 ⚠️ ✅)`

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
        if (!apiKey) {
            console.error('Chat API Error: Missing GOOGLE_GENERATIVE_AI_API_KEY in environment variables.')
            return new Response(
                'Missing GOOGLE_GENERATIVE_AI_API_KEY in environment variables. Please restart your dev server after setting it in .env.local.',
                { status: 500 }
            )
        }

        const google = createGoogleGenerativeAI({ apiKey })


        // 1. Auth check
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return new Response('Unauthorized', { status: 401 })
        }

        // 2. Get organization ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

        if (!profile?.organization_id) {
            return new Response('Organization not found', { status: 400 })
        }

        const organizationId = profile.organization_id

        // 3. Parse request body
        const { messages } = await req.json()

        // 4. Create org-scoped tools
        const tools = createChatTools(organizationId, supabase)
        
        // 5. Stream response from Gemini
        const result = streamText({
            model: google('gemini-1.5-flash'),
            system: SYSTEM_PROMPT,
            messages,
            tools,
            onFinish: async ({ text }) => {
                // 6. Persist messages (user's last message + assistant response)
                if (text) {
                    const userMessage = messages[messages.length - 1]

                    const messagesToInsert = []

                    if (userMessage && userMessage.role === 'user') {
                        let userText = userMessage.content || ''
                        if (!userText && userMessage.parts) {
                            userText = userMessage.parts.map((p: any) => p.text || '').join('')
                        }

                        messagesToInsert.push({
                            user_id: user.id,
                            organization_id: organizationId,
                            role: 'user' as const,
                            content: userText,
                        })
                    }

                    messagesToInsert.push({
                        user_id: user.id,
                        organization_id: organizationId,
                        role: 'assistant' as const,
                        content: text,
                    })

                    await supabase
                        .from('chat_messages')
                        .insert(messagesToInsert)

                    // Enforce 50-message limit: delete oldest messages beyond limit
                    const { data: allMessages } = await supabase
                        .from('chat_messages')
                        .select('id')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })

                    if (allMessages && allMessages.length > 50) {
                        const idsToDelete = allMessages
                            .slice(50)
                            .map((m) => m.id)
                        await supabase
                            .from('chat_messages')
                            .delete()
                            .in('id', idsToDelete)
                    }
                }
            },
        })

        return result.toUIMessageStreamResponse()
    } catch (error: any) {
        console.error('Chat API Error Trace:', error)
        const message =
            error instanceof Error ? error.message : 'Internal server error'
        return new Response(message, { status: 500 })
    }
}

