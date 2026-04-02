'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { useApp } from '@/lib/app-context'

export function useDeclarations(weekNumber?: number) {
  const supabase = createClient()
  const { user } = useAuth()
  const { sprint, squad } = useApp()

  const week = weekNumber ?? sprint?.current_week

  // Fetch current week's declaration for this user
  const query = useQuery({
    queryKey: ['declaration', user?.id, sprint?.id, week],
    queryFn: async () => {
      if (!user || !sprint || !week) return null
      const { data, error } = await supabase
        .from('declarations')
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

  // Fetch all squad declarations for this week (activity feed)
  const squadQuery = useQuery({
    queryKey: ['squad-declarations', squad?.id, sprint?.id, week],
    queryFn: async () => {
      if (!squad || !sprint || !week) return []
      const { data, error } = await supabase
        .from('declarations')
        .select(`
          *,
          profile:profiles!inner (display_name, initials, avatar_url)
        `)
        .eq('squad_id', squad.id)
        .eq('sprint_id', sprint.id)
        .eq('week_number', week)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    enabled: !!squad && !!sprint && !!week,
  })

  const queryClient = useQueryClient()

  // Submit declaration
  const submit = useMutation({
    mutationFn: async (payload: {
      goals: { text: string; order: number }[]
      blockers?: string
      help_request?: string
    }) => {
      if (!user || !sprint || !week) throw new Error('Missing context')

      const { data, error } = await supabase
        .from('declarations')
        .upsert({
          user_id: user.id,
          sprint_id: sprint.id,
          squad_id: squad?.id ?? null,
          week_number: week,
          goals: payload.goals,
          blockers: payload.blockers || null,
          help_request: payload.help_request || null,
        }, {
          onConflict: 'user_id,sprint_id,week_number',
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['declaration'] })
      if (squad) {
        queryClient.invalidateQueries({ queryKey: ['squad-declarations'] })
      }
    },
  })

  return {
    declaration: query.data,
    isLoading: query.isLoading,
    squadDeclarations: squadQuery.data ?? [],
    submit,
  }
}
