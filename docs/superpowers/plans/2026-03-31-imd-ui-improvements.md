# IMD Fleet Services — UI/UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix critical bugs, add mobile responsiveness, replace emoji with SVG icons, add countup animation, trim redundant section, and extract carousel inline styles to CSS.

**Architecture:** Single-file static HTML site. `index.html` contains all markup, `style.css` all styles, `main.js` all JavaScript. No build system, no tests framework — verification is visual (open browser).

**Tech Stack:** Vanilla HTML/CSS/JS. Python http.server for local preview.

---

## How to Verify

After each task, open a terminal and run:
```bash
cd "C:/private_from_another_laptop/projects/hobby_project_1"
python3 -m http.server 8000
```
Open **http://localhost:8000/index.html** in browser.

---

## Task 1: Fix Carousel Slide 0 — Broken Div Structure

**Files:**
- Modify: `index.html` around line 304

**Problem:** Line 304 contains an extra `</div>` that closes the left-column flex child prematurely, before the slogan, quote, and step pills. Line 307 has a stray `</div>` as a result.

**Current code at line 304:**
```html
        <div class="mgp-anim-up" style="--d:.1s;margin-bottom:20px"><img src="logo_dark.png" alt="IMD Fleet Services" style="width:clamp(180px,22vw,280px);height:auto;display:block;margin-bottom:24px"></div></div>
          <!-- Founders -->
          
        </div>
```

- [ ] **Step 1: Remove the extra `</div>` at the end of line 304**

Change:
```html
        <div class="mgp-anim-up" style="--d:.1s;margin-bottom:20px"><img src="logo_dark.png" alt="IMD Fleet Services" style="width:clamp(180px,22vw,280px);height:auto;display:block;margin-bottom:24px"></div></div>
          <!-- Founders -->
          
        </div>
```

To:
```html
        <div class="mgp-anim-up" style="--d:.1s;margin-bottom:20px"><img src="logo_dark.png" alt="IMD Fleet Services" style="width:clamp(180px,22vw,280px);height:auto;display:block;margin-bottom:24px"></div>
```

(Remove the second `</div>`, the `<!-- Founders -->` comment block, and the stray `</div>` at line 307.)

- [ ] **Step 2: Verify carousel slide 0 layout**

Open http://localhost:8000/index.html → scroll to "IMD Fleet Services in 90 Sekunden" section → click Abspielen → confirm Intro slide shows logo, slogan ("Mehr Wert. Weniger Weg."), quote, and step pills all aligned in a column on the left side, with the person illustration on the right.

- [ ] **Step 3: Commit**
```bash
git add index.html
git commit -m "fix: repair broken div structure in carousel slide 0"
```

---

## Task 2: Mobile Responsive Hero

**Files:**
- Modify: `style.css` — add breakpoints at end of HERO section

**Problem:** `.hero-in` uses `grid-template-columns: 1fr 430px` — the 430px fixed column breaks on screens < 900px. Dashboard floats also overflow on small screens.

- [ ] **Step 1: Add mobile breakpoint for hero to `style.css`**

Find the hero section in `style.css` (search for `.hero-float.f2`). After the last hero-float rule, add:

```css
/* ── HERO RESPONSIVE ── */
@media (max-width: 900px) {
  .hero-in {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 72px 0 48px;
  }
  .hero-right {
    width: 100%;
  }
  .hero-float {
    display: none;
  }
  .dash-preview {
    max-width: 480px;
    margin: 0 auto;
  }
  .hero-h1 {
    font-size: clamp(32px, 8vw, 48px);
  }
}

@media (max-width: 480px) {
  .wrap {
    padding: 0 20px;
  }
  .hero-kpi {
    grid-template-columns: repeat(3, 1fr);
  }
  .hkpi {
    padding: 14px 10px;
  }
  .hkpi-val {
    font-size: 20px;
  }
  .nav-in {
    padding: 0 20px;
  }
  .trust-inner {
    grid-template-columns: 1fr 1fr;
    padding: 0 20px;
  }
  .ti:nth-child(5) {
    grid-column: 1 / -1;
    border-right: none;
    border-top: 1px solid var(--f2);
  }
}
```

