# Service Reference Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rearrange the existing service content into the approved reference composition: two opening cards around an exposed logo, one process rail, and three balanced support cards.

**Architecture:** Keep the existing `#service` section and its content, but split the four benefit articles into two semantic benefit groups around the existing CTA. Add one wide-desktop layout layer at `min-width:1440px`; preserve the current tablet/mobile flow with explicit ordering rules.

**Tech Stack:** Static HTML, CSS media queries, Node.js built-in test runner, in-app browser geometry and screenshot verification.

## Global Constraints

- Use only existing service copy and actions.
- Preserve the dark showroom photograph and IMD concrete/navy palette.
- Keep the embossed IMD logo unobstructed.
- Avoid clipped copy, icon overlap, and horizontal overflow.
- Preserve keyboard focus and reduced-motion behavior.

---

### Task 1: Lock the reference composition with regression tests

**Files:**
- Modify: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: Existing `index.html` service markup and final CSS media blocks.
- Produces: Assertions defining the three-tier desktop layout and responsive benefit order.

- [ ] **Step 1: Write the failing structure assertions**

Add assertions that require:

```js
assert.match(html, /class="imd-benefit-card imd-benefit-card--primary"/);
assert.match(html, /class="imd-benefit-card imd-benefit-card--secondary"/);
assert.match(wideDesktopCss, /grid-template-columns:360px minmax\(600px,1fr\) 270px/);
assert.match(wideDesktopCss, /#service \.imd-bottom-panel\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/s);
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```bash
node --test test/service-section-redesign.test.js
```

Expected: FAIL because the two benefit cards and three-column support tier do not exist yet.

- [ ] **Step 3: Keep the failing test as the implementation contract**

Do not loosen assertions to accept the previous five-column rail.

### Task 2: Restructure existing benefits into the reference grid

**Files:**
- Modify: `index.html:318-360`
- Test: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: The four existing `.imd-why-items article` elements and existing `.imd-cta-split`.
- Produces: `.imd-benefit-card--primary`, `.imd-cta-split`, and `.imd-benefit-card--secondary` as three siblings.

- [ ] **Step 1: Split existing benefit articles without changing copy**

Replace the single benefit wrapper with:

```html
<div class="imd-benefit-card imd-benefit-card--primary">
  <h3>Warum Unternehmen IMD wählen</h3>
  <div class="imd-why-items">
    <!-- existing benefit articles 1 and 2 -->
  </div>
</div>
<div class="imd-cta-split">
  <!-- existing CTA content unchanged -->
</div>
<div class="imd-benefit-card imd-benefit-card--secondary">
  <h3>Warum Unternehmen IMD wählen</h3>
  <div class="imd-why-items">
    <!-- existing benefit articles 3 and 4 -->
  </div>
</div>
```

Keep every existing heading, description, list item, button, and note.

- [ ] **Step 2: Run the structure test**

Run:

```bash
node --test test/service-section-redesign.test.js
```

Expected: Structure assertions pass; CSS layout assertions still fail.

### Task 3: Implement the exact wide-desktop arrangement

**Files:**
- Modify: `style.css` in `@media(min-width:1440px)`
- Test: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: The three bottom-tier siblings from Task 2.
- Produces: Reference-aligned opening, process, and support tiers.

- [ ] **Step 1: Replace the current wide support rail**

Implement:

```css
#service .imd-bottom-panel{
  width:min(1180px,100%);
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:12px;
  overflow:visible;
  background:transparent;
  border:0;
  box-shadow:none;
}
#service .imd-benefit-card,
#service .imd-cta-split{
  min-height:205px;
  padding:16px 18px;
  border-radius:14px;
}
#service .imd-benefit-card{
  background:var(--service-highlight);
  border:1px solid rgba(154,156,153,.52);
}
```

Use a two-column internal grid in each benefit card for its two existing benefit items. Keep the CTA light concrete as in the reference while retaining the existing navy button.

- [ ] **Step 2: Match the opening and process proportions**

Keep the logo-safe opening grid:

```css
grid-template-columns:360px minmax(600px,1fr) 270px;
```

Make the process rail a compact full-width row with the intro plus four steps, using content-driven height and no clipping.

- [ ] **Step 3: Add intermediate and mobile ordering**

At `max-width:1120px`, stack:

```text
primary message → cost → process → primary benefits → CTA → secondary benefits
```

Ensure each benefit card uses one column on narrow mobile.

- [ ] **Step 4: Run the focused tests**

Run:

```bash
node --test test/service-section-redesign.test.js
```

Expected: PASS.

### Task 4: Visual and regression verification

**Files:**
- Modify if required: `style.css`
- Test: `test/comparison-stage.test.js`
- Test: `test/opening-color-refresh.test.js`
- Test: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: Completed reference grid.
- Produces: Verified desktop and mobile layout with no regressions.

- [ ] **Step 1: Run all relevant automated checks**

Run:

```bash
node --test test/comparison-stage.test.js test/opening-color-refresh.test.js test/service-section-redesign.test.js
node --check main.js
node --check server.js
git diff --check
```

Expected: All tests and checks pass.

- [ ] **Step 2: Verify desktop geometry**

At `1904×957` and `1920×1080`, verify:

```text
central logo gap >= 600px
process scrollHeight <= rendered height
three lower cards share one row
document horizontal overflow == 0
no tag or icon overlaps
```

- [ ] **Step 3: Verify mobile geometry**

At `390×844`, verify the explicit stacking order, readable text, and zero horizontal overflow.

- [ ] **Step 4: Review screenshots**

Compare the desktop screenshot against the supplied reference for card positions, relative widths, spacing, and logo visibility. Adjust only layout density; do not introduce new content.

- [ ] **Step 5: Commit the implementation**

```bash
git add index.html style.css test/service-section-redesign.test.js
git commit -m "Match service cards to reference grid"
```
