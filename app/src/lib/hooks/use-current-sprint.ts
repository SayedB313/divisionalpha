'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useCurrentSprint() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['current-sprint'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .in('status', ['handshake', 'active', 'dip_week', 'completing'])
        .order('start_date', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      return data
    },
  })
}
