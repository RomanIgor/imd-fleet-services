# IMD Fleet Services — Homepage Redesign

**Datum:** 2026-06-02  
**Scope:** Vollständige Überarbeitung von `index.html` + `style.css`  
**Ansatz:** Full Rewrite — neues CSS-System + HTML bereinigt, kein Layer über altem Code

---

## Entscheidungen (aus Brainstorming)

| Frage | Entscheidung |
|---|---|
| Scope | Gesamtes Landing Page (`index.html`) |
| Fidelität zur Referenz | C — Referenz als Ausgangspunkt, moderner und hochwertiger |
| Farbpalette | B — Kalte Präzision |
| Hero-Layout | C — Zweispaltig: Text links, Dashboard-Karte rechts |
| Implementierungsansatz | A — Full Rewrite |

---

## Design-System

### Farb-Tokens

```css
--bg:        #12161C;   /* Haupthintergrund */
--bg-s:      #161B22;   /* Kartenoberfläche, helle Sektionen */
--bg-deep:   #0E1218;   /* Tiefer Hintergrund, Trust Bar, Footer */
--bg-card:   rgba(238,242,246,0.04);  /* Karten-Oberfläche */

--acc:       #C8D8E8;   /* Eisblau — Hauptakzent */
--acc-dim:   rgba(200,216,232,0.18);  /* Akzentfläche */
--btn-bg:    #1E2E40;   /* Primärbutton-Hintergrund */
--amber:     #D4A840;   /* Status / Hinweis */

--text-1:    #EEF2F6;   /* Überschriften */
--text-2:    rgba(238,242,246,0.55);  /* Fließtext */
--text-3:    rgba(238,242,246,0.28);  /* Labels, gedimmt */

--border:    rgba(238,242,246,0.08);
--border-s:  rgba(238,242,246,0.05);
```

### Philosophie

Keine Glüheffekte (radial-gradient glow), keine Rasterlinien-Hintergründe, kein leuchtendes Neon. Tiefe entsteht ausschließlich durch Ebenen: jede Oberfläche ist einen Ton heller als die darunter liegende. Der Eisblau-Akzent wird sparsam eingesetzt.

### Typografie

