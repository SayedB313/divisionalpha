import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { chatCompletion, type ChatMessage } from '@/lib/minimax'

// Matchmaker Agent — forms squads from the applicant/member pool
// Triggered by: admin manually when sprint enrollment closes

const SQUAD_NAMES = [
  'Alpha Vanguard', 'Iron Circuit', 'Silent Forge', 'Ember Protocol',
  'Night Architects', 'Steady Currents', 'Zenith Builders', 'Dawn Patrol',
  'Grit Assembly', 'Quiet Storm', 'First Light', 'Deep Current',
  'Signal Fire', 'True North', 'Last Mile', 'Open Field',
]

export async function POST(request: NextRequest) {
  try {
    const { sprint_id } = await request.json()
    const supabase = createServiceClient()

    if (!sprint_id) {
      return NextResponse.json({ error: 'sprint_id required' }, { status: 400 })
    }

    const { data: sprint } = await supabase
      .from('sprints')
      .select('*')
      .eq('id', sprint_id)
      .single()

    if (!sprint) {
      return NextResponse.json({ error: 'Sprint not found' }, { status: 404 })
    }

    // Get all active members who need squads for this sprint
    // Include: new applicants (converted) + reshuffled members + new members
    const { data: availableMembers } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'active')
      .eq('tier', sprint.tier)

    if (!availableMembers?.length) {
      return NextResponse.json({ message: 'No members available for matching' })
    }

    // Check who already has a squad for this sprint
    const { data: existingMembers } = await supabase
      .from('squad_members')
      .select('user_id')
      .eq('status', 'active')
      .in('squad_id', (
        await supabase.from('squads').select('id').eq('sprint_id', sprint_id)
      ).data?.map((s: any) => s.id) || [])

    const assignedIds = new Set((existingMembers || []).map((m: any) => m.user_id))
    const unassigned = availableMembers.filter((m: any) => !assignedIds.has(m.id))

    if (unassigned.length === 0) {
      return NextResponse.json({ message: 'All members already assigned' })
    }

    // Build operator profiles for MiniMax matching
    const operatorProfiles = unassigned.map((m: any) => ({
      id: m.id,
      name: m.display_name,
      timezone: m.timezone,
      persona_type: m.persona_type || 'Builder',
      accountability_style: m.accountability_style || 'Mix of All',
      current_stage: m.current_stage || 'Building & Growing',
      communication_freq: m.communication_freq || 'Somewhere in between',
      sprints_completed: m.sprints_completed || 0,
    }))

    // Use MiniMax to generate squad assignments
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are the Matchmaker AI for Division Alpha. You form squads of 6-8 operators that maximize retention and goal completion.

MATCHING CRITERIA (in priority order):
1. TIMEZONE COMPATIBILITY (hard constraint): Members must have 4+ hour overlap. Group by compatible timezone clusters.
2. GOAL DIVERSITY (30%): Mix Builders + Rewirers + Pivots. 2-3 of each type per squad.
3. PERSONALITY BALANCE (25%): Mix "Direct and Challenging" with "Supportive" types. Avoid all-challengers or all-supporters.
4. EXPERIENCE LEVEL (20%): Mix veterans (2+ sprints) with newer members. Don't put all beginners together.
5. COMMUNICATION FREQUENCY (10%): Match "Daily" chatters with each other, "Only check-ins" with each other.

TARGET: ${Math.ceil(unassigned.length / 7)} squads of 6-8 members each.

Output ONLY valid JSON — an array of squad objects:
[{"squad_index": 0, "member_ids": ["id1", "id2", ...], "compatibility_score": 85, "reasoning": "one sentence"}]

Do not include any text outside the JSON array.`
      },
      {
        role: 'user',
        content: `Match these ${operatorProfiles.length} operators into squads:\n\n${JSON.stringify(operatorProfiles, null, 2)}`
      },
    ]

    const response = await chatCompletion(messages, { temperature: 0.3, max_tokens: 4096 })

    // Parse the squad assignments
    let assignments: { squad_index: number; member_ids: string[]; compatibility_score: number; reasoning: string }[]
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
      assignments = JSON.parse(jsonStr)
    } catch {
      console.error('Failed to parse matchmaker response:', response)
      return NextResponse.json({ error: 'Matchmaker response parsing failed', raw: response }, { status: 500 })
    }

    // Create squads and assign members
    const results = []
    const usedNames = new Set<string>()

    // Get existing squad names for this sprint
    const { data: existingSquads } = await supabase
      .from('squads').select('name').eq('sprint_id', sprint_id)
    for (const s of (existingSquads || [])) usedNames.add(s.name)

    for (const assignment of assignments) {
      // Pick a squad name
      const availableName = SQUAD_NAMES.find(n => !usedNames.has(n)) || `Squad ${assignment.squad_index + 1}`
      usedNames.add(availableName)

      // Determine timezone
      const memberTimezones = assignment.member_ids
        .map((id: string) => unassigned.find((m: any) => m.id === id)?.timezone || 'America/New_York')
      const primaryTz = mode(memberTimezones)

      // Create squad
      const { data: squad } = await supabase.from('squads').insert({
        sprint_id: sprint_id,
        name: availableName,
        tier: sprint.tier,
        member_count: assignment.member_ids.length,
        compatibility_score: assignment.compatibility_score,
        timezone_primary: primaryTz,
        status: 'forming',
      }).select().single()

      if (!squad) continue

      // Assign members
      for (const memberId of assignment.member_ids) {
        await supabase.from('squad_members').insert({
          squad_id: squad.id,
          user_id: memberId,
          role: 'member',
          status: 'active',
        })
      }

      results.push({
        squad: availableName,
        members: assignment.member_ids.length,
        compatibility: assignment.compatibility_score,
        reasoning: assignment.reasoning,
      })
    }

    // Update sprint status
    await supabase.from('sprints').update({ status: 'handshake' }).eq('id', sprint_id)

    // Fire event to Facilitator for squad reveals
    await supabase.from('agent_events').insert({
      source_agent: 'matchmaker',
      target_agent: 'facilitator',
      event_type: 'squads_formed',
      payload: { sprint_id, squads: results },
    })

    return NextResponse.json({
      sprint: sprint.name,
      squads_formed: results.length,
      total_members_assigned: results.reduce((sum, r) => sum + r.members, 0),
      squads: results,
    })
  } catch (err) {
    console.error('Matchmaker error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function mode(arr: string[]): string {
  const freq: Record<string, number> = {}
  for (const v of arr) freq[v] = (freq[v] || 0) + 1
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'America/New_York'
}
