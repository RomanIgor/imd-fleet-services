# Mobile Comparison Accordion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the two comparison side panels into an accessible, mutually exclusive accordion on mobile while preserving the current desktop comparison.

**Architecture:** Reuse each side panel and convert its header into the accordion button. A small initializer in `main.js` synchronizes collapsed state with the `768px` breakpoint, while mobile-only CSS controls the compact appearance and reveal animation.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node.js built-in test runner

## Global Constraints

- Apply accordion behavior only at viewport widths up to and including 768px.
- Keep both panels collapsed on initial mobile load.
- Allow only one panel to be expanded at a time.
- Preserve the existing desktop layout, connector behavior, content, typography, and card dimensions at 769px and above.
- Use `aria-expanded`, `aria-controls`, keyboard-native buttons, and reduced-motion styling.

---

### Task 1: Accessible responsive accordion

**Files:**
- Modify: `index.html:435-493`
- Modify: `style.css:3029-3065`
- Modify: `main.js:1107-1156`
- Modify: `test/comparison-stage.test.js`

**Interfaces:**
- Consumes: `.difference-side`, `.difference-side-head`, `.difference-side-list`, `.difference-effort`, and the existing `(max-width:768px)` breakpoint.
- Produces: `initMobileDifferenceAccordion()`, `.difference-side-body`, `.difference-accordion-indicator`, and `.is-open`.

- [ ] **Step 1: Write failing source-level regression tests**

Add the following test to `test/comparison-stage.test.js`:

```js
test('comparison side panels become an exclusive accessible mobile accordion', () => {
  assert.equal(count(/class="difference-side-head" type="button"/g, html), 2);
  assert.equal(count(/aria-expanded="false"/g, html), 2);
  assert.equal(count(/aria-controls="difference-panel-/g, html), 2);
  assert.equal(count(/class="difference-side-body" id="difference-panel-/g, html), 2);
  assert.match(js, /function initMobileDifferenceAccordion\(\)/);
  assert.match(js, /const mobileQuery = window\.matchMedia\('\(max-width:768px\)'\)/);
  assert.match(js, /panels\.forEach\(otherPanel => setDifferencePanelState\(otherPanel, otherPanel === panel && !isOpen\)\)/);
  assert.match(css, /@media\(max-width:768px\)[\s\S]*\.difference-side-body\[hidden\]\{display:none\}/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)[\s\S]*\.difference-side-body/);
  assert.match(html, /style\.css\?v=why-mobile-accordion-7/);
  assert.match(html, /main\.js\?v=privacy-xlsx-connectors-accordion-3/);
});
```

- [ ] **Step 2: Run the test and verify that it fails**

Run: `node --test test/comparison-stage.test.js`

Expected: the new accordion test fails because the controls, initializer, and mobile rules are absent.

- [ ] **Step 3: Add accessible accordion markup**

For each `.difference-side`, remove `tabindex="0"`, replace its `<header class="difference-side-head">` with a button, add the indicator, and wrap the list plus footer in the controlled body. Use these exact attributes for the private panel:

```html
<button class="difference-side-head" type="button" aria-expanded="false" aria-controls="difference-panel-private">
  <span class="difference-side-symbol" aria-hidden="true"><img src="assets/icons/user-key.svg" alt=""></span>
  <span class="difference-side-copy"><strong>Privatverkauf</strong><small>Alles in Eigenregie</small></span>
  <span class="difference-accordion-indicator" aria-hidden="true">+</span>
</button>
<div class="difference-side-body" id="difference-panel-private">
  <!-- existing list and footer remain unchanged -->
</div>
```

Use `difference-panel-dealer` and the existing dealer copy for the second panel. Update stylesheet and script URLs in `index.html` to `style.css?v=why-mobile-accordion-7` and `main.js?v=privacy-xlsx-connectors-accordion-3`.

- [ ] **Step 4: Implement breakpoint-aware exclusive behavior**

Add this implementation before the connector initializer in `main.js`:

```js
function setDifferencePanelState(panel, open) {
  const button = panel.querySelector('.difference-side-head');
  const body = panel.querySelector('.difference-side-body');
  const indicator = panel.querySelector('.difference-accordion-indicator');
  if (!button || !body || !indicator) return;
  panel.classList.toggle('is-open', open);
  button.setAttribute('aria-expanded', String(open));
  body.hidden = !open;
  indicator.textContent = open ? '−' : '+';
}

function initMobileDifferenceAccordion() {
  const panels = Array.from(document.querySelectorAll('.difference-side'));
  if (!panels.length) return;
  const mobileQuery = window.matchMedia('(max-width:768px)');

  function syncLayout() {
    panels.forEach(panel => {
      if (mobileQuery.matches) setDifferencePanelState(panel, false);
      else setDifferencePanelState(panel, true);
    });
  }

  panels.forEach(panel => {
    const button = panel.querySelector('.difference-side-head');
    button?.addEventListener('click', () => {
      if (!mobileQuery.matches) return;
      const isOpen = panel.classList.contains('is-open');
      panels.forEach(otherPanel => setDifferencePanelState(otherPanel, otherPanel === panel && !isOpen));
    });
  });

  syncLayout();
  mobileQuery.addEventListener?.('change', syncLayout);
}
```

Call `initMobileDifferenceAccordion();` at the start of the existing `DOMContentLoaded` comparison initializer.

- [ ] **Step 5: Add mobile-only visual behavior**

Add shared button reset and indicator rules, then extend the existing mobile breakpoint:

```css
.difference-side-head{width:100%;border:0;font:inherit;text-align:left;cursor:default}
.difference-side-copy{min-width:0}
.difference-accordion-indicator{display:none}

@media(max-width:768px){
  .difference-side{overflow:hidden}
  .difference-side-head{cursor:pointer;grid-template-columns:38px minmax(0,1fr) 32px}
  .difference-accordion-indicator{width:30px;height:30px;display:grid;place-items:center;border:1px solid rgba(229,228,223,.38);border-radius:50%;font-size:20px;color:var(--cmp-highlight);transition:transform .2s var(--ease)}
  .difference-side.is-open .difference-accordion-indicator{transform:rotate(180deg)}
  .difference-side-body{overflow:hidden;animation:differenceAccordionIn .22s var(--ease)}
  .difference-side-body[hidden]{display:none}
}

@keyframes differenceAccordionIn{
  from{opacity:0;transform:translateY(-6px)}
  to{opacity:1;transform:translateY(0)}
}
```

Extend the existing reduced-motion media query with:

```css
.difference-side-body,
.difference-accordion-indicator{animation:none!important;transition:none!important}
```

- [ ] **Step 6: Run verification**

Run: `node --test test/comparison-stage.test.js`

Expected: all eight comparison tests pass.

Run: `node --check main.js`

Expected: exit code 0 with no output.

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 7: Commit**

```bash
git add index.html style.css main.js test/comparison-stage.test.js docs/superpowers/plans/2026-07-17-mobile-comparison-accordion.md
git commit -m "Add mobile comparison accordion"
```
