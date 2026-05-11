# Schema 1 + Schema 2: Mandantenfähigkeit & Fahrer-Onboarding — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multi-tenancy DB structure (fuhrparks, fahrer) and a full invite-based Fahrer login/onboarding flow so drivers can log in, and the damage form at `/schaden` is pre-filled with their data.

**Architecture:** New tables (`fuhrparks`, `fahrer`, `fuhrpark_users`) are added to the existing PostgreSQL DB via `initDB()`. A new Express router (`routes/fahrer.js`) handles all Fahrer and Fuhrpark API routes. The Fahrer router is mounted BEFORE `express.static` so that `GET /schaden` can enforce `requireFahrerAuth` before the static file is served.

**Tech Stack:** Node.js, Express 5, PostgreSQL (pg Pool), express-session + connect-pg-simple, crypto (built-in), Resend SDK, HTML/CSS (vanilla, no framework)

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `db/index.js` | Add CREATE TABLE for fuhrparks, fuhrpark_users, fahrer + ALTER TABLE schaeden |
| Create | `middleware/requireFahrerAuth.js` | Session check for Fahrer routes |
| Create | `routes/fahrer.js` | All Fahrer + Fuhrpark routes |
| Modify | `server.js` | Mount fahrRoutes BEFORE express.static |
| Modify | `routes/schaden.js` | Add fahrer_id + fuhrpark_id to INSERT |
| Create | `fahrer-login.html` | Login page for Fahrer |
| Create | `fahrer-aktivieren.html` | Account activation + set password |
| Create | `fahrer-passwort.html` | Forgot password + reset (dual-purpose page) |
| Create | `fahrer-token-fehler.html` | Error page for expired/invalid tokens |

---

## Task 1: DB Schema

**Files:**
- Modify: `db/index.js`

**Spec note:** The existing `users` table stores `password_hash` and `salt` as separate columns. The `fahrer` table must match this pattern — the spec omitted `salt`, this plan corrects that.

- [ ] **Step 1: Add new tables to `initDB()` in `db/index.js`**

Open `db/index.js`. After the existing `werkstaetten` CREATE TABLE block (before the seed check), add:

```javascript
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fuhrparks (
      id            SERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      kontakt_email TEXT,
      telefon       TEXT,
      aktiv         BOOLEAN NOT NULL DEFAULT true,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fuhrpark_users (
      id            SERIAL PRIMARY KEY,
      fuhrpark_id   INTEGER NOT NULL REFERENCES fuhrparks(id),
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      aktiv         BOOLEAN NOT NULL DEFAULT false,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fahrer (
      id                 SERIAL PRIMARY KEY,
      fuhrpark_id        INTEGER NOT NULL REFERENCES fuhrparks(id),
      vorname            TEXT NOT NULL,
      nachname           TEXT NOT NULL,
      telefon            TEXT,
      email              TEXT UNIQUE,
      password_hash      TEXT,
      salt               TEXT,
      invite_token       TEXT,
      invite_expires_at  TIMESTAMPTZ,
      reset_token        TEXT,
      reset_expires_at   TIMESTAMPTZ,
      aktiv              BOOLEAN NOT NULL DEFAULT false,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    ALTER TABLE schaeden
      ADD COLUMN IF NOT EXISTS fahrer_id   INTEGER REFERENCES fahrer(id),
      ADD COLUMN IF NOT EXISTS fuhrpark_id INTEGER REFERENCES fuhrparks(id)
  `);
```

- [ ] **Step 2: Start the server and verify DB init succeeds**

```bash
node server.js
```

Expected in console:
```
✓ DB ready
✓ IMD Fleet Services server running → http://localhost:8000
```

No errors. If you see `column "fahrer_id" of relation "schaeden" already exists` — that means `IF NOT EXISTS` is not supported on your PG version. Wrap the ALTER in a DO block:

```sql
DO $$ BEGIN
  ALTER TABLE schaeden ADD COLUMN fahrer_id INTEGER REFERENCES fahrer(id);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
```

- [ ] **Step 3: Verify tables were created**

```bash
node -e "
const { pool } = require('./db');
pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema=\\'public\\' ORDER BY table_name')
  .then(r => { console.log(r.rows.map(x=>x.table_name)); pool.end(); });
