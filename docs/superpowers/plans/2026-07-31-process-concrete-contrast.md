# Process Concrete Contrast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the `#prozess` section a clearly layered, medium-concrete hierarchy without changing its content or layout.

**Architecture:** Add one final, section-scoped CSS layer that reuses the approved IMD palette and overrides only process surfaces. Extend the existing opening-color regression suite so the tonal hierarchy and active state remain contractual.

**Tech Stack:** Static HTML, CSS custom properties, Node.js built-in test runner.

## Global Constraints

- Preserve the current content, layout, animation, icons, spacing, section height, and responsive behavior.
- Use only `#B3B4B0`, `#CAC9C4`, `#D6D6D2`, `#E5E4DF`, `#202A3B`, `#1C2228`, `#4C5257`, `#9A9C99`, and `#36A2C5` from the approved palette.
- Do not change `#service`, `#warum`, global body styling, HTML structure, copy, icons, or card order.
- Preserve keyboard behavior, reduced motion, tablet behavior, and mobile behavior.

---

### Task 1: Layer the process concrete surfaces

**Files:**
- Modify: `test/opening-color-refresh.test.js`
- Modify: `style.css`

**Interfaces:**
- Consumes: Existing `#prozess`, `.home-process-intro`, `.home-roadmap`, `.home-road-step`, `.home-road-benefit`, and `.home-road-step.is-active` selectors.
- Produces: CSS variables `--process-section`, `--process-roadmap`, `--process-card`, and `--process-intro`, scoped to `#prozess.section`.

- [ ] **Step 1: Write the failing tonal-hierarchy regression test**

Add to `test/opening-color-refresh.test.js`:

```js
test('process section uses a layered medium-concrete hierarchy', () => {
  assert.match(css, /#prozess\.section\{--process-section:#B3B4B0;--process-roadmap:#D6D6D2;--process-card:#CAC9C4;--process-intro:#202A3B;/);
  assert.match(css, /#prozess \.home-process-intro\{[^}]*background:var\(--process-intro\)/);
  assert.match(css, /#prozess \.home-roadmap\{[^}]*background:var\(--process-roadmap\)/);
  assert.match(css, /#prozess \.home-road-step,#prozess \.home-road-benefit\{[^}]*background:var\(--process-card\)/);
  assert.match(css, /#prozess \.home-road-step\.is-active\{[^}]*background:var\(--opening-highlight\)/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test test/opening-color-refresh.test.js
```

Expected: FAIL only for `process section uses a layered medium-concrete hierarchy`, because the new scoped variables and surfaces do not yet exist.

- [ ] **Step 3: Add the final process contrast layer**

Append to `style.css` after the current opening-section palette layer:

```css
#prozess.section{--process-section:#B3B4B0;--process-roadmap:#D6D6D2;--process-card:#CAC9C4;--process-intro:#202A3B;background-color:var(--process-section);background-image:linear-gradient(90deg,rgba(28,34,40,.18),rgba(179,180,176,.58) 46%,rgba(28,34,40,.24)),url('new_images/2.jpeg')}
#prozess::before{background:linear-gradient(90deg,rgba(28,34,40,.18),transparent 42%,rgba(28,34,40,.22))}
#prozess .home-process-intro{background:var(--process-intro);border-color:rgba(229,228,223,.18);box-shadow:0 20px 48px rgba(28,34,40,.24),inset 0 1px rgba(229,228,223,.08);color:var(--opening-highlight)}
#prozess .home-process-intro .h2,#prozess .home-process-note strong{color:var(--opening-highlight)}
#prozess .home-process-intro .lead,#prozess .home-process-note span{color:rgba(229,228,223,.76)}
#prozess .home-process-intro .eyebrow{color:rgba(229,228,223,.68)}
#prozess .home-process-note{background:rgba(229,228,223,.07);border-color:rgba(229,228,223,.18)}
#prozess .home-roadmap{background:var(--process-roadmap);border-color:rgba(154,156,153,.72);box-shadow:0 20px 50px rgba(28,34,40,.20),inset 0 1px rgba(255,255,255,.42)}
#prozess .home-road-step,#prozess .home-road-benefit{background:var(--process-card);border-color:rgba(154,156,153,.72);box-shadow:inset 0 1px rgba(255,255,255,.34)}
#prozess .home-road-step.is-active{background:var(--opening-highlight);border-color:var(--opening-accent);box-shadow:0 16px 36px rgba(28,34,40,.18),0 0 0 2px rgba(54,162,197,.15),inset 0 1px rgba(255,255,255,.60)}
```

- [ ] **Step 4: Run focused and complete automated verification**

Run:

```powershell
node --test test/opening-color-refresh.test.js
node --test test/comparison-stage.test.js test/homepage-redesign.test.js test/opening-color-refresh.test.js test/public-routes.test.js test/service-section-redesign.test.js
node --check main.js
node --check server.js
git diff --check
```

Expected: all tests pass, both JavaScript syntax checks exit `0`, and `git diff --check` emits no errors.

- [ ] **Step 5: Inspect desktop and mobile rendering**

Open `http://127.0.0.1:8777/#prozess` and verify at desktop and mobile widths:

- background, roadmap, and cards are visibly distinct;
- the intro card is navy with readable light text;
- the active step remains cyan-highlighted;
- no overflow or layout shift appears;
- other sections retain their existing colors.

- [ ] **Step 6: Commit the verified implementation**

```powershell
git add -- style.css test/opening-color-refresh.test.js
git commit -m "Refine process concrete contrast"
```
