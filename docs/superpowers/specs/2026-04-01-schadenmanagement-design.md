# Schadenmanagement — Design Spec
Date: 2026-04-01

## Overview

A new **Digitales Schadenmanagement** feature for IMD Fleet Services. Scope: Phase 1 — customer-facing damage report page + form + backend storage + dashboard extension. This is an "All-in-Service" offering: the fleet client reports an accident, IMD takes over the entire process (workshops, insurance, lawyers, replacement car, 24/7).

**Approach chosen:** Option A — Static page + existing server. No new dependencies. Photos sent as email attachments (not stored on server, since Render has no persistent disk). Dashboard gets a new Schäden tab.

---

## Files

| File | Change |
|------|--------|
| `schaden.html` | New page — full presentation + 3-step form |
| `style.css` | Extended with `.scd-` prefixed classes for Schaden page |
| `server.js` | New endpoint `POST /api/schaden` + dashboard Schäden tab |
| `index.html` | Nav + footer link to `/schaden` |

---

## Database

New table `schaeden`:

```sql
CREATE TABLE IF NOT EXISTS schaeden (
  id              SERIAL PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  fall_nr         TEXT NOT NULL UNIQUE,        -- SCH-2026-0001
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
  status          TEXT DEFAULT 'Neu',          -- Neu | In Bearbeitung | Abgeschlossen
  ip              TEXT
);
```

**Fall-Nr generation:** `SCH-` + current year + 4-digit padded number based on `SELECT COALESCE(MAX(id), 0) + 1 FROM schaeden` — avoids gaps from COUNT(*) if rows are deleted. Example: `SCH-2026-0042`.

---

## `schaden.html` — Page Structure

Follows FLOTTIQ v5 design system exactly (same fonts: Sora + DM Sans, same CSS variables, same nav/footer as `index.html`).

### 1. Hero Section (dark/navy background)
- Title: „Digitales Schadenmanagement"
- Subtitle: „All-in-Service · 24/7/365"
- Badge: „Für IMD Fleet Services Kunden"
- Two buttons: „Schaden melden →" (scroll to form) + „Zur Startseite"

### 2. „Unser Service" Section (light background)
Eight feature cards in a 4×2 grid, each with SVG icon + title + one-line description:

| Icon | Title | Description |
|------|-------|-------------|
| phone | 24h Hotline | Rund um die Uhr erreichbar |
| map-pin | Fahrtenmessung ab Unfall | Dokumentation ab dem Schadensort |
| truck | Kostenloser Abschleppservice | Wir organisieren die Bergung |
| car | Kostenloser Unfallersatzwagen | Mobilität während der Reparatur |
| tool | Bundesweites Werkstattnetz | Geprüfte Partner in ganz Deutschland |
| shield | Rechtslage-Prüfung | Durch spezialisierte Verkehrsanwälte |
| settings | Reparatursteuerung | Überwachung des gesamten Prozesses |
| file-text | Digitale Schadenakte | Alle Dokumente zentral und digital |

### 3. „Unser Prozess" Section (dark background)
Horizontal timeline with 5 steps:
1. **Schaden melden** — Kunde meldet per Telefon, App oder Formular
2. **Erste Hilfe** — IMD koordiniert Abschleppen, Polizei, Ersatzwagen
3. **Begutachtung** — Unabhängiges Gutachten, Werkstattauswahl
4. **Reparatur** — IMD überwacht Reparaturprozess und Rechnungskontrolle
5. **Prozessende** — Fahrzeugübergabe, Abschluss aller Kommunikation

### 4. CTA Section (green background)
- Headline: „Schaden melden — wir übernehmen den Rest"
- Large button scrolling to form

### 5. Three-Step Form

**Progress bar** at top showing current step (1/2/3).

#### Step 1 — Kontaktdaten & Fahrzeug
- Firma / Unternehmen (optional)
- Fahrer Name (required)
- Telefon (required)
- E-Mail (required — for confirmation)
- Kennzeichen (required)
- Fahrzeugtyp / Marke & Modell (optional)
- Baujahr (optional)

„Weiter →" validates required fields before advancing.

#### Step 2 — Schadensdetails
- Unfalldatum (required)
- Uhrzeit (optional)
- Unfallort — Straße + Stadt (required)
- Fahrzeug fahrbereit? — large Ja/Nein visual toggle (required)
- Polizei gerufen? — Ja/Nein toggle
- Unfallgegner vorhanden? — Ja/Nein toggle
- Beschreibung (textarea, required, min 20 chars)

#### Step 3 — Fotos hochladen
- Drag-and-drop upload zone
- Accepts: JPG, PNG
- Max: 5 photos, 5MB each
- Shows thumbnail previews after selection
- Photo upload is mandatory (at least 1 photo required)
- Submit button: „Schaden melden →"

#### After Submit — Success Screen
No page reload. Form replaced with success state:
- Heading: „Ihr Schaden wurde gemeldet."
- Large case number: `SCH-2026-0001`
- Message: „Wir melden uns innerhalb von 2 Stunden bei Ihnen."
- Contact note: „Bei dringenden Fragen: +49 371 123 456" (IMD Fleet Services Notfallnummer — to be confirmed by client before launch)
- Button: „Zur Startseite"

---

## Backend — `POST /api/schaden`

Uses `multer` (already installed) for multipart form data including photos.

**Validation:**
- `fahrer_name`, `fahrer_telefon`, `fahrer_email`, `kennzeichen`, `beschreibung` — required
- At least 1 photo file required
- Max 5 photos, each ≤ 5MB

**Processing:**
1. Validate fields and files
2. Generate `fall_nr`: query `SELECT COUNT(*) FROM schaeden` for current year, pad to 4 digits
3. INSERT into `schaeden` table
4. Send notification email to IMD via Resend
5. Send confirmation email to client via Resend
6. Return JSON: `{ success: true, fall_nr: 'SCH-2026-0001' }`

**Email to IMD** (to `RECIPIENT_EMAIL` env var):
- Subject: `🚨 Neuer Schaden: SCH-2026-0001 — [Firma] — [Kennzeichen]`
- Body: all fields structured; „Fahrbereit: NEIN" highlighted if `fahrbereit = false`
- Attachments: all uploaded photos

**Confirmation email to client:**
- Subject: `Ihre Schadensmeldung SCH-2026-0001 wurde empfangen — IMD Fleet Services`
- Body: case number (large), „Wir melden uns innerhalb von 2 Stunden", IMD contact details

---

## Dashboard Extension — Tab „Schäden"

New tab in `/intern` dashboard alongside existing submissions view.

**Table columns:**
- Fall-Nr
- Datum
- Firma
- Fahrer
- Kennzeichen
- Fahrbereit (green ✓ / red ✗ badge)
- Status (dropdown: Neu → In Bearbeitung → Abgeschlossen)

**Row expand:** clicking a row reveals full case details inline (all fields, no separate page needed).

**Status update:** inline dropdown per row, PATCH request to `POST /api/schaden/:id/status`, updates DB immediately.

---

## Navigation Integration

**`index.html` nav:** add „Schadenmanagement" link in desktop nav and mobile menu pointing to `/schaden`.

**`index.html` footer:** add link under „Services" column.

---

## Out of Scope (Phase 1)

- Customer status tracking portal (check case by case number)
- Photo storage in cloud (Cloudinary/S3) — photos go as email attachments only
- Push notifications or SMS
- Workshop assignment workflow in dashboard
- Document generation (repair invoices, etc.)
