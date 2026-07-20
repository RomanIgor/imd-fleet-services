# Service Logo-Safe Composition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the visual bulk of the compact desktop service panels and preserve a recognizable central view of the embossed IMD logo.

**Architecture:** Add a final `min-width:1121px` logo-safe refinement inside the existing desktop service layer. Constrain the two opening cards toward the outer edges, reduce the widths of the process and closing bands, and preserve solid palette surfaces and accessible typography.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner.

## Global Constraints

- The complete service section must remain within the 1008px usable area at 1920×1080 after the 72px navigation.
- The embossed logo in `assets/showroom-background.png` must remain immediately recognizable between the opening cards.
- Body copy stays at least 15px and metadata at least 12px.
- Keep solid IMD concrete/navy surfaces; no glass transparency and no duplicated logo overlay.
- Preserve the flow-based benefit icon fix, WCAG AA states, 48–52px CTA targets, reduced motion, and tablet/mobile production behavior.

---

### Task 1: Add logo-safe geometry regression tests

**Files:**
- Modify: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: the final `@media(min-width:1121px)` service refinement.
- Produces: source-level guardrails for the logo-safe opening and narrower supporting bands.

- [ ] **Step 1: Add a failing opening-row test**

```js
test('service desktop opening preserves a central logo-safe area', () => {
  const logoSafeCss = finalMediaBlock('@media(min-width:1121px){');
  assert.match(logoSafeCss, /#service \.imd-hero\{(?=[^}]*grid-template-columns:470px minmax\(300px,1fr\) 330px)(?=[^}]*gap:32px)[^}]*\}/s);
  assert.match(logoSafeCss, /#service \.imd-hero-card\{(?=[^}]*max-width:470px)(?=[^}]*padding:22px 28px)[^}]*\}/s);
  assert.match(logoSafeCss, /#service \.imd-cost-card\{(?=[^}]*max-width:330px)(?=[^}]*justify-self:end)[^}]*\}/s);
});
```

- [ ] **Step 2: Add a failing supporting-band test**

```js
test('service desktop supporting bands frame rather than cover the photograph', () => {
  const logoSafeCss = finalMediaBlock('@media(min-width:1121px){');
  assert.match(logoSafeCss, /#service \.imd-process-panel\{(?=[^}]*width:min\(1340px,calc\(100% - 140px\)\))(?=[^}]*justify-self:center)[^}]*\}/s);
  assert.match(logoSafeCss, /#service \.imd-bottom-panel\{(?=[^}]*width:min\(1340px,calc\(100% - 140px\)\))(?=[^}]*justify-self:center)[^}]*\}/s);
});
```

- [ ] **Step 3: Confirm RED and commit tests**

```powershell
node --test test/service-section-redesign.test.js
git add test/service-section-redesign.test.js
git commit -m "Test logo-safe service composition"
```

Expected: the two new tests fail because the logo-safe geometry is not present.

---

### Task 2: Implement the logo-safe desktop refinement

**Files:**
- Modify: `style.css`
- Test: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: current compact desktop layout and palette variables.
- Produces: a visually lighter frame around the photographic logo at `>=1121px`.

- [ ] **Step 1: Refine the opening row**

Add to the existing final `@media(min-width:1121px)` block:

```css
#service .imd-hero{
  grid-template-columns:470px minmax(300px,1fr) 330px;
  gap:32px;
}
#service .imd-hero-card{
  max-width:470px;
  padding:22px 28px;
  justify-self:start;
}
#service .imd-cost-card{
  max-width:330px;
  padding:20px 24px;
  justify-self:end;
}
```

- [ ] **Step 2: Reduce heading scale without touching body minima**

```css
#service .imd-h1{font-size:clamp(34px,2.5vw,40px);line-height:1.05}
#service .imd-cost-h{font-size:22px}
```

- [ ] **Step 3: Narrow the supporting bands**

```css
#service .imd-process-panel,
#service .imd-bottom-panel{
  width:min(1340px,calc(100% - 140px));
  justify-self:center;
}
#service .imd-process-panel{padding:14px 20px}
#service .imd-why-compact{padding:16px 20px}
```

- [ ] **Step 4: Confirm GREEN and run focused verification**

```powershell
node --test test/comparison-stage.test.js test/opening-color-refresh.test.js test/service-section-redesign.test.js
node --check main.js
node --check server.js
git diff --check
```

Expected: all focused tests pass and checks exit 0.

- [ ] **Step 5: Refresh the stylesheet cache key and commit**

Update `index.html` from `service-viewport-compaction-1` to `service-logo-safe-1`, update its regression assertion, then run the focused suite again.

```powershell
git add style.css index.html test/service-section-redesign.test.js
git commit -m "Frame service content around IMD logo"
```

---

### Task 3: Visual acceptance and final review

**Files:**
- Modify only if visual evidence exposes a regression: `style.css`, `index.html`, `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: the logo-safe CSS and new cache key.
- Produces: recorded post-fix visual evidence and a reviewed branch.

- [ ] **Step 1: Inspect 1920×1080 after a hard reload**

Confirm the loaded URL is `style.css?v=service-logo-safe-1`, the nav and complete service section fit without another scroll, and the central embossed logo is immediately recognizable.

- [ ] **Step 2: Measure panel and logo relationships**

Confirm the opening left card width is at most 470px, the right card width is at most 330px, the process and closing bands are at most 1340px, there is no horizontal overflow, and benefit icon/title rectangles are disjoint.

- [ ] **Step 3: Inspect 1440×900 and 390×844**

At 1440×900, confirm the logo remains readable and wrapping remains professional. At 390×844, confirm no production change to the single-column flow and CTA target.

- [ ] **Step 4: Request whole-branch review and run final checks**

```powershell
node --test test/comparison-stage.test.js test/opening-color-refresh.test.js test/service-section-redesign.test.js
node --check main.js
node --check server.js
git diff --check
git status --short
```

Resolve all Critical and Important findings before integration.
