import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { chatCompletion, type ChatMessage } from '@/lib/minimax'

// Facilitator Agent — drives Mon/Wed/Fri sprint rhythm
// Triggered by: cron job or manual POST with { action, squad_id? }

export async function POST(request: NextRequest) {
  try {
    const { action, squad_id } = await request.json()
    const supabase = createServiceClient()

    // Get active sprint
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

    // Get target squads
    const squadQuery = supabase
      .from('squads')
      .select('*, squad_members(user_id, role, status, profile:profiles(display_name, initials))')
      .eq('sprint_id', sprint.id)
      .eq('status', 'active')

    if (squad_id) squadQuery.eq('id', squad_id)

    const { data: squads } = await squadQuery

    if (!squads?.length) {
      return NextResponse.json({ message: 'No active squads' })
    }

    const results: any[] = []

    for (const squad of squads) {
      const members = (squad.squad_members || []).filter((m: any) => m.status === 'active')
      const memberNames = members.map((m: any) => m.profile?.display_name || 'Unknown').join(', ')

      let prompt = ''
      let facilMessage = ''

      switch (action) {
        case 'monday_declaration': {
          // Check who hasn't declared yet
          const { data: declarations } = await supabase
            .from('declarations')
            .select('user_id')
            .eq('squad_id', squad.id)
            .eq('sprint_id', sprint.id)
            .eq('week_number', sprint.current_week)

          const declaredIds = new Set((declarations || []).map((d: any) => d.user_id))
          const missing = members.filter((m: any) => !declaredIds.has(m.user_id))
          const missingNames = missing.map((m: any) => m.profile?.display_name).join(', ')

          prompt = `You are the Sprint Facilitator for Division Alpha squad "${squad.name}".
It's Monday, Sprint ${sprint.number}, Week ${sprint.current_week}. Time for declarations.

Squad members: ${memberNames}
${missing.length > 0 ? `Haven't declared yet: ${missingNames}` : 'Everyone has declared!'}

Generate a Monday declaration prompt for the squad channel. Be direct, warm, not robotic.
Keep it under 100 words. Remind them to be specific and measurable.
If some haven't declared, mention them by name with a gentle nudge.`
          break
        }

        case 'wednesday_checkin': {
          // Check who hasn't checked in
          const { data: checkins } = await supabase
            .from('checkins')
            .select('user_id, signals')
            .eq('squad_id', squad.id)
            .eq('sprint_id', sprint.id)
            .eq('week_number', sprint.current_week)

          const checkedIds = new Set((checkins || []).map((c: any) => c.user_id))
          const missing = members.filter((m: any) => !checkedIds.has(m.user_id))

          // Count signals
          let greens = 0, yellows = 0, reds = 0
          for (const c of (checkins || [])) {
            const sigs = c.signals as { signal: string }[]
            for (const s of sigs) {
              if (s.signal === 'green') greens++
              else if (s.signal === 'yellow') yellows++
              else if (s.signal === 'red') reds++
            }
          }

          prompt = `You are the Sprint Facilitator for Division Alpha squad "${squad.name}".
It's Wednesday, Sprint ${sprint.number}, Week ${sprint.current_week}. Mid-week check-in time.

Squad: ${memberNames}
Checked in: ${checkins?.length || 0}/${members.length}
Signals so far: ${greens}G / ${yellows}Y / ${reds}R
${missing.length > 0 ? `Missing: ${missing.map((m: any) => m.profile?.display_name).join(', ')}` : ''}

Generate a Wednesday check-in prompt. Mention anyone who flagged Yellow or Red and ask the squad to support them.
If people are missing, nudge them. Keep under 100 words.`
          break
        }

        case 'friday_reflection': {
          // Get week stats
          const { data: declarations } = await supabase
            .from('declarations')
            .select('goals')
            .eq('squad_id', squad.id)
            .eq('sprint_id', sprint.id)
            .eq('week_number', sprint.current_week)

          const totalGoals = (declarations || []).reduce((sum: number, d: any) => {
            return sum + ((d.goals as any[])?.length || 0)
          }, 0)

          prompt = `You are the Sprint Facilitator for Division Alpha squad "${squad.name}".
It's Friday, Sprint ${sprint.number}, Week ${sprint.current_week}. Reflection time.

Squad: ${memberNames} (${members.length} operators)
This week: ${declarations?.length || 0} declarations, ${totalGoals} total goals committed.

Generate a Friday reflection prompt. Celebrate the effort. Ask for wins, misses, and learnings.
Mention peer appreciation. Keep under 120 words. Warm but direct.`
          break
        }

        case 'weekly_summary': {
          const { data: checkins } = await supabase
            .from('checkins')
            .select('signals')
            .eq('squad_id', squad.id)
            .eq('sprint_id', sprint.id)
            .eq('week_number', sprint.current_week)

          let greens = 0, yellows = 0, reds = 0
          for (const c of (checkins || [])) {
            const sigs = c.signals as { signal: string }[]
            for (const s of sigs) {
              if (s.signal === 'green') greens++
              else if (s.signal === 'yellow') yellows++
              else if (s.signal === 'red') reds++
            }
          }

          prompt = `You are the Sprint Facilitator for Division Alpha squad "${squad.name}".
Generate a brief end-of-week summary for Sprint ${sprint.number}, Week ${sprint.current_week}.

Stats: ${checkins?.length || 0}/${members.length} checked in. Signals: ${greens}G / ${yellows}Y / ${reds}R
Squad: ${memberNames}

Summarize in 3-4 sentences. Highlight the most notable pattern and one specific accomplishment.
Close with a look-ahead to next week.`
          break
        }

        default:
          return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
      }

      // Generate the facilitator message via MiniMax
      const messages: ChatMessage[] = [
        { role: 'system', content: prompt },
        { role: 'user', content: `Generate the ${action} message now.` },
      ]

      try {
        facilMessage = await chatCompletion(messages, { temperature: 0.8, max_tokens: 300 })
      } catch (aiErr) {
        console.error('[facilitator] MiniMax error:', aiErr)
        const fallbacks: Record<string, string> = {
          monday_declaration: `Squad — it's Monday. Time to declare. What are you committing to this week? Post your goals below.`,
          wednesday_checkin: `Mid-week check-in. How's everyone tracking? Green, Yellow, or Red — post your signal and a quick note.`,
          friday_reflection: `It's Friday. Time to reflect. What were your wins this week? What did you miss? What's carrying forward?`,
          weekly_summary: `Another week in the books. Check the activity feed for this week's stats.`,
        }
        facilMessage = fallbacks[action] || `Time for your ${action.replace('_', ' ')}. Post in the channel.`
      }

      // Post to squad channel
      // Use a system user ID for the facilitator (or the first admin)
      const { data: adminUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'founder')
        .limit(1)
        .maybeSingle()

      const senderId = adminUser?.id || members[0]?.user_id

      if (senderId) {
        await supabase.from('squad_messages').insert({
          squad_id: squad.id,
          sender_id: senderId,
          content: facilMessage,
          message_type: 'facilitator',
        })
      }

      results.push({ squad: squad.name, action, message: facilMessage })
    }

    return NextResponse.json({ results })
  } catch (err) {
    console.error('Facilitator error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
