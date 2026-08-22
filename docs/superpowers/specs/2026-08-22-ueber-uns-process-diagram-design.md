# Über-uns Process Diagram Redesign

## Scope

Restructure the `#ueber-uns` section of `index.html` — currently a headline/quote/3-paragraph intro plus an office photo, a founder-card, a 4-stat row, and a 3-card "So arbeiten wir" block (all just migrated to the Concrete Design System in `docs/superpowers/specs/2026-08-20-ueber-uns-concrete-design.md`) — into a new layout modeled on a reference mockup: headline/quote/3 icon-paragraphs on the left, a process diagram + car photo on the right, and a 4-item benefits band across the bottom.

This supersedes the founder-card/stat-row/"So arbeiten wir" structure from the prior spec, which is removed entirely. The headline, quote, and the wording of the 3 paragraphs carry over unchanged from the current implementation — only their presentation (icons, bold emphasis) and surrounding structure change.

`schaden.html` is out of scope and must not be touched. No other `index.html` section (`#warum`, `#expertise`, `#zielgruppe`, `#rechner`, `#faq`, `#anmelden`, `#kontakt`, `.cta-sec`) may be modified.

## Reference

Mockup: `C:\Users\roman\Downloads\ChatGPT Image Aug 22, 2026, 07_59_56 PM.png`. The mockup uses a green/navy palette; this spec maps its green accent to the project's Corporate Blue (`#36A2C5`) and keeps the rest of the already-established Concrete Design System (Concrete Base `#CAC9C4`, Navy `#202A3B`, Deep Graphite `#1C2228`, Body Text `#4C5257`, Muted Text `#777A78`).

## Content Removed

- The office photo (`design-assets/about-office.jpg`, `.ub-photo`/`.ub-photo-col`) — removed entirely, no replacement location.
- The founder card (Mischa Markosyan photo, name, role, quote) — removed entirely.
- The 4-stat row (500+ / +9,4% / 24h / 0€) — removed entirely.
- The "So arbeiten wir" 3-card block (Transparenz / Verlässlichkeit / Effizienz) — removed entirely, replaced by the new 4-item benefits band (see below).

## Content Carried Over Unchanged (wording only — presentation changes)

- Eyebrow: "Warum wir IMD Fleet Services gegründet haben"
- Headline: "Nicht Fahrzeuge vermitteln." / "Prozesse abnehmen." (unchanged `<em>` structure)
- Pull-quote: „Der Verkauf eines Dienstwagens sollte für Ihr Unternehmen nicht mehr als wenige Minuten Aufwand bedeuten. Genau dafür wurde IMD Fleet Services gegründet."
- Paragraph 1 (people icon): "Wir kennen die Herausforderungen unserer Kunden aus eigener Erfahrung. Die Gründer von IMD Fleet Services verfügen über **langjährige Erfahrung im Fuhrparkmanagement, im professionellen Fahrzeughandel sowie in der Digitalisierung von Geschäftsprozessen**. Über viele Jahre haben wir erlebt, wie viel Zeit und Ressourcen Unternehmen für den Verkauf einzelner Dienstwagen oder ganzer Fuhrparkbestände aufwenden müssen."
- Paragraph 2 (clock icon): "Dabei wurde uns immer wieder bewusst: Unternehmen benötigen keinen weiteren Fahrzeugankäufer. Unternehmen benötigen einen Partner, der ihnen **den gesamten Verkaufsprozess abnimmt**. Aus dieser Überzeugung entstand IMD Fleet Services."
- Paragraph 3 (target icon): "Unser Ziel ist nicht, Fahrzeuge zu vermitteln. Unser Ziel ist nicht, Unternehmen in zusätzliche Verkaufsprozesse einzubinden. Unser Ziel ist es, Dienstwagenankauf für Unternehmen so einfach wie möglich zu machen: **Digital melden. Direkt an IMD verkaufen. Den Rest übernehmen wir.**"

