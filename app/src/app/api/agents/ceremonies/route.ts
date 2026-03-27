import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { chatCompletion, type ChatMessage } from '@/lib/minimax'

// Ceremony Agent — handles special sprint events
// Week 0: Squad Reveal, Week 1: Kickoff, Week 3: Dip Intervention, Week 6: Completion

export async function POST(request: NextRequest) {
  try {
    const { ceremony, squad_id } = await request.json()
    const supabase = createServiceClient()

    const { data: sprint } = await supabase
      .from('sprints')
      .select('*')
      .in('status', ['handshake', 'active', 'dip_week', 'completing'])
      .order('start_date', { ascending: false })
      .limit(1)
      .single()

    if (!sprint) return NextResponse.json({ error: 'No active sprint' }, { status: 404 })

    // Get target squads
    const squadQuery = supabase
      .from('squads')
      .select('*, squad_members(user_id, role, status, profile:profiles(id, display_name, initials, one_liner, persona_type, current_stage))')
      .eq('sprint_id', sprint.id)
      .in('status', ['forming', 'active', 'completing'])

    if (squad_id) squadQuery.eq('id', squad_id)
    const { data: squads } = await squadQuery

    if (!squads?.length) return NextResponse.json({ error: 'No squads found' }, { status: 404 })

    const results = []

    for (const squad of squads) {
      const members = (squad.squad_members || []).filter((m: any) => m.status === 'active')
      let message = ''

      switch (ceremony) {
        case 'squad_reveal': {
          // Week 0 — Introduce squad members to each other
          const memberList = members.map((m: any) => {
            const p = m.profile
            return `— ${p.display_name} / ${p.one_liner || 'Operator'} / ${p.persona_type || 'Builder'}`
          }).join('\n')

          const prompt = `You are the Sprint Facilitator for Division Alpha. A new squad has just been formed.
Generate a Squad Reveal message for "${squad.name}". This is the first message the squad sees.

Squad members:
${memberList}

Sprint ${sprint.number} starts on ${sprint.start_date}.

Write the reveal in this format:
1. Open with the squad name and a brief energizing line
2. List each member with their name, what they do, and their type
3. Give the squad one task: introduce themselves in the thread (who are you beyond your goal, what scares you about the next 6 weeks, one non-work thing)
4. Close with a "This is the Bio Thread" line

Keep under 200 words. Direct, warm. Not corporate.`

          const msgs: ChatMessage[] = [
            { role: 'system', content: prompt },
            { role: 'user', content: 'Generate the squad reveal message.' },
          ]
          message = await chatCompletion(msgs, { temperature: 0.8, max_tokens: 500 })

          // Update squad status
          await supabase.from('squads').update({ status: 'active' }).eq('id', squad.id)
          break
        }

        case 'kickoff': {
          // Week 1 — The inaugural meeting
          const memberNames = members.map((m: any) => m.profile.display_name).join(', ')

          const prompt = `You are the Sprint Facilitator running the Week 1 Kickoff for Division Alpha squad "${squad.name}".

Members: ${memberNames}
Sprint ${sprint.number}, ${sprint.duration_weeks} weeks.

Generate the kickoff ceremony message. Include:
1. Welcome — set the tone ("For the next six weeks, you're not alone.")
2. Sprint Covenant — "We agree to be honest. Struggling is okay, hiding is not."
3. Ask each member to type "I commit" or "I'm in"
4. Remind them of the rhythm: Monday declarations, Wednesday check-ins, Friday reflections
5. Close with energy — "Let's build."

Keep under 250 words. Direct, serious but warm. This is a commitment moment.`

          const msgs: ChatMessage[] = [
            { role: 'system', content: prompt },
            { role: 'user', content: 'Generate the kickoff ceremony message.' },
          ]
          message = await chatCompletion(msgs, { temperature: 0.7, max_tokens: 500 })
          break
        }

        case 'dip_intervention': {
          // Week 3 — Motivation reset
          const memberNames = members.map((m: any) => m.profile.display_name).join(', ')

          // Get squad stats so far
          const { data: analytics } = await supabase
            .from('squad_analytics')
            .select('avg_completion_rate, health_score')
            .eq('squad_id', squad.id)
            .order('week_number', { ascending: false })
            .limit(1)
            .maybeSingle()

          const prompt = `You are the Sprint Facilitator running the Week 3 "Dip Intervention" for Division Alpha squad "${squad.name}".

Research shows motivation drops at the midpoint of any commitment. This is designed to catch the dip.

Members: ${memberNames}
Sprint ${sprint.number}, halfway through.
Squad health: ${analytics?.health_score || '?'}/100
Avg completion: ${analytics?.avg_completion_rate || '?'}%

Generate the Dip Intervention message:
1. Celebrate the half — "You've made it 3 weeks. Let's look at what you've accomplished."
2. Normalize the dip — "Mid-sprint energy dips are normal. Research confirms this."
3. Goal Adjustment Amnesty — "If any goals are too big, too small, or wrong — now is the time to adjust. No shame."
4. "Why Reset" prompt — ask them to write down in 60 seconds: Why did you join? What will be different if you finish strong?
5. Squad gratitude — one thing they appreciate about the squad

Keep under 200 words. Compassionate but direct.`

          const msgs: ChatMessage[] = [
            { role: 'system', content: prompt },
            { role: 'user', content: 'Generate the dip intervention message.' },
          ]
          message = await chatCompletion(msgs, { temperature: 0.8, max_tokens: 400 })

          // Update sprint status
          await supabase.from('sprints').update({ status: 'dip_week' }).eq('id', sprint.id)

          // Trigger Coach "Why Reset" for each member
          for (const member of members) {
            await supabase.from('agent_events').insert({
              source_agent: 'facilitator',
              target_agent: 'coach',
              event_type: 'dip_intervention_why_reset',
              payload: { user_id: member.user_id, squad_id: squad.id, sprint_id: sprint.id },
            })
          }
          break
        }

        case 'completion': {
          // Week 6 — Sprint completion ceremony
          const memberNames = members.map((m: any) => m.profile.display_name).join(', ')

          // Get final squad stats
          const { data: scores } = await supabase
            .from('operator_scores')
            .select('user_id, total_score')
            .eq('sprint_id', sprint.id)
            .is('week_number', null)
            .in('user_id', members.map((m: any) => m.user_id))

          const avgScore = scores?.length
            ? Math.round(scores.reduce((sum: number, s: any) => sum + Number(s.total_score), 0) / scores.length)
            : 0

          const { data: analytics } = await supabase
            .from('squad_analytics')
            .select('*')
            .eq('squad_id', squad.id)
            .order('week_number', { ascending: false })
            .limit(1)
            .maybeSingle()

          const prompt = `You are the Sprint Facilitator running the Week 6 Completion Ceremony for Division Alpha squad "${squad.name}".

Members: ${memberNames}
Sprint ${sprint.number} is complete.
Average operator score: ${avgScore}/100
Squad completion rate: ${analytics?.avg_completion_rate || '?'}%
Squad health: ${analytics?.health_score || '?'}/100

Generate the completion ceremony message:
1. Open with recognition — "Sprint ${sprint.number} is done. You showed up when it was hard."
2. Squad stats — share the completion rate and what it means
3. Prompt the transformation question — "What changed in you, not just what you did?"
4. Gratitude round — "Before we close: who in this squad helped you? Call them out."
5. Continuation vote — explain the 3 options: Continue Together, Reshuffle, Pause
6. Close with the Division Alpha sign-off — "Whether you continue, reshuffle, or pause — you're an operator. That doesn't stop."

Keep under 300 words. This is the emotional peak of the sprint. Make it land.`

          const msgs: ChatMessage[] = [
            { role: 'system', content: prompt },
            { role: 'user', content: 'Generate the completion ceremony message.' },
          ]
          message = await chatCompletion(msgs, { temperature: 0.8, max_tokens: 600 })

          // Update sprint status
          await supabase.from('sprints').update({ status: 'completing' }).eq('id', sprint.id)

          // Notify all members to vote
          for (const member of members) {
            await supabase.from('notifications').insert({
              user_id: member.user_id,
              title: 'Sprint Complete — Cast Your Vote',
              body: `${squad.name} has completed Sprint ${sprint.number}. Choose: Continue Together, Reshuffle, or Pause.`,
              type: 'ceremony',
              action_page: 'completion',
            })
          }
          break
        }

        default:
          return NextResponse.json({ error: `Unknown ceremony: ${ceremony}` }, { status: 400 })
      }

      // Post ceremony message to squad channel
      const { data: adminUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'founder')
        .limit(1)
        .maybeSingle()

      const senderId = adminUser?.id || members[0]?.user_id

      if (senderId && message) {
        await supabase.from('squad_messages').insert({
          squad_id: squad.id,
          sender_id: senderId,
          content: message,
          message_type: 'facilitator',
        })
      }

      results.push({ squad: squad.name, ceremony, message_length: message.length })
    }

    return NextResponse.json({ ceremony, squads: results.length, results })
  } catch (err) {
    console.error('Ceremony error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
