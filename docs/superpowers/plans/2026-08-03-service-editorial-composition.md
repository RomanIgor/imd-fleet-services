# Service Editorial Composition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the service section's three-card support tier with a 60/40 editorial Benefits + CTA composition and make its four-step process one connected, dominant flow.

**Architecture:** Preserve the existing `#service` hero and reuse all current content, icons, design tokens, and JavaScript hooks. Restructure only the support-tier HTML, then revise the final scoped `#service` CSS layer so desktop, tablet, and mobile each have an explicit composition without new components or visual tokens.

**Tech Stack:** Server-rendered HTML, CSS Grid/Flexbox, vanilla JavaScript observer retained unchanged, Node.js built-in test runner.

## Global Constraints

- Keep `.imd-hero` and all of its descendants unchanged.
- Do not change content, typography, colors, images, icons, borders, shadows, or brand tokens.
- Do not add gradients, accent colors, labels, cards, badges, or decorative elements.
- Keep process descriptions at their current text and at no more than two rendered lines.
- Use only existing `#service` classes and one combined benefits block; `main.js` remains unchanged.
- Preserve the untracked `new_design_final/` directory without staging or editing it.

---

### Task 1: Lock the approved structure with failing tests

**Files:**
- Modify: `test/service-section-redesign.test.js`
- Test: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: Existing `index.html` service markup and the final `#service` CSS layer.
- Produces: Regression assertions for the exact two-block support tier and continuous process flow.

- [ ] **Step 1: Replace obsolete three-card assertions with structural tests**

Add assertions that extract `.imd-bottom-panel`, require exactly one `.imd-benefit-card--primary`, forbid `.imd-benefit-card--secondary`, require four `.imd-why-items article` elements, and verify the benefits block precedes `.imd-cta-split`.

```js
test('service lower tier contains one four-item benefits area and one CTA', () => {
  const supportTier = html.match(/<section class="imd-bottom-panel imd-glass">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(supportTier, 'service support tier is present');
  assert.equal((supportTier.match(/class="imd-benefit-card imd-benefit-card--primary"/g) || []).length, 1);
  assert.doesNotMatch(supportTier, /imd-benefit-card--secondary/);
  assert.equal((supportTier.match(/<article>/g) || []).length, 4);
  assert.ok(supportTier.indexOf('imd-benefit-card--primary') < supportTier.indexOf('imd-cta-split'));
});
```

- [ ] **Step 2: Add final-composition CSS assertions**

```js
test('service process and support tier use the editorial composition', () => {
  const desktopCss = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktopCss, /#service \.imd-page\{[^}]*gap:clamp\(48px,4vw,64px\)/s);
  assert.match(desktopCss, /#service \.imd-process-grid\{(?=[^}]*position:relative)(?=[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)))[^}]*\}/s);
  assert.match(desktopCss, /#service \.imd-process-grid::before\{[^}]*z-index:0/s);
  assert.match(desktopCss, /#service \.imd-process-grid article\{[^}]*border:0[^}]*box-shadow:none/s);
  assert.match(desktopCss, /#service \.imd-bottom-panel\{(?=[^}]*grid-template-columns:minmax\(0,3fr\) minmax\(380px,2fr\))(?=[^}]*gap:clamp\(24px,2vw,32px\))(?=[^}]*align-items:start)[^}]*\}/s);
  assert.match(desktopCss, /#service \.imd-why-items\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\))/s);
  assert.match(desktopCss, /#service \.imd-why-items article\{[^}]*border:0[^}]*background:transparent/s);
  assert.match(desktopCss, /#service \.imd-cta-split\{(?=[^}]*min-width:380px)(?=[^}]*align-self:start)(?=[^}]*background:var\(--service-navy\))[^}]*\}/s);
});
```

- [ ] **Step 3: Add responsive assertions**

