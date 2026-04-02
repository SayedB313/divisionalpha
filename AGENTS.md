# Division Alpha — Project Context

## What Is This

Division Alpha is a 40-day proving ground for operators. The Boss (AI-powered, human-amplified, one unified system) measures your execution daily. Your score tells the truth. The best earn their squad. The elite build together. Connected to **Oumafy** (Islamic-branded parent company).

**Tagline energy:** "Step into the arena." / "The Boss is watching."
**Domain:** divisionalpha.net
**Hosting:** Self-hosted server via Coolify (Docker + Traefik), domain on Cloudflare
**Master Plan:** `docs/DIVISION-ALPHA-MASTER-PLAN-2026-04-01.md` (single source of truth for strategy)
**Contrarian Score:** v1=76 RED KILL → v3=65 ORANGE → v6=53 ORANGE (4 points from PROCEED)

## Current Model: Elite Proving Ground (v6 — Single Experience)

**Key insight:** The Boss IS the system. Human moments are embedded inside the Boss, NOT alongside it. Split hybrid coaching underperforms when the user experiences two separate systems. Division Alpha is one experience, one memory, one identity.

**Positioning:** Division Alpha is NOT a self-help tool. It's a proving ground. Public claim depends on ICP: broad entry = everyone gets a chance, operator-facing = earn your squad, elite-facing = "85% don't make it." Same doctrine, different emphasis.

## Current Status (2026-04-02)

- **Adaptive redesign implemented in repo:** the live shell is now `boss`, `journey`, `squad`, `coach`, `proof`, `settings`, `admin`
- **Desktop editorial rail shipped:** authenticated desktop now uses a collapsed left rail with hover/focus flyout while public pages stay top-aligned and mobile keeps the bottom-nav model
- **Public funnel updated:** landing, apply, login, and checkout all reinforce `ENTER first, PROVEN earned later`
- **Public shell QA fix shipped:** `page.tsx` no longer waits on auth resolution before rendering `landing`, `login`, or `apply`, so the public app does not flash a blank loading shell first
- **Boss loop built:** `/api/agents/boss`, `/api/boss/pulse`, streak/score orchestration, daily pulse UI, and Boss-triggered admin controls are all in the codebase
- **Admin updated:** business logic now reflects `ENTER $19 / PROVEN $49 / ELITE $149` and `30 / 70 / 90`
- **Correctness fixes shipped:** coach duplicate insert fixed, cron installer now matches GET cron route, stale 6-week / Operator Fund copy removed from active surfaces
- **Verification status:** public desktop/mobile browser QA completed, authenticated shell smoke coverage added via tests, `npm test` passes `30/30`, and `npm run build` passes
- **Important live follow-up:** Supabase migrations `016_allow_enter_without_squad.sql` and `017_daily_boss_loop.sql` still need to be applied before the Boss-first model works in production

## Three Tiers (Earned Progression)

1. **ENTER ($19/mo):** AI Boss daily check-ins, 5-min micro-sessions (Mon-Fri), streak counter, real-time Operator Score (65% passive), cohort feed, Boss-orchestrated weekly call + monthly 1:1 + Guardian escalation. 40-day proving ground. Works from user #1.
2. **PROVEN ($49/mo):** Requires Score 70+ after completing a 40-day sprint. Squad access (4-5 proven operators), leaderboard, badges, squad damage mechanic, Boss-orchestrated weekly squad sessions, bi-weekly 1:1 coaching.
3. **ELITE ($149/mo + equity):** Top 5% across 2+ sprints. Venture formation, Musharakah-compliant funding, mastermind calls, advisory. 10-20 max. **NOT YET BUILT — deferred until PROVEN validates.**

## Tech Stack (Production)

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, TypeScript
- **Backend/DB/Auth/Realtime:** Supabase (Postgres, Auth with magic links, Realtime subscriptions, RLS)
- **AI Brain:** MiniMax 2.7 (all 5 agents) — chosen for cost efficiency
- **Agent Architecture:** Custom — Next.js API routes + Supabase Edge Functions (OpenClaw deferred)
- **Payments:** Stripe (live keys configured)
- **Email:** Brevo (transactional emails — sprint reminders, nudges, life checks. 300/day free)
- **Hosting:** Self-hosted server (Docker/Coolify + Traefik), domain on Cloudflare
- **No Discord** — custom app from day one

