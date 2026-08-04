# Service Composition Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the approved `#service` composition so the process is compact, the connectors are short arrows, and the lower row aligns exactly with the process width.

**Architecture:** Keep the current HTML and append no new component structure. Update only the final scoped `/* Service editorial composition */` CSS layer, using CSS counters for step numbers and breakpoint-specific pseudo-elements for connectors. Extend the existing static regression test so each approved spacing and proportion remains explicit.

**Tech Stack:** HTML5, CSS Grid/Flexbox, CSS counters and pseudo-elements, Node.js built-in test runner.

## Global Constraints

- Preserve the order Hero → Full-width process → Benefits and CTA.
- Do not change hero markup or styling, background image, palette, typography, copy, icons, borders, shadows, or brand styling.
- Do not add cards, gradients, colors, content, or decorative elements.
- Keep the process and lower row at `min(1360px, 100%)` on desktop.
- Target 56–64px from Hero to Process and 36px from Process to the lower row.
- Keep Benefits in an open 2x2 layout and CTA at approximately 40% desktop width.
- Prevent horizontal overflow at every breakpoint.

---

### Task 1: Lock the approved refinement into regression tests

**Files:**
- Modify: `test/service-section-redesign.test.js`
- Test: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: the final CSS media blocks returned by `finalMediaBlock()`.
- Produces: regression assertions for compact process sizing, discontinuous arrows, counters, aligned widths, Benefits hierarchy, CTA prominence, and mobile arrows.

- [ ] **Step 1: Replace the desktop rhythm assertion with explicit section relationships**

Add assertions that the final desktop block uses `gap:0`, gives the process a `margin-top:clamp(56px,4vw,64px)`, uses `padding:24px 32px` and `gap:20px`, and gives the lower row `margin-top:36px`.

```js
test('desktop uses compact intentional section rhythm', () => {
  const desktop = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktop, /#service \.imd-page\{[^}]*gap:0/s);
  assert.match(desktop, /#service \.imd-process-panel\{(?=[^}]*margin:clamp\(56px,4vw,64px\) 0 0)(?=[^}]*padding:24px 32px)(?=[^}]*gap:20px)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-bottom-panel\{[^}]*margin:36px 0 0/s);
});
```

- [ ] **Step 2: Replace the continuous-line assertions with short-arrow and counter assertions**

```js
test('desktop process uses numbered steps and short adjacent arrows', () => {
  const desktop = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktop, /#service \.imd-process-grid\{[^}]*counter-reset:service-step/s);
  assert.match(desktop, /#service \.imd-process-grid::before\{[^}]*content:none[^}]*display:none/s);
  assert.match(desktop, /#service \.imd-process-grid article\{[^}]*counter-increment:service-step/s);
  assert.match(desktop, /#service \.imd-process-grid article:not\(:last-child\)::after\{(?=[^}]*content:"→")(?=[^}]*position:absolute)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-process-grid h4::before\{[^}]*content:"0" counter\(service-step\)/s);
  assert.match(desktop, /#service \.imd-process-line-icon\{[^}]*width:52px[^}]*height:52px/s);
  assert.match(desktop, /#service \.imd-process-grid h4\{[^}]*margin:0 0 4px/s);
});
```

- [ ] **Step 3: Add exact width, Benefits, and CTA assertions**

```js
test('desktop lower row aligns to process and strengthens benefits and CTA', () => {
  const desktop = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktop, /#service \.imd-process-panel\{[^}]*width:min\(1360px,100%\)/s);
  assert.match(desktop, /#service \.imd-bottom-panel\{(?=[^}]*width:min\(1360px,100%\))(?=[^}]*grid-template-columns:minmax\(0,3fr\) minmax\(400px,2fr\))[^}]*\}/s);
  assert.match(desktop, /#service \.imd-why-icon\{[^}]*width:46px[^}]*height:46px/s);
  assert.match(desktop, /#service \.imd-why-items article\{[^}]*grid-template-columns:46px minmax\(0,1fr\)[^}]*column-gap:18px/s);
  assert.match(desktop, /#service \.imd-why-items h4\{[^}]*font-size:16px/s);
  assert.match(desktop, /#service \.imd-cta-split\{(?=[^}]*min-width:400px)(?=[^}]*padding:40px)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-cta-split \.imd-button\{[^}]*min-height:54px/s);
});
```

- [ ] **Step 4: Add tablet and mobile connector assertions**

```js
test('responsive process uses short arrows without continuous lines', () => {
  const tablet = finalMediaBlock('@media(max-width:1120px){');
  const mobile = finalMediaBlock('@media(max-width:768px){');
  assert.match(tablet, /#service \.imd-process-grid::before\{[^}]*content:none[^}]*display:none/s);
  assert.match(tablet, /#service \.imd-process-grid article:not\(:last-child\)::after\{[^}]*content:"→"/s);
  assert.match(mobile, /#service \.imd-process-grid::before\{[^}]*content:none[^}]*display:none/s);
  assert.match(mobile, /#service \.imd-process-grid article:not\(:last-child\)::after\{(?=[^}]*content:"↓")(?=[^}]*left:18px)[^}]*\}/s);
});
```

