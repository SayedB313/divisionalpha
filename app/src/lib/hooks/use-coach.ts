'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'

export interface CoachMessage {
  id: string
  user_id: string
  role: 'user' | 'coach'
  content: string
  sprint_id: string | null
  week_number: number | null
  trigger_type: string | null
  created_at: string
}

export function useCoach() {
  const supabase = createClient()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isCoachTyping, setIsCoachTyping] = useState(false)

  // Load conversation history
  const messagesQuery = useQuery({
    queryKey: ['coach-messages', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('coach_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50)

      if (error) throw error
      return (data ?? []) as CoachMessage[]
    },
    enabled: !!user,
  })

  // Real-time subscription for coach responses
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`coach-dm-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'coach_messages',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const newMsg = payload.new as CoachMessage
        // Only add if it's a coach response (user messages are added optimistically)
        if (newMsg.role === 'coach') {
          setIsCoachTyping(false)
          queryClient.setQueryData<CoachMessage[]>(
            ['coach-messages', user.id],
            (old) => [...(old ?? []), newMsg]
          )
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  // Send message to coach
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated')

      // 1. Insert user message
      const { data: userMsg, error: insertError } = await supabase
        .from('coach_messages')
        .insert({
          user_id: user.id,
          role: 'user',
          content,
          trigger_type: 'user_initiated',
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Optimistically add user message
      queryClient.setQueryData<CoachMessage[]>(
        ['coach-messages', user.id],
        (old) => [...(old ?? []), userMsg as CoachMessage]
      )

      // 2. Trigger coach response via API
      setIsCoachTyping(true)
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      })

      if (!res.ok) {
        setIsCoachTyping(false)
        throw new Error('Coach response failed')
      }

      // Coach response will arrive via Realtime subscription
      return userMsg
    },
  })

  // Get latest coach whisper (for home page)
  const whisperQuery = useQuery({
    queryKey: ['coach-whisper', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from('coach_messages')
        .select('content, created_at')
        .eq('user_id', user.id)
        .eq('role', 'coach')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    isCoachTyping,
    sendMessage,
    whisper: whisperQuery.data,
  }
}
