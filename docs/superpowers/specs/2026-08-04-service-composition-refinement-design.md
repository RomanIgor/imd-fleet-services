# Service Composition Refinement Design

## Scope

Refine only the spacing, proportions, and visual hierarchy of the existing `#service` composition. Preserve the approved order and all existing hero, background, palette, typography, copy, icons, borders, shadows, and brand styling.

The structure remains:

1. Hero
2. Full-width process
3. Benefits and CTA

No new cards, gradients, colors, content, or decorative elements will be introduced.

## Implementation Approach

Use a scoped CSS-only refinement in the existing `/* Service editorial composition */` layer. Do not change the service HTML. Step numbers will be generated with CSS counters so the source content remains unchanged.

## Desktop Composition

### Process

- Keep the process container at `min(1360px, 100%)`.
- Reduce its total height from roughly 311px to approximately 240–250px.
- Use approximately 24px vertical padding and 32px horizontal padding.
- Reduce the intro-to-flow gap to approximately 20px.
- Increase process icons from 48px to 52px.
- Keep titles and descriptions close: approximately 4px between them.
- Preserve equal-width process steps and equal description widths.
- Remove the continuous line behind the icons.
- Use short, subtle arrows only between adjacent steps.
- Add `01`, `02`, `03`, and `04` before the corresponding step titles through CSS counters.

### Width and rhythm

- Set the lower Benefits + CTA container to the same `min(1360px, 100%)` width as the process container.
- Keep matching left and right edges.
- Control section rhythm explicitly: approximately 56–64px between Hero and Process, and 36px between Process and the lower row.
- Avoid a single uniform page gap when it prevents these distinct relationships.

### Benefits

- Preserve the open 2x2 layout.
- Keep individual benefits borderless.
- Increase icons from 42px to approximately 46px.
- Increase icon-to-text spacing to approximately 16–18px.
- Strengthen title hierarchy without changing the typeface or color.
- Preserve all existing descriptions because the content must remain unchanged.

### CTA

- Keep the lower composition at approximately 60% Benefits / 40% CTA.
- The shared 1360px container increases the CTA width without breaking the approved proportion.
- Increase internal padding to approximately 40px.
- Increase the headline spacing below it.
- Increase the button height to approximately 54px.
- Keep the CTA content-driven and top-aligned; do not force equal height with Benefits.

## Responsive Behavior

### Tablet

- Keep the four process steps in one horizontal flow while readable.
- Replace the continuous line with short arrows between adjacent steps.
- Stack Benefits above CTA at full width.
- Maintain a compact process container with reduced padding.

### Mobile

- Keep the vertical process timeline.
- Remove the continuous vertical line.
- Use short downward arrows between adjacent steps.
- Keep the numbered titles and existing content.
- Stack Benefits in one column at narrow widths and place CTA afterward.
- Prevent horizontal overflow.

## Verification

- Automated CSS/markup tests must prove the shared 1360px alignment, compact process spacing, discontinuous connectors, counters, Benefits styling, CTA sizing, and responsive rules.
- Browser verification will measure containment, width alignment, 60/40 desktop proportions, Process-to-lower-row spacing, and horizontal overflow at desktop, tablet, and mobile widths.
- The hero markup and computed branded surfaces must remain unchanged.
