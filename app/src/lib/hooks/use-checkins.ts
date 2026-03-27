'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { useApp } from '@/lib/app-context'

export interface CheckinSignal {
  goal_index: number
  signal: 'green' | 'yellow' | 'red'
  note: string | null
}

export function useCheckins(weekNumber?: number) {
  const supabase = createClient()
  const { user } = useAuth()
  const { sprint, squad } = useApp()

  const week = weekNumber ?? sprint?.current_week

  // Fetch current week's check-in for this user
  const query = useQuery({
    queryKey: ['checkin', user?.id, sprint?.id, week],
    queryFn: async () => {
      if (!user || !sprint || !week) return null
      const { data, error } = await supabase
        .from('checkins')
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

  // Squad check-ins for this week
  const squadQuery = useQuery({
    queryKey: ['squad-checkins', squad?.id, sprint?.id, week],
    queryFn: async () => {
      if (!squad || !sprint || !week) return []
      const { data, error } = await supabase
        .from('checkins')
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

  const submit = useMutation({
    mutationFn: async (signals: CheckinSignal[]) => {
      if (!user || !sprint || !squad || !week) throw new Error('Missing context')

      const { data, error } = await supabase
        .from('checkins')
        .upsert({
          user_id: user.id,
          sprint_id: sprint.id,
          squad_id: squad.id,
          week_number: week,
          signals,
        }, {
          onConflict: 'user_id,sprint_id,week_number',
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkin'] })
      queryClient.invalidateQueries({ queryKey: ['squad-checkins'] })
    },
  })

  return {
    checkin: query.data,
    isLoading: query.isLoading,
    squadCheckins: squadQuery.data ?? [],
    submit,
  }
}
