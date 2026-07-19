const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');

test('service redesign uses the binding IMD concrete palette', () => {
  assert.match(css, /#service\{--service-concrete:#CAC9C4;--service-medium:#B3B4B0;--service-highlight:#E5E4DF;--service-card:#D6D6D2;--service-navy:#202A3B;--service-graphite:#1C2228;--service-body:#4C5257;--service-muted:#777A78;--service-border:#9A9C99;--service-soft-border:#BCBDB9;--service-blue:#36A2C5;--service-blue-hover:#278FB4\}/);
  assert.match(html, /style\.css\?v=service-professional-redesign-11/);
});

test('service opening area has a navy primary panel and restrained card surface', () => {
  assert.match(css, /@media\(min-width:1101px\)\{[\s\S]*#service \.imd-hero\{[^}]*grid-template-columns:minmax\(440px,560px\) 1fr minmax\(330px,390px\)/s);
  assert.match(css, /#service \.imd-hero-card\{[^}]*background:var\(--service-navy\)[^}]*color:var\(--service-highlight\)/s);
  assert.match(css, /#service \.imd-cost-card\{[^}]*background:var\(--service-card\)/s);
  assert.match(css, /#service \.imd-h1\{[^}]*font-size:clamp\(40px,[^,]+,48px\)/s);
  assert.match(css, /#service \.imd-subline\{[^}]*font-size:16px/s);
});

test('service process is one coherent editorial band', () => {
  assert.match(css, /#service \.imd-process-panel\{[^}]*background:rgba\(229,228,223,\.72\)/s);
  assert.match(css, /#service \.imd-process-grid article\{[^}]*background:transparent[^}]*border:0/s);
  assert.match(css, /#service \.imd-process-line-icon\{[^}]*background:var\(--service-navy\)/s);
});

test('service normal-size supporting copy uses the AA body color', () => {
  assert.match(css, /#service \.imd-note\{[^}]*font-size:12px[^}]*color:var\(--service-body\)/s);
  assert.match(css, /#service \.imd-process-number\{[^}]*font-size:12px[^}]*color:var\(--service-body\)/s);
});

test('service benefits avoid an administrative boxed grid', () => {
  assert.match(css, /#service \.imd-why-items article\{[^}]*background:transparent[^}]*border:0/s);
  assert.match(css, /#service \.imd-why-items article:not\(:last-child\)::after/);
  assert.match(css, /#service \.imd-why-items p\{[^}]*font-size:14px/s);
});

test('service CTA and keyboard focus are accessible', () => {
  assert.match(css, /#service \.imd-cta-split\{[^}]*background:var\(--service-navy\)/s);
  assert.match(css, /#service \.imd-button\{[^}]*min-height:48px/s);
  assert.match(css, /#service \.imd-button:focus-visible\{[^}]*outline:2px solid var\(--service-blue\)/s);
});

test('service mobile layout is content-driven and deliberately stacked', () => {
  const desktopHero = css.indexOf('#service .imd-hero{min-height:430px');
  const finalMobileLayer = css.lastIndexOf('@media(max-width:768px){');

  assert.ok(desktopHero >= 0, 'desktop service hero rule is present');
  assert.ok(finalMobileLayer > desktopHero, 'final mobile layer follows desktop service rules');

  const finalMobileCss = css.slice(finalMobileLayer);
  assert.match(finalMobileCss, /#service \.imd-hero\{[^}]*grid-template-columns:1fr/s);
  assert.match(finalMobileCss, /#service \.imd-process-grid\{[^}]*grid-template-columns:1fr/s);
  assert.match(finalMobileCss, /#service \.imd-cta-split \.imd-button\{[^}]*min-height:(?:44|48|52)px/s);
  assert.doesNotMatch(css, /#service\{[^}]*max-height:(?!none\s*;)/s);
});
