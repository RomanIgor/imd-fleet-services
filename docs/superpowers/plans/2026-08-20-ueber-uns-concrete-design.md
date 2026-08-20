# Über-uns Concrete Design Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the `#ueber-uns` section of `index.html` from the old dark "Kalte Präzision" palette to the IMD Concrete Design System, matching the treatment already applied to `#service`/`#prozess`.

**Architecture:** Remove the `sec-dark` class from `<section id="ueber-uns">` and give the section its own scoped `--ueber-*` custom-property namespace and background, following the exact pattern already used by `#service{--service-*...}` and `#prozess.section{--process-*...}`. Redefine the existing "ÜBER UNS" component classes (`.founder-card`, `.prinzip-card`, `.stat-num`, etc. — all unique to this section) in place rather than adding parallel overrides. Replace the two inline-styled `grid-template-columns` wrappers (4-stat row, 3-principle row) with dedicated classes so responsive breakpoints can target them, since neither has any mobile stacking today.

**Tech Stack:** HTML5, CSS custom properties/Grid, Node.js built-in test runner (`node:test`).

## Global Constraints

- `schaden.html` must not be modified — verify with `git diff --stat -- schaden.html` showing no output after implementation.
- Content, copy, image assets, and section order in `#ueber-uns` stay unchanged.
- No other `index.html` section (`#warum`, `#expertise`, `#zielgruppe`, `#rechner`, `#faq`, `#anmelden`, `#kontakt`, `.cta-sec`) may be modified — they are separate future specs.
- Concrete Base (`#CAC9C4`) is the dominant section surface; depth comes from a single subtle radial highlight, lines, typography, and spacing — no strong gradients or glow effects.
- Cards are translucent (`rgba(229,228,223,.72)` + `backdrop-filter:blur(8px)`), never pure white.
- The founder card is the only Navy (`#202A3B`) surface in the section.
- Corporate Blue (`#36A2C5`) is used only for: eyebrow labels, the `<em>` accent in the headline, the founder-quote border, and the single `+9,4%` statistic.
- The IMD logo is never touched by this work (not present in this section, listed for completeness).

---

### Task 1: Write failing regression tests for the Concrete re-skin

**Files:**
- Create: `test/ueber-uns-concrete-redesign.test.js`

**Interfaces:**
- Consumes: `index.html` and `style.css` from the repo root (read via `fs.readFileSync`, same convention as `test/service-section-redesign.test.js`).
- Produces: regression assertions that Task 2's implementation must satisfy — section background/tokens, card treatments, preserved content, and the three new responsive rules.

- [ ] **Step 1: Create the test file with shared helpers**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');

