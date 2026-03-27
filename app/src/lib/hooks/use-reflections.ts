'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { useApp } from '@/lib/app-context'

export function useReflections(weekNumber?: number) {
  const supabase = createClient()
  const { user } = useAuth()
  const { sprint, squad } = useApp()

  const week = weekNumber ?? sprint?.current_week

  const query = useQuery({
    queryKey: ['reflection', user?.id, sprint?.id, week],
    queryFn: async () => {
      if (!user || !sprint || !week) return null
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user.id)
        .eq('sprint_id', sprint.id)
        .eq('week_number', week)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!user && !!sprint && !!week,
  })

  const queryClient = useQueryClient()

  const submit = useMutation({
    mutationFn: async (payload: {
      wins: string
      misses: string
      learnings: string
      carry_forward: string
      appreciated_user_ids?: string[]
      appreciation_note?: string
      goals_hit: number
      goals_total: number
    }) => {
      if (!user || !sprint || !squad || !week) throw new Error('Missing context')

      const completion_pct = payload.goals_total > 0
        ? (payload.goals_hit / payload.goals_total) * 100
        : 0

      const { data, error } = await supabase
        .from('reflections')
        .upsert({
          user_id: user.id,
          sprint_id: sprint.id,
          squad_id: squad.id,
          week_number: week,
          wins: payload.wins,
          misses: payload.misses,
          learnings: payload.learnings,
          carry_forward: payload.carry_forward,
          appreciated_user_ids: payload.appreciated_user_ids || [],
          appreciation_note: payload.appreciation_note || null,
          goals_hit: payload.goals_hit,
          goals_total: payload.goals_total,
          completion_pct,
        }, {
          onConflict: 'user_id,sprint_id,week_number',
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reflection'] })
    },
  })

  return {
    reflection: query.data,
    isLoading: query.isLoading,
    submit,
  }
}