The bold spans above are new (per the mockup's emphasis treatment) — the words themselves are unchanged, only wrapped in `<strong>`. "IMD" in the third paragraph's bold span gets the Corporate Blue accent color (matching the mockup's green "IMD" highlight), consistent with the project's sparse-blue-accent rule.

## New Content (verbatim from the mockup)

**Process diagram:**
- Origin node: "Ihr Fuhrpark" — "Ein Fahrzeug. Viele Aufgaben. **Ihr Aufwand.**"
- Center: IMD logo, using the existing `logo_dark.png` asset (the dark/navy-on-transparent variant, already used elsewhere against light backgrounds, e.g. the mobile nav logo) unmodified — the logo itself is never recolored or redrawn.
- Step 1 — Bewertung: "Marktgerechte Bewertung in wenigen Stunden."
- Step 2 — Abholung: "Bundesweite Abholung zum Wunschtermin."
- Step 3 — Abmeldung: "Stilllegung und Abmeldung übernehmen wir."
- Step 4 — Auszahlung: "Schnelle und sichere Auszahlung."

**Car photo:** `assets/icons/blue-car-speed-motion-stretch-style.jpg`, contained (rounded corners, shadow), not bled/layered behind the diagram like the mockup — this photo's style (blue hatchback, motion-blur) doesn't suit that treatment; a clean contained panel matches the site's existing photo treatment better (as used by the now-removed `.ub-photo`).

**Benefits band (4 columns, replaces "So arbeiten wir"):**
- Zeit sparen: "Verkauf Ihres Fuhrparks in wenigen Minuten Aufwand."
- Risiken reduzieren: "Rechtssichere Abwicklung durch einen erfahrenen Partner."
- Ressourcen schonen: "Wir übernehmen den gesamten Prozess für Sie."
- Nachhaltig handeln: "Fahrzeuge optimal verwerten. Ressourcen verantwortungsvoll nutzen."

## Layout

**Desktop (≥1060px, matching existing section breakpoints):**
- Two-column row: left column (headline, quote, 3 icon-paragraphs, full width now that the office photo is gone) and right column (process-diagram card stacked above the car-photo card).
- Full-width benefits band below the two-column row, 4 equal columns.

**Icons** (new; 24×24 viewBox inline stroke SVGs, `stroke="currentColor"`, in a circular Corporate-Blue-outlined badge on a Highlight-tint background — matching the existing `.prinzip-icon` treatment from the prior Concrete migration): people, clock, target (paragraph icons — clock is reused verbatim for "Zeit sparen"), building (Ihr Fuhrpark), document-pencil (Bewertung), tow-truck (Abholung), document-check (Abmeldung), euro-coin (Auszahlung), shield-check (Risiken reduzieren), bar-chart (Ressourcen schonen), leaf (Nachhaltig handeln).

**Connectors:** inline SVG `<path>` with `stroke-dasharray` in Corporate Blue, one dashed line from the center IMD node to each of the 4 step nodes — matching the mockup's curved dashed-line style. Implemented as SVG (not CSS borders) for accurate curved/angled lines and consistency with the site's existing inline-SVG icon convention.

**Cards:** process-diagram card and car-photo card both use the established translucent glass treatment (`rgba(229,228,223,.72)` + `backdrop-filter:blur(8px)`, soft border, soft shadow) already used by `.prinzip-card` from the prior migration — not pure white, per the binding Concrete Design System rule. The IMD logo's own circular background stays neutral (Concrete Highlight or white), since the logo must never be recolored.

## Responsive Behavior

Reuse the section's already-established breakpoints (1060px / 860px / 620px / 480px):

- **≤1060px:** Right column (diagram + car photo) moves below the left column (text), full width.
- **Process diagram on mobile:** collapses to a vertical flow — Ihr Fuhrpark → IMD → step 1 → step 2 → step 3 → step 4 — with a single vertical dashed connector, mirroring how `#service`'s process already collapses to a vertical flow with short arrows at narrow widths.
- **Benefits band:** 4 columns → 2×2 at ≤860px → 1 column at ≤480px, consistent with how the prior migration's stat-row collapsed (with correct divider/border handling this time — see Verification).
- No horizontal overflow at any breakpoint.

## Out of Scope

- `schaden.html` — untouched.
- All other `index.html` sections — untouched.
- The IMD logo — never recolored or redrawn.
- Section id (`#ueber-uns`), its Concrete Base background/token setup (`--ueber-*` custom properties), and the `.eyebrow`/`.h2`/`.h2 em` scoped color rules from the prior migration — these stay as already implemented and are extended, not replaced.

## Verification

- Visual check at desktop (≥1060px), tablet (~860px), and mobile (~480px): two-column layout collapses correctly, process diagram becomes vertical on mobile, car photo stays contained (never bleeds/overflows), benefits band stacks correctly at each breakpoint with no dangling/doubled divider borders (explicitly re-check border-reset specificity against the base divider rule, since this exact class of bug was found and fixed in the prior migration).
- Confirm all carried-over paragraph text is byte-identical aside from the added `<strong>` wrapping.
- Confirm the IMD logo asset is used unmodified (no recoloring filters applied to it, unlike the other icons which do use `currentColor`/color filters).
- `schaden.html` diff is empty.
- No other `index.html` section's markup or CSS changes.