"
```

Expected output includes: `fahrer`, `fuhrpark_users`, `fuhrparks`, `schaeden`, `session`, `submissions`, `users`, `werkstaetten`

- [ ] **Step 4: Commit**

```bash
git add db/index.js
git commit -m "feat: add fuhrparks, fahrer, fuhrpark_users tables + extend schaeden"
```

---

## Task 2: requireFahrerAuth Middleware

**Files:**
- Create: `middleware/requireFahrerAuth.js`

- [ ] **Step 1: Create the middleware**

```javascript
// middleware/requireFahrerAuth.js
function requireFahrerAuth(req, res, next) {
  if (req.session && req.session.fahrerId) return next();
  if (req.accepts('html')) return res.redirect('/fahrer/login');
  res.status(401).json({ error: 'Nicht eingeloggt' });
}

module.exports = requireFahrerAuth;
```

- [ ] **Step 2: Verify the file exists and exports correctly**

```bash
node -e "const m = require('./middleware/requireFahrerAuth'); console.log(typeof m);"
```

Expected: `function`

- [ ] **Step 3: Commit**

```bash
git add middleware/requireFahrerAuth.js
git commit -m "feat: add requireFahrerAuth middleware"
```

---

## Task 3: Fuhrpark + Fahrer Routes (Part 1 — IMD Admin CRUD)

**Files:**
- Create: `routes/fahrer.js`
- Modify: `server.js`

This task creates the file and adds the IMD Admin routes (list, create, deactivate, anonymize for Fahrer; list + create for Fuhrparks). Login/activation routes come in later tasks.

- [ ] **Step 1: Create `routes/fahrer.js` with IMD Admin routes**

```javascript
// routes/fahrer.js
'use strict';

const express        = require('express');
const router         = express.Router();
const crypto         = require('crypto');
const path           = require('path');
const { Resend }     = require('resend');
const { pool, hashPassword, verifyPassword } = require('../db');
const requireAdmin      = require('../middleware/requireAdmin');
const requireFahrerAuth = require('../middleware/requireFahrerAuth');

// ── FUHRPARKS ─────────────────────────────────────────────────────────────────

