import { NextRequest, NextResponse } from 'next/server'

// Cron Orchestrator — single endpoint called every 3 hours
// Dispatches to the right agents based on day of week and time
//
// Trigger via system cron on Coolify server:
//   0 */3 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://divisionalpha.net/api/agents/cron
//
// The orchestrator checks the current day/time and fires the appropriate agent actions.

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || 'https://divisionalpha.net'

// Auth: Vercel Cron sends CRON_SECRET header, or we check a shared secret
const CRON_SECRET = process.env.CRON_SECRET || ''

export async function GET(request: NextRequest) {
  // Verify cron auth
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use Eastern Time as the canonical schedule timezone (majority of users).
  // The server may run in UTC, so we convert before checking day/hour windows.
  const SCHEDULE_TZ = process.env.CRON_TIMEZONE || 'America/Toronto'
  const now = new Date()
  const localNow = new Date(now.toLocaleString('en-US', { timeZone: SCHEDULE_TZ }))
  const hour = localNow.getHours()
  const dayOfWeek = localNow.getDay() // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

  const actions: { agent: string; action: string; description: string }[] = []

  // ── Monday: Declaration prompts + email reminders ──
  if (dayOfWeek === 1 && hour >= 7 && hour <= 9) {
    actions.push({ agent: 'facilitator', action: 'monday_declaration', description: 'Monday declaration prompt' })
    actions.push({ agent: 'email', action: 'monday_reminder', description: 'Monday email reminder' })
  }

  // ── Wednesday: Check-in prompts + email reminders ──
  if (dayOfWeek === 3 && hour >= 11 && hour <= 13) {
    actions.push({ agent: 'facilitator', action: 'wednesday_checkin', description: 'Wednesday check-in prompt' })
    actions.push({ agent: 'email', action: 'wednesday_reminder', description: 'Wednesday email reminder' })
  }

  // ── Friday: Reflection prompts + email reminders ──
  if (dayOfWeek === 5 && hour >= 14 && hour <= 16) {
    actions.push({ agent: 'facilitator', action: 'friday_reflection', description: 'Friday reflection prompt' })
    actions.push({ agent: 'email', action: 'friday_reminder', description: 'Friday email reminder' })
  }

  // ── Friday night: Weekly summary + score calculation ──
  if (dayOfWeek === 5 && hour >= 21 && hour <= 23) {
    actions.push({ agent: 'facilitator', action: 'weekly_summary', description: 'Weekly summary' })
    actions.push({ agent: 'analytics', action: 'calculate_all_scores', description: 'Calculate all operator scores' })
  }

  // ── Guardian: Every 6 hours on weekdays ──
  if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour % 6 === 0) {
    actions.push({ agent: 'guardian', action: 'scan', description: 'Guardian engagement scan' })
  }

  // ── Late Monday/Wednesday: Nudge non-submitters ──
  if (dayOfWeek === 1 && hour >= 21 && hour <= 23) {
    actions.push({ agent: 'facilitator', action: 'monday_declaration', description: 'Late Monday nudge for non-declarers' })
  }
  if (dayOfWeek === 3 && hour >= 21 && hour <= 23) {
    actions.push({ agent: 'facilitator', action: 'wednesday_checkin', description: 'Late Wednesday nudge for non-checkins' })
  }

  if (actions.length === 0) {
    return NextResponse.json({ message: 'No actions scheduled for this time', day: dayOfWeek, hour })
  }

  // Fire all actions
  const results = []
  for (const action of actions) {
    try {
      const url = action.agent === 'email'
        ? `${BASE_URL}/api/email`
        : action.agent === 'guardian'
          ? `${BASE_URL}/api/agents/guardian`
          : `${BASE_URL}/api/agents/${action.agent}`

      const body = action.agent === 'guardian'
        ? {}
        : { action: action.action }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      results.push({ ...action, status: res.ok ? 'success' : 'error', data })
    } catch (err: any) {
      results.push({ ...action, status: 'error', error: err.message })
    }
  }

  return NextResponse.json({
    timestamp: now.toISOString(),
    timezone: SCHEDULE_TZ,
    local_time: localNow.toISOString(),
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
    hour,
    actions_fired: results.length,
    results,
  })
}
