# Service Reference Grid Design

## Goal

Rearrange the existing `#service` content to match the supplied reference composition without introducing new marketing content.

## Desktop composition

The section uses three horizontal tiers:

1. Opening tier
   - Existing primary message card on the left.
   - A deliberately empty central track exposing the embossed IMD showroom logo.
   - Existing cost/full-service card on the right.
2. Process tier
   - One full-width light concrete rail.
   - Existing introduction on the left and the existing four process steps in a single row.
3. Support tier
   - Three aligned cards with consistent height and gaps.
   - Existing benefits are divided between the left and right cards.
   - Existing CTA content occupies the center card.

No new benefit, claim, process step, or action is added.

## Visual rules

- Preserve the dark showroom photograph and the approved IMD concrete/navy palette.
- Keep the photograph's central logo unobstructed in the opening tier.
- Match the reference's compact card proportions, modest corner radii, and disciplined spacing.
- Avoid oversized empty surfaces, overlapping icons, clipped copy, or horizontal overflow.
- Keep body copy readable; compactness comes from layout and spacing rather than illegibly small text.

## Responsive behavior

- At wide desktop sizes, use the three-tier reference grid.
- At intermediate desktop/tablet sizes, retain the same information hierarchy while allowing the lower cards to wrap.
- On mobile, stack the same content in reading order: primary message, cost card, process, benefits, CTA, remaining benefits.
- Existing focus states, reduced-motion behavior, and accessible semantics remain intact.

## Acceptance criteria

- The desktop layout visibly matches the supplied reference arrangement.
- Only existing page content is used.
- The showroom logo remains visible between the two opening cards.
- The process rail displays all four steps without clipping.
- The bottom tier contains three balanced cards: benefits, CTA, benefits.
- No text or icon overlap occurs at the tested desktop and mobile breakpoints.
- Automated regression tests and browser geometry checks pass.
