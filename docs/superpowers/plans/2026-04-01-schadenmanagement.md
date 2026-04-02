# Schadenmanagement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/schaden` page with a damage report form (3 steps, mandatory photo upload), backend storage in PostgreSQL, dual email notification via Resend, and a Schäden tab in the existing `/intern` dashboard.

**Architecture:** New static page `schaden.html` follows the FLOTTIQ v5 design system (same CSS variables, fonts, nav/footer as `index.html`). Backend adds one table (`schaeden`) and three endpoints to the existing `server.js`. No new dependencies — multer (memory storage) already installed handles photo uploads; Resend sends photos as email attachments.

**Tech Stack:** Express.js, PostgreSQL (pg), Resend (email + attachments), multer (memory storage, already installed), vanilla JS + HTML/CSS.

---

## How to Verify

After each task:
```bash
cd "C:/private_from_another_laptop/projects/hobby_project_1"
node server.js
```
Open **http://localhost:8000/schaden** in browser.

---

## File Map

| File | What changes |
|------|-------------|
| `server.js` | `initDB()` gets `schaeden` table; 3 new endpoints |
| `schaden.html` | New file — full page |
| `style.css` | New `.scd-` classes appended at end |
| `index.html` | Nav link, footer link, dashboard sidebar item + panel |

---

## Task 1: Add `schaeden` table to database

**Files:**
- Modify: `server.js` — `initDB()` function (lines 42–79)

- [ ] **Step 1: Add `schaeden` table creation inside `initDB()`**

In `server.js`, find the end of `initDB()` — just before the `console.log('✓ DB ready')` line — and insert:

```javascript
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schaeden (
      id              SERIAL PRIMARY KEY,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      fall_nr         TEXT UNIQUE,
      firma           TEXT,
      fahrer_name     TEXT NOT NULL,
      fahrer_email    TEXT,
      fahrer_telefon  TEXT NOT NULL,
      kennzeichen     TEXT NOT NULL,
      fahrzeugtyp     TEXT,
      baujahr         TEXT,
      unfall_datum    TEXT,
      unfall_uhrzeit  TEXT,
      unfall_ort      TEXT,
      fahrbereit      BOOLEAN,
      polizei_gerufen BOOLEAN,
      unfallgegner    BOOLEAN,
      beschreibung    TEXT NOT NULL,
      status          TEXT DEFAULT 'Neu',
      ip              TEXT
    )
  `);
```

- [ ] **Step 2: Verify table creation**

```bash
node -e "require('dotenv').config(); const {Pool}=require('pg'); const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}}); p.query('SELECT column_name FROM information_schema.columns WHERE table_name=\'schaeden\'').then(r=>{console.log(r.rows.map(x=>x.column_name));p.end()});"
```
Expected: array of 19 column names including `fall_nr`, `fahrbereit`, `beschreibung`.

- [ ] **Step 3: Commit**

```bash
git add server.js
git commit -m "feat: add schaeden table to initDB"
```

---

## Task 2: Backend — `POST /api/schaden` endpoint

**Files:**
- Modify: `server.js` — add endpoint after `POST /submit` (after line 327)

- [ ] **Step 1: Add the endpoint**

In `server.js`, after the closing `});` of `POST /submit` (around line 327) and before `// ── Start ──`, insert:

