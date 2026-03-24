// IMD Fleet Services — Form Server
// Serves static files + handles form POST → sends email via SMTP
//
// Setup:  cp .env.example .env  →  fill in your credentials
// Run:    node server.js

require('dotenv').config();
const express  = require('express');
const multer   = require('multer');
const { Resend } = require('resend');
const path     = require('path');

const app  = express();
const port = process.env.PORT || 8000;
const upload = multer(); // parse multipart/form-data (FormData from JS)

// ── Static files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname)));

// ── Resend client ─────────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ── Form submission endpoint ──────────────────────────────────────────────────
app.post('/submit', upload.none(), async (req, res) => {
  const {
    firma = '', name = '', email = '', telefon = '',
    marke = '', modell = '', baujahr = '', km = '',
    fahrzeuge = '', anmerkung = ''
  } = req.body;

  // Basic validation
  if (!firma || !name || !telefon) {
    return res.json({ success: false, error: 'Pflichtfelder fehlen (Firma, Name, Telefon)' });
  }

  const timestamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unbekannt';

  const html = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8">
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
</style>
</head>
<body>
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
</div>
</body></html>`;

  try {
    const { error } = await resend.emails.send({
      from:    'IMD Fleet Services <onboarding@resend.dev>',
      to:      process.env.RECIPIENT_EMAIL.split(',').map(e => e.trim()),
      replyTo: email || undefined,
      subject: `Neue Fahrzeuganmeldung — ${firma} (${marke} ${modell})`.trim(),
      html,
    });

    if (error) throw new Error(error.message);

    console.log(`[${timestamp}] ✓ Submission from ${firma} / ${name} → email sent`);
    res.json({ success: true });

  } catch (err) {
    console.error(`[${timestamp}] ✗ Mail error:`, err.message);
    res.json({ success: false, error: 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es erneut.' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`\n✓ IMD Fleet Services server running → http://localhost:${port}`);
  console.log(`  SMTP: ${process.env.SMTP_HOST || '⚠ not configured — fill in .env'}\n`);
});
