const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const finalServiceCss = css.slice(css.lastIndexOf('/* Professional Fahrzeugverkauf redesign */'));

function finalMediaBlock(marker) {
  const start = css.lastIndexOf(marker);
  assert.ok(start >= 0, `${marker} is present`);

  const openingBrace = css.indexOf('{', start);
  let depth = 0;
  for (let index = openingBrace; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') depth -= 1;
    if (depth === 0) return css.slice(start, index + 1);
  }

  assert.fail(`${marker} has a closing brace`);
}

function serviceBlock() {
  return html.match(/<section id="service">([\s\S]*?)<\/section>\s*<!-- ═════════ PROZESS/)?.[1];
}

function supportTier() {
  return html.match(/<section class="imd-bottom-panel imd-glass">([\s\S]*?)<\/section>/)?.[1];
}

test('service keeps the binding IMD palette and stylesheet', () => {
  assert.match(css, /#service\{--service-concrete:#CAC9C4;--service-medium:#B3B4B0;--service-highlight:#E5E4DF;--service-card:#D6D6D2;--service-navy:#202A3B;--service-graphite:#1C2228;--service-body:#4C5257;--service-muted:#777A78;--service-border:#9A9C99;--service-soft-border:#BCBDB9;--service-blue:#36A2C5;--service-blue-hover:#278FB4\}/);
  assert.match(html, /style\.css\?v=service-logo-safe-13/);
});

test('service hero markup and branded surfaces remain present', () => {
  const service = serviceBlock();
  assert.ok(service, 'service section is present');
  assert.match(service, /<section class="imd-hero">/);
  assert.match(service, /class="imd-hero-card imd-glass"/);
  assert.match(service, /class="imd-cost-card imd-glass"/);
  assert.match(css, /#service \.imd-hero-card\{[^}]*background:var\(--service-navy\)/s);
  assert.match(css, /#service \.imd-cost-card\{[^}]*background:var\(--service-card\)/s);
});

test('service process keeps exactly four ordered steps', () => {
  const process = html.match(/<div class="imd-process-grid">([\s\S]*?)<\/div>\s*<\/section>/)?.[1];
  assert.ok(process, 'service process is present');
  assert.equal((process.match(/<article>/g) || []).length, 4);
  const labels = ['Meldung', 'Abholung', 'Wertgutachten', 'Auszahlung'];
  let previous = -1;
  for (const label of labels) {
    const index = process.indexOf(label);
    assert.ok(index > previous, `${label} follows the preceding step`);
    previous = index;
  }
});

test('service lower tier contains one four-item benefits area followed by one CTA', () => {
  const support = supportTier();
  assert.ok(support, 'service support tier is present');
  assert.equal((support.match(/class="imd-benefit-card imd-benefit-card--primary"/g) || []).length, 1);
  assert.doesNotMatch(support, /imd-benefit-card--secondary/);
  assert.equal((support.match(/<article>/g) || []).length, 4);
  assert.equal((support.match(/class="imd-cta-split"/g) || []).length, 1);
  assert.ok(support.indexOf('imd-benefit-card--primary') < support.indexOf('imd-cta-split'));
});

test('service lower tier preserves all current benefit and CTA content', () => {
  const support = supportTier();
  for (const text of [
    'Warum Unternehmen IMD wählen',
    'Sicher &amp; zuverlässig',
    'Zeit- &amp; ressourcensparend',
    'Bestmöglicher Preis',
    'Persönlicher Partner',
    'Bereit für einen einfachen Fahrzeugverkauf?',
    'Schnell &amp; unkompliziert',
    'Kostenlos &amp; ohne Aufwand',
    'Faire Preise ohne Nachverhandlung',
    'Wir melden uns innerhalb von 24 Stunden bei Ihnen.',
  ]) assert.match(support, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('desktop uses 48 to 64px editorial section rhythm', () => {
  const desktop = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktop, /#service \.imd-page\{[^}]*gap:clamp\(48px,4vw,64px\)/s);
  assert.match(desktop, /#service \.imd-process-panel\{(?=[^}]*width:min\(1360px,100%\))(?=[^}]*grid-template-columns:1fr)(?=[^}]*padding:clamp\(32px,3vw,40px\))[^}]*\}/s);
});

test('desktop process is one centered connected flow without step cards', () => {
  const desktop = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktop, /#service \.imd-process-grid\{(?=[^}]*position:relative)(?=[^}]*width:min\(1120px,100%\))(?=[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\))[^}]*\}/s);
  assert.match(desktop, /#service \.imd-process-grid::before\{(?=[^}]*left:12\.5%)(?=[^}]*right:12\.5%)(?=[^}]*z-index:0)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-process-grid article\{(?=[^}]*position:relative)(?=[^}]*z-index:1)(?=[^}]*border:0)(?=[^}]*background:transparent)(?=[^}]*box-shadow:none)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-process-grid p\{(?=[^}]*max-width:210px)(?=[^}]*-webkit-line-clamp:2)[^}]*\}/s);
});

test('desktop support tier uses a top-aligned 60/40 composition', () => {
  const desktop = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktop, /#service \.imd-bottom-panel\{(?=[^}]*grid-template-columns:minmax\(0,3fr\) minmax\(380px,2fr\))(?=[^}]*gap:clamp\(24px,2vw,32px\))(?=[^}]*align-items:start)[^}]*\}/s);
  assert.doesNotMatch(desktop, /#service \.imd-bottom-panel\{[^}]*repeat\(3,minmax\(0,1fr\)\)/s);
});

test('benefits use an open 2x2 editorial grid', () => {
  const desktop = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktop, /#service \.imd-benefit-card\{[^}]*padding:clamp\(32px,3vw,40px\)/s);
  assert.match(desktop, /#service \.imd-why-items\{(?=[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\))(?=[^}]*row-gap:32px)(?=[^}]*column-gap:40px)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-why-items article\{(?=[^}]*border:0)(?=[^}]*background:transparent)(?=[^}]*box-shadow:none)[^}]*\}/s);
  assert.doesNotMatch(desktop, /#service \.imd-why-items article[^}]*::after\{[^}]*content:""/s);
  assert.match(desktop, /#service \.imd-why-icon\{[^}]*width:42px[^}]*height:42px/s);
});

test('CTA is compact, top-aligned, and uses existing navy contrast', () => {
  const desktop = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktop, /#service \.imd-cta-split\{(?=[^}]*min-width:380px)(?=[^}]*align-self:start)(?=[^}]*padding:clamp\(32px,3vw,40px\))(?=[^}]*background:var\(--service-navy\))[^}]*\}/s);
  assert.match(desktop, /#service \.imd-cta-split \.imd-button\{[^}]*margin-top:22px/s);
  assert.doesNotMatch(desktop, /#service \.imd-cta-split \.imd-button\{[^}]*margin-top:auto/s);
  assert.match(desktop, /#service \.imd-cta-split small\{[^}]*font-size:12px/s);
});

test('tablet keeps the process readable and stacks benefits above CTA', () => {
  const tablet = finalMediaBlock('@media(max-width:1120px){');
  assert.match(tablet, /#service \.imd-process-grid\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/s);
  assert.match(tablet, /#service \.imd-bottom-panel\{[^}]*grid-template-columns:1fr[^}]*gap:24px/s);
  assert.match(tablet, /#service \.imd-why-items\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s);
  assert.match(tablet, /#service \.imd-cta-split\{(?=[^}]*width:100%)(?=[^}]*min-width:0)[^}]*\}/s);
});

test('mobile process becomes a connected vertical timeline', () => {
  const mobile = finalMediaBlock('@media(max-width:768px){');
  assert.match(mobile, /#service \.imd-process-grid\{[^}]*grid-template-columns:1fr/s);
  assert.match(mobile, /#service \.imd-process-grid::before\{(?=[^}]*left:22px)(?=[^}]*top:22px)(?=[^}]*bottom:22px)(?=[^}]*width:1px)(?=[^}]*height:auto)[^}]*\}/s);
  assert.match(mobile, /#service \.imd-process-grid article\{(?=[^}]*border:0)(?=[^}]*background:transparent)[^}]*\}/s);
  assert.match(mobile, /#service \.imd-bottom-panel\{[^}]*grid-template-columns:1fr/s);
});

test('very narrow mobile stacks benefits into one column', () => {
  const narrow = finalMediaBlock('@media(max-width:620px){');
  assert.match(narrow, /#service \.imd-why-items\{[^}]*grid-template-columns:1fr/s);
});

test('service motion remains disabled for reduced-motion users', () => {
  const reducedMotion = finalMediaBlock('@media(prefers-reduced-motion:reduce){');
  assert.match(reducedMotion, /#service \.imd-process-grid article,#service \.imd-button\{[^}]*animation:none!important[^}]*transition:none!important/s);
});
