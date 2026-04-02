# Design System — Division Alpha

## Product Context
- **What this is:** A 40-day proving ground for operators. The Boss is the system: AI-powered, human-amplified, one unified experience with one memory.
- **Model:** One adaptive app that evolves across `ENTER`, `PROVEN`, and `ELITE` without becoming three separate products.
- **Front-door truth:** Everyone gets a chance.
- **Operator truth:** The best earn their squad.
- **Elite truth:** 85% do not make it.
- **Project type:** Web app (Next.js) with a Boss-led command center, proof system, journey rhythm, earned squad layer, and operator admin.

## Aesthetic Direction
- **Direction:** Warm Editorial — private club meets personal journal
- **Mood:** A serious room with warmth. Calm authority, not startup hype. Intimate, disciplined, and premium.
- **Editorial posture:** Feels written, not assembled. Real sentences, restrained emphasis, strong hierarchy.
- **Reference energy:** Soho House warmth, Focusmate utility, journal-like pacing, premium members-club composure.

## Core UX Principle
Division Alpha is not a dashboard with AI bolted on. It is a single adaptive Boss-led system.

- The Boss is the relationship.
- Human moments live inside that relationship.
- The app should feel like one memory, one identity, one line of accountability.
- The surface should answer: what the Boss wants today, how the score is moving, what unlock is coming next, and where the user stands in the 40-day arc.

## Information Architecture
The adaptive shell is locked to:

1. `landing`
2. `login`
3. `apply`
4. `boss`
5. `journey`
6. `squad`
7. `coach`
8. `proof`
9. `settings`
10. `admin`

Old standalone pages like `declare`, `checkin`, `reflect`, `kickoff`, `completion`, and `leaderboard` should not be primary destinations. They can exist as modules or legacy implementation details, but the lived product is the adaptive shell above.

## Typography
- **Primary display/body/UI:** DM Sans
- **Data / labels / timestamps:** DM Mono
- **Score reveal only:** Instrument Serif

### Rules
- DM Sans carries nearly the entire product.
- Instrument Serif appears only for the score number and nowhere else.
- DM Mono is for quiet system truth: stats, labels, thresholds, timing, states.
- Avoid decorative type mixes beyond the locked trio.

### Scale
- Base is visually enlarged via global `zoom: 1.3`
- H1/Page title: 1.75rem–2rem
- H2/Section title: 1.25rem–1.5rem
- H3/Subsection: 1rem–1.125rem
- Body: 1rem
- Small: 0.8125rem
- Micro / overline: 0.6875rem–0.75rem uppercase DM Mono

## Color
### Light Theme (Primary)
```css
--bg: #f5f0e6;
--bg-page: #faf7f0;
--surface: #ede8dc;
--surface-hover: #e6e0d3;
--border: #d8d0c0;
--border-subtle: rgba(92, 86, 71, 0.16);
--text: #1c1a15;
--text-secondary: #5c5647;
--text-muted: #948d7e;
--accent: #3d6b4a;
--accent-hover: #2e5238;
--accent-surface: #e8f0ea;
--accent-text: #ffffff;
--green: #3d6b4a;
--yellow: #b8923e;
--red: #a04040;
```

### Dark Theme (Secondary)
```css
--bg: #111110;
--bg-page: #151514;
--surface: #1c1b19;
--surface-hover: #242320;
--border: #2a2825;
--border-subtle: rgba(240, 235, 224, 0.1);
--text: #f0ebe0;
--text-secondary: #c0b9ab;
--text-muted: #847e74;
--accent: #6db882;
--accent-hover: #82c994;
--accent-surface: #1a2a1f;
--accent-text: #111110;
--green: #5a9a6e;
--yellow: #c9a54e;
--red: #c45c5c;
```

### Color Rules
- Sage is the only accent family.
- Use accent sparingly so it still means “important.”
- Lock states should read as calm and withheld, not greyed out to death.
- ELITE should feel rarer through composition and language, not through a new color palette.

## Layout
- **Authenticated desktop:** slim editorial rail on the left
- **Public pages:** top-aligned editorial header
- **Mobile:** bottom nav and More menu remain the primary navigation model
- **Page width expands by context:** editorial, two-column, and three-column canvases
- **Mobile mirrors desktop IA** instead of becoming a different product
- **Sections breathe**: generous vertical spacing, minimal clutter
- **Cards are editorial panels**, not generic analytics widgets
- **The rail overlays when expanded** rather than reflowing the whole canvas

### Boss Home
Boss Home is the true dashboard. It must always answer:

1. What the Boss wants from me today
2. What my score/streak state is
3. Whether I am climbing or slipping
4. What unlock I am moving toward

