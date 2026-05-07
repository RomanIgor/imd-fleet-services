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
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const PW = doc.page.width;
    const PH = doc.page.height;
    const L = 20;
    const CW = PW - L - 20;

    const NAVY  = '#0C2461';
    const DARK  = '#1A2644';
    const GRAY  = '#546E8A';
    const LINE  = '#B8C5D0';
    const LGRAY = '#8899AA';

    let y = 0;

    function checkPage(need) {
      if (y + (need || 50) > PH - 22) { doc.addPage(); y = 22; }
    }

    // Navy section bar with circle icon
    function secBar(title) {
      checkPage(40);
      doc.rect(L, y, CW, 16).fill(NAVY);
      doc.circle(L + 10, y + 8, 5.5).strokeColor('rgba(255,255,255,0.55)').lineWidth(0.9).stroke();
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7.5)
         .text(title, L + 22, y + 4.5, { lineBreak: false, characterSpacing: 0.4 });
      y += 20;
    }

    // Draw labeled field: label (small top) + value (dark) + underline
    function fld(label, value, x, atY, w, h) {
      doc.fillColor(GRAY).font('Helvetica').fontSize(6.5)
         .text(label, x, atY, { lineBreak: false, width: w - 1 });
      if (value) {
        doc.fillColor(DARK).font('Helvetica').fontSize(8.5)
           .text(String(value), x + 1, atY + 8, { lineBreak: false, width: w - 4 });
      }
      doc.moveTo(x, atY + h - 2).lineTo(x + w - 1, atY + h - 2)
         .strokeColor(LINE).lineWidth(0.5).stroke();
    }

    // Row of labeled fields, auto-split remaining width
    function fRow(items, h = 21) {
      const gap = 4;
      const fixed = items.reduce((s, it) => s + (it.w || 0), 0);
      const flex  = items.filter(it => !it.w).length;
      const fw    = flex ? (CW - fixed - gap * (items.length - 1)) / flex : 0;
      let x = L;
      for (let i = 0; i < items.length; i++) {
        const w = items[i].w || fw;
        fld(items[i].label, items[i].value || '', x, y, w, h);
        x += w + (i < items.length - 1 ? gap : 0);
      }
      y += h;
    }

    // Single checkbox □ label, returns x after
    function cb(label, checked, x, atY) {
      const sz = 7;
      doc.rect(x, atY, sz, sz).strokeColor(DARK).lineWidth(0.4).stroke();
      if (checked) {
        doc.moveTo(x+1.5,atY+3.5).lineTo(x+3,atY+5.5).lineTo(x+5.5,atY+1)
           .strokeColor(DARK).lineWidth(1.2).stroke();
      }
      doc.fillColor(DARK).font('Helvetica').fontSize(7.5)
         .text(label, x + sz + 2, atY + 0.5, { lineBreak: false });
      return x + sz + 2 + doc.widthOfString(label, { font: 'Helvetica', fontSize: 7.5 }) + 5;
    }

    // "Label: □ ja  □ nein" inline, returns x after
    function jn(label, isJa, x, atY, lw) {
      if (label) {
        doc.fillColor(DARK).font('Helvetica').fontSize(7.5)
           .text(label + ':', x, atY + 0.5, { lineBreak: false, width: lw });
      }
      const sz = 7;
      let nx = x + lw + (label ? 3 : 0);
      doc.rect(nx, atY, sz, sz).strokeColor(DARK).lineWidth(0.4).stroke();
      if (isJa) { doc.moveTo(nx+1.5,atY+3.5).lineTo(nx+3,atY+5.5).lineTo(nx+5.5,atY+1).strokeColor(DARK).lineWidth(1.2).stroke(); }
      doc.fillColor(DARK).font('Helvetica').fontSize(7.5).text('ja', nx + sz + 2, atY + 0.5, { lineBreak: false });
      nx += sz + 2 + doc.widthOfString('ja', { font: 'Helvetica', fontSize: 7.5 }) + 4;
      doc.rect(nx, atY, sz, sz).strokeColor(DARK).lineWidth(0.4).stroke();
      if (!isJa) { doc.moveTo(nx+1.5,atY+3.5).lineTo(nx+3,atY+5.5).lineTo(nx+5.5,atY+1).strokeColor(DARK).lineWidth(1.2).stroke(); }
      doc.fillColor(DARK).font('Helvetica').fontSize(7.5).text('nein', nx + sz + 2, atY + 0.5, { lineBreak: false });
      nx += sz + 2 + doc.widthOfString('nein', { font: 'Helvetica', fontSize: 7.5 }) + 4;
      return nx;
    }

    const fmtDate = iso => { if (!iso) return ''; const [yr,mo,da] = iso.split('-'); return `${da}.${mo}.${yr}`; };

    // ══ HEADER ═══════════════════════════════════════════════════════════
    doc.rect(0, 0, PW, 58).fill('#FFFFFF');
    doc.moveTo(L, 58).lineTo(PW - 20, 58).strokeColor(LINE).lineWidth(0.5).stroke();
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(17).text('IMD', L, 10, { lineBreak: false });
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(6.5).text('FLEET SERVICES', L, 29, { lineBreak: false, characterSpacing: 1.2 });
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(24)
       .text('SCHADENMELDUNG', 0, 15, { align: 'right', width: PW - 22, lineBreak: false });
    doc.fillColor(LGRAY).font('Helvetica').fontSize(7.5)
       .text(`Fall-Nr.: ${d.fall_nr}   ·   ${new Date().toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' })}`,
             0, 44, { align: 'right', width: PW - 22, lineBreak: false });
    y = 63;

    // ══ INSTRUCTION BANNER ═══════════════════════════════════════════════
    doc.rect(L, y, CW, 14).fill(NAVY);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8)
       .text('BITTE AM RECHNER / NOTEBOOK AUSFÜLLEN!', L, y + 3.5, { align: 'center', width: CW, lineBreak: false });
    y += 18;

    // ══ SCHULDFRAGE ══════════════════════════════════════════════════════
    doc.fillColor(DARK).font('Helvetica').fontSize(7.5)
       .text('Die Schuld liegt meines Erachtens bei mir:', L, y + 1, { lineBreak: false });
    let sx = L + 143;
    sx = cb('bei mir', false, sx, y);
    sx = cb('beim Gegner', false, sx, y);
    cb('unklar', false, sx, y);
    const ftX = L + CW * 0.57;
    let ftx = cb('Dienstfahrt', false, ftX, y);
    ftx = cb('Fahrt Wohnung-Arbeitsstätte', false, ftx, y);
    cb('Privatfahrt', false, ftx, y);
    y += 12;
    doc.moveTo(L, y).lineTo(L + CW, y).strokeColor(LINE).lineWidth(0.4).stroke();
    y += 5;

    // ══ FAHRERDATEN FIELD ROWS ════════════════════════════════════════════
    fRow([
      { label: 'Kennzeichen:',   value: d.kennzeichen },
      { label: 'Unfalldatum:',  value: fmtDate(d.unfall_datum) },
      { label: 'Uhrzeit:',      value: d.unfall_uhrzeit },
    ]);
    fRow([
      { label: 'Fahrername:',   value: d.fahrer_name },
      { label: 'Vorname:',      value: '' },
      { label: 'Geburtsdatum:', value: '' },
    ]);
    fRow([{ label: 'Privatadresse:', value: '' }]);

    // Telefon + Fahrerlaubnis ja/nein (mixed row)
    {
      const h = 21, telW = CW * 0.48;
      fld('Telefon für Rückfragen:', d.fahrer_telefon, L, y, telW, h);
      const rx = L + telW + 4;
      doc.fillColor(GRAY).font('Helvetica').fontSize(6.5)
         .text('Erforderliche Fahrerlaubnis:', rx, y, { lineBreak: false });
      jn('', false, rx + 102, y + 7, 0);
      doc.moveTo(rx, y + h - 2).lineTo(L + CW - 1, y + h - 2).strokeColor(LINE).lineWidth(0.5).stroke();
      y += h;
    }
    fRow([
      { label: 'Ausstellungsdatum Fahrerlaubnis:', value: '' },
      { label: 'Ausstellende Behörde:',            value: '' },
    ]);
    fRow([
      { label: 'Führerschein-Nr.:',    value: '' },
      { label: 'Führerscheinklassen:', value: '' },
    ]);

    // ══ ALKOHOL / DROGEN / BLUTPROBE ═════════════════════════════════════
    secBar('ALKOHOL / DROGEN / BLUTPROBE');
    {
      const h = 18;
      let ax = L;
      ax = jn('Alkoholkonsum',  false, ax, y, 62); ax += 3;
      ax = jn('Drogenkonsum',   false, ax, y, 60); ax += 3;
      ax = jn('Blutprobe',      false, ax, y, 48); ax += 3;
      fld('Ergebnis:', '', ax, y, L + CW - ax - 1, h);
      y += h;
    }
    {
      const h = 18;
      let ax = L;
      ax = jn('Wurde eine Blutprobe entnommen?', false, ax, y, 130); ax += 3;
      fld('Wenn ja, mit welchem Ergebnis:', '', ax, y, L + CW - ax - 1, h);
      y += h;
    }

    // ══ UNFALLORT UND SCHADEN AM EIGENEN FAHRZEUG ════════════════════════
    secBar('UNFALLORT UND SCHADEN AM EIGENEN FAHRZEUG');
    fRow([{ label: 'Unfallort mit PLZ:', value: d.unfall_ort }]);
    fRow([{ label: 'Schaden am eigenen Fahrzeug (z.B. Frontschaden, Heckschaden o.ä.):', value: d.schadenart || '' }]);
    {
      const h = 18;
      let ax = L;
      ax = jn('Fahrzeug fahrbereit', d.fahrbereit === 'ja', ax, y, 84); ax += 8;
      ax = jn('Personenschaden',     d.personenschaden === 'ja', ax, y, 68); ax += 8;
      fld('Zu besichtigen bei:', '', ax, y, L + CW - ax - 1, h);
      y += h;
    }

    // ══ POLIZEI / DIENSTSTELLE / ZEUGEN ══════════════════════════════════
    secBar('POLIZEI / DIENSTSTELLE / ZEUGEN');
    {
      const h = 18;
      let ax = L;
      ax = jn('Polizeilich aufgenommen', d.polizei_aufgenommen === 'ja', ax, y, 100); ax += 6;
      const tabW = (L + CW - ax - 1) * 0.48;
      fld('Tagebuch-Nr.:', d.polizei_aktenzeichen || '', ax, y, tabW, h);
      ax += tabW + 4;
      fld('Dienststelle / Id.:', '', ax, y, L + CW - ax - 1, h);
      y += h;
    }
    fRow([{ label: 'Polizei-Dienststelle mit Adresse und Tel.Nr.:', value: '' }]);
    fRow([{ label: 'Zeugen mit Adresse:', value: '' }]);

    // ══ UNFALLHERGANG ════════════════════════════════════════════════════
    secBar('UNFALLHERGANG');
    doc.fillColor(GRAY).font('Helvetica').fontSize(6.5)
       .text(
         'Bitte so ausführlich wie möglich. Sollte der Platz nicht ausreichen, fügen Sie bitte ein weiteres Blatt/Datei hinzu.\n' +
         'In strittigen Fällen bitte Endstellung der Fahrzeuge skizzieren, nach Möglichkeit Unfall fotografieren.',
         L, y, { width: CW, lineBreak: true }
       );
    y = doc.y + 3;
    if (d.beschreibung) {
      doc.fillColor(DARK).font('Helvetica').fontSize(8.5)
         .text(d.beschreibung, L + 1, y, { width: CW - 2, lineBreak: true });
      y = doc.y + 2;
    }
    const hEnd = y + 52;
    for (let ly = y + 13; ly < hEnd; ly += 13) {
      doc.moveTo(L, ly).lineTo(L + CW, ly).strokeColor(LINE).lineWidth(0.3).stroke();
    }
    y = hEnd;

    // ══ UNFALLGEGNER ═════════════════════════════════════════════════════
    secBar('UNFALLGEGNER');
    fRow([
      { label: 'Fahrzeughalter:', value: d.opponent_holder || '' },
      { label: 'Adresse:',        value: d.opponent_address || '' },
    ]);
    fRow([
      { label: 'Fahrername:', value: d.opponent_lastname || '' },
      { label: 'Vorname:',    value: d.opponent_firstname || '' },
    ]);
    fRow([{ label: 'Adresse:', value: '' }]);
    fRow([
      { label: 'Telefon tagsüber:',  value: d.opponent_phone || '' },
      { label: 'Mobilfunknummer:',   value: d.opponent_mobile || '' },
    ]);
    fRow([
      { label: 'Kennzeichen:',  value: d.opponent_plate || '' },
      { label: 'Fahrzeugtyp:',  value: d.opponent_type || '' },
    ]);
    fRow([
      { label: 'Versichert bei:',          value: d.opponent_insurance || '' },
      { label: 'Versicherungsschein-Nr.:', value: d.opponent_insurance_nr || '' },
    ]);
    fRow([{ label: 'Welcher Schaden (z.B. Frontschaden, Heckschaden o.ä.):', value: d.opponent_damage || '' }]);

    // ══ DOKUMENTE / FOTOS  +  VERSAND / UNTERSCHRIFT ════════════════════
    checkPage(110);
    const botY  = y;
    const leftW = Math.floor(CW * 0.56) - 3;
    const rW    = CW - leftW - 4;
    const rX    = L + leftW + 4;

    // Left header
    doc.rect(L, botY, leftW, 15).fill(NAVY);
    doc.circle(L + 10, botY + 7.5, 5.5).strokeColor('rgba(255,255,255,0.55)').lineWidth(0.9).stroke();
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7)
       .text('DOKUMENTE / FOTOS UND DATENSCHUTZ', L + 22, botY + 4.5, { lineBreak: false });
    // Right header
    doc.rect(rX, botY, rW, 15).fill(NAVY);
    doc.circle(rX + 10, botY + 7.5, 5.5).strokeColor('rgba(255,255,255,0.55)').lineWidth(0.9).stroke();
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7)
       .text('VERSAND / UNTERSCHRIFT', rX + 22, botY + 4.5, { lineBreak: false });

    // Photo checkboxes (left)
    const photos = Array.isArray(d.photoLabels) ? d.photoLabels : [];
    const hasPhoto = key => photos.some(p => p && p.toLowerCase().includes(key.toLowerCase()));
    const pItems = [
      { label: 'Gesamtansicht', key: 'Gesamtansicht' },
      { label: 'Schaden Detail', key: 'Schaden' },
      { label: 'Kennzeichen',   key: 'Kennzeichen' },
      { label: 'Unfallstelle',  key: 'Unfallstelle' },
      { label: 'Unfallgegner',  key: 'Unfallgegner' },
      { label: 'Polizei',       key: 'Dokumente' },
    ];
    let cbx = L, cby = botY + 18;
    pItems.forEach((item, i) => {
      if (i === 3) { cbx = L; cby += 13; }
      const checked = hasPhoto(item.key);
      const sz = 7;
      doc.rect(cbx, cby, sz, sz).strokeColor(DARK).lineWidth(0.4).stroke();
      if (checked) { doc.moveTo(cbx+1.5,cby+3.5).lineTo(cbx+3,cby+5.5).lineTo(cbx+5.5,cby+1).strokeColor(DARK).lineWidth(1.2).stroke(); }
      doc.fillColor(checked ? DARK : GRAY).font('Helvetica').fontSize(7.5)
         .text(item.label, cbx + sz + 2, cby + 0.5, { lineBreak: false });
      cbx += sz + 2 + doc.widthOfString(item.label, { font: 'Helvetica', fontSize: 7.5 }) + 8;
    });
    cby += 15;
    doc.fillColor(GRAY).font('Helvetica').fontSize(5.5)
       .text(
         'Ich bestätige die Richtigkeit und Vollständigkeit meiner Angaben.\n' +
         'Ich habe kein Schuldanerkenntnis abgegeben. Reparaturfreigaben erfolgen\n' +
         'ausschließlich durch IMD Fleet Services. Die Datenverarbeitung erfolgt\n' +
         'gemäß DSGVO/DSG zur Schadensbearbeitung.',
         L, cby, { width: leftW - 2, lineBreak: true }
       );
    const leftEndY = doc.y + 4;

    // Right: email + signature
    let ry = botY + 18;
    doc.fillColor(GRAY).font('Helvetica').fontSize(7)
       .text('Senden an: schaden@imd-fleet-services.de', rX, ry, { lineBreak: false });
    ry += 11;
    const sigH = Math.max(leftEndY - ry - 22, 46);
    doc.rect(rX, ry, rW - 1, sigH).strokeColor(LINE).lineWidth(0.5).stroke();
    if (d.signatureBase64 && d.signatureBase64.startsWith('data:image/png;base64,')) {
      try {
        const sigBuf = Buffer.from(d.signatureBase64.slice(22), 'base64');
        doc.image(sigBuf, rX + 3, ry + 3, { width: rW - 8, height: sigH - 6 });
      } catch (_) { /* skip */ }
    }
    ry += sigH + 4;
    const dateStr = new Date().toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
    const dW = rW * 0.44;
    doc.moveTo(rX, ry).lineTo(rX + dW - 2, ry).strokeColor(DARK).lineWidth(0.5).stroke();
    doc.moveTo(rX + dW + 2, ry).lineTo(rX + rW - 1, ry).strokeColor(DARK).lineWidth(0.5).stroke();
    doc.fillColor(GRAY).font('Helvetica').fontSize(6.5).text('Datum', rX, ry + 2, { lineBreak: false });
    doc.fillColor(DARK).font('Helvetica').fontSize(8).text(dateStr, rX + 28, ry + 2, { lineBreak: false });
    doc.fillColor(GRAY).font('Helvetica').fontSize(6.5).text('Unterschrift Fahrer', rX + dW + 2, ry + 2, { lineBreak: false });

    if (d.werkstatt_name) {
      y = Math.max(leftEndY, ry + 14) + 4;
      doc.fillColor(GRAY).font('Helvetica').fontSize(7)
         .text(`Gewünschte Werkstatt: ${d.werkstatt_name}` + (d.werkstatt_email ? ` · ${d.werkstatt_email}` : ''),
               L, y, { lineBreak: false, width: CW });
    }

    // ══ FOOTER ═══════════════════════════════════════════════════════════
    const footY = PH - 18;
    doc.moveTo(L, footY - 4).lineTo(PW - 20, footY - 4).strokeColor(LINE).lineWidth(0.4).stroke();
    doc.fillColor(LGRAY).font('Helvetica').fontSize(7)
       .text('IMD intern:   Eingang  |  Prüfung  |  Werkstattzuweisung  |  Freigabe  |  Versicherung',
             0, footY, { align: 'center', width: PW, lineBreak: false });

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
  res.setHeader('Cache-Control', 'no-cache');
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

  const personenschaden      = (req.body.personenschaden      || 'nein').trim();
  const polizei_aufgenommen  = (req.body.polizei_aufgenommen  || polizei_gerufen || 'nein').trim();
  const polizei_aktenzeichen = (req.body.polizei_aktenzeichen || '').trim();
  const schadenart           = (req.body.schadenart           || '').trim();
  const km                   = (req.body.km                   || '').trim();
  const opponent_holder      = (req.body.opponent_holder      || '').trim();
  const opponent_address     = (req.body.opponent_address     || '').trim();
  const opponent_lastname    = (req.body.opponent_lastname    || '').trim();
  const opponent_firstname   = (req.body.opponent_firstname   || '').trim();
  const opponent_plate       = (req.body.opponent_plate       || '').trim();
  const opponent_type        = (req.body.opponent_type        || '').trim();
  const opponent_phone       = (req.body.opponent_phone       || '').trim();
  const opponent_mobile      = (req.body.opponent_mobile      || '').trim();
  const opponent_insurance   = (req.body.opponent_insurance   || '').trim();
  const opponent_insurance_nr= (req.body.opponent_insurance_nr|| '').trim();
  const opponent_damage      = (req.body.opponent_damage      || '').trim();
  let photoLabels = [];
  try { photoLabels = JSON.parse(req.body.photo_labels || '[]'); } catch(_) {}

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
    <tr><td class="lbl">Polizei aufgenommen</td><td>${polizei_aufgenommen === 'ja' ? 'Ja' : 'Nein'}${polizei_aktenzeichen ? ' — ' + polizei_aktenzeichen : ''}</td></tr>
    <tr><td class="lbl">Personenschaden</td><td>${personenschaden === 'ja' ? '<span style="color:#991b1b;font-weight:700">Ja</span>' : 'Nein'}</td></tr>
    <tr><td class="lbl">Unfallgegner</td><td>${unfallgegner === 'ja' ? 'Ja' : 'Nein'}</td></tr>
    <tr><td class="lbl">Beschreibung</td><td>${beschreibung}</td></tr>
  </table>
  ${unfallgegner === 'ja' ? `
  <div class="section">Unfallgegner</div>
  <table>
    ${opponent_holder     ? `<tr><td class="lbl">Fahrzeughalter</td><td>${opponent_holder}</td></tr>` : ''}
    ${(opponent_lastname||opponent_firstname) ? `<tr><td class="lbl">Fahrername</td><td>${opponent_firstname} ${opponent_lastname}</td></tr>` : ''}
    ${opponent_address    ? `<tr><td class="lbl">Adresse</td><td>${opponent_address}</td></tr>` : ''}
    ${opponent_plate      ? `<tr><td class="lbl">Kennzeichen</td><td>${opponent_plate}</td></tr>` : ''}
    ${opponent_type       ? `<tr><td class="lbl">Fahrzeugtyp</td><td>${opponent_type}</td></tr>` : ''}
    ${opponent_insurance  ? `<tr><td class="lbl">Versichert bei</td><td>${opponent_insurance}</td></tr>` : ''}
    ${opponent_insurance_nr ? `<tr><td class="lbl">Versicherungsschein-Nr.</td><td>${opponent_insurance_nr}</td></tr>` : ''}
    ${opponent_damage     ? `<tr><td class="lbl">Schaden Gegner</td><td>${opponent_damage}</td></tr>` : ''}
  </table>` : ''}
  <div class="footer">Automatisch generiert · ${req.files.length} Foto(s) im Anhang · PDF beigefügt</div>
</div></body></html>`;

    const werkstatt_name   = (req.body.werkstatt_name  || '').trim();
    const werkstatt_email  = (req.body.werkstatt_email || '').trim();
    const signatureBase64  = (req.body.signature       || '').trim();

    // Generate PDF Schadenmeldung
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateSchadenPDF({
        fall_nr, timestamp,
        fahrer_name, fahrer_telefon, fahrer_email, firma,
        kennzeichen, fahrzeugtyp, km,
        unfall_datum, unfall_uhrzeit, unfall_ort, schadenart,
        fahrbereit, personenschaden, unfallgegner,
        beschreibung, polizei_aufgenommen, polizei_aktenzeichen,
        opponent_holder, opponent_address, opponent_lastname, opponent_firstname,
        opponent_plate, opponent_type, opponent_phone, opponent_mobile,
        opponent_insurance, opponent_insurance_nr, opponent_damage,
        werkstatt_name, werkstatt_email, photoLabels, signatureBase64,
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
