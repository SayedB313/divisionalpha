'use client'

import { useBossPulse } from '@/lib/hooks/use-boss-pulse'
import { useLeaderboard, useOperatorScore } from '@/lib/hooks/use-scores'
import { useTierState } from '@/lib/hooks/use-tier-state'

export function useProofState() {
  const tier = useTierState()
  const { data: scoreData } = useOperatorScore()
  const { operators, squads } = useLeaderboard()
  const { recentPulses } = useBossPulse()

  const score = tier.score
  const redLineProgress = Math.max(0, Math.min(100, Math.round((score / 70) * 100)))
  const eliteLineProgress = Math.max(0, Math.min(100, Math.round((score / 90) * 100)))

  const badges = [
    { label: 'Founding Operator', unlocked: true, body: 'You stepped in early and entered the arena before the room got crowded.' },
    { label: 'Seven-Day Chain', unlocked: tier.currentStreak >= 7, body: 'Seven straight pulse answers without hiding from the Boss.' },
    { label: 'PROVEN Standard', unlocked: tier.provenUnlocked, body: 'You crossed the 70+ line and earned access to a stronger room.' },
    { label: 'ELITE Candidate', unlocked: tier.eliteEligible, body: 'Score 90+ sustained across the kind of evidence the system takes seriously.' },
  ]

  return {
    tier,
    score,
    scoreData,
    redLineProgress,
    eliteLineProgress,
    operators,
    squads,
    recentPulses,
    badges,
  }
}
