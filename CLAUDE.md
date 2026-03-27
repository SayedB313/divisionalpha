# Division Alpha — Project Context

## What Is This

Division Alpha is an AI-orchestrated peer accountability platform connected to **Oumafy** (Islamic-branded parent company). It's a premium members-only experience where driven operators hold each other accountable through structured 6-week sprints.

**Tagline energy:** "Declare or be declared upon." / "No Excuses. No Exceptions."
**Domain:** divisionalpha.net
**Hosting:** Self-hosted server via Coolify (Docker + Traefik), domain on Cloudflare

## Three Tiers

1. **Tier 1 — Community** ($10/mo): General access, community features, content
2. **Tier 2 — Sprint Access** ($49/mo or $20/mo Oumafy Premium): 6-week accountability sprints with squads of 6-8 people. Monday declarations, Wednesday G/Y/R check-ins, Friday reflections
3. **Tier 3 — The Operator Fund** ($297/mo + equity): Venture studio for top-performing operators. Build real businesses together. Musharakah-compliant (Islamic partnership structure). **NOT YET BUILT — deferred until Tier 2 has 500+ members.**

## Tech Stack (Production)

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, TypeScript
- **Backend/DB/Auth/Realtime:** Supabase (Postgres, Auth with magic links, Realtime subscriptions, RLS)
- **AI Brain:** MiniMax 2.7 (all 5 agents) — chosen for cost efficiency
- **Agent Architecture:** Custom — Next.js API routes + Supabase Edge Functions (OpenClaw deferred)
- **Payments:** Stripe (live keys configured)
- **Email:** Brevo (transactional emails — sprint reminders, nudges, life checks. 300/day free)
- **Hosting:** Self-hosted server (Docker/Coolify + Traefik), domain on Cloudflare
- **No Discord** — custom app from day one

## 5 AI Agents (All Built)

1. **Matchmaker** (`/api/agents/matchmaker`) — Forms squads based on goals, personality, timezone, commitment level. Runs at sprint enrollment close.
2. **Facilitator** (`/api/agents/facilitator`) — Runs the weekly rhythm (Mon/Wed/Fri prompts, reminders, check-in summaries). Scheduled via cron.
3. **Coach** (`/api/coach`) — Private 1-on-1 performance coaching via MiniMax 2.7. Real AI responses, conversation history, operator context.
4. **Guardian** (`/api/agents/guardian`) — Monitors squad health every 6 hours. Flags disengagement, triggers Life Check DMs, Pause Protocol.
5. **Analytics** (`/api/agents/analytics`) — Generates Operator Scores (6-factor weighted), squad health metrics, trends.

### Agent Support Infrastructure

- **Event Bus** (`/api/agents/events`) — Inter-agent communication via `agent_events` table
- **Cron Dispatcher** (`/api/agents/cron`) — Scheduled trigger for Facilitator (Mon/Wed/Fri) + Guardian (6-hourly)
- **Ceremony Engine** (`/api/agents/ceremonies`) — Kickoff (Week 1), Dip Intervention (Week 3), Completion (Week 6)
- **Lifecycle Manager** (`/api/agents/lifecycle`) — Sprint state transitions (enrollment → active → completing → completed)
- **Admin Trigger** (`/api/admin/trigger`) — Manual agent invocation for testing
- **Admin Dashboard** (`/api/admin/dashboard`) — Platform metrics, squad health, agent activity

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

Score qualifies operators for Tier 3 invitation (top 5%, score ≥ ~85).

## Permission Model

