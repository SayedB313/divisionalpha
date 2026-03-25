# Division Alpha — Project Context

## What Is This

Division Alpha is an AI-orchestrated peer accountability platform connected to **Oumafy** (Islamic-branded parent company). It's a premium members-only experience where driven operators hold each other accountable through structured 6-week sprints.

**Tagline energy:** "Declare or be declared upon." / "No Excuses. No Exceptions."

## Three Tiers

1. **Tier 1 — Community** ($10/mo): General access, community features, content
2. **Tier 2 — Sprint Access** ($49/mo or $20/mo Oumafy Premium): 6-week accountability sprints with squads of 6-8 people. Monday declarations, Wednesday G/Y/R check-ins, Friday reflections
3. **Tier 3 — The Operator Fund** ($297/mo + equity): Venture studio for top-performing operators. Build real businesses together. Musharakah-compliant (Islamic partnership structure)

## Tech Stack (Decided)

- **Frontend:** Next.js
- **Backend/DB/Auth/Realtime:** Supabase
- **AI Brain:** Claude API
- **Agent Runtime:** OpenClaw (open-source, formerly Clawdbot)
- **Payments:** Stripe
- **Hosting:** Vercel
- **No Discord** — custom app from day one

## 5 AI Agents

1. **Matchmaker** — Forms squads based on goals, personality, timezone, commitment level
2. **Facilitator** — Runs the weekly rhythm (prompts, reminders, check-in summaries)
3. **Coach** — Private 1-on-1 performance coaching, tailored to operator profile
4. **Guardian** — Monitors squad health, flags disengagement, triggers interventions
5. **Analytics** — Generates insights, operator scores, trends, squad comparisons

## Sprint Rhythm

- **Monday:** Declare weekly goals to squad
- **Wednesday:** Green / Yellow / Red check-in
- **Friday:** Reflection + sync call
- **Week 1:** Kickoff ceremony
- **Week 3:** Dip Intervention (AI detects mid-sprint slump)
- **Week 6:** Completion Ceremony + Continuation Vote (same squad or reshuffle)

## Operator Score (6 Factors)

- Goal Completion: 25%
- Attendance: 20%
- Squad Contribution: 20%
- Leadership: 15%
- Growth: 10%
- Communication: 10%

Score qualifies operators for Tier 3 invitation.

## Permission Model

- **Member view:** Own data + squad shared data
- **Captain view:** + squad health signals, nudge tools
- **Admin view:** Everything

## Design System
Always read `DESIGN.md` before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

