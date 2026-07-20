# Service Section Viewport Compaction

## Objective

Compact the desktop `#service` section so its complete content fits inside the usable area of a 1920×1080 viewport: the viewport less the real 72px fixed navigation, without vertical scrolling. Preserve the approved IMD concrete palette, information hierarchy, and readable typography.

## Scope

- Desktop service section only: opening pair, process band, benefits panel, and CTA panel.
- Repair the overlapping icons in the benefits panel.
- Preserve the existing tablet and mobile stacked layouts unless a shared structural fix requires a compatible adjustment.
- Do not change copy, palette tokens, navigation, following sections, or business behavior.

## Layout

At effective compact desktop widths of at least 1121px, the service section uses three compact rows. The final `max-width:1120px` cascade overrides the earlier desktop rule for 1101–1120px.

1. Opening row: primary navy message card and cost card.
2. Process row: one coherent horizontal process band.
3. Closing row: benefits and CTA side by side.

The usable section height is based on the viewport after the real 72px navigation (`min-height:calc(100svh - 72px)`). At the effective compact desktop range, `#service` also uses `scroll-margin-top:72px` so a `#service` anchor lands directly below the fixed navigation; a 1008px-or-shorter rendered section then ends within the 1080px viewport. Vertical padding, row gaps, and internal card padding are reduced first. The compact CTA uses `padding:12px 24px`; its 48px button target remains intact. Text remains at the approved minimums: 15px body copy and 12px metadata. No content may be clipped or hidden to meet the viewport target.

### Logo-safe composition

At large desktop widths (`>=1260px`), the embossed IMD logo in the center of `assets/showroom-background.png` remains a visible part of the composition. The established compact desktop composition remains unchanged from `1121px` through `1259px`.

- Reduce the primary navy message card by approximately 15–20% from the first compaction version and anchor it toward the left edge.
- Keep the cost card narrow and anchored toward the right edge.
- Preserve an intentionally empty center column around the embossed logo; neither opening card may cross into this logo-safe area.
- Make the process band narrower and lower than the first compaction version, centered below the opening row instead of covering the full photographic width.
- Keep benefits and CTA side by side with a more compact footprint that does not visually dominate the photograph.
- At `>=1260px`, the process and closing bands use `width:min(1240px,100%)`: they cap at 1240px on wide screens and use the full page width at the boundary so process copy remains readable without desktop emergency wrapping.
- Keep solid IMD concrete/navy surfaces. Do not add translucent glass cards or duplicate the photographic logo as a separate overlay.
- Achieve compactness through widths, padding, gaps, and heading scale while retaining 15px body copy and 12px metadata.

## Benefits Icon Repair

Each benefit item uses an explicit two-column grid: a fixed icon column and a flexible content column. Icons remain in normal document flow and may not use absolute positioning. Headings and descriptions occupy the content column, preventing icon/text overlap at every supported desktop width.

## Responsive Behavior

- `1121–1259px`: compact three-row desktop composition; complete section fits in the 1008px usable area at 1920×1080 after the 72px navigation.
- `>= 1260px`: apply the logo-safe refinement to frame the central embossed logo while retaining the compact desktop composition.
- `769–1120px`: retain the approved tablet composition and content-driven height.
- `<= 768px`: retain the approved single-column mobile composition and touch targets.

The no-scroll requirement applies specifically to 1920×1080 desktop. Smaller-height viewports must remain readable and may scroll rather than shrinking text below the design-system minimums.

## Accessibility and Quality

- Body copy remains at least 15px; metadata remains at least 12px.
- Existing WCAG AA color combinations, 2px focus treatment, 48–52px CTA targets, and reduced-motion behavior remain intact.
- Cards may not overlap, clip, or create horizontal overflow.
- The change must not introduce global breakpoint or navigation changes.

## Verification

- At 1920x1080, confirm the central embossed IMD mark is immediately recognizable and the panels frame it rather than cover it.
- Confirm the primary message, process band, benefits panel, and CTA are visibly less bulky than the first compact version while retaining all copy and accessible type sizes.
- Add regression tests for desktop viewport compaction rules and flow-based benefit icon layout.
- Run the focused opening, comparison, and service tests.
- Run JavaScript syntax and diff checks.
- Browser reload is currently policy-blocked, so manual visual acceptance is pending. When permitted, inspect the complete service section at 1920×1080 and inspect icon alignment at 1920×1080 and 1440×900.
- Inspect mobile at 390×844 to confirm the shared icon structure did not regress stacking.
