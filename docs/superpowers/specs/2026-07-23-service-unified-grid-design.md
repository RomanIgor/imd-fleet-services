# Service Unified Grid Design

**Status:** Approved by user on 2026-07-23

## Goal

Make the desktop service composition orderly and proportional while preserving the dark showroom photograph, central embossed IMD logo, approved palette, readable typography, tablet layout, and mobile layout.

## Desktop composition

At `min-width:1260px`, all three content rows share one centered `1180px` maximum-width axis.

1. Opening row: a `420px` message card, a flexible central logo opening, and a `300px` cost card. Both cards align to the top rather than vertically centering against each other.
2. Process row: the introduction and four steps remain one coherent band. The introduction track is reduced to content width, while the four steps divide the remaining space evenly.
3. Closing row: benefits and CTA use the same outer axis. Neither child stretches to the height of its neighbor; each card is content-driven and top-aligned.

## Density

- Remove unnecessary `min-height` values from desktop process steps and benefit rows.
- Use padding for readable rhythm rather than empty vertical volume.
- Keep body copy at `15px`, metadata and tags at `12px`, and interactive targets at least `48px`.
- Preserve the concise tag labels and prevent text overflow.

## Visual hierarchy

- The showroom photograph and embossed IMD logo remain the signature visual.
- Navy identifies the primary message and CTA.
- Concrete cards remain quiet supporting surfaces.
- Shared edges and consistent gaps replace the previous floating-card arrangement.

## Responsive behavior

- The unified grid applies only from `1260px`.
- The existing `1121–1259px`, tablet, and mobile compositions remain unchanged.
- No fixed section height, clipping, hidden content, or horizontal overflow is permitted.

## Verification

- Inspect at `1904×957` and `1920×1080`.
- Confirm shared left/right axes, top alignment, visible central logo, and content-driven card heights.
- Confirm every tag has `scrollWidth <= clientWidth`.
- Run the focused comparison, opening-color, and service-section test suites plus JavaScript syntax and diff checks.
