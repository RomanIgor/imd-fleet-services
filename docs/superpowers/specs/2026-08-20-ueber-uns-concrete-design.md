# Über-uns Concrete Design Migration

## Scope

Migrate the `#ueber-uns` section of `index.html` from the old dark "Kalte Präzision" palette (navy `#1a2540` / ice-blue `#c8d8e8`) to the IMD Concrete Design System defined in `new_design_final/IMD_Concrete_Design_System_Farbpalette (1).docx`. This is the first of several remaining `index.html` sections to migrate (`#warum`, `#expertise`, `#zielgruppe`, `#rechner`, `#faq`, `#anmelden`, `#kontakt`, `.cta-sec` follow later, each with its own spec).

`schaden.html` is explicitly out of scope and must not be touched.

Content, copy, image assets, and section order stay unchanged. This is primarily a re-skin (color, background, card treatment, typography color mapping), not a restructure — the one exception is adding missing mobile stacking rules for the stat row and principle-card grid (see Responsive Behavior), since those currently have no responsive behavior at all.

## Design Tokens (from Concrete Design System spec)

```
--imd-concrete-base:      #CAC9C4
--imd-concrete-medium:    #B3B4B0
--imd-concrete-shadow:    #92938E
--imd-concrete-highlight: #E5E4DF
--imd-card-surface:       #D6D6D2
--imd-navy:               #202A3B
--imd-graphite:           #1C2228
--imd-body-text:          #4C5257
--imd-muted-text:         #777A78
--imd-border:             #9A9C99
--imd-soft-border:        #BCBDB9
--imd-blue:               #36A2C5
--imd-blue-hover:         #278FB4
--imd-status-positive:    #596B5D
```

Binding rules applied here: Concrete Base is the dominant surface; depth comes from texture/subtle brightness/lines/typography, not gradients or glow; cards are translucent (`rgba(229,228,223,.72)` + `backdrop-filter: blur(8px)`), never pure white; Navy is reserved for one accent card, not the whole section; Corporate Blue is used sparingly for the single active/positive accent.

## Background & Container

- Replace the `sec-dark` background (`var(--bg-deep)`) with a Concrete Base background scoped to `#ueber-uns`, matching the `#service`/`#prozess` pattern: `background-color: #CAC9C4` plus a subtle radial highlight (`radial-gradient(circle at 50% 10%, rgba(229,228,223,.4), transparent 32%)`). No linear gradients across the full section, no glow.
- `.wrap` width, `.ub-intro-grid` two-column layout, stat grid, and `.prinzip-card` grid keep their current dimensions and gap values. No new breakpoints are introduced.

## Component Mapping

### Photo + intro text column
- `.eyebrow-white` → Corporate Blue (`#36A2C5`) uppercase label, same weight/tracking as `.eyebrow` elsewhere on the site.
- `.h2-white` → Deep Graphite (`#1C2228`); `.h2-white em` → Corporate Blue (`#36A2C5`), matching the site-wide `.h2 em{color:var(--blue)}` convention.
- Pull-quote paragraph (currently `rgba(255,255,255,.78)` italic with `--green-l` left border) → Body Text (`#4C5257`) italic, left border Corporate Blue (`#36A2C5`).
- Remaining body paragraphs (`rgba(255,255,255,.68)`) → Body Text (`#4C5257`).
- `.ub-photo`: unchanged image/crop; box-shadow tuned to Concrete Shadow tones (`rgba(28,34,40,.14)`) instead of the current dark-section shadow.

