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
let PDFDocument; try { PDFDocument = require('pdfkit'); } catch(_) { console.warn('pdfkit not installed — PDF generation disabled. Run: npm install'); }

// ── PDF Generation ────────────────────────────────────────────────────────────
function generateSchadenPDF(d) {
  if (!PDFDocument) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4', info: { Title: `Schadenmeldung ${d.fall_nr}`, Author: 'IMD Fleet Services' } });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width;
    const navy = '#0052A3', dark = '#09152A', gray = '#6B7B99', light = '#D0DCF0';

    // Header bar
    doc.rect(0, 0, W, 72).fill(navy);
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(16).text('IMD Fleet Services', 50, 18);
    doc.font('Helvetica').fontSize(10).fillColor('#A8C4E8').text('Schadenmeldung', 50, 40);
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#fff').text(d.fall_nr, W - 200, 20, { width: 150, align: 'right' });
    doc.font('Helvetica').fontSize(9).fillColor('#A8C4E8').text(d.timestamp, W - 200, 40, { width: 150, align: 'right' });

    doc.y = 92;

    function sec(title) {
      if (doc.y > doc.page.height - 150) doc.addPage();
      doc.moveDown(0.5);
      doc.fillColor(navy).font('Helvetica-Bold').fontSize(8).text(title.toUpperCase(), 50, doc.y, { characterSpacing: 0.8 });
      doc.moveDown(0.15);
      doc.moveTo(50, doc.y).lineTo(W - 50, doc.y).strokeColor(light).lineWidth(0.5).stroke();
      doc.moveDown(0.5);
    }

    function row(label, value) {
      const y0 = doc.y;
      doc.fillColor(gray).font('Helvetica').fontSize(9).text(label, 50, y0, { width: 145, lineBreak: false });
      doc.fillColor(dark).font('Helvetica').fontSize(9).text(value || '—', 200, y0, { width: W - 255 });
      if (doc.y < y0 + 13) doc.y = y0 + 13;
    }

    const fmtDe = iso => { if (!iso) return '—'; const [y,m,d2] = iso.split('-'); return `${d2}.${m}.${y}`; };

    sec('Fahrer & Fahrzeug');
    row('Name',         d.fahrer_name);
    row('Telefon',      d.fahrer_telefon);
    row('E-Mail',       d.fahrer_email);
    row('Unternehmen',  d.firma);
    row('Kennzeichen',  d.kennzeichen);
    if (d.fahrzeugtyp) row('Fahrzeugtyp', d.fahrzeugtyp);

    sec('Schadensdetails');
    row('Datum', fmtDe(d.unfall_datum) + (d.unfall_uhrzeit ? ', ' + d.unfall_uhrzeit + ' Uhr' : ''));
    row('Unfallort',    d.unfall_ort);
    row('Fahrbereit',   d.fahrbereit === 'ja' ? 'Ja' : 'Nein');
    row('Unfallgegner', d.unfallgegner === 'ja' ? 'Ja' : 'Nein');
    row('Beschreibung', d.beschreibung);

    if (d.werkstatt_name) {
      sec('Gewünschte Werkstatt (Wunsch des Fahrers)');
      row('Name',   d.werkstatt_name);
      if (d.werkstatt_email) row('E-Mail', d.werkstatt_email);
    }

    sec('Unterschrift des Fahrers');
    doc.fillColor(gray).font('Helvetica').fontSize(8.5)
       .text('Ich bestätige die Richtigkeit der obigen Angaben. Eine Reparaturfreigabe darf ausschließlich durch IMD Fleet Services erfolgen.', 50, doc.y, { width: W - 100 });
    doc.moveDown(0.8);

    if (d.signatureBase64 && d.signatureBase64.startsWith('data:image/png;base64,')) {
      try {
        const sigBuf = Buffer.from(d.signatureBase64.slice(22), 'base64');
        const sigY = doc.y;
        doc.image(sigBuf, 50, sigY, { width: 220, height: 80 });
        doc.y = sigY + 90;
      } catch (_) { /* skip */ }
    }

    doc.moveTo(50, doc.y).lineTo(270, doc.y).strokeColor(dark).lineWidth(0.5).stroke();
    doc.moveDown(0.3);
    doc.fillColor(gray).font('Helvetica').fontSize(8.5)
       .text(`${d.fahrer_name}  ·  ${new Date().toLocaleDateString('de-DE')}`, 50, doc.y);

    // Footer
    const footY = doc.page.height - 38;
    doc.moveTo(50, footY - 8).lineTo(W - 50, footY - 8).strokeColor(light).lineWidth(0.5).stroke();
    doc.fillColor('#9AA8BF').font('Helvetica').fontSize(7.5)
       .text('IMD Fleet Services  ·  imdfleet.de  ·  Automatisch erstellt', 50, footY - 2, { align: 'center', width: W - 100 });

    doc.end();
  });
}

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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS werkstaetten (
      id         SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      name       TEXT NOT NULL,
      city       TEXT,
      plz        TEXT,
      email      TEXT NOT NULL,
      services   TEXT,
      rating     NUMERIC(2,1) DEFAULT 5.0,
      aktiv      BOOLEAN DEFAULT true
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

// ── Maintenance Gate (session-based, works on iOS Safari) ─────────────────────
if (process.env.MAINTENANCE_PASS) {
  const MAINTENANCE_PUBLIC = ['/schaden', '/sw.js', '/manifest.json', '/icon-192.png', '/icon-512.png', '/logo_dark.png', '/logo_light.png', '/maintenance', '/api/login', '/api/logout', '/api/check-auth'];

  app.get('/maintenance', (req, res) => {
    const err = req.query.err ? 'Falsches Passwort. Bitte erneut versuchen.' : '';
    res.send(`<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>IMD Fleet Services — Zugang</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#181C25;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
  .card{background:#242A37;border:1px solid #2E3548;border-radius:16px;padding:36px 32px;width:100%;max-width:380px;box-shadow:0 20px 60px rgba(0,0,0,0.5)}
  img{height:40px;display:block;margin:0 auto 28px}
  h1{color:#fff;font-size:18px;font-weight:700;text-align:center;margin-bottom:6px}
  p{color:#8A95AB;font-size:13px;text-align:center;margin-bottom:24px}
  label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#8A95AB;margin-bottom:6px}
  input{width:100%;padding:13px 15px;background:#181C25;border:1px solid #2E3548;border-radius:10px;color:#fff;font-size:16px;outline:none;transition:border-color .15s}
  input:focus{border-color:#3B82C4;box-shadow:0 0 0 3px rgba(59,130,196,0.2)}
  .err{background:rgba(196,43,43,0.15);border:1px solid rgba(196,43,43,0.4);color:#F87171;font-size:13px;border-radius:8px;padding:10px 14px;margin-bottom:16px;text-align:center}
  button{width:100%;margin-top:16px;padding:14px;background:#3B82C4;color:#fff;border:0;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;transition:background .15s}
  button:hover{background:#2563AB}
  .foot{color:#5E6880;font-size:11px;text-align:center;margin-top:20px}
</style></head><body>
<div class="card">
  <img src="/logo_dark.png" alt="IMD Fleet Services">
  <h1>Interner Bereich</h1>
  <p>Bitte geben Sie das Zugangspasswort ein</p>
  ${err ? `<div class="err">${err}</div>` : ''}
  <form method="POST" action="/api/maintenance-auth">
    <label>Passwort</label>
    <input type="password" name="pass" placeholder="••••••••" autofocus autocomplete="current-password">
    <button type="submit">Zugang bestätigen</button>
  </form>
  <div class="foot">IMD Fleet Services · Interner Zugang</div>
</div>
</body></html>`);
  });

  app.post('/api/maintenance-auth', express.urlencoded({ extended: false }), (req, res) => {
    if (req.body.pass === process.env.MAINTENANCE_PASS) {
      req.session.maintenanceAuth = true;
      const redirect = req.session.maintenanceRedirect || '/';
      delete req.session.maintenanceRedirect;
      return res.redirect(redirect);
    }
    res.redirect('/maintenance?err=1');
  });

  app.use((req, res, next) => {
    if (MAINTENANCE_PUBLIC.includes(req.path)) return next();
    if (req.path.startsWith('/api/schaden')) return next();
    if (req.path.startsWith('/api/maintenance')) return next();
    if (req.session && (req.session.maintenanceAuth || req.session.loggedIn)) return next();
    if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Maintenance' });
    req.session.maintenanceRedirect = req.path;
    res.redirect('/maintenance');
  });
}

// express.static runs AFTER maintenance gate so protected files aren't served without auth
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

// ── GET /schaden ──────────────────────────────────────────────────────────────
app.get('/schaden', (req, res) => {
  res.sendFile(path.join(__dirname, 'schaden.html'));
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
  <div class="footer">Automatisch generiert durch das Kontaktformular auf <a href="https://imdfleet.de" style="color:#8899B4">imdfleet.de</a></div>
</div></body></html>`;

  const confirmationHtml = `
<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;background:#f4f7fb;margin:0;padding:20px}
  .card{background:#fff;border-radius:8px;padding:32px;max-width:600px;margin:0 auto;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  h2{color:#0052A3;margin:0 0 8px}
  .meta{color:#536E94;font-size:14px;margin-bottom:24px}
  .footer{margin-top:24px;font-size:12px;color:#8899B4;border-top:1px solid #DDE6F0;padding-top:12px}
</style></head><body>
<div class="card">
  <h2>Vielen Dank für Ihre Anfrage</h2>
  <p class="meta">Guten Tag ${name},<br><br>
  wir haben Ihre Fahrzeuganmeldung erfolgreich erhalten und werden uns so schnell wie möglich bei Ihnen melden.<br><br>
  Bei Fragen erreichen Sie uns jederzeit unter <a href="mailto:info@imdfleet.de">info@imdfleet.de</a>.
  </p>
  <div class="footer">IMD Fleet Services &bull; imdfleet.de</div>
</div></body></html>`;

  try {
    const { error: imdErr } = await resend.emails.send({
      from:    'IMD Fleet Services <info@imdfleet.de>',
      to:      process.env.RECIPIENT_EMAIL,
      replyTo: email || undefined,
      subject: `Neue Fahrzeuganmeldung — ${firma} (${marke} ${modell})`.trim(),
      html,
    });
    if (imdErr) throw new Error(imdErr.message);

    if (email) {
      const { error: clientErr } = await resend.emails.send({
        from:    'IMD Fleet Services <info@imdfleet.de>',
        to:      email,
        subject: 'Ihre Anfrage bei IMD Fleet Services',
        html:    confirmationHtml,
      });
      if (clientErr) console.error(`[${timestamp}] ✗ Confirmation mail error:`, clientErr.message);
    }

    console.log(`[${timestamp}] ✓ ${firma} / ${name} → saved + email sent`);
    res.json({ success: true });
  } catch (err) {
    console.error(`[${timestamp}] ✗ Mail error:`, err.message);
    res.json({ success: false, error: 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es erneut.' });
  }
});

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

    const werkstatt_name   = (req.body.werkstatt_name  || '').trim();
    const werkstatt_email  = (req.body.werkstatt_email || '').trim();
    const signatureBase64  = (req.body.signature       || '').trim();

    // Generate PDF Schadenmeldung
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateSchadenPDF({
        fall_nr, timestamp, fahrer_name, fahrer_telefon, fahrer_email,
        firma, kennzeichen, fahrzeugtyp, unfall_datum, unfall_uhrzeit,
        unfall_ort, fahrbereit, unfallgegner, beschreibung,
        werkstatt_name, werkstatt_email, signatureBase64,
      });
    } catch (pdfErr) {
      console.error(`[${timestamp}] ✗ PDF error:`, pdfErr.message);
    }
    if (pdfBuffer) {
      attachments.push({ filename: `Schadenmeldung_${fall_nr}.pdf`, content: pdfBuffer });
      console.log(`[${timestamp}] ✓ PDF generated (${Math.round(pdfBuffer.length/1024)} KB)`);
    } else {
      console.warn(`[${timestamp}] ⚠ PDF skipped — pdfkit not installed or generation failed`);
    }

    // Werkstatt email HTML
    const werkstattHtml = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;background:#f4f7fb;margin:0;padding:20px}
  .card{background:#fff;border-radius:8px;padding:32px;max-width:600px;margin:0 auto;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  h2{color:#0052A3;margin:0 0 4px}
  .fall{font-size:20px;font-weight:800;color:#09152A;margin-bottom:8px}
  .meta{color:#536E94;font-size:13px;margin-bottom:24px}
  .section{background:#0052A3;color:#fff;padding:8px 12px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-top:20px;border-radius:4px 4px 0 0}
  table{width:100%;border-collapse:collapse}
  td{padding:10px 12px;border-bottom:1px solid #ECF1F8;font-size:14px;color:#09152A;vertical-align:top}
  td.lbl{width:38%;font-weight:600;color:#2E4666}
  .hinweis{background:#FFF8E7;border:1px solid #F5C842;border-radius:8px;padding:14px 16px;margin-top:20px;font-size:13px;color:#7A5C00}
  .footer{margin-top:24px;font-size:12px;color:#8899B4;border-top:1px solid #DDE6F0;padding-top:12px}
</style></head><body>
<div class="card">
  <h2>🔧 Schadensauftrag von IMD Fleet Services</h2>
  <div class="fall">${fall_nr}</div>
  <p class="meta">Eingegangen am ${timestamp}</p>
  <div class="section">Fahrzeug &amp; Fahrer</div>
  <table>
    <tr><td class="lbl">Kennzeichen</td><td><strong>${kennzeichen}</strong></td></tr>
    <tr><td class="lbl">Fahrzeugtyp</td><td>${fahrzeugtyp || '—'}</td></tr>
    <tr><td class="lbl">Fahrer</td><td>${fahrer_name}</td></tr>
    <tr><td class="lbl">Telefon</td><td>${fahrer_telefon}</td></tr>
    <tr><td class="lbl">E-Mail</td><td>${fahrer_email || '—'}</td></tr>
    <tr><td class="lbl">Firma</td><td>${firma || '—'}</td></tr>
  </table>
  <div class="section">Schadensdetails</div>
  <table>
    <tr><td class="lbl">Datum</td><td>${unfall_datum}${unfall_uhrzeit ? ' · ' + unfall_uhrzeit : ''}</td></tr>
    <tr><td class="lbl">Unfallort</td><td>${unfall_ort || '—'}</td></tr>
    <tr><td class="lbl">Beschreibung</td><td>${beschreibung}</td></tr>
  </table>
  <div class="hinweis">
    <strong>⚠️ Wichtiger Hinweis:</strong><br>
    Die Reparaturfreigabe erfolgt <strong>ausschließlich durch IMD Fleet Services</strong>. Bitte nehmen Sie Kontakt mit dem Fahrer auf und erstellen Sie zunächst einen Kostenvoranschlag. Reparaturen dürfen erst nach schriftlicher Freigabe durch IMD beginnen.
  </div>
  <div class="footer">IMD Fleet Services · Fallnummer: ${fall_nr} · Automatisch generiert</div>
</div></body></html>`;

    // Email 1 → IMD mit Fotos
    const { error: imdErr } = await resend.emails.send({
      from: 'IMD Fleet Services <info@imdfleet.de>',
      to: process.env.RECIPIENT_EMAIL,
      subject: `🚨 Neuer Schaden: ${fall_nr} — ${kennzeichen}${firma ? ' — ' + firma : ''}`,
      html: imdHtml,
      attachments,
    });
    if (imdErr) throw new Error(imdErr.message);

    // Email 2 → Werkstatt (nur wenn ausgewählt)
    if (werkstatt_email) {
      const { error: wsErr } = await resend.emails.send({
        from: 'IMD Fleet Services <info@imdfleet.de>',
        to: werkstatt_email,
        subject: `Schadensauftrag ${fall_nr} — ${kennzeichen} — IMD Fleet Services`,
        html: werkstattHtml,
      });
      if (wsErr) console.error(`[${timestamp}] ✗ Werkstatt mail error:`, wsErr.message);
    }

    console.log(`[${timestamp}] ✓ Schaden ${fall_nr} — ${kennzeichen} saved + emails sent`);
    res.json({ success: true, fall_nr });
  } catch (err) {
    console.error('Schaden error:', err.message);
    res.status(500).json({ success: false, error: 'Fehler bei der Verarbeitung. Bitte versuchen Sie es erneut.' });
  }
});

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

// ── GET /api/werkstaetten (public — used by schaden form) ────────────────────
app.get('/api/werkstaetten', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM werkstaetten WHERE aktiv=true ORDER BY name');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/werkstaetten ────────────────────────────────────────────────────
app.post('/api/werkstaetten', requireAuth, async (req, res) => {
  const { name, city, plz, email, services, rating } = req.body;
  if (!name || !email) return res.json({ success: false, error: 'Name und E-Mail sind Pflichtfelder' });
  try {
    const r = await pool.query(
      'INSERT INTO werkstaetten (name, city, plz, email, services, rating) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, city || '', plz || '', email, services || '', rating || 5.0]
    );
    res.json({ success: true, werkstatt: r.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/werkstaetten/:id ───────────────────────────────────────────────
app.patch('/api/werkstaetten/:id', requireAuth, async (req, res) => {
  const { name, city, plz, email, services, rating } = req.body;
  if (!name || !email) return res.json({ success: false, error: 'Name und E-Mail sind Pflichtfelder' });
  try {
    await pool.query(
      'UPDATE werkstaetten SET name=$1, city=$2, plz=$3, email=$4, services=$5, rating=$6 WHERE id=$7',
      [name, city || '', plz || '', email, services || '', rating || 5.0, req.params.id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── DELETE /api/werkstaetten/:id ──────────────────────────────────────────────
app.delete('/api/werkstaetten/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM werkstaetten WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
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
