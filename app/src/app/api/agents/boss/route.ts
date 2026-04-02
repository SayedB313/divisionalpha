import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  buildBossPrompt,
  getDateInTimeZone,
  getWeekdayInTimeZone,
} from '@/lib/boss-loop'
import { createLogger } from '@/lib/logger'
import { dailyBossNudge, dailyBossPulse, sendEmail } from '@/lib/email'
import { recalculateAndPersistOperatorScore } from '@/lib/operator-score'

const log = createLogger('boss')

type EligibleUser = {
  id: string
  display_name: string
  email: string | null
  timezone: string | null
  sprint_reminders: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    const supabase = createServiceClient()

    const { data: sprint } = await supabase
      .from('sprints')
      .select('*')
      .in('status', ['active', 'dip_week', 'completing'])
      .order('start_date', { ascending: false })
      .limit(1)
      .single()

    if (!sprint) {
      return NextResponse.json({ message: 'No active sprint' })
    }

    switch (action) {
      case 'dispatch_daily_pulse':
        return await dispatchDailyPulse(supabase, sprint)
      case 'pulse_nudge':
        return await sendPulseNudges(supabase, sprint)
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err: any) {
    log.error('Boss route error', { error: err.message })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function loadEligibleUsers(supabase: any): Promise<EligibleUser[]> {
  const { data: users } = await supabase
    .from('profiles')
    .select('id, display_name, email, timezone')
    .eq('status', 'active')
    .in('subscription_status', [...ACTIVE_SUBSCRIPTION_STATUSES])

  const userIds = (users ?? []).map((user: any) => user.id)
  const { data: prefs } = userIds.length > 0
    ? await supabase
        .from('notification_preferences')
        .select('user_id, sprint_reminders')
        .in('user_id', userIds)
    : { data: [] as any[] }

  const prefMap = new Map((prefs ?? []).map((pref: any) => [pref.user_id, pref.sprint_reminders]))

  return (users ?? []).map((user: any) => ({
    ...user,
    sprint_reminders: prefMap.get(user.id) ?? true,
  }))
}

async function loadSquadUserIds(supabase: any, sprintId: string) {
  const { data } = await supabase
    .from('squad_members')
    .select(`
      user_id,
      squads!inner (
        sprint_id
      )
    `)
    .eq('status', 'active')
    .eq('squads.sprint_id', sprintId)

  return new Set((data ?? []).map((row: any) => row.user_id))
}

async function dispatchDailyPulse(supabase: any, sprint: any) {
  const users = await loadEligibleUsers(supabase)
  const squadUserIds = await loadSquadUserIds(supabase, sprint.id)
  const nowIso = new Date().toISOString()
  const impactedUsers = new Set<string>()
  const results: any[] = []

  for (const user of users) {
    const timeZone = user.timezone || 'America/Toronto'
    const localDate = getDateInTimeZone(timeZone)
    const weekday = getWeekdayInTimeZone(timeZone)
    const firstName = user.display_name?.split(' ')[0] || 'Operator'

    const { data: reconciledMisses } = await supabase
      .from('boss_pulses')
      .update({
        status: 'missed',
        responded_at: nowIso,
        updated_at: nowIso,
      })
      .eq('user_id', user.id)
      .eq('sprint_id', sprint.id)
      .eq('status', 'pending')
      .lt('pulse_date', localDate)
      .select('id')

    if ((reconciledMisses ?? []).length > 0) {
      impactedUsers.add(user.id)
    }

    const { data: existingPulse } = await supabase
      .from('boss_pulses')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('sprint_id', sprint.id)
      .eq('pulse_date', localDate)
      .maybeSingle()

    if (existingPulse) {
      results.push({
        user: user.display_name,
        local_date: localDate,
        status: 'already_exists',
        pulse_status: existingPulse.status,
      })
      continue
    }

    const prompt = buildBossPrompt({
      firstName,
      sprintNumber: sprint.number,
      currentWeek: sprint.current_week,
      weekday,
      hasSquad: squadUserIds.has(user.id),
    })

    await supabase.from('boss_pulses').insert({
      user_id: user.id,
      sprint_id: sprint.id,
      pulse_date: localDate,
      status: 'pending',
      channel: 'system',
      prompt_text: prompt,
      sent_at: nowIso,
    })

    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Daily Boss Pulse',
      body: prompt,
      type: 'sprint_reminder',
      action_page: 'boss',
      action_data: { pulse_date: localDate },
    })

    if (user.sprint_reminders && user.email) {
      try {
        await sendEmail(dailyBossPulse(user.email, user.display_name, prompt, sprint.number, sprint.current_week))
      } catch (err: any) {
        log.warn('Daily pulse email failed', { user_id: user.id, error: err.message })
      }
    }

    results.push({
      user: user.display_name,
      local_date: localDate,
      status: 'created',
    })
  }

  for (const userId of impactedUsers) {
    await recalculateAndPersistOperatorScore(supabase, sprint, userId)
  }

  return NextResponse.json({
    sprint: sprint.number,
    dispatched: results.filter((result) => result.status === 'created').length,
    reconciled_misses: impactedUsers.size,
    results,
  })
}

async function sendPulseNudges(supabase: any, sprint: any) {
  const users = await loadEligibleUsers(supabase)
  const nowIso = new Date().toISOString()
  const results: any[] = []

  for (const user of users) {
    const timeZone = user.timezone || 'America/Toronto'
    const localDate = getDateInTimeZone(timeZone)

    const { data: pulse } = await supabase
      .from('boss_pulses')
      .select('id, status, nudge_sent_at')
      .eq('user_id', user.id)
      .eq('sprint_id', sprint.id)
      .eq('pulse_date', localDate)
      .maybeSingle()

    if (!pulse || pulse.status !== 'pending' || pulse.nudge_sent_at) {
      continue
    }

    await supabase
      .from('boss_pulses')
      .update({ nudge_sent_at: nowIso, updated_at: nowIso })
      .eq('id', pulse.id)

    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Boss pulse still open',
      body: 'Today is still on the board. Answer before the day closes.',
      type: 'nudge',
      action_page: 'boss',
      action_data: { pulse_date: localDate },
    })

    if (user.sprint_reminders && user.email) {
      try {
        await sendEmail(dailyBossNudge(user.email, user.display_name))
      } catch (err: any) {
        log.warn('Boss nudge email failed', { user_id: user.id, error: err.message })
      }
    }

    results.push({
      user: user.display_name,
      local_date: localDate,
      status: 'nudged',
    })
  }

  return NextResponse.json({
    sprint: sprint.number,
    nudged: results.length,
    results,
  })
}
