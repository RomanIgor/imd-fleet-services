# Opening Sections Color Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Restyle the Hero, Fahrzeugverkauf, and six-step process with the established concrete/navy IMD palette without changing content or behavior.

**Architecture:** Append one isolated `Opening sections color refresh` override layer to `style.css`, scoped to `.hero`, `#service`, and `#prozess`. Protect structure by limiting implementation to CSS and the stylesheet cache query in `index.html`.

**Tech Stack:** CSS, HTML cache versioning, Node.js built-in test runner

## Global Constraints

- Preserve all HTML structure, text, images, form behavior, JavaScript, breakpoints, dimensions, and ordering.
- Use concrete `#CAC9C4`, highlight `#E5E4DF`, navy `#202A3B`, graphite `#1C2228`, text `#4C5257`, border `#9A9C99`, and accent `#36A2C5`.
- Use blue only for active or selected states.
- Validate desktop at `1440×900` and mobile at `390×844`.

---

### Task 1: Shared palette and Hero

**Files:**
- Create: `test/opening-color-refresh.test.js`
- Modify: `style.css`
- Modify: `index.html`

- [x] Add a failing source test requiring shared `--opening-*` variables scoped to `.hero`, `#service`, and `#prozess`, a graphite Hero overlay, concrete calculator surface, navy calculator action, and stylesheet cache `opening-color-refresh-10`.
- [x] Run `node --test test/opening-color-refresh.test.js` and confirm failure.
- [x] Add the shared palette variables and Hero-only overrides after existing section CSS.
- [x] Run the new test and the comparison suite.

### Task 2: Fahrzeugverkauf surfaces

**Files:**
- Modify: `test/opening-color-refresh.test.js`
- Modify: `style.css`

- [x] Add failing assertions for concrete service glass, graphite text, navy icon surfaces, and blue-only active states.
- [x] Add scoped `#service` overrides for `.imd-glass`, hero cards, full-service card, process panel, feature cards, and CTA.
- [x] Preserve every existing grid and breakpoint declaration by changing only visual properties.
- [x] Run both test files.

### Task 3: Six-step process surfaces and visual verification

**Files:**
- Modify: `test/opening-color-refresh.test.js`
- Modify: `style.css`

- [x] Add failing assertions for a concrete process background/panels, navy step markers, and blue active-step treatment.
- [x] Add scoped `#prozess` visual overrides without changing sticky, grid, timeline, animation, or responsive rules.
- [x] Run `node --test test/opening-color-refresh.test.js test/comparison-stage.test.js`, `node --check main.js`, and `git diff --check`.
- [x] Inspect Hero, service, and process at `1440×900` and `390×844`; adjust only contrast, surface color, border, shadow, and icon filter values.
- [x] Commit with `git commit -m "Refresh opening section colors"`.
