# Service Section Viewport Compaction

## Objective

Compact the desktop `#service` section so its complete content fits inside the usable area of a 1920×1080 viewport: the viewport less the real 72px fixed navigation, without vertical scrolling. Preserve the approved IMD concrete palette, information hierarchy, and readable typography.

## Scope

- Desktop service section only: opening pair, process band, benefits panel, and CTA panel.
- Repair the overlapping icons in the benefits panel.
- Preserve the existing tablet and mobile stacked layouts unless a shared structural fix requires a compatible adjustment.
- Do not change copy, palette tokens, navigation, following sections, or business behavior.

## Layout

At desktop widths of at least 1101px, the service section uses three compact rows:

1. Opening row: primary navy message card and cost card.
2. Process row: one coherent horizontal process band.
3. Closing row: benefits and CTA side by side.

The usable section height is based on the viewport after the real 72px navigation (`min-height:calc(100svh - 72px)`). Vertical padding, row gaps, and internal card padding are reduced first. The compact CTA uses `padding:12px 24px`; its 48px button target remains intact. Text remains at the approved minimums: 15px body copy and 12px metadata. No content may be clipped or hidden to meet the viewport target.

## Benefits Icon Repair

Each benefit item uses an explicit two-column grid: a fixed icon column and a flexible content column. Icons remain in normal document flow and may not use absolute positioning. Headings and descriptions occupy the content column, preventing icon/text overlap at every supported desktop width.

## Responsive Behavior

- `>= 1101px`: compact three-row desktop composition; complete section fits in the 1008px usable area at 1920×1080 after the 72px navigation.
- `769–1100px`: retain the approved tablet composition and content-driven height.
- `<= 768px`: retain the approved single-column mobile composition and touch targets.

The no-scroll requirement applies specifically to 1920×1080 desktop. Smaller-height viewports must remain readable and may scroll rather than shrinking text below the design-system minimums.

## Accessibility and Quality

- Body copy remains at least 15px; metadata remains at least 12px.
- Existing WCAG AA color combinations, 2px focus treatment, 48–52px CTA targets, and reduced-motion behavior remain intact.
- Cards may not overlap, clip, or create horizontal overflow.
- The change must not introduce global breakpoint or navigation changes.

## Verification

- Add regression tests for desktop viewport compaction rules and flow-based benefit icon layout.
- Run the focused opening, comparison, and service tests.
- Run JavaScript syntax and diff checks.
- Browser reload is currently policy-blocked, so manual visual acceptance is pending. When permitted, inspect the complete service section at 1920×1080 and inspect icon alignment at 1920×1080 and 1440×900.
- Inspect mobile at 390×844 to confirm the shared icon structure did not regress stacking.
