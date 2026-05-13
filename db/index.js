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
