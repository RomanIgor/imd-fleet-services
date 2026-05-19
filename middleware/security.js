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
  res.setHeader('Cache-Control', 'no-store');
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
  skipSuccessfulRequests: true,
  message: { error: 'Zu viele Versuche. Bitte versuchen Sie es in 15 Minuten erneut.' },
});

const fahrerAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Zu viele falsche Anmeldeversuche. Bitte nutzen Sie "Passwort vergessen", um ein neues Passwort zu setzen.' },
});

const resetRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Anfragen. Bitte versuchen Sie es in 15 Minuten erneut.' },
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Versuche. Bitte fordern Sie einen neuen Passwort-Link an.' },
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
  fahrerAuthLimiter,
  formLimiter,
  logError,
  passwordResetLimiter,
  requireCsrf,
  resetRequestLimiter,
  sendError,
};
