import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for backend operations if available, or anon key

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Simple query to wake up the database
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })

    if (error) {
       // If profiles table doesn't exist or other error, try a simpler query or just connection check
       console.error('Keep-alive ping error:', error)
       return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Pong', timestamp: new Date().toISOString() }, { status: 200 })
  } catch (error: any) {
    console.error('Keep-alive error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
