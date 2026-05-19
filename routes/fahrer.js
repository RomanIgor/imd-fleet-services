'use strict';

const express        = require('express');
const router         = express.Router();
const crypto         = require('crypto');
const path           = require('path');
const { Resend }     = require('resend');
const { pool, hashPassword, verifyPassword } = require('../db');
const requireAdmin      = require('../middleware/requireAdmin');
const requireFahrerAuth = require('../middleware/requireFahrerAuth');
const { authLimiter, escapeHtml, fahrerAuthLimiter, passwordResetLimiter, resetRequestLimiter } = require('../middleware/security');

function normalizeFahrerInput(data = {}) {
  return {
    vorname: String(data.vorname || '').trim(),
    nachname: String(data.nachname || '').trim(),
    email: String(data.email || '').trim().toLowerCase(),
    telefon: String(data.telefon || '').trim(),
    fuhrpark_id: Number.parseInt(data.fuhrpark_id, 10),
  };
}

function buildActivationEmail({ vorname, activationLink }) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:Arial,sans-serif;background:#f4f7fb;padding:20px">
    <div style="background:#fff;border-radius:8px;padding:32px;max-width:500px;margin:0 auto">
      <p style="color:#0c2461;font-size:20px;font-weight:800;margin:0 0 16px">IMD Fleet Services</p>
      <p>Hallo ${escapeHtml(vorname)},</p>
      <p>Sie wurden eingeladen, die IMD Fleet Services Plattform zu nutzen. Klicken Sie auf den folgenden Link, um Ihr Konto zu aktivieren und ein Passwort zu setzen:</p>
      <p style="margin:24px 0">
        <a href="${activationLink}" style="background:#0c2461;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700">Konto aktivieren &rarr;</a>
      </p>
      <p style="color:#888;font-size:13px">Der Link ist 72 Stunden g&uuml;ltig. Falls Sie diese E-Mail nicht angefordert haben, ignorieren Sie sie bitte.</p>
    </div>
  </body></html>`;
}

async function createFahrerAndSendInvite({ vorname, nachname, email, telefon, fuhrpark_id }) {
  const invite_token = crypto.randomBytes(32).toString('hex');
  const invite_expires_at = new Date(Date.now() + 72 * 60 * 60 * 1000);
  const { rows } = await pool.query(
    `INSERT INTO fahrer (fuhrpark_id, vorname, nachname, telefon, email, invite_token, invite_expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [fuhrpark_id, vorname, nachname, telefon || null, email, invite_token, invite_expires_at]
  );
  const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`;
  const activationLink = `${BASE_URL}/fahrer/aktivieren?token=${invite_token}`;
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'IMD Fleet Services <schaden@imdfleet.de>',
    to: email,
    subject: 'Einladung: IMD Fleet Services - Konto aktivieren',
    html: buildActivationEmail({ vorname, activationLink }),
  });
  return rows[0].id;
}

// FUHRPARKS

router.get('/api/fuhrparks', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM fuhrparks ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Interner Fehler' });
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
    console.error(err.message);
    res.status(500).json({ error: 'Interner Fehler' });
  }
});

router.patch('/api/fuhrparks/:id', requireAdmin, async (req, res) => {
  const { name, kontakt_email, telefon } = req.body;
  if (!name) return res.status(400).json({ error: 'name erforderlich' });
  try {
    const { rows } = await pool.query(
      'UPDATE fuhrparks SET name=$1, kontakt_email=$2, telefon=$3 WHERE id=$4 RETURNING *',
      [name, kontakt_email || null, telefon || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Nicht gefunden' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Interner Fehler' });
  }
});

// FAHRER - IMD Admin CRUD

router.get('/api/fahrer', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT f.id, f.vorname, f.nachname, f.telefon, f.email, f.aktiv, f.created_at,
             fp.name AS fuhrpark_name, fp.id AS fuhrpark_id,
             (f.invite_token IS NOT NULL) AS has_invite_token
      FROM fahrer f
      JOIN fuhrparks fp ON fp.id = f.fuhrpark_id
      WHERE f.vorname != 'Gel\u00f6scht'
      ORDER BY f.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Interner Fehler' });
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
      subject: 'Einladung: IMD Fleet Services - Konto aktivieren',
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:Arial,sans-serif;background:#f4f7fb;padding:20px">
        <div style="background:#fff;border-radius:8px;padding:32px;max-width:500px;margin:0 auto">
          <p style="color:#0c2461;font-size:20px;font-weight:800;margin:0 0 16px">IMD Fleet Services</p>
          <p>Hallo ${escapeHtml(vorname)},</p>
          <p>Sie wurden eingeladen, die IMD Fleet Services Plattform zu nutzen. Klicken Sie auf den folgenden Link, um Ihr Konto zu aktivieren und ein Passwort zu setzen:</p>
          <p style="margin:24px 0">
            <a href="${activationLink}" style="background:#0c2461;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700">Konto aktivieren &rarr;</a>
          </p>
          <p style="color:#888;font-size:13px">Der Link ist 72 Stunden g&uuml;ltig. Falls Sie diese E-Mail nicht angefordert haben, ignorieren Sie sie bitte.</p>
        </div>
      </body></html>`,
    });
    res.json({ success: true, id: rows[0].id });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'E-Mail bereits vergeben' });
    console.error(err.message);
    res.status(500).json({ error: 'Interner Fehler' });
  }
});

