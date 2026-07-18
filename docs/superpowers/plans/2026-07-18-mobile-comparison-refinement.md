# Mobile Comparison Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the supplied mobile comparison reference with three aligned accordions, IMD advantages, and one primary registration CTA.

**Architecture:** Add the IMD advantages as a third panel in the existing comparison stage and reuse the current accordion controller for all three panels. Mobile-only CSS reorders and simplifies CTA/benefit content while desktop markup remains visible and unchanged.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node.js built-in test runner

## Global Constraints

- Apply refinements only through the existing `768px` mobile breakpoint.
- Initialize private and dealer panels collapsed and the IMD panel expanded on mobile.
- Keep only one panel open at a time.
- Expose exactly one mobile primary CTA labeled `Fahrzeug melden`.
- Preserve the desktop connected comparison, CTA card, advantages grid, and circle action.
- Use local assets and preserve reduced-motion and ARIA behavior.

---

### Task 1: Three-panel mobile comparison

**Files:**
- Modify: `test/comparison-stage.test.js`
- Modify: `index.html`
- Modify: `main.js`
- Modify: `style.css`

**Interfaces:**
- Consumes: `initMobileDifferenceAccordion()`, `setDifferencePanelState()`, `.difference-side-head`, and the existing comparison CTA/benefits.
- Produces: `.difference-side-imd`, `difference-panel-imd`, `.difference-mobile-actions`, and three-column mobile header alignment.

- [ ] **Step 1: Add failing regression assertions**

Add assertions that require three accordion controls/bodies, an IMD panel with five named benefits, `panel.dataset.mobileDefault === 'open'` in the mobile initializer, shared indicator alignment, mobile hiding of `.difference-core a`, `.difference-cta`, and `.difference-benefits`, and the cache versions `why-mobile-refinement-8` and `privacy-xlsx-connectors-refinement-4`.

- [ ] **Step 2: Verify the new test fails**

Run: `node --test test/comparison-stage.test.js`

Expected: FAIL because the IMD accordion and mobile CTA rules do not exist.

- [ ] **Step 3: Add the IMD accordion and compact mobile actions**

In `index.html`, add an `.difference-side-imd` article after the dealer panel. Its button controls `difference-panel-imd`, starts with `aria-expanded="false"`, uses the IMD logo/icon, and its body lists exactly:

```text
Fahrzeug digital melden
Kostenfreie Abholung
HEK-Mindestpreis gesichert
Rechtssicher & DSGVO-konform
Schnelle Auszahlung
```

Mark it with `data-mobile-default="open"`. Add `.difference-mobile-actions` after the stage with one primary `Fahrzeug melden` link and one secondary `Verkaufszeitpunkt prüfen` button.

- [ ] **Step 4: Initialize the designated mobile panel**

Change `syncLayout()` in `main.js` so mobile state uses:

```js
if (mobileQuery.matches) {
  setDifferencePanelState(panel, panel.dataset.mobileDefault === 'open');
} else {
  setDifferencePanelState(panel, true);
}
```

The existing click loop continues to enforce mutual exclusivity across all three panels.

- [ ] **Step 5: Apply mobile-only layout and deduplication**

At `max-width:768px`, give every `.difference-side-head` the grid `38px minmax(0,1fr) 32px`, center the indicator with `justify-self:end`, place the IMD panel after dealer, hide `.difference-core a`, `.difference-cta`, and `.difference-benefits`, and display `.difference-mobile-actions`. At widths above 768px, hide `.difference-side-imd` and `.difference-mobile-actions` so desktop remains unchanged.

- [ ] **Step 6: Update cache versions and run verification**

Update `index.html` and all source-level assertions to `style.css?v=why-mobile-refinement-8` and `main.js?v=privacy-xlsx-connectors-refinement-4`.

Run: `node --test test/comparison-stage.test.js`

Expected: all comparison tests pass.

Run: `node --check main.js`

Expected: exit code 0.

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 7: Commit**

```bash
git add index.html style.css main.js test/comparison-stage.test.js docs/superpowers/plans/2026-07-18-mobile-comparison-refinement.md
git commit -m "Refine mobile comparison flow"
```
