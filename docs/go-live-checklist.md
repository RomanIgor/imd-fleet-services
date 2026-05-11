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