- [ ] **Step 5: Run the focused test and verify RED**

Run:

```powershell
node --test test/service-section-redesign.test.js
```

Expected: failures for the old uniform gap, continuous connector, 1240px lower width, 42px Benefits icons, 48px CTA button, and missing step counters.

- [ ] **Step 6: Commit the failing regression tests**

```powershell
git add test/service-section-redesign.test.js
git commit -m "Test service composition refinement"
```

### Task 2: Implement the compact editorial refinement

**Files:**
- Modify: `style.css` in the final `/* Service editorial composition */` block.
- Test: `test/service-section-redesign.test.js`

**Interfaces:**
- Consumes: unchanged `#service` markup and the four existing process articles.
- Produces: CSS-only desktop, tablet, and mobile refinement matching Task 1.

- [ ] **Step 1: Implement desktop spacing and width alignment**

Use these exact desktop values:

```css
#service .imd-page{gap:0}
#service .imd-process-panel{
  width:min(1360px,100%);
  margin:clamp(56px,4vw,64px) 0 0;
  padding:24px 32px;
  gap:20px;
}
#service .imd-bottom-panel{
  width:min(1360px,100%);
  margin:36px 0 0;
  grid-template-columns:minmax(0,3fr) minmax(400px,2fr);
}
```

- [ ] **Step 2: Replace the desktop continuous line with counters and short arrows**

```css
#service .imd-process-grid{counter-reset:service-step}
#service .imd-process-grid::before{content:none;display:none}
#service .imd-process-grid article{counter-increment:service-step;padding:0 16px}
#service .imd-process-grid article:not(:last-child)::after{
  content:"→";
  position:absolute;
  top:16px;
  right:calc(clamp(24px,3vw,48px) / -2 - 5px);
  color:rgba(76,82,87,.48);
  font-size:16px;
  line-height:1;
}
#service .imd-process-grid h4::before{
  content:"0" counter(service-step) "  ";
  color:var(--service-muted);
  font-size:11px;
  letter-spacing:.08em;
}
#service .imd-process-line-icon{width:52px;height:52px;margin-bottom:12px}
#service .imd-process-grid h4{margin:0 0 4px}
```

- [ ] **Step 3: Strengthen Benefits and CTA without changing content**

```css
#service .imd-why-items article{
  grid-template-columns:46px minmax(0,1fr);
  column-gap:18px;
}
#service .imd-why-icon{width:46px;height:46px}
#service .imd-why-items h4{font-size:16px;font-weight:750}
#service .imd-cta-split{min-width:400px;padding:40px}
#service .imd-cta-split h3{margin-bottom:16px}
#service .imd-cta-split .imd-button{min-height:54px}
```

- [ ] **Step 4: Implement responsive short arrows and compact spacing**

At tablet widths, keep the four-column process compact and place `→` between steps:

```css
@media(max-width:1120px){
  #service .imd-process-panel{padding:28px 24px;gap:20px}
  #service .imd-process-grid{gap:16px;counter-reset:service-step}
  #service .imd-process-grid::before{content:none;display:none}
  #service .imd-process-grid article{counter-increment:service-step}
  #service .imd-process-grid article:not(:last-child)::after{
    content:"→";
    position:absolute;
    top:16px;
    right:-13px;
  }
  #service .imd-process-grid h4::before{content:"0" counter(service-step) "  "}
}
```

At mobile widths, replace the horizontal arrow with a short downward arrow. Keep the existing one-column Benefits rule below 620px and stacked CTA behavior.

```css
@media(max-width:768px){
  #service .imd-process-grid{gap:0}
  #service .imd-process-grid::before{content:none;display:none}
  #service .imd-process-grid article:not(:last-child)::after{
    content:"↓";
    top:auto;
    right:auto;
    bottom:-6px;
    left:18px;
  }
}
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```powershell
node --test test/service-section-redesign.test.js
```

Expected: 14 or more tests pass with zero failures.

- [ ] **Step 6: Run the full regression suite and syntax checks**

```powershell
node --test test
node --check main.js
node --check server.js
git diff --check
```

Expected: all tests and checks pass with exit code 0.

- [ ] **Step 7: Verify browser geometry at three breakpoints**

Desktop `1904x957`:

- Process and lower row have equal width and matching x coordinates.
- Process height is approximately 240–250px.
- Process-to-lower-row gap is approximately 36px.
- Benefits/CTA width ratio remains approximately 60/40.
- No horizontal overflow.

Tablet `1024x900`:

- Process remains contained and four-column.
- Benefits and CTA are stacked and full width.
- No horizontal overflow.

Mobile `390x844`:

- Process is vertical with short downward arrows.
- Benefits and CTA stack in order.
- No horizontal overflow.

- [ ] **Step 8: Commit the implementation**

```powershell
git add style.css test/service-section-redesign.test.js
git commit -m "Refine service composition rhythm"
```
