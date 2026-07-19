# Service Section Professional Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage `#service` section into a professional hybrid editorial composition using the official IMD Concrete Design System and modern accessibility standards.

**Architecture:** Keep the existing semantic HTML and application behavior intact. Replace the recent pale `#service` color overrides with one final, scoped CSS composition layer that controls hierarchy, surfaces, typography, spacing, and responsive behavior; protect it with source-level regression tests and visual checks at the reported viewport sizes.

**Tech Stack:** HTML5, CSS, Node.js built-in test runner, existing local SVG assets

## Global Constraints

- Modify only the homepage service section, its scoped CSS, stylesheet cache version, and related tests.
- Preserve all existing German copy, claims, links, icon assets, and behavior.
- Do not modify or commit `new_design_final/`.
- Use `#CAC9C4`, `#B3B4B0`, `#E5E4DF`, `#D6D6D2`, `#202A3B`, `#1C2228`, `#4C5257`, `#777A78`, `#9A9C99`, `#BCBDB9`, `#36A2C5`, and `#278FB4` according to the approved specification.
- Keep Corporate Blue and status colors at no more than approximately 3% of the section.
- Do not add decorative glow effects or strong gradients.
- Do not recolor or reinterpret the official IMD logo.
- Normal text contrast must meet WCAG 2.2 AA `4.5:1`; large text must meet `3:1`.
- Interactive targets must satisfy the WCAG `24×24px` minimum; the primary CTA must be at least `48px` desktop and `44px` mobile.
- Validate at `1920×900`, `1440×900`, and `390×844`.

---

### Task 1: Lock the approved palette and structural hierarchy with regression tests

**Files:**
- Create: `test/service-section-redesign.test.js`
- Modify: `index.html:10`
- Modify: `test/comparison-stage.test.js`

**Interfaces:**
- Consumes: existing `#service` markup and `style.css` source.
- Produces: source assertions for palette, hierarchy, typography, CTA sizing, mobile composition, and cache key `service-professional-redesign-11`.

- [ ] **Step 1: Write the failing source test**

Create `test/service-section-redesign.test.js` with:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');