router.post('/api/fahrer/import', requireAdmin, async (req, res) => {
  const items = Array.isArray(req.body?.fahrer) ? req.body.fahrer : [];
  const fuhrparkId = Number.parseInt(req.body?.fuhrpark_id, 10);
  if (!fuhrparkId) return res.status(400).json({ error: 'fuhrpark_id erforderlich' });
  if (!items.length) return res.status(400).json({ error: 'Keine Fahrer im Import gefunden' });
  if (items.length > 200) return res.status(400).json({ error: 'Maximal 200 Fahrer pro Import erlaubt' });

  const results = [];
  for (let i = 0; i < items.length; i += 1) {
    const fahrer = normalizeFahrerInput({ ...items[i], fuhrpark_id: fuhrparkId });
    const row = i + 2;
    if (!fahrer.vorname || !fahrer.nachname || !fahrer.email) {
      results.push({ row, email: fahrer.email || '', success: false, error: 'Vorname, Nachname und E-Mail erforderlich' });
      continue;
    }
    try {
      const id = await createFahrerAndSendInvite(fahrer);
      results.push({ row, id, email: fahrer.email, success: true });
    } catch (err) {
      const error = err.code === '23505' ? 'E-Mail bereits vergeben' : 'Einladung konnte nicht gesendet werden';
      console.error(`Fahrer-Import Zeile ${row}:`, err.message);
      results.push({ row, email: fahrer.email, success: false, error });
    }
  }
  const created = results.filter(r => r.success).length;
  res.json({ success: true, created, failed: results.length - created, total: results.length, results });
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
    console.error(err.message);
    res.status(500).json({ error: 'Interner Fehler' });
  }
});

router.delete('/api/fahrer/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await pool.query(
      `UPDATE fahrer SET vorname='Gel\u00f6scht', nachname='Gel\u00f6scht', telefon=NULL,
       email=NULL, password_hash=NULL, salt=NULL, invite_token=NULL,
       invite_expires_at=NULL, reset_token=NULL, reset_expires_at=NULL
       WHERE id=$1`,
      [id]
    );
    await pool.query(`DELETE FROM session WHERE sess::jsonb->>'fahrerId' = $1`, [String(id)]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Interner Fehler' });
  }
});

// FAHRER - Konto aktivieren

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

