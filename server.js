require('dotenv').config();
const express   = require('express');
const helmet    = require('helmet');
const session   = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path      = require('path');

const requiredEnv = ['DATABASE_URL', 'SESSION_SECRET', 'DASH_PASS', 'RESEND_API_KEY', 'RECIPIENT_EMAIL'];
const missingEnv = requiredEnv.filter(name => !process.env[name]);
if (missingEnv.length) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const { pool, initDB }       = require('./db');
const setupMaintenance       = require('./middleware/maintenance');
const authRoutes             = require('./routes/auth');
const adminRoutes            = require('./routes/admin');
const schadenRoutes          = require('./routes/schaden');
const publicRoutes           = require('./routes/public');
const fahrerRoutes           = require('./routes/fahrer');
const { csrfTokenRoute, requireCsrf } = require('./middleware/security');

const app  = express();
const port = process.env.PORT || 8000;

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(session({
  store: new pgSession({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'imd.sid',
  cookie: {
    maxAge: 8 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  }
}));
app.use(express.json({ limit: '1mb' }));

app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/api/csrf-token', csrfTokenRoute);
app.use(requireCsrf);

setupMaintenance(app);

app.use(fahrerRoutes);

const publicAssets = new Set([
  '/style.css',
  '/redesign.css',
  '/main.js',
  '/csrf-client.js',
  '/sw.js',
  '/manifest.json',
  '/logo_dark.png',
  '/logo_light.png',
  '/icon-192.png',
  '/icon-512.png',
  '/gruender.webp',
  '/image.jpg',
  '/upload-guides.png',
  '/design-assets/about-office.jpg',
  '/design-assets/form-car.jpg',
  '/design-assets/hero-office.jpg',
  '/design-assets/imd-hero-reference.png',
  '/design-assets/pwa-phones.jpg',
  '/design-assets/services-building.jpg',
]);
app.use((req, res, next) => {
  if ((req.method === 'GET' || req.method === 'HEAD') && publicAssets.has(req.path)) {
    return res.sendFile(path.join(__dirname, req.path));
  }
  next();
});

app.use(authRoutes);
app.use(adminRoutes);
app.use(schadenRoutes);
app.use(publicRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error('Request error:', err.message);
  if (err.code && err.code.startsWith('LIMIT_')) {
    const messages = {
      LIMIT_FILE_SIZE: 'Ein Foto ist zu gross. Bitte maximal 15 MB pro Foto hochladen.',
      LIMIT_FILE_COUNT: 'Es koennen maximal 5 Fotos hochgeladen werden.',
      LIMIT_FIELD_COUNT: 'Das Formular enthaelt zu viele Felder. Bitte laden Sie die Seite neu und versuchen Sie es erneut.',
      LIMIT_FIELD_VALUE: 'Eine Formulareingabe ist zu gross. Bitte pruefen Sie die Angaben und versuchen Sie es erneut.',
    };
    return res.status(400).json({
      success: false,
      error: messages[err.code] || 'Upload zu gross oder zu viele Felder.',
    });
  }
  if (err.message === 'Nur Bilddateien sind erlaubt') {
    return res.status(400).json({ success: false, error: err.message });
  }
  res.status(500).json({ error: 'Interner Fehler' });
});

initDB().then(() => {
  app.listen(port, () => {
    console.log(`\n✓ IMD Fleet Services server running → http://localhost:${port}\n`);
  });
}).catch(err => {
  console.error('DB init failed:', err.message);
  process.exit(1);
});
