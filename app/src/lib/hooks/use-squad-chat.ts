'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { useApp } from '@/lib/app-context'

export interface SquadMessage {
  id: string
  squad_id: string
  sender_id: string
  content: string
  message_type: 'user' | 'facilitator' | 'system' | 'nudge'
  reply_to_id: string | null
  created_at: string
  profile?: {
    display_name: string
    initials: string
    avatar_url: string | null
  }
}

export function useSquadChat() {
  const supabase = createClient()
  const { user } = useAuth()
  const { squad } = useApp()
  const queryClient = useQueryClient()
  const [isTyping, setIsTyping] = useState<string[]>([]) // user IDs currently typing

  // Load message history
  const messagesQuery = useQuery({
    queryKey: ['squad-messages', squad?.id],
    queryFn: async () => {
      if (!squad) return []
      const { data, error } = await supabase
        .from('squad_messages')
        .select(`
          *,
          profile:profiles!inner (display_name, initials, avatar_url)
        `)
        .eq('squad_id', squad.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) throw error
      return (data ?? []) as SquadMessage[]
    },
    enabled: !!squad,
  })

  // Real-time subscription for new messages
  useEffect(() => {
    if (!squad) return

    const channel = supabase
      .channel(`squad-chat-${squad.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'squad_messages',
        filter: `squad_id=eq.${squad.id}`,
      }, async (payload) => {
        // Fetch the full message with profile
        const { data } = await supabase
          .from('squad_messages')
          .select(`*, profile:profiles!inner (display_name, initials, avatar_url)`)
          .eq('id', payload.new.id)
          .single()

        if (data) {
          queryClient.setQueryData<SquadMessage[]>(
            ['squad-messages', squad.id],
            (old) => [...(old ?? []), data as SquadMessage]
          )
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [squad?.id])

  // Send message
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !squad) throw new Error('Missing context')

      const { data, error } = await supabase
        .from('squad_messages')
        .insert({
          squad_id: squad.id,
          sender_id: user.id,
          content,
          message_type: 'user',
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
  })

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    sendMessage,
    isTyping,
  }
}
