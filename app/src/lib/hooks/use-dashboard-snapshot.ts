'use client'

import { useApp } from '@/lib/app-context'
import { useBossPulse } from '@/lib/hooks/use-boss-pulse'
import { useCoach } from '@/lib/hooks/use-coach'
import { useDeclarations } from '@/lib/hooks/use-declarations'
import { useCheckins } from '@/lib/hooks/use-checkins'
import { useReflections } from '@/lib/hooks/use-reflections'
import { useTierState } from '@/lib/hooks/use-tier-state'
import { getSprintDay, getSprintPhase, getSprintProgress } from '@/lib/sprint-utils'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function useDashboardSnapshot() {
  const { profile, sprint, squad } = useApp()
  const { pulse, recentPulses, submit } = useBossPulse()
  const { whisper } = useCoach()
  const { declaration } = useDeclarations()
  const { checkin } = useCheckins()
  const { reflection } = useReflections()
  const tier = useTierState()

  const now = new Date()
  const weekday = DAYS[now.getDay()]
  const sprintDay = getSprintDay(sprint?.start_date)
  const sprintProgress = getSprintProgress(sprintDay)
  const phase = getSprintPhase(sprintDay)
  const firstName = profile?.display_name?.split(' ')[0] || 'Operator'

  const ritualState = {
    declarationDone: Boolean(declaration),
    checkinDone: Boolean(checkin),
    reflectionDone: Boolean(reflection),
  }

  const nextRitual = weekday === 'Monday'
    ? ritualState.declarationDone ? 'Declaration logged. Protect the line.' : 'Declare the week before the Boss has to chase you.'
    : weekday === 'Wednesday'
      ? ritualState.checkinDone ? 'Signal captured. The week is telling on itself.' : 'Signal honestly. Green, yellow, or red.'
      : weekday === 'Friday'
        ? ritualState.reflectionDone ? 'Reflection submitted. Carry the lesson.' : 'Close the week with an honest reflection.'
        : 'Today is execution day. Quiet work still counts.'

  const unlockedModules = [
    {
      key: 'journey',
      title: 'Journey',
      body: 'See the 40-day arc, the weekly rituals, and the next ceremony or milestone.',
      state: 'open' as const,
    },
    {
      key: 'squad',
      title: 'Squad',
      body: tier.qualifiedUnlocked
        ? 'Your earned room, with health, pressure, activity, and live operator chat.'
        : 'Locked until 30+. The room gets stronger when it is earned.',
      state: tier.qualifiedUnlocked ? 'open' as const : 'locked' as const,
    },
    {
      key: 'proof',
      title: 'Proof',
      body: 'Score movement, red-line progress, unlock rules, badges, and the leaderboard.',
      state: 'open' as const,
    },
  ]

  return {
    firstName,
    sprint,
    squad,
    pulse,
    recentPulses,
    submitPulse: submit,
    coachWhisper: whisper?.content || null,
    tier,
    sprintDay,
    sprintProgress,
    phase,
    weekday,
    nextRitual,
    ritualState,
    unlockedModules,
  }
}
