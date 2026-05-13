const express = require('express');
const router  = express.Router();
const { pool, verifyPassword } = require('../db');
const { authLimiter, logError, sendError } = require('../middleware/security');

router.post('/api/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT password_hash, salt FROM users WHERE username=$1', [username]);
    if (!result.rows.length) return res.json({ success: false, error: 'Falscher Benutzername oder Passwort' });
    const { password_hash, salt } = result.rows[0];
    const valid = await verifyPassword(password, password_hash, salt);
    if (valid) { req.session.user = username; res.json({ success: true }); }
    else res.json({ success: false, error: 'Falscher Benutzername oder Passwort' });
  } catch (err) {
    logError('Admin login error', err);
    sendError(res);
  }
});

router.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.get('/api/check-auth', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.user), user: req.session.user || null });
});

module.exports = router;
