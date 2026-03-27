import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { chatCompletion, type ChatMessage } from '@/lib/minimax'
import { sendEmail, squadNudge, lifeCheckDm } from '@/lib/email'

// Guardian Agent — monitors engagement, triggers Pause Protocol
// Triggered by: cron job (every 6 hours) or manual POST

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()

    // Get active sprint
    const { data: sprint } = await supabase
      .from('sprints')
      .select('*')
      .in('status', ['active', 'dip_week'])
      .order('start_date', { ascending: false })
      .limit(1)
      .single()

    if (!sprint) {
      return NextResponse.json({ message: 'No active sprint' })
    }

    // Get all active squad members
    const { data: members } = await supabase
      .from('squad_members')
      .select('*, profile:profiles(id, display_name, email, last_active_at), squad:squads(id, name, sprint_id)')
      .eq('status', 'active')
      .eq('squad.sprint_id', sprint.id)

    if (!members?.length) {
      return NextResponse.json({ message: 'No active members' })
    }

    const now = new Date()
    const dayOfWeek = now.getDay() // 0=Sun, 1=Mon, ...
    const results: any[] = []

    for (const member of members) {
      if (!member.profile || !member.squad) continue

      const userId = member.profile.id
      const userName = member.profile.display_name

      // Check this week's submissions
      const [declRes, checkinRes, reflectRes] = await Promise.all([
        supabase.from('declarations').select('id').eq('user_id', userId).eq('sprint_id', sprint.id).eq('week_number', sprint.current_week).maybeSingle(),
        supabase.from('checkins').select('id').eq('user_id', userId).eq('sprint_id', sprint.id).eq('week_number', sprint.current_week).maybeSingle(),
        supabase.from('reflections').select('id').eq('user_id', userId).eq('sprint_id', sprint.id).eq('week_number', sprint.current_week).maybeSingle(),
      ])

      // Determine what's missing based on day
      const missingDeclaration = dayOfWeek >= 2 && !declRes.data  // Tuesday+ and no Monday declaration
      const missingCheckin = dayOfWeek >= 4 && !checkinRes.data    // Thursday+ and no Wednesday check-in
      const missingReflection = dayOfWeek === 0 && !reflectRes.data // Sunday and no Friday reflection

      if (!missingDeclaration && !missingCheckin && !missingReflection) continue

      // Get existing engagement events to track consecutive misses
      const { data: recentEvents } = await supabase
        .from('engagement_events')
        .select('event_type, consecutive_misses')
        .eq('user_id', userId)
        .eq('sprint_id', sprint.id)
        .order('created_at', { ascending: false })
        .limit(5)

      const lastMissCount = recentEvents?.[0]?.consecutive_misses || 0
      const consecutiveMisses = lastMissCount + 1

      const missType = missingDeclaration ? 'missed_declaration' :
                       missingCheckin ? 'missed_checkin' : 'missed_reflection'

      // Record the engagement event
      await supabase.from('engagement_events').insert({
        user_id: userId,
        squad_id: member.squad.id,
        sprint_id: sprint.id,
        event_type: missType,
        consecutive_misses: consecutiveMisses,
      })

      // Escalation ladder
      if (consecutiveMisses === 1) {
        // Gentle nudge — Facilitator handles this (public)
        await supabase.from('engagement_events').insert({
          user_id: userId,
          squad_id: member.squad.id,
          sprint_id: sprint.id,
          event_type: 'gentle_nudge_sent',
          consecutive_misses: consecutiveMisses,
        })

        // Fire event to facilitator
        await supabase.from('agent_events').insert({
          source_agent: 'guardian',
          target_agent: 'facilitator',
          event_type: 'nudge_member',
          payload: { user_id: userId, user_name: userName, squad_id: member.squad.id, miss_type: missType },
        })

        // Send nudge email
        if (member.profile.email) {
          const missAction = missingDeclaration ? 'declare' : missingCheckin ? 'check in' : 'reflect'
          const email = squadNudge(userName, member.squad.name, missAction)
          email.to = member.profile.email
          sendEmail(email).catch(err => console.error('[guardian] nudge email failed:', err))
        }

        results.push({ user: userName, action: 'gentle_nudge', misses: consecutiveMisses })

      } else if (consecutiveMisses === 2) {
        // Life Check DM — AI-generated private message
        const lifeCheckMessage = await generateLifeCheck(userName, consecutiveMisses, member.profile.last_active_at)

        await supabase.from('coach_messages').insert({
          user_id: userId,
          role: 'coach',
          content: lifeCheckMessage,
          sprint_id: sprint.id,
          week_number: sprint.current_week,
          trigger_type: 'guardian_referral',
        })

        await supabase.from('engagement_events').insert({
          user_id: userId,
          squad_id: member.squad.id,
          sprint_id: sprint.id,
          event_type: 'life_check_sent',
          consecutive_misses: consecutiveMisses,
        })

        await supabase.from('notifications').insert({
          user_id: userId,
          title: 'Your coach checked in on you',
          body: 'You have a new message from your Division Alpha coach.',
          type: 'coach_message',
          action_page: 'coach',
        })

        // Send life check email
        if (member.profile.email) {
          const email = lifeCheckDm(userName)
          email.to = member.profile.email
          sendEmail(email).catch(err => console.error('[guardian] life check email failed:', err))
        }

        results.push({ user: userName, action: 'life_check_dm', misses: consecutiveMisses })

      } else if (consecutiveMisses >= 3) {
        // Escalation + pause offer
        await supabase.from('engagement_events').insert({
          user_id: userId,
          squad_id: member.squad.id,
          sprint_id: sprint.id,
          event_type: 'escalated_to_admin',
          consecutive_misses: consecutiveMisses,
        })

        // Offer pause
        const pauseMessage = `${userName.split(' ')[0]}, I've noticed you've been quiet for a while. No judgment — life happens.

You have three options:
1. **I'm heads down** — just forgot to post, I'll catch up
2. **I need support** — something's blocking me, can we talk?
3. **I need a pause** — take a week off, goals paused, stay in your squad

Whatever you choose, your squad would rather hear from you than guess. Reply with 1, 2, or 3.`

        await supabase.from('coach_messages').insert({
          user_id: userId,
          role: 'coach',
          content: pauseMessage,
          sprint_id: sprint.id,
          week_number: sprint.current_week,
          trigger_type: 'guardian_referral',
        })

        await supabase.from('engagement_events').insert({
          user_id: userId,
          squad_id: member.squad.id,
          sprint_id: sprint.id,
          event_type: 'pause_offered',
          consecutive_misses: consecutiveMisses,
        })

        results.push({ user: userName, action: 'escalated_pause_offered', misses: consecutiveMisses })
      }
    }

    return NextResponse.json({ sprint: sprint.number, week: sprint.current_week, interventions: results })
  } catch (err) {
    console.error('Guardian error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function generateLifeCheck(userName: string, misses: number, lastActive: string | null): Promise<string> {
  const firstName = userName.split(' ')[0]
  const lastActiveStr = lastActive ? `Last active: ${new Date(lastActive).toLocaleDateString()}` : 'No recent activity'

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are the Division Alpha coach sending a private "Life Check" to ${userName}.
They've missed ${misses} consecutive check-ins. ${lastActiveStr}.

Write a compassionate, private DM. NOT shame-inducing. Under 80 words.
Offer three options: (a) heads down executing and forgot, (b) struggling and need support, (c) thinking about pausing.
Use their first name (${firstName}). Be warm, not clinical.`
    },
    { role: 'user', content: 'Generate the Life Check message.' },
  ]

  return chatCompletion(messages, { temperature: 0.7, max_tokens: 200 })
}
