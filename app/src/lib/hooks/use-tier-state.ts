'use client'

import { useApp } from '@/lib/app-context'
import { useOperatorScore } from '@/lib/hooks/use-scores'

export type TierKey = 'enter' | 'proven' | 'elite'

interface TierCardState {
  key: TierKey
  label: string
  threshold: number
  price: string
  status: 'current' | 'unlocked' | 'eligible' | 'locked'
  body: string
}

export function useTierState() {
  const { profile, squad } = useApp()
  const { data: scoreData } = useOperatorScore()

  const score = Math.round(Number(scoreData?.total_score ?? 0))
  const completedSprints = profile?.sprints_completed ?? 0
  const provenUnlocked = Boolean(squad) || score >= 70
  const eliteEligible = score >= 90 && completedSprints >= 2
  const eliteUnlocked = profile?.tier === 3

  let activeTier: TierKey = 'enter'
  if (eliteUnlocked) activeTier = 'elite'
  else if (provenUnlocked) activeTier = 'proven'

  const nextTier: TierKey | null = activeTier === 'enter' ? 'proven' : activeTier === 'proven' ? 'elite' : null
  const nextThreshold = nextTier === 'proven' ? 70 : nextTier === 'elite' ? 90 : null
  const gapToNext = nextThreshold !== null ? Math.max(0, nextThreshold - score) : 0

  const tiers: TierCardState[] = [
    {
      key: 'enter',
      label: 'ENTER',
      threshold: 30,
      price: '$19',
      status: activeTier === 'enter' ? 'current' : 'unlocked',
      body: 'Boss-first proving ground. Daily pulse, score, streak, and the weekly rhythm work from user one.',
    },
    {
      key: 'proven',
      label: 'PROVEN',
      threshold: 70,
      price: '$49',
      status: activeTier === 'proven' ? 'current' : provenUnlocked ? 'unlocked' : score >= 70 ? 'eligible' : 'locked',
      body: 'Earned squad access, leaderboard pressure, squad damage, and higher social consequence inside the same system.',
    },
    {
      key: 'elite',
      label: 'ELITE',
      threshold: 90,
      price: '$149',
      status: activeTier === 'elite' ? 'current' : eliteEligible ? 'eligible' : 'locked',
      body: 'Inner-circle build state, captain and council signals, venture readiness, and the rarest room in the system.',
    },
  ]

  return {
    score,
    activeTier,
    nextTier,
    nextThreshold,
    gapToNext,
    provenUnlocked,
    eliteEligible,
    eliteUnlocked,
    completedSprints,
    currentStreak: Number(scoreData?.current_streak ?? 0),
    bestStreak: Number(scoreData?.best_streak ?? 0),
    tiers,
  }
}