- **Member view:** Own data + squad shared data
- **Captain view:** + squad health signals, nudge tools
- **Admin view:** Everything
- **RLS enforced** on all tables via Supabase policies (migration `011_rls_policies.sql`)

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
├── Dockerfile                                ← Standalone Docker build for self-hosting
├── docs/
│   ├── DIVISION_ALPHA_COMPLETE_REFERENCE.md  ← A-Z reference: every aspect of the product (1,023 lines, 30 sections)
│   ├── Division_Alpha_Complete_UX_Flow.md    ← Every touchpoint from first click to third sprint
│   ├── Oumafy_Tier3_Operator_Fund_Spec.docx ← Tier 3 Operator Fund full spec
│   ├── Division Alpha.rtf                    ← Original product vision doc
│   ├── Teir2 Stuff.rtf                       ← Tier 2 sprint mechanics detail
│   └── Instructions.rtf                      ← Build instructions and requirements
├── mockups/
│   ├── Division_Alpha_App_v7.html            ← CURRENT: Full interactive prototype (approved)
│   ├── Division_Alpha_Landing.html           ← CURRENT: Public-facing landing page
│   └── (v1-v5 archived — rejected iterations)
├── supabase/
│   └── migrations/                           ← 14 migration files
│       ├── 001_extensions.sql                ← uuid-ossp, pgvector, pg_cron
│       ├── 002_profiles.sql                  ← User profiles (extends Supabase auth)
│       ├── 003_applications.sql              ← Onboarding applications (4-step flow)
│       ├── 004_sprints_squads.sql            ← Sprints, squads, squad_members
│       ├── 005_sprint_rhythm.sql             ← Declarations, check-ins, reflections
│       ├── 006_messages.sql                  ← Squad messages, coach messages
│       ├── 007_scores_analytics.sql          ← Operator scores, score history
│       ├── 008_engagement_pauses.sql         ← Engagement tracking, pause protocol
│       ├── 009_agent_infrastructure.sql       ← Agent memory, agent events (event bus)
│       ├── 010_tier3_ventures.sql            ← Ventures, build squad roles, musharakah (deferred)
│       ├── 011_rls_policies.sql              ← Row Level Security for all tables
│       ├── 012_views.sql                     ← squad_activity, leaderboard views
│       ├── 013_notification_prefs.sql        ← Notification preferences per user
│       └── 014_fix_anon_applications.sql     ← Allow unauthenticated applications
├── app/                                       ← Next.js production app
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                    ← Root layout: fonts, AuthProvider, ThemeProvider, Topbar, MobileNav, ScoreOverlay
│   │   │   ├── page.tsx                      ← Single-route SPA: auth gating, renders all page components
│   │   │   ├── globals.css                   ← Full design system CSS variables (light/dark), zoom: 1.3
│   │   │   └── api/
│   │   │       ├── coach/route.ts            ← MiniMax 2.7 AI coach endpoint
│   │   │       ├── checkout/route.ts         ← Stripe checkout session creation
│   │   │       ├── webhooks/stripe/route.ts  ← Stripe webhook: payment → create user + profile
│   │   │       ├── admin/
│   │   │       │   ├── dashboard/route.ts    ← Admin metrics API
│   │   │       │   └── trigger/route.ts      ← Manual agent trigger
│   │   │       └── agents/
│   │   │           ├── matchmaker/route.ts   ← Squad formation algorithm
│   │   │           ├── facilitator/route.ts  ← Mon/Wed/Fri prompt generation
│   │   │           ├── guardian/route.ts     ← Health scan + Life Check DMs
│   │   │           ├── analytics/route.ts    ← Score calculation engine
│   │   │           ├── cron/route.ts         ← Scheduled dispatcher
│   │   │           ├── ceremonies/route.ts   ← Kickoff/Dip/Completion triggers
│   │   │           ├── lifecycle/route.ts    ← Sprint state transitions
│   │   │           └── events/route.ts       ← Inter-agent event bus
│   │   ├── lib/
│   │   │   ├── navigation-context.tsx        ← Client-side SPA routing via React context
│   │   │   ├── auth-context.tsx              ← Supabase Auth provider (session, user, login/logout)
│   │   │   ├── app-context.tsx               ← Global app state (wraps auth + query + theme)
│   │   │   ├── query-provider.tsx            ← React Query provider for data fetching
│   │   │   ├── minimax.ts                    ← MiniMax 2.7 API client
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts                 ← Browser Supabase client
│   │   │   │   ├── server.ts                 ← Server-side Supabase client
│   │   │   │   └── middleware.ts             ← Auth middleware (session refresh)
│   │   │   └── hooks/
│   │   │       ├── use-current-sprint.ts     ← Current sprint + squad data
│   │   │       ├── use-declarations.ts       ← Monday declarations CRUD
│   │   │       ├── use-checkins.ts           ← Wednesday check-ins CRUD
│   │   │       ├── use-reflections.ts        ← Friday reflections CRUD
│   │   │       ├── use-squad-chat.ts         ← Real-time squad messaging (Supabase Realtime)
│   │   │       ├── use-coach.ts              ← Coach messages + whisper
│   │   │       ├── use-scores.ts             ← Operator score + history
│   │   │       └── use-notifications.ts      ← Notification preferences + unread count
│   │   ├── middleware.ts                     ← Next.js middleware (auth session refresh)
│   │   └── components/
│   │       ├── topbar.tsx                    ← Fixed top nav: logo, desktop nav, overflow dropdown, theme toggle, score, avatar
│   │       ├── mobile-nav.tsx                ← Fixed bottom nav (mobile): 5 items + "More" popup
│   │       ├── page-wrapper.tsx              ← Shared page container: 660px max-width, fadeUp animation
│   │       ├── score-overlay.tsx             ← Modal overlay: animated score count-up, Instrument Serif, factor bars
│   │       ├── theme-provider.tsx            ← Theme context: light/dark toggle via data-theme attribute
│   │       └── pages/
│   │           ├── landing.tsx               ← Public landing page (Ogilvy-style copy)
│   │           ├── login.tsx                 ← Magic link login page
│   │           ├── home.tsx                  ← Day-contextual dashboard (wired to real data)
│   │           ├── declare.tsx               ← Monday goal declaration (wired to real data)
│   │           ├── checkin.tsx               ← Wednesday G/Y/R check-in (wired to real data)
│   │           ├── reflect.tsx               ← Friday reflection (wired to real data)
│   │           ├── squad.tsx                 ← Squad activity feed (wired to Supabase Realtime)
│   │           ├── squad-chat.tsx            ← Real-time squad chat (wired to Supabase Realtime)
│   │           ├── coach.tsx                 ← Private AI coach DM (wired to MiniMax 2.7)
│   │           ├── leaderboard.tsx           ← Squad + operator rankings (wired to real data)
│   │           ├── kickoff.tsx               ← Sprint kickoff ceremony
│   │           ├── completion.tsx            ← Sprint completion ceremony
│   │           ├── apply.tsx                 ← 4-step onboarding → Stripe checkout
│   │           ├── settings.tsx              ← Profile, preferences, notifications, account
│   │           └── admin.tsx                 ← Admin dashboard (metrics, squad health, agent logs)
│   ├── package.json
│   └── tailwind.config.ts
```

## Architecture Notes

- **SPA routing:** All pages render from a single Next.js route (`page.tsx`). Navigation is handled client-side via `navigation-context.tsx` — no file-based routing for pages.
- **Auth gating:** `page.tsx` checks auth state. Unauthenticated users see Landing or Login. Authenticated users see the dashboard.
- **Page type union:** Every new page must be added to the `Page` type in both `navigation-context.tsx` and `page-wrapper.tsx`, then rendered in `page.tsx`.
- **Desktop nav:** Primary items in topbar, overflow items (Kickoff, Completion, Apply) in `...` dropdown. Theme toggle (sun/moon) in topbar.
- **Mobile nav:** 5 primary items in bottom bar (Home, Declare, Signal, Reflect, Squad) + "More" popup menu for Coach, Leaderboard, ceremonies, Apply, Settings.
- **Profile avatar:** "AM" circle button in topbar (always visible) navigates to Settings page.
- **Fonts loaded via `next/font/google`** in `layout.tsx` — DM Sans, DM Mono, Instrument Serif.
- **CSS custom properties** for all colors/spacing in `globals.css` — supports light/dark themes.
- **Data hooks:** 7 custom hooks in `lib/hooks/` — all use Supabase client, return real data when authenticated, fall back to mock data when not.
- **Agent communication:** Agents emit events to `agent_events` table. Cron dispatcher triggers Facilitator and Guardian on schedule.

## App Screens (Production — 16 total)

### Public (3)
1. **Landing** — Ogilvy-style conversion page with apply CTA
2. **Login** — Magic link authentication
3. **Apply** — 4-step onboarding: identity, goals, accountability style, commitment → Stripe checkout

### Authenticated (12)
4. **Home** — day-contextual (Mon=declare, Wed=check-in, Fri=reflect, Tue/Thu=execution, weekend=rest)
5. **Declare** — Monday goal declaration with blocker field
6. **Check-in** — Wednesday per-goal G/Y/R signals with context notes on yellow/red
7. **Reflect** — Friday reflection: wins, misses, learnings, carry-forward, peer appreciation
8. **Squad** — Activity feed (real-time), squad health bar, facilitator insights, chat CTA
9. **Squad Chat** — Real-time messaging UI via Supabase Realtime
10. **Coach** — Private DM thread with MiniMax 2.7 AI coach
11. **Leaderboard** — Squad rankings + operator rankings, tabbed view
12. **Score** — Hidden behind crest tap (overlay), animated score reveal, factor breakdown, Tier 3 whisper
13. **Kickoff** — Week 1 ceremony: meet squad, norms, "I'm in" commitment
14. **Completion** — Week 6 ceremony: stats, transformation reflection, gratitude, continuation vote
15. **Settings** — Profile (avatar, name, bio, timezone), preferences (theme, display), notifications, account

### Admin (1)
16. **Admin Dashboard** — Platform metrics, active squads, agent activity, engagement stats

## Database (Supabase)

14 migrations, key tables:
- `profiles` — extends Supabase auth.users (name, bio, avatar, timezone, persona, tier, stripe IDs)
- `applications` — 4-step onboarding data
- `sprints` — 6-week sprint definitions (enrollment → active → completing → completed)
- `squads` — squad of 6-8 members per sprint
- `squad_members` — membership with role (member/captain)
- `declarations` — Monday goals
- `checkins` — Wednesday G/Y/R signals per goal
- `reflections` — Friday reflections
- `squad_messages` — real-time squad chat
- `coach_messages` — private AI coach conversation history
- `operator_scores` — 6-factor weighted scores per sprint
- `engagement_logs` — participation tracking for Guardian
- `agent_memory` — persistent agent context (key-value per agent per user)
- `agent_events` — inter-agent event bus
- `notification_preferences` — per-user notification settings

## API Routes (13)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/coach` | POST | MiniMax 2.7 AI coach conversation |
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/webhooks/stripe` | POST | Handle Stripe payment → create user |
| `/api/agents/matchmaker` | POST | Form squads from applicant pool |
| `/api/agents/facilitator` | POST | Generate Mon/Wed/Fri prompts |
| `/api/agents/guardian` | POST | Health scan, Life Check DMs |
| `/api/agents/analytics` | POST | Calculate operator scores |
| `/api/agents/cron` | POST | Scheduled dispatcher |
| `/api/agents/ceremonies` | POST | Kickoff/Dip/Completion triggers |
| `/api/agents/lifecycle` | POST | Sprint state transitions |
| `/api/agents/events` | POST | Inter-agent event bus |
| `/api/admin/dashboard` | GET | Platform metrics |
| `/api/admin/trigger` | POST | Manual agent invocation |
| `/api/email` | POST | Resend email notifications (reminders, nudges, life checks) |

## Key Decisions

- Custom app from day one (no Discord)
- Islamic values integration (Tawakkul, Amal, Ikhlas) — subtle, not heavy-handed
- Revenue allocation: 70% → Tier 3 Project Fund, 20% → Operations, 10% → Profit
- Musharakah (Islamic partnership) for Tier 3 ventures — profit/loss sharing, no interest
- Design should feel like a **high-end members club** — not generic SaaS, not military bunker
- DM Sans is the primary font everywhere — user strongly prefers its readability
- Instrument Serif only for Operator Score number (one place in the entire app)
- Score hidden by default — revealed by deliberate crest tap (earned, not displayed)
- MiniMax 2.7 for all AI agents — cost-effective, good quality
- OpenClaw deferred — will add later for Coach skill ecosystem and memory
- Self-hosted via Coolify (not Vercel) — full control, Docker + Traefik
- Tier 3 deferred — ship Tier 2 first, build Tier 3 once operator pool exists

## What's Next

- ~~Build the actual Next.js production app~~ — **DONE** (all 16 screens)
- ~~Supabase schema design + backend integration~~ — **DONE** (14 migrations, RLS, views)
- ~~AI agent implementation~~ — **DONE** (5 agents + event bus + cron + ceremonies + lifecycle)
- ~~Authentication flow~~ — **DONE** (Supabase Auth, magic links, auth context, middleware)
- ~~Wire frontend to real data~~ — **DONE** (7 hooks, Coach calls MiniMax, Squad Chat uses Realtime)
- ~~Stripe integration~~ — **DONE** (checkout + webhook, live keys)
- ~~Landing page~~ — **DONE** (Ogilvy-style copy)
- ~~Admin dashboard~~ — **DONE** (API + frontend)
- ~~Notification system~~ — **DONE** (unread count, badge in topbar)
- ~~Theme toggle~~ — **DONE** (light/dark in topbar)
- ~~Deploy to production server~~ — **DONE** (divisionalpha.net on Coolify, HTTP 200, Cloudflare CDN)
- ~~Email notifications~~ — **DONE** (Brevo: sprint reminders, squad nudges, life checks, ceremonies)
- Configure Supabase SMTP for magic link emails (use Resend SMTP or Supabase dashboard)
- Set up pg_cron for scheduled agent triggers
- Mobile responsiveness polish
- Create first real Sprint (Sprint 4) with real dates