- [ ] **Step 2: Verify responsive hero**

Open http://localhost:8000/index.html → open DevTools (F12) → toggle device toolbar → set to 375px width. Confirm:
- Hero text appears on top, full width
- Dashboard preview appears below, centered
- Floating labels (Gutachten erstellt...) are hidden
- No horizontal scroll

Also check 768px width: grid should be single column.

- [ ] **Step 3: Commit**
```bash
git add style.css
git commit -m "feat: add mobile responsive breakpoints for hero section"
```

---

## Task 3: Replace Emoji with SVG Icons — „Warum wir" Section

**Files:**
- Modify: `index.html` lines ~867–886 (`.wk-head` cards)

**Current code (lines ~867–886):**
```html
<div class="wk-head bad"><div class="wk-ico bad">👤</div>...Privatverkauf...
<div class="wk-head bad"><div class="wk-ico bad">📦</div>...Exporthändler...
<div class="wk-head good"><div class="wk-ico good">⚡</div>...IMD Fleet Services...
```

- [ ] **Step 1: Replace emoji in `.wk-head` cards**

Replace each `wk-ico` content. The SVG style must match existing icons in the page: `width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`.

Find:
```html
<div class="wk-ico bad">👤</div>
```
Replace with:
```html
<div class="wk-ico bad"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
```

Find:
```html
<div class="wk-ico bad">📦</div>
```
Replace with:
```html
<div class="wk-ico bad"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
```

Find:
```html
<div class="wk-ico good">⚡</div>
```
Replace with:
```html
<div class="wk-ico good"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
```

- [ ] **Step 2: Add CSS for SVG inside `.wk-ico`**

In `style.css`, find the `.wk-ico` rule (search for `.wk-ico`) and add after it:
```css
.wk-ico svg { display: block; }
```

- [ ] **Step 3: Verify visually**

Open http://localhost:8000/index.html → scroll to „Warum wir" section. Confirm 3 cards show clean SVG icons (person, package, zap) instead of emoji. Icons should be same size/style as those in „So arbeiten wir" section.

- [ ] **Step 4: Commit**
```bash
git add index.html style.css
git commit -m "style: replace emoji with SVG icons in Warum wir comparison cards"
```

---

## Task 4: Replace Emoji with SVG Icons — „Zielgruppe" Section

**Files:**
- Modify: `index.html` lines ~1130–1133 (`.branche` items)

**Current code:**
```html
<div class="branche rev"><div class="branche-ico">💊</div>...Pharma...
<div class="branche rev d1"><div class="branche-ico">💼</div>...Beratung & IT...
<div class="branche rev d2"><div class="branche-ico">🛡</div>...Versicherungen...
<div class="branche rev d3"><div class="branche-ico">🏢</div>...Alle Branchen...
```

- [ ] **Step 1: Replace emoji in `.branche-ico` elements**

Find:
```html
<div class="branche-ico">💊</div>
```
Replace with:
```html
<div class="branche-ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg></div>
```

Find:
```html
<div class="branche-ico">💼</div>
```
Replace with:
```html
<div class="branche-ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
```

Find:
```html
<div class="branche-ico">🛡</div>
```
Replace with:
```html
<div class="branche-ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
```

Find:
```html
<div class="branche-ico">🏢</div>
```
Replace with:
```html
<div class="branche-ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22V12h6v10"/><line x1="9" y1="7" x2="9" y2="7.01"/><line x1="15" y1="7" x2="15" y2="7.01"/><line x1="9" y1="12" x2="9" y2="12.01"/><line x1="15" y1="12" x2="15" y2="12.01"/></svg></div>
```

- [ ] **Step 2: Add CSS for SVG inside `.branche-ico`**

In `style.css`, find the `.branche-ico` rule. After it, add:
```css
.branche-ico svg { display: block; }
```

- [ ] **Step 3: Verify visually**

Scroll to „Für wen ist IMD Fleet Services?" section. Confirm 4 branche cards show SVG icons (pill, briefcase, shield, building) instead of emoji. Check that icon color inherits correctly from `.branche-ico` text color.

