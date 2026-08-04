# Service Connection and Proportion Refinement

## Scope

Refine the approved Service composition without changing its structure:

1. Hero
2. Full-width process
3. Benefits and CTA

The hero, background image, palette, typography, card styling, and existing content remain unchanged.

## Process flow

- Keep the four process steps inside one continuous, borderless composition.
- Connect adjacent icons with short, subtle horizontal line segments that end in a minimal arrowhead.
- Render connectors behind the icon and label content, never through text.
- Reuse the existing `--service-body` color at reduced opacity; introduce no new color token.
- Preserve equal four-column spacing and the existing ordered step labels.
- On mobile, retain a light vertical connection between adjacent steps with no horizontal overflow.

## Process width and introduction

- Keep the process card at the current full content width of `min(1360px, 100%)`.
- Center the four-step grid inside an internal maximum width of `1040px`.
- Increase the process introduction heading from its current treatment to `23px` on large desktop.
- Increase the heading's bottom spacing while keeping the supporting text at its existing lighter body treatment.
- Do not change the introduction copy.

## Section rhythm

- Reduce the desktop gap between the process card and the Benefits/CTA row from `36px` to `26px`.
- Preserve the existing section order and the hero-to-process spacing.
- Keep the lower row aligned to the same outer `1360px` width as the process card.

## Benefits and CTA proportions

- Change the desktop lower row to `58fr / 42fr`, matching the requested approximate 58/42 proportion.
- Keep both blocks top-aligned and independently sized; do not force equal heights.
- Preserve the open 2x2 Benefits layout and all existing benefit content.
- Increase CTA padding from `40px` to `44px` on large desktop.
- Increase the primary button minimum height from `54px` to `58px` while preserving its existing color, typography, and content.

## Responsive behavior

- Large desktop uses the 58/42 split and centered `1040px` process grid.
- Tablet continues to stack Benefits above the full-width CTA.
- Mobile retains the vertical process flow, single-column lower sections, and no horizontal overflow.
- Existing responsive typography and content remain unchanged unless explicitly specified above.

## Verification

- Static tests assert the process width, connector treatment, intro hierarchy, `26px` lower gap, 58/42 split, CTA padding, and button height.
- The full automated suite must remain green.
- JavaScript syntax and `git diff --check` must pass.
- Browser inspection should confirm equal process spacing, matching outer edges, top alignment, and no overflow at desktop, tablet, and mobile widths.
