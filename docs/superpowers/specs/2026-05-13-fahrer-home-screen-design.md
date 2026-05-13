# Design — Fahrer Home Screen

**Datum:** 2026-05-13
**Status:** Approved
**Scope:** Restructurare `schaden.html` în mini-aplicație cu home screen + bottom nav funcțional

---

## Decizia Centrală

`schaden.html` trece de la "un singur formular" la o mini-aplicație cu 4 view-uri comutate prin JS. Fișierul rămâne unul singur — fără pagini noi.

---

## View-uri

| ID | Conținut | Default |
|---|---|---|
| `view-home` | Greeting + 4 carduri | ✓ |
| `view-form` | Formularul existent (intern neschimbat) | — |
| `view-faelle` | Lista schadenurilor proprii | — |
| `view-hilfe` | Contact IMD + FAQ existent | — |

`showView(name)` ascunde toate `.app-view` și face `display:block` pe cel selectat.

---

## Home Screen

### Greeting
- `GET /api/fahrer/me` la load → `vorname` + `fuhrpark_name`
- Afișaj: "Guten Tag, {vorname}" cu subtext "{fuhrpark_name}"

### 4 Carduri (2×2 grid)

| Card | Icon existent | Status | Acțiune |
|---|---|---|---|
| Schadenmanagement | `#ic-schaden` | **Activ** | `showView('form')` |
| Fahrzeugakte | `#ic-fahrzeugakte` | Bald | inactiv |
| Leasingdaten | `#ic-leasing` | Bald | inactiv |
| HU / UVV / Service | `#ic-service` | Bald | inactiv |

**Subtitluri:**
- Schadenmanagement → "Aktiv verfügbar"
- Fahrzeugakte → "Kennzeichen, FIN, Daten"
- Leasingdaten → "Laufzeit, KM, Vertrag"
- HU / UVV / Service → "Termine & Fristen"

**Carduri Bald:** vizibile, opacity redusă, badge "Bald", pointer-events: none.

**Icon system:** containerul `.imd-icon` existent (navy 3D glossy). Pentru Bald, o variantă gri (`.imd-icon--muted`): background gri deschis fără gradient navy.

---

## Bottom Nav (înlocuiește complet cel existent)

| Buton | Icon | Acțiune |
|---|---|---|
| Start | `#ic-home` (nou) | `showView('home')` |
| Meine Fälle | `#ic-faelle` (nou) | `showView('faelle')` |
| Hilfe | `#ic-hilfe` (nou) | `showView('hilfe')` |
| Abmelden | `#ic-logout` (nou) | `fahrerLogout()` |

Active state: indicator bar deasupra + culoare navy. Abmelden: roșu (`--red`).

Icoanele noi se adaugă în SVG defs (ca `<symbol>`).

---

## Meine Fälle View

### Date
`GET /api/fahrer/meine-schaeden` (endpoint nou, `requireFahrerAuth`)

```sql
SELECT fall_nr, kennzeichen, status, created_at
FROM schaeden
WHERE fahrer_id = $session.fahrerId
ORDER BY created_at DESC
```

### UI
- Card per schaden: `fall_nr` (monospace) · `kennzeichen` · dată formatată · status badge
- Status badges: Neu (gri) · In Bearbeitung (amber) · Abgeschlossen (verde)
- Empty state: "Noch keine Schadensmeldung. Nutzen Sie 'Schadenmanagement' um eine neue anzulegen."
- Header: titlu "Meine Fälle" + subtext în loc de greeting

---

## Hilfe View

- Date contact IMD: telefon, email, ore program
- Secțiunea FAQ existentă reutilizată (`renderFaq()` apelat la `showView('hilfe')`)

---

## Modificări Fișiere

| Fișier | Modificare |
|---|---|
| `schaden.html` | Wrap form în `#view-form` · Adaugă `#view-home` + `#view-faelle` + `#view-hilfe` · Înlocuire bottom nav · `showView()` + `loadMeineFaelle()` + `loadFahrerMe()` · 4 noi `<symbol>` în SVG defs · `.imd-icon--muted` în CSS |
| `routes/fahrer.js` | `GET /api/fahrer/meine-schaeden` (requireFahrerAuth) |

---

## Invariant important

`routes/schaden.js` INSERT setează deja `fahrer_id` din sesiune — nu necesită modificări.

---

## Exclus din scope (Phase 2)

- Detalii per schaden (click pe un caz → view detaliat)
- Filtrare / căutare în Meine Fälle
- Push notifications
- Fahrzeugakte / Leasingdaten / HU funcționale
