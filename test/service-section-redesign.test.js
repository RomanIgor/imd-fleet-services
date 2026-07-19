const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');

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
  assert.match(css, /#service \.imd-process-panel\{[^}]*background:var\(--service-highlight\)/s);
  assert.match(css, /#service \.imd-process-grid article\{[^}]*background:transparent[^}]*border:0/s);
  assert.match(css, /#service \.imd-process-line-icon\{[^}]*background:var\(--service-navy\)/s);
});

test('service normal-size supporting copy uses the AA body color', () => {
  assert.match(css, /#service \.imd-note\{[^}]*font-size:12px[^}]*color:var\(--service-body\)/s);
  assert.match(css, /#service \.imd-process-number\{[^}]*font-size:12px[^}]*color:var\(--service-body\)/s);
});

test('service benefits avoid an administrative boxed grid', () => {
  assert.match(css, /#service \.imd-why-compact\{[^}]*background:var\(--service-highlight\)/s);
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

  const finalMobileCss = finalMediaBlock('@media(max-width:768px){');
  assert.match(finalMobileCss, /#service\{[^}]*padding:52px 0 64px[^}]*background-attachment:scroll/s);
  assert.match(finalMobileCss, /#service \.imd-page\{[^}]*width:calc\(100% - 32px\)[^}]*gap:22px/s);
  assert.match(finalMobileCss, /#service \.imd-hero\{[^}]*grid-template-columns:1fr/s);
  assert.match(finalMobileCss, /#service \.imd-cost-card\{[^}]*grid-column:1/s);
  assert.match(finalMobileCss, /#service \.imd-process-grid\{[^}]*grid-template-columns:1fr/s);
  assert.match(finalMobileCss, /#service \.imd-process-grid article\{[^}]*height:auto[^}]*min-height:92px/s);
  assert.match(finalMobileCss, /#service \.imd-bottom-panel\{[^}]*grid-template-columns:1fr/s);
  assert.match(finalMobileCss, /#service \.imd-why-items\{[^}]*grid-template-columns:1fr/s);
  assert.match(finalMobileCss, /#service \.imd-why-compact\{[^}]*padding:26px 22px[^}]*border-radius:16px/s);
  assert.match(finalMobileCss, /#service \.imd-why-items article,#service \.imd-why-items article:first-child,#service \.imd-why-items article:nth-child\(odd\)\{[^}]*min-height:100px[^}]*background:transparent[^}]*border:0/s);
  assert.match(finalMobileCss, /#service \.imd-cta-split \.imd-button\{[^}]*min-height:52px/s);
  assert.doesNotMatch(css, /#service\{[^}]*max-height:(?!none\s*;)/s);
});

test('service tablet layout keeps the message and cost panel in a deliberate two-column composition', () => {
  const desktopHero = css.indexOf('#service .imd-hero{min-height:430px');
  const finalTabletLayer = css.lastIndexOf('@media(max-width:1120px){');

  assert.ok(finalTabletLayer > desktopHero, 'final tablet layer follows desktop service rules');

  const finalTabletCss = finalMediaBlock('@media(max-width:1120px){');
  assert.match(finalTabletCss, /#service \.imd-page\{[^}]*width:min\(calc\(100% - 48px\),980px\)/s);
  assert.match(finalTabletCss, /#service \.imd-hero\{[^}]*grid-template-columns:minmax\(360px,1fr\) minmax\(300px,\.75fr\)/s);
  assert.match(finalTabletCss, /#service \.imd-cost-card\{[^}]*grid-column:2[^}]*max-width:none/s);
  assert.match(finalTabletCss, /#service \.imd-process-panel\{[^}]*grid-template-columns:1fr[^}]*background:var\(--service-highlight\)/s);
  assert.match(finalTabletCss, /#service \.imd-process-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s);
  assert.match(finalTabletCss, /#service \.imd-process-grid article:nth-child\(odd\)\{[^}]*border-right:1px solid rgba\(154,156,153,\.38\)/s);
  assert.match(finalTabletCss, /#service \.imd-process-grid article:not\(:last-child\)::after\{display:none\}/s);
  assert.match(finalTabletCss, /#service \.imd-process-grid h4,#service \.imd-process-grid p\{[^}]*overflow-wrap:anywhere/s);
  assert.match(finalTabletCss, /#service \.imd-bottom-panel\{[^}]*grid-template-columns:1fr minmax\(330px,\.7fr\)/s);
  assert.match(finalTabletCss, /#service \.imd-why-compact\{[^}]*background:var\(--service-highlight\)/s);
  assert.match(finalTabletCss, /#service \.imd-button:focus-visible\{[^}]*outline:2px solid var\(--service-blue\)[^}]*outline-offset:4px/s);
});

test('service motion is disabled for reduced-motion users', () => {
  const reducedMotionCss = finalMediaBlock('@media(prefers-reduced-motion:reduce){');
  assert.match(reducedMotionCss, /#service \.imd-process-grid article,#service \.imd-button\{[^}]*animation:none!important[^}]*transition:none!important/s);
});