## 6 System Agents (Built in Repo)

1. **Boss** (`/api/agents/boss`) — Dispatches daily Boss pulses, sends nudges, reconciles missed pulses, and drives the ENTER-first loop.
2. **Matchmaker** (`/api/agents/matchmaker`) — Forms squads based on goals, personality, timezone, commitment level. Runs at sprint enrollment close.
3. **Facilitator** (`/api/agents/facilitator`) — Runs the weekly rhythm (Mon/Wed/Fri prompts, reminders, summaries). Scheduled via cron.
4. **Coach** (`/api/coach`) — Private 1-on-1 performance coaching via MiniMax 2.7 with full operator context and conversation history.
5. **Guardian** (`/api/agents/guardian`) — Monitors operator/squad health every 6 hours. Flags disengagement, triggers Life Check DMs, Pause Protocol.
6. **Analytics** (`/api/agents/analytics`) — Generates Operator Scores, streak-aware score state, squad health metrics, and trends.

### Agent Support Infrastructure

- **Event Bus** (`/api/agents/events`) — Inter-agent communication via `agent_events` table
- **Cron Dispatcher** (`/api/agents/cron`) — Scheduled trigger for Boss (daily), Facilitator (Mon/Wed/Fri), Guardian (6-hourly), and Lifecycle (daily)
- **Boss Pulse API** (`/api/boss/pulse`) — User pulse submission, score delta, streak updates
- **Ceremony Engine** (`/api/agents/ceremonies`) — Journey ceremonies: squad reveal, kickoff, dip intervention, completion
- **Lifecycle Manager** (`/api/agents/lifecycle`) — Sprint state transitions (enrollment → active → completing → completed)
- **Admin Trigger** (`/api/admin/trigger`) — Manual agent invocation for testing
- **Admin Dashboard** (`/api/admin/dashboard`) — Pricing/tier metrics, Boss pulse metrics, funnel metrics, squad health, agent activity

## Sprint Rhythm

- **Daily:** Boss pulse, streak update, score movement
- **Monday:** Declare weekly goals
- **Wednesday:** Green / Yellow / Red signal
- **Friday:** Reflection + operator session
- **Early sprint:** Kickoff ceremony
- **Midpoint:** Dip intervention
- **Day 40 close:** Completion ceremony + continuation / unlock decision

Internal scheduling still tracks week-based rituals in the DB, but the lived product is a 40-day Boss-led arc rather than a collection of separate pages.

## Operator Score (Daily, Passive-First)

Score updates DAILY (not sprint-end). ~65% passive or AI-inferred, ~35% active input.

- Consistency (passive): 40% — streak, reply speed, check-in frequency
- Goal Progress: 25% — G/Y/R signal patterns (Wed only)
- Engagement Quality (passive): 15% — response depth, session completion
- Community (passive): 10% — kudos, feed interactions, call attendance
- Growth (minimal report): 10% — Fri reflection, carry-forward goals

Score 70+ qualifies for PROVEN invitation. Top performers at 90+ across 2+ sprints qualify for ELITE consideration.

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
- **Layout:** editorial rail on authenticated desktop, public top header, mobile bottom nav, and page-specific editorial/two-column/three-column canvases
- **Scale:** zoom: 1.3 (30% global increase)
- **Light mode primary**, dark mode secondary

### Design History

- v1: Sidebar layout, Bebas Neue — rejected ("very AI generic")
- v2: Grain overlay, militant voice — rejected ("doesn't inspire me")
- v3: Glassmorphism, Cormorant Garamond, floating nav — rejected ("still feels like AI slop")
- v4: Retro Art Deco terminal — rejected ("not the vibe")
- v5: First Warm Editorial attempt — approved direction but needed refinement
- v6: (skipped)
- **v7:** Full interactive prototype — day-contextual, ceremonies, onboarding, coach DM
- **v8:** Adaptive Boss-led redesign — Boss Home, Journey, Squad, Coach, Proof, rebuilt admin, earned progression states
- **v9 (current repo shell):** Editorial desktop rail, shell-aware page widths, and wider desktop layouts for Boss/Journey/Squad/Proof/Settings/Admin