router.get('/api/fuhrparks', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM fuhrparks ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/fuhrparks', requireAdmin, async (req, res) => {
  const { name, kontakt_email, telefon } = req.body;
  if (!name) return res.status(400).json({ error: 'name erforderlich' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO fuhrparks (name, kontakt_email, telefon) VALUES ($1,$2,$3) RETURNING *',
      [name, kontakt_email || null, telefon || null]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── FAHRER — IMD Admin CRUD ───────────────────────────────────────────────────

router.get('/api/fahrer', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT f.id, f.vorname, f.nachname, f.telefon, f.email, f.aktiv, f.created_at,
             fp.name AS fuhrpark_name, fp.id AS fuhrpark_id
      FROM fahrer f
      JOIN fuhrparks fp ON fp.id = f.fuhrpark_id
      ORDER BY f.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/fahrer', requireAdmin, async (req, res) => {
  const { vorname, nachname, email, telefon, fuhrpark_id } = req.body;
  if (!vorname || !nachname || !email || !fuhrpark_id) {
    return res.status(400).json({ error: 'vorname, nachname, email, fuhrpark_id erforderlich' });
  }
  const invite_token      = crypto.randomBytes(32).toString('hex');
  const invite_expires_at = new Date(Date.now() + 72 * 60 * 60 * 1000);
  try {
    const { rows } = await pool.query(
      `INSERT INTO fahrer (fuhrpark_id, vorname, nachname, telefon, email, invite_token, invite_expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [fuhrpark_id, vorname, nachname, telefon || null, email, invite_token, invite_expires_at]
    );
    const BASE_URL       = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`;
    const activationLink = `${BASE_URL}/fahrer/aktivieren?token=${invite_token}`;
    const resend         = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from:    'IMD Fleet Services <schaden@imdfleet.de>',
      to:      email,
      subject: 'Einladung: IMD Fleet Services — Konto aktivieren',
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:Arial,sans-serif;background:#f4f7fb;padding:20px">
        <div style="background:#fff;border-radius:8px;padding:32px;max-width:500px;margin:0 auto">
          <p style="color:#0c2461;font-size:20px;font-weight:800;margin:0 0 16px">IMD Fleet Services</p>
          <p>Hallo ${vorname},</p>
          <p>Sie wurden eingeladen, die IMD Fleet Services Plattform zu nutzen. Klicken Sie auf den folgenden Link, um Ihr Konto zu aktivieren und ein Passwort zu setzen:</p>
          <p style="margin:24px 0">
            <a href="${activationLink}" style="background:#0c2461;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700">Konto aktivieren →</a>
          </p>
          <p style="color:#888;font-size:13px">Der Link ist 72 Stunden gültig. Falls Sie diese E-Mail nicht angefordert haben, ignorieren Sie sie bitte.</p>
        </div>
      </body></html>`,
    });
    res.json({ success: true, id: rows[0].id });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'E-Mail bereits vergeben' });
    res.status(500).json({ error: err.message });
  }
});

router.patch('/api/fahrer/:id/status', requireAdmin, async (req, res) => {
  const { aktiv } = req.body;
  const id = parseInt(req.params.id, 10);
  if (typeof aktiv !== 'boolean') return res.status(400).json({ error: 'aktiv (boolean) erforderlich' });
  try {
    await pool.query('UPDATE fahrer SET aktiv=$1 WHERE id=$2', [aktiv, id]);
    if (!aktiv) {
      await pool.query(`DELETE FROM session WHERE sess::jsonb->>'fahrerId' = $1`, [String(id)]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/fahrer/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await pool.query(
      `UPDATE fahrer SET vorname='Gelöscht', nachname='Gelöscht', telefon=NULL,
       email=NULL, password_hash=NULL, salt=NULL, invite_token=NULL,
       invite_expires_at=NULL, reset_token=NULL, reset_expires_at=NULL
       WHERE id=$1`,
      [id]
    );
    await pool.query(`DELETE FROM session WHERE sess::jsonb->>'fahrerId' = $1`, [String(id)]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── FAHRER — Activation, Login, Reset (added in Tasks 4–6) ───────────────────

module.exports = router;
```

- [ ] **Step 2: Mount in `server.js` BEFORE `express.static`**

In `server.js`, add the import at the top with the other requires:

```javascript
const fahrerRoutes = require('./routes/fahrer');
```

Then mount it BEFORE `app.use(express.static(...))`:

```javascript
app.use(fahrerRoutes);          // ← add this line

// Static files served after maintenance gate so protected assets require auth
app.use(express.static(path.join(__dirname)));
```

The final order in server.js should be:
```
app.use(fahrerRoutes);
app.use(express.static(...));
app.use(authRoutes);
app.use(adminRoutes);
app.use(schadenRoutes);
app.use(publicRoutes);
```

- [ ] **Step 3: Add `BASE_URL` to `.env`**

Open `.env` and add:
```
BASE_URL=http://localhost:8000
```

On Hetzner, set `BASE_URL=https://app.imdfleet.de` (or whatever the production domain is).

- [ ] **Step 4: Restart server and test Fuhrpark routes**

```bash
node server.js
```

Create a Fuhrpark (requires IMD Admin session — log in first via `/intern`):
```bash
curl -s -X POST http://localhost:8000/api/fuhrparks \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{"name":"Muster GmbH","kontakt_email":"manager@muster.de","telefon":"030123456"}'
```

Expected: `{"id":1,"name":"Muster GmbH","kontakt_email":"manager@muster.de",...}`

```bash
curl -s http://localhost:8000/api/fuhrparks -b "your-session-cookie"
```

Expected: JSON array with the created Fuhrpark.

- [ ] **Step 5: Commit**

```bash
git add routes/fahrer.js server.js .env
git commit -m "feat: add Fuhrpark + Fahrer CRUD routes, mount before static"
```

---

## Task 4: Fahrer Activation Flow

**Files:**
- Modify: `routes/fahrer.js` (add activation routes)
- Create: `fahrer-aktivieren.html`
- Create: `fahrer-token-fehler.html`

- [ ] **Step 1: Add activation routes to `routes/fahrer.js`**

Add before `module.exports = router;`:

```javascript
// ── FAHRER — Konto aktivieren ─────────────────────────────────────────────────

router.get('/fahrer/aktivieren', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.redirect('/fahrer/login');
  try {
    const { rows } = await pool.query(
      `SELECT id FROM fahrer WHERE invite_token=$1 AND aktiv=false AND invite_expires_at > NOW()`,
      [token]
    );
    if (!rows.length) return res.sendFile(path.join(__dirname, '..', 'fahrer-token-fehler.html'));
    res.sendFile(path.join(__dirname, '..', 'fahrer-aktivieren.html'));
  } catch (err) {
    res.status(500).send('Interner Fehler');
  }
});

router.post('/api/fahrer/aktivieren', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: 'Token und Passwort (mind. 8 Zeichen) erforderlich' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, fuhrpark_id FROM fahrer WHERE invite_token=$1 AND aktiv=false AND invite_expires_at > NOW()`,
      [token]
    );
    if (!rows.length) return res.status(400).json({ error: 'Token ungültig oder abgelaufen' });
    const { id, fuhrpark_id } = rows[0];
    const { hash, salt } = await hashPassword(password);
    await pool.query(
      `UPDATE fahrer SET password_hash=$1, salt=$2, aktiv=true,
       invite_token=NULL, invite_expires_at=NULL WHERE id=$3`,
      [hash, salt, id]
    );
    req.session.fahrerId  = id;
    req.session.fuhrparkId = fuhrpark_id;
    res.json({ success: true, redirect: '/schaden' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Step 2: Create `fahrer-aktivieren.html`**

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konto aktivieren — IMD Fleet Services</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f4fa; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #fff; border-radius: 16px; padding: 40px; max-width: 420px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .logo { font-size: 11px; font-weight: 800; letter-spacing: 0.18em; color: #0c2461; text-transform: uppercase; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 800; color: #0c2461; margin-bottom: 8px; }
    .sub { font-size: 14px; color: #546e8a; margin-bottom: 32px; }
    label { display: block; font-size: 12px; font-weight: 700; color: #0c2461; margin-bottom: 6px; }
    input { width: 100%; padding: 12px 14px; border: 1.5px solid #dde6f0; border-radius: 8px; font-size: 15px; color: #1a2644; outline: none; margin-bottom: 20px; }
    input:focus { border-color: #0c2461; }
    button { width: 100%; padding: 14px; background: #0c2461; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; }
    button:hover { background: #1a4c96; }
    .error { background: #fee2e2; color: #991b1b; border-radius: 8px; padding: 12px; font-size: 13px; margin-bottom: 16px; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">IMD Fleet Services</div>
    <h1>Konto aktivieren</h1>
    <p class="sub">Wählen Sie ein Passwort für Ihr Konto.</p>
    <div class="error" id="error"></div>
    <form id="form">
      <input type="hidden" id="token" name="token">
      <label>Passwort <span style="color:#888;font-weight:400">(mind. 8 Zeichen)</span></label>
      <input type="password" id="password" name="password" minlength="8" required placeholder="Passwort wählen">
      <label>Passwort bestätigen</label>
      <input type="password" id="password2" required placeholder="Passwort wiederholen">
      <button type="submit">Konto aktivieren →</button>
    </form>
  </div>
  <script>
    const params = new URLSearchParams(location.search);
    document.getElementById('token').value = params.get('token') || '';

    document.getElementById('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw  = document.getElementById('password').value;
      const pw2 = document.getElementById('password2').value;
      const err = document.getElementById('error');
      if (pw !== pw2) { err.textContent = 'Passwörter stimmen nicht überein.'; err.style.display = 'block'; return; }
      err.style.display = 'none';
      const res = await fetch('/api/fahrer/aktivieren', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: document.getElementById('token').value, password: pw }),
      });
      const data = await res.json();
      if (data.success) { location.href = data.redirect; }
      else { err.textContent = data.error || 'Fehler beim Aktivieren.'; err.style.display = 'block'; }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Create `fahrer-token-fehler.html`**

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link abgelaufen — IMD Fleet Services</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f4fa; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #fff; border-radius: 16px; padding: 40px; max-width: 420px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.08); text-align: center; }
    .logo { font-size: 11px; font-weight: 800; letter-spacing: 0.18em; color: #0c2461; text-transform: uppercase; margin-bottom: 24px; }
    .icon { font-size: 40px; margin-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 800; color: #0c2461; margin-bottom: 8px; }
    p { font-size: 14px; color: #546e8a; line-height: 1.6; margin-bottom: 24px; }
    a { color: #0c2461; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">IMD Fleet Services</div>
    <div class="icon">⏱</div>
    <h1>Link abgelaufen</h1>
    <p>Dieser Link ist nicht mehr gültig. Er wurde bereits verwendet oder ist abgelaufen.<br>Bitte wenden Sie sich an IMD, um einen neuen Link zu erhalten.</p>
    <a href="/fahrer/login">← Zur Anmeldung</a>
  </div>
</body>
</html>
```

- [ ] **Step 4: Test the activation flow**

  1. Create a Fuhrpark via `POST /api/fuhrparks`
  2. Create a Fahrer via `POST /api/fahrer` (with a real email you can receive)
  3. Open the activation link from the email: `http://localhost:8000/fahrer/aktivieren?token=<token>`
  4. Verify the activation page loads
  5. Enter a password and submit
  6. Verify redirect to `/schaden` (will show the schaden form or a login page — depending on current auth setup)

  To test with an expired token, manually update in DB:
  ```sql
  UPDATE fahrer SET invite_expires_at = NOW() - INTERVAL '1 hour' WHERE id = 1;
  ```
  Then reload the link — should show `fahrer-token-fehler.html`.

- [ ] **Step 5: Commit**

```bash
git add routes/fahrer.js fahrer-aktivieren.html fahrer-token-fehler.html
git commit -m "feat: add Fahrer activation flow — invite token + password setup"
```

---

## Task 5: Fahrer Login / Logout + /api/fahrer/me

**Files:**
- Modify: `routes/fahrer.js` (add login/logout + me routes + GET /schaden)
- Create: `fahrer-login.html`

- [ ] **Step 1: Add login, logout, /me, and GET /schaden routes to `routes/fahrer.js`**

Add before `module.exports = router;`:

```javascript
// ── FAHRER — Login / Logout / Me ──────────────────────────────────────────────

router.get('/fahrer/login', (req, res) => {
  if (req.session && req.session.fahrerId) return res.redirect('/schaden');
  res.sendFile(path.join(__dirname, '..', 'fahrer-login.html'));
});

router.post('/api/fahrer/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });
  try {
    const { rows } = await pool.query(
      'SELECT id, fuhrpark_id, password_hash, salt, aktiv FROM fahrer WHERE email=$1',
      [email.trim().toLowerCase()]
    );
    // Use same error message for both "not found" and "wrong password" to prevent enumeration
    if (!rows.length || !rows[0].aktiv || !rows[0].password_hash) {
      return res.status(401).json({ error: 'E-Mail oder Passwort falsch' });
    }
    const { id, fuhrpark_id, password_hash, salt } = rows[0];
    const valid = await verifyPassword(password, password_hash, salt);
    if (!valid) return res.status(401).json({ error: 'E-Mail oder Passwort falsch' });
    req.session.fahrerId  = id;
    req.session.fuhrparkId = fuhrpark_id;
    res.json({ success: true, redirect: '/schaden' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/fahrer/logout', requireFahrerAuth, (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

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

// ── Schaden form — requires Fahrer session ────────────────────────────────────
// Mounted BEFORE express.static in server.js so this route takes priority

router.get('/schaden', requireFahrerAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'schaden.html'));
});
```

- [ ] **Step 2: Create `fahrer-login.html`**

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anmelden — IMD Fleet Services</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f4fa; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #fff; border-radius: 16px; padding: 40px; max-width: 420px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .logo { font-size: 11px; font-weight: 800; letter-spacing: 0.18em; color: #0c2461; text-transform: uppercase; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 800; color: #0c2461; margin-bottom: 8px; }
    .sub { font-size: 14px; color: #546e8a; margin-bottom: 32px; }
    label { display: block; font-size: 12px; font-weight: 700; color: #0c2461; margin-bottom: 6px; }
    input { width: 100%; padding: 12px 14px; border: 1.5px solid #dde6f0; border-radius: 8px; font-size: 15px; color: #1a2644; outline: none; margin-bottom: 20px; }
    input:focus { border-color: #0c2461; }
    button { width: 100%; padding: 14px; background: #0c2461; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; margin-bottom: 16px; }
    button:hover { background: #1a4c96; }
    .forgot { text-align: center; font-size: 13px; }
    .forgot a { color: #546e8a; text-decoration: none; }
    .forgot a:hover { color: #0c2461; }
    .error { background: #fee2e2; color: #991b1b; border-radius: 8px; padding: 12px; font-size: 13px; margin-bottom: 16px; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">IMD Fleet Services</div>
    <h1>Anmelden</h1>
    <p class="sub">Schadenmeldung einreichen</p>
    <div class="error" id="error"></div>
    <form id="form">
      <label>E-Mail-Adresse</label>
      <input type="email" id="email" required placeholder="ihre@email.de" autocomplete="email">
      <label>Passwort</label>
      <input type="password" id="password" required placeholder="Passwort" autocomplete="current-password">
      <button type="submit">Anmelden →</button>
    </form>
    <div class="forgot"><a href="/fahrer/passwort-vergessen">Passwort vergessen?</a></div>
  </div>
  <script>
    document.getElementById('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = document.getElementById('error');
      err.style.display = 'none';
      const res = await fetch('/api/fahrer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:    document.getElementById('email').value.trim(),
          password: document.getElementById('password').value,
        }),
      });
      const data = await res.json();
      if (data.success) { location.href = data.redirect; }
      else { err.textContent = data.error || 'Anmeldung fehlgeschlagen.'; err.style.display = 'block'; }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Test the full login flow**

  1. Navigate to `http://localhost:8000/fahrer/login`
  2. Verify the login page renders
  3. Navigate to `http://localhost:8000/schaden` without being logged in
  4. Verify redirect to `/fahrer/login`
  5. Log in with an activated Fahrer account
  6. Verify redirect to `/schaden`
  7. Call `GET /api/fahrer/me` and verify it returns Fahrer data

  ```bash
  curl -s http://localhost:8000/api/fahrer/me -b "your-session-cookie"
  ```

  Expected: `{"id":1,"vorname":"Max","nachname":"Mustermann","email":"...","fuhrpark_name":"Muster GmbH"}`

- [ ] **Step 4: Commit**

```bash
git add routes/fahrer.js fahrer-login.html
git commit -m "feat: add Fahrer login/logout, /api/fahrer/me, GET /schaden with auth"
```

---

## Task 6: Password Reset Flow

**Files:**
- Modify: `routes/fahrer.js` (add reset routes)
- Create: `fahrer-passwort.html`

- [ ] **Step 1: Add reset routes to `routes/fahrer.js`**

Add before `module.exports = router;`:

```javascript
// ── FAHRER — Passwort vergessen / Reset ───────────────────────────────────────

router.get('/fahrer/passwort-vergessen', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'fahrer-passwort.html'));
});

router.post('/api/fahrer/reset-anfragen', async (req, res) => {
  // Respond immediately regardless — prevents email enumeration
  res.json({ success: true, message: 'Wenn die E-Mail bekannt ist, wurde ein Link gesendet.' });
  const { email } = req.body;
  if (!email) return;
  try {
    const { rows } = await pool.query(
      'SELECT id, vorname FROM fahrer WHERE email=$1 AND aktiv=true',
      [email.trim().toLowerCase()]
    );
    if (!rows.length) return;
    const { id, vorname } = rows[0];
    const reset_token      = crypto.randomBytes(32).toString('hex');
    const reset_expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await pool.query(
      'UPDATE fahrer SET reset_token=$1, reset_expires_at=$2 WHERE id=$3',
      [reset_token, reset_expires_at, id]
    );
    const BASE_URL  = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`;
    const resetLink = `${BASE_URL}/fahrer/passwort-reset?token=${reset_token}`;
    const resend    = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from:    'IMD Fleet Services <schaden@imdfleet.de>',
      to:      email,
      subject: 'Passwort zurücksetzen — IMD Fleet Services',
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:Arial,sans-serif;background:#f4f7fb;padding:20px">
        <div style="background:#fff;border-radius:8px;padding:32px;max-width:500px;margin:0 auto">
          <p style="color:#0c2461;font-size:20px;font-weight:800;margin:0 0 16px">IMD Fleet Services</p>
          <p>Hallo ${vorname},</p>
          <p>Sie haben eine Passwortzurücksetzung angefordert. Klicken Sie auf den folgenden Link:</p>
          <p style="margin:24px 0">
            <a href="${resetLink}" style="background:#0c2461;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700">Neues Passwort setzen →</a>
          </p>
          <p style="color:#888;font-size:13px">Der Link ist 15 Minuten gültig. Falls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail.</p>
        </div>
      </body></html>`,
    });
  } catch (err) {
    console.error('Reset-Anfrage Fehler:', err.message);
  }
});

router.get('/fahrer/passwort-reset', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.redirect('/fahrer/passwort-vergessen');
  try {
    const { rows } = await pool.query(
      'SELECT id FROM fahrer WHERE reset_token=$1 AND reset_expires_at > NOW() AND aktiv=true',
      [token]
    );
    if (!rows.length) return res.sendFile(path.join(__dirname, '..', 'fahrer-token-fehler.html'));
    res.sendFile(path.join(__dirname, '..', 'fahrer-passwort.html'));
  } catch (err) {
    res.status(500).send('Interner Fehler');
  }
});

router.post('/api/fahrer/reset', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: 'Token und Passwort (mind. 8 Zeichen) erforderlich' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT id, fuhrpark_id FROM fahrer WHERE reset_token=$1 AND reset_expires_at > NOW() AND aktiv=true',
      [token]
    );
    if (!rows.length) return res.status(400).json({ error: 'Token ungültig oder abgelaufen' });
    const { id, fuhrpark_id } = rows[0];
    const { hash, salt } = await hashPassword(password);
    await pool.query(
      'UPDATE fahrer SET password_hash=$1, salt=$2, reset_token=NULL, reset_expires_at=NULL WHERE id=$3',
      [hash, salt, id]
    );
    req.session.fahrerId  = id;
    req.session.fuhrparkId = fuhrpark_id;
    res.json({ success: true, redirect: '/schaden' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Step 2: Create `fahrer-passwort.html`**

This page serves two purposes depending on query param (`?token=` = reset, no param = forgot-password form).

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Passwort — IMD Fleet Services</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f4fa; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #fff; border-radius: 16px; padding: 40px; max-width: 420px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .logo { font-size: 11px; font-weight: 800; letter-spacing: 0.18em; color: #0c2461; text-transform: uppercase; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 800; color: #0c2461; margin-bottom: 8px; }
    .sub { font-size: 14px; color: #546e8a; margin-bottom: 32px; line-height: 1.5; }
    label { display: block; font-size: 12px; font-weight: 700; color: #0c2461; margin-bottom: 6px; }
    input { width: 100%; padding: 12px 14px; border: 1.5px solid #dde6f0; border-radius: 8px; font-size: 15px; color: #1a2644; outline: none; margin-bottom: 20px; }
    input:focus { border-color: #0c2461; }
    button { width: 100%; padding: 14px; background: #0c2461; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; margin-bottom: 16px; }
    button:hover { background: #1a4c96; }
    .back { text-align: center; font-size: 13px; }
    .back a { color: #546e8a; text-decoration: none; }
    .error { background: #fee2e2; color: #991b1b; border-radius: 8px; padding: 12px; font-size: 13px; margin-bottom: 16px; display: none; }
    .success { background: #dcfce7; color: #166534; border-radius: 8px; padding: 12px; font-size: 13px; margin-bottom: 16px; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">IMD Fleet Services</div>
    <div id="error" class="error"></div>
    <div id="success" class="success"></div>

    <!-- View A: forgot password (no token in URL) -->
    <div id="view-forgot">
      <h1>Passwort vergessen?</h1>
      <p class="sub">Geben Sie Ihre E-Mail-Adresse ein. Sie erhalten einen Link zum Zurücksetzen des Passworts.</p>
      <form id="forgot-form">
        <label>E-Mail-Adresse</label>
        <input type="email" id="forgot-email" required placeholder="ihre@email.de">
        <button type="submit">Link senden →</button>
      </form>
      <div class="back"><a href="/fahrer/login">← Zurück zur Anmeldung</a></div>
    </div>

    <!-- View B: set new password (token in URL) -->
    <div id="view-reset" style="display:none">
      <h1>Neues Passwort</h1>
      <p class="sub">Wählen Sie ein neues Passwort für Ihr Konto.</p>
      <form id="reset-form">
        <input type="hidden" id="reset-token">
        <label>Neues Passwort <span style="color:#888;font-weight:400">(mind. 8 Zeichen)</span></label>
        <input type="password" id="reset-password" minlength="8" required placeholder="Neues Passwort">
        <label>Passwort bestätigen</label>
        <input type="password" id="reset-password2" required placeholder="Passwort wiederholen">
        <button type="submit">Passwort speichern →</button>
      </form>
    </div>
  </div>

  <script>
    const params = new URLSearchParams(location.search);
    const token  = params.get('token');

    if (token) {
      document.getElementById('view-forgot').style.display = 'none';
      document.getElementById('view-reset').style.display  = 'block';
      document.getElementById('reset-token').value = token;
    }

    document.getElementById('forgot-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = document.getElementById('error');
      const ok  = document.getElementById('success');
      err.style.display = 'none';
      const res  = await fetch('/api/fahrer/reset-anfragen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: document.getElementById('forgot-email').value.trim() }),
      });
      const data = await res.json();
      ok.textContent  = data.message || 'Link wurde gesendet.';
      ok.style.display = 'block';
      document.getElementById('forgot-form').style.display = 'none';
    });

    document.getElementById('reset-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw  = document.getElementById('reset-password').value;
      const pw2 = document.getElementById('reset-password2').value;
      const err = document.getElementById('error');
      if (pw !== pw2) { err.textContent = 'Passwörter stimmen nicht überein.'; err.style.display = 'block'; return; }
      err.style.display = 'none';
      const res  = await fetch('/api/fahrer/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: document.getElementById('reset-token').value, password: pw }),
      });
      const data = await res.json();
      if (data.success) { location.href = data.redirect; }
      else { err.textContent = data.error || 'Fehler.'; err.style.display = 'block'; }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Test the reset flow**

  1. Navigate to `http://localhost:8000/fahrer/passwort-vergessen`
  2. Enter the Fahrer email → verify confirmation message appears
  3. Check the email received — click the reset link
  4. Verify the "Neues Passwort" form shows
  5. Enter new password → verify redirect to `/schaden`

- [ ] **Step 4: Commit**

```bash
git add routes/fahrer.js fahrer-passwort.html
git commit -m "feat: add Fahrer password reset flow via magic link"
```

---

## Task 7: Update /api/schaden to Include Fahrer Context

**Files:**
- Modify: `routes/schaden.js`

When a logged-in Fahrer submits a damage report, their `fahrerId` and `fuhrparkId` should be stored in `schaeden`. This is additive — existing unauthenticated submissions still work (both columns remain nullable).

- [ ] **Step 1: Update the INSERT in `routes/schaden.js`**

In `routes/schaden.js`, find the `insertResult` query (around line 405). Replace it with:

```javascript
    const fahrerId   = req.session && req.session.fahrerId   ? req.session.fahrerId   : null;
    const fuhrparkId = req.session && req.session.fuhrparkId ? req.session.fuhrparkId : null;

    const insertResult = await pool.query(
      `INSERT INTO schaeden
        (firma, fahrer_name, fahrer_email, fahrer_telefon, kennzeichen, fahrzeugtyp,
         baujahr, unfall_datum, unfall_uhrzeit, unfall_ort, fahrbereit, polizei_gerufen,
         unfallgegner, beschreibung, ip, fahrer_id, fuhrpark_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING id`,
      [
        firma, fahrer_name, fahrer_email, fahrer_telefon, kennzeichen, fahrzeugtyp,
        baujahr, unfall_datum, unfall_uhrzeit, unfall_ort,
        fahrbereit === 'ja', polizei_gerufen === 'ja', unfallgegner === 'ja',
        beschreibung, ip, fahrerId, fuhrparkId
      ]
    );
```

- [ ] **Step 2: Restart and submit a test damage report as a logged-in Fahrer**

  1. Log in as a Fahrer at `/fahrer/login`
  2. Submit a damage report at `/schaden`
  3. Verify in DB that the new row has `fahrer_id` and `fuhrpark_id` set:

  ```bash
  node -e "
  const { pool } = require('./db');
  pool.query('SELECT id, fall_nr, fahrer_id, fuhrpark_id FROM schaeden ORDER BY id DESC LIMIT 1')
    .then(r => { console.log(r.rows[0]); pool.end(); });
  "
  ```

  Expected: `{ id: N, fall_nr: 'SCH-2026-XXXX', fahrer_id: 1, fuhrpark_id: 1 }`

- [ ] **Step 3: Commit**

```bash
git add routes/schaden.js
git commit -m "feat: store fahrer_id + fuhrpark_id in schaeden on submission"
```

---

## Task 8: End-to-End Integration Test

Manual verification of the complete flow.

- [ ] **Step 1: Complete Fahrer onboarding flow**

  1. Log in to IMD Admin at `/intern`
  2. `POST /api/fuhrparks` — create "Test GmbH"
  3. `POST /api/fahrer` — create Fahrer with a real email
  4. Open activation email → click link → set password → verify redirect to `/schaden`
  5. Verify form at `/schaden` loads (Fahrer is authenticated)

- [ ] **Step 2: Verify /api/fahrer/me returns correct data**

  ```bash
  curl -s http://localhost:8000/api/fahrer/me -b "connect.sid=<session-cookie>"
  ```

  Expected: `{"id":1,"vorname":"Max","nachname":"Mustermann","fuhrpark_name":"Test GmbH",...}`

- [ ] **Step 3: Test logout**

  ```bash
  curl -s -X POST http://localhost:8000/api/fahrer/logout -b "connect.sid=<session-cookie>"
  ```

  Then navigate to `/schaden` — should redirect to `/fahrer/login`.

- [ ] **Step 4: Test deactivation + session invalidation**

  1. Log in as Fahrer — note session cookie
  2. As IMD Admin: `PATCH /api/fahrer/1/status` with `{"aktiv": false}`
  3. Make a request with the Fahrer session cookie — should return 401 or redirect

- [ ] **Step 5: Test DSGVO anonymization**

  ```bash
  curl -s -X DELETE http://localhost:8000/api/fahrer/1 -b "admin-session-cookie"
  ```

  Verify in DB:
  ```bash
  node -e "
  const { pool } = require('./db');
  pool.query('SELECT vorname, nachname, email FROM fahrer WHERE id=1')
    .then(r => { console.log(r.rows[0]); pool.end(); });
  "
  ```

  Expected: `{ vorname: 'Gelöscht', nachname: 'Gelöscht', email: null }`

- [ ] **Step 6: Verify schaeden FK integrity after anonymization**

  ```bash
  node -e "
  const { pool } = require('./db');
  pool.query('SELECT id, fall_nr, fahrer_id FROM schaeden WHERE fahrer_id=1')
    .then(r => { console.log(r.rows); pool.end(); });
  "
  ```

  Expected: Rows still exist with `fahrer_id=1` — no FK violation.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: Schema 1 + Schema 2 complete — Fahrer onboarding, login, reset, deactivation"
```
