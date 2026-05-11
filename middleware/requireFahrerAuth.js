function requireFahrerAuth(req, res, next) {
  if (req.session && req.session.fahrerId) return next();
  if (req.accepts('html')) return res.redirect('/fahrer/login');
  res.status(401).json({ error: 'Nicht eingeloggt' });
}

module.exports = requireFahrerAuth;
