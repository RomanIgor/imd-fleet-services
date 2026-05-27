# IMD Homepage Operational Redesign Design

Date: 2026-05-27

## Goal

Rebuild the public homepage so IMD Fleet Services presents as a serious B2B fleet operations partner, not a generic AI-generated SaaS landing page.

The homepage must primarily convince Fuhrparkleiter / fleet managers. It should communicate operational control, reduced coordination effort, reliable process handling, and documented workflows across Schadenmanagement, vehicle outphasing, and fleet purchase.

## Positioning

Primary positioning:

> IMD Fleet Services is a Fleet Operations partner for damage handling, vehicle outphasing, and fleet purchase.

The site should no longer look like a single-purpose vehicle purchase funnel. Flottenankauf and Schadenmanagement remain important services, but they sit under a broader operational promise.

Primary audience:

- Fuhrparkleiter / fleet managers

Secondary audience:

- Managing directors and owners who need trust, cost control, and reduced operational risk

## Selected Visual Direction

Use the "Operational Minimal" direction:

- calm, dense, structured B2B interface
- more like an operations control surface than a marketing landing page
- low visual noise, clear hierarchy, less decoration
- sober confidence instead of exaggerated SaaS polish

Avoid:

- emoji-based icons
- glossy decorative icon cards on the homepage
- fake-looking metrics and overconfident badges
- large gradient hero treatments
- floating dashboard cards that feel generic
- excessive shadows, rounded pills, and repeated checkmarks

## Scope

This phase rebuilds the public homepage only.

In scope:

- `index.html` public landing content
- `style.css` homepage styles
- homepage navigation anchors
- homepage CTA paths
- homepage form presentation, while preserving current submission behavior

Out of scope for this phase:

- admin dashboard redesign
- `schaden.html` redesign
- driver login flows
- database schema
- backend route behavior
- email behavior

## Homepage Structure

### 1. Header

Keep the header simple and operational.

Content:

- IMD Fleet Services logo
- navigation: Leistungen, Prozess, Schadenmanagement, Fahrzeugankauf, Kontakt
- primary action: "Prozess starten"

Avoid crowded badges or promotional copy in the nav.

### 2. Hero

Replace the current gradient/card-heavy hero with a structured operational hero.

Proposed headline:

> Fleet Operations fuer Schaden, Aussteuerung und Fahrzeugankauf.

Supporting copy:

> IMD uebernimmt die operativen Schritte rund um Firmenfahrzeuge: Schadenannahme, Fahrerkommunikation, Gutachten, Abholung, Dokumentation und Ankauf.

Primary CTA:

- "Flottenprozess starten" scrolls to the contact/form section

Secondary CTA:

- "Schaden melden" links to `/schaden` or the current damage-report entry route

Right-side visual:

- an "operations board" panel, not a decorative dashboard mockup
- rows such as:
  - Schadenfall: Fahrer informiert, Unterlagen offen
  - Gutachten: Termin geplant
  - Aussteuerung: Abholung bereit
- use status labels sparingly and realistically

### 3. What IMD Takes Over

Three service columns:

1. Schadenmanagement
   - Fahrerkommunikation
   - Schadenaufnahme
   - Werkstatt-/Partnerkoordination
   - Statusuebersicht

2. Fahrzeugaussteuerung & Ankauf
   - Abholung
   - Vorbereitung
   - Gutachten
   - Angebot und Auszahlung

3. Dokumente & Prozesskontrolle
   - revisionsfaehige Unterlagen
   - klare Zustaendigkeiten
   - weniger Rueckfragen
   - nachvollziehbarer Prozessstatus

Use restrained icons or small labels. The content should feel like operational responsibilities, not marketing feature cards.

### 4. Workflow

Use a compact 4-step process:

1. Fahrzeug oder Schaden wird gemeldet
2. IMD prueft Daten und koordiniert den naechsten Schritt
3. Gutachten, Werkstatt, Abholung oder Ankauf werden gesteuert
4. Status, Dokumentation und Abschluss werden sauber uebergeben

The workflow should be static and readable. No large animated explainer is required in this phase.

### 5. Why Fleet Managers Use IMD

Use a dense proof section focused on operational outcomes:

- less internal coordination
- one accountable process partner
- documented decisions and statuses
- faster handling for drivers and vehicles
- fewer fragmented emails and phone calls

Avoid inflated statistics unless they are real and defensible.

### 6. Contact / Start Form

Keep the existing form behavior, required fields, and `/submit` endpoint.

Update presentation:

- tighter form layout
- sober section title
- no over-decorated card styling
- clear field labels
- CTA wording aligned with the new positioning, such as "Prozess anfragen"

### 7. Footer

Simplify the footer:

- company identity
- service links
- contact details
- legal links where already present

Avoid decorative badges unless they are factual and necessary.

## Typography

Use a mature, operational sans-serif direction.

Preferred approach:

- no external font dependency in the first implementation
- use a strong local system stack, for example:
  - `Aptos`
  - `Segoe UI`
  - `Helvetica Neue`
  - `Arial`
  - `sans-serif`

If a web font is later approved, consider IBM Plex Sans because it fits technical B2B interfaces. Do not add a new external dependency in this phase unless explicitly chosen during implementation review.

## Icon System

Homepage icons should be restrained and functional.

Rules:

- remove emoji icons from public homepage UI
- avoid glossy 3D icon treatment on homepage
- use simple inline SVG or CSS line icons where needed
- icons must support scanning, not decoration

The existing IMD Icon System in `schaden.html` remains untouched in this phase.

## Color and Shape

Use:

- off-white / light grey page background
- white content surfaces
- dark navy or ink for primary text and main blocks
- muted grey borders
- green only for status and confirmation
- amber only for warning/pending states

Reduce:

- large blue gradients
- strong decorative shadows
- heavy rounded pills
- one-note blue SaaS palette

Cards and panels should use small radii and thin borders.

## Content Tone

Use German copy that is concise, operational, and concrete.

Good tone:

- "IMD koordiniert Fahrer, Gutachten, Werkstatt und Abholung."
- "Status und Unterlagen bleiben nachvollziehbar."
- "Ein Ansprechpartner fuer wiederkehrende Fuhrparkprozesse."

Avoid:

- exaggerated claims
- artificial urgency
- generic SaaS phrases
- vague value props such as "digital, schnell, transparent" without operational context

## Technical Constraints

The app is a server-rendered static frontend served by Express.

Implementation should:

- keep current route behavior
- avoid new frontend build tooling
- avoid new runtime dependencies
- preserve existing form submission logic in `main.js`
- avoid touching unrelated dashboard and driver flows
- work on desktop and mobile

## Verification

Before completion:

- run a syntax/static check appropriate for changed files
- start the local server if environment variables allow it
- inspect the homepage at desktop and mobile widths
- verify that homepage navigation anchors work
- verify that the contact form still submits to the existing handler, or explain if live submission cannot be tested due to missing credentials

## Open Decisions For Implementation

These are intentionally small implementation choices:

- exact final German copy may be refined while editing the homepage
- final icon style can be CSS-only or inline SVG, as long as it remains restrained
- current long sections may be removed if their content is replaced by the new homepage structure