test('service redesign uses the binding IMD concrete palette', () => {
  assert.match(css, /#service\{--service-concrete:#CAC9C4;--service-medium:#B3B4B0;--service-highlight:#E5E4DF;--service-card:#D6D6D2;--service-navy:#202A3B;--service-graphite:#1C2228;--service-body:#4C5257;--service-muted:#777A78;--service-border:#9A9C99;--service-soft-border:#BCBDB9;--service-blue:#36A2C5;--service-blue-hover:#278FB4\}/);
  assert.match(html, /style\.css\?v=service-professional-redesign-11/);
});

test('service opening area has a navy primary panel and restrained card surface', () => {
  assert.match(css, /#service \.imd-hero-card\{[^}]*background:var\(--service-navy\)[^}]*color:var\(--service-highlight\)/s);
  assert.match(css, /#service \.imd-cost-card\{[^}]*background:var\(--service-card\)/s);
  assert.match(css, /#service \.imd-h1\{[^}]*font-size:clamp\(40px,[^,]+,48px\)/s);
  assert.match(css, /#service \.imd-subline\{[^}]*font-size:16px/s);
});

test('service process is one coherent editorial band', () => {
  assert.match(css, /#service \.imd-process-panel\{[^}]*background:rgba\(229,228,223,\.72\)/s);
  assert.match(css, /#service \.imd-process-grid article\{[^}]*background:transparent[^}]*border:0/s);
  assert.match(css, /#service \.imd-process-line-icon\{[^}]*background:var\(--service-navy\)/s);
});

test('service benefits avoid an administrative boxed grid', () => {
  assert.match(css, /#service \.imd-why-items article\{[^}]*background:transparent[^}]*border:0/s);
  assert.match(css, /#service \.imd-why-items article:not\(:last-child\)::after/);
  assert.match(css, /#service \.imd-why-items p\{[^}]*font-size:14px/s);
});

test('service CTA and keyboard focus are accessible', () => {
  assert.match(css, /#service \.imd-cta-split\{[^}]*background:var\(--service-navy\)/s);
  assert.match(css, /#service \.imd-button\{[^}]*min-height:48px/s);
  assert.match(css, /#service \.imd-button:focus-visible\{[^}]*outline:2px solid var\(--service-blue\)/s);
});

test('service mobile layout is content-driven and deliberately stacked', () => {
  assert.match(css, /@media\(max-width:768px\)[\s\S]*#service \.imd-hero\{[^}]*grid-template-columns:1fr/s);
  assert.match(css, /@media\(max-width:768px\)[\s\S]*#service \.imd-process-grid\{[^}]*grid-template-columns:1fr/s);
  assert.match(css, /@media\(max-width:768px\)[\s\S]*#service \.imd-button\{[^}]*min-height:44px/s);
  assert.doesNotMatch(css, /#service\{[^}]*max-height:/s);
});
```

- [ ] **Step 2: Run the test and verify the red state**

Run:

```powershell
node --test test/service-section-redesign.test.js
```

Expected: six failures because the final service tokens and composition rules do not exist yet.

- [ ] **Step 3: Update the stylesheet cache key**

In `index.html`, change:

```html
<link rel="stylesheet" href="style.css?v=opening-color-refresh-10">
```

to:

```html
<link rel="stylesheet" href="style.css?v=service-professional-redesign-11">
```

Replace every `opening-color-refresh-10` assertion in `test/comparison-stage.test.js` with `service-professional-redesign-11` so the comparison regression suite continues to validate the active stylesheet.

- [ ] **Step 4: Run the test again**

Run:

```powershell
node --test test/service-section-redesign.test.js test/comparison-stage.test.js
```

Expected: comparison tests pass; service redesign tests still fail on missing CSS.

- [ ] **Step 5: Commit the test boundary**

```powershell
git add -- index.html test/service-section-redesign.test.js test/comparison-stage.test.js
git commit -m "Test professional service section redesign"
```

---

### Task 2: Implement the desktop editorial composition

**Files:**
- Modify: `style.css:3093-end`
- Test: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: the existing `.imd-page`, `.imd-hero`, `.imd-hero-card`, `.imd-cost-card`, `.imd-process-panel`, `.imd-process-grid`, `.imd-bottom-panel`, `.imd-why-items`, and `.imd-cta-split` markup.
- Produces: a scoped desktop composition under `#service` with no JavaScript dependency.

- [ ] **Step 1: Remove the failed pale service overrides**

Inside the existing `/* Opening sections color refresh */` block, remove only the rules beginning with the comment:

```css
/* Fahrzeugverkauf: concrete glass, graphite copy, navy controls. */
```

and ending immediately before:

```css
/* Six-step process: concrete stage with navy markers and blue active state. */
```

Keep the Hero and `#prozess` rules unchanged.

- [ ] **Step 2: Add the binding service tokens and section background**

Append this new layer at the end of `style.css`:

```css
/* Professional Fahrzeugverkauf redesign */
#service{--service-concrete:#CAC9C4;--service-medium:#B3B4B0;--service-highlight:#E5E4DF;--service-card:#D6D6D2;--service-navy:#202A3B;--service-graphite:#1C2228;--service-body:#4C5257;--service-muted:#777A78;--service-border:#9A9C99;--service-soft-border:#BCBDB9;--service-blue:#36A2C5;--service-blue-hover:#278FB4}
#service{min-height:0;padding:88px 0 96px;background-color:var(--service-concrete);background-image:linear-gradient(90deg,rgba(28,34,40,.08),transparent 28%,transparent 72%,rgba(28,34,40,.10)),url('assets/showroom-background.png');background-size:cover,cover;background-position:center,center;background-repeat:no-repeat;color:var(--service-graphite)}
#service::before{background:linear-gradient(180deg,rgba(229,228,223,.12),transparent 34%,rgba(28,34,40,.06));opacity:1}
#service::after{display:none}
#service .imd-page{width:min(1480px,calc(100% - 96px));display:grid;grid-template-rows:auto auto auto;gap:32px}
```

- [ ] **Step 3: Implement the opening hierarchy**

Append:

```css
#service .imd-hero{min-height:430px;display:grid;grid-template-columns:minmax(440px,560px) 1fr minmax(330px,390px);gap:42px;align-items:center}
#service .imd-glass{border:1px solid rgba(154,156,153,.58);box-shadow:0 18px 44px rgba(28,34,40,.14);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
#service .imd-hero-card{width:100%;max-width:560px;margin:0;padding:42px 44px;background:var(--service-navy);border-color:rgba(229,228,223,.18);border-radius:20px;color:var(--service-highlight);box-shadow:0 26px 56px rgba(28,34,40,.22)}
#service .imd-hero-card .imd-eyebrow{color:rgba(229,228,223,.68)}
#service .imd-h1{margin:0 0 22px;font-size:clamp(40px,3.3vw,48px);line-height:1.04;letter-spacing:-.035em;color:var(--service-highlight)}
#service .imd-subline{max-width:440px;margin:0 0 26px;font-size:16px;line-height:1.65;color:rgba(229,228,223,.78)}
#service .imd-tags{gap:8px}
#service .imd-tags span{min-height:34px;padding:0 12px;background:rgba(229,228,223,.08);border:1px solid rgba(229,228,223,.22);color:var(--service-highlight)}
#service .imd-tags img{filter:brightness(0) invert(1);opacity:.84}
#service .imd-cost-card{grid-column:3;width:100%;max-width:390px;margin:0;padding:32px 34px;background:var(--service-card);border-color:var(--service-soft-border);border-radius:18px;color:var(--service-graphite);box-shadow:0 18px 42px rgba(28,34,40,.13)}
#service .imd-cost-card .imd-eyebrow{color:var(--service-navy)}
#service .imd-cost-h{margin-bottom:20px;font-size:25px;line-height:1.15;color:var(--service-graphite)}
#service .imd-cost-list li{min-height:38px;padding:9px 0;border-bottom-color:rgba(154,156,153,.38);font-size:14px;color:var(--service-body)}
#service .imd-cost-list img{filter:brightness(0) saturate(100%) invert(12%) sepia(12%) saturate(1033%) hue-rotate(180deg) brightness(95%) contrast(92%)}
#service .imd-note{padding-top:14px;font-size:12px;line-height:1.5;color:var(--service-muted)}
```

- [ ] **Step 4: Implement the coherent process band**

Append:

```css
#service .imd-process-panel{width:100%;min-height:168px;margin:0;padding:28px 30px;display:grid;grid-template-columns:minmax(250px,300px) 1fr;gap:32px;align-items:center;background:rgba(229,228,223,.72);border-color:rgba(154,156,153,.52);border-radius:20px;box-shadow:0 18px 44px rgba(28,34,40,.12)}
#service .imd-process-panel .imd-intro-text{padding:0 28px 0 0;border-right:1px solid rgba(154,156,153,.46)}
#service .imd-process-panel .imd-intro-text h3{margin:0 0 12px;font-size:21px;line-height:1.25;color:var(--service-graphite)}
#service .imd-process-panel .imd-intro-text p{margin:0 0 8px;font-size:14px;line-height:1.55;color:var(--service-body)}
#service .imd-process-panel .imd-intro-text .imd-strong{color:var(--service-navy)}
#service .imd-process-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0}
#service .imd-process-grid article{min-height:108px;padding:12px 20px;display:grid;grid-template-columns:52px 1fr;grid-template-rows:auto auto auto;column-gap:14px;align-content:center;background:transparent;border:0;border-radius:0;box-shadow:none}
#service .imd-process-grid article:not(:last-child){border-right:1px solid rgba(154,156,153,.38)}
#service .imd-process-grid article:not(:last-child)::after{content:"→";right:-7px;width:14px;text-align:center;background:rgba(229,228,223,.92);color:var(--service-muted)}
#service .imd-process-line-icon{width:48px;height:48px;background:var(--service-navy);border:1px solid var(--service-navy);border-radius:12px}
#service .imd-process-line-icon img{width:25px;height:25px;filter:brightness(0) invert(1);opacity:.94}
#service .imd-process-number{font-size:12px;color:var(--service-muted)}
#service .imd-process-grid h4{margin:4px 0 5px;font-size:14px;color:var(--service-graphite)}
#service .imd-process-grid p{font-size:13px;line-height:1.45;color:var(--service-body)}
```

- [ ] **Step 5: Implement editorial benefits and the Navy CTA**

Append:

```css
#service .imd-bottom-panel{width:100%;margin:0;padding:0;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(380px,.65fr);gap:32px;background:transparent;border:0;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none}
#service .imd-why-compact{padding:28px 0 0;background:transparent;border:0;box-shadow:none}
#service .imd-why-compact h3{margin:0 0 24px;font-size:22px;color:var(--service-graphite)}
#service .imd-why-items{height:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 30px}
#service .imd-why-items article{position:relative;min-height:112px;padding:20px 12px 20px 58px;display:block;background:transparent;border:0;border-radius:0;box-shadow:none}
#service .imd-why-items article:not(:last-child)::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:rgba(154,156,153,.44)}
#service .imd-why-icon{position:absolute;left:0;top:22px;width:42px;height:42px;margin:0;display:grid;place-items:center;background:rgba(32,42,59,.08);border:1px solid rgba(32,42,59,.24);border-radius:12px}
#service .imd-why-icon img{width:22px;height:22px;filter:brightness(0) saturate(100%) invert(12%) sepia(12%) saturate(1033%) hue-rotate(180deg) brightness(95%) contrast(92%)}
#service .imd-why-items h4{margin:0 0 6px;font-size:15px;color:var(--service-graphite)}
#service .imd-why-items p{font-size:14px;line-height:1.5;color:var(--service-body)}
#service .imd-cta-split{min-height:100%;padding:34px 36px;display:flex;flex-direction:column;background:var(--service-navy);border:1px solid rgba(229,228,223,.16);border-radius:20px;color:var(--service-highlight);box-shadow:0 22px 48px rgba(28,34,40,.20)}
#service .imd-cta-split h3{margin:0 0 12px;font-size:24px;line-height:1.2;color:var(--service-highlight)}
#service .imd-cta-split p,#service .imd-cta-split li,#service .imd-cta-split small{color:rgba(229,228,223,.72)}
#service .imd-cta-split p{font-size:15px}
#service .imd-cta-split li{font-size:14px}
#service .imd-cta-split li img{filter:brightness(0) invert(1);opacity:.88}
#service .imd-button{min-height:48px;margin-top:auto;background:var(--service-highlight);border:1px solid var(--service-highlight);color:var(--service-navy);font-size:14px}
#service .imd-button:hover{background:var(--service-blue-hover);border-color:var(--service-blue-hover);color:#fff}
#service .imd-button:focus-visible{outline:2px solid var(--service-blue);outline-offset:4px}
#service .imd-cta-split small{font-size:12px}
```

- [ ] **Step 6: Run the focused tests**

Run:

```powershell
node --test test/service-section-redesign.test.js test/comparison-stage.test.js
```

Expected: all tests pass.

- [ ] **Step 7: Commit the desktop redesign**

```powershell
git add -- style.css
git commit -m "Redesign service section hierarchy"
```

---

### Task 3: Build the deliberate mobile composition and verify the result

**Files:**
- Modify: `style.css`
- Test: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: the desktop `#service` tokens and composition from Task 2.
- Produces: a content-driven single-column layout at `768px` and below, plus final visual acceptance evidence.

- [ ] **Step 1: Add responsive tablet behavior**

Append:

```css
@media(max-width:1120px){
  #service{padding:72px 0 80px}
  #service .imd-page{width:min(calc(100% - 48px),980px)}
  #service .imd-hero{grid-template-columns:minmax(360px,1fr) minmax(300px,.75fr);min-height:0;gap:28px}
  #service .imd-hero-card{max-width:none}
  #service .imd-cost-card{grid-column:2;max-width:none}
  #service .imd-process-panel{grid-template-columns:1fr;padding:28px}
  #service .imd-process-panel .imd-intro-text{padding:0 0 22px;border-right:0;border-bottom:1px solid rgba(154,156,153,.46)}
  #service .imd-process-grid article{padding-inline:14px}
  #service .imd-bottom-panel{grid-template-columns:1fr minmax(330px,.7fr);gap:24px}
}
```

- [ ] **Step 2: Add the deliberate mobile sequence**

Append:

```css
@media(max-width:768px){
  #service{padding:52px 0 64px;background-attachment:scroll}
  #service .imd-page{width:calc(100% - 32px);gap:22px}
  #service .imd-hero{grid-template-columns:1fr;gap:18px}
  #service .imd-hero-card{padding:30px 24px;border-radius:16px}
  #service .imd-h1{font-size:clamp(30px,9vw,34px)}
  #service .imd-subline{font-size:15px;line-height:1.6}
  #service .imd-tags span{min-height:36px;font-size:11px}
  #service .imd-cost-card{grid-column:1;padding:26px 24px;border-radius:16px}
  #service .imd-cost-h{font-size:22px}
  #service .imd-process-panel{padding:26px 22px;border-radius:16px}
  #service .imd-process-grid{grid-template-columns:1fr;gap:0}
  #service .imd-process-grid article{min-height:92px;padding:18px 0;grid-template-columns:50px 1fr}
  #service .imd-process-grid article:not(:last-child){border-right:0;border-bottom:1px solid rgba(154,156,153,.38)}
  #service .imd-process-grid article:not(:last-child)::after{display:none}
  #service .imd-bottom-panel{grid-template-columns:1fr;gap:24px}
  #service .imd-why-compact{padding-top:10px}
  #service .imd-why-items{grid-template-columns:1fr}
  #service .imd-why-items article{min-height:100px}
  #service .imd-cta-split{padding:30px 24px;min-height:320px;border-radius:16px}
  #service .imd-button{min-height:44px}
}
```

- [ ] **Step 3: Add reduced-motion protection**

Append:

```css
@media(prefers-reduced-motion:reduce){
  #service .imd-process-grid article,#service .imd-button{animation:none!important;transition:none!important}
}
```

- [ ] **Step 4: Run the complete automated verification**

Run:

```powershell
node --test test/service-section-redesign.test.js test/opening-color-refresh.test.js test/comparison-stage.test.js
node --check main.js
git diff --check
```

Expected: all tests pass, `main.js` parses, and `git diff --check` exits with no errors.

- [ ] **Step 5: Inspect desktop at the reported failure size**

Serve the site locally and inspect `#service` at `1920×900`.

Verify:

- The primary Navy panel is visually dominant.
- The concrete logo and texture are visible but do not compete with content.
- The full-service panel reads as secondary.
- Process steps are readable without `9–11px` content.
- Benefits do not look like a boxed dashboard grid.
- CTA is obvious without widespread blue.

- [ ] **Step 6: Inspect standard desktop and mobile**

Inspect at `1440×900` and `390×844`.

Verify:

- No horizontal overflow.
- No fixed-height clipping.
- Mobile order is primary message, cost panel, process, benefits, CTA.
- All primary controls have adequate target size and visible keyboard focus.
- Adjust only spacing, type size, border opacity, and shadow strength if the acceptance criteria fail.

- [ ] **Step 7: Run fresh verification after visual adjustments**

Run again:

```powershell
node --test test/service-section-redesign.test.js test/opening-color-refresh.test.js test/comparison-stage.test.js
node --check main.js
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 8: Commit the responsive finish**

```powershell
git add -- style.css
git commit -m "Refine responsive service section"
```