```js
test('service editorial composition adapts without horizontal overflow primitives', () => {
  const tabletCss = finalMediaBlock('@media(max-width:1120px){');
  const mobileCss = finalMediaBlock('@media(max-width:768px){');
  assert.match(tabletCss, /#service \.imd-bottom-panel\{[^}]*grid-template-columns:1fr/s);
  assert.match(tabletCss, /#service \.imd-process-grid\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\))/s);
  assert.match(mobileCss, /#service \.imd-process-grid\{[^}]*grid-template-columns:1fr/s);
  assert.match(mobileCss, /#service \.imd-process-grid::before\{(?=[^}]*width:1px)(?=[^}]*height:auto)[^}]*\}/s);
  assert.match(mobileCss, /#service \.imd-bottom-panel\{[^}]*grid-template-columns:1fr/s);
});
```

- [ ] **Step 4: Run the focused test and verify RED**

Run: `node --test test/service-section-redesign.test.js`

Expected: failures identify the existing three-card tier, missing continuous connector, old compact spacing, and light CTA surface.

- [ ] **Step 5: Commit the failing tests**

```bash
git add test/service-section-redesign.test.js
git commit -m "Test service editorial composition"
```

### Task 2: Merge the benefits markup without changing content

**Files:**
- Modify: `index.html:318-361`
- Test: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: Existing `.imd-benefit-card--primary`, `.imd-why-items`, `.imd-why-icon`, and `.imd-cta-split` classes.
- Produces: One four-item `.imd-why-items` grid followed by the existing CTA.

- [ ] **Step 1: Move the two secondary benefits into the primary benefits grid**

The resulting support tier must have this direct-child order:

```html
<section class="imd-bottom-panel imd-glass">
  <div class="imd-benefit-card imd-benefit-card--primary">
    <h3>Warum Unternehmen IMD wählen</h3>
    <div class="imd-why-items">
      <!-- Sicher & zuverlässig -->
      <!-- Zeit- & ressourcensparend -->
      <!-- Bestmöglicher Preis -->
      <!-- Persönlicher Partner -->
    </div>
  </div>
  <div class="imd-cta-split">
    <!-- Existing CTA content unchanged -->
  </div>
</section>
```

Delete only the now-empty `.imd-benefit-card--secondary` wrapper and its duplicate heading. Preserve every feature icon, title, description, and CTA string exactly.

- [ ] **Step 2: Run the structural tests**

Run: `node --test test/service-section-redesign.test.js`

Expected: the lower-tier markup test passes; CSS composition tests remain RED.

- [ ] **Step 3: Verify hero markup is unchanged**

Run: `git diff --word-diff=porcelain -- index.html`

Expected: the diff is confined to the `.imd-bottom-panel` block; no `.imd-hero` line changes.

- [ ] **Step 4: Commit the markup change**

```bash
git add index.html test/service-section-redesign.test.js
git commit -m "Unify service benefits content"
```

### Task 3: Build the desktop editorial rhythm

**Files:**
- Modify: `style.css:3149-3357`
- Test: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: The combined benefits markup from Task 2 and current `--service-*` tokens.
- Produces: A continuous process flow and a content-driven 60/40 Benefits + CTA layout.

- [ ] **Step 1: Expand the section rhythm without changing the hero**

Within `@media(min-width:1101px)`, set `.imd-page` to `gap:clamp(48px,4vw,64px)` while leaving all `.imd-hero`, `.imd-hero-card`, and `.imd-cost-card` declarations unchanged.

- [ ] **Step 2: Convert the process panel into one full-width composition**

Use a single-column panel with `padding:clamp(32px,3vw,40px)`, center it at `width:min(1360px,100%)`, place `.imd-intro-text` above the flow, and cap `.imd-process-grid` at `1120px`.

Implement the connector as `.imd-process-grid::before` with `left:12.5%`, `right:12.5%`, a one-pixel existing-border-color line, and `z-index:0`. Give every article equal grid width and no border/background/shadow. Put icons and text at `position:relative; z-index:1`; icon backgrounds mask the line. Apply the same `max-width` to all process descriptions and keep them to two rendered lines.

- [ ] **Step 3: Create the open 2x2 benefits grid**

Set `.imd-bottom-panel` to `grid-template-columns:minmax(0,3fr) minmax(380px,2fr)`, `gap:clamp(24px,2vw,32px)`, and `align-items:start`. Use `32–40px` padding on the outer benefits block. Set `.imd-why-items` to two equal columns with generous row and column gaps. Keep articles transparent and borderless, remove item dividers, and align identical `42px` icons in grid flow.

