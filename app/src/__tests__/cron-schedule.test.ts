import { describe, it, expect } from 'vitest'

// Replicate the cron scheduling logic from /api/agents/cron/route.ts
function getScheduledActions(nowUtc: Date, tz: string) {
  const localNow = new Date(nowUtc.toLocaleString('en-US', { timeZone: tz }))
  const hour = localNow.getHours()
  const day = localNow.getDay() // 0=Sun, 1=Mon, ..., 6=Sat

  const actions: string[] = []

  if (day === 1 && hour >= 7 && hour < 10) actions.push('monday_declaration')
  if (day === 3 && hour >= 7 && hour < 10) actions.push('wednesday_checkin')
  if (day === 5 && hour >= 7 && hour < 10) actions.push('friday_reflection')

  return actions
}

describe('cron timezone scheduling', () => {
  // Monday 8am Eastern = Monday 13:00 UTC (EST, UTC-5)
  it('fires monday_declaration on Monday morning Eastern time', () => {
    const utcMonday8amEastern = new Date('2026-04-06T13:00:00Z') // Monday
    const actions = getScheduledActions(utcMonday8amEastern, 'America/Toronto')
    expect(actions).toContain('monday_declaration')
  })

  it('does not fire monday_declaration outside the window', () => {
    // April is EDT (UTC-4). 10:00 UTC = 6:00 EDT — before the 7-10am window
    const utcMonday6amEastern = new Date('2026-04-06T10:00:00Z')
    const actions = getScheduledActions(utcMonday6amEastern, 'America/Toronto')
    expect(actions).not.toContain('monday_declaration')
  })

  it('fires wednesday_checkin on Wednesday morning Eastern time', () => {
    const utcWed8am = new Date('2026-04-08T13:00:00Z') // Wednesday
    const actions = getScheduledActions(utcWed8am, 'America/Toronto')
    expect(actions).toContain('wednesday_checkin')
  })

  it('fires friday_reflection on Friday morning Eastern time', () => {
    const utcFri8am = new Date('2026-04-10T13:00:00Z') // Friday
    const actions = getScheduledActions(utcFri8am, 'America/Toronto')
    expect(actions).toContain('friday_reflection')
  })

  it('fires nothing on weekends', () => {
    const utcSatMorning = new Date('2026-04-11T13:00:00Z') // Saturday
    const actions = getScheduledActions(utcSatMorning, 'America/Toronto')
    expect(actions).toHaveLength(0)
  })

  it('UTC server time Monday morning does not incorrectly fire Eastern actions', () => {
    // If server is UTC and it's Monday 8am UTC = Sunday 11pm EST — should NOT fire
    const utcMonday8amUtc = new Date('2026-04-06T08:00:00Z')
    const actions = getScheduledActions(utcMonday8amUtc, 'America/Toronto')
    // 8am UTC = 4am EST (outside 7-10am window) → still fires if day check passes
    // 8am UTC on Monday = 4am Eastern (still Monday but outside window)
    expect(actions).not.toContain('monday_declaration')
  })
})
