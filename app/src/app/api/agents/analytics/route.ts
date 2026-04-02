import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { chatCompletion, type ChatMessage } from '@/lib/minimax'
import { listEligibleScoreUsers, recalculateAndPersistOperatorScore } from '@/lib/operator-score'

// Analytics Agent — calculates Operator Scores, squad health, generates summaries
// Triggered by: cron (Friday night), on check-in submit, or manual POST

export async function POST(request: NextRequest) {
  try {
    const { action, user_id, squad_id } = await request.json()
    const supabase = createServiceClient()

    const { data: sprint } = await supabase
      .from('sprints')
      .select('*')
      .in('status', ['active', 'dip_week', 'completing'])
      .order('start_date', { ascending: false })
      .limit(1)
      .single()

    if (!sprint) return NextResponse.json({ message: 'No active sprint' })

    switch (action) {
      case 'calculate_operator_score': {
        return await calculateOperatorScore(supabase, sprint, user_id)
      }
      case 'calculate_all_scores': {
        return await calculateAllScores(supabase, sprint)
      }
      case 'calculate_squad_health': {
        return await calculateSquadHealth(supabase, sprint, squad_id)
      }
      case 'generate_squad_summary': {
        return await generateSquadSummary(supabase, sprint, squad_id)
      }
      case 'sprint_report_card': {
        return await generateSprintReportCard(supabase, sprint, user_id)
      }
      case 'churn_prediction': {
        return await predictChurn(supabase, sprint, user_id)
      }
      case 'all_churn_predictions': {
        return await allChurnPredictions(supabase, sprint)
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    console.error('Analytics error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function calculateOperatorScore(supabase: any, sprint: any, userId: string) {
  const summary = await recalculateAndPersistOperatorScore(supabase, sprint, userId)

  return NextResponse.json({
    user_id: userId,
    total_score: Math.round(summary.total_score),
    current_streak: summary.current_streak,
    factors: {
      goalCompletion: Math.round(summary.goal_completion),
      attendance: Math.round(summary.attendance),
      contribution: Math.round(summary.squad_contribution),
      leadership: Math.round(summary.leadership),
      growth: Math.round(summary.growth),
      communication: Math.round(summary.communication),
    },
  })
}

async function calculateAllScores(supabase: any, sprint: any) {
  const users = await listEligibleScoreUsers(supabase)
  const uniqueUsers = users.map((user: any) => user.id)
  const results = []

  for (const userId of uniqueUsers) {
    const res = await calculateOperatorScore(supabase, sprint, userId as string)
    const data = await res.json()
    results.push(data)
  }

  // Calculate percentiles
  const scores = results.map(r => ({ user_id: r.user_id, score: r.total_score })).sort((a, b) => b.score - a.score)
  for (let i = 0; i < scores.length; i++) {
    const percentile = ((scores.length - i) / scores.length) * 100
    await supabase.from('operator_scores').update({ percentile })
      .eq('user_id', scores[i].user_id).eq('sprint_id', sprint.id).is('week_number', null)
  }

  return NextResponse.json({ calculated: results.length, scores })
}

async function calculateSquadHealth(supabase: any, sprint: any, squadId: string) {
  const week = sprint.current_week

  const { data: members } = await supabase
    .from('squad_members')
    .select('user_id')
    .eq('squad_id', squadId)
    .eq('status', 'active')

  const memberCount = members?.length || 0
  if (memberCount === 0) return NextResponse.json({ health_score: 0 })

  const memberIds = members!.map((m: any) => m.user_id)

  const [declRes, checkinRes, reflectRes, msgRes] = await Promise.all([
    supabase.from('declarations').select('user_id').eq('squad_id', squadId).eq('sprint_id', sprint.id).eq('week_number', week),
    supabase.from('checkins').select('user_id, signals').eq('squad_id', squadId).eq('sprint_id', sprint.id).eq('week_number', week),
    supabase.from('reflections').select('user_id').eq('squad_id', squadId).eq('sprint_id', sprint.id).eq('week_number', week),
    supabase.from('squad_messages').select('id').eq('squad_id', squadId),
  ])

  const declarationRate = ((declRes.data?.length || 0) / memberCount) * 100
  const checkinRate = ((checkinRes.data?.length || 0) / memberCount) * 100
  const reflectionRate = ((reflectRes.data?.length || 0) / memberCount) * 100

  let greens = 0, yellows = 0, reds = 0, totalSignals = 0
  for (const c of (checkinRes.data || [])) {
    const sigs = c.signals as { signal: string }[]
    for (const s of sigs) {
      totalSignals++
      if (s.signal === 'green') greens++
      else if (s.signal === 'yellow') yellows++
      else reds++
    }
  }

  const healthScore = (declarationRate * 0.25 + checkinRate * 0.35 + reflectionRate * 0.2 +
    (totalSignals > 0 ? (greens / totalSignals) * 100 * 0.2 : 50 * 0.2))

  await supabase.from('squad_analytics').upsert({
    squad_id: squadId,
    sprint_id: sprint.id,
    week_number: week,
    declaration_rate: declarationRate,
    checkin_rate: checkinRate,
    reflection_rate: reflectionRate,
    green_pct: totalSignals > 0 ? (greens / totalSignals) * 100 : null,
    yellow_pct: totalSignals > 0 ? (yellows / totalSignals) * 100 : null,
    red_pct: totalSignals > 0 ? (reds / totalSignals) * 100 : null,
    health_score: Math.round(healthScore * 100) / 100,
    interaction_density: (msgRes.data?.length || 0) / memberCount / Math.max(week, 1),
  }, { onConflict: 'squad_id,sprint_id,week_number' })

  // Update denormalized squad fields
  await supabase.from('squads').update({
    health_score: Math.round(healthScore * 100) / 100,
    completion_rate: totalSignals > 0 ? Math.round((greens / totalSignals) * 100 * 100) / 100 : null,
  }).eq('id', squadId)

  return NextResponse.json({ squad_id: squadId, health_score: Math.round(healthScore), rates: { declarationRate, checkinRate, reflectionRate } })
}

async function generateSquadSummary(supabase: any, sprint: any, squadId: string) {
  const { data: squad } = await supabase.from('squads').select('name, member_count').eq('id', squadId).single()
  const { data: analytics } = await supabase.from('squad_analytics').select('*')
    .eq('squad_id', squadId).eq('sprint_id', sprint.id).eq('week_number', sprint.current_week).maybeSingle()

  const prompt = `Generate a brief weekly summary for Division Alpha squad "${squad?.name}".
Sprint ${sprint.number}, Week ${sprint.current_week}. ${squad?.member_count} operators.
Declaration rate: ${analytics?.declaration_rate?.toFixed(0) || '?'}%
Check-in rate: ${analytics?.checkin_rate?.toFixed(0) || '?'}%
Signals: ${analytics?.green_pct?.toFixed(0) || '?'}% green, ${analytics?.yellow_pct?.toFixed(0) || '?'}% yellow, ${analytics?.red_pct?.toFixed(0) || '?'}% red
Health score: ${analytics?.health_score?.toFixed(0) || '?'}/100

Write 3-4 sentences. Highlight the most notable pattern. Close with a look-ahead.`

  const messages: ChatMessage[] = [
    { role: 'system', content: prompt },
    { role: 'user', content: 'Generate the summary.' },
  ]

  const summary = await chatCompletion(messages, { temperature: 0.7, max_tokens: 200 })

  if (analytics) {
    await supabase.from('squad_analytics').update({ weekly_summary: summary })
      .eq('squad_id', squadId).eq('sprint_id', sprint.id).eq('week_number', sprint.current_week)
  }

  return NextResponse.json({ squad: squad?.name, summary })
}

// ── Sprint Report Card (end-of-sprint per-user summary) ──

async function generateSprintReportCard(supabase: any, sprint: any, userId: string) {
  // Gather all user data for the sprint
  const [profileRes, scoreRes, declRes, checkinRes, reflectRes, coachRes] = await Promise.all([
    supabase.from('profiles').select('display_name, persona_type, sprints_completed').eq('id', userId).single(),
    supabase.from('operator_scores').select('*').eq('user_id', userId).eq('sprint_id', sprint.id).is('week_number', null).maybeSingle(),
    supabase.from('declarations').select('goals').eq('user_id', userId).eq('sprint_id', sprint.id),
    supabase.from('checkins').select('signals').eq('user_id', userId).eq('sprint_id', sprint.id),
    supabase.from('reflections').select('wins, misses, learnings, goals_hit, goals_total').eq('user_id', userId).eq('sprint_id', sprint.id),
    supabase.from('coach_messages').select('content, trigger_type').eq('user_id', userId).eq('sprint_id', sprint.id).eq('role', 'coach').order('created_at', { ascending: false }).limit(5),
  ])

  const profile = profileRes.data
  const score = scoreRes.data
  const declarations = declRes.data || []
  const checkins = checkinRes.data || []
  const reflections = reflectRes.data || []

  // Calculate stats
  let totalGoals = 0, greenGoals = 0, yellowGoals = 0, redGoals = 0
  for (const c of checkins) {
    const sigs = c.signals as { signal: string }[]
    for (const s of sigs) {
      totalGoals++
      if (s.signal === 'green') greenGoals++
      else if (s.signal === 'yellow') yellowGoals++
      else redGoals++
    }
  }

  const totalReflectionGoalsHit = reflections.reduce((sum: number, r: any) => sum + (r.goals_hit || 0), 0)
  const totalReflectionGoalsTotal = reflections.reduce((sum: number, r: any) => sum + (r.goals_total || 0), 0)

  // Collect wins and learnings
  const allWins = reflections.map((r: any) => r.wins).filter(Boolean).join(' | ')
  const allLearnings = reflections.map((r: any) => r.learnings).filter(Boolean).join(' | ')

  const prompt = `Generate a Sprint Report Card for ${profile?.display_name} on Division Alpha.

SPRINT DATA:
- Sprint ${sprint.number} (${sprint.duration_weeks} weeks)
- Operator Score: ${score?.total_score || '?'}/100
- Factors: Goal Completion ${score?.goal_completion || '?'}, Attendance ${score?.attendance || '?'}, Contribution ${score?.squad_contribution || '?'}, Leadership ${score?.leadership || '?'}, Growth ${score?.growth || '?'}, Communication ${score?.communication || '?'}
- Declarations submitted: ${declarations.length}/${sprint.duration_weeks}
- Check-ins submitted: ${checkins.length}/${sprint.duration_weeks}
- Reflections submitted: ${reflections.length}/${sprint.duration_weeks}
- Goal signals: ${greenGoals}G / ${yellowGoals}Y / ${redGoals}R out of ${totalGoals}
- Goals hit (from reflections): ${totalReflectionGoalsHit}/${totalReflectionGoalsTotal}
- Persona: ${profile?.persona_type || 'Builder'}
- Sprints completed: ${profile?.sprints_completed || 0}

WINS THIS SPRINT: ${allWins || 'Not recorded'}
KEY LEARNINGS: ${allLearnings || 'Not recorded'}

Generate a report card with:
1. A one-line headline ("Your Sprint ${sprint.number} in a sentence")
2. Key stats (3-4 numbers that matter)
3. Biggest strength this sprint (reference a specific pattern from the data)
4. Biggest opportunity (what to focus on next sprint)
5. Coach's recommendation for next sprint (one specific, actionable suggestion)

Keep under 250 words. Direct, data-driven, personally specific. Not generic.`

  const messages: ChatMessage[] = [
    { role: 'system', content: prompt },
    { role: 'user', content: 'Generate the report card.' },
  ]

  const reportCard = await chatCompletion(messages, { temperature: 0.7, max_tokens: 500 })

  // Save as a coach message
  await supabase.from('coach_messages').insert({
    user_id: userId,
    role: 'coach',
    content: `📊 **Sprint ${sprint.number} Report Card**\n\n${reportCard}`,
    sprint_id: sprint.id,
    week_number: sprint.duration_weeks,
    trigger_type: 'sprint_debrief',
  })

  // Notify user
  await supabase.from('notifications').insert({
    user_id: userId,
    title: `Sprint ${sprint.number} Report Card Ready`,
    body: 'Your personalized sprint summary is in your Coach DMs.',
    type: 'score_update',
    action_page: 'coach',
  })

  return NextResponse.json({
    user_id: userId,
    sprint: sprint.number,
    score: score?.total_score,
    report_card_length: reportCard.length,
  })
}

// ── Churn Prediction ──

async function predictChurn(supabase: any, sprint: any, userId: string) {
  // Feature engineering for churn prediction
  const [scoreRes, engagementRes, checkinRes, msgRes, pauseRes] = await Promise.all([
    supabase.from('operator_scores').select('total_score, goal_completion, attendance')
      .eq('user_id', userId).eq('sprint_id', sprint.id).is('week_number', null).maybeSingle(),
    supabase.from('engagement_events').select('event_type, consecutive_misses')
      .eq('user_id', userId).eq('sprint_id', sprint.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('checkins').select('signals')
      .eq('user_id', userId).eq('sprint_id', sprint.id).order('submitted_at', { ascending: false }).limit(3),
    supabase.from('squad_messages').select('id')
      .eq('sender_id', userId).gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('pauses').select('status')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  const score = scoreRes.data
  const events = engagementRes.data || []
  const recentCheckins = checkinRes.data || []
  const recentMessages = msgRes.data || []
  const hasPaused = pauseRes.data?.status === 'active'

  // Score-based risk factors (0-100 each)
  const scoreRisk = score ? Math.max(0, 100 - Number(score.total_score)) : 50
  const attendanceRisk = score ? Math.max(0, 100 - Number(score.attendance)) : 50

  // Engagement decline
  const missedEvents = events.filter((e: any) =>
    ['missed_declaration', 'missed_checkin', 'missed_reflection'].includes(e.event_type)
  ).length
  const engagementRisk = Math.min(missedEvents * 15, 100)

  // Signal trend (are they getting more reds?)
  let signalRisk = 0
  if (recentCheckins.length >= 2) {
    const recentSigs = recentCheckins[0]?.signals as { signal: string }[] || []
    const redCount = recentSigs.filter((s: any) => s.signal === 'red').length
    signalRisk = Math.min(redCount * 25, 100)
  }

  // Message frequency decline
  const messageRisk = recentMessages.length < 3 ? 60 : recentMessages.length < 7 ? 30 : 0

  // Pause history
  const pauseRisk = hasPaused ? 70 : 0

  // Weighted churn score
  const churnRisk = Math.round(
    scoreRisk * 0.20 +
    attendanceRisk * 0.25 +
    engagementRisk * 0.25 +
    signalRisk * 0.10 +
    messageRisk * 0.10 +
    pauseRisk * 0.10
  )

  const riskLevel = churnRisk >= 70 ? 'high' : churnRisk >= 40 ? 'medium' : 'low'

  return NextResponse.json({
    user_id: userId,
    churn_risk: churnRisk,
    risk_level: riskLevel,
    factors: {
      score_risk: Math.round(scoreRisk),
      attendance_risk: Math.round(attendanceRisk),
      engagement_risk: Math.round(engagementRisk),
      signal_risk: Math.round(signalRisk),
      message_risk: Math.round(messageRisk),
      pause_risk: Math.round(pauseRisk),
    },
  })
}

async function allChurnPredictions(supabase: any, sprint: any) {
  const users = await listEligibleScoreUsers(supabase)
  const predictions = []

  for (const user of users) {
    const res = await predictChurn(supabase, sprint, user.id)
    const data = await res.json()
    predictions.push({
      ...data,
      display_name: user.display_name,
    })
  }

  // Sort by risk (highest first)
  predictions.sort((a, b) => b.churn_risk - a.churn_risk)

  const atRisk = predictions.filter(p => p.risk_level === 'high')

  return NextResponse.json({
    total_users: predictions.length,
    high_risk: atRisk.length,
    medium_risk: predictions.filter(p => p.risk_level === 'medium').length,
    low_risk: predictions.filter(p => p.risk_level === 'low').length,
    predictions,
  })
}