## Project Structure

```
divisionalpha/
├── AGENTS.md                                 ← You are here
├── DESIGN.md                                 ← Locked design system (typography, color, spacing, layout, motion)
├── CLAUDE.md                                 ← Shared repo-memory file with the same project context
├── scripts/
│   └── setup-cron.sh                         ← Cron setup for Coolify server (every 3h agent dispatch)
├── docs/
│   ├── DIVISION-ALPHA-MASTER-PLAN-2026-04-01.md ← **v6 Master Plan (single source of truth)**
│   ├── CONTRARIAN-V7-RESPONSE-MATRIX-2026-04-01.md ← Working defense board: objection → answer → proof type
│   ├── MARKET-INTELLIGENCE.md                ← GTM and cold outreach research
│   └── ... legacy reference docs / earlier pivots
├── mockups/
│   ├── Division_Alpha_App_v7.html            ← Approved interactive prototype reference
│   ├── Division_Alpha_Landing.html           ← Public landing direction reference
│   └── (v1-v5 archived — rejected iterations)
├── supabase/
│   └── migrations/                           ← 17 migration files
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
│       ├── 014_fix_anon_applications.sql     ← Allow unauthenticated applications
│       ├── 015_add_referral_source.sql       ← Referral tracking column on applications
│       ├── 016_allow_enter_without_squad.sql ← ENTER works before squad assignment
│       └── 017_daily_boss_loop.sql           ← Daily Boss pulses, streak state, score metadata
├── app/                                       ← Next.js production app
│   ├── src/
│   │   ├── __tests__/
│   │   │   ├── page-gating.test.tsx         ← Regression coverage for public-page auth gating and immediate rendering
│   │   │   └── shell-chrome.test.tsx        ← Shell smoke tests for public header, desktop rail, and mobile nav
│   │   ├── app/
│   │   │   ├── layout.tsx                    ← Root layout: fonts/providers; AppFrame mounts shell chrome
│   │   │   ├── page.tsx                      ← Single-route SPA: auth gating, renders adaptive shell pages
│   │   │   ├── globals.css                   ← Full design system CSS variables (light/dark), zoom: 1.3
│   │   │   └── api/
│   │   │       ├── boss/pulse/route.ts       ← User pulse submission API
│   │   │       ├── coach/route.ts            ← MiniMax 2.7 AI coach endpoint
│   │   │       ├── checkout/route.ts         ← Stripe checkout session creation
│   │   │       ├── email/route.ts            ← Brevo email notifications (reminders, nudges, ceremonies)
│   │   │       ├── webhooks/stripe/route.ts  ← Stripe webhook: payment → create user + profile
│   │   │       ├── admin/
│   │   │       │   ├── dashboard/route.ts    ← Admin metrics API
│   │   │       │   └── trigger/route.ts      ← Manual agent trigger
│   │   │       └── agents/
│   │   │           ├── boss/route.ts         ← Daily Boss dispatch + nudge orchestrator
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
│   │   │   ├── email.ts                      ← Brevo email client + 7 templates
│   │   │   ├── boss-loop.ts                  ← Boss prompt, timezone, pulse status helpers
│   │   │   ├── operator-score.ts             ← Shared score recalculation logic
│   │   │   ├── sprint-utils.ts               ← 40-day sprint day/progress/phase helpers
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts                 ← Browser Supabase client
│   │   │   │   ├── server.ts                 ← Server-side Supabase client
│   │   │   │   └── middleware.ts             ← Auth middleware (session refresh)
│   │   │   └── hooks/
│   │   │       ├── use-boss-pulse.ts         ← Daily pulse fetch + submit
│   │   │       ├── use-dashboard-snapshot.ts ← Boss Home read model
│   │   │       ├── use-journey-state.ts      ← Journey page read model
│   │   │       ├── use-proof-state.ts        ← Proof page read model
│   │   │       ├── use-squad-state.ts        ← Squad page read model
│   │   │       ├── use-tier-state.ts         ← ENTER/PROVEN/ELITE state model
│   │   │       ├── use-declarations.ts       ← Monday declarations CRUD
│   │   │       ├── use-checkins.ts           ← Wednesday check-ins CRUD
│   │   │       ├── use-reflections.ts        ← Friday reflections CRUD
│   │   │       ├── use-squad-chat.ts         ← Real-time squad messaging (Supabase Realtime)
│   │   │       ├── use-coach.ts              ← Coach messages + whisper
│   │   │       ├── use-scores.ts             ← Operator score + history
│   │   │       └── use-notifications.ts      ← Notification preferences + unread count
│   │   ├── middleware.ts                     ← Next.js middleware (auth session refresh)
│   │   └── components/
│   │       ├── app-frame.tsx                 ← Shell frame: public header vs member rail, main offsets, mobile nav, score overlay
│   │       ├── topbar.tsx                    ← Public header + authenticated desktop rail + authenticated mobile header
│   │       ├── mobile-nav.tsx                ← Adaptive mobile nav mirroring the same IA
│   │       ├── page-wrapper.tsx              ← Shared page container with editorial/two/three-column width variants
│   │       ├── score-overlay.tsx             ← Score reveal + quick proof summary
│   │       ├── theme-provider.tsx            ← Theme context: light/dark toggle via data-theme attribute
│   │       └── pages/
│   │           ├── landing.tsx               ← Public landing page (Ogilvy-style copy)
│   │           ├── login.tsx                 ← Magic link login page
│   │           ├── boss.tsx                  ← Boss Home
│   │           ├── journey.tsx               ← Journey page with declaration / signal / reflection modules
│   │           ├── squad.tsx                 ← Locked preview in ENTER, live squad hub in PROVEN
│   │           ├── coach.tsx                 ← Unified Boss-side private thread
│   │           ├── proof.tsx                 ← Score, thresholds, badges, leaderboard
│   │           ├── apply.tsx                 ← 4-step onboarding → Stripe checkout
│   │           ├── settings.tsx              ← Profile, preferences, notifications, account
│   │           └── admin.tsx                 ← Admin dashboard (metrics, squad health, agent logs)
│   │           └── ... legacy pages retained as implementation details / fallback references
│   ├── package.json
│   └── tailwind.config.ts
```

