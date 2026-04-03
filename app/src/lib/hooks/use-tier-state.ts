'use client'

import { useApp } from '@/lib/app-context'
import { useOperatorScore } from '@/lib/hooks/use-scores'

export type TierKey = 'recruit' | 'qualified' | 'operator'

interface TierCardState {
  key: TierKey
  label: string
  threshold: number | null
  price: string
  status: 'current' | 'unlocked' | 'eligible' | 'locked'
  body: string
}

export function useTierState() {
  const { profile, squad } = useApp()
  const { data: scoreData } = useOperatorScore()

  const score = Math.round(Number(scoreData?.total_score ?? 0))
  const completedSprints = profile?.sprints_completed ?? 0
  const qualifiedUnlocked = Boolean(squad) || score >= 30
  const operatorEligible = score >= 70 && completedSprints >= 2
  const operatorUnlocked = profile?.tier === 3

  let activeTier: TierKey = 'recruit'
  if (operatorUnlocked) activeTier = 'operator'
  else if (qualifiedUnlocked) activeTier = 'qualified'

  const nextTier: TierKey | null = activeTier === 'recruit' ? 'qualified' : activeTier === 'qualified' ? 'operator' : null
  const nextThreshold = nextTier === 'qualified' ? 30 : nextTier === 'operator' ? 70 : null
  const gapToNext = nextThreshold !== null ? Math.max(0, nextThreshold - score) : 0

  const tiers: TierCardState[] = [
    {
      key: 'recruit',
      label: 'RECRUIT',
      threshold: null,
      price: '$9',
      status: activeTier === 'recruit' ? 'current' : 'unlocked',
      body: 'Boss-first proving ground. Daily pulse, score, streak, and the weekly rhythm work from user one.',
    },
    {
      key: 'qualified',
      label: 'QUALIFIED',
      threshold: 30,
      price: '$99',
      status: activeTier === 'qualified' ? 'current' : qualifiedUnlocked ? 'unlocked' : score >= 30 ? 'eligible' : 'locked',
      body: 'Earned squad access, leaderboard pressure, squad damage, and higher social consequence inside the same system.',
    },
    {
      key: 'operator',
      label: 'OPERATOR',
      threshold: 70,
      price: '$349',
      status: activeTier === 'operator' ? 'current' : operatorEligible ? 'eligible' : 'locked',
      body: 'Venture funding, elite network, tools, frameworks, and the rarest room in the system.',
    },
  ]

  return {
    score,
    activeTier,
    nextTier,
    nextThreshold,
    gapToNext,
    qualifiedUnlocked,
    operatorEligible,
    operatorUnlocked,
    completedSprints,
    currentStreak: Number(scoreData?.current_streak ?? 0),
    bestStreak: Number(scoreData?.best_streak ?? 0),
    tiers,
  }
}