### Founder card (Navy accent)
- `.founder-card` background → Navy (`#202A3B`), replacing `rgba(255,255,255,.06)`.
- `.founder-name` → Concrete Highlight (`#E5E4DF`); `.founder-role` → `rgba(229,228,223,.68)`.
- `.founder-quote` → `rgba(229,228,223,.82)`, left border Corporate Blue (`#36A2C5`) replacing the current `#c8d8e8` border.
- `.founder-avatar-img` border → `rgba(229,228,223,.2)` (kept subtle, same treatment tone as the rest of the site's navy cards).
- Card shadow: `0 22px 48px rgba(28,34,40,.2)`, matching `.imd-benefit-card--secondary` on `#service`.

### Kennzahlen (4-stat row)
- Replace the individual `rgba(255,255,255,.05)` cells on a dark 1px-gap grid with a single banded row on Card Surface (`#D6D6D2`), divided by `1px solid var(--imd-border)` (`#9A9C99`) between cells instead of a background gap.
- Stat numbers (`.stat-num`) → Deep Graphite (`#1C2228`), except the `+9,4%` figure which keeps an accent color, now Corporate Blue (`#36A2C5`) instead of `--green-l` (the only genuinely "positive" figure, per the docx's sparse-status-color rule).
- Stat labels → Muted Text (`#777A78`), same size/tracking/uppercase treatment as today.
- Row wrapper: `border-radius: var(--r-2xl)`, `border: 1px solid var(--imd-soft-border)`, no visible background gap (dividers only).

### "So arbeiten wir" — 3 principle cards
- `.prinzip-card` background → `rgba(229,228,223,.72)` with `backdrop-filter: blur(8px)` / `-webkit-backdrop-filter: blur(8px)`, border `rgba(154,156,153,.5)`, box-shadow `0 18px 44px rgba(28,34,40,.12)` — the same glass-card treatment as `.imd-benefit-card` on `#service`.
- `.prinzip-icon` background → `rgba(32,42,59,.08)` (Navy tint), border `rgba(32,42,59,.24)`, icon stroke color → Navy (`#202A3B`), replacing the ice-blue `rgba(200,216,232,.12)` treatment.
- `.prinzip-title` → Deep Graphite (`#1C2228`); `.prinzip-sub` → Muted Text (`#777A78`); `.prinzip-text` → Body Text (`#4C5257`).
- "So arbeiten wir" eyebrow label above the cards → same Corporate Blue uppercase treatment as the section eyebrow, replacing `rgba(255,255,255,.4)`.

## Responsive Behavior

`.ub-intro-grid` already stacks to one column at `max-width:1060px`, and `.ub-photo` already compacts at `max-width:860px` — both unchanged.

The stat row (4 columns) and the "So arbeiten wir" grid (3 columns) are currently set via inline `style="grid-template-columns:repeat(4,1fr)"` / `repeat(3,1fr)` on their wrapper `<div>`s, with no responsive override at any width today — this is a pre-existing mobile overflow gap, not something introduced by this migration. Fixing it is in scope since we're already re-skinning these two components:

- Replace the inline `grid-template-columns` on both wrappers with dedicated classes (`.ueber-stats-grid`, `.ueber-prinzip-grid`) so breakpoints can target them.
- `max-width:860px` — stat grid: 4 → 2 columns.
- `max-width:620px` — principle-card grid: 3 → 1 column.
- `max-width:480px` — stat grid: 2 → 1 column.

No horizontal overflow at any width; translucent cards must remain legible against the Concrete Base background at all breakpoints (verify contrast, not just carry the desktop values down).

## Out of Scope

- `schaden.html` — untouched.
- All other `index.html` sections (`#warum`, `#expertise`, `#zielgruppe`, `#rechner`, `#faq`, `#anmelden`, `#kontakt`, `.cta-sec`) — each gets its own future spec.
- Section order, copy, images, and grid dimensions — unchanged.
- The IMD logo — never recolored or redrawn (per docx rule).

## Verification

- Visual check at desktop (≥1060px), tablet (~860px), and mobile (~480px) widths: no dark-navy full-bleed background remains, Concrete Base is dominant, founder card is the only Navy surface, principle cards show visible glass/blur effect against the Concrete Base.
- Contrast check: Body Text (`#4C5257`) on Concrete Base (`#CAC9C4`) and Highlight text on Navy card both meet at least WCAG AA for the given text sizes.
- No horizontal overflow at any tested width.
- `schaden.html` diff is empty.
