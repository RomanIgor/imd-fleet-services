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
    res.status(500).json({ error: err.message });
  }
});

// ── FAHRER — IMD Admin CRUD ───────────────────────────────────────────────────

router.get('/api/fahrer', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT f.id, f.vorname, f.nachname, f.telefon, f.email, f.aktiv, f.created_at,
             fp.name AS fuhrpark_name, fp.id AS fuhrpark_id,
             (f.invite_token IS NOT NULL) AS has_invite_token
      FROM fahrer f
      JOIN fuhrparks fp ON fp.id = f.fuhrpark_id
      WHERE f.vorname != 'Gelöscht'
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
    req.session.fahrerId   = id;
    req.session.fuhrparkId = fuhrpark_id;
    res.json({ success: true, redirect: '/schaden' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

// ── Schaden form — requires Fahrer session ────────────────────────────────────
// Mounted BEFORE express.static in server.js so this route takes priority

router.get('/schaden', requireFahrerAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'schaden.html'));
});

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
    const reset_expires_at = new Date(Date.now() + 15 * 60 * 1000);
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
    req.session.fahrerId   = id;
    req.session.fuhrparkId = fuhrpark_id;
    res.json({ success: true, redirect: '/schaden' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
