# Division Alpha -- Complete Reference Document

## Version 1.0 | March 2026

---

# Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Thesis](#2-product-thesis)
3. [Three Tiers](#3-three-tiers)
4. [Target Audience](#4-target-audience)
5. [Sprint Rhythm -- The Core Product](#5-sprint-rhythm--the-core-product)
6. [Operator Score](#6-operator-score)
7. [Pause Protocol](#7-pause-protocol)
8. [Squad Formation Algorithm](#8-squad-formation-algorithm)
9. [Persona Types](#9-persona-types)
10. [Five AI Agents](#10-five-ai-agents)
11. [Complete User Journey](#11-complete-user-journey)
12. [App Screens](#12-app-screens)
13. [Navigation Architecture](#13-navigation-architecture)
14. [Design System](#14-design-system)
15. [Tech Stack](#15-tech-stack)
16. [Database Schema](#16-database-schema)
17. [API Routes](#17-api-routes)
18. [Cron Schedule](#18-cron-schedule)
19. [Project Structure](#19-project-structure)
20. [Frontend Architecture](#20-frontend-architecture)
21. [Permission Model](#21-permission-model)
22. [Accountability Philosophy](#22-accountability-philosophy)
23. [Islamic Values Integration](#23-islamic-values-integration)
24. [Brand Voice](#24-brand-voice)
25. [Competitive Position](#25-competitive-position)
26. [Key Metrics and Kill Conditions](#26-key-metrics-and-kill-conditions)
27. [Revenue Model](#27-revenue-model)
28. [Design History](#28-design-history)
29. [Key Decisions](#29-key-decisions)
30. [Roadmap](#30-roadmap)

---

# 1. Executive Summary

Division Alpha is an AI-orchestrated peer accountability platform connected to Oumafy (Islamic-branded parent company). It is a premium members-only experience where driven operators hold each other accountable through structured 6-week sprints. Members are matched into squads of 6-8 people by AI, then guided through a Monday/Wednesday/Friday rhythm of goal declaration, status check-ins, and weekly reflection. Five AI agents handle orchestration, coaching, matching, tracking, and facilitation. Human peer accountability delivers the behavior change.

**Tagline energy:** "Declare or be declared upon." / "No Excuses. No Exceptions."

**Domain:** divisionalpha.net

**Parent company:** Oumafy

---

# 2. Product Thesis

AI handles 70% of the work (orchestration, coaching, matching, tracking, facilitation). Human peer accountability delivers the 30% that actually drives behavior change.

The research basis:

| Condition | Goal Completion Rate | Source |
|---|---|---|
| Goals set alone | 43% | Dominican University |
| With accountability partner + weekly reports | 76% | Dr. Gail Matthews |
| With scheduled accountability appointments | 95% | ASTD |

Division Alpha makes structured human peer accountability work at scale without human facilitators. AI orchestrates. Humans hold each other accountable. The product occupies the only empty quadrant in accountability tools: AI-driven group peer accountability.

---

# 3. Three Tiers

| Tier | Name | Price | Description |
|---|---|---|---|
| 1 | Community | $10/mo | General access, community features, content |
| 2 | Sprint Access | $49/mo ($20/mo for Oumafy Premium members) | 6-week accountability sprints with squads of 6-8. Monday declarations, Wednesday G/Y/R check-ins, Friday reflections. The core product. |
| 3 | The Operator Fund | $297/mo + equity | Venture studio for top-performing operators. 12-week Build Sprints. Musharakah-compliant (Islamic partnership structure). NOT YET BUILT. |

**Revenue allocation:** 70% goes to the Tier 3 Project Fund, 20% to Operations, 10% to Profit.

**Tier 3 qualification:** Top 5% of operators by Operator Score receive an invitation.

---

# 4. Target Audience

**Primary:** Solo entrepreneurs and founders. $49-99/mo willingness to pay. Extreme isolation and procrastination pain. These are people building alone who know they need external structure.

**Secondary:** Muslim entrepreneurs. Culturally differentiated offering with zero competition. Built-in community distribution through Oumafy.

**Expansion (Month 7+):** Ambitious professionals beyond the entrepreneurial niche.

---

# 5. Sprint Rhythm -- The Core Product

Every sprint is 6 weeks. Every week follows the same Monday/Wednesday/Friday cadence. Consistency is the mechanism.

## Weekly Rhythm

### Monday -- Goal Declaration

- **Triggered by:** Sprint Facilitator AI (Agent 2), Monday morning in each squad's primary timezone
- **Format:** Async (typed in squad channel)
- Members declare 3+ specific, measurable goals for the week
- Include anticipated blockers and how the squad can help
- Facilitator acknowledges each declaration, flags vague goals, highlights connections between members, posts a summary
- Coach privately messages any user whose weekly goals are misaligned with their sprint targets

### Wednesday -- Mid-Week Check-In

- **Triggered by:** Sprint Facilitator AI (Agent 2), midday in the squad's timezone
- **Format:** Async (under 2 minutes per person)
- For each Monday goal, give one of three signals:
  - **Green** -- On track, moving forward
  - **Yellow** -- At risk, hitting friction, might need help
  - **Red** -- Stuck, blocked, need the squad
- Yellow/Red requires sharing what is blocking you
- Facilitator responds to each check-in, surfaces patterns, connects members who can help each other
- Non-responders get a gentle public nudge, then a private DM from the Guardian after 24 hours
- Research shows mid-point accountability increases completion rates by approximately 45%

### Friday -- Reflection and Celebration

- **Triggered by:** Sprint Facilitator AI (Agent 2), Friday afternoon/evening
- **Format:** Sync (voice call, 45-60 minutes preferred) with async fallback
- **Flow:**
  - Minutes 0-5: Opening, squad combined stats
  - Minutes 5-30: Wins round (each person shares accomplishments)
  - Minutes 30-45: Misses and learnings (reframed as data, not failure)
  - Minutes 45-55: Peer appreciation (call out someone who helped you)
  - Minutes 55-60: Close and handoff to Monday
- **After Friday, three things happen:**
  1. Analytics Engine calculates weekly completion rates and updates the Sprint Dashboard
  2. Coach sends a private message with personalized insight and pattern recognition
  3. Facilitator posts a "Week in Review" summary in the squad channel

### Execution Days (Tuesday/Thursday)

- No formal check-ins. "Heads down. You know what to do."
- Optional async standups available daily

### Weekend

- "Rest is part of the rhythm." No prompts, no notifications.

## Special Week Events

### Week 0 -- The Handshake (Pre-Sprint, 5-7 days)

1. **Squad assignments announced** by Matchmaker AI
2. **Squad Reveal:** Facilitator posts introductions in the squad channel
3. **Bio Thread:** Members answer three questions -- Who are you beyond your goal? What scares you about the next 6 weeks? What is a non-work thing you are into?
4. **Goal Refinement:** Coach reaches out privately to turn vague goals into SMART targets
5. **Goal Lock:** 2 days before sprint start, goals are locked and visible on the Sprint Card

### Week 1 -- Kickoff Ceremony

- **Duration:** 75 minutes, live voice or video
- **Flow:**
  - Minutes 0-5: Welcome and tone-setting
  - Minutes 5-35: Introductions (name, what you do, three sprint goals, one fear)
  - Minutes 35-45: Culture setting (5 operating norms)
  - Minutes 45-55: Goal clarity workshop
  - Minutes 55-70: Commitment ceremony ("I'm in")
  - Minutes 70-75: Logistics confirmation

**Five Squad Operating Norms:**
1. Honesty over performance -- tell what is real, not what sounds good
2. Struggling is data, hiding is the problem
3. What is shared here stays here
4. If you need to pause, say so -- the squad would rather adjust than lose you
5. The goal is progress, not perfection

### Week 3 -- Dip Intervention

Research shows motivation drops to its lowest at the midpoint. Division Alpha designs for the dip.

- **Duration:** 90 minutes (extended Friday session)
- **Flow:**
  - Part 1 (30 min): Celebrate the Half -- focus on what was accomplished
  - Part 2 (20 min): Extract Learning -- what surprised you, what did you learn about yourself
  - Part 3 (20 min): Goal Adjustment Amnesty -- resize, redirect, or replace goals with no shame
  - Part 4 (20 min): Squad Gratitude -- one appreciation per member
- **Coach triggers "Why Reset" exercise:** Private reflection reconnecting the member to their original motivation -- why they joined, what will be different if they finish strong, what they will regret if they do not

### Week 6 -- Completion Ceremony

- **Duration:** 90 minutes
- **Flow:**
  - Part 1 (30 min): Final wins -- transformation narrative, not just goal metrics
  - Part 2 (15 min): Sprint Report Card -- individual and squad metrics from Analytics Engine
  - Part 3 (20 min): Gratitude round -- specific peer appreciation
  - Part 4 (15 min): Continuation Vote (anonymous)
  - Part 5: AI Facilitator's closing statement with squad stats and ranking

**Continuation Vote Options:**
1. **Continue Together** -- Squad stays intact for the next sprint (requires >75% vote)
2. **Reshuffle** -- Member enters Matchmaker pool for a new squad
3. **Pause** -- Spot held, no charges, reactivation nudges at 30 and 60 days

**Post-Sprint (AI-Triggered):**
1. Post-Sprint Survey (NPS + product feedback + testimonial harvesting)
2. Sprint Summary Email (data-rich recap of entire sprint)
3. Coach's Closing Message (personalized insight, biggest strength, biggest opportunity, recommendation for next sprint)

---

# 6. Operator Score

A composite 6-factor score that tracks operator performance over time. Hidden by default -- revealed only by deliberate gesture (tapping the diamond icon in the topbar). The score is earned, not displayed.

| Factor | Weight | Description |
|---|---|---|
| Goal Completion | 25% | Percentage of declared goals completed across the sprint |
| Attendance | 20% | Check-in and ceremony participation rate |
| Squad Contribution | 20% | Engagement in squad discussions, helping others, responding to Yellow/Red signals |
| Leadership | 15% | Peer appreciation received, facilitating conversations, mentoring |
| Growth | 10% | Improvement trajectory across sprints |
| Communication | 10% | Response time, message quality, transparency in struggles |

**Qualification threshold:** Top 5% of operators by score receive an invitation to Tier 3 (The Operator Fund).

**Score display:** Animated count-up using Instrument Serif font (the only place this font appears in the entire app). Six factor bars with animated fill. Sprint summary (goals hit, attendance, sprints done). Tier 3 whisper text for qualifying operators.

---

# 7. Pause Protocol

Instead of kicking inactive members, Division Alpha uses a compassionate re-engagement system.

**Escalation Ladder:**
1. **1 missed check-in:** Gentle public nudge from Facilitator
2. **2 consecutive misses:** Captain sends "Life Check" private DM
3. **3+ misses:** Escalation to admin dashboard + proactive pause offer

**Life Check DM:** Compassionate, offers three choices:
- (a) Heads down executing and just forgot to post
- (b) Struggling with something and need support
- (c) Thinking about pausing

**Official Pause:** 1 week minimum. Goals paused, member stays in squad. Not charged while paused.

**Re-engagement results:** 70% re-engagement rate with Pause Protocol vs. 15% with hard cancellation.

**Reactivation Nudges:** Social-proof-driven emails at 30 and 60 days post-pause. Include specific squad references and community stats.

---

# 8. Squad Formation Algorithm

The Matchmaker AI processes all applicants for each sprint cycle and forms squads. Matching quality depends on having the full applicant pool.

| Priority | Factor | Weight | Details |
|---|---|---|---|
| 1 | Timezone compatibility | CRITICAL (hard constraint) | 4-6 hour overlap required. Dealbreaker filter, not a preference. |
| 2 | Goal diversity | 30% | Mix of Builders + Rewirers + Pivots. Ideal: 2-3 Builders, 2-3 Rewirers, 1-2 Pivots. |
| 3 | Personality balance | 25% | Mix of Direct/Supportive/Analytical accountability styles. |
| 4 | Experience level | 20% | Mix veterans with newcomers. Avoid extreme gaps. |
| 5 | Communication frequency | 10% | Match expectations for between-check-in interaction. |

**Squad size:** 6-8 for Sprint Access (Tier 2).

**Squad naming:** Unit names (Echo Unit, Sigma Unit, Vanguard Unit, etc.)

**Improvement over time:** Tracks which compositions produce the highest retention and goal completion, then optimizes matching criteria accordingly using sprint history and satisfaction data.

---

# 9. Persona Types

Each member self-identifies during the application process. Persona type is used by the Matchmaker for squad diversity and by the Coach for tailored guidance.

| Persona | Description | Primary Need |
|---|---|---|
| Builder | Launching projects, ventures, products | Deadlines and execution pressure |
| Rewirer | Changing habits, spiritual practice, routines | Consistency and patience |
| Pivot | Changing direction, career transition, life shift | Courage and clarity |

---

# 10. Five AI Agents

All powered by MiniMax 2.7. Hybrid architecture: Coach runs on OpenClaw (planned), others on Supabase Edge Functions.

## Agent 1: The Matchmaker

- **Fires:** Every sprint cycle (every 6 weeks)
- **Input:** Application data, returning member data, sprint history, satisfaction surveys
- **Output:** Squad compositions with compatibility scores
- **Talks to:** Analytics Engine (gets performance data), Coach (gets goal/personality insights)
- **Improvement:** Gets smarter with each sprint using retention and outcome data

## Agent 2: The Sprint Facilitator

- **Fires:** Monday/Wednesday/Friday + Week 1 Kickoff + Week 3 Dip Intervention + Week 6 Completion
- **Input:** Squad member list, goals, check-in responses, conversation context
- **Output:** Declaration prompts, check-in prompts, reflection prompts, submission acknowledgments, vague goal flags, member connection highlights, non-responder nudges, weekly squad summaries, ceremony facilitation
- **Talks to:** Analytics Engine (sends check-in data), Engagement Guardian (flags non-responders), Coach (shares squad dynamics)

## Agent 3: The Personal Coach

- **Fires:** Continuous (responds to user messages 24/7) + proactive outreach at key moments
- **Input:** User's full history -- every goal, check-in, completion rate, conversation history
- **Output:** Personalized coaching, goal refinement (vague to SMART), pattern recognition, obstacle analysis, mindset support
- **Key moments:**
  - Pre-sprint: Goal refinement
  - Post-check-in: Proactive insights ("Your professional goals are at 90%, personal at 40%")
  - Week 3: "Why Reset" exercise
  - Between sprints: Debrief and next-sprint planning
- **Memory:** Uses pgvector semantic memory for long-term pattern recognition across sprints
- **Talks to:** Facilitator (shares relevant user context), Analytics Engine (receives performance data), Guardian (flags coaching-resistant disengagement)

## Agent 4: The Engagement Guardian

- **Fires:** Continuously monitors all squad activity
- **Input:** Activity patterns -- message frequency, check-in completion, response times, message length trends, sentiment shifts
- **Output:** Gentle nudges, Life Check DMs, Pause Protocol management, admin alerts for at-risk squads
- **Escalation ladder:**
  - 1 miss: Gentle nudge
  - 2 consecutive misses: Private Life Check DM with three choices
  - 3+ misses: Escalation to admin + proactive pause offer
- **Talks to:** Facilitator (coordinates timing of nudges vs. squad prompts), Coach (shares disengagement signals), Analytics Engine (feeds churn prediction model)

## Agent 5: The Analytics Engine

- **Fires:** After every check-in (real-time) + end of each week + end of each sprint
- **Input:** All data from all other agents
- **Output:**
  - 6-factor Operator Score (deterministic formula)
  - Squad health scores (declaration rate, check-in rate, signal distribution)
  - Churn prediction (6-factor risk model: score, attendance, engagement, signals, messages, pauses)
  - Sprint Report Cards (AI-generated personalized summary)
  - Matchmaker optimization data
  - Admin business dashboards
- **Talks to:** All four other agents. Receives data from all, sends performance insights to Matchmaker and Coach, sends health alerts to Guardian, sends squad stats to Facilitator.

## Agent Interaction Map

```
                    Matchmaker
                   /    |
                  /     |
    Analytics ---+------+--- Coach
        |        \     /       |
        |         \   /        |
        +--- Guardian ---+     |
        |                |     |
        +--- Facilitator-+-----+
```

All five agents communicate through the inter-agent event bus (`agent_events` table). The Analytics Engine is the central data hub.

---

# 11. Complete User Journey

## Phase 0: Discovery

User finds Division Alpha through content marketing, podcast, blog post, LinkedIn/Twitter, paid ad, or referral. Lands on divisionalpha.net.

## Phase 1: Landing to Application

1. Reads landing page (Ogilvy-style long-form copy)
   - Hero: 43% vs 76% data point
   - Mechanism: Monday/Wednesday/Friday rhythm
   - AI agents as infrastructure (not the product)
   - Research stats
   - "This is not for everyone" qualifier
   - $49/mo pricing
   - Sprint Calendar with scarcity ("Sprint 4 begins April 6. 18 spots remaining.")
   - Two CTAs: "Apply for the Next Sprint" and "I'm already a member"
2. Clicks "Apply for the Next Sprint" (the word "Apply" is deliberate -- creates perceived exclusivity)
3. Completes 4-step application form (see App Screens section below)
4. Redirected to Stripe Checkout, pays $49/mo
5. Stripe webhook creates auth user in Supabase
6. Receives magic link email, clicks, logged in

## Phase 2: Pre-Sprint (Week 0 -- The Handshake)

7. Confirmation email ("You're In.") sent immediately
8. Matchmaker AI receives intake data, user enters matching queue
9. Account created -- user sees "Matching in progress" on platform
10. Coach reaches out within 24 hours for goal refinement
11. Coach works through each goal: vague to SMART, identifies blockers, establishes baseline
12. Matchmaker forms squads (Day 3-5 of Week 0)
13. Squad Reveal: Facilitator posts introduction with all member bios
14. Bio Thread: Members introduce themselves (who they are, what scares them, non-work interest)
15. "Meet Your Squad" email sent to each member
16. Goal Lock: Coach confirms final goals, locked and visible on Sprint Card

## Phase 3: Sprint Weeks 1-6

17. Week 1: Kickoff ceremony (75 minutes, Sprint Covenant, "I commit")
18. Every Monday: Facilitator prompts declarations. User declares 3+ specific goals + blockers. Squad sees them.
19. Every Wednesday: Facilitator prompts check-in. User gives G/Y/R per goal. Yellow/Red triggers squad support.
20. Every Friday: Facilitator prompts reflection. User shares wins, misses, learnings. Peer appreciation. Sync call.
21. Week 3: Dip Intervention (normalize the dip, goal adjustment amnesty, "Why Reset" from Coach)
22. Week 6: Completion ceremony (stats, transformation, gratitude, continuation vote)

## Phase 4: Between Sprints (1-2 weeks)

23. **Continue Together (>75% vote):** Squad stays intact, lighter-touch content during gap, Coach debriefs and plans next sprint goals
24. **Reshuffle:** Member enters Matchmaker queue. Coach maintains continuity. Sprint Record carries reputation to new squad.
25. **Pause:** Pause Protocol activates. Spot held. No charges. Coach checks in once at 2 weeks. Reactivation nudges at 30 and 60 days.
26. **New members** go through Phase 0 and Phase 1, matched alongside reshuffled returning members

## Phase 5: Ongoing (Sprint 2+)

27. Sprint 2: Less hand-holding, more ambitious goals, deeper social bonds, Coach identifies longitudinal patterns
28. Sprint 3: Retention inflection point. Coach proactively checks in about routine fatigue, suggests goal redesign
29. Sprint 4+: Long-term operators become Captains (peer leaders). Progression: Member to Veteran to Captain.
30. Coach identifies longitudinal patterns across sprints
31. Operator Score tracks performance over time
32. Top 5% operators invited to Tier 3 (The Operator Fund)

---

# 12. App Screens

16 total screens: 3 public, 12 authenticated, 1 admin.

## Public Pages (no auth required)

### 1. Landing Page

Ogilvy-style long-form copy. Hero section with the 43% vs 76% data point. Sections: mechanism (Mon/Wed/Fri), AI agents as infrastructure, research stats, "This is not for everyone" qualifier, $49/mo pricing, Sprint Calendar with scarcity, closing argument. Two CTAs: "Apply for the Next Sprint" and "I'm already a member."

### 2. Login Page

Magic link (primary) and password authentication via Supabase. Links to Apply and Landing.

### 3. Apply Page

4-step application form:

**Step 1 -- Identity:**
- Full name
- Email
- Timezone
- "In one sentence, what do you do?"

**Step 2 -- Goals:**
- 1-3 goals for the next 6 weeks (free text with examples)
- Primary focus category (Professional / Personal / Spiritual)
- Current stage (Just Starting Out / Building & Growing / Scaling / Pivoting / Other)
- "Why are you applying?" (open text)

**Step 3 -- Accountability Style:**
- Response style (Direct and Challenging / Supportive and Encouraging / Data-Driven and Analytical / Mix of All)
- Support instinct when a squad member struggles (Ask how I can help / Give them space / Push them harder / Help them problem-solve)
- Persona type (Builder / Rewirer / Pivot)

**Step 4 -- Commitment:**
- 3x/week commitment for 6 weeks (Yes/No)
- Willing to share progress and struggles openly (Yes/No)
- No ghosting understood (Yes/No)

On submit: saves to Supabase `applications` table, redirects to Stripe Checkout ($49/mo).

## Authenticated Pages (require login)

### 4. Home

Day-contextual dashboard. Changes posture based on day of week:

| Day | Posture | Message | CTA |
|---|---|---|---|
| Monday | Declaration energy | "What are you committing to?" | Link to Declare |
| Tuesday | Execution | "Heads down. You know what to do." | None |
| Wednesday | Check-in energy | "Your squad is waiting on your signal." | Link to Check-in |
| Thursday | Execution | "Heads down. You know what to do." | None |
| Friday | Reflection energy | "Look back before you move forward." | Link to Reflect |
| Weekend | Rest | "Rest is part of the rhythm." | None |

Also shows: sprint/week indicator, greeting with name, goals list, coach whisper (one insight surfaced), squad summary, sprint progress bar with timeline.

### 5. Declare

Monday goal declaration form. 3+ goal inputs (add more button), blockers textarea. Submits to `declarations` table. Tawakkul quote at bottom.

### 6. Check-in

Wednesday G/Y/R signals. Loads goals from this week's declaration. Per-goal Green/Yellow/Red buttons. Yellow/Red reveals "What's blocking you?" input field. Submits to `checkins` table.

### 7. Reflect

Friday reflection. Shows week stats (goals hit, check-in rate, vs average). Four textareas: wins, misses, learnings, carry-forward. Peer appreciation section (select squad members + write a note). Quran 94:6 quote at bottom.

### 8. Squad

Activity feed (not roster grid). Shows squad name, member count, sprint/week indicator. Health bar (checked in / pending / quiet). Squad Chat CTA with unread count. Activity items from declarations, check-ins, and facilitator messages. Each item shows avatar, name, type, time, content, G/Y/R signal badges. Facilitator messages styled with sage green accent border.

### 9. Squad Chat

Real-time messaging via Supabase Realtime. Shows squad name, member count, online status avatars. Messages with sender avatar, name, timestamp. User messages right-aligned in accent color. Facilitator messages labeled with badge. Input with send button.

### 10. Coach

Private AI DM thread. Shows conversation history. User messages right-aligned. Coach messages left-aligned. Typing indicator when AI is generating. Send triggers MiniMax 2.7 via `/api/coach`. "Private . Only you can see this . Powered by AI" label.

### 11. Leaderboard

Tabbed view: Squads and Operators.
- **Squads tab:** Your squad highlighted, ranked by completion rate with trend indicator
- **Operators tab:** Ranked by Operator Score with goals hit
- Season summary stats at bottom

### 12. Score Overlay

Hidden behind diamond icon in topbar. Modal overlay. Animated score count-up in Instrument Serif font (the ONLY place this font is used in the entire app). Six factor bars with animated fill. Sprint summary (goals hit, attendance, sprints done). Tier 3 whisper ("Your score qualifies you for The Operator Fund") for qualifying operators.

### 13. Settings

4 tabs:
- **Profile:** Avatar, display name, bio, timezone (saves to Supabase)
- **Preferences:** Theme toggle (light/dark), sprint day display options
- **Notifications:** Toggles for sprint reminders, squad activity, coach messages, weekly digest
- **Account:** Current plan ($49/mo Sprint Access), account info (email, member since, sprints completed, current squad), danger zone (leave squad, delete account)

### 14. Kickoff

Week 1 ceremony screen. Shows all squad members with goals and persona types. Five squad operating norms. "I'm in" commitment button.

### 15. Completion

Week 6 ceremony screen. Sprint stats (completion rate, attendance, goals hit, rank). Transformation reflection prompt. Gratitude round (peer appreciation). Continuation vote (Continue Together / Reshuffle / Pause).

### 16. Admin Dashboard

Admin-only (founder/admin role). Accessible via `...` menu in topbar.

- **KPI grid:** Active users, paying users, MRR, ARR, paused, churned, average score, pending applications
- **Squad health table:** All squads with health metrics
- **At-risk users panel:** Flagged by Guardian
- **Active pauses panel:** Members currently paused
- **Agent trigger buttons:** Manually fire any agent

---

# 13. Navigation Architecture

- **Routing:** SPA routing via React Context (`navigation-context.tsx`). All pages render from a single Next.js route (`page.tsx`). No file-based routing for page screens.
- **Page type union:** Every new page must be added to the `Page` type in both `navigation-context.tsx` and `page-wrapper.tsx`, then rendered in `page.tsx`.

## Desktop Navigation

- **Topbar (fixed):** Logo (home link), primary nav items (Home, Declare, Check-in, Reflect, Squad, Board, Coach), overflow `...` dropdown (Kickoff, Completion, Apply, Admin)
- **Topbar right side:** Notification bell with real-time unread count badge (authenticated only), Score diamond icon (opens overlay, authenticated only), theme toggle (moon/sun), AM avatar (navigates to Settings, authenticated only)

## Mobile Navigation

- **Bottom bar (fixed):** 5 primary items (Home, Declare, Signal, Reflect, Squad) + "More" popup menu
- **More popup:** Coach, Leaderboard, ceremonies, Apply, Settings

## Session Gating

- **Unauthenticated:** Landing, Login, Apply only
- **Authenticated:** Auto-redirect to Home

---

# 14. Design System

**Direction:** Warm Editorial -- private club meets personal journal.

**Mood:** Opening a leather-bound journal in a quiet members' lounge. Warm, focused, intimate. Not corporate, not militant, not flashy.

**Reference sites:** Soho House (warmth, exclusivity), Focusmate (functional accountability UI), Planes Studio (editorial web design craft).

**Core insight:** Every accountability app designs as a productivity TOOL (dashboards, progress bars, streaks). Division Alpha should feel like a PRIVATE JOURNAL shared with 6 people. The interface changes posture based on the day.

## Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display/Hero | DM Sans | 700 | All headings, greetings, page titles |
| Body | DM Sans | 400/500 | All primary UI text |
| UI/Labels | DM Sans | 500/600 | Labels, buttons, navigation |
| Brand mark | DM Sans | 600 | Uppercase, letter-spacing 0.04em. "DIVISION ALPHA" in topbar only. |
| Data/Tables | DM Mono | 400/500 | Tabular figures, operator scores, timestamps, sprint data |
| Score reveal | Instrument Serif | -- | ONLY for the Operator Score number on reveal. One place in the entire app. Extreme rarity makes it feel earned. |

**Type scale (base 16px, zoomed 1.3x):**

| Level | Size | Font |
|---|---|---|
| H1/Page title | 1.75rem (28px) | DM Sans 700 |
| H2/Section title | 1.5rem (24px) | DM Sans 700 |
| H3 | 1.25rem (20px) | DM Sans 600 |
| Body | 1rem (16px) | DM Sans 400 |
| Small/Label | 0.8125rem (13px) | DM Sans 500 or DM Mono 400 |
| Micro | 0.6875rem (11px) | DM Mono 400, uppercase tracking 0.08em |

## Color

Color is rare and meaningful. Sage green appears sparingly -- when it appears, it matters. The palette is built on warm neutrals.

### Light Theme (Primary -- morning journal energy)

| Token | Value | Purpose |
|---|---|---|
| `--bg` | `#f5f0e6` | Warm parchment |
| `--bg-page` | `#faf7f0` | Lightest cream |
| `--surface` | `#ede8dc` | Card/panel background |
| `--border` | `#d8d0c0` | Subtle warm border |
| `--text` | `#1c1a15` | Near-black, warm |
| `--text-secondary` | `#5c5647` | Secondary content |
| `--text-muted` | `#948d7e` | Timestamps, hints |
| `--accent` | `#3d6b4a` | Sage green -- primary action, links |
| `--accent-hover` | `#2e5238` | Darker sage on hover |
| `--accent-surface` | `#e8f0ea` | Light sage tint for backgrounds |

### Dark Theme (Secondary -- evening review energy)

| Token | Value | Purpose |
|---|---|---|
| `--bg` | `#111110` | Warm near-black |
| `--bg-page` | `#151514` | Page background |
| `--surface` | `#1c1b19` | Card/panel background |
| `--border` | `#2a2825` | Subtle warm border |
| `--text` | `#ede6d5` | Warm cream text |
| `--text-secondary` | `#c0b9ab` | Secondary content (contrast-fixed) |
| `--text-muted` | `#847e74` | Timestamps, hints (contrast-fixed) |
| `--accent` | `#5a9a6e` | Brighter sage for dark backgrounds |
| `--accent-hover` | `#6db882` | Lighter sage on hover |
| `--accent-surface` | `#1a2a1f` | Dark sage tint |

### Signal Colors

| Signal | Light | Dark | Meaning |
|---|---|---|---|
| Green | `#3d6b4a` | `#5a9a6e` | On track |
| Yellow | `#b8923e` | `#c9a54e` | At risk, needs attention |
| Red | `#a04040` | `#c45c5c` | Off track, missed |

## Layout

- **Approach:** Single-column editorial. NOT dashboard grid.
- **Max content width:** 660px centered -- feels like a journal page
- **No persistent sidebar.** No dashboard grid.
- **Day-contextual posture:** Home view changes based on the day of the week
- **Border radius:** 4px for cards/inputs, 2px for small elements, 0 for full-bleed sections. No bubbly rounded corners.
- **Global zoom:** `zoom: 1.3` on body (30% increase)

## Spacing

- **Base unit:** 4px
- **Density:** Comfortable -- generous whitespace
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px) 4xl(96px)
- **Section spacing:** 3xl-4xl between major sections
- **Card padding:** lg-xl internal padding

## Motion

- **Approach:** Minimal-functional -- motion serves comprehension, not decoration
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` for entrances, `ease-in-out` for state changes
- **Duration:** micro(80ms) short(150ms) medium(300ms) long(500ms)
- **Entrance:** Subtle fade-up (opacity 0 to 1, translateY 8px to 0) on page transitions
- **Theme toggle:** Background/color transitions 300-400ms
- **Score reveal:** Animated count-up -- the one expressive moment in the entire app
- **Reduced motion:** Respects `prefers-reduced-motion: reduce`

## Anti-Patterns (Never Use)

- Persistent sidebar navigation
- Dashboard grid layouts with stat cards
- Purple/violet accents or gradients
- Glassmorphism or frosted glass effects
- Rounded corners >8px (no bubbly UI)
- Agent/AI boxes showing all 5 agents at once
- Squad displayed as avatar roster grid
- Operator Score visible by default
- CRT scanlines, retro terminal effects, Art Deco borders
- Military/bunker/militant aesthetic or language

---

# 15. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, TypeScript | SPA routing via React Context |
| Backend/DB/Auth/Realtime | Supabase (Postgres, pgvector, RLS, Realtime) | Row-Level Security for all tables |
| AI Agents | MiniMax 2.7 (all 5 agents) | OpenClaw planned for Coach later |
| Payments | Stripe | $49/mo recurring subscription |
| Hosting | Self-hosted on Coolify (OP3 server) | Cloudflare DNS |
| Domain | divisionalpha.net | -- |
| Fonts | Google Fonts CDN | DM Sans, DM Mono, Instrument Serif via `next/font/google` |

---

# 16. Database Schema

19 core tables plus Tier 3 tables (not yet active).

## Core Tables

| # | Table | Purpose | Notes |
|---|---|---|---|
| 1 | `profiles` | User profiles | References `auth.users` |
| 2 | `applications` | 4-step intake form data | Steps 1-4 of Apply |
| 3 | `sprints` | Sprint cycles | 6-week periods |
| 4 | `squads` | Accountability squads | Named units |
| 5 | `squad_members` | Join table (users to squads) | -- |
| 6 | `sprint_goals` | Locked goals per sprint | Set during Week 0 Goal Lock |
| 7 | `declarations` | Monday goal declarations | Weekly goals + blockers |
| 8 | `checkins` | Wednesday G/Y/R check-ins | Per-goal signal + context |
| 9 | `reflections` | Friday reflections | Wins, misses, learnings, carry-forward |
| 10 | `squad_messages` | Real-time squad chat | Supabase Realtime enabled |
| 11 | `coach_messages` | Private AI coach DM | Supabase Realtime enabled |
| 12 | `operator_scores` | 6-factor composite score | Calculated by Analytics Engine |
| 13 | `squad_analytics` | Weekly health snapshots | Declaration rate, check-in rate, signal distribution |
| 14 | `engagement_events` | Guardian tracking data | Activity patterns for disengagement detection |
| 15 | `pauses` | Pause Protocol records | Start date, duration, status |
| 16 | `agent_memory` | pgvector semantic memory | Long-term pattern storage for Coach |
| 17 | `agent_events` | Inter-agent event bus | Communication between agents |
| 18 | `notifications` | In-app notifications | Supabase Realtime enabled |
| 19 | `notification_preferences` | User notification settings | Per-type toggles |

## Tier 3 Tables (Not Yet Active)

- `ventures` -- Tier 3 venture projects
- `musharakah_agreements` -- Islamic partnership contracts
- `venture_metrics` -- Build Sprint performance data
- `build_squad_roles` -- Role assignments within venture squads

## Row-Level Security (RLS)

| Role | Access |
|---|---|
| Member | Own data + squad shared data |
| Captain | + squad health signals, nudge tools |
| Admin | Everything |
| Coach messages | Only the user (private) |
| Agents | Use `service_role` key (bypasses RLS) |

---

# 17. API Routes

15 endpoints total.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/coach` | Coach DM (MiniMax 2.7) |
| POST | `/api/checkout` | Create Stripe Checkout session |
| POST | `/api/webhooks/stripe` | Handle Stripe payment events |
| POST | `/api/agents/facilitator` | Mon/Wed/Fri prompts and ceremonies |
| POST | `/api/agents/guardian` | Engagement scan and nudges |
| POST | `/api/agents/analytics` | Scores, health, report cards, churn prediction |
| POST | `/api/agents/matchmaker` | Squad formation |
| POST | `/api/agents/ceremonies` | Kickoff, dip intervention, completion, squad reveal |
| POST | `/api/agents/events` | Inter-agent event bus processing |
| GET | `/api/agents/cron` | Cron orchestrator (dispatches agents on schedule) |
| GET | `/api/agents/lifecycle` | Sprint week advancement |
| POST | `/api/admin/trigger` | Manually fire any agent |
| GET | `/api/admin/dashboard` | Platform KPIs for admin |

---

# 18. Cron Schedule

Vercel-compatible, running via Coolify.

| Schedule | Offset | Job | Details |
|---|---|---|---|
| Every 3 hours | :07 | Agent dispatch | Facilitator (Mon/Wed/Fri only), Guardian (weekdays) |
| Every 3 hours | :37 | Event bus processing | Inter-agent communication |
| Daily | 00:03 | Sprint lifecycle | Week advancement, ceremony triggers |

---

# 19. Project Structure

```
divisionalpha/
├── CLAUDE.md                                 -- Project context for AI assistants
├── DESIGN.md                                 -- Locked design system
├── docs/
│   ├── Division_Alpha_Complete_UX_Flow.md    -- Every touchpoint from first click to third sprint
│   ├── DIVISION_ALPHA_COMPLETE_REFERENCE.md  -- This document
│   └── Oumafy_Tier3_Operator_Fund_Spec.docx -- Tier 3 Operator Fund full spec
├── mockups/
│   ├── Division_Alpha_App_v7.html            -- CURRENT: Full interactive prototype (approved)
│   ├── Division_Alpha_Landing.html           -- CURRENT: Public-facing landing page
│   ├── Division_Alpha_App_v5.html            -- Previous warm editorial attempt
│   ├── Division_Alpha_App_v4.html            -- Rejected: retro Art Deco terminal
│   ├── Division_Alpha_App_v3.html            -- Rejected: glassmorphism
│   ├── Division_Alpha_App_v2.html            -- Rejected: militant grain overlay
│   ├── Division_Alpha_App_v1.html            -- Rejected: generic sidebar layout
│   ├── division_alpha_mockup.html            -- Original design mockup
│   └── accountability_platform_mockup.html   -- Alternative design mockup
├── app/                                       -- Next.js production app (frontend)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                    -- Root layout: fonts, ThemeProvider, Topbar, MobileNav, ScoreOverlay
│   │   │   ├── page.tsx                      -- Single-route SPA: renders all page components
│   │   │   └── globals.css                   -- Full design system CSS variables (light/dark), zoom: 1.3
│   │   ├── lib/
│   │   │   └── navigation-context.tsx        -- Client-side SPA routing via React context (Page type union)
│   │   └── components/
│   │       ├── topbar.tsx                    -- Fixed top nav
│   │       ├── mobile-nav.tsx                -- Fixed bottom nav (mobile only)
│   │       ├── page-wrapper.tsx              -- Shared page container: 660px max-width, fadeUp animation
│   │       ├── score-overlay.tsx             -- Modal overlay: animated score count-up
│   │       ├── theme-provider.tsx            -- Theme context: light/dark toggle
│   │       └── pages/
│   │           ├── home.tsx                  -- Day-contextual dashboard
│   │           ├── declare.tsx               -- Monday goal declaration
│   │           ├── checkin.tsx               -- Wednesday G/Y/R check-in
│   │           ├── reflect.tsx               -- Friday reflection
│   │           ├── squad.tsx                 -- Squad activity feed
│   │           ├── squad-chat.tsx            -- Real-time squad chat
│   │           ├── coach.tsx                 -- Private AI coach DM thread
│   │           ├── leaderboard.tsx           -- Squad + operator rankings
│   │           ├── kickoff.tsx               -- Sprint kickoff ceremony
│   │           ├── completion.tsx            -- Sprint completion ceremony
│   │           ├── apply.tsx                 -- 4-step onboarding flow
│   │           └── settings.tsx              -- Profile, preferences, notifications, account
│   ├── package.json                          -- Next.js 16, React 19, Tailwind CSS v4, TypeScript
│   └── tailwind.config.ts
```

---

# 20. Frontend Architecture

- **SPA routing:** All pages render from a single Next.js route (`page.tsx`). Navigation is handled client-side via `navigation-context.tsx`. No file-based routing for page screens.
- **Page type union:** Every new page must be added to the `Page` type in both `navigation-context.tsx` and `page-wrapper.tsx`, then rendered in `page.tsx`.
- **Shared page container:** `page-wrapper.tsx` provides 660px max-width centering and fadeUp entrance animation.
- **Fonts loaded via `next/font/google`** in `layout.tsx` -- DM Sans, DM Mono, Instrument Serif.
- **CSS custom properties** for all colors/spacing in `globals.css` -- supports light/dark themes via `data-theme` attribute.
- **Theme context:** `theme-provider.tsx` manages light/dark toggle.
- **Global zoom:** `zoom: 1.3` applied on body in `globals.css`.

---

# 21. Permission Model

| Role | Access Level |
|---|---|
| Member | Own data + squad shared data |
| Captain | + squad health signals, nudge tools |
| Admin/Founder | Everything: all squads, all users, all agents, platform KPIs |

**Coach messages:** Only visible to the individual user. Private by design.

**Agents:** Use Supabase `service_role` key to bypass RLS.

**Session gating:** Unauthenticated users see only landing, login, and apply pages. Authenticated users auto-redirect to home.

---

# 22. Accountability Philosophy

Division Alpha uses a Tawakkul-based accountability framework. The core principle: evaluate Amal (effort/action), not outcomes.

**Example:** "Did you send the emails? YES -- You did your part; the outcome is with Allah."

This prevents burnout and spiritual despair. It separates what is in your control (effort) from what is not (results). A member who sends 50 cold emails and gets zero responses is not failing -- they are executing.

**Key principles:**
- Struggling is data. Hiding is the only failure.
- Accountability without shame.
- Anti-hustle-culture: structured effort + rest, not grinding.
- The goal is progress, not perfection.
- Commercially honest: we charge what we are worth.

---

# 23. Islamic Values Integration

Integration is subtle, not heavy-handed. Division Alpha is welcoming to all while maintaining Islamic values as a foundation.

| Value | How It Manifests |
|---|---|
| Tawakkul (trust in Allah) | Effort-based accountability -- evaluate action, not outcome |
| Amal (effort/action) | The unit of measurement for all check-ins and scoring |
| Ikhlas (sincerity) | Honesty over performance -- tell what is real |
| Muhasaba (self-reflection) | Friday reflections as spiritual practice |
| Barakah (divine blessing) | Focus in sprint rituals, gratitude rounds |
| Ummah (community) | Ghosting harms the community. Squad bonds treated as sacred. |
| No riba (no interest) | No interest-based pricing or financial structures |
| Musharakah (partnership) | Tier 3 Operator Fund uses profit-and-loss sharing, not debt |

**Failure normalization through Islamic lens:** Struggles are reframed not as personal failures but as part of the human experience that faith addresses directly.

---

# 24. Brand Voice

- **Direct, not motivational.** Evidence-based. Founder-to-founder.
- **Anti-hustle-culture.** Structured effort + rest, not grinding. Rest is part of the rhythm.
- **Accountability without shame.** Struggling is data, hiding is the failure.
- **Commercially honest.** We charge what we are worth. No apologetic pricing.
- **Tawakkul energy.** Effort meets trust. Do your part, outcome is with Allah.
- **Exclusive but not elitist.** The word "Apply" is deliberate. You earn your spot.
- **Warm, not cold.** Every surface has warmth -- cream not white, warm black not pure black.

---

# 25. Competitive Position

Division Alpha occupies the only empty quadrant in accountability tools: AI-driven group peer accountability.

| Competitor | Category | Why Different |
|---|---|---|
| ChatGPT / Claude | AI solo tools | Cannot create squads or social pressure |
| Purpose (Mark Manson) | Solo AI mentor | No peers, no squad dynamics |
| Focusmate | Co-working | Random pairing, no squads, no sprints, no progression |
| Human masterminds | Group accountability | Cannot scale without human facilitators |
| BetterUp / CoachHub | Enterprise coaching | Enterprise-only, not for indie operators |

**Division Alpha's edge:** AI handles orchestration at scale (no human facilitators needed), while preserving the human-to-human accountability that actually drives behavior change. No other product does both.

---

# 26. Key Metrics and Kill Conditions

## Target Metrics

| Metric | Target |
|---|---|
| Monthly churn | 5-7% |
| 90-day retention | 50%+ |
| Sprint completion rate | 70%+ |
| Blended ARPU | $59-69/mo |
| Subscribers for $1M ARR | 1,200-1,700 |
| Timeline to $1M ARR | 16-24 months |

## Kill Conditions

| Metric | Threshold | Action |
|---|---|---|
| Monthly churn | >10% for 3+ consecutive months | Kill or major pivot |
| 90-day retention | <35% | Kill or major pivot |

---

# 27. Revenue Model

**Primary revenue:** Stripe recurring subscriptions.

| Tier | Monthly Price | Notes |
|---|---|---|
| Tier 1 (Community) | $10/mo | General access |
| Tier 2 (Sprint Access) | $49/mo ($20/mo for Oumafy Premium) | Core product |
| Tier 3 (Operator Fund) | $297/mo + equity | Not yet built |

**Revenue allocation:**
- 70% goes to Tier 3 Project Fund
- 20% goes to Operations
- 10% goes to Profit

**Musharakah compliance (Tier 3):** Profit-and-loss sharing partnership structure. No interest. Islamic finance compliant.

---

# 28. Design History

| Version | Direction | Outcome |
|---|---|---|
| v1 | Sidebar layout, Bebas Neue | Rejected ("very AI generic") |
| v2 | Grain overlay, militant voice | Rejected ("doesn't inspire me") |
| v3 | Glassmorphism, Cormorant Garamond, floating nav | Rejected ("still feels like AI slop") |
| v4 | Retro Art Deco terminal | Rejected ("not the vibe") |
| v5 | First Warm Editorial attempt | Approved direction, needed refinement |
| v6 | (skipped) | -- |
| **v7** | **Full Warm Editorial prototype** | **CURRENT -- approved. All screens, day-contextual, ceremonies, onboarding, coach DM.** |

Key typography evolution: Instrument Serif was initially the display font. Demoted to score reveal only after user found it hard to read in headings. DM Sans 700 promoted to primary display font for readability.

---

# 29. Key Decisions

1. **Custom app from day one.** No Discord. Custom platform provides full control over the experience.
2. **Islamic values integration.** Tawakkul, Amal, Ikhlas -- subtle, not heavy-handed. Welcoming to all.
3. **Revenue allocation.** 70% to Tier 3 Project Fund, 20% Operations, 10% Profit.
4. **Musharakah for Tier 3.** Islamic partnership structure -- profit/loss sharing, no interest.
5. **Design direction.** High-end members club, not generic SaaS or military bunker. Warm Editorial aesthetic.
6. **DM Sans everywhere.** User strongly prefers its readability. One font carries the entire app.
7. **Instrument Serif for score only.** One place in the entire app -- extreme rarity makes it earned.
8. **Score hidden by default.** Revealed by deliberate crest/diamond tap. Earned, not displayed.
9. **"Apply" not "Sign up."** Deliberate psychological framing for exclusivity and commitment.
10. **Activity feed, not roster grid.** Squad view shows what people are doing, not just who they are.
11. **Light mode primary.** Morning journal energy. Dark mode available but secondary.
12. **30% global zoom.** `zoom: 1.3` on body. User's strong preference -- default felt too small.
13. **Single-column 660px layout.** Journal-like, not spreadsheet-like. No sidebar.

---

# 30. Roadmap

## Completed

- [x] Full frontend app (Next.js, all 13 screens)
- [x] Design system locked (DESIGN.md)
- [x] Interactive prototype v7 (approved)
- [x] Landing page
- [x] Mobile navigation (topbar + bottom nav)

## In Progress / Next

- [ ] Mobile responsiveness audit (full page QA)
- [ ] Design review for spacing/contrast/consistency
- [ ] Full technical architecture document

## Upcoming

- [ ] Supabase schema design + backend integration
- [ ] Authentication flow (Supabase Auth with magic link)
- [ ] AI agent implementation (MiniMax 2.7, OpenClaw for Coach)
- [ ] Real data integration (replace mock/simulated data)
- [ ] Stripe integration (checkout, webhooks, subscription management)
- [ ] Real-time features (squad chat, coach DM, notifications via Supabase Realtime)
- [ ] Agent cron jobs and event bus
- [ ] Admin dashboard with live data
- [ ] Tier 3 Operator Fund (Musharakah structure, venture tables, Build Sprints)

---

*This document is the definitive reference for Division Alpha. It covers the product thesis, all three tiers, the complete sprint rhythm, all five AI agents, every app screen, the full design system, technical architecture, database schema, API routes, user journey, business model, competitive position, and key decisions. Updated March 2026.*
