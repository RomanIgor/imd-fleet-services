# Go-Live Checklist — IMD Fleet Services

## Înainte de a fi live

- [ ] Finalizează textele pe site
- [ ] Verifică toate formularele (contact + Schadensmeldung)
- [ ] Verifică emailurile trimise (template-uri, adrese corecte)

## SEO

- [ ] Adaugă meta tags în `index.html` (titlu, descriere)
- [ ] Adaugă Open Graph tags (preview WhatsApp / LinkedIn / Facebook)
- [ ] Înregistrează domeniul în [Google Search Console](https://search.google.com/search-console)
- [ ] Trimite sitemap la Google Search Console

## Activare site public

- [ ] Șterge `MAINTENANCE_PASS` din `.env` pe Hetzner
- [ ] Restartează serverul: `pm2 restart all`
- [ ] Verifică că site-ul e accesibil fără parolă

## După go-live

- [ ] Solicită indexare manuală în Google Search Console
- [ ] Testează site-ul pe mobil și desktop

## Infrastructură — după go-live

- [ ] **Migrează la Hetzner Managed PostgreSQL** (~15€/lună)
  - `pg_dump $DATABASE_URL > backup_pre_migration.sql` pe serverul actual
  - Creează Managed DB în Hetzner Console
  - `pg_restore` pe noul DB
  - Actualizează `DATABASE_URL` în `.env`
  - `pm2 restart imd-fleet`
  - Șterge DB-ul local de pe server
  - Beneficii: backup-uri automate zilnice, failover, fără administrare manuală

## Costuri infrastructură (până la go-live)

- **Hetzner Snapshot**: 0,017017 €/GB/lună (inkl. 19% USt.)
  - Fă snapshot manual săptămânal în Hetzner Console până la go-live
  - După go-live: Managed DB include backup-uri automate, snapshot-urile devin opționale
