import { describe, it, expect } from 'vitest'
import {
  mondayDeclarationReminder,
  wednesdayCheckinReminder,
  fridayReflectionReminder,
  squadNudge,
  lifeCheckDm,
  sprintKickoff,
  sprintCompletion,
} from '../lib/email'

describe('email templates', () => {
  describe('recipient wiring', () => {
    it('mondayDeclarationReminder sets correct recipient', () => {
      const email = mondayDeclarationReminder('test@example.com', 'Ali Hassan', 3, 4)
      expect(email.to).toBe('test@example.com')
    })

    it('wednesdayCheckinReminder sets correct recipient', () => {
      const email = wednesdayCheckinReminder('ops@test.io', 'Sara R.', 2, 4)
      expect(email.to).toBe('ops@test.io')
    })

    it('fridayReflectionReminder sets correct recipient', () => {
      const email = fridayReflectionReminder('reflect@test.io', 'Liam K.', 5, 4)
      expect(email.to).toBe('reflect@test.io')
    })

    it('squadNudge sets correct recipient', () => {
      const email = squadNudge('nudge@test.io', 'Noura A.', 'Iron Circuit', 'declare')
      expect(email.to).toBe('nudge@test.io')
    })

    it('lifeCheckDm sets correct recipient', () => {
      const email = lifeCheckDm('check@test.io', 'Amir M.')
      expect(email.to).toBe('check@test.io')
    })

    it('sprintKickoff sets correct recipient', () => {
      const email = sprintKickoff('kick@test.io', 'Priya K.', 4, 'Alpha Vanguard')
      expect(email.to).toBe('kick@test.io')
    })

    it('sprintCompletion sets correct recipient', () => {
      const email = sprintCompletion('done@test.io', 'Omar T.', 4, 87)
      expect(email.to).toBe('done@test.io')
    })
  })

  describe('required fields', () => {
    it('all templates return subject and html', () => {
      const templates = [
        mondayDeclarationReminder('a@b.com', 'Test User', 1, 4),
        wednesdayCheckinReminder('a@b.com', 'Test User', 1, 4),
        fridayReflectionReminder('a@b.com', 'Test User', 1, 4),
        squadNudge('a@b.com', 'Test User', 'Test Squad', 'check in'),
        lifeCheckDm('a@b.com', 'Test User'),
        sprintKickoff('a@b.com', 'Test User', 4, 'Test Squad'),
        sprintCompletion('a@b.com', 'Test User', 4, 75),
      ]
      for (const t of templates) {
        expect(t.subject).toBeTruthy()
        expect(t.html).toBeTruthy()
      }
    })
  })

  describe('XSS escaping', () => {
    it('escapes HTML special chars in user name', () => {
      const evil = '<script>alert(1)</script>'
      const email = mondayDeclarationReminder('a@b.com', evil, 1, 4)
      expect(email.html).not.toContain('<script>')
      expect(email.html).toContain('&lt;script&gt;')
    })

    it('escapes HTML in squad nudge action', () => {
      const evil = '"><img src=x onerror=alert(1)>'
      const email = squadNudge('a@b.com', 'Test', 'Squad', evil)
      // The raw <img tag must not appear — it should be encoded as &lt;img
      expect(email.html).not.toContain('<img')
      expect(email.html).toContain('&lt;img')
    })

    it('escapes HTML in squad name', () => {
      const evil = '<b>Hacked Squad</b>'
      const email = squadNudge('a@b.com', 'Test', evil, 'check in')
      expect(email.html).not.toContain('<b>')
      expect(email.html).toContain('&lt;b&gt;')
    })
  })

  describe('content correctness', () => {
    it('monday reminder includes week and sprint number', () => {
      const email = mondayDeclarationReminder('a@b.com', 'Ali', 3, 4)
      expect(email.html).toMatch(/Week 3|week 3/i)
    })

    it('sprint completion includes score', () => {
      const email = sprintCompletion('a@b.com', 'Ali', 4, 92)
      expect(email.html).toContain('92')
    })

    it('squad nudge includes squad name', () => {
      const email = squadNudge('a@b.com', 'Ali', 'Iron Circuit', 'declare')
      expect(email.html).toContain('Iron Circuit')
    })
  })
})
