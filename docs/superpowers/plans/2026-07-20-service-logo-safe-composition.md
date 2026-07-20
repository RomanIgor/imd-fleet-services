# Service Logo-Safe Composition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the visual bulk of the compact desktop service panels and preserve a recognizable central view of the embossed IMD logo.

**Architecture:** Add a final `min-width:1260px` logo-safe refinement after the existing desktop service layer. Keep the process grid in a symmetric 2×2 arrangement from `1121–1439px`; at `>=1260px`, constrain the two opening cards toward the outer edges and use fluid supporting bands; at `>=1440px`, explicitly restore the compact four-step horizontal process row, its connectors, and dividers. The revised desktop process geometry caps the intro track at 250px, uses a 44px icon/text track with 10px gaps and article padding, and retains 15px body copy with `break-word` safety for long German compounds.

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
- Consumes: the final `@media(min-width:1260px)` service refinement.
- Produces: source-level guardrails for the logo-safe opening and narrower supporting bands.

- [ ] **Step 1: Add a failing opening-row test**

```js
test('service desktop opening preserves a central logo-safe area', () => {
  const logoSafeCss = finalMediaBlock('@media(min-width:1260px){');
  assert.match(logoSafeCss, /#service \.imd-hero\{(?=[^}]*grid-template-columns:470px minmax\(300px,1fr\) 330px)(?=[^}]*gap:32px)[^}]*\}/s);
  assert.match(logoSafeCss, /#service \.imd-hero-card\{(?=[^}]*max-width:470px)(?=[^}]*padding:22px 28px)[^}]*\}/s);
  assert.match(logoSafeCss, /#service \.imd-cost-card\{(?=[^}]*max-width:330px)(?=[^}]*justify-self:end)[^}]*\}/s);
});
```

- [ ] **Step 2: Add a failing supporting-band test**

```js
test('service desktop supporting bands frame rather than cover the photograph', () => {
  const logoSafeCss = finalMediaBlock('@media(min-width:1260px){');
  assert.match(logoSafeCss, /#service \.imd-process-panel\{(?=[^}]*width:min\(1240px,100%\))(?=[^}]*justify-self:center)[^}]*\}/s);
  assert.match(logoSafeCss, /#service \.imd-bottom-panel\{(?=[^}]*width:min\(1240px,100%\))(?=[^}]*justify-self:center)[^}]*\}/s);
});
```

- [ ] **Step 3: Add a failing range-boundary test**

```js
test('service logo-safe geometry begins only at the large desktop boundary', () => {
  const compactDesktopCss = finalMediaBlock('@media(min-width:1121px){');
  const logoSafeCss = finalMediaBlock('@media(min-width:1260px){');

  assert.doesNotMatch(compactDesktopCss, /#service \.imd-hero\{[^}]*grid-template-columns:470px minmax\(300px,1fr\) 330px/s);
  assert.doesNotMatch(compactDesktopCss, /#service \.imd-process-panel\{[^}]*width:min\(1240px,100%\)/s);
  assert.doesNotMatch(compactDesktopCss, /#service \.imd-bottom-panel\{[^}]*width:min\(1240px,100%\)/s);
  assert.match(logoSafeCss, /#service \.imd-process-panel\{[^}]*width:min\(1240px,100%\)/s);
});
```

- [ ] **Step 4: Confirm RED and commit tests**

```powershell
node --test test/service-section-redesign.test.js
git add test/service-section-redesign.test.js
git commit -m "Test logo-safe service composition"
```

Expected: the three new tests fail because the logo-safe geometry is not present at `>=1260px`.

---

### Task 2: Implement the logo-safe desktop refinement

**Files:**
- Modify: `style.css`
- Test: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: current compact desktop layout and palette variables.
- Produces: a visually lighter frame around the photographic logo at `>=1260px`.

- [ ] **Step 1: Refine the opening row**

Add as a final `@media(min-width:1260px)` block after the established `>=1121px` compact layer:

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
  width:min(1240px,100%);
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

Update `index.html` from `service-logo-safe-4` to `service-logo-safe-5`, update all related regression assertions, then run the focused suite again.

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

Confirm the loaded URL is `style.css?v=service-logo-safe-5`, the nav and complete service section fit without another scroll at `>=1260px`, and the central embossed logo is immediately recognizable.

- [ ] **Step 2: Measure panel and logo relationships**

Confirm the opening left card width is at most 470px, the right card width is at most 330px, and the process and closing bands use `width:min(1240px,100%)` (at most 1240px on wide screens and full page width at the boundary). At `>=1440px`, confirm the process intro is at most 250px, each icon is 44px, and the 10px process spacing preserves readable 15px copy; also confirm there is no horizontal overflow and benefit icon/title rectangles are disjoint.

- [ ] **Step 3: Inspect 1440×900 and 390×844**

At 1121–1439px, confirm the process steps form a symmetric 2×2 grid with no arrows. At 1440×900, confirm the logo remains readable and the four-step horizontal row, connectors, and dividers are restored. At 390×844, confirm no production change to the single-column flow and CTA target.

- [ ] **Step 4: Request whole-branch review and run final checks**

```powershell
node --test test/comparison-stage.test.js test/opening-color-refresh.test.js test/service-section-redesign.test.js
node --check main.js
node --check server.js
git diff --check
git status --short
```

Resolve all Critical and Important findings before integration.
