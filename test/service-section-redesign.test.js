const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const finalServiceCss = css.slice(css.lastIndexOf('/* Professional Fahrzeugverkauf redesign */'));
const compactDesktopMedia = '@media(min-width:1121px){';
const compactTabletMedia = '@media(max-width:1120px){';

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

test('service preserves its hero content, background, and typography', () => {
  const service = serviceBlock();
  assert.ok(service, 'service section is present');
  assert.match(service, /<section class="imd-hero">/);
  assert.match(service, /class="imd-hero-card imd-glass"/);
  assert.match(service, /class="imd-cost-card imd-glass"/);
  for (const text of [
    'FAHRZEUGVERKAUF FÜR UNTERNEHMEN',
    'Firmenfahrzeuge<br>verkaufen –<br>ohne Aufwand für<br>Ihren Fuhrpark.',
    'Der Aufwand entsteht nicht durch das Fahrzeug –<br>sondern durch den Verkaufsprozess.',
    'IMD FLEET SERVICES VOLLSERVICE',
    'Für Sie vollständig<br>kostenfrei.*',
  ]) assert.match(service, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(finalServiceCss, /#service\{(?=[^}]*background-color:var\(--service-concrete\))(?=[^}]*background-image:[^}]*url\('assets\/showroom-background\.png'\))(?=[^}]*background-size:cover,cover,cover,cover)(?=[^}]*background-repeat:no-repeat)[^}]*\}/s);
  assert.match(finalServiceCss, /#service \.imd-hero-card\{(?=[^}]*background:var\(--service-navy\))(?=[^}]*border-color:rgba\(229,228,223,\.18\))(?=[^}]*box-shadow:0 26px 56px rgba\(28,34,40,\.22\))[^}]*\}/s);
  assert.match(finalServiceCss, /#service \.imd-cost-card\{(?=[^}]*background:var\(--service-card\))(?=[^}]*border-color:var\(--service-soft-border\))(?=[^}]*box-shadow:0 18px 42px rgba\(28,34,40,\.13\))[^}]*\}/s);
  assert.match(finalServiceCss, /#service \.imd-h1\{(?=[^}]*font-size:clamp\(36px,2\.8vw,42px\))(?=[^}]*line-height:1\.04)(?=[^}]*letter-spacing:-\.035em)[^}]*\}/s);
  assert.match(finalServiceCss, /#service \.imd-subline\{(?=[^}]*font-size:16px)(?=[^}]*line-height:1\.65)[^}]*\}/s);
});

test('service process keeps exactly four ordered steps', () => {
  const process = html.match(/<div class="imd-process-grid">([\s\S]*?)<\/div>\s*<\/section>/)?.[1];
  assert.ok(process, 'service process is present');
  assert.equal((process.match(/<article>/g) || []).length, 4);
  const labels = [
    'Meldung',
    'Fahrzeug online anmelden.',
    'Abholung',
    'Bundesweit',
    'Wertgutachten',
    'Nachvollziehbares Wertgutachten.',
    'Auszahlung',
    'Schnell und Fair.',
  ];
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

test('compact desktop and tablet breakpoints are adjacent and non-overlapping', () => {
  const editorialStart = css.lastIndexOf('/* Service editorial composition */');
  assert.ok(editorialStart >= 0, 'final service composition is present');
  const editorial = css.slice(editorialStart);
  const desktopMin = Number(editorial.match(/@media\(min-width:(\d+)px\)\{/)?.[1]);
  const tabletMax = Number(editorial.match(/@media\(max-width:(\d+)px\)\{/)?.[1]);

  assert.equal(desktopMin, 1121, 'compact desktop starts immediately above the tablet range');
  assert.equal(tabletMax, 1120, 'tablet behavior ends at the approved boundary');
  assert.equal(desktopMin, tabletMax + 1, 'compact desktop and tablet ranges are adjacent without overlap');
});

test('desktop uses compact intentional section rhythm', () => {
  const desktop = finalMediaBlock(compactDesktopMedia);
  assert.match(desktop, /#service \.imd-page\{[^}]*gap:0/s);
  assert.match(desktop, /#service \.imd-process-panel\{(?=[^}]*width:min\(1360px,100%\))(?=[^}]*padding:28px 32px)(?=[^}]*grid-template-columns:1fr)(?=[^}]*gap:24px)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-bottom-panel\{(?=[^}]*width:min\(1360px,100%\))(?=[^}]*margin:24px 0 0)[^}]*\}/s);
});

test('desktop process uses centered equal steps and subtle connectors', () => {
  const desktop = finalMediaBlock(compactDesktopMedia);
  assert.match(desktop, /#service \.imd-process-panel \.imd-intro-text\{(?=[^}]*max-width:760px)(?=[^}]*justify-self:center)(?=[^}]*display:flex)(?=[^}]*flex-wrap:wrap)(?=[^}]*justify-content:center)(?=[^}]*column-gap:8px)(?=[^}]*row-gap:2px)(?=[^}]*text-align:center)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-process-panel \.imd-intro-text h3\{(?=[^}]*flex-basis:100%)(?=[^}]*margin:0 0 6px)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-process-panel \.imd-intro-text p\{[^}]*margin:0/s);
  assert.match(desktop, /#service \.imd-process-grid\{(?=[^}]*width:min\(1080px,100%\))(?=[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\))(?=[^}]*gap:32px)(?=[^}]*counter-reset:service-step)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-process-grid::before\{[^}]*content:none[^}]*display:none/s);
  assert.match(desktop, /#service \.imd-process-grid article\{(?=[^}]*display:grid)(?=[^}]*grid-template-columns:48px minmax\(0,1fr\))(?=[^}]*grid-template-rows:auto auto)(?=[^}]*column-gap:14px)(?=[^}]*align-items:center)(?=[^}]*text-align:left)(?=[^}]*padding:0)(?=[^}]*border:0)(?=[^}]*background:transparent)(?=[^}]*box-shadow:none)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-process-grid article:not\(:last-child\)::after\{(?=[^}]*display:block)(?=[^}]*top:21px)(?=[^}]*left:calc\(100% \+ 4px\))(?=[^}]*width:24px)(?=[^}]*height:6px)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-process-line-icon\{(?=[^}]*grid-column:1)(?=[^}]*grid-row:1 \/ 3)(?=[^}]*width:48px)(?=[^}]*height:48px)(?=[^}]*margin:0)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-process-grid h4\{(?=[^}]*grid-column:2)(?=[^}]*grid-row:1)(?=[^}]*margin:0 0 3px)(?=[^}]*font-size:17px)(?=[^}]*font-weight:600)(?=[^}]*line-height:1\.1)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-process-grid h4::before\{(?=[^}]*display:block)(?=[^}]*margin-bottom:2px)(?=[^}]*font-size:11px)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-process-grid p\{(?=[^}]*grid-column:2)(?=[^}]*grid-row:2)(?=[^}]*max-width:190px)(?=[^}]*font-size:14px)(?=[^}]*line-height:1\.35)(?=[^}]*-webkit-line-clamp:2)[^}]*\}/s);
});

test('desktop support tier uses a top-aligned 56/44 composition', () => {
  const desktop = finalMediaBlock(compactDesktopMedia);
  assert.match(desktop, /#service \.imd-bottom-panel\{(?=[^}]*width:min\(1360px,100%\))(?=[^}]*grid-template-columns:minmax\(0,56fr\) minmax\(420px,44fr\))(?=[^}]*gap:24px)(?=[^}]*align-items:start)[^}]*\}/s);
  assert.doesNotMatch(desktop, /#service \.imd-bottom-panel\{[^}]*repeat\(3,minmax\(0,1fr\)\)/s);
});

test('benefits use an open 2x2 editorial grid', () => {
  const desktop = finalMediaBlock(compactDesktopMedia);
  assert.match(desktop, /#service \.imd-benefit-card\{[^}]*padding:clamp\(32px,3vw,40px\)/s);
  assert.match(desktop, /#service \.imd-why-items\{(?=[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\))(?=[^}]*row-gap:36px)(?=[^}]*column-gap:40px)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-why-items article\{(?=[^}]*grid-template-columns:46px minmax\(0,1fr\))(?=[^}]*column-gap:18px)(?=[^}]*border:0)(?=[^}]*background:transparent)(?=[^}]*box-shadow:none)[^}]*\}/s);
  assert.doesNotMatch(desktop, /#service \.imd-why-items article[^}]*::after\{[^}]*content:""/s);
  assert.match(desktop, /#service \.imd-why-icon\{[^}]*width:46px[^}]*height:46px/s);
  assert.match(desktop, /#service \.imd-why-items h4\{[^}]*font-size:16px[^}]*font-weight:750/s);
});

test('CTA is proportioned, top-aligned, and uses existing navy contrast', () => {
  const desktop = finalMediaBlock(compactDesktopMedia);
  assert.match(desktop, /#service \.imd-cta-split\{(?=[^}]*min-width:400px)(?=[^}]*align-self:start)(?=[^}]*padding:32px)(?=[^}]*background:var\(--service-navy\))[^}]*\}/s);
  assert.match(desktop, /#service \.imd-cta-split h3\{(?=[^}]*margin:0 0 16px)(?=[^}]*max-width:460px)[^}]*\}/s);
  assert.match(desktop, /#service \.imd-cta-split \.imd-button\{(?=[^}]*width:100%)(?=[^}]*min-height:54px)(?=[^}]*margin-top:22px)[^}]*\}/s);
  assert.doesNotMatch(desktop, /#service \.imd-cta-split \.imd-button\{[^}]*margin-top:auto/s);
  assert.match(desktop, /#service \.imd-cta-split small\{[^}]*font-size:12px/s);
});

test('tablet keeps the process readable and stacks benefits above CTA', () => {
  const tablet = finalMediaBlock(compactTabletMedia);
  assert.match(tablet, /#service \.imd-process-panel\{[^}]*height:auto/s);
  assert.match(tablet, /#service \.imd-process-grid\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/s);
  assert.match(tablet, /#service \.imd-bottom-panel\{[^}]*grid-template-columns:1fr[^}]*gap:24px/s);
  assert.match(tablet, /#service \.imd-why-items\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s);
  assert.match(tablet, /#service \.imd-cta-split\{(?=[^}]*width:100%)(?=[^}]*min-width:0)[^}]*\}/s);
});

test('mobile process becomes a connected vertical timeline', () => {
  const mobile = finalMediaBlock('@media(max-width:768px){');
  assert.match(mobile, /#service \.imd-process-grid\{[^}]*grid-template-columns:1fr/s);
  assert.match(mobile, /#service \.imd-process-grid::before\{[^}]*content:none[^}]*display:none/s);
  assert.match(mobile, /#service \.imd-process-grid article:not\(:last-child\)::after\{(?=[^}]*content:"↓")(?=[^}]*display:block)(?=[^}]*left:18px)[^}]*\}/s);
  assert.match(mobile, /#service \.imd-process-grid article\{(?=[^}]*border:0)(?=[^}]*background:transparent)[^}]*\}/s);
  assert.match(mobile, /#service \.imd-bottom-panel\{[^}]*grid-template-columns:1fr/s);
});

test('tablet process uses short arrows without a continuous line', () => {
  const tablet = finalMediaBlock(compactTabletMedia);
  assert.match(tablet, /#service \.imd-process-grid::before\{[^}]*content:none[^}]*display:none/s);
  assert.match(tablet, /#service \.imd-process-grid article:not\(:last-child\)::after\{(?=[^}]*content:"→")(?=[^}]*display:block)[^}]*\}/s);
  assert.match(tablet, /#service \.imd-process-grid h4::before\{[^}]*content:"0" counter\(service-step\)/s);
});

test('very narrow mobile stacks benefits into one column', () => {
  const narrow = finalMediaBlock('@media(max-width:620px){');
  assert.match(narrow, /#service \.imd-why-items\{[^}]*grid-template-columns:1fr/s);
});

test('service motion remains disabled for reduced-motion users', () => {
  const reducedMotion = finalMediaBlock('@media(prefers-reduced-motion:reduce){');
  assert.match(reducedMotion, /#service \.imd-process-grid article,#service \.imd-button\{[^}]*animation:none!important[^}]*transition:none!important/s);
});
