# Design System — Division Alpha

## Product Context
- **What this is:** AI-orchestrated peer accountability platform. 6-week sprint squads of 6-8 operators holding each other to their declared goals.
- **Who it's for:** Driven, ambitious operators — entrepreneurs, creators, builders — who want structured accountability with teeth.
- **Space/industry:** Accountability / productivity / premium community. Parent company Oumafy (Islamic-branded).
- **Project type:** Web app (Next.js) — dashboard-first, day-contextual interface.

## Aesthetic Direction
- **Direction:** Warm Editorial — private club meets personal journal
- **Decoration level:** Intentional — subtle texture (warm grain on surfaces), restrained ornament
- **Mood:** Opening a leather-bound journal in a quiet members' lounge. Warm, focused, intimate. Not corporate, not militant, not flashy. The app feels like it respects your time and your ambition equally.
- **Reference sites:** Soho House (warmth, exclusivity, editorial typography), Focusmate (functional accountability UI), Planes Studio (editorial web design craft)

### EUREKA Insight
Every accountability app designs as a productivity TOOL (dashboards, progress bars, streaks). Division Alpha should feel like a PRIVATE JOURNAL shared with 6 people. The interface changes posture based on the day — Monday is declaration energy, Wednesday is honest check-in, Friday is reflection. The app breathes with your week.

## Typography
- **Display/Hero:** DM Sans 700 — clean, readable, premium. Used for all headings, greetings, page titles. The primary voice of the app.
- **Body:** DM Sans 400/500 — warm, readable, modern without being trendy. Carries all primary UI text.
- **UI/Labels:** DM Sans 500/600 for labels, buttons, navigation.
- **Brand mark:** DM Sans 600, uppercase, letter-spacing 0.04em — used only for "DIVISION ALPHA" in the top bar.
- **Data/Tables:** DM Mono — tabular figures, operator scores, timestamps, sprint data. Gives data a telegraph-dispatch feel.
- **Score reveal accent:** Instrument Serif — used ONLY for the Operator Score number on reveal. Its extreme rarity (one place in the entire app) makes the moment feel earned.
- **Code:** DM Mono
- **Loading:** Google Fonts CDN with `font-display: swap` and preconnect
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif&display=swap" rel="stylesheet">
  ```
- **Scale (base 16px, zoomed 1.3x):**
  - H1/Page title: 1.75rem (28px) — DM Sans 700
  - H2/Section title: 1.5rem (24px) — DM Sans 700
  - H3: 1.25rem (20px) — DM Sans 600
  - Body: 1rem (16px) — DM Sans 400
  - Small/Label: 0.8125rem (13px) — DM Sans 500 or DM Mono 400
  - Micro: 0.6875rem (11px) — DM Mono 400, uppercase tracking 0.08em

## Color

### Approach: Restrained
Color is rare and meaningful. Sage green accent used sparingly — when it appears, it matters. The palette is built on warm neutrals that feel like aged paper (light) or a dimly lit club (dark).

### Light Theme (Primary — morning journal energy)
```css
--bg: #f5f0e6;          /* warm parchment */
--bg-page: #faf7f0;     /* lightest cream */
--surface: #ede8dc;     /* card/panel background */
--border: #d8d0c0;      /* subtle warm border */
--text: #1c1a15;        /* near-black, warm */
--text-secondary: #5c5647;  /* secondary content */
--text-muted: #948d7e;  /* timestamps, hints */
--accent: #3d6b4a;      /* sage green — primary action, links */
--accent-hover: #2e5238; /* darker sage on hover */
--accent-surface: #e8f0ea; /* light sage tint for backgrounds */
--green: #3d6b4a;       /* G status */
--yellow: #b8923e;      /* Y status — warm gold */
--red: #a04040;         /* R status — muted, not alarming */
```

### Dark Theme (Secondary — evening review energy)
```css
--bg: #111110;          /* warm near-black */
--bg-page: #151514;     /* page background */
--surface: #1c1b19;     /* card/panel background */
--border: #2a2825;      /* subtle warm border */
--text: #f0ebe0;        /* warm cream text — boosted for contrast */
--text-secondary: #c0b9ab;  /* secondary content — boosted for readability */
--text-muted: #847e74;  /* timestamps, hints — boosted from #5c5955 */
--accent: #6db882;      /* brighter sage for dark bg — boosted for visibility */
--accent-hover: #82c994; /* lighter sage on hover */
--accent-surface: #1a2a1f; /* dark sage tint */
--green: #5a9a6e;
--yellow: #c9a54e;
--red: #c45c5c;
```

### Semantic Colors
- **Success/Green:** Check-in on track — `--green`
- **Warning/Yellow:** At risk, needs attention — `--yellow`
- **Error/Red:** Off track, missed — `--red`
- **Info:** Uses `--accent` (sage green)

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable — generous whitespace, breathing room between sections
- **Global scale:** `zoom: 1.3` on body (30% increase, the "new normal")
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px) 4xl(96px)
- **Section spacing:** 3xl–4xl between major sections
- **Card padding:** lg–xl internal padding
- **Content max-width:** 660px (single-column, journal-like)

## Layout
- **Approach:** Single-column editorial — NOT dashboard grid
- **No persistent sidebar.** Navigation is a collapsed menu (hamburger or minimal icon row).
- **Max content width:** 660px centered — feels like a journal page, not a spreadsheet
- **Day-contextual posture:** The home view changes based on the sprint day:
  - Monday: Declaration energy — large Instrument Serif header, goal entry
  - Wednesday: Check-in energy — per-goal G/Y/R status cards
  - Friday: Reflection energy — summary, reflection prompt, squad highlights
- **Squad view:** Activity feed (who declared what, who checked in), NOT a roster grid with avatars
- **Score:** Hidden by default. Revealed by deliberate gesture (tap/click the crest). Operator Score is earned, not displayed.
- **Border radius:** Minimal — 4px for cards/inputs, 2px for small elements, 0 for full-bleed sections. No bubbly rounded corners.

## Motion
- **Approach:** Minimal-functional — motion serves comprehension, not decoration
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` for entrances, `ease-in-out` for state changes
- **Duration:** micro(80ms) short(150ms) medium(300ms) long(500ms)
- **Entrance:** Subtle fade-up (opacity 0→1, translateY 8px→0) on page transitions
- **Theme toggle:** Background/color transitions 300-400ms for smooth light↔dark switch
- **Score reveal:** The one expressive moment — score number counts up on reveal
- **Reduced motion:** Respect `prefers-reduced-motion: reduce`