## Architecture Notes

- **SPA routing:** All pages render from a single Next.js route (`page.tsx`). Navigation is handled client-side via `navigation-context.tsx` — no file-based routing for pages.
- **Auth gating:** `page.tsx` checks auth state. Public pages render immediately without waiting on auth resolution; authenticated users land in `boss`.
- **Page type union:** Every new page must be added to the `Page` type in both `navigation-context.tsx` and `page-wrapper.tsx`, then rendered in `page.tsx`.
- **Adaptive shell:** primary member IA is `boss`, `journey`, `squad`, `coach`, `proof`, `settings`, `admin`.
- **Legacy page map:** old pages like `home`, `declare`, `checkin`, `reflect`, `leaderboard`, `kickoff`, `completion`, and `squad-chat` now map into the new shell instead of being primary destinations.
- **Desktop nav:** collapsed left editorial rail with `Boss / Journey / Squad / Coach / Proof`, secondary `Settings / Admin`, and embedded utilities for score, notifications, theme, and account.
- **Mobile nav:** `Boss / Journey / Squad / Proof` + `More` (`Coach`, `Settings`, `Admin`, `Sign Out`).
- **Public shell:** public pages keep the fixed top editorial header rather than inheriting the member rail.
- **Page wrapper variants:** member pages can now opt into `editorial`, `two_column`, `three_column`, and `wide` canvases while preserving the same design language.
- **Fonts loaded via `next/font/google`** in `layout.tsx` — DM Sans, DM Mono, Instrument Serif.
- **CSS custom properties** for all colors/spacing in `globals.css` — supports light/dark themes.
- **Adaptive read models:** `useTierState`, `useDashboardSnapshot`, `useJourneyState`, `useSquadState`, and `useProofState` compose the Boss-first experience from existing tables.
- **Agent communication:** Agents emit events to `agent_events` table. Cron dispatcher triggers Boss, Facilitator, Guardian, and Lifecycle on schedule.

