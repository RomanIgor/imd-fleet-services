require('dotenv').config();
const express   = require('express');
const session   = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path      = require('path');

const { pool, initDB }       = require('./db');
const setupMaintenance       = require('./middleware/maintenance');
const authRoutes             = require('./routes/auth');
const adminRoutes            = require('./routes/admin');
const schadenRoutes          = require('./routes/schaden');
const publicRoutes           = require('./routes/public');

const app  = express();
const port = process.env.PORT || 8000;

app.use(session({
  store: new pgSession({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'imd-fleet-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8h
}));
app.use(express.json());

setupMaintenance(app);

// Static files served after maintenance gate so protected assets require auth
app.use(express.static(path.join(__dirname)));

app.use(authRoutes);
app.use(adminRoutes);
app.use(schadenRoutes);
app.use(publicRoutes);

initDB().then(() => {
  app.listen(port, () => {
    console.log(`\n✓ IMD Fleet Services server running → http://localhost:${port}\n`);
  });
}).catch(err => {
  console.error('DB init failed:', err.message);
  process.exit(1);
});
