# IMD Homepage Operational Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the public homepage as an operational B2B Fleet Operations page for Fuhrparkleiter.

**Architecture:** Keep the existing Express/static architecture. Replace only the public homepage markup before the dashboard block, add scoped homepage CSS, and make legacy homepage JavaScript no-op safely when removed sections are absent.

**Tech Stack:** Static HTML, CSS, existing `main.js`, Node built-in test runner.

---

### Task 1: Add Homepage Acceptance Tests

**Files:**
- Create: `test/homepage-redesign.test.js`

- [ ] **Step 1: Write failing tests**

Create tests that read `index.html`, `style.css`, and `main.js` and assert:

- homepage title/description use Fleet Operations positioning
- Google Fonts dependency is removed
- public homepage contains `ops-hero`, `ops-board`, `pwa-showcase`, `pwa-videoModal`, and the existing form IDs used by `submitForm`
- homepage contains no trophy emoji and no fake hero metrics
- `main.js` guards `calcUpdate` and the animated explainer when old sections are absent

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test test/homepage-redesign.test.js`

Expected: FAIL because the current homepage still uses the old vehicle-purchase hero, Google Fonts, and unguarded legacy JavaScript.

### Task 2: Rebuild Public Homepage Markup

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace public homepage only**

Replace the content from the document start through the closing public `</footer>` before `<div id="dash">`.

Keep:

- dashboard markup from `<div id="dash">` onward
- existing script tags at the bottom
- existing form IDs: `fFirma`, `fName`, `fEmail`, `fTel`, `fMarke`, `fModell`, `fBaujahr`, `fKm`, `fHinweise`, `fC1`, `fC2`, `fp3`, `fOk`, `formBar`

Add:

- operational nav
- operational hero with `ops-hero` and `ops-board`
- service sections for Schadenmanagement, Ankauf, Dokumente
- PWA screenshot proof with `pwa-showcase`
- non-autoplay video modal with `pwa-videoModal`
- compact workflow
- sober form section
- simplified footer

- [ ] **Step 2: Run tests and verify partial GREEN**

Run: `node --test test/homepage-redesign.test.js`

Expected: markup-related assertions pass; JS guard assertions still fail until Task 3.

### Task 3: Make Removed Homepage Sections Safe

**Files:**
- Modify: `main.js`

- [ ] **Step 1: Guard legacy calculator**

Update `calcUpdate()` to return immediately if `cAnzahl`, `cStd`, `cSatz`, or `cPreis` are missing.

- [ ] **Step 2: Guard animated explainer**

At the start of the animated explainer IIFE, return if `.mgp-slide` does not exist.

- [ ] **Step 3: Add PWA modal helpers**

Add small functions:

- `openPwaVideo()`
- `closePwaVideo()`

They should toggle `pwa-videoModal` if present.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node --test test/homepage-redesign.test.js`

Expected: PASS.

### Task 4: Add Scoped Operational CSS

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Add operational homepage CSS at the end**

Append scoped styles for:

- `body.ops-home`
- `.ops-nav`
- `.ops-hero`
- `.ops-board`
- `.ops-section`
- `.pwa-showcase`
- `.pwa-video-modal`
- `.ops-form`
- responsive mobile layouts

Use local system fonts and restrained operational colors.

- [ ] **Step 2: Run static checks**

Run:

- `node --test test/homepage-redesign.test.js`
- `node --check main.js`

Expected: both pass.

### Task 5: Browser/Server Verification

**Files:**
- No code changes unless verification finds issues.

- [ ] **Step 1: Start local server if possible**

Run: `node server.js`

Expected: server starts if `.env` is valid and database is reachable. If not, record why.

- [ ] **Step 2: Verify rendered homepage**

Inspect desktop and mobile widths. Confirm:

- no visual overlap
- homepage loads without console errors
- navigation anchors work
- PWA modal opens/closes
- form stays usable

- [ ] **Step 3: Final status**

Summarize changed files, test output, and any verification limits.
