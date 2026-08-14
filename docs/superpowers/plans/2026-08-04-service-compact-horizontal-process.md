# Service Compact Horizontal Process Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the approved service process visibly shorter and centered, with compact horizontal steps, while widening the CTA and preserving all existing visual tokens and content.

**Architecture:** Keep the existing `#service > .imd-page` and HTML content as the shared composition parent. Update only the final service overrides in `style.css`, using CSS Grid/Flexbox to center the intro, place each icon beside its text, and align Process and Benefits/CTA to the same `1360px` width. Lock the approved geometry with source-level regression tests and confirm rendered geometry at desktop, tablet, and mobile widths.

**Tech Stack:** Static HTML, CSS Grid/Flexbox, Node.js built-in test runner, browser geometry inspection.

## Global Constraints

- Preserve the hero, background image, all existing text, colors, typography, shadows, borders, and brand styling.
- Keep the process as one continuous block with no individual step cards.
- Desktop process padding is exactly `28px 32px`.
- Desktop process intro is centered above the steps.
- Desktop steps use icon-left/text-right composition inside a centered `1000–1100px` width.
- Desktop Process-to-Benefits/CTA gap is exactly `24px`.
- Desktop lower split is `56% / 44%` with a `24px` gap.
- Benefits remain an open, borderless 2×2 grid.
- CTA button remains full-width and measures `52–56px` high.
- Do not introduce horizontal overflow at responsive breakpoints.

---

## File Map

- `style.css`: owns the final desktop/tablet/mobile service composition overrides.
- `test/service-section-redesign.test.js`: owns structural and CSS regression assertions for the service section.
- `index.html`: remains unchanged because the current process markup already supports the approved layout.

### Task 1: Lock and implement the compact service composition

**Files:**
- Modify: `test/service-section-redesign.test.js:88-166`
- Modify: `style.css:3394-3474`
- Verify unchanged: `index.html:244-357`

**Interfaces:**
- Consumes: the existing `.imd-process-panel`, `.imd-intro-text`, `.imd-process-grid`, `.imd-process-line-icon`, `.imd-bottom-panel`, `.imd-benefit-card--primary`, `.imd-why-items`, and `.imd-cta-split` markup.
- Produces: a CSS-only compact desktop composition plus unchanged responsive stacking behavior.

- [ ] **Step 1: Update the regression tests before production CSS**

Replace the desktop geometry expectations with assertions equivalent to:

```js
assert.match(desktop, /#service \.imd-process-panel\{(?=[^}]*width:min\(1360px,100%\))(?=[^}]*padding:28px 32px)(?=[^}]*gap:24px)[^}]*\}/s);
assert.match(desktop, /#service \.imd-process-panel \.imd-intro-text\{(?=[^}]*max-width:760px)(?=[^}]*text-align:center)(?=[^}]*justify-self:center)(?=[^}]*display:flex)[^}]*\}/s);
assert.match(desktop, /#service \.imd-process-grid\{(?=[^}]*width:min\(1080px,100%\))(?=[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\))(?=[^}]*gap:32px)[^}]*\}/s);
assert.match(desktop, /#service \.imd-process-grid article\{(?=[^}]*grid-template-columns:48px minmax\(0,1fr\))(?=[^}]*column-gap:14px)(?=[^}]*background:transparent)(?=[^}]*border:0)[^}]*\}/s);
assert.match(desktop, /#service \.imd-process-grid article:not\(:last-child\)::after\{(?=[^}]*width:24px)(?=[^}]*height:6px)[^}]*\}/s);
assert.match(desktop, /#service \.imd-process-line-icon\{[^}]*width:48px[^}]*height:48px/s);
assert.match(desktop, /#service \.imd-process-grid h4\{(?=[^}]*font-size:17px)(?=[^}]*font-weight:600)[^}]*\}/s);
assert.match(desktop, /#service \.imd-process-grid h4::before\{(?=[^}]*display:block)(?=[^}]*font-size:11px)[^}]*\}/s);
assert.match(desktop, /#service \.imd-process-grid p\{(?=[^}]*font-size:14px)(?=[^}]*-webkit-line-clamp:2)[^}]*\}/s);
assert.match(desktop, /#service \.imd-bottom-panel\{(?=[^}]*width:min\(1360px,100%\))(?=[^}]*margin:24px 0 0)(?=[^}]*grid-template-columns:minmax\(0,56fr\) minmax\(420px,44fr\))(?=[^}]*gap:24px)[^}]*\}/s);
assert.match(desktop, /#service \.imd-why-items\{(?=[^}]*row-gap:36px)(?=[^}]*column-gap:40px)[^}]*\}/s);
assert.match(desktop, /#service \.imd-why-icon\{[^}]*width:46px[^}]*height:46px/s);
assert.match(desktop, /#service \.imd-cta-split\{(?=[^}]*padding:32px)[^}]*\}/s);
assert.match(desktop, /#service \.imd-cta-split \.imd-button\{(?=[^}]*width:100%)(?=[^}]*min-height:54px)[^}]*\}/s);
```

