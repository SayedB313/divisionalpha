export type BossPulseStatus = 'pending' | 'completed' | 'blocked' | 'missed'

export const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'] as const

export function getDateInTimeZone(timeZone: string, date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function getWeekdayInTimeZone(timeZone: string, date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
  }).format(date)
}

export function buildBossPrompt({
  firstName,
  sprintNumber,
  currentWeek,
  weekday,
  hasSquad,
}: {
  firstName: string
  sprintNumber: number
  currentWeek: number
  weekday: string
  hasSquad: boolean
}) {
  switch (weekday) {
    case 'Monday':
      return hasSquad
        ? `${firstName}, Sprint ${sprintNumber} Week ${currentWeek} is live. Did you start the week the way you said you would?`
        : `${firstName}, Sprint ${sprintNumber} Week ${currentWeek} is live. Did you start the week the way an operator should?`
    case 'Wednesday':
      return hasSquad
        ? `${firstName}, mid-week truth check. Are you moving the plan forward, blocked, or slipping? Your squad will feel the difference.`
        : `${firstName}, mid-week truth check. Are you moving the plan forward, blocked, or slipping? The Boss is keeping score.`
    case 'Friday':
      return `${firstName}, finish the week honestly. Did you show up today, hit resistance, or let the day get away from you?`
    case 'Saturday':
    case 'Sunday':
      return `${firstName}, keep the chain alive. Even on a lighter day, did you honor the standard or drift?`
    default:
      return `${firstName}, daily Boss pulse: did you move today, get blocked, or miss the standard?`
  }
}

export function describePulseStatus(status?: BossPulseStatus | null) {
  switch (status) {
    case 'completed':
      return 'Answered. The chain stays alive.'
    case 'blocked':
      return 'Blocked, but honest. The Boss counts that differently than hiding.'
    case 'missed':
      return 'Missed. The streak resets and the score absorbs it.'
    default:
      return 'No pulse submitted yet.'
  }
}

export function formatPulseStatus(status?: BossPulseStatus | null) {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'blocked':
      return 'Blocked'
    case 'missed':
      return 'Missed'
    default:
      return 'Pending'
  }
}