router.post('/api/fahrer/aktivieren', authLimiter, async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: 'Token und Passwort (mind. 8 Zeichen) erforderlich' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, fuhrpark_id FROM fahrer WHERE invite_token=$1 AND aktiv=false AND invite_expires_at > NOW()`,
      [token]
    );
    if (!rows.length) return res.status(400).json({ error: 'Token ungueltig oder abgelaufen' });
    const { id, fuhrpark_id } = rows[0];
    const { hash, salt } = await hashPassword(password);
    await pool.query(
      `UPDATE fahrer SET password_hash=$1, salt=$2, aktiv=true,
       invite_token=NULL, invite_expires_at=NULL WHERE id=$3`,
      [hash, salt, id]
    );
    req.session.fahrerId   = id;
    req.session.fuhrparkId = fuhrpark_id;
    res.json({ success: true, redirect: '/schaden' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Interner Fehler' });
  }
});

// FAHRER - Login / Logout / Me

router.get('/fahrer/login', (req, res) => {
  if (req.session && req.session.fahrerId) return res.redirect('/schaden');
  res.sendFile(path.join(__dirname, '..', 'fahrer-login.html'));
});

router.post('/api/fahrer/login', fahrerAuthLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });
  try {
    const { rows } = await pool.query(
      'SELECT id, fuhrpark_id, password_hash, salt, aktiv FROM fahrer WHERE email=$1',
      [email.trim().toLowerCase()]
    );
    if (!rows.length || !rows[0].aktiv || !rows[0].password_hash) {
      return res.status(401).json({ error: 'E-Mail oder Passwort falsch' });
    }
    const { id, fuhrpark_id, password_hash, salt } = rows[0];
    const valid = await verifyPassword(password, password_hash, salt);
    if (!valid) return res.status(401).json({ error: 'E-Mail oder Passwort falsch' });
    req.session.fahrerId   = id;
    req.session.fuhrparkId = fuhrpark_id;
    res.json({ success: true, redirect: '/schaden' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Interner Fehler' });
  }
});

router.post('/api/fahrer/logout', requireFahrerAuth, (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

router.get('/api/fahrer/me', requireFahrerAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT f.id, f.vorname, f.nachname, f.email, f.telefon,
              COALESCE(fp.name, '') AS fuhrpark_name
       FROM fahrer f LEFT JOIN fuhrparks fp ON fp.id = f.fuhrpark_id
       WHERE f.id = $1`,
      [req.session.fahrerId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Fahrer nicht gefunden' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Interner Fehler' });
  }
});

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
    console.error(err.message);
    res.status(500).json({ error: 'Interner Fehler' });
  }
});

