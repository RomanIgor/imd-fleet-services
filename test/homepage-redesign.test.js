const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');

const index = readFileSync('index.html', 'utf8');
const css = readFileSync('style.css', 'utf8');
const js = readFileSync('main.js', 'utf8');

test('homepage exposes the complete current vehicle-sale journey', () => {
  assert.match(index, /class="hero" id="top"/);
  assert.match(index, /<section id="service">/);
  assert.match(index, /<section class="section" id="prozess">/);
  assert.match(index, /<section class="section" id="warum">/);
  assert.match(index, /<section class="section sec-light" id="rechner">/);
  assert.match(index, /<section class="section sec-dark" id="anmelden">/);
  assert.match(index, /<section class="section sec-light" id="kontakt">/);
  assert.match(index, /Dienstwagen verkaufen/);
  assert.match(index, /Ohne Aufwand für Ihr Unternehmen/);
});

test('homepage loads the active stylesheet and consent-gates external fonts', () => {
  assert.match(index, /href="style\.css\?v=[^"]+"/);
  assert.match(index, /data-consent-category="external"[^>]+fonts\.googleapis\.com/);
  assert.doesNotMatch(index, /href="home-final\.css/);
});

test('current lead form IDs required by its three-step flow are preserved', () => {
  [
    'fFirma',
    'fName',
    'fEmail',
    'fTel',
    'fMarke',
    'fModell',
    'fJahr',
    'fKm',
    'fHinweise',
    'fC1',
    'fC2',
    'fp1',
    'fp2',
    'fp3',
    'fOk',
    'formBar',
  ].forEach((id) => assert.match(index, new RegExp(`id="${id}"`), `missing #${id}`));

  assert.match(js, /document\.getElementById\('fJahr'\)\.value/);
  assert.match(js, /fd\.append\('baujahr',\s*document\.getElementById\('fJahr'\)\?\.value\|\|''\)/);
  assert.doesNotMatch(js, /getElementById\('fBaujahr'\)/);
});

test('optional homepage modules safely no-op when their markup is absent', () => {
  assert.match(js, /function calcUpdate\(\)\{\s*const cAnzahl=document\.getElementById\('cAnzahl'\);\s*if\(!cAnzahl\)return;/);
  assert.match(js, /function openPwaVideo\(\)[\s\S]*?if \(!modal\) return;/);
  assert.match(js, /function closePwaVideo\(\)[\s\S]*?if \(!modal\) return;/);
});

test('current homepage styles include the concrete service composition and responsive layout', () => {
  assert.match(css, /--service-concrete:\s*#CAC9C4/);
  assert.match(css, /--service-navy:\s*#202A3B/);
  assert.match(css, /url\('assets\/showroom-background\.png'\)/);
  assert.match(css, /#service \.imd-process-panel/);
  assert.match(css, /#service \.imd-bottom-panel/);
  assert.match(css, /@media\(max-width:\s*768px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
