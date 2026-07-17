# Mobile Comparison Accordion

## Goal

Make the comparison section compact and easy to scan on mobile without shrinking its content or changing the desktop presentation.

## Responsive Scope

- Apply the accordion at viewport widths up to and including 768px.
- Preserve the current connected three-column comparison at widths of 769px and above.
- Keep comparison connector lines hidden on mobile.

## Mobile Composition

1. Show the IMD result circle first and keep all of its current content.
2. Show `Privatverkauf` and `Händler / Auktion` as two compact accordion headers below the circle.
3. Keep both panels collapsed on initial page load.
4. Expand a panel when its header is activated.
5. Close the open panel when its header is activated again.
6. Opening one panel automatically closes the other panel.

## Interaction and Accessibility

- Use each existing side-panel header as a keyboard-operable accordion control on mobile.
- Expose state with `aria-expanded` and associate each control with its content through `aria-controls`.
- Display `+` for a collapsed panel and `−` for an expanded panel.
- Animate only the panel reveal and indicator change.
- Disable the accordion transition when `prefers-reduced-motion: reduce` is active.
- Do not alter desktop hover, focus, connector, or layout behavior.

## Validation

- Assert both mobile panels initialize collapsed.
- Assert activating a panel opens it and updates its ARIA state.
- Assert activating the open panel closes it.
- Assert opening one panel closes the other.
- Assert the accordion CSS is limited to the mobile breakpoint.
- Run the existing comparison tests to protect desktop layout and dynamic connectors.