```javascript
// ── POST /api/schaden ─────────────────────────────────────────────────────────
app.post('/api/schaden', upload.array('photos', 5), async (req, res) => {
  const {
    firma = '', fahrer_name = '', fahrer_email = '', fahrer_telefon = '',
    kennzeichen = '', fahrzeugtyp = '', baujahr = '',
    unfall_datum = '', unfall_uhrzeit = '', unfall_ort = '',
    fahrbereit = '', polizei_gerufen = '', unfallgegner = '',
    beschreibung = ''
  } = req.body;

  // Validate required fields
  if (!fahrer_name || !fahrer_telefon || !fahrer_email || !kennzeichen || !beschreibung) {
    return res.json({ success: false, error: 'Pflichtfelder fehlen' });
  }
  if (!req.files || req.files.length === 0) {
    return res.json({ success: false, error: 'Mindestens ein Foto erforderlich' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unbekannt';
  const timestamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });

  try {
    // Insert row first to get the serial id
    const insertResult = await pool.query(
      `INSERT INTO schaeden
        (firma, fahrer_name, fahrer_email, fahrer_telefon, kennzeichen, fahrzeugtyp,
         baujahr, unfall_datum, unfall_uhrzeit, unfall_ort, fahrbereit, polizei_gerufen,
         unfallgegner, beschreibung, ip)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING id`,
      [
        firma, fahrer_name, fahrer_email, fahrer_telefon, kennzeichen, fahrzeugtyp,
        baujahr, unfall_datum, unfall_uhrzeit, unfall_ort,
        fahrbereit === 'ja', polizei_gerufen === 'ja', unfallgegner === 'ja',
        beschreibung, ip
      ]
    );
    const id = insertResult.rows[0].id;
    const year = new Date().getFullYear();
    const fall_nr = `SCH-${year}-${String(id).padStart(4, '0')}`;
    await pool.query('UPDATE schaeden SET fall_nr=$1 WHERE id=$2', [fall_nr, id]);

    // Build attachments array for Resend
    const attachments = req.files.map(f => ({
      filename: f.originalname,
      content: f.buffer.toString('base64'),
    }));

    // Email HTML for IMD
    const fahrbereitBadge = fahrbereit === 'ja'
      ? '<span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:4px;font-weight:700">✓ Fahrbereit</span>'
      : '<span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:4px;font-weight:700">✗ NICHT fahrbereit</span>';

    const imdHtml = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;background:#f4f7fb;margin:0;padding:20px}
  .card{background:#fff;border-radius:8px;padding:32px;max-width:600px;margin:0 auto;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  h2{color:#0052A3;margin:0 0 4px}
  .fall{font-size:22px;font-weight:800;color:#09152A;margin-bottom:8px}
  .meta{color:#536E94;font-size:13px;margin-bottom:24px}
  .section{background:#0052A3;color:#fff;padding:8px 12px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-top:20px;border-radius:4px 4px 0 0}
  table{width:100%;border-collapse:collapse}
  td{padding:10px 12px;border-bottom:1px solid #ECF1F8;font-size:14px;color:#09152A;vertical-align:top}
  td.lbl{width:38%;font-weight:600;color:#2E4666}
  .footer{margin-top:24px;font-size:12px;color:#8899B4;border-top:1px solid #DDE6F0;padding-top:12px}
</style></head><body>
<div class="card">
  <h2>🚨 Neue Schadensmeldung</h2>
  <div class="fall">${fall_nr}</div>
  <p class="meta">Eingegangen am ${timestamp} &bull; IP: ${ip}</p>
  <div class="section">Fahrer &amp; Kontakt</div>
  <table>
    <tr><td class="lbl">Fahrer</td><td>${fahrer_name}</td></tr>
    <tr><td class="lbl">Firma</td><td>${firma || '—'}</td></tr>
    <tr><td class="lbl">Telefon</td><td>${fahrer_telefon}</td></tr>
    <tr><td class="lbl">E-Mail</td><td>${fahrer_email}</td></tr>
  </table>
  <div class="section">Fahrzeug</div>
  <table>
    <tr><td class="lbl">Kennzeichen</td><td>${kennzeichen}</td></tr>
    <tr><td class="lbl">Fahrzeugtyp</td><td>${fahrzeugtyp || '—'}</td></tr>
    <tr><td class="lbl">Baujahr</td><td>${baujahr || '—'}</td></tr>
    <tr><td class="lbl">Fahrbereit</td><td>${fahrbereitBadge}</td></tr>
  </table>
  <div class="section">Schadensdetails</div>
  <table>
    <tr><td class="lbl">Datum</td><td>${unfall_datum}${unfall_uhrzeit ? ' · ' + unfall_uhrzeit : ''}</td></tr>
    <tr><td class="lbl">Unfallort</td><td>${unfall_ort || '—'}</td></tr>
    <tr><td class="lbl">Polizei gerufen</td><td>${polizei_gerufen === 'ja' ? 'Ja' : 'Nein'}</td></tr>
    <tr><td class="lbl">Unfallgegner</td><td>${unfallgegner === 'ja' ? 'Ja' : 'Nein'}</td></tr>
    <tr><td class="lbl">Beschreibung</td><td>${beschreibung}</td></tr>
  </table>
  <div class="footer">Automatisch generiert · ${req.files.length} Foto(s) im Anhang</div>
</div></body></html>`;

    // Confirmation email HTML for client
    const clientHtml = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;background:#f4f7fb;margin:0;padding:20px}
  .card{background:#fff;border-radius:8px;padding:32px;max-width:580px;margin:0 auto;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  .logo{font-family:Arial,sans-serif;font-size:15px;font-weight:800;color:#0052A3;margin-bottom:24px}
  h2{color:#09152A;margin:0 0 8px;font-size:20px}
  .fall-box{background:#f0f7ff;border:2px solid #0052A3;border-radius:8px;padding:18px 24px;margin:24px 0;text-align:center}
  .fall-label{font-size:12px;color:#536E94;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px}
  .fall-nr{font-size:28px;font-weight:800;color:#0052A3;letter-spacing:.04em}
  p{color:#536E94;font-size:14px;line-height:1.6}
  .contact{background:#f4f7fb;border-radius:6px;padding:14px 18px;font-size:13px;color:#09152A;margin-top:20px}
  .footer{margin-top:24px;font-size:12px;color:#8899B4;border-top:1px solid #DDE6F0;padding-top:12px}
</style></head><body>
<div class="card">
  <div class="logo">IMD Fleet Services</div>
  <h2>Ihre Schadensmeldung wurde empfangen</h2>
  <p>Sehr geehrte/r ${fahrer_name},<br>wir haben Ihre Schadensmeldung erhalten und werden uns innerhalb von 2 Stunden bei Ihnen melden.</p>
  <div class="fall-box">
    <div class="fall-label">Ihre Fallnummer</div>
    <div class="fall-nr">${fall_nr}</div>
  </div>
  <p>Bitte halten Sie diese Fallnummer bereit — sie wird für alle weiteren Kommunikationen benötigt.</p>
  <div class="contact"><strong>Bei dringenden Fragen:</strong><br>+49 371 123 456 (24/7 Notfallhotline)</div>
  <div class="footer">IMD Fleet Services · Chemnitz, Deutschland</div>
</div></body></html>`;

    // Send emails
    await resend.emails.send({
      from: 'IMD Fleet Services <onboarding@resend.dev>',
      to: process.env.RECIPIENT_EMAIL,
      subject: `🚨 Neuer Schaden: ${fall_nr} — ${kennzeichen}${firma ? ' — ' + firma : ''}`,
      html: imdHtml,
      attachments,
    });

    await resend.emails.send({
      from: 'IMD Fleet Services <onboarding@resend.dev>',
      to: fahrer_email,
      subject: `Ihre Schadensmeldung ${fall_nr} wurde empfangen — IMD Fleet Services`,
      html: clientHtml,
    });

    console.log(`[${timestamp}] ✓ Schaden ${fall_nr} — ${kennzeichen} saved + emails sent`);
    res.json({ success: true, fall_nr });
  } catch (err) {
    console.error('Schaden error:', err.message);
    res.status(500).json({ success: false, error: 'Fehler bei der Verarbeitung. Bitte versuchen Sie es erneut.' });
  }
});
```

- [ ] **Step 2: Verify endpoint exists**

```bash
node -e "const app=require('./server.js')" 2>&1 | head -5
```
Expected: no syntax errors, server starts.

- [ ] **Step 3: Commit**

```bash
git add server.js
git commit -m "feat: add POST /api/schaden endpoint with dual email + photo attachments"
```

---

## Task 3: Backend — `GET /api/schaeden` + `PATCH /api/schaeden/:id/status`

**Files:**
- Modify: `server.js` — add two endpoints after `POST /api/schaden`

- [ ] **Step 1: Add the two endpoints**

Immediately after the `POST /api/schaden` closing `});`, insert:

```javascript
// ── GET /api/schaeden ─────────────────────────────────────────────────────────
app.get('/api/schaeden', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schaeden ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/schaeden/:id/status ────────────────────────────────────────────
app.patch('/api/schaeden/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  const allowed = ['Neu', 'In Bearbeitung', 'Abgeschlossen'];
  if (!allowed.includes(status)) return res.json({ success: false, error: 'Ungültiger Status' });
  try {
    await pool.query('UPDATE schaeden SET status=$1 WHERE id=$2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Step 2: Verify syntax**

```bash
node -e "require('dotenv').config(); require('./server.js')" 2>&1 | grep -E "running|error|Error" | head -3
```
Expected: `✓ IMD Fleet Services server running`

- [ ] **Step 3: Commit**

```bash
git add server.js
git commit -m "feat: add GET /api/schaeden and PATCH status endpoints"
```

---

## Task 4: Create `schaden.html` — page shell (head, nav, footer)

**Files:**
- Create: `schaden.html`

- [ ] **Step 1: Create the file with head, nav, and footer**

Create `schaden.html` with this content:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Digitales Schadenmanagement — IMD Fleet Services</title>
  <meta name="description" content="Schaden melden und IMD Fleet Services übernimmt den gesamten Prozess — 24/7, bundesweit, kostenlos.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>

<!-- NAV -->
<nav id="nav">
  <div class="nav-in">
    <div class="nav-logo" onclick="window.location.href='/'" style="cursor:pointer">
      <img class="logo-dark" src="logo_dark.png" alt="IMD Fleet Services"/>
      <img class="logo-light" src="logo_light.png" alt="IMD Fleet Services"/>
    </div>
    <ul class="nav-links">
      <li><a href="/#service">Für Fuhrparks</a></li>
      <li><a href="/#prozess">So funktioniert es</a></li>
      <li><a href="/#warum">Warum wir</a></li>
      <li><a href="/#ueber-uns">Über uns</a></li>
      <li><a href="/schaden" class="active">Schadenmanagement</a></li>
      <li><a href="/#kontakt">Kontakt</a></li>
    </ul>
    <button class="nav-cta" onclick="document.getElementById('scd-form-section').scrollIntoView({behavior:'smooth'})">Schaden melden</button>
    <button class="burger" id="burger" onclick="toggleScdMob()"><span></span><span></span><span></span></button>
  </div>
</nav>

<!-- MOBILE MENU -->
<div class="mob-menu" id="scdMobMenu">
  <a href="/#service" onclick="closeScdMob()">Für Fuhrparks</a>
  <a href="/#prozess" onclick="closeScdMob()">So funktioniert es</a>
  <a href="/#warum" onclick="closeScdMob()">Warum wir</a>
  <a href="/#ueber-uns" onclick="closeScdMob()">Über uns</a>
  <a href="/schaden" onclick="closeScdMob()">Schadenmanagement</a>
  <a href="/#kontakt" onclick="closeScdMob()">Kontakt</a>
</div>

<!-- SECTIONS GO HERE -->

<footer>
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <div style="margin-bottom:12px"><img src="logo_dark.png" alt="IMD Fleet Services" style="width:200px;height:auto;display:block;margin-bottom:8px" loading="lazy"></div>
        <div class="fb-desc">IMD Fleet Services — professioneller Flottenankauf und digitales Schadenmanagement. Bundesweit, kostenfrei, revisionssicher.</div>
        <div class="fb-badges"><span class="fb-badge">🚨 24/7 Hotline</span><span class="fb-badge">⚡ 2h Reaktion</span><span class="fb-badge">🚛 Bundesweit</span></div>
      </div>
      <div class="f-col"><h5>Service</h5><ul>
        <li><a href="/#service">Für Fuhrparks</a></li>
        <li><a href="/#prozess">So funktioniert es</a></li>
        <li><a href="/schaden">Schadenmanagement</a></li>
        <li><a href="/#anmelden">Fahrzeug anmelden</a></li>
      </ul></div>
      <div class="f-col"><h5>Unternehmen</h5><ul>
        <li><a href="/#ueber-uns">Über uns</a></li>
        <li><a href="/#faq">FAQ</a></li>
      </ul></div>
      <div class="f-col"><h5>Kontakt</h5><ul>
        <li><a href="#">+49 371 123 456</a></li>
        <li><a href="#">Chemnitz, Deutschland</a></li>
      </ul></div>
    </div>
    <div class="footer-bottom">
      <div class="f-copy">© 2026 IMD Fleet Services GmbH. Alle Rechte vorbehalten.</div>
      <div class="f-links"><a href="#">Impressum</a><a href="#">Datenschutz</a><a href="#">AGB</a></div>
    </div>
  </div>
</footer>

<script>
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('sc', scrollY > 50);
}, {passive: true});
function toggleScdMob() {
  const m = document.getElementById('scdMobMenu');
  const b = document.getElementById('burger');
  m.classList.toggle('open');
  b.classList.toggle('open');
  document.body.style.overflow = m.classList.contains('open') ? 'hidden' : '';
}
function closeScdMob() {
  document.getElementById('scdMobMenu').classList.remove('open');
  document.getElementById('burger').classList.remove('open');
  document.body.style.overflow = '';
}
</script>

</body>
</html>
```

- [ ] **Step 2: Verify page loads**

```bash
node server.js &
```
Open http://localhost:8000/schaden — confirm nav and footer render with correct fonts and colors.

- [ ] **Step 3: Commit**

```bash
git add schaden.html
git commit -m "feat: add schaden.html page shell with nav and footer"
```

---

## Task 5: `schaden.html` + `style.css` — Hero + Service cards section

**Files:**
- Modify: `schaden.html` — insert sections before footer
- Modify: `style.css` — append new `.scd-` classes

- [ ] **Step 1: Add hero + service sections to `schaden.html`**

Replace the `<!-- SECTIONS GO HERE -->` comment with:

```html
<!-- ═══════════ HERO ═══════════ -->
<section class="scd-hero">
  <div class="wrap">
    <div class="scd-hero-badge">Für IMD Fleet Services Kunden</div>
    <h1 class="scd-hero-h1">Digitales<br>Schadenmanagement</h1>
    <p class="scd-hero-sub">All-in-Service · 24/7/365<br>Wir übernehmen den gesamten Prozess ab dem Unfall.</p>
    <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-top:32px">
      <button class="btn btn-green btn-lg" onclick="document.getElementById('scd-form-section').scrollIntoView({behavior:'smooth'})">Schaden melden →</button>
      <a href="/" class="btn btn-ghost-white btn-lg">Zur Startseite</a>
    </div>
  </div>
</section>

<!-- ═══════════ SERVICE CARDS ═══════════ -->
<section class="section sec-light">
  <div class="wrap">
    <div class="eyebrow" style="text-align:center">Was wir übernehmen</div>
    <h2 class="h2" style="text-align:center;margin-bottom:48px">Unser Service</h2>
    <div class="scd-cards">
      <div class="scd-card">
        <div class="scd-card-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.27 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.36a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
        <div class="scd-card-title">24h Hotline</div>
        <div class="scd-card-desc">Rund um die Uhr erreichbar</div>
      </div>
      <div class="scd-card">
        <div class="scd-card-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
        <div class="scd-card-title">Fahrtenmessung ab Unfall</div>
        <div class="scd-card-desc">Dokumentation ab dem Schadensort</div>
      </div>
      <div class="scd-card">
        <div class="scd-card-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>
        <div class="scd-card-title">Kostenloser Abschleppservice</div>
        <div class="scd-card-desc">Wir organisieren die Bergung</div>
      </div>
      <div class="scd-card">
        <div class="scd-card-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="16" r="1"/></svg></div>
        <div class="scd-card-title">Kostenloser Unfallersatzwagen</div>
        <div class="scd-card-desc">Mobilität während der Reparatur</div>
      </div>
      <div class="scd-card">
        <div class="scd-card-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
        <div class="scd-card-title">Bundesweites Werkstattnetz</div>
        <div class="scd-card-desc">Geprüfte Partner in ganz Deutschland</div>
      </div>
      <div class="scd-card">
        <div class="scd-card-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="scd-card-title">Rechtslage-Prüfung</div>
        <div class="scd-card-desc">Durch spezialisierte Verkehrsanwälte</div>
      </div>
      <div class="scd-card">
        <div class="scd-card-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg></div>
        <div class="scd-card-title">Reparatursteuerung</div>
        <div class="scd-card-desc">Überwachung des gesamten Prozesses</div>
      </div>
      <div class="scd-card">
        <div class="scd-card-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
        <div class="scd-card-title">Digitale Schadenakte</div>
        <div class="scd-card-desc">Alle Dokumente zentral und digital</div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add CSS to `style.css`**

Append at the very end of `style.css`:

```css
/* ══════════════════════════════════════════════════════════
   SCHADEN PAGE
   ══════════════════════════════════════════════════════════ */

/* Hero */
.scd-hero{background:var(--navy);padding:120px 0 80px;text-align:center;position:relative;overflow:hidden}
.scd-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 60% 40%,rgba(0,87,168,.35) 0%,transparent 70%);pointer-events:none}
.scd-hero-badge{display:inline-block;font-family:var(--fh);font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--green);background:rgba(0,200,122,.12);border:1px solid rgba(0,200,122,.25);border-radius:100px;padding:6px 16px;margin-bottom:24px}
.scd-hero-h1{font-family:var(--fh);font-size:clamp(40px,6vw,72px);font-weight:800;color:#fff;line-height:1.1;letter-spacing:-.03em;margin:0 0 16px}
.scd-hero-sub{font-size:clamp(15px,1.8vw,18px);color:rgba(255,255,255,.6);line-height:1.6;margin:0}

/* Service cards grid */
.scd-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.scd-card{background:#fff;border:1.5px solid var(--f2);border-radius:var(--r-xl);padding:24px 20px;transition:border-color .2s,box-shadow .2s}
.scd-card:hover{border-color:var(--blue);box-shadow:0 4px 20px rgba(0,87,168,.08)}
.scd-card-ico{width:44px;height:44px;border-radius:12px;background:var(--sky);display:flex;align-items:center;justify-content:center;color:var(--blue);margin-bottom:14px}
.scd-card-title{font-family:var(--fh);font-size:13px;font-weight:700;color:var(--t0);margin-bottom:6px;line-height:1.3}
.scd-card-desc{font-size:12px;color:var(--t2);line-height:1.5}
@media(max-width:900px){.scd-cards{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.scd-cards{grid-template-columns:1fr}}
```

- [ ] **Step 3: Verify visually**

Open http://localhost:8000/schaden — confirm hero renders with dark navy background, badge, big title, and 8 service cards in 4-column grid below.

- [ ] **Step 4: Commit**

```bash
git add schaden.html style.css
git commit -m "feat: add hero and service cards to schaden.html"
```

---

## Task 6: `schaden.html` + `style.css` — Prozess timeline + CTA section

**Files:**
- Modify: `schaden.html` — insert after service cards section, before footer
- Modify: `style.css` — append

- [ ] **Step 1: Add prozess + CTA sections to `schaden.html`**

After the closing `</section>` of the service cards section and before `<footer>`, insert:

```html
<!-- ═══════════ PROZESS ═══════════ -->
<section class="section" style="background:var(--navy)">
  <div class="wrap">
    <div class="eyebrow" style="text-align:center;color:rgba(255,255,255,.4)">Wie es funktioniert</div>
    <h2 class="h2 h2-white" style="text-align:center;margin-bottom:48px">Unser Prozess</h2>
    <div class="scd-timeline">
      <div class="scd-tl-item">
        <div class="scd-tl-num">01</div>
        <div class="scd-tl-connector"></div>
        <div class="scd-tl-title">Schaden melden</div>
        <div class="scd-tl-desc">Kunde meldet per Telefon, App oder Formular. Schnell und unkompliziert.</div>
      </div>
      <div class="scd-tl-item">
        <div class="scd-tl-num">02</div>
        <div class="scd-tl-connector"></div>
        <div class="scd-tl-title">Erste Hilfe</div>
        <div class="scd-tl-desc">IMD koordiniert Abschleppen, Polizei und Unfallersatzwagen — 24/7.</div>
      </div>
      <div class="scd-tl-item">
        <div class="scd-tl-num">03</div>
        <div class="scd-tl-connector"></div>
        <div class="scd-tl-title">Begutachtung</div>
        <div class="scd-tl-desc">Unabhängiges Gutachten, Werkstattauswahl aus bundesweitem Netz.</div>
      </div>
      <div class="scd-tl-item">
        <div class="scd-tl-num">04</div>
        <div class="scd-tl-connector"></div>
        <div class="scd-tl-title">Reparatur</div>
        <div class="scd-tl-desc">IMD überwacht Reparaturprozess und Rechnungskontrolle lückenlos.</div>
      </div>
      <div class="scd-tl-item">
        <div class="scd-tl-num">05</div>
        <div class="scd-tl-connector" style="display:none"></div>
        <div class="scd-tl-title">Prozessende</div>
        <div class="scd-tl-desc">Fahrzeugübergabe, Abschluss aller Kommunikation und Dokumentation.</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════ CTA ═══════════ -->
<section class="section" style="background:var(--green);padding:72px 0">
  <div class="wrap" style="text-align:center">
    <h2 class="h2" style="color:#fff;margin-bottom:12px">Schaden melden —<br>wir übernehmen den Rest.</h2>
    <p style="color:rgba(255,255,255,.8);font-size:16px;margin-bottom:32px">Kostenlos · Bundesweit · 24/7</p>
    <button class="btn btn-lg" style="background:#fff;color:var(--green);font-weight:700" onclick="document.getElementById('scd-form-section').scrollIntoView({behavior:'smooth'})">Jetzt Schaden melden →</button>
  </div>
</section>
```

- [ ] **Step 2: Add CSS to `style.css`**

Append at the end of `style.css` (after the existing `.scd-` rules):

```css
/* Prozess timeline */
.scd-timeline{display:grid;grid-template-columns:repeat(5,1fr);gap:0;position:relative}
.scd-tl-item{text-align:center;padding:0 12px;position:relative}
.scd-tl-num{width:48px;height:48px;border-radius:50%;background:var(--blue);color:#fff;font-family:var(--fh);font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.scd-tl-connector{position:absolute;top:24px;left:calc(50% + 24px);right:calc(-50% + 24px);height:2px;background:rgba(255,255,255,.15)}
.scd-tl-title{font-family:var(--fh);font-size:13px;font-weight:700;color:#fff;margin-bottom:8px}
.scd-tl-desc{font-size:12px;color:rgba(255,255,255,.5);line-height:1.6}
@media(max-width:860px){
  .scd-timeline{grid-template-columns:1fr;gap:32px}
  .scd-tl-connector{display:none!important}
  .scd-tl-item{display:flex;gap:16px;text-align:left;align-items:flex-start}
  .scd-tl-num{flex-shrink:0;margin:0}
}
```

- [ ] **Step 3: Verify visually**

Scroll to prozess section — 5 numbered steps in a horizontal timeline on desktop. CTA section has green background.

- [ ] **Step 4: Commit**

```bash
git add schaden.html style.css
git commit -m "feat: add prozess timeline and CTA section to schaden.html"
```

---

## Task 7: `schaden.html` + `style.css` — 3-step form HTML + CSS

**Files:**
- Modify: `schaden.html` — insert form section before footer (after CTA section)
- Modify: `style.css` — append form styles

- [ ] **Step 1: Add the form section HTML**

After the closing `</section>` of the CTA section and before `<footer>`, insert:

```html
<!-- ═══════════ FORM ═══════════ -->
<section class="section sec-light" id="scd-form-section">
  <div class="wrap">
    <div class="eyebrow" style="text-align:center">Schadensmeldung</div>
    <h2 class="h2" style="text-align:center;margin-bottom:8px">Schaden digital melden</h2>
    <p class="lead" style="text-align:center;margin-bottom:40px">Füllen Sie das Formular aus — wir melden uns innerhalb von 2 Stunden.</p>

    <!-- Progress bar -->
    <div class="scd-form-wrap">
      <div class="scd-progress" id="scdProgress">
        <div class="scd-progress-step active" data-step="1">
          <div class="scd-progress-dot">1</div>
          <div class="scd-progress-label">Kontakt & Fahrzeug</div>
        </div>
        <div class="scd-progress-line"></div>
        <div class="scd-progress-step" data-step="2">
          <div class="scd-progress-dot">2</div>
          <div class="scd-progress-label">Schadensdetails</div>
        </div>
        <div class="scd-progress-line"></div>
        <div class="scd-progress-step" data-step="3">
          <div class="scd-progress-dot">3</div>
          <div class="scd-progress-label">Fotos hochladen</div>
        </div>
      </div>

      <!-- Step 1 -->
      <div class="scd-step active" id="scdStep1">
        <div class="fg2">
          <div class="fg"><label class="fl">Fahrer Name *</label><input type="text" id="scdFahrerName" class="fi" placeholder="Max Mustermann"></div>
          <div class="fg"><label class="fl">Firma / Unternehmen</label><input type="text" id="scdFirma" class="fi" placeholder="Muster GmbH"></div>
        </div>
        <div class="fg2">
          <div class="fg"><label class="fl">Telefon *</label><input type="tel" id="scdTelefon" class="fi" placeholder="+49 171 ..."></div>
          <div class="fg"><label class="fl">E-Mail *</label><input type="email" id="scdEmail" class="fi" placeholder="fahrer@firma.de"></div>
        </div>
        <div class="fg2">
          <div class="fg"><label class="fl">Kennzeichen *</label><input type="text" id="scdKennzeichen" class="fi" placeholder="C-AB 1234" style="text-transform:uppercase"></div>
          <div class="fg"><label class="fl">Fahrzeugtyp / Marke & Modell</label><input type="text" id="scdFahrzeugtyp" class="fi" placeholder="BMW 320d"></div>
        </div>
        <div class="fg2">
          <div class="fg"><label class="fl">Baujahr</label><input type="text" id="scdBaujahr" class="fi" placeholder="2022"></div>
          <div class="fg"></div>
        </div>
        <div id="scdErr1" class="scd-err" style="display:none"></div>
        <div class="scd-form-nav">
          <div></div>
          <button class="btn btn-navy" onclick="scdNext(1)">Weiter →</button>
        </div>
      </div>

      <!-- Step 2 -->
      <div class="scd-step" id="scdStep2">
        <div class="fg2">
          <div class="fg"><label class="fl">Unfalldatum *</label><input type="date" id="scdDatum" class="fi"></div>
          <div class="fg"><label class="fl">Uhrzeit</label><input type="time" id="scdUhrzeit" class="fi"></div>
        </div>
        <div class="fg"><label class="fl">Unfallort (Straße, Stadt) *</label><input type="text" id="scdOrt" class="fi" placeholder="Hauptstraße 12, Chemnitz"></div>
        <div class="fg2" style="margin-top:8px">
          <div class="fg">
            <label class="fl">Fahrzeug fahrbereit? *</label>
            <div class="scd-toggle-group" id="scdFahrbereit">
              <button type="button" class="scd-toggle" data-val="ja" onclick="scdToggle('scdFahrbereit','ja')">✓ Ja</button>
              <button type="button" class="scd-toggle" data-val="nein" onclick="scdToggle('scdFahrbereit','nein')">✗ Nein</button>
            </div>
          </div>
          <div class="fg">
            <label class="fl">Polizei gerufen?</label>
            <div class="scd-toggle-group" id="scdPolizei">
              <button type="button" class="scd-toggle" data-val="ja" onclick="scdToggle('scdPolizei','ja')">Ja</button>
              <button type="button" class="scd-toggle" data-val="nein" onclick="scdToggle('scdPolizei','nein')">Nein</button>
            </div>
          </div>
        </div>
        <div class="fg2">
          <div class="fg">
            <label class="fl">Unfallgegner vorhanden?</label>
            <div class="scd-toggle-group" id="scdGegner">
              <button type="button" class="scd-toggle" data-val="ja" onclick="scdToggle('scdGegner','ja')">Ja</button>
              <button type="button" class="scd-toggle" data-val="nein" onclick="scdToggle('scdGegner','nein')">Nein</button>
            </div>
          </div>
          <div class="fg"></div>
        </div>
        <div class="fg"><label class="fl">Beschreibung des Schadens *</label><textarea id="scdBeschreibung" class="fi" rows="4" style="resize:vertical;font-family:inherit" placeholder="Bitte beschreiben Sie den Schaden so genau wie möglich..."></textarea></div>
        <div id="scdErr2" class="scd-err" style="display:none"></div>
        <div class="scd-form-nav">
          <button class="btn-back" onclick="scdBack(2)">← Zurück</button>
          <button class="btn btn-navy" onclick="scdNext(2)">Weiter →</button>
        </div>
      </div>

      <!-- Step 3 -->
      <div class="scd-step" id="scdStep3">
        <label class="fl">Fotos vom Schaden * (min. 1, max. 5 · JPG/PNG · max. 5 MB pro Foto)</label>
        <div class="scd-upload-zone" id="scdUploadZone" onclick="document.getElementById('scdPhotos').click()">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--t3);margin-bottom:12px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <div style="font-family:var(--fh);font-size:14px;font-weight:600;color:var(--t0);margin-bottom:4px">Fotos hier ablegen oder klicken</div>
          <div style="font-size:12px;color:var(--t3)">JPG, PNG · max. 5 MB pro Foto</div>
        </div>
        <input type="file" id="scdPhotos" accept="image/jpeg,image/png" multiple style="display:none" onchange="scdHandleFiles(this.files)">
        <div class="scd-thumbs" id="scdThumbs"></div>
        <div id="scdErr3" class="scd-err" style="display:none"></div>
        <div class="scd-form-nav">
          <button class="btn-back" onclick="scdBack(3)">← Zurück</button>
          <button class="btn btn-green btn-lg" id="scdSubmitBtn" onclick="scdSubmit()">Schaden melden →</button>
        </div>
      </div>

      <!-- Success screen -->
      <div class="scd-step" id="scdSuccess" style="text-align:center;padding:48px 0">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#00C87A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 20px;display:block"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <h2 class="h2" style="margin-bottom:8px">Ihr Schaden wurde gemeldet.</h2>
        <p style="color:var(--t2);margin-bottom:28px">Wir melden uns innerhalb von 2 Stunden bei Ihnen.</p>
        <div class="scd-fall-box">
          <div style="font-family:var(--fh);font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--t2);margin-bottom:6px">Ihre Fallnummer</div>
          <div id="scdFallNr" style="font-family:var(--fh);font-size:32px;font-weight:800;color:var(--navy);letter-spacing:.04em"></div>
        </div>
        <p style="color:var(--t2);font-size:13px;margin:20px 0 32px">Bei dringenden Fragen: <strong>+49 371 123 456</strong> (24/7 Notfallhotline)</p>
        <a href="/" class="btn btn-navy btn-lg">Zur Startseite</a>
      </div>

    </div>
  </div>
</section>
```

- [ ] **Step 2: Add form CSS to `style.css`**

Append at the end of `style.css`:

```css
/* Form wrapper + progress */
.scd-form-wrap{max-width:720px;margin:0 auto;background:#fff;border:1.5px solid var(--f2);border-radius:var(--r-2xl);padding:40px;box-shadow:var(--sh-md)}
.scd-progress{display:flex;align-items:center;margin-bottom:40px}
.scd-progress-step{display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0}
.scd-progress-dot{width:32px;height:32px;border-radius:50%;background:var(--f1);border:2px solid var(--f2);font-family:var(--fh);font-size:13px;font-weight:700;color:var(--t2);display:flex;align-items:center;justify-content:center;transition:all .3s}
.scd-progress-step.active .scd-progress-dot{background:var(--navy);border-color:var(--navy);color:#fff}
.scd-progress-step.done .scd-progress-dot{background:var(--green);border-color:var(--green);color:#fff}
.scd-progress-label{font-family:var(--fh);font-size:10px;font-weight:600;color:var(--t2);text-align:center;white-space:nowrap}
.scd-progress-step.active .scd-progress-label,.scd-progress-step.done .scd-progress-label{color:var(--navy)}
.scd-progress-line{flex:1;height:2px;background:var(--f2);margin:0 8px;margin-bottom:18px;transition:background .3s}
.scd-progress-line.done{background:var(--green)}

/* Steps */
.scd-step{display:none}
.scd-step.active{display:block}

/* Toggle buttons (Ja/Nein) */
.scd-toggle-group{display:flex;gap:8px;margin-top:4px}
.scd-toggle{font-family:var(--fh);font-size:12px;font-weight:700;padding:8px 20px;border-radius:8px;border:1.5px solid var(--f2);background:#fff;color:var(--t1);cursor:pointer;transition:all .2s}
.scd-toggle.active{background:var(--navy);border-color:var(--navy);color:#fff}

/* Upload zone */
.scd-upload-zone{border:2px dashed var(--f2);border-radius:var(--r-xl);padding:40px 20px;text-align:center;cursor:pointer;transition:border-color .2s,background .2s;margin-top:8px}
.scd-upload-zone:hover{border-color:var(--blue);background:var(--sky)}
.scd-thumbs{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.scd-thumb{width:80px;height:80px;border-radius:8px;object-fit:cover;border:1.5px solid var(--f2)}

/* Error, nav, fall box */
.scd-err{color:var(--red);font-size:13px;margin-top:12px;padding:10px 14px;background:#fff0f0;border-radius:8px;border:1px solid #fecaca}
.scd-form-nav{display:flex;justify-content:space-between;align-items:center;margin-top:28px;padding-top:20px;border-top:1px solid var(--f2)}
.scd-fall-box{background:var(--sky);border:2px solid var(--blue);border-radius:12px;padding:20px 32px;display:inline-block}
@media(max-width:600px){.scd-form-wrap{padding:24px 18px}}
```

- [ ] **Step 3: Verify form renders**

Open http://localhost:8000/schaden — scroll to form. Confirm 3-step progress bar, Step 1 shows with all input fields, Ja/Nein toggles in Step 2 look correct, upload zone in Step 3.

- [ ] **Step 4: Commit**

```bash
git add schaden.html style.css
git commit -m "feat: add 3-step form HTML and CSS to schaden.html"
```

---

## Task 8: `schaden.html` — Form JavaScript

**Files:**
- Modify: `schaden.html` — add `<script>` block before `</body>`

- [ ] **Step 1: Add the form JavaScript**

Before `</body>` in `schaden.html`, add a new `<script>` block (after the existing nav script):

```html
<script>
// ─── SCHADEN FORM ───
let scdFiles = [];

function scdToggle(groupId, val) {
  document.querySelectorAll('#' + groupId + ' .scd-toggle').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val === val);
  });
}

function scdGetToggle(groupId) {
  const active = document.querySelector('#' + groupId + ' .scd-toggle.active');
  return active ? active.dataset.val : null;
}

function scdShowStep(n) {
  document.querySelectorAll('.scd-step').forEach(s => s.classList.remove('active'));
  document.getElementById('scdStep' + n).classList.add('active');
  document.querySelectorAll('.scd-progress-step').forEach(s => {
    const sn = parseInt(s.dataset.step);
    s.classList.toggle('active', sn === n);
    s.classList.toggle('done', sn < n);
  });
  document.querySelectorAll('.scd-progress-line').forEach((line, i) => {
    line.classList.toggle('done', i + 1 < n);
  });
  document.getElementById('scd-form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scdNext(step) {
  if (step === 1) {
    const name = document.getElementById('scdFahrerName').value.trim();
    const tel  = document.getElementById('scdTelefon').value.trim();
    const email = document.getElementById('scdEmail').value.trim();
    const kz   = document.getElementById('scdKennzeichen').value.trim();
    if (!name || !tel || !email || !kz) {
      const err = document.getElementById('scdErr1');
      err.textContent = 'Bitte füllen Sie alle Pflichtfelder aus (Name, Telefon, E-Mail, Kennzeichen).';
      err.style.display = 'block';
      return;
    }
    document.getElementById('scdErr1').style.display = 'none';
    scdShowStep(2);
  } else if (step === 2) {
    const datum = document.getElementById('scdDatum').value;
    const ort   = document.getElementById('scdOrt').value.trim();
    const fb    = scdGetToggle('scdFahrbereit');
    const desc  = document.getElementById('scdBeschreibung').value.trim();
    if (!datum || !ort || !fb || desc.length < 20) {
      const err = document.getElementById('scdErr2');
      err.textContent = !fb
        ? 'Bitte wählen Sie aus ob das Fahrzeug fahrbereit ist.'
        : desc.length < 20
          ? 'Bitte beschreiben Sie den Schaden (mindestens 20 Zeichen).'
          : 'Bitte füllen Sie alle Pflichtfelder aus (Datum, Ort, Beschreibung).';
      err.style.display = 'block';
      return;
    }
    document.getElementById('scdErr2').style.display = 'none';
    scdShowStep(3);
  }
}

function scdBack(step) {
  scdShowStep(step - 1);
}

function scdHandleFiles(fileList) {
  const err = document.getElementById('scdErr3');
  const newFiles = Array.from(fileList);
  for (const f of newFiles) {
    if (f.size > 5 * 1024 * 1024) {
      err.textContent = `"${f.name}" ist zu groß (max. 5 MB).`;
      err.style.display = 'block';
      return;
    }
  }
  scdFiles = scdFiles.concat(newFiles).slice(0, 5);
  err.style.display = 'none';
  const thumbs = document.getElementById('scdThumbs');
  thumbs.innerHTML = '';
  scdFiles.forEach(f => {
    const img = document.createElement('img');
    img.className = 'scd-thumb';
    img.src = URL.createObjectURL(f);
    thumbs.appendChild(img);
  });
}

// Drag and drop support
document.addEventListener('DOMContentLoaded', () => {
  const zone = document.getElementById('scdUploadZone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--blue)'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.style.borderColor = '';
    scdHandleFiles(e.dataTransfer.files);
  });
});

async function scdSubmit() {
  const err = document.getElementById('scdErr3');
  if (scdFiles.length === 0) {
    err.textContent = 'Bitte laden Sie mindestens ein Foto hoch.';
    err.style.display = 'block';
    return;
  }
  err.style.display = 'none';

  const btn = document.getElementById('scdSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Wird gesendet...';

  const fd = new FormData();
  fd.append('fahrer_name',     document.getElementById('scdFahrerName').value.trim());
  fd.append('firma',           document.getElementById('scdFirma').value.trim());
  fd.append('fahrer_telefon',  document.getElementById('scdTelefon').value.trim());
  fd.append('fahrer_email',    document.getElementById('scdEmail').value.trim());
  fd.append('kennzeichen',     document.getElementById('scdKennzeichen').value.trim().toUpperCase());
  fd.append('fahrzeugtyp',     document.getElementById('scdFahrzeugtyp').value.trim());
  fd.append('baujahr',         document.getElementById('scdBaujahr').value.trim());
  fd.append('unfall_datum',    document.getElementById('scdDatum').value);
  fd.append('unfall_uhrzeit',  document.getElementById('scdUhrzeit').value);
  fd.append('unfall_ort',      document.getElementById('scdOrt').value.trim());
  fd.append('fahrbereit',      scdGetToggle('scdFahrbereit') || 'nein');
  fd.append('polizei_gerufen', scdGetToggle('scdPolizei') || 'nein');
  fd.append('unfallgegner',    scdGetToggle('scdGegner') || 'nein');
  fd.append('beschreibung',    document.getElementById('scdBeschreibung').value.trim());
  scdFiles.forEach(f => fd.append('photos', f));

  try {
    const res = await fetch('/api/schaden', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
      document.getElementById('scdFallNr').textContent = data.fall_nr;
      document.querySelectorAll('.scd-step').forEach(s => s.classList.remove('active'));
      document.getElementById('scdSuccess').classList.add('active');
      document.getElementById('scdProgress').style.display = 'none';
      document.getElementById('scd-form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      err.textContent = data.error || 'Fehler beim Senden. Bitte versuchen Sie es erneut.';
      err.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Schaden melden →';
    }
  } catch (e) {
    err.textContent = 'Verbindungsfehler. Bitte versuchen Sie es erneut.';
    err.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Schaden melden →';
  }
}
</script>
```

- [ ] **Step 2: Verify the full form flow manually**

1. Open http://localhost:8000/schaden
2. Click „Schaden melden" hero button — page scrolls to form
3. Click „Weiter →" without filling fields — error message appears
4. Fill Step 1 fields, click „Weiter →" — advances to Step 2, progress bar dot 1 turns green
5. Fill Step 2 fields, toggle „Ja" for Fahrbereit, click „Weiter →" — advances to Step 3
6. Click „← Zurück" — goes back to Step 2, data preserved
7. Add a photo in Step 3 — thumbnail appears
8. Click „Schaden melden →" — submits (in test: check terminal for `✓ Schaden SCH-...`)
9. Success screen shows with fall number

- [ ] **Step 3: Commit**

```bash
git add schaden.html
git commit -m "feat: add 3-step form JavaScript with validation, photo preview, and submit"
```

---

## Task 9: `index.html` — Dashboard Schäden panel + sidebar item

**Files:**
- Modify: `index.html` — dashboard sidebar + main panel area

- [ ] **Step 1: Add sidebar item for Schäden**

In `index.html`, find the dashboard sidebar section that contains `dsb-lbl` "Prozess" (around line 1556). After the "Fahrzeuge" section and before the "Prozess" section, add a new section:

Find:
```html
      <div class="dsb-sec">
        <div class="dsb-lbl">Prozess</div>
```

Insert before it:
```html
      <div class="dsb-sec">
        <div class="dsb-lbl">Schäden</div>
        <div class="dsb-item" onclick="showPanel('dSch',this)"><span class="di">🚨</span><span>Schäden</span></div>
      </div>
```

- [ ] **Step 2: Add the Schäden panel HTML**

In `index.html`, find the closing `</div>` of the last dashboard panel (search for `id="dUsers"` panel's closing div) and after it, before `</div><!-- end dash-main -->`, insert:

```html
      <div class="dp" id="dSch">
        <div class="dh">Schäden</div>
        <div id="dSchDate" class="dsub">—</div>
        <div class="kpi-row" style="margin-bottom:24px">
          <div class="kpi-card"><div class="kpi-val" id="schTotal">—</div><div class="kpi-lbl">Gesamt</div></div>
          <div class="kpi-card"><div class="kpi-val" id="schNeu">—</div><div class="kpi-lbl">Neu</div></div>
          <div class="kpi-card"><div class="kpi-val" id="schInProgress">—</div><div class="kpi-lbl">In Bearbeitung</div></div>
        </div>
        <div style="overflow-x:auto">
          <table class="dt" id="schTable">
            <thead>
              <tr>
                <th>Fall-Nr</th><th>Datum</th><th>Fahrer</th><th>Firma</th>
                <th>Kennzeichen</th><th>Fahrbereit</th><th>Status</th>
              </tr>
            </thead>
            <tbody id="schBody"></tbody>
          </table>
        </div>
        <!-- Detail panel (hidden by default) -->
        <div id="schDetail" style="display:none;margin-top:24px;background:var(--f0);border-radius:12px;padding:24px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <div style="font-family:var(--fh);font-size:16px;font-weight:800;color:var(--t0)" id="schDetailTitle">—</div>
            <button onclick="document.getElementById('schDetail').style.display='none'" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--t3)">×</button>
          </div>
          <div id="schDetailBody"></div>
        </div>
      </div>
```

- [ ] **Step 3: Add Schäden JS to `index.html` script section**

In `index.html`, find the large script section at the bottom (before closing `</body>`). After the existing `loadDash` or similar function, add:

```javascript
async function loadSchaeden() {
  const today = new Date().toLocaleDateString('de-DE', {weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  document.getElementById('dSchDate').textContent = today;
  try {
    const rows = await fetch('/api/schaeden').then(r => r.json());
    document.getElementById('schTotal').textContent = rows.length;
    document.getElementById('schNeu').textContent = rows.filter(r => r.status === 'Neu').length;
    document.getElementById('schInProgress').textContent = rows.filter(r => r.status === 'In Bearbeitung').length;
    const tbody = document.getElementById('schBody');
    tbody.innerHTML = '';
    rows.forEach(row => {
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.onclick = () => showSchDetail(row);
      const fbBadge = row.fahrbereit
        ? '<span style="background:#d1fae5;color:#065f46;font-size:11px;padding:2px 8px;border-radius:4px;font-weight:700">✓ Ja</span>'
        : '<span style="background:#fee2e2;color:#991b1b;font-size:11px;padding:2px 8px;border-radius:4px;font-weight:700">✗ Nein</span>';
      const statusColors = {'Neu':'#dbeafe','In Bearbeitung':'#fef9c3','Abgeschlossen':'#d1fae5'};
      const statusSelect = `<select onchange="patchSchadenStatus(${row.id},this.value)" onclick="event.stopPropagation()" style="font-size:11px;padding:3px 6px;border-radius:6px;border:1px solid var(--f2);background:${statusColors[row.status]||'#fff'}">
        ${['Neu','In Bearbeitung','Abgeschlossen'].map(s => `<option${s===row.status?' selected':''}>${s}</option>`).join('')}
      </select>`;
      const date = new Date(row.created_at).toLocaleDateString('de-DE');
      tr.innerHTML = `<td><strong>${row.fall_nr||'—'}</strong></td><td>${date}</td><td>${row.fahrer_name}</td><td>${row.firma||'—'}</td><td>${row.kennzeichen}</td><td>${fbBadge}</td><td>${statusSelect}</td>`;
      tbody.appendChild(tr);
    });
  } catch(e) { console.error('loadSchaeden:', e); }
}

function showSchDetail(row) {
  document.getElementById('schDetailTitle').textContent = (row.fall_nr || '—') + ' · ' + row.kennzeichen;
  document.getElementById('schDetailBody').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">
      <div><strong>Fahrer:</strong> ${row.fahrer_name}</div>
      <div><strong>Firma:</strong> ${row.firma||'—'}</div>
      <div><strong>Telefon:</strong> ${row.fahrer_telefon}</div>
      <div><strong>E-Mail:</strong> ${row.fahrer_email||'—'}</div>
      <div><strong>Kennzeichen:</strong> ${row.kennzeichen}</div>
      <div><strong>Fahrzeugtyp:</strong> ${row.fahrzeugtyp||'—'}</div>
      <div><strong>Baujahr:</strong> ${row.baujahr||'—'}</div>
      <div><strong>Fahrbereit:</strong> ${row.fahrbereit ? '✓ Ja' : '✗ Nein'}</div>
      <div><strong>Unfalldatum:</strong> ${row.unfall_datum||'—'} ${row.unfall_uhrzeit||''}</div>
      <div><strong>Unfallort:</strong> ${row.unfall_ort||'—'}</div>
      <div><strong>Polizei:</strong> ${row.polizei_gerufen ? 'Ja' : 'Nein'}</div>
      <div><strong>Unfallgegner:</strong> ${row.unfallgegner ? 'Ja' : 'Nein'}</div>
    </div>
    <div style="margin-top:12px;font-size:13px"><strong>Beschreibung:</strong><br><div style="margin-top:4px;padding:10px;background:#fff;border-radius:8px;line-height:1.6">${row.beschreibung}</div></div>`;
  document.getElementById('schDetail').style.display = 'block';
}

async function patchSchadenStatus(id, status) {
  await fetch('/api/schaeden/' + id + '/status', {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ status })
  });
}
```

Also, find the existing `showPanel` function and add a call to `loadSchaeden()` when the Schäden panel is shown. Find the `showPanel` function:

```javascript
function showPanel(id, el) {
```

The function body likely sets active panels. After finding it, ensure it calls `loadSchaeden()` when `id === 'dSch'`. Add inside `showPanel`:

```javascript
  if (id === 'dSch') loadSchaeden();
```

- [ ] **Step 4: Verify dashboard Schäden tab**

1. Open http://localhost:8000/intern → login
2. Click „Schäden" in sidebar → panel shows with table
3. If you have test data in DB, rows appear with status dropdown
4. Click a row → detail panel expands below the table

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add Schäden panel to dashboard with status management"
```

---

## Task 10: `index.html` — Nav + footer link to `/schaden`

**Files:**
- Modify: `index.html` — nav links + footer

- [ ] **Step 1: Add nav link**

In `index.html`, find the `<ul class="nav-links">` section (around line 30). After the last `<li>` and before `</ul>`, add:

```html
      <li><a href="/schaden">Schadenmanagement</a></li>
```

- [ ] **Step 2: Add mobile menu link**

In `index.html`, find the mobile menu `<div class="mob-menu"` section (around line 12). Add after the last `<a>` and before `</div>`:

```html
  <a href="/schaden" onclick="closeMob()">Schadenmanagement</a>
```

- [ ] **Step 3: Add footer link**

In `index.html`, find the footer `<div class="f-col"><h5>Service</h5>` section (around line 1455). Add inside the `<ul>`:

```html
        <li><a href="/schaden">Schadenmanagement</a></li>
```

- [ ] **Step 4: Verify links**

Open http://localhost:8000 → confirm „Schadenmanagement" appears in nav. Click it → navigates to `/schaden`.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add Schadenmanagement link to nav and footer"
```

---

## Self-Review

**Spec coverage check:**
- [x] `/schaden` separate page — Task 4
- [x] Hero section — Task 5
- [x] 8 service cards — Task 5
- [x] 5-step prozess timeline — Task 6
- [x] CTA section — Task 6
- [x] 3-step form: Step 1 Kontakt/Fahrzeug — Task 7
- [x] 3-step form: Step 2 Schadensdetails + Ja/Nein toggles — Task 7
- [x] 3-step form: Step 3 photo upload (mandatory, drag+drop, previews) — Task 7
- [x] Form JS: validation, step navigation, data preservation — Task 8
- [x] Form JS: submit via FormData, success screen with fall_nr — Task 8
- [x] `schaeden` DB table — Task 1
- [x] `POST /api/schaden`: validate, generate fall_nr, save, dual email + photo attachments — Task 2
- [x] `GET /api/schaeden`: requireAuth — Task 3
- [x] `PATCH /api/schaeden/:id/status`: requireAuth — Task 3
- [x] Dashboard Schäden tab with KPIs, table, status dropdown, row detail — Task 9
- [x] Nav + footer links — Task 10
- [x] Fall-Nr uses MAX(id)+1, not COUNT(*) — Task 2
- [x] Photos as email attachments only (no disk storage) — Task 2

**Placeholder scan:** No TBD or TODO in any task. All code blocks complete.

**Type consistency:**
- `fall_nr` used consistently across: DB column, server INSERT/UPDATE, JSON response `{ fall_nr }`, JS `data.fall_nr`, dashboard `row.fall_nr`
- `fahrbereit` sent as string `'ja'/'nein'` from form → converted to boolean in server `fahrbereit === 'ja'` ✓
- `loadSchaeden()` called in `showPanel` when `id === 'dSch'` — consistent name ✓
