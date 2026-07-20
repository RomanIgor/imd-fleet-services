const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');

test('opening sections share the approved concrete and navy palette', () => {
  assert.match(css, /\.hero,#service,#prozess\{--opening-concrete:#CAC9C4;--opening-highlight:#E5E4DF;--opening-navy:#202A3B;--opening-graphite:#1C2228;--opening-text:#4C5257;--opening-border:#9A9C99;--opening-accent:#36A2C5\}/);
  assert.match(html, /style\.css\?v=service-logo-safe-6/);
});

test('hero keeps its photo while using graphite and concrete surfaces', () => {
  assert.match(css, /\.hero \.hero-copy\{[^}]*var\(--opening-graphite\)/s);
  assert.match(css, /\.hero \.hero-calc\{[^}]*var\(--opening-highlight\)/s);
  assert.match(css, /\.hero \.hc-btn\{[^}]*var\(--opening-navy\)/s);
});

test('service uses professional concrete surfaces and navy details', () => {
  assert.match(css, /#service \.imd-hero-card\{[^}]*var\(--service-navy\)/s);
  assert.match(css, /#service \.imd-cost-card\{[^}]*var\(--service-card\)/s);
  assert.match(css, /#service \.imd-process-line-icon\{[^}]*var\(--service-navy\)/s);
  assert.match(css, /#service \.imd-button\{[^}]*var\(--service-highlight\)/s);
});

test('process uses concrete panels, navy markers, and a blue active state', () => {
  assert.match(css, /#prozess\.section\{[^}]*var\(--opening-concrete\)/s);
  assert.match(css, /#prozess \.home-roadmap\{[^}]*var\(--opening-highlight\)/s);
  assert.match(css, /#prozess \.home-road-step::before\{[^}]*var\(--opening-navy\)/s);
  assert.match(css, /#prozess \.home-road-step\.is-active\{[^}]*var\(--opening-accent\)/s);
});
