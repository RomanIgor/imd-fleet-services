# Cookie- und Datenschutz-Audit

Stand: 2026-07-05

Scope: Hauptwebsite (`index.html`, `fahrzeugverkauf.html`) und serverseitige Funktionen der Website. Die Schaden-App (`schaden.html`) ist bewusst ausgenommen und benoetigt eine eigene Cookie-/Datenschutzpruefung mit eigenem Hinweis.

## Ergebnis

Auf der Hauptwebsite werden keine Statistik- oder Marketingdienste eingesetzt. Es gibt kein Google Analytics, keinen Google Tag Manager, keinen Meta Pixel, kein reCAPTCHA, keine YouTube-/Vimeo-Einbettungen, keine Google Maps, keine Chat-Widgets und keine Marketing-Pixel.

Der Banner zeigt deshalb keine Kategorien `Statistik` oder `Marketing`. Es gibt nur:

- `Notwendig`
- `Externe Dienste`

## Cookies

### `imd.sid`

- Art: First-party Session-Cookie
- Quelle: Express Session
- Zweck: sichere Server-Session, Login-/Dashboard-Funktionen, CSRF-/Formular-Sicherheit
- Laufzeit: 8 Stunden
- Eigenschaften: `httpOnly`, `sameSite=lax`, `secure` in Production
- Kategorie: Notwendig

Es wurden keine aktiven Third-party-Cookies im Quellcode der Hauptwebsite gefunden.

## Browser Storage

### `localStorage`

- `imd-theme`: speichert Hell-/Dunkelmodus
- `imd-cookie-consent-v2`: speichert die Datenschutzauswahl

Kategorie: Notwendig, da diese Werte fuer Darstellung und Datenschutzentscheidung der Website genutzt werden.

### `sessionStorage`

Auf der Hauptwebsite nicht aktiv fuer Tracking. PWA-/iOS-Hinweise liegen in der separaten Schaden-App und sind nicht Teil dieses Banners.

### IndexedDB

Nicht verwendet.

### Cache Storage / Service Worker

Der Service Worker gehoert zur separaten Schaden-App und ist nicht Teil des Hauptwebsite-Banners.

## Externe Dienste

Diese Dienste werden auf der Hauptwebsite erst nach Zustimmung zur Kategorie `Externe Dienste` aktiviert:

- Google Fonts (`fonts.googleapis.com`) fuer externe Schriftarten
- OpenStreetMap iframe fuer die Kontaktkarte
- cdnjs XLSX-Bibliothek fuer Excel-Funktionen im Dashboard

Serverseitig kann der Chat-Endpunkt bei Nutzung eine Anfrage an Groq senden. Dabei wird kein Browser-Script eines Drittanbieters geladen und kein Tracking-Pixel gesetzt.

## Verhalten bei Ablehnung

Wenn ein Besucher `Alle ablehnen` klickt:

- Die Website bleibt lesbar und navigierbar.
- Das Kontaktformular kann weiter genutzt werden.
- Notwendige Sicherheits- und Formularfunktionen bleiben aktiv.
- Externe Schriftarten werden nicht geladen; der Browser nutzt Fallback-Schriften.
- Die OpenStreetMap-Karte bleibt blockiert und zeigt einen Hinweis.
- Die externe XLSX-Bibliothek wird nicht geladen; Excel-Funktionen im Dashboard stehen dann nicht zur Verfuegung.

## Banner-Text

Titel: Datenschutz

Subtitle: Privatsphaere einstellen

Intro: Notwendige Technologien gewaehrleisten den sicheren Betrieb der Website. Externe Dienste werden erst nach Ihrer Zustimmung aktiviert.

Kategorie `Notwendig`: Erforderlich fuer Sicherheit, Formulare, Session und korrekte Darstellung. Immer aktiv.

Kategorie `Externe Dienste`: Externe Schriftarten, OpenStreetMap und XLSX-Dokumentfunktionen nur nach Zustimmung.

Buttons:

- Alle ablehnen
- Auswahl speichern
- Alle akzeptieren
