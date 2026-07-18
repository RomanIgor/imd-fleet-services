# Mobile Comparison Refinement

## Goal

Bring the mobile comparison section in line with the supplied reference by fixing accordion alignment, adding the IMD advantages accordion, and removing duplicate vehicle-registration calls to action.

## Mobile Structure

At viewport widths up to and including 768px, render the section in this order:

1. IMD result circle without its internal `Fahrzeug melden` button.
2. `Privatverkauf` accordion, collapsed initially.
3. `Händler / Auktion` accordion, collapsed initially.
4. `IMD Fleet Services` accordion, expanded initially.
5. One full-width primary action labeled `Fahrzeug melden`.
6. One visually secondary action labeled `Verkaufszeitpunkt prüfen`.

At widths of 769px and above, preserve the existing desktop section, including the circle action, CTA card, advantages grid, and connected comparison layout.

## Accordion Presentation

- Use the same three-column header grid for every mobile accordion: `38px` icon, flexible label, `32px` indicator.
- Center each `+` or `−` in a `30px` circular indicator.
- Keep the indicator column aligned to the right edge for every accordion.
- Preserve mutually exclusive accordion behavior: opening one panel closes the other two.
- Initialize the IMD panel as the only expanded panel on mobile.
- Preserve keyboard controls, `aria-expanded`, `aria-controls`, and reduced-motion support.

## IMD Advantages Panel

The expanded IMD panel shows:

- `Fahrzeug digital melden`
- `Kostenfreie Abholung`
- `HEK-Mindestpreis gesichert`
- `Rechtssicher & DSGVO-konform`
- `Schnelle Auszahlung`

Reuse existing local IMD visual language and icons. Do not introduce an external icon library.

## CTA Deduplication

- Hide the circle's internal `Fahrzeug melden` action on mobile.
- Replace the current large mobile CTA card presentation with one compact action area below the accordions.
- Keep exactly one visible mobile vehicle-registration CTA, labeled `Fahrzeug melden`.
- Keep `Verkaufszeitpunkt prüfen` as the only secondary action.
- Hide the separate four-item advantages grid on mobile because those benefits move into the IMD accordion.

## Validation

- Verify three accessible accordion controls exist.
- Verify private and dealer panels initialize collapsed on mobile.
- Verify the IMD panel initializes expanded on mobile.
- Verify only one panel can remain open.
- Verify all three indicators share the same alignment rules.
- Verify the mobile layout exposes exactly one primary vehicle-registration action.
- Verify desktop content and connector behavior remain unchanged.
