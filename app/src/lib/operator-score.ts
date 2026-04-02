import { ACTIVE_SUBSCRIPTION_STATUSES, type BossPulseStatus } from '@/lib/boss-loop'

interface PulseRow {
  pulse_date: string
  status: BossPulseStatus
  response_note: string | null
}

export interface OperatorScoreSummary {
  user_id: string
  sprint_id: string
  total_score: number
  goal_completion: number
  attendance: number
  squad_contribution: number
  leadership: number
  growth: number
  communication: number
  current_streak: number
  best_streak: number
  last_pulse_date: string | null
  last_pulse_status: BossPulseStatus | null
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value))
}

function getPulseStats(rows: PulseRow[]) {
  const ordered = [...rows].sort((a, b) => a.pulse_date.localeCompare(b.pulse_date))
  let bestStreak = 0
  let runningStreak = 0

  for (const row of ordered) {
    if (row.status === 'completed' || row.status === 'blocked') {
      runningStreak += 1
      bestStreak = Math.max(bestStreak, runningStreak)
    } else {
      runningStreak = 0
    }
  }

  let currentStreak = 0
  for (let i = ordered.length - 1; i >= 0; i -= 1) {
    const row = ordered[i]
    if (row.status === 'completed' || row.status === 'blocked') {
      currentStreak += 1
    } else {
      break
    }
  }

  const totalPulses = ordered.length
  const earnedPoints = ordered.reduce((sum, row) => {
    if (row.status === 'completed') return sum + 1
    if (row.status === 'blocked') return sum + 0.75
    return sum
  }, 0)

  return {
    totalPulses,
    pulseConsistency: totalPulses > 0 ? (earnedPoints / totalPulses) * 100 : 0,
    currentStreak,
    bestStreak,
    lastPulseDate: ordered.at(-1)?.pulse_date || null,
    lastPulseStatus: ordered.at(-1)?.status || null,
  }
}

export async function listEligibleScoreUsers(supabase: any) {
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('status', 'active')
    .in('subscription_status', [...ACTIVE_SUBSCRIPTION_STATUSES])

  return data ?? []
}

