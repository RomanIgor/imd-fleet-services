const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const path       = require('path');
const { Resend } = require('resend');
const { pool }   = require('../db');
const { chatLimiter, escapeHtml, formLimiter, logError, sendError } = require('../middleware/security');
const requireAdmin = require('../middleware/requireAdmin');

const upload = multer({
  limits: { fields: 20, fieldSize: 20 * 1024 },
});

const CHAT_SYSTEM_PROMPT = `Du bist der offizielle KI-Schadenassistent von IMD Fleet Services. Du unterstützt Dienstwagenfahrer ausschließlich bei Themen rund um Kfz-Schäden, Pannenhilfe, Versicherungen und Dienstwagenregelungen in Deutschland.

STRIKTE THEMENBESCHRÄNKUNG:
Du beantwortest NUR Fragen zu folgenden Themen:
- Kfz-Schäden (Unfall, Parkschaden, Glasschaden, Wildschaden, Vandalismus, Diebstahl)
- Verhalten nach einem Unfall oder einer Panne
- Kfz-Versicherungen (Haftpflicht, Teilkasko, Vollkasko, Schadensfreiheitsrabatt)
- Schadenmeldung, Unfallprotokoll, Beweissicherung
- Pannenhilfe und Notfallnummern
- Dienstwagenregelungen, Fahrerhaftung, Selbstbeteiligung
- Mietwagen, Nutzungsausfall, Wertminderung nach Unfall
- Der Schadenmeldungsprozess bei IMD Fleet Services

Bei ALLEN anderen Fragen (Kochen, Politik, Sport, Technik, allgemeine Wissensfragen usw.) antwortest du ausschließlich:
"Das liegt außerhalb meines Zuständigkeitsbereichs. Ich helfe Ihnen nur bei Fragen zu Kfz-Schäden, Versicherungen und Dienstwagenthemen."

WICHTIGE VERHALTENSREGELN:
- Antworte immer auf Deutsch, klar und praktisch
- Niemals ein Schuldanerkenntnis empfehlen – das klären die Versicherungen
- Bei komplexen Rechtsfragen: Rechtsanwalt oder Versicherung empfehlen
- Antworten kurz halten (max. 4–5 Sätze), außer bei Schritt-für-Schritt-Anleitungen

SCHADENMELDUNGSPROZESS BEI IMD FLEET SERVICES:
1. Unfallstelle sichern (Warndreieck, Warnweste)
2. Polizei rufen falls nötig (Notruf: 110), bei Verletzten: 112
3. Fotos machen: Gesamtansicht beider Fahrzeuge, Schadensdetail, beide Kennzeichen, Unfallstelle, Zeugen
4. Daten des Unfallgegners notieren (Name, Adresse, Kennzeichen, Versicherung)
5. Kein Schuldanerkenntnis abgeben
6. Schadenmeldung über diese App ausfüllen und absenden
7. IMD Fleet Services meldet sich innerhalb von 24 Stunden
8. Reparatur nur in einer IMD-Partnerwerkstatt

NOTRUF- UND PANNENNUMMERN:
- Polizei: 110
- Feuerwehr / Rettungsdienst: 112
- ADAC Pannenhilfe: 0800 5 10 11 12 (kostenlos, 24/7)
- ADAC aus dem Ausland: +49 89 22 22 22
- IMD Fleet Services Notfallkontakt: [IMD-Nummer eintragen]
- Bei Wildunfall: Polizei (110) und Jagdpächter informieren, Tier nicht bewegen`;

// ── Pages ─────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

router.get('/intern', requireAdmin, (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, '..', 'dashboard.html'));
});

router.get('/intern/login', (req, res) => {
  if (req.session && req.session.user) return res.redirect('/intern');
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, '..', 'intern-login.html'));
});

router.get('/preview', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'redesign.html'));
});

router.get('/fahrzeugverkauf', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'fahrzeugverkauf.html'));
});

router.get('/schaden', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, '..', 'schaden.html'));
});

