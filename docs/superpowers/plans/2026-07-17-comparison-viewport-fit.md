# Comparison Viewport Fit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the desktop comparison composition upward without shrinking or removing any content.

**Architecture:** Add a desktop-only spacing override to the existing comparison CSS. Protect the exact spacing and cache-version change with the existing Node test suite.

**Tech Stack:** HTML, CSS, Node.js built-in test runner

## Global Constraints

- Reduce the desktop section top spacing by exactly 40px, from 112px to 72px.
- Reduce the desktop gap between header and comparison stage by exactly 12px, from 22px to 10px.
- Preserve typography, card dimensions, connector alignment, content, and tablet/mobile spacing.

---

### Task 1: Desktop comparison spacing

**Files:**
- Modify: `test/comparison-stage.test.js`
- Modify: `style.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: the existing `#warum.section`, `.difference-showcase`, and comparison-stage responsive rules.
- Produces: desktop-only `72px` top padding and `10px` showcase gap.

- [ ] **Step 1: Write the failing regression test**

Add this test to `test/comparison-stage.test.js`:

```js
test('comparison content moves upward on desktop without changing mobile spacing', () => {
  assert.match(css, /@media\s*\(min-width\s*:\s*1121px\)[\s\S]*?#warum\.section\s*\{[^}]*padding-top\s*:\s*72px[^}]*\}[\s\S]*?\.difference-showcase\s*\{[^}]*gap\s*:\s*10px/s);
  assert.match(html, /style\.css\?v=why-viewport-fit-6/);
});
```

- [ ] **Step 2: Run the test and verify that it fails**

Run: `node --test test/comparison-stage.test.js`

Expected: the new desktop-spacing test fails because the media query is absent.

- [ ] **Step 3: Add the minimal desktop-only CSS**

Append after the comparison stage rules in `style.css`:

```css
@media(min-width:1121px){
  #warum.section{padding-top:72px}
  #warum .difference-showcase{gap:10px}
}
```

In `index.html`, change the comparison stylesheet query from `style.css?v=why-proof-badge-5` to `style.css?v=why-viewport-fit-6`. Update existing cache-version assertions in `test/comparison-stage.test.js` to the same value.

- [ ] **Step 4: Run verification**

Run: `node --test test/comparison-stage.test.js`

Expected: all comparison tests pass.

Run: `node --check main.js`

Expected: exit code 0 with no output.

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css test/comparison-stage.test.js docs/superpowers/plans/2026-07-17-comparison-viewport-fit.md
git commit -m "Raise comparison content on desktop"
```
