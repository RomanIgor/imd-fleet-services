# Homepage Comparison Stage Redesign

## Goal

Replace the three equal comparison tables in the homepage `#warum` section with a clearer visual comparison inspired by the supplied reference. Preserve the current concrete-grey, navy, and IMD-blue palette while making IMD the immediate focal point.

## Desktop composition

- Place `Privatverkauf` in a compact panel on the left.
- Place `Exporthändler / Auktionen` in a compact panel on the right.
- Place IMD Fleet Services in a larger oval or softly circular centerpiece between them.
- Use two restrained concentric outlines and fine dotted connector paths to visually lead the disadvantages in the side panels toward the IMD solution.
- Keep the surrounding heading, call-to-action block, and benefit cards unchanged except for spacing adjustments needed by the new comparison stage.

## Content hierarchy

Each side panel contains a navy header, five concise single-line tasks or disadvantages, a small status marker, and an effort footer:

- `Privatverkauf`: red markers and `Ihr Aufwand: HOCH`.
- `Exporthändler / Auktionen`: ochre markers and `Ihr Aufwand: MITTEL`.

The center contains the IMD logo, a short divider, the primary measure `ca. 20 Minuten`, the label `interner Aufwand`, and the supporting statement `Fahrzeug digital melden. Den Rest übernehmen wir.` The wording deliberately distinguishes the customer's internal effort from the total duration of the vehicle sale.

Long secondary descriptions currently displayed under every comparison item are removed. The five short rows retain the existing meaning without duplicating explanatory text.

## Visual language

- Continue using the existing warm concrete background and current scoped color tokens.
- Side panels use light mineral surfaces with subtle shadows and navy headers.
- The IMD center uses the lightest surface, navy typography, IMD blue accents, and slightly stronger depth.
- Connector lines remain low contrast so they explain relationships without becoming decoration-heavy.
- Avoid new external assets or icon libraries. Existing local icons and CSS shapes are reused.

## Responsive behavior

- Desktop: left panel, central IMD focal element, and right panel appear as one connected composition.
- Tablet: reduce connector detail and center size while retaining the three-part hierarchy.
- Mobile: show the IMD result first, then provide the two alternatives as horizontally swipeable panels with accessible controls/dots. Decorative connector lines are hidden.
- Maintain visible keyboard focus and respect reduced-motion preferences.

## Implementation boundaries

- Update only the comparison markup in `index.html`, the related styles in `style.css`, and existing carousel behavior in `main.js` if its selectors require adjustment.
- Do not change backend routes, forms, dashboard functionality, global typography, or the established homepage palette.
- Reuse the section's current semantic labels and preserve meaningful screen-reader descriptions.

## Verification

- Inspect at desktop, tablet, and mobile widths.
- Confirm all five rows remain readable and aligned.
- Confirm the center is visually dominant without covering connector paths.
- Confirm carousel, keyboard focus, calls to action, and reduced-motion behavior still work.
- Confirm no horizontal page overflow occurs.