function uberBlock() {
  return html.match(/<section class="section" id="ueber-uns">([\s\S]*?)<\/section>\s*\n\s*<!-- ═════════ EXPERTISE/)?.[1];
}
```

- [ ] **Step 2: Assert the section no longer uses the dark class and defines its own Concrete tokens**

```js
test('ueber-uns drops sec-dark and defines scoped Concrete tokens', () => {
  assert.match(html, /<section class="section" id="ueber-uns">/);
  assert.doesNotMatch(html, /<section class="section sec-dark" id="ueber-uns">/);
  assert.match(css, /#ueber-uns\{(?=[^}]*--ueber-base:#CAC9C4)(?=[^}]*--ueber-navy:#202A3B)(?=[^}]*--ueber-graphite:#1C2228)(?=[^}]*--ueber-body:#4C5257)(?=[^}]*--ueber-blue:#36A2C5)(?=[^}]*background-color:var\(--ueber-base\))(?=[^}]*color:var\(--ueber-graphite\))[^}]*\}/s);
});
```

- [ ] **Step 3: Assert preserved content survives the re-skin**

```js
test('ueber-uns keeps its content unchanged', () => {
  const section = uberBlock();
  assert.ok(section, 'ueber-uns section is present');
  for (const text of [
    'Warum wir IMD Fleet Services gegründet haben',
    'Nicht Fahrzeuge vermitteln.',
    'Prozesse abnehmen.',
    'Mischa Markosyan',
    'Gründer &amp; Geschäftsführer',
    '500+',
    '+9,4%',
    '24h',
    '0 €',
    'Transparenz',
    'Verlässlichkeit',
    'Effizienz',
  ]) assert.match(section, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});
```

- [ ] **Step 4: Assert the old dark inline colors are gone from the section**

```js
test('ueber-uns has no leftover dark-palette inline colors', () => {
  const section = uberBlock();
  assert.doesNotMatch(section, /rgba\(255,255,255,/);
  assert.doesNotMatch(section, /color:#fff/);
  assert.doesNotMatch(section, /var\(--green-l\)/);
});
```

- [ ] **Step 5: Assert the founder card is the Navy accent surface**

```js
test('founder-card is styled as the Navy accent surface', () => {
  assert.match(css, /\.founder-card\{(?=[^}]*background:var\(--ueber-navy\))(?=[^}]*border:1px solid rgba\(229,228,223,\.18\))(?=[^}]*box-shadow:0 22px 48px rgba\(28,34,40,\.2\))[^}]*\}/s);
  assert.match(css, /\.founder-name\{[^}]*color:var\(--ueber-highlight\)[^}]*\}/s);
  assert.match(css, /\.founder-quote\{(?=[^}]*color:rgba\(229,228,223,\.82\))(?=[^}]*border-left:2px solid var\(--ueber-blue\))[^}]*\}/s);
});
```

- [ ] **Step 6: Assert the stat row uses the new banded-divider grid**

```js
test('stat row is a banded Card Surface grid with dividers, not individual dark cells', () => {
  const section = uberBlock();
  assert.match(section, /class="ueber-stats-grid/);
  assert.equal((section.match(/class="ueber-stat-cell"/g) || []).length, 4);
  assert.match(css, /\.ueber-stats-grid\{(?=[^}]*display:grid)(?=[^}]*grid-template-columns:repeat\(4,1fr\))(?=[^}]*background:var\(--ueber-card\))(?=[^}]*border:1px solid var\(--ueber-soft-border\))[^}]*\}/s);
  assert.match(css, /\.ueber-stat-cell:not\(:last-child\)\{[^}]*border-right:1px solid var\(--ueber-border\)[^}]*\}/s);
  assert.match(css, /\.stat-num\{[^}]*color:var\(--ueber-graphite\)[^}]*\}/s);
  assert.match(css, /\.stat-num--accent\{[^}]*color:var\(--ueber-blue\)[^}]*\}/s);
});
```

- [ ] **Step 7: Assert the principle cards use the glass treatment**

```js
test('prinzip-card uses the translucent glass treatment', () => {
  const section = uberBlock();
  assert.match(section, /class="ueber-prinzip-grid"/);
  assert.match(css, /\.prinzip-card\{(?=[^}]*background:rgba\(229,228,223,\.72\))(?=[^}]*backdrop-filter:blur\(8px\))(?=[^}]*border:1px solid rgba\(154,156,153,\.5\))(?=[^}]*box-shadow:0 18px 44px rgba\(28,34,40,\.12\))[^}]*\}/s);
  assert.match(css, /\.prinzip-icon\{(?=[^}]*background:rgba\(32,42,59,\.08\))(?=[^}]*color:var\(--ueber-navy\))[^}]*\}/s);
});
```

- [ ] **Step 8: Assert the three new responsive rules exist**

`860px` is the only occurrence of that breakpoint in the stylesheet, so a direct substring check is safe. `620px` and `480px` each already appear multiple times in the stylesheet for unrelated sections (`#service`/`#prozess` and others), so instead of extracting "the" block by breakpoint, assert that a block containing both the media query and the `.ueber-*` selector exists together in one match — this can't collide with an unrelated pre-existing block at the same breakpoint elsewhere in the file, since no other block in the stylesheet contains `.ueber-prinzip-grid` or `.ueber-stats-grid`.

