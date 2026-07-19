# Service Section Professional Redesign

**Date:** 2026-07-19  
**Scope:** Homepage section `#service` only  
**Status:** Approved design, pending specification review

## Objective

Redesign the Fahrzeugverkauf service section so it feels professional, modern, and clearly structured while remaining faithful to the official IMD Concrete Design System. The redesign must correct the current flat, compressed, administrative appearance without changing the section's business content or application behavior.

## Design Authority

The binding source for color decisions is:

`new_design_final/IMD_Concrete_Design_System_Farbpalette (1).docx`

Required core tokens:

- Concrete Base: `#CAC9C4`
- Concrete Medium: `#B3B4B0`
- Concrete Highlight: `#E5E4DF`
- Card Surface: `#D6D6D2`
- IMD Navy: `#202A3B`
- Deep Graphite: `#1C2228`
- Body Text: `#4C5257`
- Muted Text: `#777A78`
- Border: `#9A9C99`
- Soft Border: `#BCBDB9`
- Corporate Blue: `#36A2C5`
- Hover Blue: `#278FB4`

Target color distribution is approximately 55% Concrete Base, 20% Concrete Highlight/Card Surface, 15% Navy/Graphite, 7% secondary concrete tones, and no more than 3% blue and status colors combined.

## Visual Direction

Use a hybrid editorial composition:

- Maintain Concrete Base as the continuous section background and allow the real concrete texture to remain visible.
- Avoid a uniform pale overlay that washes out the texture and hierarchy.
- Use one strong Navy narrative panel as the primary anchor.
- Use Card Surface for the secondary full-service/cost panel.
- Place the four process steps in one coherent horizontal process band.
- Present the four company benefits as lightweight editorial items rather than a dense administrative card grid.
- Keep the CTA visually distinct in Navy, with Corporate Blue reserved for hover, focus, links, and the active process state.
- Do not use decorative glow effects or strong gradients.
- Do not recolor, redraw, or reinterpret the official IMD logo.

## Desktop Composition

### 1. Opening Area

The upper area uses an asymmetrical two-column composition:

- Left: a Navy primary panel containing the eyebrow, headline, supporting paragraph, and existing capability tags.
- Right: a Card Surface full-service panel containing the cost-free headline, checklist, and legal note.
- The embossed background logo remains visible in the center field and functions as environmental branding, not as a competing content block.

The primary panel must have the strongest hierarchy. The secondary panel must be smaller and visually quieter.

### 2. Process Band

The existing introduction and four process steps become one dedicated band below the opening area:

- The introduction occupies a compact leading column.
- Four steps follow with consistent icon, title, and description alignment.
- Directional connectors remain subtle and must not compete with content.
- Each step must feel interactive only if it is actually interactive.
- Corporate Blue is used only for an active or focused state, not as general decoration.

### 3. Benefits and CTA

The lower area is divided into:

- A benefits region with four compact editorial benefit items and reduced container chrome.
- A Navy CTA panel with one primary action and concise supporting evidence.

The benefits must not resemble a spreadsheet or dashboard table. Use spacing, typography, and restrained dividers instead of a boxed grid wherever possible.

## Responsive Composition

Do not shrink the desktop layout into a miniature version.

Mobile reading order:

1. Primary message
2. Full-service/cost panel
3. Process introduction and steps
4. Benefits
5. CTA

Requirements:

- Single-column flow below the existing mobile breakpoint.
- Horizontal process steps become a clear vertical sequence.
- No content clipping, horizontal scrolling, or fixed-height compression.
- Section height is content-driven. It is acceptable for the section to exceed one viewport.
- Keep existing navigation and application behavior unchanged.

## Typography and Density

- Main service headline: `40–48px` desktop, `30–34px` mobile.
- Section/subsection headings: `18–24px` depending on hierarchy.
- Body copy: minimum `15px`, preferably `16px` for primary explanatory text.
- Metadata and legal notes: minimum `12px` when essential; avoid the current `9–11px` content text.
- Primary CTA height: minimum `48px` desktop and `44px` mobile.
- Maintain readable line lengths and avoid narrow columns containing long paragraphs.
- Use spacing to create hierarchy; do not compress the full section into one viewport.

## Accessibility and Interaction

- Normal text contrast must meet WCAG 2.2 AA minimum `4.5:1`.
- Large text must meet at least `3:1`.
- Important interactive targets should be at least `44px` high; no target may violate the WCAG `24×24px` minimum or spacing alternative.
- Keyboard focus must remain clearly visible with an indicator of at least `2px` and sufficient contrast.
- Hover must never be the only way to expose information.
- Meaning and state must not be communicated by color alone.
- Respect `prefers-reduced-motion` for any retained animations.

## Content and Behavior Constraints

- Preserve the existing German copy, claims, footnote, links, and their destinations.
- Preserve the four process steps and four benefits.
- Preserve the official logo and existing local icon assets.
- Do not add JavaScript unless a verified interaction requirement makes it necessary.
- Do not change other homepage sections as part of this redesign.
- Do not modify the untracked `new_design_final/` source folder.

## Implementation Boundary

The preferred implementation is a scoped `#service` CSS redesign. HTML changes are allowed only when needed to establish semantic grouping or remove layout-only wrappers that block the approved composition. Any HTML edit must preserve content and behavior. Existing obsolete `#service` override layers should be consolidated where safely possible so the final cascade is understandable and predictable.

## Verification

Automated checks must confirm:

- Official palette tokens are used.
- The stylesheet cache key is updated.
- No existing comparison-section regression tests break.
- No JavaScript syntax errors are introduced.
- Git diff contains no whitespace errors.

Visual review sizes:

- Desktop: `1920×900` to match the reported failure.
- Standard desktop: `1440×900`.
- Mobile: `390×844`.

Visual acceptance criteria:

- Strong, immediate hierarchy.
- Concrete texture remains visible.
- No washed-out all-grey appearance.
- No tiny content text.
- No dense administrative grid appearance.
- CTA is obvious without excessive blue.
- Mobile is deliberately composed rather than scaled down.
