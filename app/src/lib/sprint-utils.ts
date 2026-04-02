export function getSprintDay(startDate?: string | null, totalDays = 40) {
  if (!startDate) return 1

  const start = new Date(startDate)
  const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
  const now = new Date()
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const diffDays = Math.floor((nowUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1

  return Math.max(1, Math.min(totalDays, diffDays))
}

export function getSprintProgress(day: number, totalDays = 40) {
  return Math.max(0, Math.min(100, Math.round((day / totalDays) * 100)))
}

export function getSprintPhase(day: number) {
  if (day <= 7) {
    return {
      label: 'Establish the rhythm',
      body: 'The first week is about proving you will answer the Boss honestly and hold your line before the sprint asks anything heroic of you.',
    }
  }

  if (day <= 14) {
    return {
      label: 'Build visible proof',
      body: 'This is where the streak starts to matter. The system is watching for consistency, not a single dramatic day.',
    }
  }

  if (day <= 21) {
    return {
      label: 'The dip',
      body: 'Energy drops around the midpoint. Operators who stay honest through the dip are the ones who keep climbing.',
    }
  }

  if (day <= 31) {
    return {
      label: 'Consolidate',
      body: 'Momentum turns into proof when you can keep the standard after the novelty wears off.',
    }
  }

  if (day <= 39) {
    return {
      label: 'Close strong',
      body: 'The Boss is no longer asking whether you can start. It is asking whether you can finish with discipline.',
    }
  }

  return {
    label: 'Day 40',
    body: 'The sprint closes here. Your score tells the truth about what room opens next.',
  }
}
