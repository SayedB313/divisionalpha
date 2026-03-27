import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'

// Admin Dashboard API — platform health, KPIs, at-risk users
// Protected: requires admin/founder role

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()

    const { data: profile } = await service
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'founder'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Gather all dashboard data in parallel
    const [
      sprintRes,
      profilesRes,
      activeSquadsRes,
      applicationsRes,
      atRiskRes,
      pausesRes,
      recentEventsRes,
      scoresRes,
    ] = await Promise.all([
      // Current sprint
      service.from('sprints').select('*')
        .in('status', ['active', 'dip_week', 'completing'])
        .order('start_date', { ascending: false }).limit(1).single(),

      // User counts
      service.from('profiles').select('status, tier, subscription_status', { count: 'exact' }),

      // Active squads with health
      service.from('squads').select('id, name, member_count, health_score, completion_rate, status, streak')
        .in('status', ['active', 'completing'])
        .order('health_score', { ascending: true }),

      // Pending applications
      service.from('applications').select('*', { count: 'exact' })
        .eq('status', 'submitted'),

      // At-risk users (2+ consecutive misses)
      service.from('engagement_events').select('user_id, consecutive_misses, event_type, created_at, profile:profiles(display_name, email)')
        .gte('consecutive_misses', 2)
        .order('created_at', { ascending: false })
        .limit(20),

      // Active pauses
      service.from('pauses').select('*, profile:profiles(display_name, email)')
        .eq('status', 'active'),

      // Recent agent events (last 24h)
      service.from('agent_events').select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20),

      // Score distribution
      service.from('operator_scores').select('total_score')
        .eq('sprint_id', (await service.from('sprints').select('id').in('status', ['active', 'dip_week']).limit(1).single()).data?.id || '')
        .is('week_number', null),
    ])

    const sprint = sprintRes.data
    const profiles = profilesRes.data || []

    // Calculate KPIs
    const totalUsers = profiles.length
    const activeUsers = profiles.filter((p: any) => p.status === 'active').length
    const pausedUsers = profiles.filter((p: any) => p.status === 'paused').length
    const churnedUsers = profiles.filter((p: any) => p.status === 'churned').length
    const tier2Users = profiles.filter((p: any) => p.tier === 2 && p.status === 'active').length
    const tier3Users = profiles.filter((p: any) => p.tier === 3 && p.status === 'active').length
    const payingUsers = profiles.filter((p: any) => p.subscription_status === 'active').length

    const squads = activeSquadsRes.data || []
    const avgHealthScore = squads.length > 0
      ? Math.round(squads.reduce((sum: number, s: any) => sum + (Number(s.health_score) || 0), 0) / squads.length)
      : 0
    const avgCompletionRate = squads.length > 0
      ? Math.round(squads.reduce((sum: number, s: any) => sum + (Number(s.completion_rate) || 0), 0) / squads.length)
      : 0

    // Score distribution
    const scores = (scoresRes.data || []).map((s: any) => Number(s.total_score))
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0
    const tier3Eligible = scores.filter((s: number) => s >= 85).length // top 5% threshold approx

    // Monthly revenue estimate
    const monthlyRevenue = tier2Users * 49 + tier3Users * 297

    return NextResponse.json({
      sprint: sprint ? {
        name: sprint.name,
        number: sprint.number,
        current_week: sprint.current_week,
        status: sprint.status,
        duration_weeks: sprint.duration_weeks,
      } : null,

      kpis: {
        total_users: totalUsers,
        active_users: activeUsers,
        paying_users: payingUsers,
        paused_users: pausedUsers,
        churned_users: churnedUsers,
        tier2_users: tier2Users,
        tier3_users: tier3Users,
        monthly_revenue_estimate: monthlyRevenue,
        arr_estimate: monthlyRevenue * 12,
        avg_operator_score: avgScore,
        tier3_eligible: tier3Eligible,
      },

      squads: {
        active_count: squads.length,
        avg_health_score: avgHealthScore,
        avg_completion_rate: avgCompletionRate,
        list: squads.map((s: any) => ({
          name: s.name,
          members: s.member_count,
          health: s.health_score,
          completion: s.completion_rate,
          streak: s.streak,
        })),
      },

      applications: {
        pending: applicationsRes.count || 0,
      },

      at_risk: {
        count: (atRiskRes.data || []).length,
        users: (atRiskRes.data || []).map((e: any) => ({
          name: e.profile?.display_name,
          email: e.profile?.email,
          consecutive_misses: e.consecutive_misses,
          last_event: e.event_type,
          event_at: e.created_at,
        })),
      },

      active_pauses: {
        count: (pausesRes.data || []).length,
        users: (pausesRes.data || []).map((p: any) => ({
          name: p.profile?.display_name,
          paused_at: p.paused_at,
          resume_by: p.resume_by,
        })),
      },

      recent_agent_activity: {
        last_24h: (recentEventsRes.data || []).length,
        events: (recentEventsRes.data || []).map((e: any) => ({
          source: e.source_agent,
          target: e.target_agent,
          type: e.event_type,
          processed: e.processed,
          at: e.created_at,
        })),
      },
    })
  } catch (err) {
    console.error('Dashboard error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