- [ ] **Step 4: Commit**
```bash
git add index.html style.css
git commit -m "style: replace emoji with SVG icons in Zielgruppe section"
```

---

## Task 5: Add Lazy Loading to Images

**Files:**
- Modify: `index.html`

Images above the fold (logo in nav, hero background as CSS) should NOT be lazy loaded. Only below-fold images need it.

- [ ] **Step 1: Add `loading="lazy"` to below-fold images**

Find and update these `<img>` tags:

1. Founder image in „Über uns" section (search for `gruender.webp`):
```html
<img class="founder-avatar-img" src="gruender.webp" alt="Mischa Markosyan – Gründer IMD Fleet Services" loading="lazy">
```

2. Logo in carousel slide 0 (search for `logo_dark.png" alt="IMD Fleet` inside mgp-anim-up):
```html
<img src="logo_dark.png" alt="IMD Fleet Services" style="width:clamp(180px,22vw,280px);height:auto;display:block;margin-bottom:24px" loading="lazy">
```

3. Logo in carousel slide 5 outro (search for `logo_dark.png" alt="IMD Fleet` inside mgp-outro-left):
```html
<img src="logo_dark.png" alt="IMD Fleet Services" style="width:clamp(200px,24vw,320px);height:auto" loading="lazy">
```

4. Footer logo (search for `logo_dark.png` inside `<footer>`):
```html
<img src="logo_dark.png" alt="IMD Fleet Services" style="width:200px;height:auto;display:block;margin-bottom:8px" loading="lazy">
```

- [ ] **Step 2: Verify no above-fold images have lazy loading**

Check nav logo (lines ~29-30) — should NOT have `loading="lazy"`. The nav logo loads immediately on page open.

- [ ] **Step 3: Commit**
```bash
git add index.html
git commit -m "perf: add lazy loading to below-fold images"
```

---

## Task 6: Add Countup Animation for Stats

**Files:**
- Modify: `main.js` — add countup logic after the `checkProzess` function (around line 210)

The elements in „Über uns" section have `data-countup`, `data-prefix`, `data-suffix` attributes (e.g., `data-countup="500" data-suffix="+"`). Currently no JS animates them.

- [ ] **Step 1: Add countup function and IntersectionObserver to `main.js`**

After the `checkProzess` block (after `window.addEventListener('load',checkProzess);` around line 210), insert:

```javascript
// ─── COUNTUP ANIMATION ───
function animateCountup(el) {
  const target = parseFloat(el.dataset.countup);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();
  const isDecimal = target % 1 !== 0;

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;
    el.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

document.querySelectorAll('.stat-num[data-countup]').forEach(function(el) {
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        animateCountup(el);
        obs.disconnect();
      }
    });
  }, { threshold: 0.5 });
  obs.observe(el);
});
```

- [ ] **Step 2: Verify countup animation**

Open http://localhost:8000/index.html → scroll slowly to the „Über uns" dark section → when the 4 stat numbers (500+, +9.4%, 24h, 0€) come into view, they should animate up from 0. The animation should be smooth, ~1.6 seconds, ease-out curve. After reaching the target they should stop.

Note: "24h" and "0 €" don't have `data-countup` attributes — only the ones with numeric `data-countup` will animate. Verify that "24h" stays static (it has no data-countup).

- [ ] **Step 3: Commit**
```bash
git add main.js
git commit -m "feat: add countup animation for stats in Über uns section"
```

---

## Task 7: Remove „Unsere Werte" Block from „Über uns"

**Files:**
- Modify: `index.html` lines ~1021–1057

**Block to remove** — starts with comment `<!-- Unsere Werte — saubere Karten mit SVG-Icons -->` and ends before the closing `</div>` and `</section>` of the ueber-uns section. The 4 cards are: Fairness, Partnerschaft, Kompetenz, Regionalität.

- [ ] **Step 1: Locate and delete the Unsere Werte block**

Search in `index.html` for:
```html
    <!-- Unsere Werte — saubere Karten mit SVG-Icons -->
```

