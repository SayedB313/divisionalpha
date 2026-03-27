import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
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
      .select('user_id, email_enabled')
      .in('user_id', targetUsers.map(u => u.id))

    const optedOut = new Set(
      (prefs || []).filter((p: any) => p.email_enabled === false).map((p: any) => p.user_id)
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
            email = mondayDeclarationReminder(user.display_name, sprint.current_week, sprint.number)
            break
          case 'wednesday_reminder':
            email = wednesdayCheckinReminder(user.display_name, sprint.current_week, sprint.number)
            break
          case 'friday_reminder':
            email = fridayReflectionReminder(user.display_name, sprint.current_week, sprint.number)
            break
          case 'squad_nudge':
            email = squadNudge(user.display_name, squadName, meta?.missed_action || 'participate')
            break
          case 'life_check':
            email = lifeCheckDm(user.display_name)
            break
          case 'sprint_kickoff':
            email = sprintKickoff(user.display_name, sprint.number, squadName)
            break
          case 'sprint_completion':
            email = sprintCompletion(user.display_name, sprint.number, meta?.score || 0)
            break
          default:
            results.push({ user: user.email, status: `unknown action: ${action}` })
            continue
        }

        email.to = user.email
        await sendEmail(email)
        results.push({ user: user.email, status: 'sent' })
      } catch (err: any) {
        results.push({ user: user.email, status: `error: ${err.message}` })
      }
    }

    return NextResponse.json({
      action,
      sent: results.filter(r => r.status === 'sent').length,
      total: results.length,
      results,
    })
  } catch (err) {
    console.error('[email] Route error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
