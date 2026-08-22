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

test('ueber-uns keeps its headline, quote, and paragraph wording with the new bold emphasis', () => {
  const section = uberBlock();
  assert.match(section, /Warum wir IMD Fleet Services gegründet haben/);
  assert.match(section, /Nicht Fahrzeuge vermitteln\.<br><em>Prozesse abnehmen\.<\/em>/);
  assert.match(section, /Der Verkauf eines Dienstwagens sollte für Ihr Unternehmen nicht mehr als wenige Minuten Aufwand bedeuten\. Genau dafür wurde IMD Fleet Services gegründet\./);
  assert.match(section, /verfügen über <strong>langjährige Erfahrung im Fuhrparkmanagement, im professionellen Fahrzeughandel sowie in der Digitalisierung von Geschäftsprozessen<\/strong>/);
  assert.match(section, /der ihnen <strong>den gesamten Verkaufsprozess abnimmt<\/strong>/);
  assert.match(section, /<strong>Digital melden\. Direkt an <span class="ub-accent">IMD<\/span> verkaufen\. Den Rest übernehmen wir\.<\/strong>/);
});

test('ueber-uns has 3 icon-paragraphs in a ub-point-list', () => {
  const section = uberBlock();
  assert.match(section, /class="ub-point-list"/);
  assert.equal((section.match(/class="ub-point"/g) || []).length, 3);
  assert.equal((section.match(/class="ub-point-icon"/g) || []).length, 3);
  assert.equal((section.match(/class="ub-point-text"/g) || []).length, 3);
});

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

test('diagram and photo cards use the translucent glass treatment; connectors are dashed Corporate Blue', () => {
  assert.match(css, /\.ub-diagram-card,\.ub-photo-card\{(?=[^}]*border:1px solid rgba\(154,156,153,\.5\))(?=[^}]*box-shadow:0 18px 44px rgba\(28,34,40,\.12\))[^}]*\}/s);
  assert.match(css, /\.ub-diagram-card\{(?=[^}]*background:rgba\(229,228,223,\.72\))(?=[^}]*backdrop-filter:blur\(8px\))[^}]*\}/s);
  assert.match(css, /\.ub-diagram-connectors path\{(?=[^}]*stroke:var\(--ueber-blue\))(?=[^}]*stroke-dasharray:4 4)[^}]*\}/s);
});

test('ueber-uns process diagram and benefits band respond at the correct breakpoints', () => {
  assert.match(css, /@media\(max-width:1060px\)\{[\s\S]*?\.ub-content-grid\{grid-template-columns:1fr\}/);
  assert.match(css, /@media\(max-width:1060px\)\{[\s\S]*?\.ub-diagram-body\{(?=[^}]*display:flex)(?=[^}]*flex-direction:column)[^}]*\}/);
  assert.match(css, /@media\(max-width:860px\)\{[\s\S]*?\.ub-benefits-band\{grid-template-columns:repeat\(2,1fr\)\}/);
  assert.match(css, /@media\(max-width:480px\)\{[\s\S]*?\.ub-benefits-band\{grid-template-columns:1fr\}/);
});
