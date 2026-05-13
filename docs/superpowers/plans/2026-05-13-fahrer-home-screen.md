# Fahrer Home Screen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructurează `schaden.html` dintr-un singur formular într-o mini-aplicație cu home screen (4 module-carduri), Meine Fälle și Hilfe, conectate printr-un bottom nav funcțional.

**Architecture:** 4 view-uri (`view-home`, `view-form`, `view-faelle`, `view-hilfe`) comutate prin `showView(name)` + CSS `display:none/block`. Toate live în `schaden.html`. Un endpoint nou în `routes/fahrer.js`. Nimic altceva.

**Tech Stack:** Vanilla JS, Express, PostgreSQL, HTML/CSS în fișier unic.

---

## File Map

| Fișier | Ce se schimbă |
|---|---|
| `routes/fahrer.js` | +1 endpoint: `GET /api/fahrer/meine-schaeden` |
| `schaden.html` CSS | +view toggle + greeting card + fall-card + hilfe + bn-logout styles · fix cursor pe active-mod |
| `schaden.html` SVG defs | +`#ic-hilfe` (info-fill) + `#ic-abmelden` (sign-out-fill) |
| `schaden.html` HTML | Wrap conținut în view-uri · greeting card · onclick pe active-mod · view-faelle + view-hilfe · bottom nav nou |
| `schaden.html` JS | `showView()` · `loadFahrerMe()` · `loadMeineFaelle()` · `renderFaq()` cu targetId · `scrollToForm()` simplificat · init update |

---

## Task 1: Backend — GET /api/fahrer/meine-schaeden

**Files:**
- Modify: `routes/fahrer.js` (after line 231, after `GET /api/fahrer/me` route)

- [ ] **Step 1: Adaugă endpoint-ul după `router.get('/api/fahrer/me'...`**

