const express      = require('express');
const router       = express.Router();
const path         = require('path');
const PizZip       = require('pizzip');
const { pool, hashPassword } = require('../db');
const requireAdmin = require('../middleware/requireAdmin');

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get('/api/stats', requireAdmin, async (req, res) => {
  try {
    const [total, today, neu] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM submissions'),
      pool.query("SELECT COUNT(*) FROM submissions WHERE created_at > NOW() - INTERVAL '24 hours'"),
      pool.query("SELECT COUNT(*) FROM submissions WHERE status = 'Neu'")
    ]);
    res.json({
      total: parseInt(total.rows[0].count),
      today: parseInt(today.rows[0].count),
      neu:   parseInt(neu.rows[0].count)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Submissions ───────────────────────────────────────────────────────────────
router.get('/api/submissions', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM submissions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/api/submissions/:id', requireAdmin, async (req, res) => {
  try {
    const allowed = ['status','firma','name','email','telefon','marke','modell','baujahr','km','anmerkung'];
    const fields = allowed.filter(f => req.body[f] !== undefined);
    if (!fields.length) return res.json({ success: false, error: 'Keine Felder angegeben' });
    const set  = fields.map((f, i) => `${f}=$${i + 1}`).join(', ');
    const vals = [...fields.map(f => req.body[f]), req.params.id];
    await pool.query(`UPDATE submissions SET ${set} WHERE id=$${vals.length}`, vals);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT username, created_at FROM users ORDER BY created_at');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/api/users', requireAdmin, async (req, res) => {
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

router.delete('/api/users/:username', requireAdmin, async (req, res) => {
  if (req.params.username === req.session.user)
    return res.json({ success: false, error: 'Sie können sich nicht selbst löschen' });
  try {
    await pool.query('DELETE FROM users WHERE username=$1', [req.params.username]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Schaeden (admin view) ─────────────────────────────────────────────────────
router.get('/api/schaeden', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schaeden ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/api/schaeden/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body;
  const allowed = ['Neu', 'In Bearbeitung', 'Abgeschlossen'];
  if (!allowed.includes(status)) return res.json({ success: false, error: 'Ungültiger Status' });
  try {
    await pool.query('UPDATE schaeden SET status=$1 WHERE id=$2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Werkstaetten (write — admin only) ────────────────────────────────────────
router.post('/api/werkstaetten', requireAdmin, async (req, res) => {
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

router.patch('/api/werkstaetten/:id', requireAdmin, async (req, res) => {
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

router.delete('/api/werkstaetten/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM werkstaetten WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Vertrag export ────────────────────────────────────────────────────────────
router.post('/api/vertrag/export', requireAdmin, (req, res) => {
  try {
    const { an_firmierung, ag_firma, ort_an, ort_ag, datum } = req.body;
    if (!ag_firma || !datum) return res.status(400).json({ error: 'Pflichtfelder fehlen' });

    const b64Path  = '/etc/secrets/rahmenvertrag.b64';
    const docxPath = path.join(__dirname, '..', 'Rahmenvertrag_Version1.docx');
    const fs = require('fs');
    const buf = fs.existsSync(b64Path)
      ? Buffer.from(fs.readFileSync(b64Path, 'utf8').trim(), 'base64')
      : fs.readFileSync(docxPath);

    const zip = new PizZip(buf);
    let xml = zip.file('word/document.xml').asText();

    const escXml = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const anFirm = an_firmierung || 'IMD Fleet Services';
    const ortAN  = ort_an || 'Ort';
    const ortAG  = ort_ag || 'Ort';

    xml = xml.replace('IMD Fleet Services [vollständige Firmierung + Adresse]', escXml(anFirm));
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

module.exports = router;
