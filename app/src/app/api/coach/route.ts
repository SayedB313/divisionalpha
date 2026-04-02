import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'
import { chatCompletion, type ChatMessage } from '@/lib/minimax'

// Simple in-memory rate limiter: 20 messages per user per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Rate limit reached. You can send 20 messages per hour.' },
        { status: 429 }
      )
    }

    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Load user context for the Coach
    const serviceClient = createServiceClient()

    const [profileRes, sprintRes, recentMessagesRes, scoresRes, declarationRes] = await Promise.all([
      serviceClient.from('profiles').select('*').eq('id', user.id).single(),
      serviceClient.from('sprints').select('*')
        .in('status', ['active', 'dip_week']).order('start_date', { ascending: false }).limit(1).single(),
      serviceClient.from('coach_messages').select('role, content')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      serviceClient.from('operator_scores').select('*')
        .eq('user_id', user.id).is('week_number', null)
        .order('calculated_at', { ascending: false }).limit(1).maybeSingle(),
      serviceClient.from('declarations').select('goals, blockers')
        .eq('user_id', user.id).order('submitted_at', { ascending: false }).limit(1).maybeSingle(),
    ])

    const profile = profileRes.data
    const sprint = sprintRes.data
    const recentMessages = (recentMessagesRes.data ?? []).reverse()
    const scores = scoresRes.data
    const latestDeclaration = declarationRes.data

    // Build system prompt with full operator context
    const systemPrompt = buildCoachSystemPrompt(profile, sprint, scores, latestDeclaration)

    // Build conversation history
    const latestMessage = recentMessages[recentMessages.length - 1]
    const promptAlreadyIncludesMessage =
      latestMessage?.role === 'user' &&
      latestMessage?.content?.trim() === message.trim()

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map((m: any) => ({
        role: (m.role === 'coach' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: m.content,
      })),
      ...(promptAlreadyIncludesMessage ? [] : [{ role: 'user' as const, content: message }]),
    ]

    // Call MiniMax 2.7
    let coachResponse: string
    try {
      coachResponse = await chatCompletion(messages, {
        temperature: 0.8,
        max_tokens: 512,
      })
    } catch (aiErr) {
      console.error('MiniMax error:', aiErr)
      const firstName = profile?.display_name?.split(' ')[0] || 'Operator'
      coachResponse = `${firstName}, I'm having a moment of technical difficulty — my thinking circuits are busy. Give me a few minutes and try again. Your message was received.`
    }

    // Save coach response to database
    await serviceClient.from('coach_messages').insert({
      user_id: user.id,
      role: 'coach',
      content: coachResponse,
      sprint_id: sprint?.id ?? null,
      week_number: sprint?.current_week ?? null,
      trigger_type: 'user_initiated',
    })

    return NextResponse.json({ response: coachResponse })
  } catch (err) {
    console.error('Coach API error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function buildCoachSystemPrompt(profile: any, sprint: any, scores: any, declaration: any): string {
  const name = profile?.display_name || 'Operator'
  const firstName = name.split(' ')[0]
  const goals = declaration?.goals
    ? (declaration.goals as { text: string }[]).map(g => g.text).join(', ')
    : 'not yet declared'

  return `You are the Boss-side personal coach for ${name} inside Division Alpha — a 40-day proving ground for operators.

YOUR IDENTITY:
- You are direct, observant, and calm under pressure. Never generic. Never sycophantic.
- You notice behavior patterns, not just moods. You tell the truth without shaming.
- You are part of one unified system. Humans may be embedded in the experience, but to the operator this should feel like one memory and one relationship.
- Tawakkul-based philosophy: evaluate Amal (effort/action), not outcomes.
  "Did you do the work? YES = you did your part. The outcome is with Allah."
- Struggling is data. Missing a goal is information. Hiding is the only failure.
- Anti-hustle-culture. Structured effort + rest, not grinding.

YOUR OPERATOR — ${firstName}:
- Persona: ${profile?.persona_type || 'Unknown'} (${profile?.persona_type === 'Builder' ? 'launching projects, needs deadlines' : profile?.persona_type === 'Rewirer' ? 'changing habits, needs consistency' : 'changing direction, needs clarity'})
- Accountability style: ${profile?.accountability_style || 'Unknown'}
- Stage: ${profile?.current_stage || 'Unknown'}
- Sprint: ${sprint?.number || '?'}, Week ${sprint?.current_week || '?'} of ${sprint?.duration_weeks || 6}
- Sprints completed: ${profile?.sprints_completed || 0}
- Current goals: ${goals}
${scores ? `- Operator Score: ${scores.total_score}/100 (Goal Completion: ${scores.goal_completion}, Attendance: ${scores.attendance}, Contribution: ${scores.squad_contribution}, Leadership: ${scores.leadership}, Growth: ${scores.growth}, Communication: ${scores.communication})` : ''}
${declaration?.blockers ? `- Current blockers: ${declaration.blockers}` : ''}

RULES:
- Keep responses under 200 words unless in goal refinement mode.
- End with a specific, actionable suggestion when possible.
- Reference specific data points from their context, not generic advice.
- If they're doing well, say so briefly. Don't over-coach.
- Never be shame-inducing. Reframe misses as data.
- Speak like the Boss remembers yesterday, not like a detached assistant seeing a fresh chat.
- Use their first name naturally (${firstName}).
- When relevant, weave in Islamic wisdom subtly — not heavy-handed.`
}
