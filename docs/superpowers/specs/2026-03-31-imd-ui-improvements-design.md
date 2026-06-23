# IMD Fleet Services — UI/UX Improvements Design
Date: 2026-03-31

## Overview

A set of targeted improvements to the IMD Fleet Services landing page (`index.html` + `style.css`). Focus: bug fixes, mobile responsiveness, visual consistency, performance, and content trim. No architectural changes.

---

## 1. Critical Bug Fixes

### 1a. Nav link dead
- **File**: `index.html`
- **Current**: `<a href="#kontakt">Kontakt</a>` in nav and `<a href="#kontakt">Kontakt</a>` in mob-menu
- **Fix**: Change to `href="#anmelden"` OR add `id="kontakt"` as alias on the form section
- **Decision**: Add `id="kontakt"` to the `<section id="anmelden">` element so both anchors work

### 1b. Broken div structure in carousel slide 0
- **File**: `index.html`, around line 303–307
- **Problem**: An extra `</div>` closes the flex container prematurely, leaving `.dim-slogan` and `.mgp-quote` outside the layout
- **Fix**: Remove the extra closing `</div>` so slogan + quote remain inside the flex left column

---

## 2. Mobile Responsive Hero

**Decision**: Option A — stack vertical at ≤900px.

### Changes to `style.css`
```css
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
}
```

Also add mobile breakpoints for `.hero-h1` font size and `.hero-btns` flex-wrap (already has flex-wrap: wrap — confirm it works).

---

## 3. Emoji → SVG Icons

Replace emoji with inline SVG in two locations:

### 3a. `.wk-head` cards in „Warum wir" section
- 👤 (Privatverkauf) → person/user SVG icon
- 📦 (Exporthändler) → box/package SVG icon  
- ⚡ (IMD Fleet Services) → already uses ⚡ but should match style — use zap/lightning SVG

### 3b. `.branche` items in „Zielgruppe" section
- 💊 (Pharma) → pill/medical SVG
- 💼 (Beratung & IT) → briefcase SVG
- 🛡 (Versicherungen) → shield SVG
- 🏢 (Alle Branchen) → building SVG

All SVGs: `width="20" height="20"`, `stroke="currentColor"`, `fill="none"`, `stroke-width="1.8"` — matching the style of existing SVGs in „So arbeiten wir" and „Unsere Werte" sections.

---

## 4. Lazy Loading Images

Add `loading="lazy"` to:
- `image.jpg` (hero background — skip, it's a CSS background-image, not an `<img>`)
- `logo_dark.png` and `logo_light.png` in nav — skip (above fold, should load eagerly)
- `gruender.webp` in founder card — **add lazy**
- `logo_dark.png` in carousel slide 0 and slide 5 — add lazy
- Any other `<img>` tags below the fold

---

## 5. Countup Animation for Stats

**File**: `index.html` (script section at bottom)

The `.stat-num` elements have `data-countup`, `data-prefix`, `data-suffix` attributes but no JS driving them.

Add to the IntersectionObserver script:
```javascript
function animateCountup(el) {
  const target = parseFloat(el.dataset.countup);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();
  const isDecimal = target % 1 !== 0;

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = eased * target;
    el.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Observe stat-num elements
document.querySelectorAll('.stat-num[data-countup]').forEach(el => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCountup(el);
        obs.disconnect();
      }
    });
  }, { threshold: 0.5 });
  obs.observe(el);
});
```

---

## 6. Slim Down „Über uns" Section

**Decision**: Option B — remove „Unsere Werte" block only.

### What gets removed
The block starting with:
```html
<!-- Unsere Werte — saubere Karten mit SVG-Icons -->
<div>
  <div style="font-family:var(--fh);font-size:11px;...">Unsere Werte</div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr)...">
    <!-- 4 wert-cards: Fairness, Partnerschaft, Kompetenz, Regionalität -->
  </div>
</div>
```

### What stays
- Intro text + founder card
- Kennzahlen (4 numbers: 500+, +9.4%, 24h, 0€)
- „So arbeiten wir" (3 cards: Transparenz, Verlässlichkeit, Effizienz)

---

## 7. Carousel Inline Styles → CSS Classes

Extract inline styles from carousel slides into `style.css`. Scope: slides 2, 3, 4 (slides 0 and 1 are relatively clean already).

### New CSS classes to create
- `.mgp-pickup-header` — card header row in slide 2
- `.mgp-pickup-vehicle` — vehicle info row in slide 2
- `.mgp-timeline-steps` — timeline container in slide 2
- `.mgp-timeline-step` — individual step row
- `.mgp-timeline-step--done` — completed step
- `.mgp-timeline-step--active` — active step
- `.mgp-timeline-step--pending` — pending step
- `.mgp-pickup-footer` — footer bar in slide 2
- `.mgp-outro-card` — transaction summary card in slide 5

The goal is to reduce inline styles in carousel slides by ~80%, keeping only truly unique per-element values as inline.

---

## Files Changed

| File | Changes |
|------|---------|
| `index.html` | Bug fixes, lazy loading, countup JS, slim Über uns, carousel HTML cleanup |
| `style.css` | Mobile hero breakpoint, carousel CSS classes |

## Out of Scope

- Redesign of any section
- Content changes (text copy)
- New sections or features
- Backend/form submission changes
