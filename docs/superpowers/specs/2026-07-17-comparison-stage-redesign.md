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

## Approved alignment refinement

- Reduce the desktop comparison heading from a 58 px maximum to approximately 46 px.
- Replace approximate CSS connector rules with a responsive SVG overlay.
- Anchor one dotted curved path to the center of every side-panel row marker and terminate it on the corresponding side of the IMD ellipse.
- Recalculate all ten paths on initial render and resize; hide the connector overlay at tablet and mobile widths.

## Approved concrete background refinement

- Preserve the current component sizes and spacing.
- Remove the square grid layers from the comparison background.
- Retain the local concrete image with a quiet mineral overlay and soft radial lighting.

## Approved icon and connector-node refinement

- Replace provisional text glyphs in the side-panel headers with the local user and handshake SVG icons.
- Add small colored SVG nodes to both ends of every connector path: muted red or ochre at the alternative panel, IMD blue at the central ellipse.
- Preserve current dimensions, connector geometry, copy, and responsive behavior.

## Approved proof-badge refinement

- Replace the explanatory `Mehr Sicherheit. Weniger Aufwand.` insight card with a compact evidence badge.
- Use the title `Geprüfte Abwicklung` and the concrete proof points `GKK-zertifiziert`, `HEK-Mindestpreis`, and `Rechtssicher`.
- Reduce the badge's visual weight so the comparison heading remains dominant.
