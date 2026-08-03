# Service Editorial Composition Design

## Scope

Restructure only the composition inside `#service` below its existing hero. Preserve the current hero, image, content, typography, colors, borders, shadows, icons, and brand styling.

## Files and Components

- `index.html`
  - Keep `.imd-hero` unchanged.
  - Restructure `.imd-process-panel`, `.imd-intro-text`, and `.imd-process-grid` as one dominant full-width process composition.
  - Replace the three children of `.imd-bottom-panel` with one combined benefits block and the existing `.imd-cta-split`.
  - Merge the existing primary and secondary benefit content into one 2x2 `.imd-why-items` grid without changing text or icons.
- `style.css`
  - Update only `#service` rules for the process, benefits, CTA, and their responsive breakpoints.
  - Preserve all design tokens and existing visual values.
- `test/service-section-redesign.test.js`
  - Replace assertions for the obsolete three-card support tier with assertions for the approved process and 60/40 editorial composition.
- `main.js`
  - No change. The existing `.imd-process-grid` observer remains compatible.

## Composition

### Hero

The hero remains byte-for-byte unchanged.

### Process

The process becomes the dominant block immediately below the hero, separated by 48–64px of vertical rhythm. It uses almost the full available service content width while its internal flow is centered inside a bounded maximum width.

The existing intro copy remains in the process block. The four steps retain this order and content:

1. Meldung
2. Abholung
3. Wertgutachten
4. Auszahlung

On large desktop, the four steps form one horizontal flow. A single subtle connector runs behind the icons and labels; connector segments stop before text and never touch it. Every step has equal width, aligned icons, aligned labels, and the same description max-width. Each description is constrained to at most two visual lines. Individual step cards, borders, and shadows are not introduced.

On tablet, the process may form a connected 2x2 flow. On mobile, it becomes a single vertical connected timeline without horizontal overflow.

### Benefits and CTA

The lower tier contains exactly two sibling blocks aligned at the top:

- Benefits: approximately 60% of the row.
- CTA: approximately 40% of the row and at least 380px wide on large desktop.

The benefits block combines all four existing features under the single existing heading `Warum Unternehmen IMD wählen`. Features use a 2x2 editorial grid with identical icon sizing and alignment, title, and lighter short description. Individual benefits have no bordered containers. Whitespace provides separation; at most one subtle horizontal divider separates the two rows.

The CTA keeps the existing headline, introduction, three checkmarks, button, and one existing supporting note. It uses the stronger existing navy contrast, stays content-driven, and is not stretched to match the benefits height. The button follows the checklist with natural spacing and is not pinned to the bottom.

On tablet, Benefits and CTA stack and the CTA becomes full width. On mobile, the benefits remain 2x2 only while readable and otherwise become one column; CTA follows Benefits.

## Spacing

- Major vertical rhythm between Hero, Process, and Benefits/CTA: 48–64px.
- Main block internal padding: 32–40px.
- Desktop gap between Benefits and CTA: 24–32px.
- No forced equal heights.

## Non-Goals

- No hero redesign.
- No content replacement or new labels.
- No color, type, border, shadow, icon, image, or brand-style changes.
- No new gradients, accents, badges, decorative elements, or mini cards.
- No changes outside `#service`.

## Verification

- Structural tests confirm four process steps, a single benefits block with four items, and one CTA block.
- CSS tests confirm continuous connectors, equal step sizing, bounded widths, 60/40 desktop proportions, CTA minimum width, content-driven heights, and responsive 2x2/vertical behavior.
- Visual checks cover large desktop, tablet, and mobile, including no horizontal overflow and an unchanged hero.
