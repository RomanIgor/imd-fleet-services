const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');

const index = readFileSync('index.html', 'utf8');
const css = readFileSync('style.css', 'utf8');
const homeCss = readFileSync('home-final.css', 'utf8');
const js = readFileSync('main.js', 'utf8');

test('homepage follows the new premium fleet-services visual direction', () => {
  assert.match(index, /Einfach\.\s*Digital\.\s*Zuverl(?:ae|ä)ssig\./);
  assert.match(index, /Wir kaufen Ihre Dienst- und Firmenfahrzeuge/);
  assert.match(index, /class="[^"]*ops-hero/);
  assert.match(index, /class="[^"]*ops-trust-strip/);
  assert.match(index, /class="[^"]*ops-step-card/);
  assert.doesNotMatch(index, /fonts\.googleapis\.com/);
  assert.doesNotMatch(index, /Garantierter Mindestpreis durch Wertgutachten/);
  assert.doesNotMatch(index, /🏆|ðŸ†/);
});

test('homepage includes real PWA proof and non-autoplay demo affordance', () => {
  assert.match(index, /class="[^"]*pwa-showcase/);
  assert.match(index, /Digitales Schadenmanagement/);
  assert.match(index, /schaden-mobile\.png/);
  assert.match(index, /upload-guides\.png/);
  assert.match(index, /id="pwa-videoModal"/);
  assert.match(index, /openPwaVideo\(\)/);
  assert.doesNotMatch(index, /<video[^>]+autoplay/i);
});

test('existing lead form IDs required by submitForm are preserved', () => {
  [
    'fFirma',
    'fName',
    'fEmail',
    'fTel',
    'fMarke',
    'fModell',
    'fBaujahr',
    'fKm',
    'fHinweise',
    'fC1',
    'fC2',
    'fp3',
    'fOk',
    'formBar',
  ].forEach((id) => assert.match(index, new RegExp(`id="${id}"`), `missing #${id}`));
});

test('legacy homepage scripts safely no-op when removed sections are absent', () => {
  assert.match(js, /function calcUpdate\(\)\{\s*const cAnzahl=document\.getElementById\('cAnzahl'\);\s*if\(!cAnzahl\)return;/);
  assert.match(js, /if\(!SLIDES\.length\)return;/);
  assert.match(js, /function openPwaVideo\(\)/);
  assert.match(js, /function closePwaVideo\(\)/);
});

test('operational homepage CSS is scoped and uses local font stack', () => {
  assert.match(index, /home-final\.css\?v=20260527f/);
  assert.match(css, /body\.ops-home/);
  assert.match(css, /--ops-font:/);
  assert.match(css, /\.ops-hero/);
  assert.match(css, /background-image:.*image\.jpg/s);
  assert.match(css, /\.ops-trust-strip/);
  assert.match(css, /\.ops-step-card/);
  assert.match(css, /\.pwa-showcase/);
  assert.match(css, /\.pwa-video-modal/);
  assert.match(homeCss, /body\.premium-home/);
  assert.match(homeCss, /--page-max: min\(1760px/);
  assert.match(homeCss, /@media \(min-width: 1600px\)/);
  assert.match(homeCss, /@media \(max-width: 760px\)/);
});
