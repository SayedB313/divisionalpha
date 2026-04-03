'use client'

import { useApp } from '@/lib/app-context'
import { useDeclarations } from '@/lib/hooks/use-declarations'
import { useCheckins } from '@/lib/hooks/use-checkins'
import { useSquadChat } from '@/lib/hooks/use-squad-chat'
import { useTierState } from '@/lib/hooks/use-tier-state'

export function useSquadState() {
  const { squad, squadMembers, profile } = useApp()
  const { squadDeclarations } = useDeclarations()
  const { squadCheckins } = useCheckins()
  const { messages, sendMessage, isLoading } = useSquadChat()
  const tier = useTierState()

  const otherMembers = squadMembers.filter((member) => member.user_id !== profile?.id)
  const memberCount = squad?.member_count ?? squadMembers.length
  const checkedInCount = squadCheckins.length
  const squadDamage = squad?.completion_rate !== null && squad?.completion_rate !== undefined
    ? Math.max(0, 100 - Number(squad.completion_rate))
    : null

  return {
    isLocked: !tier.qualifiedUnlocked,
    tier,
    squad,
    memberCount,
    otherMembers,
    checkedInCount,
    squadDamage,
    squadDeclarations,
    squadCheckins,
    messages,
    sendMessage,
    isLoading,
  }
}