// ── POST /submit — Flottenankauf inquiry ──────────────────────────────────────
router.post('/submit', formLimiter, upload.none(), async (req, res) => {
  const {
    firma = '', name = '', email = '', telefon = '',
    marke = '', modell = '', baujahr = '', km = '',
    fahrzeuge = '', anmerkung = ''
  } = req.body;

  if (!firma || !name || !telefon) {
    return res.json({ success: false, error: 'Pflichtfelder fehlen (Firma, Name, Telefon)' });
  }

  const timestamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
  const ip        = req.ip || 'unbekannt';
  const resend    = new Resend(process.env.RESEND_API_KEY);

  try {
    await pool.query(
      `INSERT INTO submissions (firma, name, email, telefon, marke, modell, baujahr, km, fahrzeuge, anmerkung, ip)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [firma, name, email, telefon, marke, modell, baujahr, km, fahrzeuge, anmerkung, ip]
    );
  } catch (dbErr) {
    console.error('DB error:', dbErr.message);
  }

  const e = escapeHtml;
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
  <p class="meta">Eingegangen am ${e(timestamp)} &bull; IP: ${e(ip)}</p>
  <div class="section">Unternehmen &amp; Kontakt</div>
  <table>
    <tr><td class="lbl">Firma</td><td>${e(firma)}</td></tr>
    <tr><td class="lbl">Ansprechpartner</td><td>${e(name)}</td></tr>
    <tr><td class="lbl">Telefon</td><td>${e(telefon)}</td></tr>
    <tr><td class="lbl">E-Mail</td><td>${e(email || '—')}</td></tr>
  </table>
  <div class="section">Fahrzeugdaten</div>
  <table>
    <tr><td class="lbl">Marke</td><td>${e(marke || '—')}</td></tr>
    <tr><td class="lbl">Modell</td><td>${e(modell || '—')}</td></tr>
    <tr><td class="lbl">Baujahr</td><td>${e(baujahr || '—')}</td></tr>
    <tr><td class="lbl">Kilometerstand</td><td>${e(km ? km + ' km' : '—')}</td></tr>
    <tr><td class="lbl">Anzahl Fahrzeuge</td><td>${e(fahrzeuge || '—')}</td></tr>
  </table>
  <div class="section">Hinweise</div>
  <table>
    <tr><td class="lbl">Anmerkung</td><td>${e(anmerkung || '—')}</td></tr>
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
  <p class="meta">Guten Tag ${e(name)},<br><br>
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

    console.log(`[${timestamp}] Anfrage saved + email sent`);
    res.json({ success: true });
  } catch (err) {
    console.error(`[${timestamp}] ✗ Mail error:`, err.message);
    res.json({ success: false, error: 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es erneut.' });
  }
});

// ── GET /api/werkstaetten — public ────────────────────────────────────────────
router.get('/api/werkstaetten', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM werkstaetten WHERE aktiv=true ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    logError('Werkstaetten list error', err);
    sendError(res);
  }
});

// ── POST /api/chat — Groq AI assistant ───────────────────────────────────────
router.post('/api/chat', chatLimiter, async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.json({ reply: 'Ungültige Anfrage.' });
  }
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.json({ reply: 'KI-Assistent ist nicht konfiguriert. Bitte GROQ_API_KEY setzen.' });
  }
  const stripHtml = s => s.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&amp;/g, '&').trim();
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: CHAT_SYSTEM_PROMPT },
          ...messages.slice(-12).map(m => ({
            role:    m.from === 'user' ? 'user' : 'assistant',
            content: stripHtml(m.text),
          })),
        ],
        max_tokens:  512,
        temperature: 0.6,
      }),
    });
    if (!response.ok) throw new Error(`Groq ${response.status}`);
    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Keine Antwort erhalten.';
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.json({ reply: 'Der Assistent ist momentan nicht erreichbar. Bitte versuchen Sie es in wenigen Sekunden erneut.' });
  }
});

module.exports = router;