- [ ] **Step 4: Make the existing CTA compact and contrasting**

Set `.imd-cta-split` to `min-width:380px`, `align-self:start`, natural height, `32–40px` padding, and existing `var(--service-navy)` background. Reuse `var(--service-highlight)` and existing translucent highlight text values for contrast. Remove `margin-top:auto` from the CTA button and replace it with a natural `20–24px` content gap. Keep the one existing `<small>` note.

- [ ] **Step 5: Remove obsolete wide-desktop compaction overrides**

In the `min-width:1260px`, `1120px–1440px`, and `min-width:1440px` blocks, remove declarations that recreate the three-card grid, force equal heights, shrink the process into a rail, or switch the process to 2x2 at desktop widths. Preserve all hero and background-image rules.

- [ ] **Step 6: Run focused tests and verify desktop GREEN**

Run: `node --test test/service-section-redesign.test.js`

Expected: desktop and structural assertions pass; any remaining failures are responsive-only.

- [ ] **Step 7: Commit desktop composition**

```bash
git add style.css test/service-section-redesign.test.js
git commit -m "Compose service process and support tier"
```

### Task 4: Implement tablet and mobile flow

**Files:**
- Modify: `style.css:3359-3392`
- Test: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: Desktop process and support-tier rules from Task 3.
- Produces: Tablet stacking and a connected mobile timeline with no horizontal overflow.

- [ ] **Step 1: Implement tablet behavior**

In `@media(max-width:1120px)`, keep the process as a four-column connected flow while readable, stack `.imd-bottom-panel` to one column, set `.imd-cta-split` to `width:100%; min-width:0`, and retain the 2x2 benefits grid. Preserve the current two-column tablet hero.

- [ ] **Step 2: Implement the mobile connected timeline**

In `@media(max-width:768px)`, set `.imd-process-grid` to one column. Change its connector pseudo-element into a vertical line with `left:22px`, `top:22px`, `bottom:22px`, `width:1px`, and `height:auto`. Keep every step transparent and borderless; align each icon over the line and text in the adjacent column.

- [ ] **Step 3: Make benefits responsive without dashboard cards**

Keep `.imd-why-items` at two columns from 621–768px. Add `@media(max-width:620px)` to change it to one column. Use whitespace between items and no per-item border/background/shadow at either width. CTA remains after Benefits and full width.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `node --test test/service-section-redesign.test.js`

Expected: all focused tests pass.

- [ ] **Step 5: Commit responsive composition**

```bash
git add style.css test/service-section-redesign.test.js
git commit -m "Adapt service editorial layout responsively"
```

### Task 5: Verify behavior and visual composition

**Files:**
- Verify: `index.html`
- Verify: `style.css`
- Verify: `main.js`
- Verify: `server.js`
- Verify: `test/*.test.js`

**Interfaces:**
- Consumes: Completed HTML and CSS composition.
- Produces: Evidence that the implementation preserves behavior, responsive layout, and existing hero styling.

- [ ] **Step 1: Run the complete relevant test suite**

Run:

```bash
node --test test/comparison-stage.test.js test/homepage-redesign.test.js test/opening-color-refresh.test.js test/public-routes.test.js test/service-section-redesign.test.js
node --check main.js
node --check server.js
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 2: Verify large desktop visually**

At approximately `1904x957`, confirm: hero unchanged; 48–64px section rhythm; process centered and continuous; connector behind icons; four aligned steps; 60/40 lower layout; CTA at least 380px wide and content-driven.

- [ ] **Step 3: Verify tablet visually**

At approximately `1024x900`, confirm: existing two-column hero preserved; process remains readable; Benefits and CTA stack; CTA is full width; no horizontal overflow.

- [ ] **Step 4: Verify mobile visually**

At approximately `390x844`, confirm: process is a connected vertical timeline; benefits are one column; CTA follows; no card-like feature boxes; no horizontal overflow.

- [ ] **Step 5: Inspect final diff and commit any verification-only test corrections**

Run: `git status --short && git diff --check`

Expected: no unrelated files and no whitespace errors. If the tree is already clean, do not create an empty commit.
