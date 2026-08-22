# Über-uns Process Diagram Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `#ueber-uns` founder-card/stat-row/"So arbeiten wir" structure with a process diagram (Ihr Fuhrpark → IMD → 4 steps), a car photo, and a 4-item benefits band, per the approved mockup-based spec.

**Architecture:** Reuse the section's existing `#ueber-uns{--ueber-*}` Concrete token namespace and background (already in place from the prior migration — do not touch `style.css:45-46`). Replace the section's inner HTML (`index.html:551-647`) entirely with new markup. Replace the CSS block that currently styles that inner markup (`style.css:47-84`, the rules following the `#ueber-uns` token line) with new rules for the new components. All new icons are inline 24×24 viewBox stroke SVGs matching the site's existing icon convention. The process-diagram connectors are an absolutely-positioned inline SVG overlay with fixed-pixel coordinates at desktop width; at ≤1060px the diagram switches to a plain vertical flex stack with a CSS dashed border as the connector, so no SVG coordinate math has to survive a layout reflow.

**Tech Stack:** HTML5, inline SVG, CSS Grid/Flexbox, CSS custom properties, Node.js built-in test runner (`node:test`).

## Global Constraints

- `schaden.html` must not be modified.
- No other `index.html` section (`#warum`, `#expertise`, `#zielgruppe`, `#rechner`, `#faq`, `#anmelden`, `#kontakt`, `.cta-sec`) may be modified.
- The eyebrow, headline, and pull-quote text are unchanged from the current implementation. The three paragraphs' wording is unchanged — only `<strong>` emphasis is added, exactly where specified below.
- The IMD logo (`logo_dark.png`) is used unmodified — no recoloring filter, no redraw.
- All new icon SVGs use `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"` in a `viewBox="0 0 24 24"`, matching the site's existing icon convention.
- Reuse the existing `--ueber-base/--ueber-highlight/--ueber-card/--ueber-navy/--ueber-graphite/--ueber-body/--ueber-muted/--ueber-border/--ueber-soft-border/--ueber-blue` custom properties (`style.css:46`) — do not redefine or duplicate them.
- Cards use the translucent glass treatment (`rgba(229,228,223,.72)` + `backdrop-filter:blur(8px)`), never pure white.
- No horizontal overflow at any breakpoint (desktop, ≤1060px, ≤860px, ≤620px, ≤480px — the section's already-established breakpoints).

---

### Task 1: Write failing regression tests for the process-diagram redesign

**Files:**
- Create: `test/ueber-uns-process-diagram.test.js`

**Interfaces:**
- Consumes: `index.html` and `style.css` from the repo root.
- Produces: regression assertions that Task 2's implementation must satisfy — old content removed, new content present with exact copy, new components styled, responsive rules present.

- [ ] **Step 1: Create the test file with a shared section-extraction helper**

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

- [ ] **Step 2: Assert the old founder/stats/"So arbeiten wir" content is gone**

```js
test('ueber-uns no longer contains the founder card, stat row, or So-arbeiten-wir block', () => {
  const section = uberBlock();
  assert.ok(section, 'ueber-uns section is present');
  assert.doesNotMatch(section, /founder-card/);
  assert.doesNotMatch(section, /Mischa Markosyan/);
  assert.doesNotMatch(section, /ueber-stats-grid/);
  assert.doesNotMatch(section, /500\+/);
  assert.doesNotMatch(section, /ueber-prinzip-grid/);
  assert.doesNotMatch(section, /prinzip-card/);
  assert.doesNotMatch(section, /Transparenz/);
  assert.doesNotMatch(section, /design-assets\/about-office\.jpg/);
  assert.doesNotMatch(section, /ub-photo-col/);
});
```

- [ ] **Step 3: Assert the carried-over headline/quote/paragraph content, with the new emphasis spans**

```js
test('ueber-uns keeps its headline, quote, and paragraph wording with the new bold emphasis', () => {
  const section = uberBlock();
  assert.match(section, /Warum wir IMD Fleet Services gegründet haben/);
  assert.match(section, /Nicht Fahrzeuge vermitteln\.<br><em>Prozesse abnehmen\.<\/em>/);
  assert.match(section, /Der Verkauf eines Dienstwagens sollte für Ihr Unternehmen nicht mehr als wenige Minuten Aufwand bedeuten\. Genau dafür wurde IMD Fleet Services gegründet\./);
  assert.match(section, /verfügen über <strong>langjährige Erfahrung im Fuhrparkmanagement, im professionellen Fahrzeughandel sowie in der Digitalisierung von Geschäftsprozessen<\/strong>/);
  assert.match(section, /der ihnen <strong>den gesamten Verkaufsprozess abnimmt<\/strong>/);
  assert.match(section, /<strong>Digital melden\. Direkt an <span class="ub-accent">IMD<\/span> verkaufen\. Den Rest übernehmen wir\.<\/strong>/);
});
```

- [ ] **Step 4: Assert the 3 icon-paragraphs structure**

```js
test('ueber-uns has 3 icon-paragraphs in a ub-point-list', () => {
  const section = uberBlock();
  assert.match(section, /class="ub-point-list"/);
  assert.equal((section.match(/class="ub-point"/g) || []).length, 3);
  assert.equal((section.match(/class="ub-point-icon"/g) || []).length, 3);
  assert.equal((section.match(/class="ub-point-text"/g) || []).length, 3);
});
```

- [ ] **Step 5: Assert the process diagram structure and copy**

```js
test('ueber-uns has a process diagram with origin, hub, and 4 steps', () => {
  const section = uberBlock();
  assert.match(section, /class="ub-diagram-card"/);
  assert.match(section, /class="ub-diagram-origin"/);
  assert.match(section, /Ihr Fuhrpark/);
  assert.match(section, /Ein Fahrzeug\. Viele Aufgaben\. <strong>Ihr Aufwand\.<\/strong>/);
  assert.match(section, /class="ub-diagram-hub"/);
  assert.match(section, /src="logo_dark\.png"/);
  assert.equal((section.match(/class="ub-diagram-step"/g) || []).length, 4);
  for (const [title, text] of [
    ['Bewertung', 'Marktgerechte Bewertung in wenigen Stunden.'],
    ['Abholung', 'Bundesweite Abholung zum Wunschtermin.'],
    ['Abmeldung', 'Stilllegung und Abmeldung übernehmen wir.'],
    ['Auszahlung', 'Schnelle und sichere Auszahlung.'],
  ]) {
    assert.match(section, new RegExp(`class="ub-diagram-step-title">${title}<`));
    assert.match(section, new RegExp(`class="ub-diagram-step-text">${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<`));
  }
  const connectors = section.match(/<svg class="ub-diagram-connectors"[^>]*>([\s\S]*?)<\/svg>/)?.[1];
  assert.ok(connectors, 'connector svg is present');
  assert.equal((connectors.match(/<path/g) || []).length, 4);
});
```

- [ ] **Step 6: Assert the car photo card and the benefits band**

```js
test('ueber-uns has a car photo card and a 4-item benefits band', () => {
  const section = uberBlock();
  assert.match(section, /class="ub-photo-card"/);
  assert.match(section, /src="assets\/icons\/blue-car-speed-motion-stretch-style\.jpg"/);
  assert.match(section, /class="ub-benefits-band"/);
  assert.equal((section.match(/class="ub-benefit"/g) || []).length, 4);
  for (const [title, text] of [
    ['Zeit sparen', 'Verkauf Ihres Fuhrparks in wenigen Minuten Aufwand.'],
    ['Risiken reduzieren', 'Rechtssichere Abwicklung durch einen erfahrenen Partner.'],
    ['Ressourcen schonen', 'Wir übernehmen den gesamten Prozess für Sie.'],
    ['Nachhaltig handeln', 'Fahrzeuge optimal verwerten. Ressourcen verantwortungsvoll nutzen.'],
  ]) {
    assert.match(section, new RegExp(`class="ub-benefit-title">${title}<`));
    assert.match(section, new RegExp(`class="ub-benefit-text">${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<`));
  }
});
```

- [ ] **Step 7: Assert the CSS card treatments and connector styling**

```js
test('diagram and photo cards use the translucent glass treatment; connectors are dashed Corporate Blue', () => {
  assert.match(css, /\.ub-diagram-card,\.ub-photo-card\{(?=[^}]*border:1px solid rgba\(154,156,153,\.5\))(?=[^}]*box-shadow:0 18px 44px rgba\(28,34,40,\.12\))[^}]*\}/s);
  assert.match(css, /\.ub-diagram-card\{(?=[^}]*background:rgba\(229,228,223,\.72\))(?=[^}]*backdrop-filter:blur\(8px\))[^}]*\}/s);
  assert.match(css, /\.ub-diagram-connectors path\{(?=[^}]*stroke:var\(--ueber-blue\))(?=[^}]*stroke-dasharray:4 4)[^}]*\}/s);
});
```

Note: `.ub-diagram-card` and `.ub-photo-card` share their border/shadow via a combined selector (`.ub-diagram-card,.ub-photo-card{...}`) — the test checks that combined rule for `border`/`box-shadow`, and checks the separate single-selector `.ub-diagram-card{...}` rule for `background`/`backdrop-filter`, matching exactly how Step 2 below actually structures the CSS (do not "simplify" this into checking one rule for everything — it will not match).

- [ ] **Step 8: Assert the responsive rules exist**

```js
test('ueber-uns process diagram and benefits band respond at the correct breakpoints', () => {
  assert.match(css, /@media\(max-width:1060px\)\{[\s\S]*?\.ub-content-grid\{grid-template-columns:1fr\}/);
  assert.match(css, /@media\(max-width:1060px\)\{[\s\S]*?\.ub-diagram-body\{(?=[^}]*display:flex)(?=[^}]*flex-direction:column)[^}]*\}/);
  assert.match(css, /@media\(max-width:860px\)\{[\s\S]*?\.ub-benefits-band\{grid-template-columns:repeat\(2,1fr\)\}/);
  assert.match(css, /@media\(max-width:480px\)\{[\s\S]*?\.ub-benefits-band\{grid-template-columns:1fr\}/);
});
```

- [ ] **Step 9: Run the new test file and verify RED**

Run:

```powershell
node --test test/ueber-uns-process-diagram.test.js
```

Expected: every test fails — the section still has the old founder-card/stat-row/prinzip structure, and none of the new classes/CSS exist yet.

- [ ] **Step 10: Commit the failing regression tests**

```powershell
git add test/ueber-uns-process-diagram.test.js
git commit -m "Test ueber-uns process diagram redesign"
```

### Task 2: Implement the process-diagram redesign

**Files:**
- Modify: `index.html:551-647` (the `#ueber-uns` section)
- Modify: `style.css:47-84` (the CSS following the `#ueber-uns` token line, from the prior migration — replaced by new component rules; `style.css:45-46`, the section comment and the `#ueber-uns{--ueber-*}` token line itself, are NOT touched)
- Modify: `style.css` — extend the existing `@media(max-width:1060px)` block, extend the existing `@media(max-width:860px)` block, add a new `@media(max-width:480px)` block for `.ub-benefits-band`
- Test: `test/ueber-uns-process-diagram.test.js`

**Interfaces:**
- Consumes: the assertions written in Task 1; the `--ueber-*` custom properties already defined at `style.css:46`.
- Produces: the final `#ueber-uns` markup and CSS.

- [ ] **Step 1: Replace the `#ueber-uns` section HTML**

Replace `index.html:551-647` (the entire section, from `<section class="section" id="ueber-uns">` through its closing `</section>`) with:

```html
<section class="section" id="ueber-uns">
  <div class="wrap" style="position:relative;z-index:1">

    <div class="ub-content-grid">
      <div class="ub-text-col">
        <span class="eyebrow">Warum wir IMD Fleet Services gegründet haben</span>
        <h2 class="h2" style="margin-top:14px;margin-bottom:20px">Nicht Fahrzeuge vermitteln.<br><em>Prozesse abnehmen.</em></h2>
        <p style="font-size:18px;color:var(--ueber-body);line-height:1.7;font-weight:500;font-style:italic;border-left:3px solid var(--ueber-blue);padding-left:20px;margin-bottom:0">
          „Der Verkauf eines Dienstwagens sollte für Ihr Unternehmen nicht mehr als wenige Minuten Aufwand bedeuten. Genau dafür wurde IMD Fleet Services gegründet."
        </p>

        <div class="ub-point-list">
          <div class="ub-point">
            <div class="ub-point-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.6 2.5-6.4 5.5-6.4s5.5 2.8 5.5 6.4"/><circle cx="17" cy="7.5" r="2.4"/><path d="M14.8 13.2c2.4.4 4.2 2.6 4.2 5.3"/></svg>
            </div>
            <p class="ub-point-text">Wir kennen die Herausforderungen unserer Kunden aus eigener Erfahrung. Die Gründer von IMD Fleet Services verfügen über <strong>langjährige Erfahrung im Fuhrparkmanagement, im professionellen Fahrzeughandel sowie in der Digitalisierung von Geschäftsprozessen</strong>. Über viele Jahre haben wir erlebt, wie viel Zeit und Ressourcen Unternehmen für den Verkauf einzelner Dienstwagen oder ganzer Fuhrparkbestände aufwenden müssen.</p>
          </div>
          <div class="ub-point">
            <div class="ub-point-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
            </div>
            <p class="ub-point-text">Dabei wurde uns immer wieder bewusst: Unternehmen benötigen keinen weiteren Fahrzeugankäufer. Unternehmen benötigen einen Partner, der ihnen <strong>den gesamten Verkaufsprozess abnimmt</strong>. Aus dieser Überzeugung entstand IMD Fleet Services.</p>
          </div>
          <div class="ub-point">
            <div class="ub-point-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>
            </div>
            <p class="ub-point-text">Unser Ziel ist nicht, Fahrzeuge zu vermitteln. Unser Ziel ist nicht, Unternehmen in zusätzliche Verkaufsprozesse einzubinden. Unser Ziel ist es, Dienstwagenankauf für Unternehmen so einfach wie möglich zu machen: <strong>Digital melden. Direkt an <span class="ub-accent">IMD</span> verkaufen. Den Rest übernehmen wir.</strong></p>
          </div>
        </div>
      </div>

      <div class="ub-visual-col">
        <div class="ub-diagram-card">
          <div class="ub-diagram-body">
            <div class="ub-diagram-origin">
              <div class="ub-diagram-origin-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="10" height="18" rx="1"/><path d="M9 21v-4h2v4M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2"/></svg>
              </div>
              <div class="ub-diagram-origin-label">Ihr Fuhrpark</div>
              <div class="ub-diagram-origin-sub">Ein Fahrzeug. Viele Aufgaben. <strong>Ihr Aufwand.</strong></div>
            </div>
            <div class="ub-diagram-hub">
              <img src="logo_dark.png" alt="IMD Fleet Services">
            </div>
            <div class="ub-diagram-steps">
              <div class="ub-diagram-step">
                <div class="ub-diagram-step-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 14l5-5 2 2-5 5H9v-2z"/></svg>
                </div>
                <div>
                  <div class="ub-diagram-step-title">Bewertung</div>
                  <div class="ub-diagram-step-text">Marktgerechte Bewertung in wenigen Stunden.</div>
                </div>
              </div>
              <div class="ub-diagram-step">
                <div class="ub-diagram-step-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="9" height="6" rx="1"/><path d="M11 12h4l3 3v1h-7z"/><circle cx="6" cy="18" r="1.8"/><circle cx="16" cy="18" r="1.8"/><path d="M18 8v4"/></svg>
                </div>
                <div>
                  <div class="ub-diagram-step-title">Abholung</div>
                  <div class="ub-diagram-step-text">Bundesweite Abholung zum Wunschtermin.</div>
                </div>
              </div>
              <div class="ub-diagram-step">
                <div class="ub-diagram-step-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 14l2 2 4-4"/></svg>
                </div>
                <div>
                  <div class="ub-diagram-step-title">Abmeldung</div>
                  <div class="ub-diagram-step-text">Stilllegung und Abmeldung übernehmen wir.</div>
                </div>
              </div>
              <div class="ub-diagram-step">
                <div class="ub-diagram-step-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 8.5a5 5 0 100 7"/><path d="M7.5 11h6M7.5 13.5h5"/></svg>
                </div>
                <div>
                  <div class="ub-diagram-step-title">Auszahlung</div>
                  <div class="ub-diagram-step-text">Schnelle und sichere Auszahlung.</div>
                </div>
              </div>
            </div>
            <svg class="ub-diagram-connectors" viewBox="0 0 416 360" preserveAspectRatio="none">
              <path d="M195,180 C230,180 230,45 272,45"/>
              <path d="M195,180 C230,180 230,135 272,135"/>
              <path d="M195,180 C230,180 230,225 272,225"/>
              <path d="M195,180 C230,180 230,315 272,315"/>
            </svg>
          </div>
        </div>
        <div class="ub-photo-card">
          <img src="assets/icons/blue-car-speed-motion-stretch-style.jpg" alt="IMD Fleet Services Fahrzeugverkauf" class="ub-car-photo" loading="lazy">
        </div>
      </div>
    </div>

    <div class="ub-benefits-band">
      <div class="ub-benefit">
        <div class="ub-benefit-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
        </div>
        <div class="ub-benefit-title">Zeit sparen</div>
        <div class="ub-benefit-text">Verkauf Ihres Fuhrparks in wenigen Minuten Aufwand.</div>
      </div>
      <div class="ub-benefit">
        <div class="ub-benefit-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>
        </div>
        <div class="ub-benefit-title">Risiken reduzieren</div>
        <div class="ub-benefit-text">Rechtssichere Abwicklung durch einen erfahrenen Partner.</div>
      </div>
      <div class="ub-benefit">
        <div class="ub-benefit-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7"/></svg>
        </div>
        <div class="ub-benefit-title">Ressourcen schonen</div>
        <div class="ub-benefit-text">Wir übernehmen den gesamten Prozess für Sie.</div>
      </div>
      <div class="ub-benefit">
        <div class="ub-benefit-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20c-1-6 2-13 12-15 1 9-3 14-9 15-1 .1-2 .1-3 0z"/><path d="M8 18c2-3 5-6 9-9"/></svg>
        </div>
        <div class="ub-benefit-title">Nachhaltig handeln</div>
        <div class="ub-benefit-text">Fahrzeuge optimal verwerten. Ressourcen verantwortungsvoll nutzen.</div>
      </div>
    </div>

  </div>
</section>
```

- [ ] **Step 2: Replace the CSS following the `#ueber-uns` token line**

Replace `style.css:47-84` (everything from `#ueber-uns .eyebrow{color:var(--ueber-blue)}` through the end of the old `.prinzip-text` rule — i.e. all rules that followed the token line from the prior migration) with:

```css
#ueber-uns .eyebrow{color:var(--ueber-blue)}
#ueber-uns .h2{color:var(--ueber-graphite)}
#ueber-uns .h2 em{font-style:normal;color:var(--ueber-blue)}
.ub-content-grid{display:grid;grid-template-columns:minmax(420px,1fr) 480px;gap:48px;align-items:start}
.ub-text-col{min-width:0}
.ub-point-list{display:flex;flex-direction:column;gap:20px;margin-top:24px}
.ub-point{display:flex;gap:14px;align-items:flex-start}
.ub-point-icon,.ub-benefit-icon{width:40px;height:40px;border-radius:50%;background:var(--ueber-highlight);border:1px solid rgba(54,162,197,.4);color:var(--ueber-blue);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ub-point-text{font-size:14px;line-height:1.75;color:var(--ueber-body);margin:0}
.ub-point-text strong{color:var(--ueber-graphite);font-weight:700}
.ub-accent{color:var(--ueber-blue)}
.ub-visual-col{display:flex;flex-direction:column;gap:20px;width:480px}
.ub-diagram-card,.ub-photo-card{width:480px;border-radius:var(--r-xl);border:1px solid rgba(154,156,153,.5);box-shadow:0 18px 44px rgba(28,34,40,.12)}
.ub-diagram-card{padding:32px 28px;background:rgba(229,228,223,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.ub-diagram-body{position:relative;width:416px;height:360px;display:grid;grid-template-columns:120px 110px 1fr;align-items:center}
.ub-diagram-origin{grid-column:1;justify-self:center;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;position:relative;z-index:2}
.ub-diagram-origin-icon{width:40px;height:40px;border-radius:50%;background:var(--ueber-highlight);border:1px solid rgba(54,162,197,.4);color:var(--ueber-blue);display:flex;align-items:center;justify-content:center}
.ub-diagram-origin-label{font-family:var(--fh);font-size:13px;font-weight:800;color:var(--ueber-graphite)}
.ub-diagram-origin-sub{font-size:11px;line-height:1.4;color:var(--ueber-muted)}
.ub-diagram-origin-sub strong{color:var(--ueber-graphite);font-weight:700}
.ub-diagram-hub{grid-column:2;justify-self:center;width:84px;height:84px;border-radius:50%;background:var(--ueber-highlight);border:1px solid var(--ueber-soft-border);box-shadow:0 12px 28px rgba(28,34,40,.16);display:flex;align-items:center;justify-content:center;padding:14px;position:relative;z-index:2}
.ub-diagram-hub img{width:100%;height:auto;object-fit:contain}
.ub-diagram-steps{grid-column:3;display:flex;flex-direction:column;height:360px;position:relative;z-index:2}
.ub-diagram-step{height:90px;display:flex;align-items:center;gap:10px}
.ub-diagram-step-icon{width:36px;height:36px;border-radius:50%;background:var(--ueber-highlight);border:1px solid rgba(54,162,197,.4);color:var(--ueber-blue);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ub-diagram-step-title{font-family:var(--fh);font-size:14px;font-weight:800;color:var(--ueber-graphite);margin-bottom:2px}
.ub-diagram-step-text{font-size:12px;line-height:1.4;color:var(--ueber-body)}
.ub-diagram-connectors{position:absolute;inset:0;width:100%;height:100%}
.ub-diagram-connectors path{fill:none;stroke:var(--ueber-blue);stroke-width:1.5;stroke-dasharray:4 4;stroke-linecap:round}
.ub-photo-card{overflow:hidden}
.ub-car-photo{width:100%;height:220px;object-fit:cover;display:block}
.ub-benefits-band{margin-top:48px;display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--ueber-soft-border);border:1px solid var(--ueber-soft-border);border-radius:var(--r-2xl);overflow:hidden}
.ub-benefit{background:var(--ueber-card);padding:28px 24px}
.ub-benefit-icon{margin-bottom:14px}
.ub-benefit-title{font-family:var(--fh);font-size:15px;font-weight:800;color:var(--ueber-graphite);margin-bottom:6px}
.ub-benefit-text{font-size:13px;line-height:1.6;color:var(--ueber-body)}
```

Note: `.ub-benefits-band` uses a 1px `gap` filled with `--ueber-soft-border` as the divider technique (the grid's background shows through the gap) instead of individual `border-right`/`:not(:last-child)` rules — this sidesteps the CSS-specificity class of bug found and fixed in the prior migration's stat-row (a reset rule losing to a higher-specificity base rule at a narrower breakpoint), since there is no reset rule needed at any breakpoint here.

- [ ] **Step 3: Add the two-column collapse and mobile diagram layout inside the existing `@media(max-width:1060px)` block**

In `style.css`, inside the existing `@media(max-width:1060px){...}` block (the one containing `.ub-intro-grid{grid-template-columns:1fr}` from the prior migration — that selector and everything else already in the block stays; `.ub-intro-grid` no longer matches any element in the new markup and is dead but harmless, do not remove it as part of this task), add:

```css
  .ub-content-grid{grid-template-columns:1fr}
  .ub-visual-col,.ub-diagram-card,.ub-photo-card{width:100%}
  .ub-diagram-body{width:100%;height:auto;display:flex;flex-direction:column;align-items:center;gap:16px}
  .ub-diagram-connectors{display:none}
  .ub-diagram-steps{height:auto;border-left:2px dashed var(--ueber-blue);padding-left:16px;align-self:stretch}
  .ub-diagram-step{height:auto;padding:6px 0}
```

- [ ] **Step 4: Add the benefits-band 2-column rule inside the existing `@media(max-width:860px)` block**

In the same file, inside the existing `@media(max-width:860px){...}` block (the one already extended with the `.ueber-stat-cell` rules from the prior migration — leave those as they are, dead-but-harmless since `.ueber-stat-cell` no longer exists in the markup), add:

```css
  .ub-benefits-band{grid-template-columns:repeat(2,1fr)}
```

- [ ] **Step 5: Add a new `@media(max-width:480px)` block for the benefits band**

Add this as a new block, placed directly after the `@media(max-width:860px)` block:

```css
@media(max-width:480px){
  .ub-benefits-band{grid-template-columns:1fr}
}
```

- [ ] **Step 6: Run the focused test and verify GREEN**

Run:

```powershell
node --test test/ueber-uns-process-diagram.test.js
```

Expected: all 7 tests pass with zero failures.

- [ ] **Step 7: Run the full regression suite and syntax checks**

```powershell
node --test test
node --check main.js
node --check server.js
git diff --check
```

Expected: before deleting anything, the 8 tests in the prior `test/ueber-uns-concrete-redesign.test.js` file that asserted the now-removed founder-card/stat-row/prinzip markup (e.g. `'founder-card is styled as the Navy accent surface'`, `'stat row is a banded Card Surface grid with dividers...'`, `'prinzip-card uses the translucent glass treatment'`) will FAIL, since that markup no longer exists — this is expected, not a regression. Delete `test/ueber-uns-concrete-redesign.test.js` in this step (it tested a structure this task intentionally replaces) and re-run the full suite to confirm a clean result: 40 pre-existing baseline tests (unrelated to `#ueber-uns`) + 7 new tests from `test/ueber-uns-process-diagram.test.js` = 47/47.

- [ ] **Step 8: Confirm schaden.html is untouched**

```powershell
git diff --stat -- schaden.html
```

Expected: no output.

- [ ] **Step 9: Verify in the browser at three breakpoints**

Desktop (`1440x900`):
- Left column: headline, quote, and 3 icon-paragraphs, full width (no photo).
- Right column: diagram card on top (origin → dashed curves → IMD hub → 4 step nodes, all readable, no overlapping text) and the car-photo card below it.
- Diagram connector curves visually connect the hub to each of the 4 step icons without crossing through step text. If the curves are visibly offset from the icons (a few pixels of drift is expected from hand-authored coordinates — this is a normal follow-up-refinement point, not a blocker), adjust the 4 path `d` values and/or the `.ub-diagram-hub`/`.ub-diagram-step-icon` positions by eye until they align, then re-run Step 6's test (the test only checks path count, not coordinates, so this adjustment cannot break it).
- Benefits band: 4 columns with a visible 1px divider between them, readable text, no overflow.
- No horizontal overflow anywhere in the section.

Tablet (`820x1180`):
- Right column moves below the left column, full width.
- Diagram switches to a vertical stack (origin, IMD hub, then the 4 steps connected by a single dashed vertical line on their left edge).
- Benefits band shows 2×2.
- No horizontal overflow.

Mobile (`390x844`):
- Same vertical diagram flow as tablet, narrower.
- Benefits band stacks to 1 column.
- No horizontal overflow.

- [ ] **Step 10: Commit the implementation**

```powershell
git add index.html style.css test/ueber-uns-process-diagram.test.js
git rm test/ueber-uns-concrete-redesign.test.js
git commit -m "Replace ueber-uns founder/stats layout with process diagram"
```
