# Service Logo-First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reveal the complete embossed IMD logo and replace oversized service cards with compact, content-driven desktop rails.

**Architecture:** Add the logo-first geometry only to the wide-desktop `min-width:1440px` layer and update the service copy it controls. The opening stage uses a 1400px outer frame with a protected 600px center; the process and closing content become compact 1180px rails. Existing layouts through 1439px remain unchanged.

**Tech Stack:** HTML, CSS, Node.js built-in test runner

## Global Constraints

- Apply only at `min-width:1440px`.
- Opening message card is at most `360px`; cost card is at most `270px`.
- Central logo-safe track is at least `600px`.
- Process rail is `1180px` wide and no taller than `175px` at wide desktop.
- Closing rail is `1180px` wide, content-driven, and contains four benefits plus one CTA column.
- Body text remains at least `15px`, metadata and tags at least `12px`, and controls at least `48px`.
- Preserve the dark showroom photograph and create no horizontal overflow.

---

### Task 1: Build the logo-first desktop composition

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `test/service-section-redesign.test.js`
- Modify: `test/comparison-stage.test.js`
- Modify: `test/opening-color-refresh.test.js`

**Interfaces:**
- Consumes: existing `.imd-hero`, `.imd-process-panel`, `.imd-bottom-panel`, `.imd-why-items`, and `.imd-cta-split` markup.
- Produces: wide-desktop logo-safe geometry and compact rails; no JavaScript changes.

- [ ] **Step 1: Add failing source regression tests**

Add assertions to `test/service-section-redesign.test.js`:

```js
test('service wide desktop protects the showroom logo with compact rails', () => {
  const wideDesktopCss = finalMediaBlock('@media(min-width:1440px){');
  assert.match(wideDesktopCss, /#service \.imd-hero\{(?=[^}]*width:min\(1400px,100%\))(?=[^}]*grid-template-columns:360px minmax\(600px,1fr\) 270px)[^}]*\}/s);
  assert.match(wideDesktopCss, /#service \.imd-hero-card\{[^}]*max-width:360px/s);
  assert.match(wideDesktopCss, /#service \.imd-cost-card\{[^}]*max-width:270px/s);
  assert.match(wideDesktopCss, /#service \.imd-process-panel\{(?=[^}]*width:min\(1180px,100%\))(?=[^}]*max-height:175px)[^}]*\}/s);
  assert.match(wideDesktopCss, /#service \.imd-bottom-panel\{[^}]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/s);
});
```

Assert the concise introduction copy exists:

```js
assert.match(html, /Online melden\. Wir übernehmen Abholung, Gutachten und Auszahlung\./);
assert.match(html, /Ein Vorgang\. Ein Ansprechpartner\./);
```

- [ ] **Step 2: Confirm RED**

Run:

```bash
node --test --test-name-pattern "protects the showroom logo" test/service-section-redesign.test.js
```

Expected: FAIL because the current opening uses `420px / flexible / 300px` and the closing content is still a two-card grid.

- [ ] **Step 3: Update service copy and closing markup**

In `index.html`, replace the process introduction paragraphs with:

```html
<p>Online melden. Wir übernehmen Abholung, Gutachten und Auszahlung.</p>
<p class="imd-strong">Ein Vorgang. Ein Ansprechpartner.</p>
```

Keep the four benefit articles and CTA content, but make `.imd-bottom-panel` the five-column rail container at wide desktop. Increment the stylesheet cache key and matching test assertions.

- [ ] **Step 4: Implement the wide-desktop CSS**

In the final `@media(min-width:1440px)` block:

```css
#service .imd-hero{
  width:min(1400px,100%);
  justify-self:center;
  grid-template-columns:360px minmax(600px,1fr) 270px;
  gap:28px;
  align-items:start;
}
#service .imd-hero-card{max-width:360px;padding:16px 20px}
#service .imd-cost-card{max-width:270px;padding:16px 18px}
#service .imd-process-panel{
  width:min(1180px,100%);
  grid-template-columns:240px 1fr;
  padding:12px 18px;
}
#service .imd-bottom-panel{
  width:min(1180px,100%);
  grid-template-columns:repeat(5,minmax(0,1fr));
  gap:0;
  align-items:start;
}
#service .imd-why-compact{display:contents}
#service .imd-why-compact>h3{grid-column:1 / 5}
#service .imd-why-items{grid-column:1 / 5;display:contents}
#service .imd-why-items article{min-height:0;padding:14px}
#service .imd-cta-split{grid-column:5;grid-row:1 / 3;min-height:0;align-self:stretch;padding:16px}
```

Use restrained separators between columns and retain the approved concrete/navy palette.

- [ ] **Step 5: Run focused tests**

Run:

```bash
node --test test/comparison-stage.test.js test/opening-color-refresh.test.js test/service-section-redesign.test.js
```

Expected: all focused tests pass.

- [ ] **Step 6: Verify rendered geometry**

At `1904×957` and `1920×1080`, verify:

```text
opening left card <= 360px
opening right card <= 270px
central gap >= 600px
process height <= 175px
process width = closing width = 1180px
tagOverflow = false
horizontalOverflow = 0
```

Capture and inspect a desktop screenshot. The full embossed logo must be visible and neither rail may intersect it.

- [ ] **Step 7: Run static checks and commit**

Run:

```bash
node --check main.js
node --check server.js
git diff --check
git status -sb
```

Then commit:

```bash
git add index.html style.css test/comparison-stage.test.js test/opening-color-refresh.test.js test/service-section-redesign.test.js docs/superpowers/plans/2026-07-23-service-logo-first.md
git commit -m "Build logo-first service composition"
```