```js
test('ueber-uns grids stack on mobile at the correct breakpoints', () => {
  assert.match(css, /@media\(max-width:860px\)\{[^}]*\.ueber-stats-grid\{grid-template-columns:repeat\(2,1fr\)\}/s);
  assert.match(css, /@media\(max-width:620px\)\{[^}]*\.ueber-prinzip-grid\{grid-template-columns:1fr\}[^}]*\}/s);
  assert.match(css, /@media\(max-width:480px\)\{[^}]*\.ueber-stats-grid\{grid-template-columns:1fr\}[^}]*\}/s);
});
```

- [ ] **Step 9: Run the new test file and verify RED**

Run:

```powershell
node --test test/ueber-uns-concrete-redesign.test.js
```

Expected: every test in the file fails (the section still has `sec-dark`, no `--ueber-*` tokens, no `ueber-stats-grid`/`ueber-prinzip-grid` classes exist yet).

- [ ] **Step 10: Commit the failing regression tests**

```powershell
git add test/ueber-uns-concrete-redesign.test.js
git commit -m "Test ueber-uns Concrete Design migration"
```

### Task 2: Implement the Concrete re-skin

**Files:**
- Modify: `index.html:551-647` (the `#ueber-uns` section)
- Modify: `style.css:45-65` (the existing `/* ÜBER UNS */` block)
- Modify: `style.css:1003-1027` (existing `@media(max-width:860px)` block — add stat-grid stacking)
- Modify: `style.css` — add two new dedicated media blocks (`max-width:620px`, `max-width:480px`) directly after the `@media(max-width:860px)` block
- Test: `test/ueber-uns-concrete-redesign.test.js`

**Interfaces:**
- Consumes: the assertions written in Task 1.
- Produces: the final `#ueber-uns` markup and CSS that later sections (`#warum`, `#expertise`, etc., in future specs) can reference as the established Concrete pattern for a light section with one Navy accent card.

- [ ] **Step 1: Replace the `#ueber-uns` HTML block**

Replace `index.html:551-647` (the entire section, from `<section class="section sec-dark" id="ueber-uns">` through its closing `</section>`) with:

