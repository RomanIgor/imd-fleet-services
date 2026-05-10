# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IMD Fleet Services** — German B2B SaaS platform for fleet vehicle damage management (Schadenmanagement) and fleet purchase (Flottenankauf). Built as a Node.js/Express app with PostgreSQL and server-side session auth.

## Running Locally

```bash
# Requires a .env file with DATABASE_URL, SESSION_SECRET, RESEND_API_KEY, RECIPIENT_EMAIL
node server.js
# Then open: http://localhost:8000
```

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Express session secret |
| `RESEND_API_KEY` | Resend email API key |
| `RECIPIENT_EMAIL` | Email address for inbound notifications |
| `DASH_USER` / `DASH_PASS` | Initial admin credentials (seeded on first run) |
| `PORT` | Server port (default: 8000) |

## Architecture

```
server.js       — Express app (all routes, DB init, email logic)
index.html      — Main frontend (landing page + dashboard)
schaden.html    — Schadensmeldung form (protected, session-auth required)
main.js         — Frontend JavaScript
style.css       — Global styles
```

**Stack:**
- **Runtime:** Node.js + Express 5
- **Database:** PostgreSQL (via `pg` Pool), sessions stored in DB via `connect-pg-simple`
- **Auth:** Express sessions + `crypto.scrypt` password hashing (no bcrypt at runtime)
- **Email:** Resend SDK
- **File uploads:** Multer (in-memory, for photo attachments on damage reports)
- **DOCX generation:** PizZip (fills placeholders in `Rahmenvertrag_Version1.docx`)

## Database Tables

| Table | Purpose |
|---|---|
| `submissions` | Fleet vehicle purchase inquiries from the contact form |
| `users` | Dashboard admin users |
| `schaeden` | Damage reports (Schadensmeldungen) |
| `session` | Express sessions (auto-created by connect-pg-simple) |

## Key Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | — | Serves `index.html` (landing page) |
| `GET` | `/intern` | — | Serves `index.html` (dashboard login entry) |
| `GET` | `/schaden` | Session | Serves `schaden.html` (damage report form) |
| `POST` | `/submit` | — | Submit fleet purchase inquiry → DB + email |
| `POST` | `/api/login` | — | Login |
| `POST` | `/api/logout` | — | Logout |
| `GET` | `/api/check-auth` | — | Check session status |
| `GET` | `/api/stats` | Session | Dashboard stats |
| `GET` | `/api/submissions` | Session | All purchase inquiries |
| `PATCH` | `/api/submissions/:id` | Session | Update inquiry |
| `GET` | `/api/users` | Session | List admin users |
| `POST` | `/api/users` | Session | Create admin user |
| `DELETE` | `/api/users/:username` | Session | Delete admin user |
| `POST` | `/api/schaden` | — | Submit damage report → DB + email to IMD + confirmation to driver |
| `GET` | `/api/schaeden` | Session | All damage reports |
| `PATCH` | `/api/schaeden/:id/status` | Session | Update damage report status |
| `POST` | `/api/vertrag/export` | Session | Generate filled Rahmenvertrag DOCX |

## Damage Report Flow

1. Driver submits form at `/schaden` (with up to 5 photos)
2. Row inserted into `schaeden`, fall number generated: `SCH-{year}-{0001}`
3. Two emails sent via Resend: one to IMD (with photos attached), one confirmation to the driver

## Icon System

Toate iconițele modulelor folosesc **IMD Icon System** — CSS-only, fără CDN, fără AI, consistent automat.

### Cum funcționează

- **Container**: `<div class="imd-icon">` — navy 3D glossy, CSS radial gradient + glass shine
- **Simboluri**: Phosphor Icons Fill (viewBox `0 0 256 256`), definite ca `<symbol id="ic-*">` în SVG defs din `schaden.html`
- **Utilizare**: `<svg width="28" height="28" viewBox="0 0 256 256"><use href="#ic-schaden"/></svg>`

### Simboluri existente

| ID | Modul |
|---|---|
| `#ic-schaden` | Schadenmanagement (shield-warning) |
| `#ic-fahrzeug` | car — basis path, reused in composite icons |
| `#ic-fahrzeugakte` | Fahrzeugakte module tile (car + folder badge) |
| `#ic-fahrzeugdaten` | Fahrzeugdaten form section (car + gauge badge) |
| `#ic-leasing` | Leasingdaten (receipt) |
| `#ic-service` | HU / UVV / Service (calendar-check) |
| `#ic-fahrer` | Fahrerdaten (user) |
| `#ic-fuehrerschein` | Führerschein & Adresse (identification-card) |
| `#ic-schadendaten` | Schadendaten — Wann/Wo/Wie (clipboard-text) |
| `#ic-blutprobe` | Alkohol / Drogen / Blutprobe (drop/liquid) |
| `#ic-polizei` | Polizei & Unfallgegner (shield-star) |
| `#ic-kamera` | Bilder & Dokumente (camera) |
| `#ic-werkstatt` | Partnerwerkstatt finden (wrench) |
| `#ic-zusammenfassung` | Zusammenfassung / Review (list-checks) |
| `#ic-standort` | Ausgewählte Werkstatt (map-pin) |

### Adăugare icoană nouă

1. Caută path-ul pe [phosphoricons.com](https://phosphoricons.com) → style **Fill**
2. Adaugă în SVG defs din `schaden.html`:
   ```html
   <symbol id="ic-nou" viewBox="0 0 256 256">
     <path fill="currentColor" d="...path..."/>
   </symbol>
   ```
3. Folosește: `<div class="imd-icon"><svg width="28" height="28" viewBox="0 0 256 256"><use href="#ic-nou"/></svg></div>`

### Preview

`icon_preview.html` — fișier local pentru vizualizare și testare icon-uri noi (toggle light/dark).

## Deployment (Hetzner)

Currently hosted on Hetzner. The DOCX template secret is mounted at `/etc/secrets/rahmenvertrag.b64` (base64-encoded). Falls back to local `Rahmenvertrag_Version1.docx` if not found.
