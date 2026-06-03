# IMD Fleet Services — Light Mode Redesign

**Datum:** 2026-06-03  
**Scope:** Vollständige Neugestaltung von `index.html` + `style.css` auf Light Mode  
**Ansatz:** Full Rewrite des CSS-Systems — alle 12 Sektionen behalten, nur neu gestaltet

---

## Entscheidungen

| Frage | Entscheidung |
|---|---|
| Modus | Light Mode (weiß / hellgrau) |
| Scope | Alle 12 Sektionen — nur restylen, kein Inhalt entfernen |
| Akzentfarbe | Navy (#1a2540) + Blau (#2563eb) kombiniert |
| Hero-Layout | Split-Screen: weißes Panel links, Beton-Bild rechts |
| Implementierung | Full Rewrite CSS-Tokens + hero HTML anpassen |

---

## Design-System

### Farb-Tokens

```css
--bg:         #ffffff;          /* Haupthintergrund — weiße Sektionen */
--bg-s:       #f5f8fc;          /* Abwechselnde Sektionen (hellgrau-blau) */
--bg-deep:    #1a2540;          /* Dunkle Sektionen: Über uns, Anmelden, Trust Bar */
--bg-footer:  #0f172a;          /* Footer */
--bg-card:    #f8fafc;          /* Karten-Oberfläche */

--navy:       #1a2540;          /* Primär-CTA-Button, Überschriften */
--blue:       #2563eb;          /* Labels, Sekundär-Links, Akzente, Icons */
--blue-bg:    #eff6ff;          /* Heller Blau-Hintergrund (Badges, Tags) */
--blue-bd:    #bfdbfe;          /* Blauer Rahmen (Badges) */

--text-1:     #1a2540;          /* Überschriften */
--text-2:     #475569;          /* Fließtext */
--text-3:     #94a3b8;          /* Labels, gedimmt */
--text-inv:   #ffffff;          /* Text auf dunklem Hintergrund */
--text-inv-2: rgba(255,255,255,0.65); /* Fließtext auf dunkel */

--border:     #e2e8f0;          /* Trennlinien, Karten-Rahmen */
--border-s:   rgba(255,255,255,0.15); /* Rahmen auf dunklem Hintergrund */
```

### Philosophie

Kein Dark Mode mehr als Standard. Tiefe entsteht durch Wechsel zwischen `--bg` (weiß) und `--bg-s` (hellgrau-blau). Dunkle Sektionen (`--bg-deep`) werden sparsam eingesetzt — Trust Bar, Über uns, Anmelden-Formular, Footer. Das Beton-Bild (`new_background_header.jpeg`) erscheint nur im Hero rechts, voll sichtbar ohne Overlay.

### Typografie

- **Font:** IBM Plex Sans (unverändert)
- H1: `clamp(38px, 4vw, 60px)` · weight 800 · `#1a2540`, Akzentzeile `#2563eb`
- H2: `clamp(26px, 2.8vw, 44px)` · weight 800 · `#1a2540`
- Lead: 17px · weight 400 · `#475569` · line-height 1.75
- Labels: 10px · weight 700 · letter-spacing 0.12em · uppercase · `#2563eb`
- Body: 15px · `#475569` · line-height 1.65

### Border-Radius

- Buttons: 4px
- Karten, Felder: 8–10px
- Foto-Elemente: 12px
- Badges/Tags: 20px (Pill)

### Icons

Phosphor Icons **Regular** (Outline-Stil) in Content-Sektionen — 28–32px, `color:#2563eb`. In dunklen Sektionen: `color:#c8d8e8`.

---

## Sektionsstruktur

| # | ID | Hintergrund | Änderung |
|---|---|---|---|
| — | Nav | `#ffffff` sticky | Immer weiß, kein Farbwechsel |
| 1 | `#top` | `--bg-s` links + Beton rechts | Split-Screen Hero |
| — | Trust Bar | `--bg-deep` | Dunkelband direkt unter Hero |
| 2 | `#service` | `--bg` | Karten neu, Outline-Icons |
| 3 | `#prozess` | `--bg-s` | Schritt-Karten mit Navy-Badges |
| 4 | `#explainer` | `--bg` | Player Light-Theme |
| 5 | `#warum` | `--bg-s` | Benefit-Grid, Outline-Icons |
| 6 | `#ueber-uns` | `--bg-deep` | Bleibt dunkel, `about-office.jpg` als Foto-Element |
| 7 | `#expertise` | `--bg` | Stat-Zahlen groß, Partner-Logos |
| 8 | `#zielgruppe` | `--bg-s` | Persona-Karten weiß |
| 9 | `#rechner` | `--bg` | Slider blau, Ergebnis-Box hellblau |
| 10 | `#faq` | `--bg-s` | Accordion weiß, Akzent blau |
| 11 | `#anmelden` | `--bg-deep` | Dunkles Formular, blauer Submit |
| — | Footer | `--bg-footer` | 4 Spalten, weiße Links |

---

## Navigation

- **Hintergrund:** `#ffffff` permanent (kein Transparenz-/Scroll-Wechsel mehr)
- **Border:** `border-bottom: 1px solid #e2e8f0`
- **Logo:** `logo_dark.png` immer (kein Wechsel mehr nötig)
- **Nav-Links:** `color:#475569` → hover `#1a2540`
- **CTA-Button:** `background:#1a2540` · `color:#fff` · `border-radius:4px` · Text: "Fahrzeug anbieten →"
- `nav-hidden-for-concrete` Klasse wird entfernt

---

## Hero — Split-Screen

### Struktur
```
<section class="hero" id="top">
  <nav>...</nav>
  <div class="hero-split">
    <div class="hero-copy">   ← linkes Panel, weißer/hellgrauer Hintergrund
      ...
    </div>
    <div class="hero-photo">  ← rechtes Panel, Beton-Bild
      ...
    </div>
  </div>
  <div class="trust-bar">...</div>
</section>
```

### Hero-Copy (links)
1. Badge: `background:--blue-bg` · `color:--blue` · border `--blue-bd` · Pill-Form
2. H1: 3-zeilig, letzte Zeile `color:--blue`
3. Lead-Text: `color:--text-2` · weight 400 · max 2 Sätze
4. Primär-CTA: `background:--navy` · `color:#fff` · "Fahrzeug anbieten →"
5. Ghost-CTA: `border:1.5px solid --blue` · `color:--blue` · "Mehr erfahren"
6. KPI-Strip: 3 Felder auf `--bg-card` mit `--border` Rahmen

### Hero-Photo (rechts)
- `background: url('new_background_header.jpeg') center/cover`
- **Kein Overlay** — das eingeprägten IMD-Logo soll voll sichtbar bleiben
- Einziger Übergang: subtiler weißer Fader am linken Rand: `linear-gradient(to right, var(--bg-s), transparent 40px)`
- Mindesthöhe: `100%` (streckt sich auf volle Hero-Höhe)

### Hero-Hintergrund (links)
- `linear-gradient(135deg, #f0f5fb 0%, #e8eef8 100%)`

### Trust Bar
- `background:--bg-deep` (#1a2540)
- 4 Items horizontal: Schnelle Abwicklung · Kostenlose Abholung · Direkte Auszahlung · 100% Sicherheit
- Icon: kleines Quadrat `rgba(200,216,232,0.2)` · `border-radius:3px`
- Text: `#c8d8e8`

---

## Service (`#service`) — `--bg`

- Label + H2 zentriert
- 3-Spalten-Grid, responsive → 1 Spalte mobile
- Karte: `background:--bg-card` · `border:1px solid --border` · `border-radius:10px` · padding 28px
- Icon oben: Phosphor Regular, 32px, `color:--blue`
- Titel: weight 700 · `--text-1`
- Text: `--text-2`

---

## Prozess (`#prozess`) — `--bg-s`

- Label + H2 zentriert
- 3 Schritt-Karten horizontal mit Pfeil-Connector zwischen ihnen
- Schritt-Badge: `background:--navy` · `color:#fff` · `border-radius:50%` · 40px · weight 800
- Karte: `background:#fff` · `border:1px solid --border` · `border-radius:10px`
- Schritt-Titel: weight 700 · `--text-1`
- Schritt-Text: `--text-2`
- Pfeil-Connector: `color:--blue`

---

## Explainer (`#explainer`) — `--bg`

- Wrapper: `background:--bg-card` · `border:1px solid --border` · `border-radius:12px`
- Controls-Bar: `background:--navy` (#1a2540)
- Play-Button aktiv: `background:--blue` · `color:#fff`
- Play-Button inaktiv: `background:#f1f5f9` · `color:--text-1`
- Slide-Karten innen: `background:#fff` · `border:1px solid --border`
- Slide-Text: `--text-1` / `--text-2`
- Fortschrittsbalken: `background:--blue`
- `.mgp-wrap` Light-Mode-Override: neue `--bg`, `--bg-s`, `--text-1` Tokens setzen

---

## Warum wir (`#warum`) — `--bg-s`

- Label + H2 links
- 6 Benefit-Items in 3×2 Grid (oder 2×3)
- Item: Icon links (Phosphor Regular, `--blue`, 24px) + Titel weight 700 + Text `--text-2`
- Oder: Vergleichstabelle IMD vs. Klassisch — weiße Tabelle, Header `--navy`

---

## Über uns (`#ueber-uns`) — `--bg-deep`

- Zweispaltig: Foto links, Text rechts
- Foto: `about-office.jpg` · `border-radius:12px` · kein Overlay · volle Spaltenbreite
- Label: `#c8d8e8`
- H2: `color:#fff`
- Lead: `color:rgba(255,255,255,0.65)`
- 3 Feature-Icons darunter: Phosphor Regular, `color:#c8d8e8`

---

## Expertise (`#expertise`) — `--bg`

- Label + H2 links
- Stat-Grid: 4 Spalten mit Trennlinien
- Stat-Zahl: `clamp(32px, 4vw, 52px)` · weight 800 · `--text-1`
- Stat-Label: `--text-3` · weight 400 · 14px
- Trennlinien: `1px solid --border`
- Partner-Logos: mobile.de, DAT, TÜV NORD, DEKRA — Graustufen, Reihe horizontal

---

## Zielgruppe (`#zielgruppe`) — `--bg-s`

- Label + H2 zentriert
- Persona-Karten: `background:#fff` · `border:1px solid --border` · `border-radius:10px`
- Icon: Phosphor Regular, `--blue`
- Persona-Titel: weight 700 · `--text-1`
- Persona-Text: `--text-2`

---

## Rechner (`#rechner`) — `--bg`

- Label + H2 + Lead-Text
- Slider: `accent-color:--blue`
- Slider-Label: `--text-2`
- Ergebnis-Box: `background:--blue-bg` · `border:1px solid --blue-bd` · `border-radius:8px`
- Ergebnis-Zahl: `--text-1` · weight 800 · groß
- Ergebnis-Label: `--text-3`

---

## FAQ (`#faq`) — `--bg-s`

- Label + H2 zentriert
- Accordion-Items: `background:#fff` · `border:1px solid --border` · `border-radius:8px` · margin-bottom 8px
- Offen-Zustand: `border-left:3px solid --blue`
- Frage-Text: weight 600 · `--text-1`
- Antwort-Text: `--text-2`
- Chevron: `color:--blue`

---

## Anmelden (`#anmelden`) — `--bg-deep`

- Label: `#c8d8e8`
- H2: `color:#fff`
- Lead: `color:rgba(255,255,255,0.65)`
- Felder: `background:rgba(255,255,255,0.07)` · `border:1px solid rgba(255,255,255,0.15)` · `color:#fff` · `border-radius:6px`
- Placeholder: `rgba(255,255,255,0.35)`
- Submit-Button: `background:--blue` · `color:#fff` · `border-radius:4px` · weight 700

---

## Footer — `--bg-footer` (#0f172a)

- Logo-Variante: `logo_light.png` (weiß)
- 4 Spalten: Leistungen / Unternehmen / Rechtliches / Kontakt
- Spalten-Header: `#fff` · weight 700 · 11px uppercase
- Links: `#94a3b8` → hover `#fff`
- Kontakt-Icons: Phosphor Regular, `#c8d8e8`
- Trennlinie oben: `border-top:1px solid rgba(255,255,255,0.06)`
- Copyright: `#475569`

---

## Was entfällt / ändert sich

- Alle Dark-Mode-CSS-Tokens (`:root` mit `--bg:#1e2840` etc.) → durch neue Light-Mode-Tokens ersetzt
- `[data-theme="light"]` Overrides → nicht mehr nötig (Light ist jetzt Default)
- `nav-hidden-for-concrete` Klasse → entfernt
- `.hero-bg`, `.hero-noise`, `.hero-live-grid` → entfernt
- Dark Mode Toggle bleibt im Code, schaltet aber auf neues Dark-Theme um (nicht primär)
- `logo_light.png` / `logo_dark.png` Wechsel in Nav → entfällt (immer `logo_dark.png`)
- `new_background_header.jpeg` bleibt in `publicAssets` — wird im Hero verwendet

---

## Selbstprüfung

- **Platzhalter:** Keine TBD-Felder vorhanden
- **Konsistenz:** Alle 12 Sektionen + Trust Bar + Footer abgedeckt; keine Section hinzugefügt oder entfernt
- **Scope:** Nur `index.html` + `style.css` — `schaden.html`, `server.js`, andere Dateien bleiben unberührt
- **Token-Konsistenz:** `--blue` wird durchgehend für Akzente verwendet, `--navy` für primäre CTAs
- **Fotos:** `new_background_header.jpeg` (Hero), `about-office.jpg` (Über uns) — beide bereits in `publicAssets` whitelisted
