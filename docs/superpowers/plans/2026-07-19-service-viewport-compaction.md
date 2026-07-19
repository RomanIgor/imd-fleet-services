# Service Viewport Compaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the complete `#service` section fit in the 1008px usable desktop area of a 1920×1080 viewport after the real 72px navigation, without scrolling, and eliminate benefit icon/text overlap.

**Architecture:** Keep the approved three-row service composition and compact only the desktop layer at `min-width:1101px`. Replace the benefit item's absolute icon positioning with a normal-flow two-column grid shared safely across breakpoints, while retaining content-driven tablet/mobile layouts.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner.

## Global Constraints

- The complete service section must fit in the 1008px usable area at 1920×1080 after the fixed 72px navigation.
- Body copy remains at least 15px and metadata remains at least 12px.
- No clipping, hidden content, horizontal overflow, or global navigation/breakpoint changes.
- Preserve the official IMD palette, WCAG AA states, focus treatment, CTA targets, and reduced-motion behavior.
- Tablet and mobile remain content-driven and readable.

---

### Task 1: Add viewport and icon-layout regression coverage

**Files:**
- Modify: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: final desktop CSS block beginning with `@media(min-width:1101px){`.
- Produces: regression assertions for compact desktop geometry and flow-based benefit items.

- [ ] **Step 1: Add failing tests for compact desktop geometry**

Add assertions that the final desktop block defines a viewport-aware `#service` minimum height/padding, reduces `.imd-page` row gaps, and constrains the opening, process, and closing rows without reducing typography.

```js
test('service desktop composition fits a 1080px viewport without shrinking copy', () => {
  const desktopCss = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktopCss, /#service\{[^}]*min-height:calc\(100svh - 72px\)[^}]*padding:24px 0/s);
  assert.match(desktopCss, /#service \.imd-page\{[^}]*gap:16px/s);
  assert.match(desktopCss, /#service \.imd-hero\{[^}]*min-height:0/s);
  assert.match(desktopCss, /#service \.imd-process-panel\{[^}]*min-height:0/s);
  assert.match(desktopCss, /#service \.imd-process-grid p\{[^}]*font-size:15px/s);
});
```

- [ ] **Step 2: Add a failing test for normal-flow benefit icons**

```js
test('service benefit icons remain in grid flow and cannot cover text', () => {
  const desktopCss = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktopCss, /#service \.imd-why-items article\{[^}]*display:grid[^}]*grid-template-columns:42px minmax\(0,1fr\)/s);
  assert.match(desktopCss, /#service \.imd-why-icon\{[^}]*position:static/s);
  assert.doesNotMatch(desktopCss, /#service \.imd-why-icon\{[^}]*position:absolute/s);
});
```

- [ ] **Step 3: Run the new tests and confirm RED**

Run:

```powershell
node --test test/service-section-redesign.test.js
```

Expected: the new viewport and flow assertions fail against the current desktop CSS.

- [ ] **Step 4: Commit the failing tests**

```powershell
git add test/service-section-redesign.test.js
git commit -m "Test compact service viewport layout"
```

---

### Task 2: Compact the desktop service composition and repair benefit alignment

**Files:**
- Modify: `style.css` in the final `@media(min-width:1101px)` service layer.
- Test: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: the existing `#service` palette variables and three-row DOM structure.
- Produces: compact desktop-only geometry plus normal-flow benefit icon/content grids.

- [ ] **Step 1: Make the desktop section viewport-aware**

In the final desktop layer, use the available viewport rather than fixed generous vertical spacing:

```css
#service{
  min-height:calc(100svh - 72px);
  padding:24px 0;
}
#service .imd-page{
  width:min(1480px,calc(100% - 96px));
  gap:16px;
}
```

- [ ] **Step 2: Compact the opening and process rows without shrinking type**

Keep the existing font sizes and palette, but reduce excess padding and fixed height:

```css
#service .imd-hero{min-height:0;align-items:center}
#service .imd-hero-card{padding:28px 32px}
#service .imd-cost-card{padding:24px 28px}
#service .imd-process-panel{min-height:0;padding:18px 24px}
#service .imd-process-grid article{min-height:88px;padding:8px 16px}
```

- [ ] **Step 3: Compact the closing row and place benefit icons in grid flow**

```css
#service .imd-bottom-panel{gap:20px}
#service .imd-why-compact{padding:20px 24px}
#service .imd-why-compact h3{margin-bottom:12px}
#service .imd-why-items article{
  min-height:78px;
  padding:12px 10px;
  display:grid;
  grid-template-columns:42px minmax(0,1fr);
  grid-template-rows:auto auto;
  column-gap:12px;
  align-content:center;
}
#service .imd-why-icon{
  position:static;
  grid-column:1;
  grid-row:1 / 3;
  align-self:center;
}
#service .imd-why-items h4,
#service .imd-why-items p{grid-column:2}
#service .imd-cta-split{padding:12px 24px}
```

- [ ] **Step 4: Run the service tests and confirm GREEN**

Run:

```powershell
node --test test/service-section-redesign.test.js
```

Expected: all service tests pass.

- [ ] **Step 5: Run the focused regression suite**

Run:

```powershell
node --test test/comparison-stage.test.js test/opening-color-refresh.test.js test/service-section-redesign.test.js
node --check main.js
node --check server.js
git diff --check
```

Expected: focused tests pass, syntax checks exit 0, and the diff check is clean.

- [ ] **Step 6: Commit the implementation**

```powershell
git add style.css test/service-section-redesign.test.js
git commit -m "Compact service section for desktop viewport"
```

---

### Task 3: Visual acceptance and final review

**Files:**
- Modify only if visual verification reveals a documented regression: `style.css`, `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: the completed desktop compaction and flow-based benefit layout.
- Produces: recorded visual acceptance and a merge-ready reviewed branch.

- [ ] **Step 1: Inspect 1920×1080**

Browser reload is policy-blocked, so manual visual acceptance is pending. When browser access is permitted, confirm the 72px fixed navigation plus the entire service section are visible without vertical scrolling; no card is clipped; all four benefit icons have clear separation from their titles.

- [ ] **Step 2: Inspect 1440×900 and 390×844**

When browser access is permitted, confirm at 1440×900 readable desktop wrapping and no overlap. At 390×844, confirm the existing single-column flow, 52px CTA, and benefit alignment remain intact.

- [ ] **Step 3: Verify computed overflow and geometry**

When browser access is permitted, confirm `document.documentElement.scrollWidth === document.documentElement.clientWidth`, each benefit icon rectangle is disjoint from its heading rectangle, and the 1920×1080 service section bottom is at or above the 1008px usable-area bottom when its top is aligned below the 72px navigation.

- [ ] **Step 4: Request final code review**

Review the complete diff against `docs/superpowers/specs/2026-07-19-service-viewport-compaction-design.md`. Resolve every Critical or Important finding before integration.

- [ ] **Step 5: Run final verification**

```powershell
node --test test/comparison-stage.test.js test/opening-color-refresh.test.js test/service-section-redesign.test.js
node --check main.js
node --check server.js
git diff --check
git status --short
```

Expected: focused tests and checks pass; only explicitly preserved user files may remain untracked.