- **Font:** IBM Plex Sans (bereits vorhanden — kein Wechsel)
- H1: `clamp(38px, 4vw, 60px)` · weight 800 · letter-spacing -0.04em
- H2: `clamp(26px, 2.8vw, 44px)` · weight 800 · letter-spacing -0.035em
- Lead: 17px · weight 300 · line-height 1.85
- Labels: 9–10px · weight 700 · letter-spacing 0.18em · uppercase
- Akzent-Highlight in Überschriften: `color: var(--acc)` (#C8D8E8)

### Border-Radius

- Buttons, Tags, Badges: 3–5px (eckiger, präziser)
- Karten, Felder: 8–10px
- Dashboard-Karten: 12–16px

---

## Sektionsstruktur

Die bestehenden 12 Sektionen bleiben inhaltlich unverändert. Nur Farben, Abstände und Komponenten werden neu gestaltet.

| # | ID | Name | Hintergrund | Änderung |
|---|---|---|---|---|
| 1 | `#top` | Hero | `--bg` (#12161C) | Komplett neu: HTML-Hero statt PNG-Hotspot-System |
| — | — | Trust Bar | `--bg-deep` | In Hero integriert (kein eigenes `<div>`) |
| 2 | `#service` | Service | `--bg-s` | Neue Karten-Stile, gleiche Inhalte |
| 3 | `#prozess` | Prozess | `--bg` | Workflow-Karten neu gestaltet |
| 4 | `#explainer` | Explainer | `--bg-s` | Player-Stile aktualisiert |
| 5 | `#warum` | Warum wir | `--bg` | Vergleichstabelle + Karten-Stile |
| 6 | `#ueber-uns` | Über uns | `--bg-deep` | Dark-Sektion bleibt dark, neue Tokens |
| 7 | `#expertise` | Expertise | `--bg-s` | Stat-Karten neu |
| 8 | `#zielgruppe` | Zielgruppe | `--bg` | Persona-Karte neu |
| 9 | `#rechner` | Zeitrechner | `--bg-s` | Slider + Ergebnis-Stile |
| 10 | `#faq` | FAQ | `--bg` | Accordion-Stile |
| 11 | `#anmelden` | Formular | `--bg-s` | Formularfelder + Submit-Button |
| — | — | Footer | `--bg-deep` | Neu gestaltet |

---

## Navigation

- **Ausgangszustand (auf Hero):** Transparenter Hintergrund + Blur
- **Gescrollt:** `--bg-deep` (#0E1218) solid, kein Weiß
- Logo wechselt weiterhin zwischen `logo_light.png` / `logo_dark.png` je nach Scroll-Zustand
- CTA-Button: `--btn-bg` (#1E2E40) mit Eisblau-Rahmen
- Klasse `nav-hidden-for-concrete` wird entfernt — nicht mehr nötig

---

## Hero-Bereich

### Struktur
```
<section class="hero" id="top">
  <nav> ... </nav>                     ← Nav bleibt außerhalb
  <div class="wrap">
    <div class="hero-grid">            ← CSS Grid 2 Spalten
      <div class="hero-copy"> ... </div>
      <div class="hero-dash"> ... </div>
    </div>
  </div>
  <div class="trust-bar"> ... </div>   ← Direkt unter dem Grid
</section>
```

### Hero-Copy (links)
1. Eyebrow-Badge: grüner Punkt + Text in Kapseln
2. H1: 3-zeilig, letzte Zeile in `--acc`
3. Lead-Text: max. 2 Sätze, font-weight 300
4. Proof-Box: Checkmark-Icon + Garantie-Text, Glasmorphismus-Karte
5. CTA-Buttons: Primär (`--btn-bg`) + Ghost (transparent)
6. KPI-Strip: 3 Felder (2 Min. / HEK+ / 100%) mit gemeinsamen Rahmen

### Dashboard-Karte (rechts)
- Glasmorphismus: `background: rgba(22,27,34,0.9)` + `backdrop-filter: blur(20px)`
- Rahmen: 1px solid rgba(200,216,232, 0.10)
- 2×2 KPI-Grid (Fahrzeuge aktiv / HEK+)
- 3 Fahrzeugzeilen mit farbigem linken Balken (Eisblau / Amber / gedimmt)

### Hero-Hintergrund
- Basisfarbe: `--bg` (#12161C)
- Subtiler diagonaler Gradient: `linear-gradient(135deg, rgba(200,216,232,0.025), transparent 50%, rgba(200,216,232,0.015))`
- **Kein** `radial-gradient` Glow, **kein** Rasterlinienmuster

### Trust Bar
- Hintergrund: `--bg-deep`
- 5 Checkmark-Items horizontal zentriert
- Checkmark: quadratische Icons (border-radius 3px), nicht rund

---

## Bestehender Code — was entfällt

- `concrete-exact-active` Hero-System (HTML + CSS)
- `.concrete-hotspot` Klassen
- `.hero-bg` mit PNG-Hintergrundbild
- `.hero-noise`, `.hero-live-grid`, `.hero-live-copy`
- Klasse `nav-hidden-for-concrete`
- CSS-Variable-Referenzen auf alte Navy-Palette (`--navy`, `--sky`, `--sky2` etc.) — werden durch neue Tokens ersetzt

---

## Selbstprüfung

- **Platzhalter:** Keine TBD-Felder vorhanden
- **Konsistenz:** Sektionsstruktur stimmt mit bestehendem HTML überein; keine Sektion wird hinzugefügt oder entfernt
- **Scope:** Fokussiert auf `index.html` + `style.css` — `schaden.html`, `server.js` und andere Dateien bleiben unberührt
- **Keine Mehrdeutigkeit:** Full Rewrite bedeutet: neues `style.css` von Grund auf, `index.html` HTML-Struktur bleibt erhalten wo möglich, Hero-HTML wird neu geschrieben