**Direction:** Warm Editorial — private club meets personal journal
- **Fonts:** DM Sans (display + body) + DM Mono (data) + Instrument Serif (score reveal only)
- **Palette:** Sage green accent (#3d6b4a light / #5a9a6e dark) on warm cream/warm black
- **Layout:** Single-column (660px), day-contextual, no sidebar
- **Scale:** zoom: 1.3 (30% global increase)
- **Light mode primary**, dark mode secondary

### Design History

- v1: Sidebar layout, Bebas Neue — rejected ("very AI generic")
- v2: Grain overlay, militant voice — rejected ("doesn't inspire me")
- v3: Glassmorphism, Cormorant Garamond, floating nav — rejected ("still feels like AI slop")
- v4: Retro Art Deco terminal — rejected ("not the vibe")
- v5: First Warm Editorial attempt — approved direction but needed refinement
- v6: (skipped)
- **v7 (current):** Full interactive prototype — all screens, day-contextual, ceremonies, onboarding, coach DM

## Project Structure

```
divisionalpha/
├── CLAUDE.md                                 ← You are here
├── DESIGN.md                                 ← Locked design system (typography, color, spacing, layout, motion)
├── docs/
│   ├── Division_Alpha_Complete_UX_Flow.md    ← Every touchpoint from first click to third sprint
│   └── Oumafy_Tier3_Operator_Fund_Spec.docx ← Tier 3 Operator Fund full spec
├── mockups/
│   ├── Division_Alpha_App_v7.html            ← CURRENT: Full interactive prototype (approved)
│   ├── Division_Alpha_Landing.html           ← CURRENT: Public-facing landing page
│   ├── Division_Alpha_App_v5.html            ← Previous warm editorial attempt
│   ├── Division_Alpha_App_v4.html            ← Rejected: retro Art Deco terminal
│   ├── Division_Alpha_App_v3.html            ← Rejected: glassmorphism
│   ├── Division_Alpha_App_v2.html            ← Rejected: militant grain overlay
│   ├── Division_Alpha_App_v1.html            ← Rejected: generic sidebar layout
│   ├── division_alpha_mockup.html            ← Original design mockup
│   └── accountability_platform_mockup.html   ← Alternative design mockup
├── app/                                       ← Next.js production app (frontend)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                    ← Root layout: fonts, ThemeProvider, Topbar, MobileNav, ScoreOverlay
│   │   │   ├── page.tsx                      ← Single-route SPA: renders all page components
│   │   │   └── globals.css                   ← Full design system CSS variables (light/dark), zoom: 1.3
│   │   ├── lib/
│   │   │   └── navigation-context.tsx        ← Client-side SPA routing via React context (Page type union)
│   │   └── components/
│   │       ├── topbar.tsx                    ← Fixed top nav: logo (home link), desktop nav + overflow dropdown, score/theme/avatar buttons
│   │       ├── mobile-nav.tsx                ← Fixed bottom nav (mobile only): 5 primary items + "More" popup menu
│   │       ├── page-wrapper.tsx              ← Shared page container: 660px max-width, fadeUp animation
│   │       ├── score-overlay.tsx             ← Modal overlay: animated score count-up, Instrument Serif, factor bars
│   │       ├── theme-provider.tsx            ← Theme context: light/dark toggle via data-theme attribute
│   │       └── pages/
│   │           ├── home.tsx                  ← Day-contextual dashboard
│   │           ├── declare.tsx               ← Monday goal declaration
│   │           ├── checkin.tsx               ← Wednesday G/Y/R check-in
│   │           ├── reflect.tsx               ← Friday reflection
│   │           ├── squad.tsx                 ← Squad activity feed + health bar + chat CTA
│   │           ├── squad-chat.tsx            ← Real-time squad chat UI with simulated responses
│   │           ├── coach.tsx                 ← Private AI coach DM thread
│   │           ├── leaderboard.tsx           ← Squad + operator rankings with tabs
│   │           ├── kickoff.tsx               ← Sprint kickoff ceremony
│   │           ├── completion.tsx            ← Sprint completion ceremony
│   │           ├── apply.tsx                 ← 4-step onboarding flow
│   │           └── settings.tsx              ← Profile, preferences, notifications, account management
│   ├── package.json                          ← Next.js 16, React 19, Tailwind CSS v4, TypeScript
│   └── tailwind.config.ts
```

## Architecture Notes

- **SPA routing:** All pages render from a single Next.js route (`page.tsx`). Navigation is handled client-side via `navigation-context.tsx` — no file-based routing for pages.
- **Page type union:** Every new page must be added to the `Page` type in both `navigation-context.tsx` and `page-wrapper.tsx`, then rendered in `page.tsx`.
- **Desktop nav:** Primary items in topbar, overflow items (Kickoff, Completion, Apply) in `...` dropdown.
- **Mobile nav:** 5 primary items in bottom bar (Home, Declare, Signal, Reflect, Squad) + "More" popup menu for Coach, Leaderboard, ceremonies, Apply, Settings.
- **Profile avatar:** "AM" circle button in topbar (always visible) navigates to Settings page.
- **Fonts loaded via `next/font/google`** in `layout.tsx` — DM Sans, DM Mono, Instrument Serif.
- **CSS custom properties** for all colors/spacing in `globals.css` — supports light/dark themes.

## App Screens (Production)

1. **Home** — day-contextual (Mon=declare, Wed=check-in, Fri=reflect, Tue/Thu=execution, weekend=rest)
2. **Declare** — Monday goal declaration with blocker field
3. **Check-in** — Wednesday per-goal G/Y/R signals with context notes on yellow/red
4. **Reflect** — Friday reflection: wins, misses, learnings, carry-forward, peer appreciation
5. **Squad** — Activity feed (not roster grid), squad health bar, facilitator insights, chat CTA
6. **Squad Chat** — Real-time messaging UI with typing indicators and simulated responses
7. **Coach** — Private DM thread with AI coach, simulated responses
8. **Leaderboard** — Squad rankings (10 squads) + operator rankings (15 operators), tabbed view
9. **Score** — Hidden behind crest tap (overlay), animated score reveal, factor breakdown, Tier 3 whisper
10. **Kickoff** — Week 1 ceremony: meet squad, norms, "I'm in" commitment
11. **Completion** — Week 6 ceremony: stats, transformation reflection, gratitude, continuation vote
12. **Apply** — 4-step onboarding: identity, goals, accountability style, commitment
13. **Settings** — Profile (avatar, name, bio, timezone), preferences (theme, display options), notifications (toggles), account (plan, info, danger zone)

## Key Decisions

- Custom app from day one (no Discord)
- Islamic values integration (Tawakkul, Amal, Ikhlas) — subtle, not heavy-handed
- Revenue allocation: 70% → Tier 3 Project Fund, 20% → Operations, 10% → Profit
- Musharakah (Islamic partnership) for Tier 3 ventures — profit/loss sharing, no interest
- Design should feel like a **high-end members club** — not generic SaaS, not military bunker
- DM Sans is the primary font everywhere — user strongly prefers its readability
- Instrument Serif only for Operator Score number (one place in the entire app)
- Score hidden by default — revealed by deliberate crest tap (earned, not displayed)

## What's Next

- ~~Build the actual Next.js production app~~ — **DONE** (frontend complete, all 13 screens)
- Mobile responsiveness audit — topbar and mobile nav updated, full page QA pending
- Design review (`/design-review`) for spacing/contrast/consistency
- Full technical architecture document
- Supabase schema design + backend integration
- AI agent implementation with OpenClaw + Claude API
- Authentication flow (Supabase Auth)
- Real data integration (replace mock/simulated data)
