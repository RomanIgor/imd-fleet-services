# Service Logo-First Design

**Status:** Approved by user on 2026-07-23

## Goal

Make the embossed IMD showroom logo the visual center of the desktop service section. Supporting content must frame the logo rather than overlap it, and no card may appear taller or wider than its content requires.

## Desktop composition

The logo-first composition applies at `min-width:1260px`.

### Opening stage

- Use a centered maximum width of `1400px`.
- Reserve a central logo-safe track of at least `600px`.
- Place a message card of at most `360px` on the left.
- Place a cost card of at most `270px` on the right.
- Align both cards to the top and outer edges.
- Reduce internal padding while preserving 15px body copy, 12px metadata, and readable headings.

### Process rail

- Position the process rail below the complete embossed logo.
- Use a centered maximum width of `1180px`.
- Target a rendered height of `160–175px` at wide desktop.
- Shorten the introduction copy to:
  - `Online melden. Wir übernehmen Abholung, Gutachten und Auszahlung.`
  - `Ein Vorgang. Ein Ansprechpartner.`
- Keep four equal process steps, their icons, labels, descriptions, separators, and sequence.
- Remove artificial minimum heights.

### Closing rail

- Use one centered `1180px` rail rather than two oversized neighboring cards.
- Present the four benefits as equal compact columns.
- Integrate a compact CTA column on the right.
- The CTA contains the heading, three concise assurances, button, and response-time note without flex-generated empty space.
- All children are content-driven and top-aligned.

## Visual rules

- Keep the dark graphite showroom photograph and concrete/navy palette.
- The embossed background logo remains the only logo inside the service composition.
- Cards use restrained `14–16px` radii and lighter shadows.
- No glass overlays, fixed section height, clipping, or hidden content.

## Responsive behavior

- `1121–1259px`, tablet, and mobile compositions remain unchanged.
- The compact wide-desktop design must not create horizontal overflow.
- Tags remain at least `12px`; body copy remains at least `15px`; interactive targets remain at least `48px`.

## Acceptance checks

At `1904×957` and `1920×1080`:

- the full embossed IMD mark is visible between and above the rails;
- neither opening card intersects the central 600px safe track;
- the process rail is no taller than 175px;
- closing content has no artificial equal-height whitespace;
- tag and document horizontal overflow are zero.
