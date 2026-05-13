# Design — Fahrer & Fuhrpark Admin UI

**Datum:** 2026-05-13  
**Status:** Approved  
**Scope:** IMD Admin Dashboard — Verwaltung von Fuhrparks und Fahrern in `index.html`

---

## Entscheidungen (Zusammenfassung)

| Thema | Entscheidung |
|---|---|
| Sidebar-Platzierung | Zwei neue Top-Level-Einträge: 🏢 Fuhrparks + 👤 Fahrer (vor Fahrzeuge) |
| Panel-Layout | Split: Tabelle links · Formular rechts (immer sichtbar) |
| Fuhrpark löschen/deaktivieren | Phase 2 — nicht im Scope |
| Fahrer deaktivieren | ⏸/▶ Toggle-Button → PATCH /api/fahrer/:id/status |
| Fahrer DSGVO-Löschen | 🗑 mit Inline-Bestätigung ("Wirklich löschen? Ja / Nein") — kein Modal |
| Status-Badges | 3 Zustände: Aktiv · Inaktiv · Einladung offen |
| Fuhrpark-Dropdown | Wird beim Panel-Öffnen per GET /api/fuhrparks geladen |

---

## Sidebar

Zwei neue Einträge ganz oben, vor dem bestehenden "Fahrzeuge"-Abschnitt:

```
📊 Dashboard          (bestehend)
──────────────────
🏢 Fuhrparks          ← neu
👤 Fahrer             ← neu
──────────────────
🚗 Fahrzeuge          (bestehend)
🚨 Schäden            (bestehend)
...
```

Technisch: zwei neue `dsb-item` mit `onclick="showPanel('dFuhrparks', this)"` bzw. `showPanel('dFahrer', this)`.

---

## Panel: Fuhrparks (`dFuhrparks`)

### Layout

Split-Layout (60/40):

**Links — Tabelle** (`GET /api/fuhrparks`):

| Spalte | Quelle |
|---|---|
| Name | `fuhrparks.name` |
| Kontakt-E-Mail | `fuhrparks.kontakt_email` |
| Telefon | `fuhrparks.telefon` |
| Erstellt am | `fuhrparks.created_at` (deutsches Format) |

Keine Aktionen — Fuhrparks können in Phase 1 nicht deaktiviert oder gelöscht werden.

**Rechts — Formular** (`POST /api/fuhrparks`):

| Feld | Typ | Pflicht |
|---|---|---|
| Name | Text | Ja |
| Kontakt-E-Mail | Email | Nein |
| Telefon | Text | Nein |

Button: "Fuhrpark anlegen →"  
Nach Erfolg: Formular leert sich, Tabelle lädt neu.  
Bei Fehler: rote Fehlermeldung unter dem Button.

---

## Panel: Fahrer (`dFahrer`)

### Layout

Split-Layout (60/40):

**Links — Tabelle** (`GET /api/fahrer`):

| Spalte | Quelle |
|---|---|
| Name | `vorname + ' ' + nachname` |
| Fuhrpark | `fuhrpark_name` (aus JOIN) |
| E-Mail | `fahrer.email` |
| Status | Badge (siehe unten) |
| Aktionen | Buttons (siehe unten) |

### Status-Badges

| Badge | Farbe | Bedingung |
|---|---|---|
| Aktiv | Grün (`#dcfce7 / #166534`) | `aktiv = true` |
| Inaktiv | Rot (`#fee2e2 / #991b1b`) | `aktiv = false` AND `password_hash IS NOT NULL` |
| Einladung offen | Gelb (`#fef3c7 / #92400e`) | `aktiv = false` AND `invite_token IS NOT NULL` |

### Aktionen pro Zeile

**Deaktivieren / Reaktivieren:**
- Fahrer aktiv → Button "⏸ Deaktivieren" → PATCH `/api/fahrer/:id/status` mit `{aktiv: false}`
- Fahrer inaktiv → Button "▶ Reaktivieren" → PATCH `/api/fahrer/:id/status` mit `{aktiv: true}`
- Fahrer mit "Einladung offen": keine Deaktivieren-Aktion (noch nicht aktiv)

**DSGVO Löschen:**
- Button "🗑" → wird ersetzt durch Inline-Bestätigung: `"Wirklich löschen? [Ja, anonymisieren] [Abbrechen]"`
- Bestätigt → DELETE `/api/fahrer/:id` → Tabelle lädt neu
- Abgebrochen → Buttons kehren zurück
- Nach Anonymisierung bleibt die Zeile in der Tabelle nicht mehr sichtbar (Zeile mit `email = NULL` und `vorname = 'Gelöscht'` wird aus der Anzeige gefiltert)

**Rechts — Formular** (`POST /api/fahrer`):

| Feld | Typ | Pflicht |
|---|---|---|
| Vorname | Text | Ja |
| Nachname | Text | Ja |
| E-Mail | Email | Ja |
| Telefon | Text | Nein |
| Fuhrpark | Dropdown (`GET /api/fuhrparks`) | Ja |

Button: "Anlegen + Einladung senden →"  
Dropdown wird beim Öffnen des Panels geladen.  
Nach Erfolg: Formular leert sich, Tabelle lädt neu, Erfolgsmeldung.  
Bei Fehler 409 (E-Mail bereits vergeben): spezifische Fehlermeldung.

---

## Neue JS-Funktionen

| Funktion | Zweck |
|---|---|
| `loadFuhrparks()` | GET /api/fuhrparks → Tabelle befüllen |
| `createFuhrpark()` | POST /api/fuhrparks → anlegen + Tabelle neu laden |
| `loadFahrer()` | GET /api/fahrer → Tabelle befüllen + Status-Badges rendern |
| `createFahrer()` | POST /api/fahrer → anlegen + Einladungs-E-Mail + Tabelle neu laden |
| `toggleFahrerStatus(id, aktiv)` | PATCH /api/fahrer/:id/status → deaktivieren/reaktivieren |
| `deleteFahrer(id, btn)` | Inline-Bestätigung → DELETE /api/fahrer/:id → Tabelle neu laden |

`showPanel()` wird so erweitert, dass beim Öffnen von `dFuhrparks` automatisch `loadFuhrparks()` aufgerufen wird, und beim Öffnen von `dFahrer` automatisch `loadFahrer()` + Fuhrpark-Dropdown befüllt wird.

---

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `index.html` | 2 neue `dsb-item` in Sidebar + 2 neue `dp`-Panels + 6 neue JS-Funktionen |

Keine neuen Dateien, keine Backend-Änderungen — alle API-Routen existieren bereits.

---

## Bewusst ausgelassen (Phase 2)

- Fuhrpark deaktivieren / löschen
- Einladung erneut senden (Token erneuern)
- Fahrer-Detail-Ansicht mit Schadenhistorie
- Suche / Filter in der Fahrer-Tabelle
