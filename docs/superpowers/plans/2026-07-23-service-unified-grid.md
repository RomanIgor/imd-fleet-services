# Service Unified Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align every desktop service row to one 1180px grid and remove artificial card height so the section looks proportional and content-driven.

**Architecture:** Extend only the final `min-width:1260px` service refinement. Use one centered width for the hero, process, and closing rows; align hero and closing children to the top; remove desktop-only minimum heights that create empty space. Existing mid-desktop, tablet, and mobile cascades remain unchanged.

**Tech Stack:** HTML, CSS, Node.js built-in test runner

## Global Constraints

- Unified grid applies only at `min-width:1260px`.
- All three desktop rows use `width:min(1180px,100%)`.
- Opening cards align to the top and preserve a flexible central logo opening.
- Closing children are content-driven and do not stretch to equal height.
- Body copy remains at least `15px`, metadata and tags remain at least `12px`, and desktop interactive targets remain at least `48px`.
- No clipping, hidden content, or horizontal overflow.

---

### Task 1: Unify desktop geometry and remove empty card volume

**Files:**
- Modify: `test/service-section-redesign.test.js`
- Modify: `style.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: existing `#service` markup and the final `@media(min-width:1260px)` cascade.
- Produces: one shared desktop axis and content-driven card geometry; no JavaScript interface changes.

- [ ] **Step 1: Write failing source-regression assertions**

In `test/service-section-redesign.test.js`, assert that the final desktop block contains:

```js
assert.match(logoSafeCss, /#service \.imd-hero\{(?=[^}]*width:min\(1180px,100%\))(?=[^}]*justify-self:center)(?=[^}]*align-items:start)[^}]*\}/s);
assert.match(logoSafeCss, /#service \.imd-process-panel\{[^}]*width:min\(1180px,100%\)/s);
assert.match(logoSafeCss, /#service \.imd-bottom-panel\{(?=[^}]*width:min\(1180px,100%\))(?=[^}]*align-items:start)[^}]*\}/s);
assert.match(logoSafeCss, /#service \.imd-why-items article\{[^}]*min-height:0/s);
assert.match(logoSafeCss, /#service \.imd-cta-split\{(?=[^}]*min-height:0)(?=[^}]*align-self:start)[^}]*\}/s);
```

- [ ] **Step 2: Run the regression test and confirm RED**

Run:

```bash
node --test --test-name-pattern "unified desktop grid" test/service-section-redesign.test.js
```

Expected: FAIL because the hero does not yet use the shared width and closing children still stretch.

- [ ] **Step 3: Implement the final desktop refinement**

In `style.css`, update the final `@media(min-width:1260px)` rules:

```css
#service .imd-hero{
  width:min(1180px,100%);
  justify-self:center;
  grid-template-columns:420px minmax(300px,1fr) 300px;
  gap:32px;
  align-items:start;
}
#service .imd-process-panel{width:min(1180px,100%);justify-self:center}
#service .imd-bottom-panel{
  width:min(1180px,100%);
  justify-self:center;
  align-items:start;
}
#service .imd-why-items article{min-height:0}
#service .imd-cta-split{min-height:0;align-self:start}
```

Retain existing 12px/15px typography and concise tag labels. Increment the stylesheet cache key in `index.html` and its regression assertions.

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run:

```bash
node --test test/comparison-stage.test.js test/opening-color-refresh.test.js test/service-section-redesign.test.js
```

Expected: all focused tests pass.

- [ ] **Step 5: Verify rendered geometry**

At `1904×957` and `1920×1080`, measure:

```js
{
  heroWidth,
  processWidth,
  bottomWidth,
  heroTopAlignment,
  closingTopAlignment,
  tagOverflow,
  horizontalOverflow
}
```

Expected:

```text
heroWidth = processWidth = bottomWidth = 1180
heroTopAlignment = true
closingTopAlignment = true
tagOverflow = false
horizontalOverflow = 0
```

- [ ] **Step 6: Run static verification**

Run:

```bash
node --check main.js
node --check server.js
git diff --check
git status -sb
```

Expected: syntax and diff checks exit successfully; only intended files are modified.

- [ ] **Step 7: Commit**

```bash
git add index.html style.css test/comparison-stage.test.js test/opening-color-refresh.test.js test/service-section-redesign.test.js
git commit -m "Unify service desktop card grid"
```
