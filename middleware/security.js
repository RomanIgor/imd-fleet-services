const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function logError(label, err) {
  console.error(`${label}:`, err && err.message ? err.message : err);
}

function sendError(res, status = 500, message = 'Interner Fehler') {
  return res.status(status).json({ error: message });
}

function ensureCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

function safeCompare(a, b) {
  const aa = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function csrfTokenRoute(req, res) {
  res.json({ csrfToken: ensureCsrfToken(req) });
}

function requireCsrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const exempt = new Set([
    '/api/maintenance-auth',
    '/api/logout',
    '/api/login',
    '/api/fahrer/logout',
    '/api/fahrer/login',
    '/api/fahrer/aktivieren',
    '/api/fahrer/reset-anfragen',
    '/api/fahrer/reset',
    '/submit',
    '/api/chat',
  ]);
  if (exempt.has(req.path)) return next();

  const expected = ensureCsrfToken(req);
  const received = req.get('x-csrf-token') || req.body?._csrf;
  if (!received || !safeCompare(received, expected)) {
    return res.status(403).json({ error: 'CSRF token ungültig' });
  }
  next();
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Versuche. Bitte versuchen Sie es in 15 Minuten erneut.' },
});

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Anfragen. Bitte versuchen Sie es in 60 Minuten erneut.' },
});

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Zu viele Anfragen. Bitte versuchen Sie es in 15 Minuten erneut.' },
});

const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { reply: 'Zu viele Anfragen. Bitte versuchen Sie es in 5 Minuten erneut.' },
});

module.exports = {
  authLimiter,
  chatLimiter,
  csrfTokenRoute,
  escapeHtml,
  formLimiter,
  logError,
  requireCsrf,
  resetLimiter,
  sendError,
};
