# Design — Schema 1 + Schema 2: Mandantenfähigkeit & Fahrer-Onboarding

**Datum:** 2026-05-11  
**Status:** Approved  
**Scope:** Datenbankstruktur (Schema 1) + Fahrer-Login & Onboarding-Flow (Schema 2)

---

## Entscheidungen (Zusammenfassung)

| Thema | Entscheidung |
|---|---|
| Fuhrparkmanager Login | Nein — Phase 2. DB-Struktur jetzt anlegen, keine Routes. |
| Fahrer-Auth | Invite-Token → Passwort setzen → E-Mail+Passwort Login |
| Passwort vergessen | Magic Link Reset (kein klassischer Flow) |
| `/schaden` Auth | Nur noch mit Fahrer-Session zugänglich |
| Fahrer deaktivieren | Soft-delete (`aktiv=false`) + sofortige Session-Invalidierung |
| Fahrer löschen (DSGVO) | Anonimisierung: Vorname/Nachname/Telefon/E-Mail/Hash entfernt, `fahrer_id` in `schaeden` bleibt |

---

## Schema 1 — Datenbankstruktur

### Neue Tabelle: `fuhrparks`

```sql
CREATE TABLE fuhrparks (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  kontakt_email TEXT,
  telefon       TEXT,
  aktiv         BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Neue Tabelle: `fuhrpark_users` *(Struktur only — Phase 2)*

Tabelle wird jetzt angelegt, aber keine Routes und kein Login-Flow. Ermöglicht spätere Erweiterung ohne DB-Migration.

```sql
CREATE TABLE fuhrpark_users (
  id            SERIAL PRIMARY KEY,
  fuhrpark_id   INTEGER NOT NULL REFERENCES fuhrparks(id),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  aktiv         BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Neue Tabelle: `fahrer`

```sql
CREATE TABLE fahrer (
  id                 SERIAL PRIMARY KEY,
  fuhrpark_id        INTEGER NOT NULL REFERENCES fuhrparks(id),
  vorname            TEXT NOT NULL,
  nachname           TEXT NOT NULL,
  telefon            TEXT,
  email              TEXT UNIQUE,
  password_hash      TEXT,
  invite_token       TEXT,
  invite_expires_at  TIMESTAMPTZ,
  reset_token        TEXT,
  reset_expires_at   TIMESTAMPTZ,
  aktiv              BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

`email` ist nullable (wird bei DSGVO-Löschung auf NULL gesetzt). `UNIQUE` greift nur auf non-NULL Werte (PostgreSQL-Standard).  
Bei DSGVO-Löschung: `vorname = 'Gelöscht'`, `nachname = 'Gelöscht'`, `telefon = NULL`, `email = NULL`.

### Erweiterte Tabelle: `schaeden`

Zwei neue Spalten werden per Migration hinzugefügt — nullable, damit bestehende Zeilen erhalten bleiben:

```sql
ALTER TABLE schaeden
  ADD COLUMN fahrer_id   INTEGER REFERENCES fahrer(id),
  ADD COLUMN fuhrpark_id INTEGER REFERENCES fuhrparks(id);
```

---

## Schema 2 — Fahrer-Onboarding & Login-Flow

### Schritt 1 — IMD legt Fahrer an

- IMD Admin gibt Vorname, Nachname, E-Mail, Telefon (optional) und Fuhrpark im Dashboard ein
- System erzeugt `invite_token` via `crypto.randomBytes(32).toString('hex')`
- `invite_expires_at = NOW() + 72h`
- `aktiv = false`
- Einladungs-E-Mail automatisch versendet (Resend)

**Route:** `POST /api/fahrer` — Auth: IMD Admin

### Schritt 2 — Einladungs-E-Mail

Inhalt: Einladungslink `${BASE_URL}/fahrer/aktivieren?token=<hex>`  
`BASE_URL` kommt aus der Umgebungsvariable (z.B. `https://app.imd-fleet.de`). Neue Env-Variable in `.env` und Hetzner-Deployment erforderlich.  
Token: 72 Stunden gültig, einmalig verwendbar (wird nach Aktivierung gelöscht).

### Schritt 3 — Fahrer aktiviert Account & setzt Passwort

- `GET /fahrer/aktivieren?token=<hex>` → HTML-Seite mit Passwort-Formular
- Server prüft: Token existiert? Nicht abgelaufen? Fahrer noch nicht aktiv?
- Bei Fehler (Token abgelaufen etc.): Fehlermeldung mit Link "Neuen Link anfordern"
- Bei Erfolg: Passwort mit `crypto.scrypt` hashen, `aktiv = true`, Token löschen, Session erstellen → Redirect zu `/schaden`

**Routes:**  
- `GET /fahrer/aktivieren` — Token-Validierung + Formular (kein Auth)  
- `POST /api/fahrer/aktivieren` — Passwort speichern + aktivieren (kein Auth, Token als Hidden-Field im HTML-Formular)

### Schritt 4 — Login (E-Mail + Passwort)

- `GET /fahrer/login` → HTML-Seite
- `POST /api/fahrer/login` → E-Mail + Passwort prüfen, `aktiv = true` prüfen
- Session: `req.session.fahrerId`, `req.session.fuhrparkId`
- Redirect zu `/schaden` — Formular vorausgefüllt mit Name, E-Mail, Fuhrpark

### Schritt 5 — Passwort vergessen (Magic Link Reset)

- `GET /fahrer/passwort-vergessen` → Seite mit E-Mail-Eingabe
- `POST /api/fahrer/reset-anfragen` → `reset_token` erzeugen (15 Min gültig) → E-Mail mit Link
- `GET /fahrer/passwort-reset?token=<hex>` → Neues-Passwort-Formular
- `POST /api/fahrer/reset` → Token prüfen, Passwort hashen, Token löschen, Session erstellen → Redirect zu `/schaden`

**Sicherheit:** Gleiche Antwort ob E-Mail existiert oder nicht ("Wenn die E-Mail bekannt ist, wurde ein Link gesendet") — verhindert E-Mail-Enumeration.

---

## Fahrer deaktivieren & löschen (DSGVO)

### Deaktivieren

- `PATCH /api/fahrer/:id/status` mit `{ aktiv: false }` — Auth: IMD Admin
- Setzt `aktiv = false`
- Invalidiert sofort alle aktiven Sessions: löscht Zeilen aus `session`-Tabelle wo `sess::jsonb->>'fahrerId' = ':id'`
- Fahrer kann sich nicht mehr einloggen

### Löschen / Anonymisieren (DSGVO Art. 17)

- `DELETE /api/fahrer/:id` — Auth: IMD Admin
- Setzt `vorname = 'Gelöscht'`, `nachname = 'Gelöscht'`, `telefon = NULL`, `email = NULL`, `password_hash = NULL`, `invite_token = NULL`, `reset_token = NULL`
- `fahrer_id` bleibt in `schaeden` für historische Integrität
- Keine echte DB-Löschung — verhindert FK-Verletzungen

---

## Neue Routes — Übersicht

| Methode | Route | Zweck | Auth |
|---|---|---|---|
| GET | `/fahrer/login` | Login-Seite | — |
| POST | `/api/fahrer/login` | Authentifizierung → Session | — |
| POST | `/api/fahrer/logout` | Session beenden | Fahrer |
| GET | `/fahrer/aktivieren` | Aktivierungsseite | Token (Query) |
| POST | `/api/fahrer/aktivieren` | Passwort setzen + aktivieren | Token (Body) |
| GET | `/fahrer/passwort-vergessen` | Reset-Seite | — |
| POST | `/api/fahrer/reset-anfragen` | Reset-Token erzeugen + E-Mail | — |
| GET | `/fahrer/passwort-reset` | Neues-Passwort-Formular | Token (Query) |
| POST | `/api/fahrer/reset` | Passwort speichern | Token (Body) |
| GET | `/api/fahrer` | Alle Fahrer auflisten | IMD Admin |
| POST | `/api/fahrer` | Fahrer anlegen + Einladung senden | IMD Admin |
| PATCH | `/api/fahrer/:id/status` | Fahrer deaktivieren/reaktivieren | IMD Admin |
| DELETE | `/api/fahrer/:id` | Fahrer anonymisieren (DSGVO) | IMD Admin |
| GET | `/api/fuhrparks` | Alle Fuhrparks | IMD Admin |
| POST | `/api/fuhrparks` | Fuhrpark anlegen | IMD Admin |

---

## Änderungen an bestehenden Routes/Dateien

| Was | Änderung |
|---|---|
| `GET /schaden` | Wechselt von `requireAuth` (IMD-Session) zu `requireFahrerAuth` (Fahrer-Session) |
| `POST /api/schaden` | Liest `fahrerId` + `fuhrparkId` aus Session → speichert in `schaeden` |
| `db/index.js` | Neue `CREATE TABLE` Statements für `fuhrparks`, `fuhrpark_users`, `fahrer` + `ALTER TABLE schaeden` |
| `server.js` | Mountet neue Router: `routes/fahrer.js`, `routes/fuhrparks.js` |

---

## Neue Dateien

| Datei | Inhalt |
|---|---|
| `routes/fahrer.js` | Alle Fahrer-Routes (Login, Aktivierung, Reset, CRUD) |
| `routes/fuhrparks.js` | Fuhrpark CRUD |
| `middleware/requireFahrerAuth.js` | Session-Check für Fahrer (`req.session.fahrerId`) |
| `fahrer-login.html` | Login-Seite für Fahrer |
| `fahrer-aktivieren.html` | Account-Aktivierung + Passwort setzen |
| `fahrer-passwort.html` | Passwort-vergessen + Reset-Seite |

---

## Bewusst ausgelassen (Phase 2)

- Fuhrparkmanager Login-Flow (Tabelle `fuhrpark_users` existiert, keine Routes)
- Fahrer sieht eigene Schadensmeldungen (nur einreichen, nicht einsehen)
- Massen-Import von Fahrern (CSV-Upload)
- Einladung erneut senden (Token erneuern)
