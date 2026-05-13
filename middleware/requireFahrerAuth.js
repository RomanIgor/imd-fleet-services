function requireFahrerAuth(req, res, next) {
  if (req.session && req.session.fahrerId) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Nicht eingeloggt' });
  res.redirect('/fahrer/login');
}

module.exports = requireFahrerAuth;
