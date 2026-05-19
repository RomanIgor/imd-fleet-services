const { Pool } = require('pg');
const crypto   = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id          SERIAL PRIMARY KEY,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      firma       TEXT NOT NULL,
      name        TEXT NOT NULL,
      email       TEXT,
      telefon     TEXT NOT NULL,
      marke       TEXT,
      modell      TEXT,
      baujahr     TEXT,
      km          TEXT,
      fahrzeuge   TEXT,
      anmerkung   TEXT,
      status      TEXT DEFAULT 'Neu',
      ip          TEXT
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      username      TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      salt          TEXT NOT NULL,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schaeden (
      id              SERIAL PRIMARY KEY,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      fall_nr         TEXT UNIQUE,
      firma           TEXT,
      fahrer_name     TEXT NOT NULL,
      fahrer_email    TEXT,
      fahrer_telefon  TEXT NOT NULL,
      kennzeichen     TEXT NOT NULL,
      fahrzeugtyp     TEXT,
      baujahr         TEXT,
      unfall_datum    TEXT,
      unfall_uhrzeit  TEXT,
      unfall_ort      TEXT,
      fahrbereit      BOOLEAN,
      polizei_gerufen BOOLEAN,
      unfallgegner    BOOLEAN,
      beschreibung    TEXT NOT NULL,
      status          TEXT DEFAULT 'Neu',
      ip              TEXT
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS werkstaetten (
      id         SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      name       TEXT NOT NULL,
      city       TEXT,
      plz        TEXT,
      email      TEXT NOT NULL,
      services   TEXT,
      rating     NUMERIC(2,1) DEFAULT 5.0,
      aktiv      BOOLEAN DEFAULT true
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS fuhrparks (
      id            SERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      kontakt_email TEXT,
      telefon       TEXT,
      aktiv         BOOLEAN NOT NULL DEFAULT true,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fuhrpark_users (
      id            SERIAL PRIMARY KEY,
      fuhrpark_id   INTEGER NOT NULL REFERENCES fuhrparks(id),
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      aktiv         BOOLEAN NOT NULL DEFAULT false,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fahrer (
      id                 SERIAL PRIMARY KEY,
      fuhrpark_id        INTEGER NOT NULL REFERENCES fuhrparks(id),
      vorname            TEXT NOT NULL,
      nachname           TEXT NOT NULL,
      telefon            TEXT,
      email              TEXT UNIQUE,
      password_hash      TEXT,
      salt               TEXT,
      invite_token       TEXT,
      invite_expires_at  TIMESTAMPTZ,
      reset_token        TEXT,
      reset_expires_at   TIMESTAMPTZ,
      aktiv              BOOLEAN NOT NULL DEFAULT false,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    ALTER TABLE schaeden
      ADD COLUMN IF NOT EXISTS fahrer_id   INTEGER REFERENCES fahrer(id),
      ADD COLUMN IF NOT EXISTS fuhrpark_id INTEGER REFERENCES fuhrparks(id)
  `);
  await pool.query(`
    ALTER TABLE schaeden
      ADD COLUMN IF NOT EXISTS schuldfrage TEXT,
      ADD COLUMN IF NOT EXISTS fahrtart TEXT,
      ADD COLUMN IF NOT EXISTS unfall_strasse TEXT,
      ADD COLUMN IF NOT EXISTS unfall_plz TEXT,
      ADD COLUMN IF NOT EXISTS unfall_ort_name TEXT,
      ADD COLUMN IF NOT EXISTS personenschaden TEXT,
      ADD COLUMN IF NOT EXISTS polizei_aufgenommen TEXT,
      ADD COLUMN IF NOT EXISTS polizei_aktenzeichen TEXT,
      ADD COLUMN IF NOT EXISTS schadenart TEXT,
      ADD COLUMN IF NOT EXISTS km TEXT,
      ADD COLUMN IF NOT EXISTS opponent_holder TEXT,
      ADD COLUMN IF NOT EXISTS opponent_address TEXT,
      ADD COLUMN IF NOT EXISTS opponent_lastname TEXT,
      ADD COLUMN IF NOT EXISTS opponent_firstname TEXT,
      ADD COLUMN IF NOT EXISTS opponent_plate TEXT,
      ADD COLUMN IF NOT EXISTS opponent_type TEXT,
      ADD COLUMN IF NOT EXISTS opponent_phone TEXT,
      ADD COLUMN IF NOT EXISTS opponent_mobile TEXT,
      ADD COLUMN IF NOT EXISTS opponent_insurance TEXT,
      ADD COLUMN IF NOT EXISTS opponent_insurance_nr TEXT,
      ADD COLUMN IF NOT EXISTS opponent_damage TEXT,
      ADD COLUMN IF NOT EXISTS fahrer_adresse TEXT,
      ADD COLUMN IF NOT EXISTS fahrerlaubnis TEXT,
      ADD COLUMN IF NOT EXISTS fahrerlaubnis_datum TEXT,
      ADD COLUMN IF NOT EXISTS fahrerlaubnis_behoerde TEXT,
      ADD COLUMN IF NOT EXISTS fuehrerschein_nr TEXT,
      ADD COLUMN IF NOT EXISTS fuehrerschein_klassen TEXT,
      ADD COLUMN IF NOT EXISTS alkohol TEXT,
      ADD COLUMN IF NOT EXISTS drogen TEXT,
      ADD COLUMN IF NOT EXISTS blutprobe_feld TEXT,
      ADD COLUMN IF NOT EXISTS blutprobe_ergebnis TEXT,
      ADD COLUMN IF NOT EXISTS blutprobe_entnommen TEXT,
      ADD COLUMN IF NOT EXISTS blutprobe_ergebnis_detail TEXT,
      ADD COLUMN IF NOT EXISTS werkstatt_name TEXT,
      ADD COLUMN IF NOT EXISTS werkstatt_email TEXT,
      ADD COLUMN IF NOT EXISTS photo_labels JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS fahrer_confirmation_sent_at TIMESTAMPTZ
  `);

  const { rows } = await pool.query('SELECT COUNT(*) FROM users');
  if (parseInt(rows[0].count) === 0) {
    const u = process.env.DASH_USER || 'admin';
    const p = process.env.DASH_PASS;
    if (!p) throw new Error('DASH_PASS is required to seed the first admin user');
    const { hash, salt } = await hashPassword(p);
    await pool.query('INSERT INTO users (username, password_hash, salt) VALUES ($1,$2,$3)', [u, hash, salt]);
    console.log(`✓ Admin user "${u}" seeded`);
  }
  console.log('✓ DB ready');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, hash) => {
      if (err) reject(err);
      else resolve({ hash: hash.toString('hex'), salt });
    });
  });
}

function verifyPassword(password, hash, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key.toString('hex') === hash);
    });
  });
}

module.exports = { pool, initDB, hashPassword, verifyPassword };