Delete from this comment line through the closing `</div>` of the outer wrapper div, up to (but NOT including) the `</div>` that closes the `<div class="wrap">` of the ueber-uns section.

The block to delete looks like:
```html
    <!-- Unsere Werte — saubere Karten mit SVG-Icons -->
    <div>
      <div style="font-family:var(--fh);font-size:11px;font-weight:700;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.18em;margin-bottom:28px">Unsere Werte</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
        <div class="rev wert-card">...</div>
        <div class="rev d1 wert-card">...</div>
        <div class="rev d2 wert-card">...</div>
        <div class="rev d3 wert-card">...</div>
      </div>
    </div>
```

- [ ] **Step 2: Clean up orphaned CSS**

In `style.css`, search for `.wert-card`, `.wert-icon`, `.wert-title`, `.wert-text`. If these rules exist and are only used for the removed block, delete them.

- [ ] **Step 3: Verify „Über uns" section**

Open http://localhost:8000/index.html → scroll to dark „Über uns" section. Confirm:
- Founder card still shows
- 4 Kennzahlen (500+, +9.4%, 24h, 0€) still show
- „So arbeiten wir" 3 cards (Transparenz, Verlässlichkeit, Effizienz) still show
- The 4 Werte cards (Fairness, Partnerschaft, Kompetenz, Regionalität) are GONE
- No broken layout or orphaned whitespace

- [ ] **Step 4: Commit**
```bash
git add index.html style.css
git commit -m "refactor: remove redundant Unsere Werte block from Über uns section"
```

---

## Task 8: Extract Carousel Slide 2 Inline Styles to CSS

**Files:**
- Modify: `index.html` — slide 2 (pickup/logistics card, lines ~566–653)
- Modify: `style.css` — add new classes at end of MGP section

This is the most inline-style-heavy part. Slide 2's pickup card uses ~80 lines of inline styles for the card interior.

- [ ] **Step 1: Add new CSS classes to `style.css`**

Find the end of the MGP (carousel) section in style.css (search for the last `.mgp-` rule). Add after it:

```css
/* ── MGP PICKUP CARD (slide 2) ── */
.mgp-order-header {
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255,255,255,.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mgp-order-label {
  font-family: var(--fh);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: rgba(255,255,255,.4);
}
.mgp-order-live {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--fh);
  font-size: 10px;
  font-weight: 700;
  color: #00C87A;
}
.mgp-order-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00C87A;
  animation: dotPulse 2s infinite;
}
.mgp-order-vehicle {
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255,255,255,.08);
  display: flex;
  align-items: center;
  gap: 12px;
}
.mgp-order-vehicle-ico {
  width: 42px;
  height: 42px;
  background: rgba(0,87,168,.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.mgp-order-vehicle-name {
  font-family: var(--fh);
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}
.mgp-order-vehicle-sub {
  font-size: 11px;
  color: rgba(255,255,255,.4);
  margin-top: 2px;
}
.mgp-order-vehicle-tag {
  margin-left: auto;
  font-family: var(--fh);
  font-size: 9px;
  font-weight: 700;
  background: rgba(0,87,168,.25);
  color: #90C8F0;
  padding: 3px 10px;
  border-radius: 100px;
  letter-spacing: .08em;
}
.mgp-order-steps { padding: 14px 18px; }
.mgp-order-steps-label {
  font-family: var(--fh);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: rgba(255,255,255,.3);
  margin-bottom: 12px;
}
.mgp-order-step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding-bottom: 10px;
}
.mgp-order-step-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.mgp-order-step-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: #fff;
  font-weight: 800;
}
.mgp-order-step-dot--done { background: #00C87A; }
.mgp-order-step-dot--active {
  background: #0057A8;
  border: 2px solid #90C8F0;
  animation: dotPulse 2s infinite;
}
.mgp-order-step-dot--pending {
  border: 1.5px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.04);
}
.mgp-order-step-line {
  width: 1.5px;
  height: 18px;
}
.mgp-order-step-line--done { background: rgba(0,200,122,.3); }
.mgp-order-step-line--pending { background: rgba(255,255,255,.08); }
.mgp-order-step-body { padding-top: 2px; }
.mgp-order-step-title {
  font-family: var(--fh);
  font-size: 11px;
  font-weight: 600;
  color: #fff;
}
.mgp-order-step-title--active {
  font-weight: 700;
  color: #90C8F0;
}
.mgp-order-step-title--pending { color: rgba(255,255,255,.4); font-weight: 500; }
.mgp-order-step-time {
  font-size: 10px;
  color: rgba(255,255,255,.35);
  margin-top: 1px;
}
.mgp-order-footer {
  padding: 10px 18px;
  border-top: 1px solid rgba(255,255,255,.08);
  background: rgba(0,200,122,.06);
  display: flex;
  align-items: center;
  gap: 8px;
}
.mgp-order-footer-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00C87A;
  flex-shrink: 0;
  animation: dotPulse 2s infinite;
}
.mgp-order-footer-text {
  font-family: var(--fh);
  font-size: 11px;
  color: rgba(255,255,255,.6);
}
```

