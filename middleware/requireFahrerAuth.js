function requireFahrerAuth(req, res, next) {
  const fid = req.session && req.session.fahrerId;
  if (fid) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Nicht eingeloggt' });
  res.redirect('/fahrer/login');
}

module.exports = requireFahrerAuth;
