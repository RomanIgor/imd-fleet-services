# Service Connection and Proportion Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the approved Service layout with clearer process continuity, tighter vertical rhythm, a centered process grid, and a stronger 58/42 Benefits/CTA composition.

**Architecture:** Preserve the existing HTML and implement the refinement only in the final Service CSS override block. Extend the existing static layout tests before changing CSS so every requested proportion and connector rule is protected by a red-green cycle.

**Tech Stack:** HTML5, CSS3, Node.js built-in test runner, Git

## Global Constraints

- Keep the structure Hero → Process → Benefits + CTA.
- Keep the hero, background image, colors, typography, card styling, and all existing content unchanged.
- Keep the process card at `min(1360px, 100%)` and the lower row aligned to the same outer width.
- Use only existing Service color variables; add no gradient, color token, card, badge, or decorative element.
- Keep Benefits and CTA top-aligned and independently sized.
- Preserve tablet stacking, the mobile vertical process, and zero horizontal overflow.

---

### Task 1: Refine the Service process and lower-row proportions

**Files:**
- Modify: `test/service-section-redesign.test.js:88-132`
- Modify: `style.css:3394-3465`

**Interfaces:**
- Consumes: Existing `#service` markup, Service CSS variables, and `finalMediaBlock()` test helper.
- Produces: A desktop process grid capped at `1040px`, subtle line-arrow connectors, a `26px` lower-row gap, a `58fr / 42fr` lower grid, and a more prominent CTA.

- [ ] **Step 1: Write the failing desktop refinement assertions**

Update the existing assertions in `test/service-section-redesign.test.js`:

```js
test('desktop uses compact intentional section rhythm', () => {
  const desktop = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktop, /#service \.imd-page\{[^}]*gap:0/s);
  assert.match(desktop, /#service \.imd-process-panel\{(?=[^}]*width:min\(1360px,100%\))(?=[^}]*margin:clamp\(56px,4vw,64px\) 0 0)(?=[^}]*padding:18px 32px)(?=[^}]*gap:14px)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-bottom-panel\{[^}]*margin:26px 0 0/s);
});

test('desktop process uses centered equal steps and subtle connectors', () => {
  const desktop = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktop, /#service \.imd-process-panel \.imd-intro-text h3\{(?=[^}]*margin:0 0 16px)(?=[^}]*font-size:23px)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-process-grid\{(?=[^}]*width:min\(1040px,100%\))(?=[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\))(?=[^}]*gap:clamp\(32px,3vw,48px\))[^}]*\}/s);
  assert.match(desktop, /#service \.imd-process-grid article:not\(:last-child\)::after\{(?=[^}]*content:"";)(?=[^}]*height:6px)(?=[^}]*background:rgba\(76,82,87,\.28\))(?=[^}]*clip-path:polygon\()[^}]*\}/s);
  assert.match(desktop, /#service \.imd-process-grid article\{(?=[^}]*border:0)(?=[^}]*background:transparent)(?=[^}]*box-shadow:none)[^}]*\}/s);
});

test('desktop support tier uses a top-aligned 58/42 composition', () => {
  const desktop = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktop, /#service \.imd-bottom-panel\{(?=[^}]*width:min\(1360px,100%\))(?=[^}]*grid-template-columns:minmax\(0,58fr\) minmax\(420px,42fr\))(?=[^}]*align-items:start)[^}]*\}/s);
});

test('CTA is compact, top-aligned, and more prominent', () => {
  const desktop = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktop, /#service \.imd-cta-split\{(?=[^}]*align-self:start)(?=[^}]*padding:44px)(?=[^}]*background:var\(--service-navy\))[^}]*\}/s);
  assert.match(desktop, /#service \.imd-cta-split \.imd-button\{(?=[^}]*min-height:58px)(?=[^}]*margin-top:22px)[^}]*\}/s);
  assert.doesNotMatch(desktop, /#service \.imd-cta-split \.imd-button\{[^}]*margin-top:auto/s);
});
```

Keep the existing content-preservation, borderless-benefit, tablet, mobile, focus, and reduced-motion assertions unchanged.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test test/service-section-redesign.test.js
```

Expected: FAIL only on the new `1040px`, connector, `23px`, `26px`, `58fr / 42fr`, `44px`, and `58px` expectations because the current CSS still uses the previous values.

- [ ] **Step 3: Implement the minimal desktop CSS refinement**

In the final `@media(min-width:1101px)` Service block in `style.css`, apply these exact overrides:

```css
#service .imd-process-panel .imd-intro-text h3{
  margin:0 0 16px;
  font-size:23px;
  line-height:1.2;
  color:var(--service-graphite)
}

#service .imd-process-grid{
  position:relative;
  width:min(1040px,100%);
  margin:0 auto;
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:clamp(32px,3vw,48px);
  counter-reset:service-step
}

#service .imd-process-grid article:not(:last-child)::after{
  content:"";
  position:absolute;
  z-index:0;
  top:23px;
  left:calc(50% + 38px);
  width:calc(100% + clamp(32px,3vw,48px) - 76px);
  height:6px;
  background:rgba(76,82,87,.28);
  clip-path:polygon(0 42%,calc(100% - 6px) 42%,calc(100% - 6px) 0,100% 50%,calc(100% - 6px) 100%,calc(100% - 6px) 58%,0 58%);
  pointer-events:none
}

#service .imd-bottom-panel{
  width:min(1360px,100%);
  min-width:0;
  justify-self:center;
  margin:26px 0 0;
  padding:0;
  display:grid;
  grid-template-columns:minmax(0,58fr) minmax(420px,42fr);
  gap:clamp(24px,2vw,32px);
  align-items:start;
  overflow:visible;
  background:transparent;
  border:0;
  box-shadow:none;
  backdrop-filter:none;
  -webkit-backdrop-filter:none
}

#service .imd-cta-split{
  min-width:400px;
  align-self:start;
  padding:44px;
  display:flex;
  flex-direction:column;
  background:var(--service-navy);
  border:1px solid rgba(229,228,223,.18);
  color:var(--service-highlight);
  box-shadow:0 22px 48px rgba(28,34,40,.20)
}

#service .imd-cta-split .imd-button{
  width:100%;
  min-height:58px;
  height:auto;
  margin-top:22px;
  background:var(--service-highlight);
  border:1px solid var(--service-highlight);
  color:var(--service-navy);
  font-size:14px
}
```

Leave all HTML and all other Service declarations unchanged.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
node --test test/service-section-redesign.test.js
```

Expected: all Service refinement tests PASS.

- [ ] **Step 5: Run full verification**

Run:

```powershell
node --test test
node --check main.js
node --check server.js
git diff --check
```

Expected: 36 or more tests PASS, both syntax checks exit `0`, and `git diff --check` exits `0`.

- [ ] **Step 6: Verify responsive geometry**

At desktop (`1904×957`), tablet (`1024×900`), and mobile (`390×844`), verify:

- desktop process grid is centered and the four columns are equally spaced;
- connector segments stay between icons and behind content;
- process and lower row share the same outer left/right edges;
- desktop lower row is approximately 58/42 and top-aligned;
- tablet stacks Benefits above CTA;
- mobile uses the existing vertical flow with no horizontal overflow.

- [ ] **Step 7: Commit the implementation**

```powershell
git add style.css test/service-section-redesign.test.js
git commit -m "Refine service process connections"
```
