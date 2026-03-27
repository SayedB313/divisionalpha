'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { useApp } from '@/lib/app-context'

export function useOperatorScore() {
  const supabase = createClient()
  const { user } = useAuth()
  const { sprint } = useApp()

  return useQuery({
    queryKey: ['operator-score', user?.id, sprint?.id],
    queryFn: async () => {
      if (!user || !sprint) return null
      const { data, error } = await supabase
        .from('operator_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('sprint_id', sprint.id)
        .is('week_number', null) // sprint-level score
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!user && !!sprint,
  })
}

export function useLeaderboard() {
  const supabase = createClient()

  const operators = useQuery({
    queryKey: ['leaderboard-operators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_operators')
        .select('*')
        .limit(20)

      if (error) throw error
      return data ?? []
    },
  })

  const squads = useQuery({
    queryKey: ['leaderboard-squads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_squads')
        .select('*')
        .limit(20)

      if (error) throw error
      return data ?? []
    },
  })

  return {
    operators: operators.data ?? [],
    squads: squads.data ?? [],
    isLoading: operators.isLoading || squads.isLoading,
  }
}
