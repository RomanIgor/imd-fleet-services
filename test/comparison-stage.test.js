const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'main.js'), 'utf8');

function count(pattern, source) {
  return [...source.matchAll(pattern)].length;
}

test('comparison stage has two concise alternatives and a central IMD result', () => {
  assert.match(html, /class="difference-stage"/);
  assert.equal(count(/class="difference-side(?:\s|\\")/g, html), 3);
  assert.equal(count(/class="difference-row"/g, html), 10);
  assert.match(html, /class="difference-core"/);
  assert.match(html, /ca\. 20 Minuten/);
  assert.match(html, /interner Aufwand/);
  assert.match(html, /Fahrzeug digital melden\.<br>Den Rest übernehmen wir\./);
  assert.doesNotMatch(html, /difference-option-list[\s\S]*?<small>/);
});

test('comparison stage provides connector, responsive, focus, and motion styling', () => {
  assert.match(css, /\.difference-stage\s*\{/);
  assert.match(css, /\.difference-connector/);
  assert.match(css, /\.difference-core::before/);
  assert.match(css, /\.difference-stage[^}]*grid-template-columns\s*:\s*minmax\(0,27fr\)\s+minmax\(320px,46fr\)\s+minmax\(0,27fr\)/s);
  assert.match(css, /@media\s*\(max-width\s*:\s*768px\)[\s\S]*\.difference-stage/);
  assert.match(css, /\.difference-side:focus-visible/);
  assert.match(css, /@media\s*\(prefers-reduced-motion\s*:\s*reduce\)[\s\S]*\.difference-side/);
});

test('comparison connectors align dynamically with all ten rows', () => {
  assert.match(html, /style\.css\?v=service-logo-safe-6/);
  assert.match(html, /main\.js\?v=privacy-xlsx-connectors-refinement-4/);
  assert.match(html, /<svg class="difference-connectors"/);
  assert.equal(count(/class="difference-connector-path"/g, html), 10);
  assert.match(js, /function updateDifferenceConnectors\(\)/);
  assert.match(js, /ResizeObserver/);
  assert.match(css, /\.difference-connector-path\s*\{/);
  assert.match(css, /stroke-dasharray\s*:/);
  assert.match(css, /#warum \.difference-head \.h2[^{]*\{[^}]*font-size\s*:\s*clamp\([^,]+,[^,]+,46px\)/s);
});

test('comparison background is concrete without a square grid', () => {
  assert.match(html, /style\.css\?v=service-logo-safe-6/);
  assert.match(css, /#warum\s*\{[^}]*url\('new_images\/2\.jpeg'\)/s);
  assert.doesNotMatch(css, /background-size\s*:\s*auto,auto,82px 82px,82px 82px/);
  assert.doesNotMatch(css, /linear-gradient\(rgba\(255,255,255,\.12\) 1px,transparent 1px\)/);
});

test('comparison panels use local icons and connector endpoint nodes', () => {
  assert.match(html, /assets\/icons\/user-key\.svg/);
  assert.match(html, /assets\/icons\/handshake\.svg/);
  assert.equal(count(/<marker id="difference-node-/g, html), 4);
  assert.match(css, /marker-start\s*:\s*url\(#difference-node-private\)/);
  assert.match(css, /marker-end\s*:\s*url\(#difference-node-imd\)/);
  assert.match(html, /style\.css\?v=service-logo-safe-6/);
});

test('comparison header uses a compact evidence badge', () => {
  assert.match(html, /class="difference-insight difference-proof"/);
  assert.match(html, />Geprüfte Abwicklung</);
  assert.match(html, />GKK-zertifiziert</);
  assert.match(html, />HEK-Mindestpreis</);
  assert.match(html, />Rechtssicher</);
  assert.doesNotMatch(html, /Mehr Sicherheit\. Weniger Aufwand\./);
  assert.match(css, /\.difference-proof-points\s*\{/);
  assert.match(html, /style\.css\?v=service-logo-safe-6/);
});

test('comparison content moves upward on desktop without changing mobile spacing', () => {
  assert.match(css, /@media\s*\(min-width\s*:\s*1121px\)[\s\S]*?#warum\.section\s*\{[^}]*padding-top\s*:\s*72px[^}]*\}[\s\S]*?\.difference-showcase\s*\{[^}]*gap\s*:\s*10px/s);
  assert.match(html, /style\.css\?v=service-logo-safe-6/);
});

test('comparison side panels become an exclusive accessible mobile accordion', () => {
  assert.equal(count(/class="difference-side-head" type="button"/g, html), 3);
  assert.equal(count(/aria-expanded="false"/g, html), 3);
  assert.equal(count(/aria-controls="difference-panel-/g, html), 3);
  assert.equal(count(/class="difference-side-body" id="difference-panel-/g, html), 3);
  assert.match(js, /function initMobileDifferenceAccordion\(\)/);
  assert.match(js, /const mobileQuery = window\.matchMedia\('\(max-width:768px\)'\)/);
  assert.match(js, /panels\.forEach\(otherPanel => setDifferencePanelState\(otherPanel, otherPanel === panel && !isOpen\)\)/);
  assert.match(css, /@media\(max-width:768px\)[\s\S]*\.difference-side-body\[hidden\]\{display:none\}/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)[\s\S]*\.difference-side-body/);
  assert.match(html, /style\.css\?v=service-logo-safe-6/);
  assert.match(html, /main\.js\?v=privacy-xlsx-connectors-refinement-4/);
});

test('mobile comparison adds IMD benefits and removes duplicate registration actions', () => {
  assert.match(html, /class="difference-side difference-side-imd" data-mobile-default="open"/);
  assert.match(html, /id="difference-panel-imd"/);
  assert.match(html, />Fahrzeug digital melden</);
  assert.match(html, />Kostenfreie Abholung</);
  assert.match(html, />HEK-Mindestpreis gesichert</);
  assert.match(html, />Rechtssicher &amp; DSGVO-konform</);
  assert.match(html, />Schnelle Auszahlung</);
  assert.match(html, /class="difference-mobile-actions"/);
  assert.match(js, /panel\.dataset\.mobileDefault === 'open'/);
  assert.match(css, /\.difference-accordion-indicator\{[^}]*justify-self:end/s);
  assert.match(css, /@media\(max-width:768px\)[\s\S]*\.difference-core > a[^}]*display:none[\s\S]*\.difference-cta[^}]*display:none[\s\S]*\.difference-benefits[^}]*display:none/s);
});

test('mobile accordion uses a borderless CSS-drawn plus and minus', () => {
  assert.match(css, /@media\(max-width:768px\)[\s\S]*\.difference-accordion-indicator\{[^}]*width:18px[^}]*height:18px[^}]*border:0[^}]*position:relative/s);
  assert.match(css, /\.difference-accordion-indicator::before,\.difference-accordion-indicator::after\{[^}]*position:absolute[^}]*background:var\(--cmp-highlight\)/s);
  assert.match(css, /\.difference-accordion-indicator::before\{[^}]*width:18px[^}]*height:1\.5px/s);
  assert.match(css, /\.difference-accordion-indicator::after\{[^}]*width:1\.5px[^}]*height:18px/s);
  assert.match(css, /\.difference-side\.is-open \.difference-accordion-indicator::after\{[^}]*opacity:0[^}]*transform:scaleY\(0\)/s);
  assert.match(html, /style\.css\?v=service-logo-safe-6/);
});
