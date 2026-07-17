# Comparison Stage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage's three equal comparison cards with a connected stage that places IMD centrally and communicates approximately 20 minutes of internal customer effort.

**Architecture:** Keep the change scoped to the existing `#warum` section. Restructure its comparison markup into two concise side panels and one semantic IMD centerpiece, then replace the scoped CSS override with responsive stage styling; retain the existing mobile scroll behavior with adjusted selectors.

**Tech Stack:** Static HTML5, CSS3, vanilla JavaScript, Node.js built-in test runner.

## Global Constraints

- Preserve the existing warm concrete, navy, and IMD-blue palette.
- Use no external assets or icon libraries.
- Center copy must read `ca. 20 Minuten`, `interner Aufwand`, and `Fahrzeug digital melden. Den Rest übernehmen wir.`
- Keep five concise rows in each competing option.
- Preserve keyboard focus, reduced-motion behavior, and mobile usability.

---

### Task 1: Structural contract test

**Files:**
- Create: `test/comparison-stage.test.js`
- Test: `index.html`, `style.css`

**Interfaces:**
- Consumes: source files as UTF-8 strings.
- Produces: regression checks for stage roles, copy, row counts, responsive CSS, and absence of removed secondary descriptions.

- [ ] **Step 1: Write failing tests** using `node:test` and `node:assert/strict` that require `.difference-stage`, two `.difference-side` panels, `.difference-core`, exactly ten side-list rows, the approved 20-minute copy, connector styling, a mobile breakpoint, and reduced-motion coverage.
- [ ] **Step 2: Run `node --test test/comparison-stage.test.js`** and confirm failure because the new stage classes do not exist.
- [ ] **Step 3: Leave production files unchanged** until the expected structural failure has been observed.

### Task 2: Comparison stage markup

**Files:**
- Modify: `index.html:435-486`
- Test: `test/comparison-stage.test.js`

**Interfaces:**
- Consumes: existing section heading and existing icon/logo assets.
- Produces: `.difference-stage`, `.difference-side`, `.difference-core`, and `.difference-connector` elements.

- [ ] **Step 1: Replace the three-card markup** with left `Privatverkauf`, central IMD, and right `Exporthändler / Auktionen` regions; keep exactly five short list rows per side.
- [ ] **Step 2: Add effort footers** with `HOCH` and `MITTEL`, plus the approved central copy and accessible labels.
- [ ] **Step 3: Run the test** and confirm markup assertions pass while CSS assertions remain red.

### Task 3: Responsive visual system

**Files:**
- Modify: `style.css:2490-2770`
- Test: `test/comparison-stage.test.js`

**Interfaces:**
- Consumes: class names produced by Task 2 and existing `#warum` color tokens.
- Produces: connected three-part desktop stage and stacked/swipe-friendly mobile layout.

- [ ] **Step 1: Replace obsolete card rules** with a 27%/46%/27% stage grid, mineral side panels, navy headers, concise rows, effort meters, an oval IMD core, concentric outlines, and dotted connectors.
- [ ] **Step 2: Add responsive rules** that simplify connectors on tablet and place IMD first with side panels below on mobile without horizontal page overflow.
- [ ] **Step 3: Add visible focus styles and reduced-motion rules.**
- [ ] **Step 4: Run `node --test test/comparison-stage.test.js`** and confirm all assertions pass.

### Task 4: Existing JavaScript cleanup and verification

**Files:**
- Modify: `main.js:1108-1130` only if obsolete selectors cause errors.
- Test: `test/comparison-stage.test.js`

**Interfaces:**
- Consumes: new static responsive markup.
- Produces: no dangling comparison-carousel initialization.

- [ ] **Step 1: Remove or guard obsolete carousel logic** so the absence of `.difference-grid` and dots is a safe no-op.
- [ ] **Step 2: Run `node --check main.js`** and expect success with no syntax output.
- [ ] **Step 3: Run `node --test test/comparison-stage.test.js`** and expect all tests to pass.
- [ ] **Step 4: Run `git diff --check`** and expect no whitespace errors.
- [ ] **Step 5: Inspect desktop and mobile screenshots** and correct only comparison-stage layout defects discovered during inspection.

### Task 5: Precise connector alignment refinement

**Files:**
- Modify: `index.html`, `style.css`, `main.js`, `test/comparison-stage.test.js`

- [ ] **Step 1: Extend the structural test** to require a dedicated SVG connector layer, ten paths, the connector update function, and the reduced title maximum.
- [ ] **Step 2: Run the test and confirm it fails** because connectors are still fixed CSS lines.
- [ ] **Step 3: Add the SVG layer and calculate path endpoints** from each row marker and the IMD ellipse geometry on render and resize.
- [ ] **Step 4: Style paths as fine dotted curves** and hide them below the desktop breakpoint.
- [ ] **Step 5: Run automated and visual checks** at desktop and mobile sizes.

### Task 6: Single-viewport desktop composition

**Files:**
- Modify: `style.css`, `test/comparison-stage.test.js`

- [ ] **Step 1: Add a failing test** for grid removal and the 1440×900 desktop compaction contract.
- [ ] **Step 2: Remove square-grid background layers** from `#warum::before`.
- [ ] **Step 3: Add a desktop-height media query** that compacts the header, stage, CTA, and benefits without changing mobile flow.
- [ ] **Step 4: Verify automated tests and inspect the full section at 1440×900.**