Required modules:
- Boss pulse hero
- score/streak/progression strip
- sprint state / next ritual
- locked or unlocked previews
- one coach whisper

### Desktop Rail Rules
- Authenticated desktop uses a collapsed rail by default with hover and focus-within expansion
- The rail should feel editorial and quiet, not like enterprise software chrome
- Use minimal iconography, strong type, soft separators, and warm surfaces
- The expanded flyout reveals context and utilities; the main canvas should only reserve the collapsed rail width
- Utilities like score, notifications, theme, and account actions belong in the rail on desktop

### Page Width Strategy
- `boss`: two-column desktop layout
- `journey`: two-column desktop layout, still closer to editorial pacing
- `squad`: broader room layout with thread, roster, and room-health separation
- `proof`: broad evidence layout with multiple proof panels
- `coach`: mainly editorial, optional narrow context column
- `settings`: moderate two-column calmness
- `admin`: broadest and densest layout in the product

## Tier Design Model
### ENTER
- Boss-first
- Solo-capable
- Proof-building
- Locked squad preview visible
- Daily rhythm dominates

### PROVEN
- Same shell, deeper social layer
- Live squad hub
- Leaderboard relevance
- Squad damage
- Session prep and follow-up
- Earned-status cues

### ELITE
- Same shell, strategic depth
- Build / council / captain / venture readiness
- Rare by posture, not by flashy treatment

### Tier UI Rules
- Do not create three different apps.
- Show what is locked, why it is locked, and what unlocks it.
- Progression should feel earned and legible.
- Avoid hard switching visual styles between tiers.

## Lock States
- Locked modules remain visible.
- Use intact layout and real copy, not blurred nonsense.
- A locked state must explain:
  - what the module is
  - why it matters
  - what unlocks it
- Locked does not mean unavailable forever. It means not yet earned.

## Status Progression
- Score, streak, and thresholds should feel like live operating truth.
- Progress bars should be restrained and purposeful.
- Red-line / threshold visuals should feel consequential, not gamified.
- Score is still special. It can be surfaced more often than before, but should retain ceremony.

## Journey and Ceremony Design
- Journey is the home of the 40-day arc.
- Rituals and ceremonies live inside the journey, not as detached pages.
- Kickoff, dip intervention, recommitment, and completion should feel like milestones on one line.
- Ceremony surfaces can feel slightly more elevated, but still inside Warm Editorial rules.

## Proof Visual Language
- Proof is evidence, not hype.
- Use calm bars, clear labels, score thresholds, badge states, leaderboard rows, and invitation logic.
- Avoid casino energy, achievement spam, or arcade metaphors.
- The proof layer should make the user feel seen, not entertained.

## Motion
- Minimal and meaningful
- Fade-up for page transitions
- Soft color transitions for theme and state changes
- Score reveal count-up remains the one expressive flourish
- Respect reduced motion

## Anti-Patterns
- Generic SaaS sidebars
- Generic SaaS stat-card grids as the main experience
- Purple, neon, or blue-primary palettes
- Glassmorphism
- Oversized rounded corners
- Multiple competing AI widgets
- Detached human/AI experiences
- Empty ghost-town social feeds pretending to be active
- Military bunker aesthetics
- “AI productivity app” visuals

## Build Guidance
- Reuse the Warm Editorial base rather than replacing it.
- When redesigning a screen, ask whether it feels like one adaptive proving ground or multiple stitched products.
- Prefer compositional boldness over visual noise.
- If a component feels generic, simplify it and make the language more intentional rather than adding decoration.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 | Warm Editorial direction chosen | Rejected generic SaaS, militant, glass, and retro treatments. Warm editorial felt premium, intimate, and durable. |
| 2026-03-24 | DM Sans promoted to primary display font | Readability won. Instrument Serif is now reserved for score-only scarcity. |
| 2026-03-24 | Sage palette locked | Calm authority, distinct from common startup palettes. |
| 2026-03-24 | Single-column posture locked as the baseline | Division Alpha should read like a private operating journal, not a spreadsheet. |
| 2026-03-24 | Light mode set as primary | The product should feel like morning review energy first, evening review second. |
| 2026-04-01 | Boss-first adaptive app locked | The app now centers on Boss, Journey, Squad, Coach, and Proof within one unified shell. |
| 2026-04-01 | Tier progression made explicit in UI | ENTER, PROVEN, and ELITE are visible as one ladder instead of disconnected future ideas. |
| 2026-04-02 | Editorial desktop rail approved | Authenticated desktop now uses a left rail and wider page-specific canvases without adopting generic dashboard UI. |