Găsește blocul (line ~218–231):
```javascript
router.get('/api/fahrer/me', requireFahrerAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT f.id, f.vorname, f.nachname, f.email, f.telefon, fp.name AS fuhrpark_name
       FROM fahrer f JOIN fuhrparks fp ON fp.id = f.fuhrpark_id
       WHERE f.id = $1`,
      [req.session.fahrerId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Fahrer nicht gefunden' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

Adaugă imediat după:
```javascript
router.get('/api/fahrer/meine-schaeden', requireFahrerAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT fall_nr, kennzeichen, status, created_at
       FROM schaeden
       WHERE fahrer_id = $1
       ORDER BY created_at DESC`,
      [req.session.fahrerId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Step 2: Verifică sintaxa**

```bash
node -e "require('./routes/fahrer'); console.log('OK');"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add routes/fahrer.js
git commit -m "feat: add GET /api/fahrer/meine-schaeden endpoint"
```

---

## Task 2: CSS + SVG Symbols

**Files:**
- Modify: `schaden.html` (CSS section ends line 681, SVG defs end line 750)

- [ ] **Step 1: Fix cursor pe `.mod-tile.active-mod` (line 596)**

Găsește:
```css
  .mod-tile.active-mod { border-color: var(--imd-blue); background: linear-gradient(160deg, #f0fafd 0%, var(--card) 100%); cursor: default; }
```

Înlocuiește cu:
```css
  .mod-tile.active-mod { border-color: var(--imd-blue); background: linear-gradient(160deg, #f0fafd 0%, var(--card) 100%); cursor: pointer; }
```

- [ ] **Step 2: Adaugă CSS nou înainte de `</style>` (line 681)**

Găsește:
```css
  [data-theme="dark"] .bottom-nav { background: var(--card); border-top-color: var(--border); box-shadow: 0 -4px 16px rgba(0,0,0,0.4); }
</style>
```

Înlocuiește cu:
```css
  [data-theme="dark"] .bottom-nav { background: var(--card); border-top-color: var(--border); box-shadow: 0 -4px 16px rgba(0,0,0,0.4); }

  /* VIEW SYSTEM */
  .app-view { display: none; }
  .app-view.v-active { display: block; }

  /* HOME GREETING */
  .home-greeting {
    background: linear-gradient(135deg, var(--imd-darker) 0%, var(--imd-dark) 60%, var(--imd-mid) 100%);
    border-radius: var(--radius-lg); padding: 20px 20px 18px; margin-bottom: 16px;
    color: white; position: relative; overflow: hidden;
  }
  .home-greeting::after {
    content: ""; position: absolute; top: -60px; right: -60px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(45,159,192,0.35) 0%, transparent 70%);
    border-radius: 50%; pointer-events: none;
  }
  .home-greeting > * { position: relative; z-index: 1; }
  .home-greeting-sub { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.5); font-weight: 700; margin-bottom: 3px; }
  .home-greeting-name { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
  .home-greeting-fleet { font-size: 12px; color: rgba(255,255,255,0.55); margin-top: 2px; }

  /* VIEW HEADER */
  .view-header { margin-bottom: 16px; }
  .view-header-title { font-size: 20px; font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
  .view-header-sub { font-size: 12px; color: var(--text-soft); margin-top: 3px; }

  /* MEINE FÄLLE */
  .fall-list { display: flex; flex-direction: column; gap: 10px; }
  .fall-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; box-shadow: var(--shadow-sm); }
  .fall-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .fall-nr { font-size: 13px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; }
  .fall-meta { display: flex; gap: 12px; font-size: 11px; color: var(--text-mid); }
  .fall-badge-neu  { background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; }
  .fall-badge-in   { background: var(--amber-bg); color: var(--amber); padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; }
  .fall-badge-done { background: var(--green-bg); color: var(--green); padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; }
  .fall-empty { text-align: center; padding: 40px 20px; color: var(--text-soft); font-size: 13px; line-height: 1.6; }

  /* HILFE */
  .hilfe-contact { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow-sm); margin-bottom: 16px; }
  .hilfe-contact-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
  .hilfe-contact-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text-mid); padding: 6px 0; border-bottom: 1px solid var(--border); }
  .hilfe-contact-row:last-child { border-bottom: none; }

  /* NAV ABMELDEN */
  .bn-item.bn-logout { color: var(--red); }
</style>
```

- [ ] **Step 3: Adaugă 2 simboluri SVG înainte de `</defs>` (line 750)**

Găsește:
```html
  </defs>
</svg>
```

Înlocuiește cu:
```html
    <symbol id="ic-hilfe" viewBox="0 0 256 256"><path fill="currentColor" d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-4,48a12,12,0,1,1,12,12A12,12,0,0,1,124,72Zm12,112H120a8,8,0,0,1,0-16h4V128h-4a8,8,0,0,1,0-16h12a8,8,0,0,1,8,8v52h4a8,8,0,0,1,0,16Z"/></symbol>
    <symbol id="ic-abmelden" viewBox="0 0 256 256"><path fill="currentColor" d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,24h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z"/></symbol>
  </defs>
</svg>
```

- [ ] **Step 4: Commit**

```bash
git add schaden.html
git commit -m "feat: add view system CSS, greeting/fall/hilfe styles, SVG symbols for nav"
```

---

## Task 3: HTML — Restructurare în View-uri

**Files:**
- Modify: `schaden.html` (multiple edits în `<main>`)

- [ ] **Step 1: Wrap conținut home în `view-home` + adaugă greeting card**

Găsește (line 813–814):
```html
<main>
  <section class="hero-grid">
```

Înlocuiește cu:
```html
<main>
<div id="view-home" class="app-view v-active">
  <div class="home-greeting">
    <div class="home-greeting-sub">Willkommen zurück</div>
    <div class="home-greeting-name">Guten Tag, <span id="home-fahrer-name">…</span></div>
    <div class="home-greeting-fleet" id="home-fuhrpark-name"></div>
  </div>
  <section class="hero-grid">
```

- [ ] **Step 2: Adaugă onclick pe tile-ul activ Schadenmanagement (line 833)**

Butonul hero deja apelează `scrollToForm()` — nu se schimbă. Tile-ul Schadenmanagement încă nu are onclick — adaugă:

Găsește:
```html
      <div class="mod-tile active-mod">
```

Înlocuiește cu:
```html
      <div class="mod-tile active-mod" onclick="scrollToForm()">
```

- [ ] **Step 3: Închide `view-home`, deschide `view-form` (după line 857)**

Găsește:
```html
  </div>

  <div id="formular" class="form-card" data-form-card style="margin-bottom:20px;">
```

Înlocuiește cu:
```html
  </div>
</div><!-- /view-home -->

<div id="view-form" class="app-view">
  <div id="formular" class="form-card" data-form-card style="margin-bottom:20px;">
```

- [ ] **Step 4: Închide `view-form` + adaugă `view-faelle` și `view-hilfe` (după line 916)**

Găsește:
```html
  </footer>
</main>
```

Înlocuiește cu:
```html
  </footer>
</div><!-- /view-form -->

<div id="view-faelle" class="app-view">
  <div class="view-header">
    <div class="view-header-title">Meine Fälle</div>
    <div class="view-header-sub">Ihre eingereichten Schadensmeldungen</div>
  </div>
  <div id="faelle-list" class="fall-list">
    <div class="fall-empty">Lade …</div>
  </div>
</div><!-- /view-faelle -->

<div id="view-hilfe" class="app-view">
  <div class="view-header">
    <div class="view-header-title">Hilfe &amp; Kontakt</div>
    <div class="view-header-sub">Support &amp; FAQ</div>
  </div>
  <div class="hilfe-contact">
    <div class="hilfe-contact-title">IMD Fleet Services GmbH</div>
    <div class="hilfe-contact-row">
      <svg width="14" height="14" viewBox="0 0 256 256"><use href="#ic-versand"/></svg>
      schaden@imdfleet.de
    </div>
    <div class="hilfe-contact-row">
      <svg width="14" height="14" viewBox="0 0 256 256"><use href="#ic-verlauf"/></svg>
      Montag–Freitag &middot; 8:00–18:00 Uhr
    </div>
  </div>
  <div id="hilfe-faq-content"></div>
</div><!-- /view-hilfe -->

</main>
```

- [ ] **Step 5: Verifică — serverul pornește**

```bash
node -e "
const fs = require('fs');
const h = fs.readFileSync('schaden.html', 'utf8');
console.log('view-home:', h.includes('id=\"view-home\"'));
console.log('view-form:', h.includes('id=\"view-form\"'));
console.log('view-faelle:', h.includes('id=\"view-faelle\"'));
console.log('view-hilfe:', h.includes('id=\"view-hilfe\"'));
"
```

Expected:
```
view-home: true
view-form: true
view-faelle: true
view-hilfe: true
```

- [ ] **Step 6: Commit**

```bash
git add schaden.html
git commit -m "feat: restructure schaden.html into home/form/faelle/hilfe views"
```

---

## Task 4: Bottom Nav

**Files:**
- Modify: `schaden.html` (lines 2184–2202 — nav element)

- [ ] **Step 1: Înlocuiește nav-ul existent**

Găsește (tot blocul nav):
```html
<nav class="bottom-nav">
  <button class="bn-item" onclick="window.scrollTo({top:0,behavior:'smooth'})">
    <svg width="22" height="22" viewBox="0 0 256 256"><use href="#ic-home"/></svg>
    <span class="bn-lbl">Start</span>
  </button>
  <button class="bn-item bn-active">
    <div class="bn-bar"></div>
    <svg width="22" height="22" viewBox="0 0 256 256"><use href="#ic-schaden"/></svg>
    <span class="bn-lbl">Schaden</span>
  </button>
  <button class="bn-item">
    <svg width="22" height="22" viewBox="0 0 256 256"><use href="#ic-fahrzeug"/></svg>
    <span class="bn-lbl">Flotte</span>
  </button>
  <button class="bn-item">
    <svg width="22" height="22" viewBox="0 0 256 256"><use href="#ic-fahrer"/></svg>
    <span class="bn-lbl">Profil</span>
  </button>
</nav>
```

Înlocuiește cu:
```html
<nav class="bottom-nav">
  <button class="bn-item bn-active" data-view="home" onclick="showView('home')">
    <div class="bn-bar"></div>
    <svg width="22" height="22" viewBox="0 0 256 256"><use href="#ic-home"/></svg>
    <span class="bn-lbl">Start</span>
  </button>
  <button class="bn-item" data-view="faelle" onclick="showView('faelle')">
    <div class="bn-bar" style="display:none"></div>
    <svg width="22" height="22" viewBox="0 0 256 256"><use href="#ic-zusammenfassung"/></svg>
    <span class="bn-lbl">Meine Fälle</span>
  </button>
  <button class="bn-item" data-view="hilfe" onclick="showView('hilfe')">
    <div class="bn-bar" style="display:none"></div>
    <svg width="22" height="22" viewBox="0 0 256 256"><use href="#ic-hilfe"/></svg>
    <span class="bn-lbl">Hilfe</span>
  </button>
  <button class="bn-item bn-logout" onclick="fahrerLogout()">
    <svg width="22" height="22" viewBox="0 0 256 256"><use href="#ic-abmelden"/></svg>
    <span class="bn-lbl">Abmelden</span>
  </button>
</nav>
```

- [ ] **Step 2: Commit**

```bash
git add schaden.html
git commit -m "feat: replace bottom nav with Start/Meine Fälle/Hilfe/Abmelden"
```

---

## Task 5: JavaScript

**Files:**
- Modify: `schaden.html` (multiple JS changes)

- [ ] **Step 1: Simplifică `scrollToForm()` (line 1427–1432)**

Găsește:
```javascript
function scrollToForm() {
  state.step = 1;
  render();
  const fc = document.querySelector('[data-form-card]');
  if (fc) fc.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
```

Înlocuiește cu:
```javascript
function scrollToForm() {
  state.step = 1;
  render();
  showView('form');
}
```

- [ ] **Step 2: Modifică `renderFaq()` să accepte targetId opțional (line 2073)**

Găsește:
```javascript
function renderFaq() {
  document.getElementById('faq-content').innerHTML = FAQ_CATEGORIES.map((cat, ci) => `
```

Înlocuiește cu:
```javascript
function renderFaq(targetId) {
  const el = document.getElementById(targetId || 'faq-content');
  if (!el) return;
  el.innerHTML = FAQ_CATEGORIES.map((cat, ci) => `
```

Și continuă până la `});` — înlocuiește și ultima linie a funcției:

Găsește (în `renderFaq`, ultimele 2 linii):
```javascript
    <div class="alert alert-blue" style="margin-top:8px;">
      <svg class="alert-icon" width="18" height="18"><use href="#i-phone"/></svg>
      <div><b>24/7-Hotline (in Kürze verfügbar)</b>Für komplexe Fälle erreichen Sie demnächst rund um die Uhr einen Schadenmanager telefonisch.</div>
    </div>`;
}
```

Rămâne identic — nu trebuie schimbat (funcția se termină cu `}` la `el.innerHTML = ...`).

- [ ] **Step 3: Adaugă `showView()`, `loadFahrerMe()`, `loadMeineFaelle()` înainte de `</script>` (line 1853)**

Găsește:
```javascript
loadWorkshops();
render();
</script>
```

Înlocuiește cu:
```javascript
loadWorkshops();
render();
loadFahrerMe();
showView('home');

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────

function showView(name) {
  document.querySelectorAll('.app-view').forEach(v => v.classList.remove('v-active'));
  const target = document.getElementById('view-' + name);
  if (target) target.classList.add('v-active');
  document.querySelectorAll('.bn-item[data-view]').forEach(btn => {
    btn.classList.remove('bn-active');
    const bar = btn.querySelector('.bn-bar');
    if (bar) bar.style.display = 'none';
  });
  const activeBtn = document.querySelector(`.bn-item[data-view="${name}"]`);
  if (activeBtn) {
    activeBtn.classList.add('bn-active');
    const bar = activeBtn.querySelector('.bn-bar');
    if (bar) bar.style.display = 'block';
  }
  if (name === 'faelle') loadMeineFaelle();
  if (name === 'hilfe') renderFaq('hilfe-faq-content');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadFahrerMe() {
  try {
    const r = await fetch('/api/fahrer/me').then(r => r.json());
    const nameEl  = document.getElementById('home-fahrer-name');
    const fleetEl = document.getElementById('home-fuhrpark-name');
    if (nameEl)  nameEl.textContent  = r.vorname || '';
    if (fleetEl) fleetEl.textContent = r.fuhrpark_name || '';
  } catch (e) { console.error('loadFahrerMe', e); }
}

async function loadMeineFaelle() {
  const list = document.getElementById('faelle-list');
  if (!list) return;
  list.innerHTML = '<div class="fall-empty">Lade …</div>';
  try {
    const rows = await fetch('/api/fahrer/meine-schaeden').then(r => r.json());
    if (!rows.length) {
      list.innerHTML = '<div class="fall-empty">Noch keine Schadensmeldung.<br>Nutzen Sie „Schadenmanagement" um eine neue anzulegen.</div>';
      return;
    }
    const statusCls = { 'Neu': 'fall-badge-neu', 'In Bearbeitung': 'fall-badge-in', 'Abgeschlossen': 'fall-badge-done' };
    list.innerHTML = rows.map(f => {
      const date = new Date(f.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const cls  = statusCls[f.status] || 'fall-badge-neu';
      return `<div class="fall-card">
        <div class="fall-card-top">
          <span class="fall-nr">${f.fall_nr || '—'}</span>
          <span class="${cls}">${f.status || 'Neu'}</span>
        </div>
        <div class="fall-meta">
          <span>🚗 ${f.kennzeichen || '—'}</span>
          <span>📅 ${date}</span>
        </div>
      </div>`;
    }).join('');
  } catch (e) {
    list.innerHTML = '<div class="fall-empty">Fehler beim Laden.</div>';
  }
}
</script>
```

- [ ] **Step 4: Verifică sintaxa JS**

Pornește serverul și deschide pagina:
```bash
node server.js
```

Deschide http://localhost:8000/schaden — pagina trebuie să se încarce fără erori în consolă.

- [ ] **Step 5: Commit**

```bash
git add schaden.html
git commit -m "feat: add showView, loadFahrerMe, loadMeineFaelle; wire home screen init"
```

---

## Task 6: Verificare End-to-End (Manual)

- [ ] **Step 1: Pornește serverul**

```bash
node server.js
```

- [ ] **Step 2: Testează Home Screen**

1. Deschide http://localhost:8000/fahrer/login, autentifică-te ca fahrer
2. Redirectul duce la `/schaden` → home screen trebuie să fie vizibil (nu formularul)
3. Verifică salut: "Guten Tag, {vorname}" + fuhrpark_name apar după 1-2 secunde
4. Verifică cele 4 module-tiles: Schadenmanagement (fără "Bald"), Fahrzeugakte ("Bald"), Leasingdaten ("Bald"), HU/UVV/Service ("Bald")
5. Bottom nav: Start (activ, bar albastru), Meine Fälle, Hilfe, Abmelden

- [ ] **Step 3: Testează navegarea**

1. Click "Schadenmanagement" tile → trece la formularul de schaden (step 1 vizibil)
2. Click "Start" în nav → revine la home screen
3. Click "Meine Fälle" în nav → view-faelle vizibil; dacă există schadenuri legate de fahrer, apar; altfel empty state
4. Click "Hilfe" în nav → view-hilfe vizibil; contact card + FAQ se încarcă
5. Click "Abmelden" → logout, redirect la `/fahrer/login`

- [ ] **Step 4: Testează flow complet**

1. De pe home, click Schadenmanagement → completează formularul → trimite
2. Click "Start" → "Meine Fälle" → schadenul tocmai trimis apare în listă cu status "Neu"
3. Verifică badge-urile de status (Neu = albastru, In Bearbeitung = amber, Abgeschlossen = verde)

- [ ] **Step 5: Verifică că hero-button funcționează**

Pe home screen, click butonul "Schaden melden →" din hero section → trebuie să deschidă formularul (nu să dea scroll)
