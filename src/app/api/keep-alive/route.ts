import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge' // Faster cold start, lower timeout risk

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Keep-alive failed: Missing Supabase credentials')
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    // Use service_role key to bypass RLS — guarantees the query reaches the DB.
    // The anon key might be blocked by RLS policies on the profiles table.
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    if (error) {
      console.error('Keep-alive DB error:', error.message)
      return NextResponse.json(
        {
          status: 'warning',
          message: 'Database may be waking up from pause',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        status: 'ok',
        message: 'Pong',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error: any) {
    const message =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('Keep-alive critical error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Explicitly handle HEAD requests (used by uptime monitors)
export async function HEAD() {
  return GET()
}
