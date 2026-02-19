import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Keep-alive failed: Missing Supabase credentials')
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Simple query to wake up the database
    // "count" on a small table or system table is usually fast and sufficient
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })

    if (error) {
       console.error('Keep-alive ping error (Database might be sleeping):', error.message)
       // Even if it errors, the act of connecting might have woken it up. 
       // We return 200 so the monitoring service thinks it's "up" (at least the API is).
       // But we log the error.
       return NextResponse.json({ 
         status: 'warning', 
         message: 'Database might be waking up', 
         error: error.message,
         timestamp: new Date().toISOString() 
       }, { status: 200 })
    }

    return NextResponse.json({ 
      status: 'ok', 
      message: 'Pong', 
      timestamp: new Date().toISOString() 
    }, { status: 200 })
  } catch (error: any) {
    console.error('Keep-alive critical error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Explicitly handle HEAD requests (often used by uptime monitors)
export async function HEAD(request: Request) {
  return GET(request)
}
