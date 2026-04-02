// IMD Fleet Services — Server
require('dotenv').config();
const express   = require('express');
const multer    = require('multer');
const { Resend } = require('resend');
const { Pool }  = require('pg');
const session   = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path      = require('path');
const crypto    = require('crypto');
const PizZip    = require('pizzip');

// ── Password hashing (built-in scrypt, no extra deps) ─────────────────────────
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, hash) => {
      if (err) reject(err);
      else resolve({ hash: hash.toString('hex'), salt });
    });
  });
}
function verifyPassword(password, hash, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key.toString('hex') === hash);
    });
  });
}

const app  = express();
const port = process.env.PORT || 8000;
const upload = multer();

// ── PostgreSQL ────────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id          SERIAL PRIMARY KEY,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      firma       TEXT NOT NULL,
      name        TEXT NOT NULL,
      email       TEXT,
      telefon     TEXT NOT NULL,
      marke       TEXT,
      modell      TEXT,
      baujahr     TEXT,
      km          TEXT,
      fahrzeuge   TEXT,
      anmerkung   TEXT,
      status      TEXT DEFAULT 'Neu',
      ip          TEXT
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      username     TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      salt         TEXT NOT NULL,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `);
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
  // Seed admin from env vars if no users exist yet
  const { rows } = await pool.query('SELECT COUNT(*) FROM users');
  if (parseInt(rows[0].count) === 0) {
    const u = process.env.DASH_USER || 'admin';
    const p = process.env.DASH_PASS || 'imd2024';
    const { hash, salt } = await hashPassword(p);
    await pool.query('INSERT INTO users (username, password_hash, salt) VALUES ($1,$2,$3)', [u, hash, salt]);
    console.log(`✓ Admin user "${u}" seeded`);
  }
  console.log('✓ DB ready');
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(session({
  store: new pgSession({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'imd-fleet-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8h
}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── Resend ────────────────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ── Auth middleware ───────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// ── POST /api/login ───────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT password_hash, salt FROM users WHERE username=$1', [username]);
    if (!result.rows.length) return res.json({ success: false, error: 'Falscher Benutzername oder Passwort' });
    const { password_hash, salt } = result.rows[0];
    const valid = await verifyPassword(password, password_hash, salt);
    if (valid) { req.session.user = username; res.json({ success: true }); }
    else res.json({ success: false, error: 'Falscher Benutzername oder Passwort' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/logout ──────────────────────────────────────────────────────────
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ── GET /api/check-auth ───────────────────────────────────────────────────────
app.get('/api/check-auth', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.user), user: req.session.user || null });
});

// ── GET /api/stats ────────────────────────────────────────────────────────────
app.get('/api/stats', requireAuth, async (req, res) => {
  try {
    const [total, today, neu] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM submissions'),
      pool.query("SELECT COUNT(*) FROM submissions WHERE created_at > NOW() - INTERVAL '24 hours'"),
      pool.query("SELECT COUNT(*) FROM submissions WHERE status = 'Neu'")
    ]);
    res.json({
      total:  parseInt(total.rows[0].count),
      today:  parseInt(today.rows[0].count),
      neu:    parseInt(neu.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/submissions ──────────────────────────────────────────────────────
app.get('/api/submissions', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM submissions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/submissions/:id ────────────────────────────────────────────────
app.patch('/api/submissions/:id', requireAuth, async (req, res) => {
  try {
    const allowed = ['status','firma','name','email','telefon','marke','modell','baujahr','km','anmerkung'];
    const fields = allowed.filter(f => req.body[f] !== undefined);
    if (!fields.length) return res.json({ success: false, error: 'Keine Felder angegeben' });
    const set = fields.map((f, i) => `${f}=$${i + 1}`).join(', ');
    const vals = [...fields.map(f => req.body[f]), req.params.id];
    await pool.query(`UPDATE submissions SET ${set} WHERE id=$${vals.length}`, vals);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/users ────────────────────────────────────────────────────────────
app.get('/api/users', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT username, created_at FROM users ORDER BY created_at');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/users ───────────────────────────────────────────────────────────
app.post('/api/users', requireAuth, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ success: false, error: 'Benutzername und Passwort erforderlich' });
  try {
    const { hash, salt } = await hashPassword(password);
    await pool.query('INSERT INTO users (username, password_hash, salt) VALUES ($1,$2,$3)', [username, hash, salt]);
    res.json({ success: true });
  } catch (err) {
    if (err.code === '23505') return res.json({ success: false, error: 'Benutzername bereits vergeben' });
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/users/:username ───────────────────────────────────────────────
app.delete('/api/users/:username', requireAuth, async (req, res) => {
  if (req.params.username === req.session.user)
    return res.json({ success: false, error: 'Sie können sich nicht selbst löschen' });
  try {
    await pool.query('DELETE FROM users WHERE username=$1', [req.params.username]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/vertrag/export ──────────────────────────────────────────────────
app.post('/api/vertrag/export', requireAuth, (req, res) => {
  try {
    const { an_firmierung, ag_firma, ort_an, ort_ag, datum } = req.body;
    if (!ag_firma || !datum) return res.status(400).json({ error: 'Pflichtfelder fehlen' });

    const b64Path = '/etc/secrets/rahmenvertrag.b64';
    const docxPath = path.join(__dirname, 'Rahmenvertrag_Version1.docx');
    const fs = require('fs');
    const buf = fs.existsSync(b64Path)
      ? Buffer.from(fs.readFileSync(b64Path, 'utf8').trim(), 'base64')
      : fs.readFileSync(docxPath);
    const zip = new PizZip(buf);
    let xml = zip.file('word/document.xml').asText();

    const escXml = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const anFirm = an_firmierung || 'IMD Fleet Services';
    const ortAN  = ort_an  || 'Ort';
    const ortAG  = ort_ag  || 'Ort';

    xml = xml.replace('IMD Fleet Services [vollständige Firmierung + Adresse]',
      escXml(anFirm));
    xml = xml.replace('[Kunde / Unternehmen]', escXml(ag_firma));
    xml = xml.replace('Ort, Datum', escXml(`${ortAN}, ${datum}`));
    xml = xml.replace('Ort, Datum', escXml(`${ortAG}, ${datum}`));
    xml = xml.replace('[Auftraggeber]', escXml(ag_firma));

    zip.file('word/document.xml', xml);
    const output = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });

    const safeName = ag_firma.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="Rahmenvertrag_${safeName}.docx"`);
    res.send(output);
  } catch (err) {
    console.error('Vertrag export error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /intern ───────────────────────────────────────────────────────────────
app.get('/intern', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── POST /submit ──────────────────────────────────────────────────────────────
app.post('/submit', upload.none(), async (req, res) => {
  const {
    firma = '', name = '', email = '', telefon = '',
    marke = '', modell = '', baujahr = '', km = '',
    fahrzeuge = '', anmerkung = ''
  } = req.body;

  if (!firma || !name || !telefon) {
    return res.json({ success: false, error: 'Pflichtfelder fehlen (Firma, Name, Telefon)' });
  }

  const timestamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unbekannt';

  // Save to DB
  try {
    await pool.query(
      `INSERT INTO submissions (firma, name, email, telefon, marke, modell, baujahr, km, fahrzeuge, anmerkung, ip)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [firma, name, email, telefon, marke, modell, baujahr, km, fahrzeuge, anmerkung, ip]
    );
  } catch (dbErr) {
    console.error('DB error:', dbErr.message);
  }

  // Send email
  const html = `
<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;background:#f4f7fb;margin:0;padding:20px}
  .card{background:#fff;border-radius:8px;padding:32px;max-width:600px;margin:0 auto;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  h2{color:#0052A3;margin:0 0 8px}
  .meta{color:#536E94;font-size:13px;margin-bottom:24px}
  .section{background:#0052A3;color:#fff;padding:8px 12px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-top:20px;border-radius:4px 4px 0 0}
  table{width:100%;border-collapse:collapse}
  td{padding:10px 12px;border-bottom:1px solid #ECF1F8;font-size:14px;color:#09152A;vertical-align:top}
  td.lbl{width:38%;font-weight:600;color:#2E4666}
  .footer{margin-top:24px;font-size:12px;color:#8899B4;border-top:1px solid #DDE6F0;padding-top:12px}
</style></head><body>
<div class="card">
  <h2>Neue Fahrzeuganmeldung</h2>
  <p class="meta">Eingegangen am ${timestamp} &bull; IP: ${ip}</p>
  <div class="section">Unternehmen &amp; Kontakt</div>
  <table>
    <tr><td class="lbl">Firma</td><td>${firma}</td></tr>
    <tr><td class="lbl">Ansprechpartner</td><td>${name}</td></tr>
    <tr><td class="lbl">Telefon</td><td>${telefon}</td></tr>
    <tr><td class="lbl">E-Mail</td><td>${email || '—'}</td></tr>
  </table>
  <div class="section">Fahrzeugdaten</div>
  <table>
    <tr><td class="lbl">Marke</td><td>${marke || '—'}</td></tr>
    <tr><td class="lbl">Modell</td><td>${modell || '—'}</td></tr>
    <tr><td class="lbl">Baujahr</td><td>${baujahr || '—'}</td></tr>
    <tr><td class="lbl">Kilometerstand</td><td>${km ? km + ' km' : '—'}</td></tr>
    <tr><td class="lbl">Anzahl Fahrzeuge</td><td>${fahrzeuge || '—'}</td></tr>
  </table>
  <div class="section">Hinweise</div>
  <table>
    <tr><td class="lbl">Anmerkung</td><td>${anmerkung || '—'}</td></tr>
    <tr><td class="lbl">Zustimmung</td><td>✓ Ja</td></tr>
  </table>
  <div class="footer">Automatisch generiert durch das Kontaktformular auf imd-fleet-services.de</div>
</div></body></html>`;

  try {
    const { error } = await resend.emails.send({
      from:    'IMD Fleet Services <onboarding@resend.dev>',
      to:      process.env.RECIPIENT_EMAIL,
      replyTo: email || undefined,
      subject: `Neue Fahrzeuganmeldung — ${firma} (${marke} ${modell})`.trim(),
      html,
    });
    if (error) throw new Error(error.message);
    console.log(`[${timestamp}] ✓ ${firma} / ${name} → saved + email sent`);
    res.json({ success: true });
  } catch (err) {
    console.error(`[${timestamp}] ✗ Mail error:`, err.message);
    res.json({ success: false, error: 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es erneut.' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(port, () => {
    console.log(`\n✓ IMD Fleet Services server running → http://localhost:${port}\n`);
  });
}).catch(err => {
  console.error('DB init failed:', err.message);
  process.exit(1);
});