```html
<section class="section" id="ueber-uns">
  <div class="wrap" style="position:relative;z-index:1">

    <!-- Intro: text links + Gründer-Card rechts -->
    <div class="ub-intro-grid">
      <div class="ub-photo-col">
        <img src="design-assets/about-office.jpg" alt="IMD Fleet Services Büro" class="ub-photo" loading="lazy">
      </div>
      <div>
        <span class="eyebrow">Warum wir IMD Fleet Services gegründet haben</span>
        <h2 class="h2" style="margin-top:14px;margin-bottom:20px">Nicht Fahrzeuge vermitteln.<br><em>Prozesse abnehmen.</em></h2>
        <p style="font-size:18px;color:var(--ueber-body);line-height:1.7;font-weight:500;font-style:italic;border-left:3px solid var(--ueber-blue);padding-left:20px;margin-bottom:24px">
          „Der Verkauf eines Dienstwagens sollte für Ihr Unternehmen nicht mehr als wenige Minuten Aufwand bedeuten. Genau dafür wurde IMD Fleet Services gegründet."
        </p>
        <p style="font-size:15px;color:var(--ueber-body);line-height:1.85;font-weight:300;margin-bottom:16px">
          Wir kennen die Herausforderungen unserer Kunden aus eigener Erfahrung. Die Gründer von IMD Fleet Services verfügen über langjährige Erfahrung im Fuhrparkmanagement, im professionellen Fahrzeughandel sowie in der Digitalisierung von Geschäftsprozessen. Über viele Jahre haben wir erlebt, wie viel Zeit und Ressourcen Unternehmen für den Verkauf einzelner Dienstwagen oder ganzer Fuhrparkbestände aufwenden müssen.
        </p>
        <p style="font-size:15px;color:var(--ueber-body);line-height:1.85;font-weight:300;margin-bottom:16px">
          Dabei wurde uns immer wieder bewusst: Unternehmen benötigen keinen weiteren Fahrzeugankäufer. Unternehmen benötigen einen Partner, der ihnen den gesamten Verkaufsprozess abnimmt. Aus dieser Überzeugung entstand IMD Fleet Services.
        </p>
        <p style="font-size:15px;color:var(--ueber-body);line-height:1.85;font-weight:300">
          Unser Ziel ist nicht, Fahrzeuge zu vermitteln. Unser Ziel ist nicht, Unternehmen in zusätzliche Verkaufsprozesse einzubinden. Unser Ziel ist es, Dienstwagenankauf für Unternehmen so einfach wie möglich zu machen: Digital melden. Direkt an IMD verkaufen. Den Rest übernehmen wir.
        </p>
      </div>

      <!-- Gründer-Card -->
      <div class="rev d1" style="grid-column:1/-1">
        <div class="founder-card">
          <div class="founder-avatar">
            <img class="founder-avatar-img" src="gruender.webp" alt="Mischa Markosyan – Gründer IMD Fleet Services" loading="lazy">
            <div class="founder-info">
              <div class="founder-name">Mischa Markosyan</div>
              <div class="founder-role">Gründer &amp; Geschäftsführer</div>
            </div>
          </div>
          <div class="founder-quote">„Der eigentliche Aufwand entsteht nicht durch das Fahrzeug — er entsteht durch den Verkaufsprozess. Genau diesen Prozess übernehmen wir."</div>
        </div>
      </div>
    </div>

    <!-- Kennzahlen -->
    <div class="ueber-stats-grid rev" style="margin-bottom:56px;margin-top:48px">
      <div class="ueber-stat-cell">
        <div class="stat-num" data-countup="500" data-suffix="+">500+</div>
        <div class="ueber-stat-label">Fahrzeuge abgewickelt</div>
      </div>
      <div class="ueber-stat-cell">
        <div class="stat-num stat-num--accent" data-countup="9.4" data-prefix="+" data-suffix="%">+9,4%</div>
        <div class="ueber-stat-label">Ø über HEK erzielt</div>
      </div>
      <div class="ueber-stat-cell">
        <div class="stat-num">24h</div>
        <div class="ueber-stat-label">Maximale Reaktionszeit</div>
      </div>
      <div class="ueber-stat-cell">
        <div class="stat-num">0 €</div>
        <div class="ueber-stat-label">Kosten für den Fuhrpark</div>
      </div>
    </div>

    <!-- So arbeiten wir — saubere Karten mit SVG-Icons -->
    <div style="margin-bottom:56px">
      <span class="eyebrow" style="margin-bottom:28px">So arbeiten wir</span>
      <div class="ueber-prinzip-grid">

        <div class="rev prinzip-card">
          <div class="prinzip-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div class="prinzip-title">Transparenz</div>
          <div class="prinzip-sub">Ehrlich. Offen. Ohne versteckte Abzüge.</div>
          <div class="prinzip-text">Der Ankaufspreis entsteht auf Basis eines unabhängigen Gutachtens — nicht durch interne Einschätzung. Was wir anbieten, begründen wir. Was wir vereinbaren, halten wir.</div>
        </div>

        <div class="rev d1 prinzip-card">
          <div class="prinzip-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div class="prinzip-title">Verlässlichkeit</div>
          <div class="prinzip-sub">Wir stehen zu unserem Wort.</div>
          <div class="prinzip-text">Der HEK-Mindestpreis ist vor der Abholung zugesichert — nicht danach. Kein Nachverhandeln, keine Überraschungen. Das ist unser Versprechen an jeden Fuhrpark.</div>
        </div>

        <div class="rev d2 prinzip-card">
          <div class="prinzip-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div class="prinzip-title">Effizienz</div>
          <div class="prinzip-sub">2 Minuten Aufwand. Den Rest übernehmen wir.</div>
          <div class="prinzip-text">Fahrzeugmeldung abschicken — alles Weitere koordiniert IMD Fleet Services. Gutachten, Abholung, Abmeldung, Auszahlung. Bundesweit, kostenlos, ohne Koordinationsaufwand für Ihren Fuhrpark.</div>
        </div>

      </div>
    </div>

  </div>
</section>
```