## App Screens (Adaptive Shell)

### Public (3)
1. **Landing** — Ogilvy-style conversion page with apply CTA
2. **Login** — Magic link authentication
3. **Apply** — 4-step onboarding: identity, goals, accountability style, commitment → Stripe checkout

### Authenticated (6 + admin)
4. **Boss** — Boss Home: daily pulse, today’s command, score/streak/progression strip, next ritual, unlock previews, coach whisper
5. **Journey** — 40-day arc, milestone timeline, and embedded declaration / signal / reflection modules
6. **Squad** — Locked preview in ENTER, live squad hub and thread in PROVEN
7. **Coach** — Unified Boss-side private thread with real MiniMax responses
8. **Proof** — Score, red-line / elite-line progress, badges, operator leaderboard, squad leaderboard
9. **Settings** — Profile, preferences, notifications, account

### Admin (1)
10. **Admin Dashboard** — Pricing/tier metrics, Boss pulse metrics, funnel metrics, squad health, and manual agent controls

Legacy pages still exist in the codebase as implementation details or historical references, but they are not the product’s primary IA anymore.

## Database (Supabase)

17 migrations, key tables:
- `profiles` — extends `auth.users` (identity, persona, tier, subscription, role)
- `applications` — 4-step onboarding + referral + checkout capture
- `sprints` — 40-day sprint definitions (~6 calendar weeks of scheduling)
- `squads` / `squad_members` — earned rooms for PROVEN operators
- `declarations` / `checkins` / `reflections` — weekly rhythm tables; `squad_id` can now be null so ENTER works before squad assignment
- `squad_messages` — real-time room thread
- `coach_messages` — private Boss/coach conversation history
- `operator_scores` — sprint score + streak metadata (`current_streak`, `best_streak`, `last_pulse_*`)
- `boss_pulses` — daily Boss pulse lifecycle, nudge state, score delta, streak-after snapshot
- `engagement_events` / `pauses` — Guardian and pause protocol state
- `agent_memory` / `agent_events` — inter-agent memory and event bus
- `notification_preferences` / `notifications` — user notification settings and in-app notifications

