import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Admin trigger endpoint — manually fire any agent action
// Protected: requires authenticated user with role 'admin' or 'founder'
//
// POST /api/admin/trigger
// { "agent": "facilitator", "action": "monday_declaration", "squad_id": "..." }

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || 'https://divisionalpha.net'

const VALID_AGENTS = ['facilitator', 'guardian', 'analytics', 'matchmaker', 'ceremonies', 'events', 'cron']

export async function POST(request: NextRequest) {
  try {
    // Auth check — must be admin/founder
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'founder'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { agent, ...params } = body

    if (!agent || !VALID_AGENTS.includes(agent)) {
      return NextResponse.json({
        error: `Invalid agent. Must be one of: ${VALID_AGENTS.join(', ')}`,
      }, { status: 400 })
    }

    // Route to the correct agent endpoint
    let url: string
    let method = 'POST'

    switch (agent) {
      case 'cron':
        url = `${BASE_URL}/api/agents/cron`
        method = 'GET'
        break
      case 'events':
        url = `${BASE_URL}/api/agents/events`
        break
      case 'ceremonies':
        url = `${BASE_URL}/api/agents/ceremonies`
        break
      case 'guardian':
        url = `${BASE_URL}/api/agents/guardian`
        break
      default:
        url = `${BASE_URL}/api/agents/${agent}`
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(method === 'POST' ? { body: JSON.stringify(params) } : {}),
    })

    const data = await res.json()

    return NextResponse.json({
      triggered: agent,
      params,
      status: res.ok ? 'success' : 'error',
      result: data,
    })
  } catch (err) {
    console.error('Admin trigger error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
