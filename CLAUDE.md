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
├── scripts/
│   └── setup-cron.sh                         ← Cron setup for Coolify server (every 3h agent dispatch)
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
│   │   │       ├── email/route.ts            ← Brevo email notifications (reminders, nudges, ceremonies)
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
│   │   │   ├── email.ts                      ← Brevo email client + 7 templates
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

## API Routes (15)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/coach` | POST | MiniMax 2.7 AI coach conversation (rate-limited: 20/hr/user) |
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/webhooks/stripe` | POST | Handle Stripe payment → create user → send welcome email with magic link |
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
- **Week 6:** Completion ceremony, operator scores calculated, continuation votes

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
- ~~Email notifications~~ — **DONE** (Brevo: sprint reminders, squad nudges, life checks, ceremonies, welcome)
- ~~Configure Supabase SMTP~~ — **DONE** (Brevo SMTP via `supabase config push`, 100 emails/hr limit)
- ~~Create Sprint 4~~ — **DONE** (April 6 – May 15, 2026, handshake week March 30)
- ~~Mobile responsiveness polish~~ — **DONE** (tap targets, overflow fixes, settings tabs)
- ~~Deploy latest to Coolify~~ — **DONE** (auto-deploy on push, Brevo env vars live)
- ~~Cron setup on server~~ — **DONE** (every 3h, CRON_SECRET auth, /etc/cron.d/divisionalpha)
- ~~Critical bug fixes~~ — **DONE** (email recipients, localhost fallbacks, coach conversation history)
- ~~Security hardening~~ — **DONE** (CRON_SECRET, HTML escaping, rate limiting, structured logging)
- ~~Resilience~~ — **DONE** (MiniMax fallbacks on all 3 AI-calling agents, health check, Docker HEALTHCHECK)
- ~~Observability~~ — **DONE** (health endpoint, uptime monitor, JSON structured logs, backup cron)
- ~~Test coverage~~ — **DONE** (24 Vitest tests: email templates, rate limiter, cron scheduling)
- ~~Sprint lifecycle in cron~~ — **DONE** (daily midnight lifecycle check — was missing, sprint transitions would never have fired)
- ~~Welcome email~~ — **DONE** (magic link sent to new users after Stripe payment)
- Recruit applicants for Sprint 4 — **IN PROGRESS** (0 real applicants as of March 28, 2026)
- Run matchmaker — pending applicants (run ~April 4-5 via admin trigger)
- Tier 3 (Operator Fund) — deferred until 500+ Tier 2 members

## Go-To-Market Strategy (2026-03-28)

### Competitive Position

Division Alpha sits in a **$20-100/mo gap** that no competitor fills:
- **Free tier** (Reddit, Discord, apps): 73% failure rate within 60 days. Partner ghosting, no structure, no consequences.
- **Mid tier** ($49/mo — DIVISION ALPHA): AI + human squads + proactive follow-up. Nobody else does this.
- **Premium tier** ($200-600/mo): Commit Action ($199/mo for 20-min weekly call), GoFounder ($500/mo), Vistage ($15-20K/yr).

Key competitors: Focusmate (body doubling, $10/mo, 50K+ members), Commit Action (human coaching, $199/mo, 8K+ coached), FLOWN (facilitated sessions, $25/mo, 50K+ members), Boss as a Service (virtual boss, $25/mo), Shelpful (AI+human hybrid, $35-65/mo).

**Division Alpha's moats:**
1. AI + human squad hybrid at $49/mo (nobody else)
2. Squad model solves 73% ghosting rate (distributed accountability > 1:1 partnerships)
3. Always-on AI layer (coaches sleep, AI doesn't)
4. Proactive, not passive (comes to YOU, not another dashboard to open)
5. Price disruption (75% cheaper than Commit Action, 88% cheaper than RE coaching)

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
- Angle: "Most agents pay $400+/mo for a coach whose main value is accountability. Same thing. $49/mo. AI-powered."

**Campaign 3 — SDRs:**
- Subject: "The 15-month wall"
- Angle: "75% of SDRs burn out within 15 months. The ones who make AE have a system."

### Full Market Intelligence

See Obsidian: `/Users/cool/Obsidian-OP3/03-Projects/Division Alpha/Market Intelligence Report.md`
(21 competitors mapped, 7 audiences ranked, cold email math, community/forum research, price sensitivity data)
