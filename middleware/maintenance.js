const express = require('express');

const MAINTENANCE_PUBLIC = [
  '/schaden', '/sw.js', '/manifest.json', '/icon-192.png', '/icon-512.png',
  '/logo_dark.png', '/logo_light.png', '/maintenance',
  '/api/login', '/api/logout', '/api/check-auth',
  '/api/werkstaetten', '/api/schaden', '/api/chat',
  '/fahrer/login', '/fahrer/aktivieren', '/fahrer/passwort-vergessen', '/fahrer/passwort-reset',
  '/api/fahrer/login', '/api/fahrer/aktivieren', '/api/fahrer/logout',
  '/api/fahrer/passwort-vergessen', '/api/fahrer/passwort-reset',
];

function setupMaintenance(app) {
  if (!process.env.MAINTENANCE_PASS) return;

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
    if (req.session && (req.session.maintenanceAuth || req.session.user || req.session.fahrerId)) return next();
    if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Maintenance' });
    req.session.maintenanceRedirect = req.path;
    res.redirect('/maintenance');
  });
}

module.exports = setupMaintenance;