router.get('/api/fahrer/meine-schaeden/:fallNr', requireFahrerAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         fall_nr, created_at, status, firma, fahrer_name, fahrer_email, fahrer_telefon,
         kennzeichen, fahrzeugtyp, baujahr, km, schuldfrage, fahrtart,
         unfall_datum, unfall_uhrzeit, unfall_ort, unfall_strasse, unfall_plz, unfall_ort_name,
         fahrbereit, personenschaden, unfallgegner, beschreibung,
         polizei_gerufen, polizei_aufgenommen, polizei_aktenzeichen, schadenart,
         opponent_holder, opponent_address, opponent_lastname, opponent_firstname,
         opponent_plate, opponent_type, opponent_phone, opponent_mobile,
         opponent_insurance, opponent_insurance_nr, opponent_damage,
         fahrer_adresse, fahrerlaubnis, fahrerlaubnis_datum, fahrerlaubnis_behoerde,
         fuehrerschein_nr, fuehrerschein_klassen, alkohol, drogen,
         blutprobe_feld, blutprobe_ergebnis, blutprobe_entnommen, blutprobe_ergebnis_detail,
         werkstatt_name, werkstatt_email, photo_labels, fahrer_confirmation_sent_at
       FROM schaeden
       WHERE fahrer_id = $1 AND fall_nr = $2
       LIMIT 1`,
      [req.session.fahrerId, req.params.fallNr]
    );
    if (!rows.length) return res.status(404).json({ error: 'Nicht gefunden' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Interner Fehler' });
  }
});

// Schaden form - requires Fahrer session
// Mounted BEFORE express.static in server.js so this route takes priority

router.get('/schaden', requireFahrerAuth, (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, '..', 'schaden.html'));
});

// FAHRER - Passwort vergessen / Reset

router.get('/fahrer/passwort-vergessen', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'fahrer-passwort.html'));
});

router.post('/api/fahrer/reset-anfragen', resetRequestLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'E-Mail-Adresse erforderlich' });
  try {
    const { rows } = await pool.query(
      'SELECT id, vorname, reset_token, reset_expires_at FROM fahrer WHERE email=$1 AND aktiv=true',
      [email.trim().toLowerCase()]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, error: 'Diese E-Mail-Adresse ist nicht registriert oder noch nicht aktiviert.' });
    }
    const { id, vorname } = rows[0];
    let reset_token = rows[0].reset_token;
    let reset_expires_at = rows[0].reset_expires_at;
    if (!reset_token || !reset_expires_at || new Date(reset_expires_at).getTime() <= Date.now()) {
      reset_token      = crypto.randomBytes(32).toString('hex');
      reset_expires_at = new Date(Date.now() + 15 * 60 * 1000);
      await pool.query(
        'UPDATE fahrer SET reset_token=$1, reset_expires_at=$2 WHERE id=$3',
        [reset_token, reset_expires_at, id]
      );
    }
    const BASE_URL  = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`;
    const resetLink = `${BASE_URL}/fahrer/passwort-reset?token=${reset_token}`;
    const resend    = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from:    'IMD Fleet Services <schaden@imdfleet.de>',
      to:      email,
      subject: 'Passwort zuruecksetzen - IMD Fleet Services',
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:Arial,sans-serif;background:#f4f7fb;padding:20px">
        <div style="background:#fff;border-radius:8px;padding:32px;max-width:500px;margin:0 auto">
          <p style="color:#0c2461;font-size:20px;font-weight:800;margin:0 0 16px">IMD Fleet Services</p>
          <p>Hallo ${escapeHtml(vorname)},</p>
          <p>Sie haben eine Passwortzur&uuml;cksetzung angefordert. Klicken Sie auf den folgenden Link:</p>
          <p style="margin:24px 0">
            <a href="${resetLink}" style="background:#0c2461;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700">Neues Passwort setzen &rarr;</a>
          </p>
          <p style="color:#888;font-size:13px">Der Link ist 15 Minuten g&uuml;ltig. Falls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail.</p>
        </div>
      </body></html>`,
    });
    res.json({ success: true, message: 'Ein Link zum Zuruecksetzen wurde gesendet.' });
  } catch (err) {
    console.error('Reset-Anfrage Fehler:', err.message);
    res.status(500).json({ success: false, error: 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es erneut.' });
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

router.post('/api/fahrer/reset', passwordResetLimiter, async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: 'Token und Passwort (mind. 8 Zeichen) erforderlich' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT id, fuhrpark_id FROM fahrer WHERE reset_token=$1 AND reset_expires_at > NOW() AND aktiv=true',
      [token]
    );
    if (!rows.length) return res.status(400).json({ error: 'Token ungueltig oder abgelaufen' });
    const { id, fuhrpark_id } = rows[0];
    const { hash, salt } = await hashPassword(password);
    await pool.query(
      'UPDATE fahrer SET password_hash=$1, salt=$2, reset_token=NULL, reset_expires_at=NULL WHERE id=$3',
      [hash, salt, id]
    );
    req.session.fahrerId   = id;
    req.session.fuhrparkId = fuhrpark_id;
    res.json({ success: true, redirect: '/schaden' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Interner Fehler' });
  }
});

module.exports = router;