## Key Design Principles

1. **One font, many weights.** DM Sans carries the entire app. Instrument Serif appears ONLY for the Operator Score number — one place in the entire product. That extreme rarity makes the score reveal feel earned.
2. **Day-contextual UI.** The app knows what day it is. It presents what matters NOW, not everything at once.
3. **Journal, not dashboard.** Single column, generous spacing, real sentences — not a grid of widgets.
4. **Earned, not displayed.** Operator Score is hidden. You choose to look. Status is something you hold, not something that shouts.
5. **Warm, not cold.** Every surface has warmth — cream not white, warm black not pure black, sage not neon.
6. **No AI slop.** No purple gradients, no glassmorphism cards, no 3-column icon grids, no gradient buttons, no decorative blobs.

## Anti-Patterns (Never Use)
- Persistent sidebar navigation
- Dashboard grid layouts with stat cards
- Purple/violet accents or gradients
- Glassmorphism or frosted glass effects
- Rounded corners > 8px (no bubbly UI)
- Agent/AI boxes showing all 5 agents at once — surface ONE coach insight as a whisper
- Squad displayed as avatar roster grid
- Operator Score visible by default
- CRT scanlines, retro terminal effects, Art Deco borders
- Military/bunker/militant aesthetic or language

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 | Warm Editorial direction chosen | Researched Soho House, Focusmate, premium club spaces. Rejected 4 prior attempts (generic SaaS, militant, glassmorphism, retro terminal). Warm editorial = private journal + members club. |
| 2026-03-24 | Instrument Serif + DM Sans + DM Mono | Initial typography system. Instrument Serif for ritual scarcity, DM Sans for warm readability, DM Mono for data telegraph feel. |
| 2026-03-24 | DM Sans promoted to primary display font | User found Instrument Serif hard to read in headings. DM Sans 700 is cleaner and more readable. Instrument Serif demoted to score reveal only — one place in the entire app. |
| 2026-03-24 | Sage green accent (#3d6b4a / #5a9a6e) | Calm authority, nature/growth association, distinct from typical SaaS blue/purple. Works in both light and dark. |
| 2026-03-24 | Day-contextual UI | EUREKA: accountability apps design as tools, Division Alpha should feel like a private journal that breathes with your week. |
| 2026-03-24 | 30% global zoom (zoom: 1.3) | User's strong preference — everything felt too small at default scale. Applied as zoom on body for uniform scaling. |
| 2026-03-24 | Light mode as primary | Morning journal energy. Dark mode available but light is the default experience. |
| 2026-03-24 | v7 prototype complete | 10 screens: home, declare, check-in, reflect, squad, coach, score (overlay), kickoff, completion, onboarding. All following DESIGN.md. |
| 2026-03-24 | Landing page built | Public-facing page with hero, rhythm section, AI agents, testimonials, pricing tiers, FAQ, sprint calendar with scarcity. Links to v7 app for application flow. |
| 2026-03-24 | Dark mode contrast fix | Dark mode text-secondary bumped from #9a9488 to #c0b9ab, text-muted from #5c5955 to #847e74, accent brightened to #6db882 for better readability. |