Note what changed vs. the original: `sec-dark` dropped from the section class; `eyebrow-white`/`h2-white` dropped in favor of scoped `#ueber-uns .eyebrow`/`#ueber-uns .h2` CSS rules (Step 2); every `rgba(255,255,255,...)` inline color replaced with `var(--ueber-body)`/`var(--ueber-blue)`; the stat grid and label `style="..."` attributes replaced by `ueber-stats-grid`/`ueber-stat-cell`/`ueber-stat-label` classes; the `+9,4%` stat gets `stat-num--accent`; the "So arbeiten wir" label becomes a `span class="eyebrow"` instead of a one-off styled `div`; the principle-card grid wrapper gets `ueber-prinzip-grid`. Structure, order, images, SVG icons, and all copy are otherwise identical.

- [ ] **Step 2: Replace the `/* ÜBER UNS */` CSS block**

Replace `style.css:45-65` (from `/* ══════════════ ÜBER UNS ══════════════ */` through `#ueber-uns [data-countup]{color:#c8d8e8!important}`) with:

```css
/* ══════════════ ÜBER UNS — Concrete ══════════════ */
#ueber-uns{--ueber-base:#CAC9C4;--ueber-highlight:#E5E4DF;--ueber-card:#D6D6D2;--ueber-navy:#202A3B;--ueber-graphite:#1C2228;--ueber-body:#4C5257;--ueber-muted:#777A78;--ueber-border:#9A9C99;--ueber-soft-border:#BCBDB9;--ueber-blue:#36A2C5;background-color:var(--ueber-base);background-image:radial-gradient(circle at 50% 10%,rgba(229,228,223,.4),transparent 32%);color:var(--ueber-graphite)}
#ueber-uns .eyebrow{color:var(--ueber-blue)}
#ueber-uns .h2{color:var(--ueber-graphite)}
#ueber-uns .h2 em{font-style:normal;color:var(--ueber-blue)}
.ub-intro-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;margin-bottom:0}
.ub-photo{width:100%;max-width:460px;height:360px;border-radius:12px;object-fit:cover;display:block;box-shadow:0 18px 44px rgba(28,34,40,.14)}
/* Gründer-Card — Navy accent surface */
.founder-card{background:var(--ueber-navy);border:1px solid rgba(229,228,223,.18);border-radius:var(--r-2xl);padding:28px;display:flex;flex-direction:column;gap:18px;box-shadow:0 22px 48px rgba(28,34,40,.2)}
.founder-avatar{display:flex;align-items:center;gap:14px}
.founder-avatar-img{width:88px;height:88px;border-radius:50%;object-fit:cover;border:2px solid rgba(229,228,223,.2);flex-shrink:0}
.founder-info{display:flex;flex-direction:column;gap:3px}
.founder-name{font-family:var(--fh);font-size:15px;font-weight:800;color:var(--ueber-highlight);letter-spacing:-.02em}
.founder-role{font-size:12px;color:rgba(229,228,223,.68)}
.founder-quote{font-size:14px;color:rgba(229,228,223,.82);line-height:1.75;font-style:italic;border-left:2px solid var(--ueber-blue);padding-left:14px}
/* Kennzahlen — banded Card Surface row with dividers */
.ueber-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);background:var(--ueber-card);border:1px solid var(--ueber-soft-border);border-radius:var(--r-2xl);overflow:hidden}
.ueber-stat-cell{padding:32px 28px;text-align:center}
.ueber-stat-cell:not(:last-child){border-right:1px solid var(--ueber-border)}
.stat-num{font-family:var(--fh);font-size:44px;font-weight:800;color:var(--ueber-graphite);letter-spacing:-.04em;line-height:1}
.stat-num--accent{color:var(--ueber-blue)}
.ueber-stat-label{font-family:var(--fh);font-size:10px;font-weight:700;color:var(--ueber-muted);text-transform:uppercase;letter-spacing:.16em;margin-top:8px}
/* Prinzip-Karten — translucent glass cards */
.ueber-prinzip-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.prinzip-card{background:rgba(229,228,223,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(154,156,153,.5);border-radius:var(--r-xl);padding:28px 24px;display:flex;flex-direction:column;gap:10px;box-shadow:0 18px 44px rgba(28,34,40,.12)}
.prinzip-icon{width:42px;height:42px;border-radius:var(--r-lg);background:rgba(32,42,59,.08);border:1px solid rgba(32,42,59,.24);display:flex;align-items:center;justify-content:center;color:var(--ueber-navy);margin-bottom:2px;flex-shrink:0}
.prinzip-title{font-family:var(--fh);font-size:16px;font-weight:800;color:var(--ueber-graphite);letter-spacing:-.02em;line-height:1.2}
.prinzip-sub{font-family:var(--fh);font-size:11px;font-weight:600;color:var(--ueber-muted);letter-spacing:.01em}
.prinzip-text{font-size:13px;color:var(--ueber-body);line-height:1.75}
```

