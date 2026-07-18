# Mobile Accordion Indicator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the circled mobile accordion glyph with a refined CSS-drawn plus/minus indicator.

**Architecture:** Keep the existing indicator elements and accordion JavaScript, but hide their text visually and draw state with `::before` and `::after`. Scope all visual changes to the existing mobile breakpoint.

**Tech Stack:** CSS, HTML cache versioning, Node.js built-in test runner

## Global Constraints

- Use an `18px × 18px` borderless indicator.
- Draw centered `1.5px` strokes with CSS pseudo-elements.
- Hide the vertical stroke for expanded panels.
- Preserve alignment, ARIA behavior, desktop presentation, and reduced-motion handling.

---

### Task 1: CSS-drawn indicator

**Files:**
- Modify: `test/comparison-stage.test.js`
- Modify: `style.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: `.difference-accordion-indicator` and `.difference-side.is-open`.
- Produces: borderless `::before`/`::after` plus and expanded minus states.

- [ ] Add a failing test that asserts `18px` dimensions, no border, both pseudo-elements, and the expanded vertical-stroke state.
- [ ] Run `node --test test/comparison-stage.test.js` and confirm the new assertion fails.
- [ ] Replace the mobile indicator rule with a borderless relative box and add centered horizontal/vertical pseudo-elements.
- [ ] Update `style.css` cache version to `why-mobile-indicator-9` in HTML and tests.
- [ ] Run `node --test test/comparison-stage.test.js`, `node --check main.js`, and `git diff --check`.
- [ ] Commit with `git commit -m "Refine mobile accordion indicators"`.
