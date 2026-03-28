import { describe, it, expect, beforeEach, vi } from 'vitest'

// Inline the rate limiter logic for isolated testing
function makeRateLimiter(limit: number, windowMs: number) {
  const map = new Map<string, { count: number; resetAt: number }>()
  return function check(userId: string): boolean {
    const now = Date.now()
    const entry = map.get(userId)
    if (!entry || now > entry.resetAt) {
      map.set(userId, { count: 1, resetAt: now + windowMs })
      return true
    }
    if (entry.count >= limit) return false
    entry.count++
    return true
  }
}

describe('coach rate limiter', () => {
  let check: (userId: string) => boolean

  beforeEach(() => {
    check = makeRateLimiter(3, 60_000) // 3/min for testing
  })

  it('allows requests under the limit', () => {
    expect(check('user-1')).toBe(true)
    expect(check('user-1')).toBe(true)
    expect(check('user-1')).toBe(true)
  })

  it('blocks the request that exceeds the limit', () => {
    check('user-2')
    check('user-2')
    check('user-2')
    expect(check('user-2')).toBe(false)
  })

  it('does not affect other users', () => {
    check('user-3')
    check('user-3')
    check('user-3')
    check('user-3') // over limit for user-3
    expect(check('user-4')).toBe(true) // user-4 unaffected
  })

  it('resets after the window expires', () => {
    vi.useFakeTimers()
    const limitedCheck = makeRateLimiter(2, 1000)
    limitedCheck('user-5')
    limitedCheck('user-5')
    expect(limitedCheck('user-5')).toBe(false)

    vi.advanceTimersByTime(1001)
    expect(limitedCheck('user-5')).toBe(true) // reset
    vi.useRealTimers()
  })
})
