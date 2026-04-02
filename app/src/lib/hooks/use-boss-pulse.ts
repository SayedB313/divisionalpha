'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { useApp } from '@/lib/app-context'
import { getDateInTimeZone, type BossPulseStatus } from '@/lib/boss-loop'
import { createClient } from '@/lib/supabase/client'

export interface BossPulse {
  id: string
  pulse_date: string
  status: BossPulseStatus
  prompt_text: string | null
  response_note: string | null
  score_after: number | null
  score_delta: number | null
  streak_after: number | null
  responded_at: string | null
}

type BossPulseResponse = Exclude<BossPulseStatus, 'pending'>

export function useBossPulse() {
  const supabase = createClient()
  const { user } = useAuth()
  const { profile, sprint } = useApp()
  const queryClient = useQueryClient()

  const timeZone =
    profile?.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    'America/Toronto'
  const today = getDateInTimeZone(timeZone)

  const pulseQuery = useQuery({
    queryKey: ['boss-pulse', user?.id, sprint?.id, today],
    queryFn: async () => {
      if (!user || !sprint) return null

      const { data, error } = await supabase
        .from('boss_pulses')
        .select('*')
        .eq('user_id', user.id)
        .eq('sprint_id', sprint.id)
        .eq('pulse_date', today)
        .maybeSingle()

      if (error) throw error
      return data as BossPulse | null
    },
    enabled: !!user && !!sprint,
  })

  const recentQuery = useQuery({
    queryKey: ['boss-pulses', user?.id, sprint?.id],
    queryFn: async () => {
      if (!user || !sprint) return []

      const { data, error } = await supabase
        .from('boss_pulses')
        .select('*')
        .eq('user_id', user.id)
        .eq('sprint_id', sprint.id)
        .order('pulse_date', { ascending: false })
        .limit(7)

      if (error) throw error
      return (data ?? []) as BossPulse[]
    },
    enabled: !!user && !!sprint,
  })

  const submit = useMutation({
    mutationFn: async ({ status, note }: { status: BossPulseResponse; note?: string }) => {
      const res = await fetch('/api/boss/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit boss pulse')
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boss-pulse'] })
      queryClient.invalidateQueries({ queryKey: ['boss-pulses'] })
      queryClient.invalidateQueries({ queryKey: ['operator-score'] })
    },
  })

  return {
    pulse: pulseQuery.data,
    recentPulses: recentQuery.data ?? [],
    isLoading: pulseQuery.isLoading || recentQuery.isLoading,
    today,
    submit,
  }
}
