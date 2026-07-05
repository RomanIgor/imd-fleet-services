# Cookie- und Datenschutz-Audit

Stand: 2026-07-05

Scope: Hauptwebsite (`index.html`, `fahrzeugverkauf.html`) und serverseitige Funktionen der Website. Die Schaden-App (`schaden.html`) ist bewusst ausgenommen und benoetigt eine eigene Cookie-/Datenschutzpruefung mit eigenem Hinweis.

## Ergebnis

Auf der Hauptwebsite werden keine Statistik- oder Marketingdienste eingesetzt. Es gibt kein Google Analytics, keinen Google Tag Manager, keinen Meta Pixel, kein reCAPTCHA, keine YouTube-/Vimeo-Einbettungen, keine Google Maps, keine Chat-Widgets und keine Marketing-Pixel.

Der Banner zeigt deshalb keine Kategorien `Statistik` oder `Marketing`. Als aktive Auswahl gibt es nur:

- `Externe Dienste`

Notwendige Funktionen werden im Text erwaehnt, aber nicht als auswählbare Kategorie dargestellt.

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

Serverseitig kann der Chat-Endpunkt bei Nutzung eine Anfrage an Groq senden. Dabei wird kein Browser-Script eines Drittanbieters geladen und kein Tracking-Pixel gesetzt.

## Interner Dashboard-Hinweis

Die XLSX-Bibliothek von cdnjs wird ausschliesslich fuer Mitarbeiter-Funktionen im internen Dashboard genutzt, zum Beispiel Excel-Import oder Excel-Export. Sie ist keine Besucherfunktion der oeffentlichen Website.

Die Bibliothek wird nicht beim normalen Seitenaufruf der oeffentlichen Website geladen. Sie wird erst bei Nutzung einer Excel-Funktion im internen Dashboard nachgeladen und ist nicht Teil des Besucher-Consent-Banners.

## Verhalten bei Ablehnung

Wenn ein Besucher `Ablehnen` klickt:

- Die Website bleibt lesbar und navigierbar.
- Das Kontaktformular kann weiter genutzt werden.
- Notwendige Sicherheits- und Formularfunktionen bleiben aktiv.
- Externe Schriftarten werden nicht geladen; der Browser nutzt Fallback-Schriften.
- Die OpenStreetMap-Karte bleibt blockiert und zeigt einen Hinweis.
- Interne Excel-Funktionen im Mitarbeiter-Dashboard sind vom Besucher-Banner getrennt und werden nur im geschuetzten Mitarbeiterbereich bei aktiver Nutzung geladen.

## Banner-Text

Titel: Datenschutz

Subtitle: Privatsphaere einstellen

Intro: Notwendige Funktionen sichern Betrieb, Formulare und Darstellung. Optional koennen externe Schriftarten und Karteninhalte aktiviert werden.

Hinweis zu notwendigen Funktionen: Erforderlich fuer Sicherheit, Formulare, Session und korrekte Darstellung. Keine Auswahl im Banner.

Kategorie `Externe Dienste`: Externe Schriftarten und OpenStreetMap-Karteninhalte nur nach Zustimmung.

Buttons:

- Ablehnen
- Speichern
- Zustimmen
