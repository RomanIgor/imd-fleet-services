# Mobile Accordion Indicator

## Goal

Replace the current circled text glyph with a cleaner, precisely aligned accordion indicator on mobile.

## Design

- Remove the circular border and background from every mobile accordion indicator.
- Draw the indicator using two centered CSS pseudo-elements rather than a font glyph.
- Use an `18px × 18px` indicator area with `1.5px` horizontal and vertical strokes.
- Use the existing light comparison-header color for both strokes.
- In the collapsed state, show both strokes as a plus.
- In the expanded state, hide the vertical stroke and retain the horizontal stroke as a minus.
- Animate only the vertical stroke opacity and scale over `180ms`.
- Keep the existing right-aligned indicator column and all accordion behavior unchanged.
- Disable the transition under `prefers-reduced-motion: reduce`.

## Responsive Scope

- Apply the drawn indicator only at viewport widths up to and including `768px`.
- Preserve desktop comparison presentation and behavior.

## Validation

- Assert the mobile indicator has no border or border radius.
- Assert both pseudo-elements exist and use centered positioning.
- Assert the expanded state hides the vertical stroke.
- Assert all three accordion indicators retain the same alignment column.
- Run the complete comparison test suite.
