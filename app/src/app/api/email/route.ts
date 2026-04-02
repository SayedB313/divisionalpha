import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const log = createLogger('email')
import {
  sendEmail,
  mondayDeclarationReminder,
  wednesdayCheckinReminder,
  fridayReflectionReminder,
  squadNudge,
  lifeCheckDm,
  sprintKickoff,
  sprintCompletion,
} from '@/lib/email'

// Email notification API — called by agents (facilitator, guardian, lifecycle)
// POST /api/email { action, user_ids?, squad_id? }

export async function POST(request: NextRequest) {
  try {
    const { action, user_ids, squad_id, meta } = await request.json()
    const supabase = createServiceClient()

    // Get active sprint
    const { data: sprint } = await supabase
      .from('sprints')
      .select('*')
      .in('status', ['handshake', 'active', 'dip_week', 'completing'])
      .order('start_date', { ascending: false })
      .limit(1)
      .single()

    if (!sprint) {
      return NextResponse.json({ message: 'No active sprint' })
    }

    // Resolve target users
    let targetUsers: { id: string; email: string; display_name: string }[] = []

    if (user_ids?.length) {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .in('id', user_ids)
      targetUsers = data || []
    } else if (squad_id) {
      const { data: members } = await supabase
        .from('squad_members')
        .select('user_id, profile:profiles!inner(id, email, display_name)')
        .eq('squad_id', squad_id)
        .eq('status', 'active')
      targetUsers = (members || []).map((m: any) => ({
        id: m.profile.id,
        email: m.profile.email,
        display_name: m.profile.display_name,
      }))
    }

    // Check notification preferences — skip users who opted out of email
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('user_id, sprint_reminders, squad_activity, coach_messages, weekly_digest')
      .in('user_id', targetUsers.map(u => u.id))

    const prefKey = getPreferenceKey(action)
    const optedOut = new Set(
      (prefs || [])
        .filter((pref: any) => prefKey && pref[prefKey] === false)
        .map((pref: any) => pref.user_id)
    )
    targetUsers = targetUsers.filter(u => !optedOut.has(u.id))

    if (!targetUsers.length) {
      return NextResponse.json({ message: 'No eligible recipients', sent: 0 })
    }

    // Resolve squad name for nudge emails
    let squadName = ''
    if (squad_id) {
      const { data: sq } = await supabase
        .from('squads')
        .select('name')
        .eq('id', squad_id)
        .single()
      squadName = sq?.name || 'your squad'
    }

    const results: { user: string; status: string }[] = []

    for (const user of targetUsers) {
      try {
        let email

        switch (action) {
          case 'monday_reminder':
            email = mondayDeclarationReminder(user.email, user.display_name, sprint.current_week, sprint.number)
            break
          case 'wednesday_reminder':
            email = wednesdayCheckinReminder(user.email, user.display_name, sprint.current_week, sprint.number)
            break
          case 'friday_reminder':
            email = fridayReflectionReminder(user.email, user.display_name, sprint.current_week, sprint.number)
            break
          case 'squad_nudge':
            email = squadNudge(user.email, user.display_name, squadName, meta?.missed_action || 'participate')
            break
          case 'life_check':
            email = lifeCheckDm(user.email, user.display_name)
            break
          case 'sprint_kickoff':
            email = sprintKickoff(user.email, user.display_name, sprint.number, squadName)
            break
          case 'sprint_completion':
            email = sprintCompletion(user.email, user.display_name, sprint.number, meta?.score || 0)
            break
          default:
            results.push({ user: user.email, status: `unknown action: ${action}` })
            continue
        }

        await sendEmail(email)
        log.info('Email sent', { action, recipient: user.email })
        results.push({ user: user.email, status: 'sent' })
      } catch (err: any) {
        log.error('Email send failed', { action, recipient: user.email, error: err.message })
        results.push({ user: user.email, status: `error: ${err.message}` })
      }
    }

    return NextResponse.json({
      action,
      sent: results.filter(r => r.status === 'sent').length,
      total: results.length,
      results,
    })
  } catch (err: any) {
    log.error('Route error', { error: err.message })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function getPreferenceKey(action: string): 'sprint_reminders' | 'squad_activity' | 'coach_messages' | 'weekly_digest' | null {
  switch (action) {
    case 'monday_reminder':
    case 'wednesday_reminder':
    case 'friday_reminder':
    case 'sprint_kickoff':
    case 'sprint_completion':
      return 'sprint_reminders'
    case 'squad_nudge':
      return 'squad_activity'
    case 'life_check':
      return 'coach_messages'
    default:
      return null
  }
}