export async function calculateOperatorScoreSummary(
  supabase: any,
  sprint: any,
  userId: string
): Promise<OperatorScoreSummary> {
  const week = Math.max(Number(sprint.current_week ?? 1), 1)

  const [declarationsRes, checkinsRes, reflectionsRes, memberRes, pulsesRes] = await Promise.all([
    supabase.from('declarations').select('goals').eq('user_id', userId).eq('sprint_id', sprint.id),
    supabase.from('checkins').select('signals').eq('user_id', userId).eq('sprint_id', sprint.id),
    supabase.from('reflections').select('wins, misses, learnings').eq('user_id', userId).eq('sprint_id', sprint.id),
    supabase.from('squad_members').select('squad_id, role').eq('user_id', userId).eq('status', 'active').limit(1).maybeSingle(),
    supabase.from('boss_pulses').select('pulse_date, status, response_note').eq('user_id', userId).eq('sprint_id', sprint.id),
  ])

  const declarations = declarationsRes.data ?? []
  const checkins = checkinsRes.data ?? []
  const reflections = reflectionsRes.data ?? []
  const memberData = memberRes.data
  const pulses = (pulsesRes.data ?? []) as PulseRow[]

  let totalGoals = 0
  let greenGoals = 0
  for (const checkin of checkins) {
    const signals = (checkin.signals as { signal: string }[]) ?? []
    totalGoals += signals.length
    greenGoals += signals.filter((signal) => signal.signal === 'green').length
  }

  const declarationCount = declarations.length
  const checkinCount = checkins.length
  const reflectionCount = reflections.length

  const pulseStats = getPulseStats(pulses)
  const weeklyExpected = week * 3
  const weeklyActual = declarationCount + checkinCount + reflectionCount
  const weeklyAttendance = weeklyExpected > 0 ? Math.min((weeklyActual / weeklyExpected) * 100, 100) : 0

  let goalCompletion = totalGoals > 0 ? (greenGoals / totalGoals) * 100 : 0
  if (totalGoals === 0 && (declarationCount > 0 || pulseStats.totalPulses > 0)) {
    goalCompletion = clamp(35 + pulseStats.pulseConsistency * 0.6 + Math.min(declarationCount * 5, 15))
  }

  const attendance = pulseStats.totalPulses > 0
    ? clamp(weeklyAttendance * 0.45 + pulseStats.pulseConsistency * 0.55)
    : weeklyAttendance

  let squadContribution = 0
  let leadership = 0

  if (memberData?.squad_id) {
    const [msgRes, appreciationRes] = await Promise.all([
      supabase.from('squad_messages').select('*', { count: 'exact', head: true })
        .eq('sender_id', userId)
        .eq('squad_id', memberData.squad_id),
      supabase.from('reflections').select('appreciated_user_ids')
        .eq('sprint_id', sprint.id)
        .contains('appreciated_user_ids', [userId]),
    ])

    const msgScore = Math.min(((msgRes.count || 0) / Math.max(week * 3, 1)) * 100, 100)
    const appreciationScore = Math.min(((appreciationRes.data?.length || 0) / week) * 100, 100)
    squadContribution = clamp(msgScore * 0.5 + appreciationScore * 0.25 + pulseStats.pulseConsistency * 0.25)

    const isCaptain = memberData.role === 'captain'
    leadership = isCaptain
      ? clamp(Math.max(88, squadContribution))
      : clamp(squadContribution * 0.55 + pulseStats.currentStreak * 4 + pulseStats.pulseConsistency * 0.15, 45, 95)
  } else {
    squadContribution = clamp(attendance * 0.5 + pulseStats.pulseConsistency * 0.5)
    leadership = clamp(Math.max(50, pulseStats.currentStreak * 8 + pulseStats.pulseConsistency * 0.25), 0, 95)
  }

  const weeklyRates = checkins.map((checkin: any) => {
    const signals = (checkin.signals as { signal: string }[]) ?? []
    const greens = signals.filter((signal) => signal.signal === 'green').length
    return signals.length > 0 ? (greens / signals.length) * 100 : 0
  })

  let growth = 50
  if (weeklyRates.length >= 2) {
    const recent = weeklyRates[weeklyRates.length - 1]
    const earlier = weeklyRates[0]
    growth = recent >= earlier
      ? clamp(70 + (recent - earlier), 35, 100)
      : clamp(50 - (earlier - recent), 30, 90)
  } else if (pulseStats.totalPulses > 0) {
    growth = clamp(45 + pulseStats.pulseConsistency * 0.45 + Math.min(pulseStats.currentStreak, 5) * 3, 35, 95)
  }

  let communication = 50
  if (reflections.length > 0) {
    const reflectionQuality = reflections.reduce((sum: number, reflection: any) => {
      let score = 0
      if (reflection.wins && reflection.wins.length > 20) score += 33
      if (reflection.misses && reflection.misses.length > 20) score += 33
      if (reflection.learnings && reflection.learnings.length > 20) score += 34
      return sum + score
    }, 0) / reflections.length
    communication = clamp(reflectionQuality + 20)
  } else if (pulseStats.totalPulses > 0) {
    const meaningfulNotes = pulses.filter((pulse) => (pulse.response_note || '').trim().length >= 20).length
    communication = clamp(55 + meaningfulNotes * 8 + pulseStats.pulseConsistency * 0.15, 40, 95)
  }

  const totalScore =
    goalCompletion * 0.25 +
    attendance * 0.20 +
    squadContribution * 0.20 +
    leadership * 0.15 +
    growth * 0.10 +
    communication * 0.10

  return {
    user_id: userId,
    sprint_id: sprint.id,
    total_score: round2(totalScore),
    goal_completion: round2(goalCompletion),
    attendance: round2(attendance),
    squad_contribution: round2(squadContribution),
    leadership: round2(leadership),
    growth: round2(growth),
    communication: round2(communication),
    current_streak: pulseStats.currentStreak,
    best_streak: pulseStats.bestStreak,
    last_pulse_date: pulseStats.lastPulseDate,
    last_pulse_status: pulseStats.lastPulseStatus,
  }
}

export async function recalculateAndPersistOperatorScore(
  supabase: any,
  sprint: any,
  userId: string
) {
  const summary = await calculateOperatorScoreSummary(supabase, sprint, userId)

  await supabase.from('operator_scores').upsert({
    user_id: summary.user_id,
    sprint_id: summary.sprint_id,
    week_number: null,
    total_score: summary.total_score,
    goal_completion: summary.goal_completion,
    attendance: summary.attendance,
    squad_contribution: summary.squad_contribution,
    leadership: summary.leadership,
    growth: summary.growth,
    communication: summary.communication,
    current_streak: summary.current_streak,
    best_streak: summary.best_streak,
    last_pulse_date: summary.last_pulse_date,
    last_pulse_status: summary.last_pulse_status,
  }, { onConflict: 'user_id,sprint_id,week_number' })

  return summary
}