This removes the old `#ueber-uns .founder-card{background:rgba(255,255,255,.06)}` override and the `#ueber-uns [data-countup]{color:#c8d8e8!important}` override — both are superseded by the new rules above and would otherwise fight with them.

- [ ] **Step 3: Add stat-grid stacking to the existing `@media(max-width:860px)` block**

In `style.css`, inside the existing `@media(max-width:860px){...}` block that contains `.ub-intro-grid{grid-template-columns:1fr}` and `.ub-photo{max-width:100%;height:260px}` (around line 1025-1026), add immediately after `.ub-photo{max-width:100%;height:260px}`:

```css
  .ueber-stats-grid{grid-template-columns:repeat(2,1fr)}
  .ueber-stat-cell{border-right:0}
  .ueber-stat-cell:nth-child(odd){border-right:1px solid var(--ueber-border)}
  .ueber-stat-cell:nth-child(-n+2){border-bottom:1px solid var(--ueber-border)}
```

- [ ] **Step 4: Add two new dedicated media blocks directly after that `@media(max-width:860px)` block**

```css
@media(max-width:620px){
  .ueber-prinzip-grid{grid-template-columns:1fr}
}
@media(max-width:480px){
  .ueber-stats-grid{grid-template-columns:1fr}
  .ueber-stat-cell{border-right:0}
  .ueber-stat-cell:not(:last-child){border-bottom:1px solid var(--ueber-border)}
}
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```powershell
node --test test/ueber-uns-concrete-redesign.test.js
```

Expected: all 7 tests pass with zero failures.

- [ ] **Step 6: Run the full regression suite and syntax checks**

```powershell
node --test test
node --check main.js
node --check server.js
git diff --check
```

Expected: all tests and checks pass with exit code 0.

- [ ] **Step 7: Confirm schaden.html is untouched**

```powershell
git diff --stat -- schaden.html
```

Expected: no output (empty diff).

- [ ] **Step 8: Verify in the browser at three breakpoints**

Contrast has already been confirmed analytically and does not need recalculating: Body Text `#4C5257` on Concrete Base `#CAC9C4` is ~4.78:1 (passes WCAG AA for normal text, ≥4.5:1), and the founder-card's `rgba(229,228,223,.82)` text on Navy `#202A3B` is ~8.16:1 (passes AAA). The browser pass below is a visual sanity check, not a re-measurement.

Desktop (`1440x900`):
- Section background is light Concrete Base, not dark navy.
- Founder card is the only dark (Navy) surface, with legible light text.
- Kennzahlen render as one banded row of 4 with visible thin dividers, no per-cell background boxes.
- The 3 principle cards show a visible translucent/blurred effect against the Concrete background.
- No horizontal overflow.

Tablet (`820x1180`):
- `.ub-intro-grid` stacks to one column (photo above text).
- Kennzahlen show as 2x2 with a visible divider between columns and between rows.
- No horizontal overflow.

Mobile (`390x844`):
- Kennzahlen stack to one column.
- Principle cards stack to one column.
- Founder card and all text remain legible against their backgrounds.
- No horizontal overflow.

- [ ] **Step 9: Commit the implementation**

```powershell
git add index.html style.css test/ueber-uns-concrete-redesign.test.js
git commit -m "Migrate ueber-uns to Concrete Design System"
```
