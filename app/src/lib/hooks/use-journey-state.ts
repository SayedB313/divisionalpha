'use client'

import { useApp } from '@/lib/app-context'
import { useDeclarations } from '@/lib/hooks/use-declarations'
import { useCheckins } from '@/lib/hooks/use-checkins'
import { useReflections } from '@/lib/hooks/use-reflections'
import { getSprintDay, getSprintPhase, getSprintProgress } from '@/lib/sprint-utils'

export function useJourneyState() {
  const { sprint } = useApp()
  const { declaration, submit: submitDeclaration } = useDeclarations()
  const { checkin, submit: submitCheckin } = useCheckins()
  const { reflection, submit: submitReflection } = useReflections()

  const day = getSprintDay(sprint?.start_date)
  const progress = getSprintProgress(day)
  const phase = getSprintPhase(day)

  const milestones = [
    { day: 1, title: 'Kickoff', body: 'Enter the arena and establish the rhythm.' },
    { day: 14, title: 'Proof', body: 'Two weeks in, the streak becomes visible proof.' },
    { day: 21, title: 'Dip intervention', body: 'The midpoint asks whether the standard survives fatigue.' },
    { day: 28, title: 'Recommit', body: 'The work is no longer exciting. That is the point.' },
    { day: 35, title: 'Close strong', body: 'The Boss turns the pressure up before the line closes.' },
    { day: 40, title: 'Completion', body: 'The score tells the truth about what room opens next.' },
  ].map((milestone) => ({
    ...milestone,
    status: day > milestone.day ? 'completed' : day === milestone.day ? 'current' : 'upcoming',
  }))

  return {
    sprint,
    day,
    progress,
    phase,
    milestones,
    declaration,
    checkin,
    reflection,
    submitDeclaration,
    submitCheckin,
    submitReflection,
  }
}
