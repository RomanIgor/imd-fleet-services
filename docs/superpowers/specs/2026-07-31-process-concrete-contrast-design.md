# Process Section Concrete Contrast Design

## Scope

Refine only the `#prozess` section so its concrete surfaces no longer appear washed out. Preserve the current content, layout, animation, icons, spacing, and responsive behavior.

## Visual direction

Use a layered medium-concrete hierarchy from the approved IMD palette:

- Section base: medium concrete `#B3B4B0`, with the existing concrete photograph still visible through a restrained graphite overlay.
- Main roadmap surface: card concrete `#D6D6D2`.
- Default step and benefit surfaces: a slightly deeper neutral derived from `#CAC9C4`, distinct from the roadmap surface.
- Active step: highlight concrete `#E5E4DF`, cyan border `#36A2C5`, and navy icon treatment.
- Intro card: IMD navy `#202A3B` with highlight text `#E5E4DF` and accessible muted copy.
- Primary text: graphite `#1C2228`; secondary text: body gray `#4C5257`; borders: `#9A9C99` at restrained opacity.

The background, container, and cards must form three visibly different tonal levels. The result should feel like architectural concrete rather than white cards on a pale gray canvas.

## Interaction and accessibility

- Keep the current active-step cyan treatment and numbered timeline behavior.
- Preserve existing keyboard, reduced-motion, tablet, and mobile behavior.
- Maintain readable contrast for body copy on both navy and concrete surfaces.
- Do not add decorative gradients or shadows that compete with the process hierarchy.

## Implementation boundaries

- Add a final, narrowly scoped `#prozess` style layer in `style.css` rather than restructuring the HTML.
- Reuse the existing opening-section design tokens; introduce no new brand colors.
- Do not change `#service`, `#warum`, or global body styling.
- Do not change copy, icons, card order, or section height.

## Verification

- Add a regression assertion for the medium-concrete background, navy intro card, distinct roadmap/card surfaces, and preserved active cyan state.
- Run the complete Node test suite plus JavaScript syntax and `git diff --check` verification.
- Visually inspect the section at desktop and mobile widths before completion.