## API Routes (17)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/boss/pulse` | POST | Submit daily Boss pulse and update streak / score |
| `/api/coach` | POST | MiniMax 2.7 AI coach conversation (rate-limited: 20/hr/user) |
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/webhooks/stripe` | POST | Handle Stripe payment → create user → send welcome email with magic link |
| `/api/agents/boss` | POST | Dispatch daily Boss pulses and nudges |
| `/api/agents/matchmaker` | POST | Form squads from applicant pool |
| `/api/agents/facilitator` | POST | Generate Mon/Wed/Fri prompts (MiniMax fallback included) |
| `/api/agents/guardian` | POST | Health scan, Life Check DMs (MiniMax fallback included) |
| `/api/agents/analytics` | POST | Calculate operator scores |
| `/api/agents/cron` | GET | Scheduled dispatcher — auth via `Authorization: Bearer $CRON_SECRET` |
| `/api/agents/ceremonies` | POST | Kickoff/Dip/Completion triggers |
| `/api/agents/lifecycle` | POST | Sprint state transitions (also called daily via cron) |
| `/api/agents/events` | POST | Inter-agent event bus |
| `/api/admin/dashboard` | GET | Platform metrics |
| `/api/admin/trigger` | POST | Manual agent invocation |
| `/api/email` | POST | Brevo email notifications (reminders, nudges, life checks) |
| `/api/health` | GET | Health check — app + DB + env vars (used by uptime monitor) |

## Key Decisions

- Custom app from day one (no Discord)
- **v6 Single Experience Model (2026-04-01):** Boss IS the system. Human moments embedded inside (weekly call, monthly 1:1, Guardian escalation). Split hybrid fails when AI and humans feel separate. Division Alpha is one experience.
- **Adaptive shell shipped in repo (2026-04-01):** Boss Home, Journey, Squad, Coach, Proof, Settings, Admin replaced the old Home/Declare/Check-in/Reflect/Leaderboard primary IA.
- **Elite Proving Ground positioning:** Division Alpha is a proving ground, not a self-help tool. Public claim changes by ICP: everyone gets a chance, earn your squad, 85% don't make it.
- **Earned progression:** ENTER 30+ → PROVEN 70+ → ELITE 90+. Behavior gates, not price gates.
- **ENTER works from user #1 in code:** weekly rhythm no longer requires immediate squad assignment; Boss-first progression comes before squad assignment.
- **Daily Boss loop exists in code:** pulse dispatch, pulse submission, streak state, score updates, and Boss-triggered nudges are implemented, but require DB migration apply before production use.
- **6-layer retention engine:** Daily pulse (variable rewards), 5-min micro-sessions, streak system, passive-first scoring (65% automatic), cohort feed (default-on), Boss personality (context-aware, escalating, references human interactions).
- **Pivot history:** v1 generic pods (76 KILL) → v2 Muslim pivot (CONDITIONAL GO) → v3 elite proving ground (65 RETHINK) → v6 single experience model (53 RETHINK). All in under 1 week.
- Brand stays universal, marketing targets Muslim founders
- Islamic values integration (Tawakkul, Amal, Ikhlas) — subtle, not heavy-handed
- Musharakah (Islamic partnership) for ELITE tier ventures — profit/loss sharing, no interest
- Design should feel like a **high-end members club** — not generic SaaS, not military bunker
- DM Sans is the primary font everywhere — user strongly prefers its readability
- Instrument Serif only for Operator Score number (one place in the entire app)
- MiniMax 2.7 for all AI agents — cost-effective, good quality
- Self-hosted via Coolify (not Vercel) — full control, Docker + Traefik
- ELITE deferred — ship ENTER first, build PROVEN once Sprint 4 validates, build ELITE once PROVEN has 500+ members
- **No financial stakes** (Beeminder-style deposits rejected by founder — doesn't fit brand)
- **Captain pipeline:** PROVEN operators at 90+ score → facilitate for free PROVEN + ELITE pathway. Exact mechanics deferred until real data.

## Server Infrastructure

- **Auto-deploy:** Polling-based via `/opt/coolify-autodeploy.sh` (root cron, every 2 min). Polls GitHub → triggers Coolify restart on SHA change.
- **Agent cron:** `/etc/cron.d/divisionalpha` — every 3 hours, sends `Authorization: Bearer $CRON_SECRET` to `/api/agents/cron`
- **Lifecycle cron:** Called daily at midnight via agent cron dispatcher — handles sprint state transitions
- **Health monitor:** `/opt/da-health-monitor.sh` via `/etc/cron.d/da-health-monitor` — checks `/api/health` every 5 min, Brevo alert to `sbw919@gmail.com` after 3 consecutive failures
- **Backup:** `/etc/cron.d/da-backup` — weekly pg_dump every Sunday 2am UTC → `/var/backups/divisionalpha/`
- **Log files:** `/var/log/divisionalpha-cron.log`, `/var/log/da-health-monitor.log`, `/var/log/da-backup.log`
- **CRON_SECRET:** Set in `/data/coolify/applications/jkcc8gsg88okkgcscg48g00g/.env` — required by cron endpoint

## Sprint 4 Timeline

- **March 30, 2026:** Lifecycle cron → Sprint 4 `upcoming → handshake` (enrollment window)
- **April 4-5:** Run matchmaker manually via admin trigger after applications close
- **April 6, 2026:** Lifecycle cron → Sprint 4 `handshake → active, Week 1` → kickoff ceremony fires automatically
- **Weekly:** Mon/Wed/Fri facilitator prompts + emails; Guardian scans every 6h on weekdays
- **Week 3:** Dip intervention ceremony triggers automatically
- **Day 40 close:** Completion ceremony, operator scores calculated, continuation / unlock decisions

## What's Next

- Apply Supabase migrations `016_allow_enter_without_squad.sql` and `017_daily_boss_loop.sql`
- Run a true signed-in browser QA across `boss`, `journey`, `squad`, `coach`, `proof`, `settings`, and `admin` once a Supabase test member session is available
- Smoke-test the live Boss loop end-to-end:
  - dispatch `/api/agents/boss` with `dispatch_daily_pulse`
  - answer the pulse in-app
  - verify streak + score movement
  - verify email/notification behavior
- Push/deploy the redesign once the migration-backed smoke test passes
- Start outreach once the live product and funnel are verified
- Run matchmaker only after real PROVEN qualifiers exist or once the first earned-squad cohort is intentionally formed
- Keep ELITE deferred until PROVEN validates with real users
- Keep captain pipeline deferred until real 90+ PROVEN operators emerge

## Go-To-Market Strategy (Updated April 1, 2026)

### Competitive Position

Division Alpha combines what no competitor does: **low entry ($19) + behavior filtering + single-experience Boss system + earned squad progression.**

Key competitors: Focusmate ($10/mo, 50K+), Commit Action ($199/mo, 8K+), Boss as a Service ($25/mo), Shelpful ($35-65/mo, AI+human hybrid).

**Division Alpha's moats:**
1. Single-experience Boss system (Boss IS the system, human moments embedded) — nobody else
2. Earned progression (ENTER → PROVEN → ELITE) — behavior gates, not price gates
3. Proactive, not passive (Boss comes to YOU via email/SMS, not another dashboard)
4. Speed (concept → production in ~2 weeks, 6 strategic iterations in <1 week)
5. Islamic framing for Muslim founder niche (real but limits TAM)

### Target Audiences (Cold Email — Ranked)

**Tier 1 — Primary campaigns:**
1. **Solopreneurs ($100K+):** ~6M addressable in US. Pain: 9/10 (isolation, zero structure). Already spend $100-500/mo on tools. Source: Apollo.io (company size=1, revenue $100K+).
2. **Real Estate Agents:** 3M licensed in US. Pain: 8/10 (73% hire coaches FOR accountability). Already pay $400+/mo for coaching. Source: state licensing boards, Realtor.com, NAR directories.

**Tier 2 — Secondary campaigns:**
3. **SDRs/Sales Reps:** ~800K in US. Pain: 9/10 (75% burnout, 15-month avg tenure). They live in email — highest cold email receptiveness. Source: Apollo.io, LinkedIn Sales Navigator.

**Tier 3 — Ads/community (not cold email):**
4. Remote workers (32.6M but B2C lean), Content creators (high pain but low income), Freelancers (personal emails, anti-cold-outreach).

### Distribution Channels

1. **Cold email (free, immediate):** 90 warmed inboxes, 1,000 sends/day capacity. Conservative projection: 30K sends/month → 150-300 replies → 15-60 paying members ($735-2,940/mo).
2. **Paid ads (parallel):** Google Ads ("accountability partner," "accountability group"), Facebook/Instagram (interest targeting: entrepreneurship, productivity, solopreneur).
3. **Muslim Take podcast (long-term):** Audience building → Division Alpha funnel. Organic, compounding.
4. **Reddit/community (organic):** r/AccountabilityPartners (50K), r/GetMotivatedBuddies (200K), r/Entrepreneur (2M), r/getdisciplined (900K).

### Cold Email Playbook

Position as **professional performance tool**, NOT personal self-help. This keeps it B2B where reply rates are 4-5% vs 0.8% B2C.

**Benchmarks:** Avg B2B reply rate 4%, good is 6%+. Thursday sends get 6.87% reply rate. Under 80 words optimal. 42% of replies come from follow-ups.

**Campaign 1 — Solopreneurs:**
- Subject: "Quick question about working solo"
- Angle: "You built a profitable solo business. But who makes sure you actually do the hard things on Tuesday when nobody's watching?"

**Campaign 2 — RE Agents:**
- Subject: "What your broker doesn't provide"
- Angle: "Most agents pay $400+/mo for a coach whose main value is accountability. Division Alpha starts at $19/mo, with the stronger room earned through proof."

**Campaign 3 — SDRs:**
- Subject: "The 15-month wall"
- Angle: "75% of SDRs burn out within 15 months. The ones who make AE have a system."

### Full Market Intelligence

See Obsidian: `/Users/cool/Obsidian-OP3/03-Projects/Division Alpha/Market Intelligence Report.md`
(21 competitors mapped, 7 audiences ranked, cold email math, community/forum research, price sensitivity data)