- [ ] **Step 2: Replace inline styles in slide 2 card interior**

In `index.html`, find slide 2 (`id="sl2"`) and inside the `.mgp-card` element, replace the inline-style divs with the new classes.

**Before** (the card interior from line ~568):
```html
<div style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between">
  <div style="font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.4)">Abholauftrag #2024-0847</div>
  <div style="display:flex;align-items:center;gap:6px;font-family:var(--fh);font-size:10px;font-weight:700;color:#00C87A">
    <div style="width:7px;height:7px;border-radius:50%;background:#00C87A;animation:dotPulse 2s infinite"></div>
    Aktiv
  </div>
</div>
```

**After:**
```html
<div class="mgp-order-header">
  <div class="mgp-order-label">Abholauftrag #2024-0847</div>
  <div class="mgp-order-live">
    <div class="mgp-order-live-dot"></div>
    Aktiv
  </div>
</div>
```

Continue replacing the vehicle row, timeline steps, and footer using the new classes. Follow the same pattern: the new class names match the structure exactly (header → vehicle → steps → footer).

For each timeline step, the structure becomes:
```html
<div class="mgp-order-step">
  <div class="mgp-order-step-track">
    <div class="mgp-order-step-dot mgp-order-step-dot--done">✓</div>
    <div class="mgp-order-step-line mgp-order-step-line--done"></div>
  </div>
  <div class="mgp-order-step-body">
    <div class="mgp-order-step-title">Fahrzeugmeldung eingegangen</div>
    <div class="mgp-order-step-time">Heute, 09:14 Uhr</div>
  </div>
</div>
```

For the active step dot: `mgp-order-step-dot--active` (no text inside, no `✓`).
For pending steps: `mgp-order-step-dot--pending`.

- [ ] **Step 3: Verify slide 2 visually**

Open http://localhost:8000/index.html → carousel → click "Abholung" tick → verify the logistics card looks identical to before: header with "Abholauftrag #2024-0847" + green "Aktiv", vehicle info row, timeline with 2 done steps + 1 active + 2 pending, green footer with status text.

- [ ] **Step 4: Commit**
```bash
git add index.html style.css
git commit -m "refactor: extract carousel slide 2 inline styles to CSS classes"
```

---

## Self-Review Checklist

- [x] Task 1 covers spec item: carousel div structure fix
- [x] Task 2 covers spec item: mobile responsive hero (option A — stack vertical)
- [x] Tasks 3 + 4 cover spec item: emoji → SVG icons (both Warum wir and Zielgruppe)
- [x] Task 5 covers spec item: lazy loading (below-fold images only)
- [x] Task 6 covers spec item: countup animation
- [x] Task 7 covers spec item: slim down Über uns (remove Unsere Werte)
- [x] Task 8 covers spec item: carousel inline styles → CSS (slide 2 — most critical)
- [x] Spec note about nav link #kontakt → confirmed id="kontakt" EXISTS at line 1397, no fix needed
- [x] No placeholders or TBD in any task
- [x] All CSS class names used in Task 8 step 2 are defined in Task 8 step 1
- [x] Commit message style consistent with repo history (fix/feat/refactor/style/perf/chore)
