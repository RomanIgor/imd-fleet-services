function requireFahrerAuth(req, res, next) {
  const fid = req.session && req.session.fahrerId;
  console.log('[auth]', req.method, req.path, '| sid:', req.sessionID && req.sessionID.slice(0,8), '| fid:', fid, '| cookie:', !!(req.headers.cookie));
  if (fid) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Nicht eingeloggt' });
  res.redirect('/fahrer/login');
}

module.exports = requireFahrerAuth;
