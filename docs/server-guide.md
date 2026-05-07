# Server Guide — IMD Fleet Services

## Infrastructură

| | |
|---|---|
| **Hosting** | Hetzner Cloud — server `imd-fleet-1` |
| **IP** | 178.104.153.45 |
| **User** | root |
| **App path** | `/var/www/imd-fleet/` |
| **Process manager** | PM2 (proces: `imd-fleet`) |
| **Domeniu** | imdfleet.de |
| **Email service** | Resend (resend.com) |
| **Baza de date** | PostgreSQL (hosted pe Hetzner sau extern) |

---

## Conectare SSH

```bash
ssh root@178.104.153.45
```

Parola e salvată în password manager.

---

## Variabile de mediu (`.env`)

Fișier: `/var/www/imd-fleet/.env`

| Variabilă | Valoare corectă | Scop |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Conexiunea PostgreSQL |
| `SESSION_SECRET` | (string lung aleatoriu) | Secret sesiuni Express |
| `RESEND_API_KEY` | `re_...` | API key Resend pentru trimitere emailuri |
| `RECIPIENT_EMAIL` | `schaden@imdfleet.de` | Adresa care primește Schadenmeldungen |
| `DASH_USER` | (username admin) | Admin dashboard — doar la primul start |
| `DASH_PASS` | (parolă admin) | Admin dashboard — doar la primul start |
| `MAINTENANCE_PASS` | (parolă sau gol) | Dacă e setat, site-ul cere parolă. Șterge pentru go-live. |
| `PORT` | `8000` (default) | Portul pe care rulează serverul |

### Editare variabilă de mediu

```bash
nano /var/www/imd-fleet/.env
```

Salvează: `Ctrl+O` → Enter → `Ctrl+X`  
Apoi repornește: `pm2 restart imd-fleet`

---

## Deployment (actualizare cod)

```bash
cd /var/www/imd-fleet
git pull
pm2 restart imd-fleet
```

Verificare că rulează:

```bash
pm2 list
pm2 logs imd-fleet --lines 50
```

---

## Resend — configurare email

**Dashboard:** [app.resend.com](https://app.resend.com)

### Ce e configurat

- **Domeniu verificat:** `imdfleet.de` (verificare DNS — acoperă ORICE adresă @imdfleet.de)
- **De la cine se trimit emailurile:** `schaden@imdfleet.de` (Schadenmeldungen) și `info@imdfleet.de` (formularul de contact)
- **Unde sosesc emailurile de schaden:** adresa din `RECIPIENT_EMAIL` din `.env` → trebuie să fie `schaden@imdfleet.de`

### Important

- Dacă schimbi adresa `from` în cod, **nu trebuie nimic în Resend** — domeniul e verificat, orice `@imdfleet.de` funcționează automat.
- Dacă schimbi adresa unde sosesc emailurile (`RECIPIENT_EMAIL`), **schimbi doar în `.env` pe Hetzner** și restartezi.
- Emailurile trimise prin Resend **nu apar în folderul Gesendete** al clientului de email — le vezi doar în Resend dashboard → Logs.

### Logs emailuri trimise

Resend dashboard → **Logs** → poți vedea fiecare email trimis, statusul (delivered / bounced), conținutul complet.

---

## Adrese email folosite în proiect

| Adresă | Scop |
|---|---|
| `schaden@imdfleet.de` | Primește Schadenmeldungen (RECIPIENT_EMAIL) + expeditor pentru emailurile de schaden |
| `info@imdfleet.de` | Expeditor pentru emailurile formularului de contact (Flottenankauf) |

---

## Baza de date — tabele principale

| Tabel | Conținut |
|---|---|
| `submissions` | Cereri Flottenankauf (formularul de contact) |
| `schaeden` | Schadenmeldungen trimise de șoferi |
| `werkstaetten` | Lista werkstatt-urilor partenere (gestionată din dashboard) |
| `users` | Utilizatori admin dashboard |
| `session` | Sesiuni Express (auto-gestionat) |

### Acces direct baza de date (pe server)

```bash
psql $DATABASE_URL
```

---

## Structura aplicației

```
server.js       — tot backend-ul (rute, DB, emailuri, PDF)
index.html      — landing page + dashboard admin
schaden.html    — formularul de Schadenmeldung (PWA)
main.js         — JavaScript pentru dashboard
style.css       — stiluri globale
sw.js           — Service Worker (PWA offline)
manifest.json   — manifest PWA
logo_light.png  — logo pentru mod light + PDF
logo_dark.png   — logo pentru mod dark
docs/           — documentație proiect
```

---

## Maintenance mode

Dacă `MAINTENANCE_PASS` e setat în `.env`, site-ul cere o parolă la acces.  
Șoferii pot accesa direct `/schaden` fără parolă (whitelistat).  
Pentru go-live: șterge `MAINTENANCE_PASS` din `.env` și restartează.
