import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'
import {
  buildBossPrompt,
  getDateInTimeZone,
  getWeekdayInTimeZone,
  type BossPulseStatus,
} from '@/lib/boss-loop'
import { recalculateAndPersistOperatorScore } from '@/lib/operator-score'
import { createLogger } from '@/lib/logger'

const log = createLogger('boss-pulse')

const VALID_STATUSES = new Set<BossPulseStatus>(['completed', 'blocked', 'missed'])

function round2(value: number) {
  return Math.round(value * 100) / 100
}

export async function POST(request: NextRequest) {
  try {
    const serverSupabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, note } = await request.json()

    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Invalid pulse status' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const [profileRes, sprintRes] = await Promise.all([
      supabase.from('profiles').select('display_name, timezone').eq('id', user.id).single(),
      supabase.from('sprints')
        .select('*')
        .in('status', ['active', 'dip_week', 'completing'])
        .order('start_date', { ascending: false })
        .limit(1)
        .single(),
    ])

    if (!profileRes.data || !sprintRes.data) {
      return NextResponse.json({ error: 'Missing profile or active sprint' }, { status: 400 })
    }

    const profile = profileRes.data
    const sprint = sprintRes.data

    const [scoreRes, squadRes] = await Promise.all([
      supabase.from('operator_scores')
        .select('total_score')
        .eq('user_id', user.id)
        .eq('sprint_id', sprint.id)
        .is('week_number', null)
        .maybeSingle(),
      supabase.from('squad_members')
        .select(`
          id,
          squads!inner (
            sprint_id
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .eq('squads.sprint_id', sprint.id)
        .limit(1)
        .maybeSingle(),
    ])

    const timeZone = profile.timezone || 'America/Toronto'
    const localDate = getDateInTimeZone(timeZone)
    const weekday = getWeekdayInTimeZone(timeZone)
    const prompt = buildBossPrompt({
      firstName: profile.display_name?.split(' ')[0] || 'Operator',
      sprintNumber: sprint.number,
      currentWeek: sprint.current_week,
      weekday,
      hasSquad: Boolean(squadRes.data),
    })
    const nowIso = new Date().toISOString()

    const { data: existingPulse } = await supabase
      .from('boss_pulses')
      .select('id')
      .eq('user_id', user.id)
      .eq('sprint_id', sprint.id)
      .eq('pulse_date', localDate)
      .maybeSingle()

    if (existingPulse) {
      await supabase
        .from('boss_pulses')
        .update({
          status,
          response_note: note?.trim() || null,
          responded_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', existingPulse.id)
    } else {
      await supabase.from('boss_pulses').insert({
        user_id: user.id,
        sprint_id: sprint.id,
        pulse_date: localDate,
        status,
        channel: 'app',
        prompt_text: prompt,
        response_note: note?.trim() || null,
        sent_at: nowIso,
        responded_at: nowIso,
      })
    }

    const previousScore = Number(scoreRes.data?.total_score ?? 0)
    const summary = await recalculateAndPersistOperatorScore(supabase, sprint, user.id)
    const scoreDelta = round2(summary.total_score - previousScore)

    await supabase
      .from('boss_pulses')
      .update({
        score_after: summary.total_score,
        score_delta: scoreDelta,
        streak_after: summary.current_streak,
        updated_at: nowIso,
      })
      .eq('user_id', user.id)
      .eq('sprint_id', sprint.id)
      .eq('pulse_date', localDate)

    return NextResponse.json({
      pulse_date: localDate,
      status,
      score: summary.total_score,
      score_delta: scoreDelta,
      current_streak: summary.current_streak,
    })
  } catch (err: any) {
    log.error('Submit pulse failed', { error: err.message })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
