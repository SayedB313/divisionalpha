import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { chatCompletion, type ChatMessage } from '@/lib/minimax'

// Event Bus Processor — processes inter-agent events from agent_events table
// Called by cron (every 3 hours) or after agent actions

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()

    // Fetch unprocessed events
    const { data: events } = await supabase
      .from('agent_events')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(50)

    if (!events?.length) {
      return NextResponse.json({ message: 'No pending events', processed: 0 })
    }

    const results = []

    for (const event of events) {
      try {
        await processEvent(supabase, event)

        // Mark as processed
        await supabase.from('agent_events').update({
          processed: true,
          processed_at: new Date().toISOString(),
        }).eq('id', event.id)

        results.push({ id: event.id, type: event.event_type, status: 'processed' })
      } catch (err: any) {
        // Mark error but don't stop processing other events
        await supabase.from('agent_events').update({
          error: err.message,
        }).eq('id', event.id)

        results.push({ id: event.id, type: event.event_type, status: 'error', error: err.message })
      }
    }

    return NextResponse.json({ processed: results.length, results })
  } catch (err) {
    console.error('Event bus error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function processEvent(supabase: any, event: any) {
  const { source_agent, target_agent, event_type, payload } = event

  switch (`${target_agent}:${event_type}`) {
    // Guardian → Facilitator: nudge a member publicly
    case 'facilitator:nudge_member': {
      const { user_name, squad_id, miss_type } = payload
      const firstName = user_name?.split(' ')[0] || 'Hey'

      const missLabel = miss_type === 'missed_declaration' ? 'declaration'
        : miss_type === 'missed_checkin' ? 'check-in' : 'reflection'

      const msgs: ChatMessage[] = [
        {
          role: 'system',
          content: `You are the Division Alpha Facilitator. Generate a brief, gentle public nudge for ${user_name} who missed their ${missLabel}. One sentence, warm not aggressive. Use their first name (${firstName}).`
        },
        { role: 'user', content: 'Generate the nudge.' },
      ]

      const nudge = await chatCompletion(msgs, { temperature: 0.7, max_tokens: 80 })

      const { data: admin } = await supabase
        .from('profiles').select('id').eq('role', 'founder').limit(1).maybeSingle()

      if (admin) {
        await supabase.from('squad_messages').insert({
          squad_id,
          sender_id: admin.id,
          content: nudge,
          message_type: 'nudge',
        })
      }
      break
    }

    // Matchmaker → Facilitator: squads formed, trigger reveals
    case 'facilitator:squads_formed': {
      const { sprint_id, squads } = payload
      // Trigger squad reveal ceremony for each new squad
      for (const squad of squads) {
        await fetch(`${BASE_URL}/api/agents/ceremonies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ceremony: 'squad_reveal', squad_id: squad.squad_id }),
        })
      }
      break
    }

    // Facilitator → Coach: Dip intervention Why Reset
    case 'coach:dip_intervention_why_reset': {
      const { user_id, sprint_id } = payload

      const { data: profile } = await supabase
        .from('profiles').select('display_name').eq('id', user_id).single()

      const firstName = profile?.display_name?.split(' ')[0] || 'Operator'

      const msgs: ChatMessage[] = [
        {
          role: 'system',
          content: `You are the personal Coach for ${profile?.display_name || 'this operator'} on Division Alpha.
It's Week 3 — the "Dip". Motivation drops at the midpoint of any commitment.

Send a private "Why Reset" message. Ask them to answer 3 questions in 60 seconds:
1. Why did you join Division Alpha?
2. What will be different about your life if you finish this sprint strong?
3. What will you regret if you don't?

Be direct and compassionate. Use their first name (${firstName}). Under 120 words.`
        },
        { role: 'user', content: 'Generate the Why Reset message.' },
      ]

      const whyReset = await chatCompletion(msgs, { temperature: 0.7, max_tokens: 250 })

      await supabase.from('coach_messages').insert({
        user_id,
        role: 'coach',
        content: whyReset,
        sprint_id,
        trigger_type: 'dip_intervention',
      })

      await supabase.from('notifications').insert({
        user_id,
        title: 'Week 3 — Your Coach Has a Message',
        body: 'The midpoint matters. Your coach wants to talk.',
        type: 'coach_message',
        action_page: 'coach',
      })
      break
    }

    // Guardian → Coach: user showing disengagement
    case 'coach:user_disengaging': {
      const { user_id, consecutive_misses } = payload

      const { data: profile } = await supabase
        .from('profiles').select('display_name, persona_type').eq('id', user_id).single()

      const msgs: ChatMessage[] = [
        {
          role: 'system',
          content: `You are the Coach for ${profile?.display_name}. The Guardian flagged them — ${consecutive_misses} consecutive missed check-ins.

Send a proactive, compassionate private message. Don't mention the Guardian or surveillance.
Instead, frame it naturally: "I noticed you've been quiet..."
Ask what's going on. Offer specific help. Be brief — under 80 words.`
        },
        { role: 'user', content: 'Generate the outreach message.' },
      ]

      const outreach = await chatCompletion(msgs, { temperature: 0.7, max_tokens: 200 })

      await supabase.from('coach_messages').insert({
        user_id,
        role: 'coach',
        content: outreach,
        trigger_type: 'guardian_referral',
      })
      break
    }

    default:
      console.log(`Unhandled event: ${target_agent}:${event_type}`)
  }
}
