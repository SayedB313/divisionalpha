import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Sprint Lifecycle Manager — advances weeks, triggers ceremonies at the right time
// Called by cron (daily at midnight) or manually
//
// Responsibilities:
// - Advance current_week based on date
// - Trigger Week 1 kickoff, Week 3 dip, Week 6 completion ceremonies
// - Transition sprint status (upcoming → handshake → active → dip_week → completing → completed)
// - Handle continuation votes at sprint end

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

// Support both GET (from Vercel Cron) and POST (from admin trigger)
export async function GET(request: NextRequest) {
  return handleLifecycle(request)
}

export async function POST(request: NextRequest) {
  return handleLifecycle(request)
}

async function handleLifecycle(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const results: any[] = []

    // ── 1. Advance upcoming sprints to handshake ──
    const { data: upcomingSprints } = await supabase
      .from('sprints')
      .select('*')
      .eq('status', 'upcoming')
      .lte('week0_start', todayStr)

    for (const sprint of upcomingSprints || []) {
      await supabase.from('sprints').update({ status: 'handshake', current_week: 0 }).eq('id', sprint.id)
      results.push({ sprint: sprint.name, transition: 'upcoming → handshake' })
    }

    // ── 2. Advance handshake sprints to active (Week 1) ──
    const { data: handshakeSprints } = await supabase
      .from('sprints')
      .select('*')
      .eq('status', 'handshake')
      .lte('start_date', todayStr)

    for (const sprint of handshakeSprints || []) {
      await supabase.from('sprints').update({ status: 'active', current_week: 1 }).eq('id', sprint.id)

      // Trigger kickoff ceremony for all squads
      await fetch(`${BASE_URL}/api/agents/ceremonies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ceremony: 'kickoff' }),
      })

      results.push({ sprint: sprint.name, transition: 'handshake → active (Week 1)', ceremony: 'kickoff' })
    }

    // ── 3. Advance active sprint weeks ──
    const { data: activeSprints } = await supabase
      .from('sprints')
      .select('*')
      .in('status', ['active', 'dip_week'])

    for (const sprint of activeSprints || []) {
      const startDate = new Date(sprint.start_date)
      startDate.setHours(0, 0, 0, 0)
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const calculatedWeek = Math.min(Math.floor(daysSinceStart / 7) + 1, sprint.duration_weeks)

      if (calculatedWeek !== sprint.current_week) {
        const updates: any = { current_week: calculatedWeek }

        // Week 3 → trigger dip intervention
        if (calculatedWeek === 3 && sprint.status !== 'dip_week') {
          updates.status = 'dip_week'

          await fetch(`${BASE_URL}/api/agents/ceremonies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ceremony: 'dip_intervention' }),
          })

          results.push({ sprint: sprint.name, week: 3, ceremony: 'dip_intervention' })
        }

        // Week 4+ after dip → back to active
        if (calculatedWeek > 3 && sprint.status === 'dip_week') {
          updates.status = 'active'
        }

        // Final week → trigger completion
        if (calculatedWeek >= sprint.duration_weeks) {
          updates.status = 'completing'

          // Calculate all scores before completion
          await fetch(`${BASE_URL}/api/agents/analytics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'calculate_all_scores' }),
          })

          // Calculate squad health for all squads
          const { data: squads } = await supabase
            .from('squads')
            .select('id')
            .eq('sprint_id', sprint.id)
            .eq('status', 'active')

          for (const squad of squads || []) {
            await fetch(`${BASE_URL}/api/agents/analytics`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'calculate_squad_health', squad_id: squad.id }),
            })
          }

          // Trigger completion ceremony
          await fetch(`${BASE_URL}/api/agents/ceremonies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ceremony: 'completion' }),
          })

          results.push({ sprint: sprint.name, week: calculatedWeek, ceremony: 'completion' })
        }

        await supabase.from('sprints').update(updates).eq('id', sprint.id)
        results.push({ sprint: sprint.name, week_advanced: `${sprint.current_week} → ${calculatedWeek}` })
      }
    }

    // ── 4. Process completing sprints (handle votes) ──
    const { data: completingSprints } = await supabase
      .from('sprints')
      .select('*')
      .eq('status', 'completing')

    for (const sprint of completingSprints || []) {
      // Check if completion was at least 3 days ago (give time to vote)
      const endDate = new Date(sprint.end_date)
      const daysSinceEnd = Math.floor((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceEnd >= 3) {
        // Tally votes per squad
        const { data: squads } = await supabase
          .from('squads')
          .select('id, name')
          .eq('sprint_id', sprint.id)
          .in('status', ['active', 'completing'])

        for (const squad of squads || []) {
          const { data: members } = await supabase
            .from('squad_members')
            .select('user_id, continuation_vote')
            .eq('squad_id', squad.id)
            .eq('status', 'active')

          const votes = (members || []).filter((m: any) => m.continuation_vote)
          const continueVotes = votes.filter((m: any) => m.continuation_vote === 'continue').length
          const totalVoters = votes.length
          const totalMembers = (members || []).length

          const continuePct = totalVoters > 0 ? (continueVotes / totalVoters) * 100 : 0

          if (continuePct >= 75) {
            // Squad continues together
            await supabase.from('squads').update({
              status: 'completed',
              streak: (await supabase.from('squads').select('streak').eq('id', squad.id).single()).data?.streak + 1 || 1,
            }).eq('id', squad.id)

            results.push({ squad: squad.name, outcome: 'continues', vote_pct: `${continueVotes}/${totalVoters} (${Math.round(continuePct)}%)` })
          } else {
            // Squad dissolves — members go to reshuffle pool
            await supabase.from('squads').update({ status: 'completed' }).eq('id', squad.id)
            results.push({ squad: squad.name, outcome: 'reshuffled', vote_pct: `${continueVotes}/${totalVoters} (${Math.round(continuePct)}%)` })
          }

          // Update sprints completed for all members
          for (const member of members || []) {
            await supabase.rpc('increment_sprints_completed', { p_user_id: member.user_id })
              .then(() => {})
              .catch(() => {
                // Fallback if function doesn't exist
                supabase.from('profiles')
                  .update({ sprints_completed: (supabase.from('profiles').select('sprints_completed').eq('id', member.user_id).single()).data?.sprints_completed + 1 || 1 })
                  .eq('id', member.user_id)
              })
          }
        }

        // Mark sprint as completed
        await supabase.from('sprints').update({ status: 'completed' }).eq('id', sprint.id)
        results.push({ sprint: sprint.name, transition: 'completing → completed' })

        // Store outcomes in agent memory for Matchmaker learning
        await supabase.from('agent_events').insert({
          source_agent: 'analytics',
          target_agent: 'matchmaker',
          event_type: 'sprint_outcomes',
          payload: { sprint_id: sprint.id, results },
        })
      }
    }

    return NextResponse.json({
      date: todayStr,
      transitions: results.length,
      results,
    })
  } catch (err) {
    console.error('Lifecycle error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
