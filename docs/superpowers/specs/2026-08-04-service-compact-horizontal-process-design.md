# Service Compact Horizontal Process — Design Specification

## Scope

Refine only the composition of the existing `#service` process and lower support tier. Preserve the hero, background image, existing content, colors, typography, shadows, borders, and brand styling.

## Process Section

The process remains one continuous `imd-process-panel` block. Its desktop layout uses two rows:

1. A centered introduction containing the existing title and both existing supporting statements.
2. Four evenly distributed compact horizontal steps centered inside a `1000–1100px` internal maximum width.

The desktop panel uses `28px 32px` padding and no unnecessary vertical space. The measured rendered height must be at least 20% lower than the current desktop baseline captured before implementation.

Each step remains borderless and transparent. It uses a compact horizontal composition:

- approximately `48px` icon on the left;
- muted sequence number above the title on the right;
- `16–18px` semibold title;
- `14–15px` description immediately below the title, clamped to two lines;
- a short, subtle arrow connector between neighboring steps.

The connectors must not span the full process container and must remain visually separate from the text. No individual process cards may be introduced.

## Shared Width and Vertical Rhythm

The process panel and `imd-bottom-panel` remain children of the existing shared `imd-page` parent and use the same desktop width and identical left/right edges.

The vertical gap from the process panel to the Benefits + CTA row is exactly `24px` on desktop.

## Benefits + CTA

The lower row uses a desktop grid with:

- Benefits: `56%`;
- CTA: `44%`;
- gap: `24px`;
- top alignment without forced equal heights.

### Benefits

The existing four benefits remain in an open 2×2 editorial grid. Individual items stay borderless and transparent.

- row gap: `36px`;
- column gap: `40px`;
- icons: approximately `46px`;
- no additional cards, borders, labels, or content changes.

### CTA

The existing CTA keeps its colors, typography, content, and brand styling.

- padding: `32px`;
- headline receives enough usable width to avoid cramped wrapping;
- button spans the full content width;
- button height: `52–56px`.

## Responsive Behavior

Existing tablet and mobile stacking behavior remains intact. The compact horizontal desktop steps may adapt at current breakpoints, but must not introduce horizontal overflow. Mobile remains a readable vertical process and the CTA follows Benefits.

## Implementation Surface

- `style.css`: replace the final desktop service composition overrides for process geometry, step layout, support split, benefit spacing, and CTA sizing; adjust responsive overrides only where required to prevent desktop rules from leaking.
- `test/service-section-redesign.test.js`: update regression assertions for the approved geometry and add measurable invariants for centered intro, compact horizontal steps, shared width, `24px` rhythm, `56/44` split, and CTA/Benefits sizing.
- `index.html`: no content or hero changes are expected; markup changes are allowed only if CSS cannot express the approved number/title grouping without changing content.

## Validation

After implementation:

1. Automated tests must fail against the current layout and pass against the new layout.
2. Desktop visual measurement must confirm a process-height reduction of at least 20% from the pre-change baseline.
3. The process intro must be centered.
4. The four compact steps must be evenly distributed inside a centered `1000–1100px` area.
5. Process and lower row left/right edges must match.
6. The process-to-lower-row gap must measure `24px`.
7. The lower split must measure approximately `56/44` with a `24px` gap.
8. Tablet and mobile must have no horizontal overflow.
