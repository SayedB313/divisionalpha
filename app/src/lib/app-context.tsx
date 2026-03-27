'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'

// ─── Types ──────────────────────────────────────────────

export interface Profile {
  id: string
  display_name: string
  initials: string
  avatar_url: string | null
  email: string
  bio: string
  timezone: string
  one_liner: string | null
  primary_focus: string | null
  current_stage: string | null
  accountability_style: string | null
  persona_type: string | null
  tier: number
  role: string
  status: string
  sprints_completed: number
  subscription_status: string | null
  created_at: string
}

export interface Sprint {
  id: string
  number: number
  tier: number
  name: string | null
  start_date: string
  end_date: string
  current_week: number
  duration_weeks: number
  status: string
}

export interface Squad {
  id: string
  name: string
  member_count: number
  health_score: number | null
  completion_rate: number | null
  streak: number
  status: string
}

export interface SquadMember {
  id: string
  user_id: string
  role: string
  status: string
  profile: {
    display_name: string
    initials: string
    avatar_url: string | null
  }
}

interface AppState {
  profile: Profile | null
  sprint: Sprint | null
  squad: Squad | null
  squadMembers: SquadMember[]
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AppContext = createContext<AppState>({
  profile: null,
  sprint: null,
  squad: null,
  squadMembers: [],
  loading: true,
  refreshProfile: async () => {},
})

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sprint, setSprint] = useState<Sprint | null>(null)
  const [squad, setSquad] = useState<Squad | null>(null)
  const [squadMembers, setSquadMembers] = useState<SquadMember[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadAppData = async () => {
    if (!user) {
      setProfile(null)
      setSprint(null)
      setSquad(null)
      setSquadMembers([])
      setLoading(false)
      return
    }

    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) setProfile(profileData)

      // Load current active sprint
      const { data: sprintData } = await supabase
        .from('sprints')
        .select('*')
        .in('status', ['handshake', 'active', 'dip_week', 'completing'])
        .order('start_date', { ascending: false })
        .limit(1)
        .single()

      if (sprintData) setSprint(sprintData)

      // Load user's active squad
      if (sprintData) {
        const { data: memberData } = await supabase
          .from('squad_members')
          .select(`
            squad_id,
            squads!inner (*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .eq('squads.sprint_id', sprintData.id)
          .single()

        if (memberData?.squads) {
          const squadData = memberData.squads as unknown as Squad
          setSquad(squadData)

          // Load squad members
          const { data: members } = await supabase
            .from('squad_members')
            .select(`
              id,
              user_id,
              role,
              status,
              profile:profiles!inner (
                display_name,
                initials,
                avatar_url
              )
            `)
            .eq('squad_id', squadData.id)
            .eq('status', 'active')

          if (members) setSquadMembers(members as unknown as SquadMember[])
        }
      }
    } catch (err) {
      console.error('Error loading app data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppData()
  }, [user])

  return (
    <AppContext.Provider value={{
      profile,
      sprint,
      squad,
      squadMembers,
      loading,
      refreshProfile: loadAppData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
