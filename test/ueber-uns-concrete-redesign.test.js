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

test('ueber-uns drops sec-dark and defines scoped Concrete tokens', () => {
  assert.match(html, /<section class="section" id="ueber-uns">/);
  assert.doesNotMatch(html, /<section class="section sec-dark" id="ueber-uns">/);
  assert.match(css, /#ueber-uns\{(?=[^}]*--ueber-base:#CAC9C4)(?=[^}]*--ueber-navy:#202A3B)(?=[^}]*--ueber-graphite:#1C2228)(?=[^}]*--ueber-body:#4C5257)(?=[^}]*--ueber-blue:#36A2C5)(?=[^}]*background-color:var\(--ueber-base\))(?=[^}]*color:var\(--ueber-graphite\))[^}]*\}/s);
});

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

test('ueber-uns has no leftover dark-palette inline colors', () => {
  const section = uberBlock();
  assert.doesNotMatch(section, /rgba\(255,255,255,/);
  assert.doesNotMatch(section, /color:#fff/);
  assert.doesNotMatch(section, /var\(--green-l\)/);
});

test('founder-card is styled as the Navy accent surface', () => {
  assert.match(css, /\.founder-card\{(?=[^}]*background:var\(--ueber-navy\))(?=[^}]*border:1px solid rgba\(229,228,223,\.18\))(?=[^}]*box-shadow:0 22px 48px rgba\(28,34,40,\.2\))[^}]*\}/s);
  assert.match(css, /\.founder-name\{[^}]*color:var\(--ueber-highlight\)[^}]*\}/s);
  assert.match(css, /\.founder-quote\{(?=[^}]*color:rgba\(229,228,223,\.82\))(?=[^}]*border-left:2px solid var\(--ueber-blue\))[^}]*\}/s);
});

test('stat row is a banded Card Surface grid with dividers, not individual dark cells', () => {
  const section = uberBlock();
  assert.match(section, /class="ueber-stats-grid/);
  assert.equal((section.match(/class="ueber-stat-cell"/g) || []).length, 4);
  assert.match(css, /\.ueber-stats-grid\{(?=[^}]*display:grid)(?=[^}]*grid-template-columns:repeat\(4,1fr\))(?=[^}]*background:var\(--ueber-card\))(?=[^}]*border:1px solid var\(--ueber-soft-border\))[^}]*\}/s);
  assert.match(css, /\.ueber-stat-cell:not\(:last-child\)\{[^}]*border-right:1px solid var\(--ueber-border\)[^}]*\}/s);
  assert.match(css, /\.stat-num\{[^}]*color:var\(--ueber-graphite\)[^}]*\}/s);
  assert.match(css, /\.stat-num--accent\{[^}]*color:var\(--ueber-blue\)[^}]*\}/s);
});

test('prinzip-card uses the translucent glass treatment', () => {
  const section = uberBlock();
  assert.match(section, /class="ueber-prinzip-grid"/);
  assert.match(css, /\.prinzip-card\{(?=[^}]*background:rgba\(229,228,223,\.72\))(?=[^}]*backdrop-filter:blur\(8px\))(?=[^}]*border:1px solid rgba\(154,156,153,\.5\))(?=[^}]*box-shadow:0 18px 44px rgba\(28,34,40,\.12\))[^}]*\}/s);
  assert.match(css, /\.prinzip-icon\{(?=[^}]*background:rgba\(32,42,59,\.08\))(?=[^}]*color:var\(--ueber-navy\))[^}]*\}/s);
});

test('ueber-uns grids stack on mobile at the correct breakpoints', () => {
  assert.match(css, /@media\(max-width:860px\)\{[^}]*\.ueber-stats-grid\{grid-template-columns:repeat\(2,1fr\)\}/s);
  assert.match(css, /@media\(max-width:620px\)\{[^}]*\.ueber-prinzip-grid\{grid-template-columns:1fr\}[^}]*\}/s);
  assert.match(css, /@media\(max-width:480px\)\{[^}]*\.ueber-stats-grid\{grid-template-columns:1fr\}[^}]*\}/s);
});

test('stat-cell right-border reset matches the base rule specificity at both mobile breakpoints', () => {
  assert.match(css, /@media\(max-width:860px\)\{[\s\S]*?\.ueber-stat-cell:not\(:last-child\)\{border-right:0\}/);
  assert.match(css, /@media\(max-width:480px\)\{[\s\S]*?\.ueber-stat-cell:not\(:last-child\)\{border-right:0\}/);
});
