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

test('service redesign uses the binding IMD concrete palette', () => {
  assert.match(css, /#service\{--service-concrete:#CAC9C4;--service-medium:#B3B4B0;--service-highlight:#E5E4DF;--service-card:#D6D6D2;--service-navy:#202A3B;--service-graphite:#1C2228;--service-body:#4C5257;--service-muted:#777A78;--service-border:#9A9C99;--service-soft-border:#BCBDB9;--service-blue:#36A2C5;--service-blue-hover:#278FB4\}/);
  assert.match(html, /style\.css\?v=service-logo-safe-13/);
});

test('service opening area has a navy primary panel and restrained card surface', () => {
  assert.match(css, /@media\(min-width:1101px\)\{[\s\S]*#service \.imd-hero\{[^}]*grid-template-columns:minmax\(440px,560px\) 1fr minmax\(330px,390px\)/s);
  assert.match(css, /#service \.imd-hero-card\{[^}]*background:var\(--service-navy\)[^}]*color:var\(--service-highlight\)/s);
  assert.match(css, /#service \.imd-cost-card\{[^}]*background:var\(--service-card\)/s);
  assert.match(css, /#service \.imd-h1\{[^}]*font-size:clamp\(36px,[^,]+,42px\)/s);
  assert.match(css, /#service \.imd-subline\{[^}]*font-size:16px/s);
});

test('service process is one coherent editorial band', () => {
  assert.match(css, /#service \.imd-process-panel\{[^}]*background:var\(--service-highlight\)/s);
  assert.match(css, /#service \.imd-process-grid article\{[^}]*background:transparent[^}]*border:0/s);
  assert.match(css, /#service \.imd-process-line-icon\{[^}]*background:var\(--service-navy\)/s);
});

test('service process emphasis overrides the global white rule with AA navy', () => {
  assert.match(html, /<p class="imd-strong">Ein Vorgang\. Ein Ansprechpartner\.<\/p>/);

  const desktopCss = finalMediaBlock('@media(min-width:1101px){');
  const tabletCss = finalMediaBlock('@media(max-width:1120px){');
  const emphasisRule = /#service \.imd-process-panel \.imd-intro-text \.imd-strong\{color:var\(--service-navy\)!important\}/;

  assert.match(desktopCss, emphasisRule);
  assert.match(tabletCss, emphasisRule);
});

test('service normal-size supporting copy uses the AA body color', () => {
  assert.match(css, /#service \.imd-note\{[^}]*font-size:12px[^}]*color:var\(--service-body\)/s);
  assert.match(css, /#service \.imd-process-number\{[^}]*font-size:12px[^}]*color:var\(--service-body\)/s);
});

test('service typography keeps body copy at 15px and metadata at 12px', () => {
  const desktopCss = finalMediaBlock('@media(min-width:1101px){');
  const tabletCss = finalMediaBlock('@media(max-width:1120px){');
  const mobileCss = finalMediaBlock('@media(max-width:768px){');

  for (const responsiveCss of [desktopCss, tabletCss]) {
    assert.match(responsiveCss, /#service \.imd-tags span\{[^}]*font-size:12px/s);
    assert.match(responsiveCss, /#service \.imd-cost-list li\{[^}]*font-size:15px/s);
    assert.match(responsiveCss, /#service \.imd-process-panel \.imd-intro-text p\{[^}]*font-size:15px/s);
    assert.match(responsiveCss, /#service \.imd-process-number\{[^}]*font-size:12px/s);
    assert.match(responsiveCss, /#service \.imd-process-grid p\{[^}]*font-size:15px/s);
    assert.match(responsiveCss, /#service \.imd-why-items p\{[^}]*font-size:15px/s);
    assert.match(responsiveCss, /#service \.imd-cta-split li\{[^}]*font-size:15px/s);
    assert.match(responsiveCss, /#service \.imd-cta-split small\{[^}]*font-size:12px/s);
  }

  assert.match(mobileCss, /#service \.imd-tags span\{[^}]*font-size:12px/s);
  assert.match(mobileCss, /#service \.imd-process-grid p\{[^}]*font-size:15px/s);
});

test('service desktop composition uses the measured vertical target without shrinking copy', () => {
  const desktopCss = finalMediaBlock('@media(min-width:1101px){');

  assert.match(desktopCss, /#service\{(?=[^}]*min-height:calc\(100svh - 72px\))(?=[^}]*padding:14px 0)[^}]*\}/s);
  assert.match(desktopCss, /#service \.imd-page\{[^}]*gap:16px/s);
  assert.match(desktopCss, /#service \.imd-hero\{[^}]*min-height:0/s);
  assert.match(desktopCss, /#service \.imd-process-panel\{[^}]*min-height:0/s);
  assert.match(desktopCss, /#service \.imd-process-grid p\{[^}]*font-size:15px/s);
});

test('service desktop keeps the showroom photograph dark and dimensional', () => {
  const desktopCss = finalMediaBlock('@media(min-width:1101px){');
  assert.match(desktopCss, /#service\{[^}]*background-image:linear-gradient\(90deg,rgba\(14,16,20,\.84\) 0%,rgba\(14,16,20,\.20\) 49%,rgba\(14,16,20,\.82\) 100%\),linear-gradient\(to bottom,rgba\(14,16,20,\.06\),rgba\(14,16,20,\.30\) 58%,rgba\(14,16,20,\.68\) 100%\),radial-gradient\(circle at 52% 20%,rgba\(255,255,255,\.13\),rgba\(255,255,255,0\) 27%\),url\('assets\/showroom-background\.png'\)/s);
  assert.doesNotMatch(desktopCss, /#service\{[^}]*background-image:linear-gradient\(90deg,rgba\(28,34,40,\.08\),transparent 28%,transparent 72%,rgba\(28,34,40,\.10\)\)/s);
});

test('service desktop compaction controls composed content rather than relying on section height', () => {
  const desktopCss = finalMediaBlock('@media(min-width:1101px){');

  assert.match(desktopCss, /#service \.imd-h1\{(?=[^}]*font-size:clamp\(36px,2\.8vw,42px\))(?=[^}]*margin:0 0 16px)[^}]*\}/s);
  assert.match(desktopCss, /#service \.imd-process-panel\{(?=[^}]*grid-template-columns:minmax\(340px,380px\) 1fr)(?=[^}]*gap:24px)[^}]*\}/s);
  assert.match(desktopCss, /#service \.imd-process-panel \.imd-intro-text\{[^}]*padding:0 20px 0 0/s);
  assert.match(desktopCss, /#service \.imd-cta-split\{[^}]*padding:12px 24px/s);
  assert.match(desktopCss, /#service \.imd-cta-split h3\{(?=[^}]*margin:0 0 8px)(?=[^}]*font-size:22px)(?=[^}]*line-height:1\.15)[^}]*\}/s);
});

test('service anchor offset and compact CTA rhythm apply only at the effective desktop range', () => {
  const desktopCss = finalMediaBlock('@media(min-width:1101px){');
  const effectiveDesktopCss = finalMediaBlock('@media(min-width:1120px){');

  assert.match(effectiveDesktopCss, /#service\{[^}]*scroll-margin-top:72px/s);
  assert.match(effectiveDesktopCss, /#service \.imd-cta-split p\{(?=[^}]*margin:0 0 8px)(?=[^}]*line-height:1\.45)[^}]*\}/s);
  assert.match(effectiveDesktopCss, /#service \.imd-cta-split ul\{(?=[^}]*margin:0 0 10px)(?=[^}]*gap:4px)[^}]*\}/s);
  assert.match(effectiveDesktopCss, /#service \.imd-cta-split small\{(?=[^}]*margin-top:6px)(?=[^}]*line-height:1\.35)[^}]*\}/s);
  assert.doesNotMatch(desktopCss, /#service \.imd-cta-split p\{[^}]*margin:0 0 8px/s);
  assert.doesNotMatch(desktopCss, /#service \.imd-cta-split ul\{[^}]*margin:0 0 10px/s);
  assert.doesNotMatch(desktopCss, /#service \.imd-cta-split small\{[^}]*margin-top:6px/s);
});

test('service desktop opening preserves a central logo-safe area', () => {
  const logoSafeCss = finalMediaBlock('@media(min-width:1260px){');
  assert.match(logoSafeCss, /#service \.imd-hero\{(?=[^}]*grid-template-columns:420px minmax\(300px,1fr\) 300px)(?=[^}]*gap:32px)[^}]*\}/s);
  assert.match(logoSafeCss, /#service \.imd-hero-card\{(?=[^}]*max-width:420px)(?=[^}]*padding:18px 24px)[^}]*\}/s);
  assert.match(logoSafeCss, /#service \.imd-tags\{(?=[^}]*display:grid)(?=[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\))[^}]*\}/s);
  assert.match(logoSafeCss, /#service \.imd-tags span\{[^}]*padding:0 4px/s);
  assert.match(logoSafeCss, /#service \.imd-cost-card\{(?=[^}]*max-width:300px)(?=[^}]*justify-self:end)[^}]*\}/s);
  assert.match(logoSafeCss, /#service \.imd-h1\{[^}]*font-size:clamp\(32px,2\.1vw,36px\)/s);
  assert.match(html, />Terminplanung<\/span>/);
  assert.match(html, />Übergabe<\/span>/);
  assert.match(html, />Interne Abläufe<\/span>/);
});

test('service desktop supporting bands frame rather than cover the photograph', () => {
  const logoSafeCss = finalMediaBlock('@media(min-width:1260px){');
  assert.match(logoSafeCss, /#service \.imd-process-panel\{(?=[^}]*width:min\(1180px,100%\))(?=[^}]*justify-self:center)[^}]*\}/s);
  assert.match(logoSafeCss, /#service \.imd-bottom-panel\{(?=[^}]*width:min\(1180px,100%\))(?=[^}]*justify-self:center)[^}]*\}/s);
});

test('service uses a unified desktop grid with content-driven cards', () => {
  const logoSafeCss = finalMediaBlock('@media(min-width:1260px){');
  assert.match(logoSafeCss, /#service \.imd-hero\{(?=[^}]*width:min\(1180px,100%\))(?=[^}]*justify-self:center)(?=[^}]*align-items:start)[^}]*\}/s);
  assert.match(logoSafeCss, /#service \.imd-process-panel\{[^}]*width:min\(1180px,100%\)/s);
  assert.match(logoSafeCss, /#service \.imd-bottom-panel\{(?=[^}]*width:min\(1180px,100%\))(?=[^}]*align-items:stretch)[^}]*\}/s);
  assert.match(logoSafeCss, /#service \.imd-process-panel \.imd-process-grid article\{[^}]*min-height:0/s);
  assert.match(logoSafeCss, /#service \.imd-why-items article\{[^}]*min-height:0/s);
  assert.match(logoSafeCss, /#service \.imd-benefit-card,#service \.imd-cta-split\{(?=[^}]*min-height:205px)(?=[^}]*align-self:stretch)[^}]*\}/s);
});

test('service wide desktop protects the showroom logo with compact rails', () => {
  const wideDesktopCss = finalMediaBlock('@media(min-width:1440px){');
  assert.match(wideDesktopCss, /#service\{(?=[^}]*background-size:cover,cover,cover,min\(100vw,1920px\) auto)(?=[^}]*background-position:center center,center center,center center,center calc\(50% - 170px\))[^}]*\}/s);
  assert.match(wideDesktopCss, /#service \.imd-hero\{(?=[^}]*width:min\(1400px,100%\))(?=[^}]*grid-template-columns:360px minmax\(600px,1fr\) 270px)[^}]*\}/s);
  assert.match(wideDesktopCss, /#service \.imd-hero-card\{[^}]*max-width:360px/s);
  assert.match(wideDesktopCss, /#service \.imd-subline\{(?=[^}]*font-size:13px)(?=[^}]*line-height:1\.45)(?=[^}]*margin-bottom:12px)[^}]*\}/s);
  assert.match(wideDesktopCss, /#service \.imd-cost-card\{[^}]*max-width:270px/s);
  assert.match(wideDesktopCss, /#service \.imd-process-panel\{(?=[^}]*width:min\(1180px,100%\))(?=[^}]*grid-template-columns:280px 1fr)(?=[^}]*margin-top:40px)(?=[^}]*height:clamp\(112px,7\.5vw,145px\))(?=[^}]*padding:6px 14px)(?=[^}]*overflow:visible)[^}]*\}/s);
  assert.match(wideDesktopCss, /#service \.imd-process-panel \.imd-intro-text h3\{(?=[^}]*margin-bottom:4px)(?=[^}]*font-size:15px)(?=[^}]*line-height:1\.2)[^}]*\}/s);
  assert.match(wideDesktopCss, /#service \.imd-process-panel \.imd-intro-text p\{(?=[^}]*margin-bottom:2px)(?=[^}]*font-size:12\.5px)(?=[^}]*line-height:1\.3)[^}]*\}/s);
  assert.doesNotMatch(wideDesktopCss, /max-height:175px/);
  assert.match(html, /Online melden\. Wir übernehmen Abholung, Gutachten und Auszahlung\./);
  assert.match(html, /Ein Vorgang\. Ein Ansprechpartner\./);
});

test('service wide desktop uses the reference support-card composition without new claims', () => {
  const wideDesktopCss = finalMediaBlock('@media(min-width:1440px){');
  const supportTier = html.match(/<section class="imd-bottom-panel imd-glass">([\s\S]*?)<\/section>/)?.[1];

  assert.ok(supportTier, 'service support tier is present');
  assert.match(supportTier, /class="imd-benefit-card imd-benefit-card--primary"/);
  assert.match(supportTier, /class="imd-benefit-card imd-benefit-card--secondary"/);
  assert.match(wideDesktopCss, /grid-template-columns:360px minmax\(600px,1fr\) 270px/);
  assert.match(wideDesktopCss, /#service \.imd-bottom-panel\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/s);
  assert.doesNotMatch(wideDesktopCss, /#service \.imd-bottom-panel\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\) 300px/s);

  const primaryIndex = supportTier.indexOf('class="imd-benefit-card imd-benefit-card--primary"');
  const ctaIndex = supportTier.indexOf('class="imd-cta-split"');
  const secondaryIndex = supportTier.indexOf('class="imd-benefit-card imd-benefit-card--secondary"');
  assert.ok(primaryIndex >= 0 && primaryIndex < ctaIndex && ctaIndex < secondaryIndex, 'CTA remains between benefit cards');

  const supportTierText = supportTier.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  assert.equal(
    supportTierText,
    'Warum Unternehmen IMD wählen Sicher &amp; zuverlässig Professionelle und diskrete Abwicklung. Zeit- &amp; ressourcensparend Der komplette Prozess aus einer Hand. Bereit für einen einfachen Fahrzeugverkauf? Starten Sie Ihren Verkaufsprozess. Schnell &amp; unkompliziert Kostenlos &amp; ohne Aufwand Faire Preise ohne Nachverhandlung Jetzt unverbindlich anfragen → Wir melden uns innerhalb von 24 Stunden bei Ihnen. Warum Unternehmen IMD wählen Bestmöglicher Preis Transparente Wertermittlung. Persönlicher Partner Ein Ansprechpartner für den Fuhrpark.',
  );
});

test('service logo-safe geometry begins only at the large desktop boundary', () => {
  const compactDesktopCss = finalMediaBlock('@media(min-width:1120px){');
  const logoSafeCss = finalMediaBlock('@media(min-width:1260px){');

  assert.doesNotMatch(compactDesktopCss, /#service \.imd-hero\{[^}]*grid-template-columns:470px minmax\(300px,1fr\) 330px/s);
  assert.doesNotMatch(compactDesktopCss, /#service \.imd-hero-card\{[^}]*max-width:470px/s);
  assert.doesNotMatch(compactDesktopCss, /#service \.imd-cost-card\{[^}]*max-width:330px/s);
  assert.doesNotMatch(compactDesktopCss, /#service \.imd-h1\{[^}]*font-size:clamp\(34px,2\.5vw,40px\)/s);
  assert.doesNotMatch(compactDesktopCss, /#service \.imd-cost-h\{[^}]*font-size:22px/s);
  assert.doesNotMatch(compactDesktopCss, /#service \.imd-process-panel\{[^}]*width:min\(1240px,100%\)/s);
  assert.doesNotMatch(compactDesktopCss, /#service \.imd-bottom-panel\{[^}]*width:min\(1240px,100%\)/s);
  assert.doesNotMatch(compactDesktopCss, /#service \.imd-benefit-card\{[^}]*padding:16px 20px/s);
  assert.match(logoSafeCss, /#service \.imd-process-panel\{[^}]*width:min\(1180px,100%\)/s);
  assert.match(logoSafeCss, /#service \.imd-bottom-panel\{[^}]*width:min\(1180px,100%\)/s);
});

test('service logo-safe bands stay fluid without weakening desktop process text', () => {
  const desktopCss = finalMediaBlock('@media(min-width:1101px){');
  const logoSafeCss = finalMediaBlock('@media(min-width:1260px){');

  assert.match(logoSafeCss, /#service \.imd-process-panel\{[^}]*width:min\(1180px,100%\)/s);
  assert.match(logoSafeCss, /#service \.imd-bottom-panel\{[^}]*width:min\(1180px,100%\)/s);
  assert.doesNotMatch(logoSafeCss, /calc\(100% - 240px\)/);
  assert.match(desktopCss, /#service \.imd-process-grid p\{[^}]*font-size:15px/s);
  assert.match(desktopCss, /#service \.imd-process-grid h4\{[^}]*font-size:14px/s);
  assert.doesNotMatch(desktopCss, /#service \.imd-process-grid h4,#service \.imd-process-grid p\{[^}]*overflow-wrap:/s);
});

test('service process adapts between mid and wide desktop ranges', () => {
  const midDesktopCss = finalMediaBlock('@media(min-width:1120px) and (max-width:1440px){');
  const wideDesktopCss = finalMediaBlock('@media(min-width:1440px){');

  assert.match(midDesktopCss, /#service \.imd-process-panel\{(?=[^}]*grid-template-columns:minmax\(230px,250px\) 1fr)(?=[^}]*gap:16px)[^}]*\}/s);
  assert.match(midDesktopCss, /#service \.imd-process-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s);
  assert.match(midDesktopCss, /#service \.imd-process-grid article\{(?=[^}]*min-height:108px)(?=[^}]*grid-template-columns:44px minmax\(0,1fr\))(?=[^}]*column-gap:10px)[^}]*\}/s);
  assert.match(midDesktopCss, /#service \.imd-process-line-icon\{[^}]*width:44px[^}]*height:44px/s);
  assert.match(midDesktopCss, /#service \.imd-process-grid article:nth-child\(odd\)\{[^}]*border-right:1px solid rgba\(154,156,153,\.38\)/s);
  assert.match(midDesktopCss, /#service \.imd-process-grid article:nth-child\(-n\+2\)\{[^}]*border-bottom:1px solid rgba\(154,156,153,\.38\)/s);
  assert.match(midDesktopCss, /#service \.imd-process-grid article:not\(:last-child\)::after\{(?=[^}]*content:none)(?=[^}]*display:none)[^}]*\}/s);
  assert.match(wideDesktopCss, /#service \.imd-process-panel\{(?=[^}]*grid-template-columns:280px 1fr)(?=[^}]*gap:8px)[^}]*\}/s);
  assert.match(wideDesktopCss, /#service \.imd-process-grid\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/s);
  assert.match(wideDesktopCss, /#service \.imd-process-grid article\{(?=[^}]*min-height:0)(?=[^}]*padding:4px 6px)(?=[^}]*grid-template-columns:36px minmax\(0,1fr\))(?=[^}]*column-gap:8px)[^}]*\}/s);
  assert.match(wideDesktopCss, /#service \.imd-process-line-icon\{[^}]*width:36px[^}]*height:36px/s);
  assert.match(wideDesktopCss, /#service \.imd-process-grid h4,#service \.imd-process-grid p\{(?=[^}]*min-width:0)(?=[^}]*overflow-wrap:break-word)[^}]*\}/s);
  assert.doesNotMatch(wideDesktopCss, /overflow-wrap:anywhere/);
  assert.match(wideDesktopCss, /#service \.imd-process-grid article:not\(:last-child\)\{[^}]*border-right:1px solid rgba\(154,156,153,\.38\)/s);
  assert.match(wideDesktopCss, /#service \.imd-process-grid article:not\(:last-child\)::after\{(?=[^}]*content:none)(?=[^}]*display:none)[^}]*\}/s);
});

test('service process uses divider-only connectors with no arrows in the final layer', () => {
  const desktopCss = finalMediaBlock('@media(min-width:1101px){');
  const wideDesktopCss = finalMediaBlock('@media(min-width:1440px){');
  const noArrowRule = /#service \.imd-process-grid article:not\(:last-child\)::after\{(?=[^}]*content:none)(?=[^}]*display:none)[^}]*\}/s;

  assert.match(desktopCss, noArrowRule);
  assert.match(wideDesktopCss, noArrowRule);
  assert.doesNotMatch(finalServiceCss, /#service \.imd-process-grid article:not\(:last-child\)::after\{[^}]*content:"/s);
});

test('service benefit icons remain in grid flow and cannot cover text', () => {
  const desktopCss = finalMediaBlock('@media(min-width:1101px){');

  assert.match(desktopCss, /#service \.imd-why-items article\{(?=[^}]*display:grid)(?=[^}]*grid-template-columns:42px minmax\(0,1fr\))[^}]*\}/s);
  assert.match(desktopCss, /#service \.imd-why-icon\{[^}]*position:static/s);
  assert.doesNotMatch(desktopCss, /#service \.imd-why-icon\{[^}]*position:absolute/s);
});

test('service benefits avoid an administrative boxed grid', () => {
  assert.match(finalServiceCss, /#service \.imd-benefit-card--primary\{[^}]*background:var\(--service-highlight\)/s);
  assert.match(css, /#service \.imd-why-items article\{[^}]*background:transparent[^}]*border:0/s);
  assert.match(css, /#service \.imd-why-items article:nth-child\(-n\+2\)::after/);
  assert.match(css, /#service \.imd-why-items p\{[^}]*font-size:15px/s);
  assert.doesNotMatch(finalServiceCss, /\.imd-why-compact/);
});

test('service CTA has a gapless light surface and keyboard focus', () => {
  const desktopCss = finalMediaBlock('@media(min-width:1101px){');

  assert.match(desktopCss, /#service \.imd-cta-split\{(?=[^}]*background:var\(--service-highlight\))(?=[^}]*color:var\(--service-graphite\))[^}]*\}/s);
  assert.match(desktopCss, /#service \.imd-cta-split p,#service \.imd-cta-split li,#service \.imd-cta-split small\{color:var\(--service-body\)\}/s);
  assert.match(desktopCss, /#service \.imd-button\{(?=[^}]*background:var\(--service-navy\))(?=[^}]*color:var\(--service-highlight\))[^}]*\}/s);
  assert.doesNotMatch(finalServiceCss, /#service \.imd-cta-split\{[^}]*background:var\(--service-navy\)/s);
  assert.match(finalServiceCss, /@media\(min-width:1120px\) and \(max-width:1440px\)\{/);
  assert.match(css, /#service \.imd-button\{[^}]*min-height:48px/s);
  assert.match(css, /#service \.imd-button:hover\{background:var\(--service-navy\);border-color:var\(--service-navy\);color:var\(--service-highlight\)\}/);
  assert.match(css, /#service \.imd-button:focus-visible\{[^}]*outline:2px solid var\(--service-blue\)/s);
});

test('service secondary benefit card keeps navy contrast independently of CTA refinements', () => {
  assert.match(finalServiceCss, /#service \.imd-benefit-card--secondary\{(?=[^}]*background:var\(--service-navy\))(?=[^}]*color:var\(--service-highlight\))[^}]*\}/s);
  assert.match(finalServiceCss, /#service \.imd-benefit-card--secondary h3,#service \.imd-benefit-card--secondary \.imd-why-items h4\{color:var\(--service-highlight\)\}/s);
  assert.match(finalServiceCss, /#service \.imd-benefit-card--secondary \.imd-why-icon img\{[^}]*filter:brightness\(0\) invert\(1\)/s);
});

test('service mobile layout is content-driven and deliberately stacked', () => {
  const desktopServiceLayer = css.lastIndexOf('@media(min-width:1101px){');
  const finalMobileLayer = css.lastIndexOf('@media(max-width:768px){');

  assert.ok(desktopServiceLayer >= 0, 'desktop service layer is present');
  assert.ok(finalMobileLayer > desktopServiceLayer, 'final mobile layer follows desktop service rules');

  const finalMobileCss = finalMediaBlock('@media(max-width:768px){');
  assert.match(finalMobileCss, /#service\{[^}]*padding:52px 0 64px[^}]*background-attachment:scroll/s);
  assert.match(finalMobileCss, /#service \.imd-page\{[^}]*width:calc\(100% - 32px\)[^}]*gap:22px/s);
  assert.match(finalMobileCss, /#service \.imd-hero\{[^}]*grid-template-columns:1fr/s);
  assert.match(finalMobileCss, /#service \.imd-cost-card\{[^}]*grid-column:1/s);
  assert.match(finalMobileCss, /#service \.imd-process-grid\{[^}]*grid-template-columns:1fr/s);
  assert.match(finalMobileCss, /#service \.imd-process-grid article\{[^}]*height:auto[^}]*min-height:92px/s);
  assert.match(finalMobileCss, /#service \.imd-bottom-panel\{[^}]*grid-template-columns:1fr/s);
  assert.match(finalMobileCss, /#service \.imd-why-items\{[^}]*grid-template-columns:1fr/s);
  assert.match(finalMobileCss, /#service \.imd-benefit-card\{[^}]*padding:26px 22px[^}]*border-radius:16px/s);
  assert.match(finalMobileCss, /#service \.imd-why-items article,#service \.imd-why-items article:first-child,#service \.imd-why-items article:nth-child\(odd\)\{[^}]*min-height:100px[^}]*background:transparent[^}]*border:0/s);
  assert.match(finalMobileCss, /#service \.imd-why-items article:not\(:last-child\)::after\{[^}]*content:""[^}]*bottom:0/s);
  assert.match(finalMobileCss, /#service \.imd-cta-split \.imd-button\{[^}]*min-height:52px/s);
  assert.match(css, /\/\* ===== Fahrzeugverkauf dedicated mobile layout ===== \*\/\s*@media\(max-width:767px\)/);
  assert.doesNotMatch(css, /#service\{[^}]*max-height:(?!none\s*;)/s);
});

test('service tablet layout keeps the message and cost panel in a deliberate two-column composition', () => {
  const desktopServiceLayer = css.lastIndexOf('@media(min-width:1101px){');
  const finalTabletLayer = css.lastIndexOf('@media(max-width:1120px){');

  assert.ok(desktopServiceLayer >= 0, 'desktop service layer is present');
  assert.ok(finalTabletLayer > desktopServiceLayer, 'final tablet layer follows desktop service rules');

  const finalTabletCss = finalMediaBlock('@media(max-width:1120px){');
  assert.match(finalTabletCss, /#service \.imd-page\{[^}]*width:min\(calc\(100% - 48px\),980px\)/s);
  assert.match(finalTabletCss, /#service \.imd-hero\{[^}]*grid-template-columns:minmax\(360px,1fr\) minmax\(300px,\.75fr\)/s);
  assert.match(finalTabletCss, /#service \.imd-cost-card\{[^}]*grid-column:2[^}]*max-width:none/s);
  assert.match(finalTabletCss, /#service \.imd-process-panel\{[^}]*grid-template-columns:1fr[^}]*background:var\(--service-highlight\)/s);
  assert.match(finalTabletCss, /#service \.imd-process-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s);
  assert.match(finalTabletCss, /#service \.imd-process-grid article:nth-child\(odd\)\{[^}]*border-right:1px solid rgba\(154,156,153,\.38\)/s);
  assert.match(finalTabletCss, /#service \.imd-process-grid article:not\(:last-child\)::after\{display:none\}/s);
  assert.match(finalTabletCss, /#service \.imd-process-grid h4,#service \.imd-process-grid p\{[^}]*overflow-wrap:anywhere/s);
  assert.match(finalTabletCss, /#service \.imd-bottom-panel\{[^}]*grid-template-columns:1fr[^}]*gap:24px/s);
  assert.match(finalTabletCss, /#service \.imd-benefit-card--primary\{[^}]*background:var\(--service-highlight\)/s);
  assert.match(finalTabletCss, /#service \.imd-why-items article:nth-child\(-n\+2\)::after\{[^}]*content:""[^}]*bottom:0/s);
  assert.doesNotMatch(finalTabletCss, /#service \.imd-why-items article:not\(:last-child\)::after/);
  assert.match(finalTabletCss, /#service \.imd-why-items h4,#service \.imd-why-items p\{[^}]*overflow-wrap:anywhere/s);
  assert.match(finalTabletCss, /#service \.imd-button:focus-visible\{[^}]*outline:2px solid var\(--service-blue\)[^}]*outline-offset:4px/s);
});

test('service motion is disabled for reduced-motion users', () => {
  const reducedMotionCss = finalMediaBlock('@media(prefers-reduced-motion:reduce){');
  assert.match(reducedMotionCss, /#service \.imd-process-grid article,#service \.imd-button\{[^}]*animation:none!important[^}]*transition:none!important/s);
});