Keep the existing assertions that forbid individual bordered process/benefit cards and preserve the responsive flow.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test test/service-section-redesign.test.js
```

Expected: the desktop process rhythm, compact-step, support split, Benefits spacing, and CTA sizing assertions fail because the current CSS still uses the previous geometry.

- [ ] **Step 3: Implement the minimal approved CSS**

Update the final `@media(min-width:1101px)` override so its key declarations are:

```css
#service .imd-process-panel {
  width:min(1360px,100%);
  padding:28px 32px;
  grid-template-columns:1fr;
  gap:24px;
}

#service .imd-process-panel .imd-intro-text {
  max-width:760px;
  justify-self:center;
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  column-gap:8px;
  row-gap:2px;
  text-align:center;
}

#service .imd-process-panel .imd-intro-text h3 {
  flex-basis:100%;
  margin:0 0 6px;
}

#service .imd-process-panel .imd-intro-text p {
  margin:0;
}

#service .imd-process-grid {
  width:min(1080px,100%);
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:32px;
}

#service .imd-process-grid article {
  display:grid;
  grid-template-columns:48px minmax(0,1fr);
  grid-template-rows:auto auto;
  column-gap:14px;
  align-items:center;
  text-align:left;
  padding:0;
  border:0;
  background:transparent;
}

#service .imd-process-grid article:not(:last-child)::after {
  top:21px;
  left:calc(100% + 4px);
  width:24px;
  height:6px;
}

#service .imd-process-line-icon {
  grid-column:1;
  grid-row:1 / 3;
  width:48px;
  height:48px;
  margin:0;
}

#service .imd-process-grid h4 {
  grid-column:2;
  grid-row:1;
  margin:0 0 3px;
  font-size:17px;
  font-weight:600;
}

#service .imd-process-grid h4::before {
  display:block;
  margin-bottom:2px;
  font-size:11px;
}

#service .imd-process-grid p {
  grid-column:2;
  grid-row:2;
  max-width:190px;
  font-size:14px;
  line-height:1.35;
  -webkit-line-clamp:2;
}

#service .imd-bottom-panel {
  width:min(1360px,100%);
  margin:24px 0 0;
  grid-template-columns:minmax(0,56fr) minmax(420px,44fr);
  gap:24px;
}

#service .imd-why-items {
  row-gap:36px;
  column-gap:40px;
}

#service .imd-why-icon {
  width:46px;
  height:46px;
}

#service .imd-cta-split {
  padding:32px;
}

#service .imd-cta-split h3 {
  max-width:460px;
}

#service .imd-cta-split .imd-button {
  width:100%;
  min-height:54px;
}
```

Do not alter hero selectors, palette variables, font-family declarations, content, or background-image declarations.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
node --test test/service-section-redesign.test.js
```

Expected: all focused service tests pass.

- [ ] **Step 5: Run the full automated suite and syntax checks**

Run:

```powershell
node --test test
node --check main.js
node --check server.js
git diff --check
```

Expected: 36 tests pass, both syntax checks exit `0`, and `git diff --check` prints no errors.

- [ ] **Step 6: Verify rendered desktop geometry**

At a `1904×957` viewport, measure `.imd-process-panel`, `.imd-process-grid`, `.imd-bottom-panel`, `.imd-benefit-card--primary`, and `.imd-cta-split`.

Expected:

- process height is at most `213.9px`, a minimum 20% reduction from the recorded `267.4px` baseline;
- intro text is horizontally centered;
- process grid width is between `1000px` and `1100px`;
- the four step columns are evenly spaced;
- process and lower row have matching left/right edges;
- lower row top minus process bottom is `24px`;
- Benefits/CTA available-column ratio is approximately `56/44` with a `24px` gap;
- CTA button height is between `52px` and `56px`.

- [ ] **Step 7: Verify tablet and mobile behavior**

At `1024×900` and `390×844`, confirm:

- document horizontal overflow equals `0`;
- process remains readable;
- Benefits precedes CTA;
- tablet/mobile stacking remains intact;
- mobile process remains a vertical flow.

- [ ] **Step 8: Commit the implementation**

```powershell
git add style.css test/service-section-redesign.test.js
git commit -m "Make service process visibly compact"
```
