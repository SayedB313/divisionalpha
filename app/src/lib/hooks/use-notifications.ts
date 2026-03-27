'use client'

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'

export function useNotifications() {
  const supabase = createClient()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread count
  const countQuery = useQuery({
    queryKey: ['notification-count', user?.id],
    queryFn: async () => {
      if (!user) return 0
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) return 0
      return count || 0
    },
    enabled: !!user,
    refetchInterval: 30000, // poll every 30s as fallback
  })

  // Fetch recent notifications
  const listQuery = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) return []
      return data ?? []
    },
    enabled: !!user,
  })

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        // Increment count and refetch
        setUnreadCount(prev => prev + 1)
        queryClient.invalidateQueries({ queryKey: ['notification-count'] })
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  // Sync from query
  useEffect(() => {
    if (countQuery.data !== undefined) {
      setUnreadCount(countQuery.data)
    }
  }, [countQuery.data])

  // Mark all as read
  const markAllRead = async () => {
    if (!user) return
    await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('read', false)

    setUnreadCount(0)
    queryClient.invalidateQueries({ queryKey: ['notification-count'] })
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  // Mark one as read
  const markRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', id)

    queryClient.invalidateQueries({ queryKey: ['notification-count'] })
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  return {
    unreadCount,
    notifications: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    markAllRead,
    markRead,
  }
}
