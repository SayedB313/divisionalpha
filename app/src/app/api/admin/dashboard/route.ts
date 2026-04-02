import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'

const ENTER_PRICE = 19
const PROVEN_PRICE = 49
const ELITE_PRICE = 149

function isPaying(status: string | null | undefined) {
  return status === 'active' || status === 'trialing'
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'founder'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const sprintRes = await service
      .from('sprints')
      .select('*')
      .in('status', ['handshake', 'active', 'dip_week', 'completing'])
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    const sprint = sprintRes.data

    const [
      profilesRes,
      applicationsRes,
      activeSquadsRes,
      atRiskRes,
      pausesRes,
      recentEventsRes,
      scoresRes,
      bossPulsesRes,
    ] = await Promise.all([
      service.from('profiles').select('id, display_name, email, status, tier, subscription_status, sprints_completed, created_at'),
      service.from('applications').select('id, status, created_at', { count: 'exact' }),
      sprint
        ? service.from('squads').select('id, name, member_count, health_score, completion_rate, status, streak').eq('sprint_id', sprint.id).in('status', ['active', 'completing'])
        : Promise.resolve({ data: [] }),
      service.from('admin_at_risk_users').select('*').limit(20),
      service.from('pauses').select('paused_at, user_id, profile:profiles(display_name)').eq('status', 'active').limit(20),
      service.from('agent_events').select('source_agent, target_agent, event_type, processed, created_at').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).order('created_at', { ascending: false }).limit(20),
      sprint
        ? service.from('operator_scores').select('user_id, total_score, current_streak, best_streak').eq('sprint_id', sprint.id).is('week_number', null)
        : Promise.resolve({ data: [] }),
      sprint
        ? service.from('boss_pulses').select('user_id, pulse_date, status, responded_at').eq('sprint_id', sprint.id)
        : Promise.resolve({ data: [] }),
    ])

    const profiles = profilesRes.data ?? []
    const scores = scoresRes.data ?? []
    const bossPulses = bossPulsesRes.data ?? []
    const squads = activeSquadsRes.data ?? []

    const scoreMap = new Map<string, number>(scores.map((score: any) => [score.user_id, Number(score.total_score ?? 0)] as const))

    let enterCount = 0
    let provenCount = 0
    let eliteCount = 0
    let payingCount = 0

    for (const member of profiles as any[]) {
      const active = member.status === 'active'
      const score = Number(scoreMap.get(member.id) ?? 0)
      const elite = member.tier === 3 || (score >= 90 && (member.sprints_completed ?? 0) >= 2)
      const proven = !elite && (member.tier === 2 || score >= 70)

      if (isPaying(member.subscription_status)) payingCount += 1

      if (!active) continue

      if (elite) eliteCount += 1
      else if (proven) provenCount += 1
      else enterCount += 1
    }

    const activeUsers = enterCount + provenCount + eliteCount
    const pausedUsers = profiles.filter((member: any) => member.status === 'paused').length
    const churnedUsers = profiles.filter((member: any) => member.status === 'churned').length

    const estimatedMrr = enterCount * ENTER_PRICE + provenCount * PROVEN_PRICE + eliteCount * ELITE_PRICE
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((sum: number, score: any) => sum + Number(score.total_score ?? 0), 0) / scores.length)
      : 0

    const today = new Date().toISOString().slice(0, 10)
    const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const fourteenDaysAgo = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const pulsesToday = bossPulses.filter((pulse: any) => pulse.pulse_date === today)
    const pulses7d = bossPulses.filter((pulse: any) => pulse.pulse_date >= sevenDaysAgo)
    const pulses14d = bossPulses.filter((pulse: any) => pulse.pulse_date >= fourteenDaysAgo)

    const answered7d = pulses7d.filter((pulse: any) => ['completed', 'blocked', 'missed'].includes(pulse.status))
    const answerRate7d = pulses7d.length > 0 ? Math.round((answered7d.length / pulses7d.length) * 100) : 0
    const respondedUsers7d = new Set(answered7d.map((pulse: any) => pulse.user_id))
    const respondedUsers14d = new Set(
      pulses14d
        .filter((pulse: any) => ['completed', 'blocked', 'missed'].includes(pulse.status))
        .map((pulse: any) => pulse.user_id),
    )

    const provenReady = scores.filter((score: any) => Number(score.total_score ?? 0) >= 70).length
    const eliteCandidates = profiles.filter((member: any) => {
      const score = scoreMap.get(member.id) ?? 0
      return Number(score) >= 90 && (member.sprints_completed ?? 0) >= 2
    }).length

    return NextResponse.json({
      sprint: sprint ? {
        id: sprint.id,
        name: sprint.name,
        number: sprint.number,
        current_week: sprint.current_week,
        status: sprint.status,
        duration_weeks: sprint.duration_weeks,
      } : null,
      pricing: {
        enter: ENTER_PRICE,
        proven: PROVEN_PRICE,
        elite: ELITE_PRICE,
      },
      thresholds: {
        enter: 30,
        proven: 70,
        elite: 90,
      },
      kpis: {
        total_users: profiles.length,
        active_users: activeUsers,
        paying_users: payingCount,
        paused_users: pausedUsers,
        churned_users: churnedUsers,
        avg_operator_score: avgScore,
        monthly_revenue_estimate: estimatedMrr,
        arr_estimate: estimatedMrr * 12,
      },
      tiers: {
        enter: enterCount,
        proven: provenCount,
        elite: eliteCount,
      },
      boss: {
        pulses_sent_today: pulsesToday.length,
        answered_today: pulsesToday.filter((pulse: any) => ['completed', 'blocked', 'missed'].includes(pulse.status)).length,
        blocked_today: pulsesToday.filter((pulse: any) => pulse.status === 'blocked').length,
        missed_today: pulsesToday.filter((pulse: any) => pulse.status === 'missed').length,
        answer_rate_7d: answerRate7d,
      },
      retention: {
        active_7d: respondedUsers7d.size,
        active_14d: respondedUsers14d.size,
      },
      funnel: {
        submitted_applications: applicationsRes.count || 0,
        paying_users: payingCount,
        proven_unlock_volume: provenReady,
        elite_candidate_pipeline: eliteCandidates,
      },
      squads: {
        active_count: squads.length,
        avg_health_score: squads.length > 0
          ? Math.round(squads.reduce((sum: number, squad: any) => sum + Number(squad.health_score ?? 0), 0) / squads.length)
          : 0,
        avg_completion_rate: squads.length > 0
          ? Math.round(squads.reduce((sum: number, squad: any) => sum + Number(squad.completion_rate ?? 0), 0) / squads.length)
          : 0,
        list: squads.map((squad: any) => ({
          id: squad.id,
          name: squad.name,
          members: squad.member_count,
          health: squad.health_score,
          completion: squad.completion_rate,
          streak: squad.streak,
        })),
      },
      at_risk: {
        count: (atRiskRes.data || []).length,
        users: (atRiskRes.data || []).map((entry: any) => ({
          name: entry.display_name,
          squad_name: entry.squad_name,
          consecutive_misses: entry.consecutive_misses,
          latest_event: entry.latest_event,
          event_at: entry.event_at,
        })),
      },
      active_pauses: {
        count: (pausesRes.data || []).length,
        users: (pausesRes.data || []).map((entry: any) => ({
          name: entry.profile?.display_name,
          paused_at: entry.paused_at,
          user_id: entry.user_id,
        })),
      },
      recent_agent_activity: {
        last_24h: (recentEventsRes.data || []).length,
        events: recentEventsRes.data || [],
      },
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
