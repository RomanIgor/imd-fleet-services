# Comparison Viewport Fit

## Goal

Move the complete comparison-section composition upward so more of it fits inside a standard desktop viewport, without shrinking text, cards, or the central comparison graphic.

## Design

- Reduce the section's desktop top spacing by 40px.
- Reduce the vertical gap between the introductory header and the comparison stage by 12px.
- Move the heading, proof badge, side panels, connectors, and central result together so their visual relationships remain unchanged.
- Preserve all typography, card dimensions, connector alignment, and content.
- Keep the existing responsive spacing on tablet and mobile, where fitting the section into one viewport is not a requirement.

## Validation

- Existing comparison tests must continue to pass.
- Add a regression assertion for the reduced desktop top spacing.
- Confirm that connector positioning remains dynamic and no content overlaps at desktop width.
