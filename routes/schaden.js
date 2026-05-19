const express      = require('express');
const router       = express.Router();
const multer       = require('multer');
const path         = require('path');
const { Resend }   = require('resend');
const { pool }     = require('../db');
const { escapeHtml, formLimiter } = require('../middleware/security');

const MAX_PHOTO_SIZE_MB = 15;
const MAX_PHOTOS = 5;

const upload = multer({
  limits: {
    fileSize: MAX_PHOTO_SIZE_MB * 1024 * 1024,
    files: MAX_PHOTOS,
    fields: 100,
    fieldSize: 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Nur Bilddateien sind erlaubt'));
    }
    cb(null, true);
  },
});
let PDFDocument; try { PDFDocument = require('pdfkit'); } catch(_) { console.warn('pdfkit not installed — PDF generation disabled'); }

// ── PDF Generation ────────────────────────────────────────────────────────────
function generateSchadenPDF(d) {
  if (!PDFDocument) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const PW = doc.page.width;
    const PH = doc.page.height;
    const L = 20;
    const CW = PW - L - 20;

    const NAVY  = '#0C2461';
    const DARK  = '#1A2644';
    const GRAY  = '#546E8A';
    const LINE  = '#B8C5D0';
    const LGRAY = '#8899AA';

    let y = 0;

    function checkPage(need) {
      if (y + (need || 50) > PH - 22) { doc.addPage(); y = 22; }
    }

    function secBar(title) {
      checkPage(40);
      doc.rect(L, y, CW, 16).fill(NAVY);
      doc.circle(L + 10, y + 8, 5.5).strokeColor('rgba(255,255,255,0.55)').lineWidth(0.9).stroke();
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7.5)
         .text(title, L + 22, y + 4.5, { lineBreak: false, characterSpacing: 0.4 });
      y += 17;
    }

    function fld(label, value, x, atY, w, h) {
      doc.fillColor(GRAY).font('Helvetica').fontSize(6.5)
         .text(label, x, atY, { lineBreak: false, width: w - 1 });
      if (value) {
        doc.fillColor(DARK).font('Helvetica').fontSize(8.5)
           .text(String(value), x + 1, atY + 8, { lineBreak: false, width: w - 4 });
      }
      doc.moveTo(x, atY + h - 2).lineTo(x + w - 1, atY + h - 2)
         .strokeColor(LINE).lineWidth(0.5).stroke();
    }

    function fRow(items, h = 18) {
      const gap = 4;
      const fixed = items.reduce((s, it) => s + (it.w || 0), 0);
      const flex  = items.filter(it => !it.w).length;
      const fw    = flex ? (CW - fixed - gap * (items.length - 1)) / flex : 0;
      let x = L;
      for (let i = 0; i < items.length; i++) {
        const w = items[i].w || fw;
        fld(items[i].label, items[i].value || '', x, y, w, h);
        x += w + (i < items.length - 1 ? gap : 0);
      }
      y += h;
    }

    function cb(label, checked, x, atY) {
      const sz = 7;
      doc.rect(x, atY, sz, sz).strokeColor(DARK).lineWidth(0.4).stroke();
      if (checked) {
        doc.moveTo(x+1.5,atY+3.5).lineTo(x+3,atY+5.5).lineTo(x+5.5,atY+1)
           .strokeColor(DARK).lineWidth(1.2).stroke();
      }
      doc.fillColor(DARK).font('Helvetica').fontSize(7.5)
         .text(label, x + sz + 2, atY + 0.5, { lineBreak: false });
      return x + sz + 2 + doc.widthOfString(label, { font: 'Helvetica', fontSize: 7.5 }) + 5;
    }

    function jn(label, isJa, x, atY, lw) {
      if (label) {
        doc.fillColor(DARK).font('Helvetica').fontSize(7.5)
           .text(label + ':', x, atY + 0.5, { lineBreak: false, width: lw });
      }
      const sz = 7;
      let nx = x + lw + (label ? 3 : 0);
      doc.rect(nx, atY, sz, sz).strokeColor(DARK).lineWidth(0.4).stroke();
      if (isJa) { doc.moveTo(nx+1.5,atY+3.5).lineTo(nx+3,atY+5.5).lineTo(nx+5.5,atY+1).strokeColor(DARK).lineWidth(1.2).stroke(); }
      doc.fillColor(DARK).font('Helvetica').fontSize(7.5).text('ja', nx + sz + 2, atY + 0.5, { lineBreak: false });
      nx += sz + 2 + doc.widthOfString('ja', { font: 'Helvetica', fontSize: 7.5 }) + 4;
      doc.rect(nx, atY, sz, sz).strokeColor(DARK).lineWidth(0.4).stroke();
      if (!isJa) { doc.moveTo(nx+1.5,atY+3.5).lineTo(nx+3,atY+5.5).lineTo(nx+5.5,atY+1).strokeColor(DARK).lineWidth(1.2).stroke(); }
      doc.fillColor(DARK).font('Helvetica').fontSize(7.5).text('nein', nx + sz + 2, atY + 0.5, { lineBreak: false });
      nx += sz + 2 + doc.widthOfString('nein', { font: 'Helvetica', fontSize: 7.5 }) + 4;
      return nx;
    }

    const fmtDate = iso => { if (!iso) return ''; const [yr,mo,da] = iso.split('-'); return `${da}.${mo}.${yr}`; };

    // Header
    doc.rect(0, 0, PW, 58).fill('#FFFFFF');
    doc.moveTo(L, 58).lineTo(PW - 20, 58).strokeColor(LINE).lineWidth(0.5).stroke();
    try {
      doc.image(path.join(__dirname, '..', 'logo_light.png'), L, 8, { height: 42 });
    } catch(_) {
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(17).text('IMD', L, 10, { lineBreak: false });
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(6.5).text('FLEET SERVICES', L, 29, { lineBreak: false, characterSpacing: 1.2 });
    }
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(24)
       .text('SCHADENMELDUNG', 0, 15, { align: 'right', width: PW - 22, lineBreak: false });
    doc.fillColor(LGRAY).font('Helvetica').fontSize(7.5)
       .text(`Fall-Nr.: ${d.fall_nr}   ·   ${new Date().toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' })}`,
             0, 44, { align: 'right', width: PW - 22, lineBreak: false });
    y = 63;

    doc.rect(L, y, CW, 14).fill(NAVY);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8)
       .text('BITTE AM RECHNER / NOTEBOOK AUSFÜLLEN!', L, y + 3.5, { align: 'center', width: CW, lineBreak: false });
    y += 18;

    const schuld = (d.schuldfrage || '').toLowerCase();
    const fahrt  = (d.fahrtart    || '').toLowerCase();
    doc.fillColor(DARK).font('Helvetica').fontSize(7.5)
       .text('Die Schuld liegt meines Erachtens bei:', L, y + 1, { lineBreak: false });
    let sx = L + 138;
    sx = cb('bei mir', schuld === 'bei mir', sx, y);
    sx = cb('beim Gegner', schuld === 'beim gegner', sx, y);
    cb('unklar', schuld === 'unklar', sx, y);
    const ftX = L + CW * 0.57;
    let ftx = cb('Dienstfahrt', fahrt === 'dienstfahrt', ftX, y);
    ftx = cb('Fahrt Wohnung-Arbeitsstätte', fahrt.includes('wohnung'), ftx, y);
    cb('Privatfahrt', fahrt === 'privatfahrt', ftx, y);
    y += 12;
    doc.moveTo(L, y).lineTo(L + CW, y).strokeColor(LINE).lineWidth(0.4).stroke();
    y += 5;

    fRow([
      { label: 'Kennzeichen:',  value: d.kennzeichen },
      { label: 'Unfalldatum:', value: fmtDate(d.unfall_datum) },
      { label: 'Uhrzeit:',     value: d.unfall_uhrzeit },
    ]);
    fRow([
      { label: 'Fahrername:',   value: d.fahrer_name },
      { label: 'Vorname:',      value: '' },
      { label: 'Geburtsdatum:', value: '' },
    ]);
    fRow([{ label: 'Privatadresse:', value: d.fahrer_adresse || '' }]);

    {
      const h = 21, telW = CW * 0.48;
      fld('Telefon für Rückfragen:', d.fahrer_telefon, L, y, telW, h);
      const rx = L + telW + 4;
      doc.fillColor(GRAY).font('Helvetica').fontSize(6.5)
         .text('Erforderliche Fahrerlaubnis:', rx, y, { lineBreak: false });
      jn('', d.fahrerlaubnis === 'Ja', rx + 102, y + 7, 0);
      doc.moveTo(rx, y + h - 2).lineTo(L + CW - 1, y + h - 2).strokeColor(LINE).lineWidth(0.5).stroke();
      y += h;
    }
    fRow([
      { label: 'Ausstellungsdatum Fahrerlaubnis:', value: d.fahrerlaubnis_datum    || '' },
      { label: 'Ausstellende Behörde:',            value: d.fahrerlaubnis_behoerde || '' },
    ]);
    fRow([
      { label: 'Führerschein-Nr.:',    value: d.fuehrerschein_nr      || '' },
      { label: 'Führerscheinklassen:', value: d.fuehrerschein_klassen || '' },
    ]);

    secBar('ALKOHOL / DROGEN / BLUTPROBE');
    {
      const h = 18;
      let ax = L;
      ax = jn('Alkoholkonsum',  d.alkohol      === 'Ja', ax, y, 62); ax += 3;
      ax = jn('Drogenkonsum',   d.drogen       === 'Ja', ax, y, 60); ax += 3;
      ax = jn('Blutprobe',      d.blutprobe_feld === 'Ja', ax, y, 48); ax += 3;
      fld('Ergebnis:', d.blutprobe_ergebnis || '', ax, y, L + CW - ax - 1, h);
      y += h;
    }
    {
      const h = 18;
      let ax = L;
      ax = jn('Wurde eine Blutprobe entnommen?', d.blutprobe_entnommen === 'Ja', ax, y, 130); ax += 3;
      fld('Wenn ja, mit welchem Ergebnis:', d.blutprobe_ergebnis_detail || '', ax, y, L + CW - ax - 1, h);
      y += h;
    }

    secBar('UNFALLORT UND SCHADEN AM EIGENEN FAHRZEUG');
    fRow([{ label: 'Straße (Unfallort):', value: d.unfall_strasse || d.unfall_ort || '' }]);
    fRow([
      { label: 'PLZ:', value: d.unfall_plz || '', w: 70 },
      { label: 'Ort:', value: d.unfall_ort_name || '' },
    ]);
    fRow([{ label: 'Schaden am eigenen Fahrzeug (z.B. Frontschaden, Heckschaden o.ä.):', value: d.schadenart || '' }]);
    {
      const h = 18;
      let ax = L;
      ax = jn('Fahrzeug fahrbereit', d.fahrbereit === 'ja', ax, y, 84); ax += 8;
      ax = jn('Personenschaden',     d.personenschaden === 'ja', ax, y, 68); ax += 8;
      fld('Zu besichtigen bei:', '', ax, y, L + CW - ax - 1, h);
      y += h;
    }

    secBar('POLIZEI / DIENSTSTELLE / ZEUGEN');
    {
      const h = 18;
      let ax = L;
      ax = jn('Polizeilich aufgenommen', d.polizei_aufgenommen === 'ja', ax, y, 100); ax += 6;
      const tabW = (L + CW - ax - 1) * 0.48;
      fld('Tagebuch-Nr.:', d.polizei_aktenzeichen || '', ax, y, tabW, h);
      ax += tabW + 4;
      fld('Dienststelle / Id.:', '', ax, y, L + CW - ax - 1, h);
      y += h;
    }
    fRow([{ label: 'Polizei-Dienststelle mit Adresse und Tel.Nr.:', value: '' }]);
    fRow([{ label: 'Zeugen mit Adresse:', value: '' }]);

    secBar('UNFALLHERGANG');
    doc.fillColor(GRAY).font('Helvetica').fontSize(6.5)
       .text(
         'Bitte so ausführlich wie möglich. Sollte der Platz nicht ausreichen, fügen Sie bitte ein weiteres Blatt/Datei hinzu.\n' +
         'In strittigen Fällen bitte Endstellung der Fahrzeuge skizzieren, nach Möglichkeit Unfall fotografieren.',
         L, y, { width: CW, lineBreak: true }
       );
    y = doc.y + 3;
    if (d.beschreibung) {
      doc.fillColor(DARK).font('Helvetica').fontSize(8.5)
         .text(d.beschreibung, L + 1, y, { width: CW - 2, lineBreak: true });
      y = doc.y + 2;
    }
    const hEnd = y + 42;
    for (let ly = y + 13; ly < hEnd; ly += 13) {
      doc.moveTo(L, ly).lineTo(L + CW, ly).strokeColor(LINE).lineWidth(0.3).stroke();
    }
    y = hEnd;

    secBar('UNFALLGEGNER');
    fRow([
      { label: 'Fahrzeughalter:', value: d.opponent_holder || '' },
      { label: 'Adresse:',        value: d.opponent_address || '' },
    ]);
    fRow([
      { label: 'Fahrername:', value: d.opponent_lastname || '' },
      { label: 'Vorname:',    value: d.opponent_firstname || '' },
    ]);
    fRow([
      { label: 'Telefon tagsüber:',  value: d.opponent_phone || '' },
      { label: 'Mobilfunknummer:',   value: d.opponent_mobile || '' },
    ]);
    fRow([
      { label: 'Kennzeichen:',  value: d.opponent_plate || '' },
      { label: 'Fahrzeugtyp:',  value: d.opponent_type || '' },
    ]);
    fRow([
      { label: 'Versichert bei:',          value: d.opponent_insurance || '' },
      { label: 'Versicherungsschein-Nr.:', value: d.opponent_insurance_nr || '' },
    ]);
    fRow([{ label: 'Welcher Schaden (z.B. Frontschaden, Heckschaden o.ä.):', value: d.opponent_damage || '' }]);

    checkPage(110);
    const botY  = y;
    const leftW = Math.floor(CW * 0.56) - 3;
    const rW    = CW - leftW - 4;
    const rX    = L + leftW + 4;

    doc.rect(L, botY, leftW, 15).fill(NAVY);
    doc.circle(L + 10, botY + 7.5, 5.5).strokeColor('rgba(255,255,255,0.55)').lineWidth(0.9).stroke();
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7)
       .text('DOKUMENTE / FOTOS UND DATENSCHUTZ', L + 22, botY + 4.5, { lineBreak: false });
    doc.rect(rX, botY, rW, 15).fill(NAVY);
    doc.circle(rX + 10, botY + 7.5, 5.5).strokeColor('rgba(255,255,255,0.55)').lineWidth(0.9).stroke();
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7)
       .text('VERSAND / UNTERSCHRIFT', rX + 22, botY + 4.5, { lineBreak: false });

    const photos = Array.isArray(d.photoLabels) ? d.photoLabels : [];
    const hasPhoto = key => photos.some(p => p && p.toLowerCase().includes(key.toLowerCase()));
    const pItems = [
      { label: 'Gesamtansicht', key: 'Gesamtansicht' },
      { label: 'Schaden Detail', key: 'Schaden' },
      { label: 'Kennzeichen',   key: 'Kennzeichen' },
      { label: 'Unfallstelle',  key: 'Unfallstelle' },
      { label: 'Unfallgegner',  key: 'Unfallgegner' },
      { label: 'Polizei',       key: 'Dokumente' },
    ];
    let cbx = L, cby = botY + 18;
    pItems.forEach((item, i) => {
      if (i === 3) { cbx = L; cby += 13; }
      const checked = hasPhoto(item.key);
      const sz = 7;
      doc.rect(cbx, cby, sz, sz).strokeColor(DARK).lineWidth(0.4).stroke();
      if (checked) { doc.moveTo(cbx+1.5,cby+3.5).lineTo(cbx+3,cby+5.5).lineTo(cbx+5.5,cby+1).strokeColor(DARK).lineWidth(1.2).stroke(); }
      doc.fillColor(checked ? DARK : GRAY).font('Helvetica').fontSize(7.5)
         .text(item.label, cbx + sz + 2, cby + 0.5, { lineBreak: false });
      cbx += sz + 2 + doc.widthOfString(item.label, { font: 'Helvetica', fontSize: 7.5 }) + 8;
    });
    cby += 15;
    doc.fillColor(GRAY).font('Helvetica').fontSize(5.5)
       .text(
         'Ich bestätige die Richtigkeit und Vollständigkeit meiner Angaben.\n' +
         'Ich habe kein Schuldanerkenntnis abgegeben. Reparaturfreigaben erfolgen\n' +
         'ausschließlich durch IMD Fleet Services. Die Datenverarbeitung erfolgt\n' +
         'gemäß DSGVO/DSG zur Schadensbearbeitung.',
         L, cby, { width: leftW - 2, lineBreak: true }
       );
    const leftEndY = doc.y + 4;

    let ry = botY + 18;
    doc.fillColor(GRAY).font('Helvetica').fontSize(7)
       .text('Senden an: schaden@imdfleet.de', rX, ry, { lineBreak: false });
    ry += 11;
    const sigH = Math.max(leftEndY - ry - 22, 46);
    doc.rect(rX, ry, rW - 1, sigH).strokeColor(LINE).lineWidth(0.5).stroke();
    if (d.signatureBase64 && d.signatureBase64.startsWith('data:image/png;base64,')) {
      try {
        const sigBuf = Buffer.from(d.signatureBase64.slice(22), 'base64');
        doc.image(sigBuf, rX + 3, ry + 3, { width: rW - 8, height: sigH - 6 });
      } catch (_) { /* skip */ }
    }
    ry += sigH + 4;
    const dateStr = new Date().toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
    const dW = rW * 0.44;
    doc.moveTo(rX, ry).lineTo(rX + dW - 2, ry).strokeColor(DARK).lineWidth(0.5).stroke();
    doc.moveTo(rX + dW + 2, ry).lineTo(rX + rW - 1, ry).strokeColor(DARK).lineWidth(0.5).stroke();
    doc.fillColor(GRAY).font('Helvetica').fontSize(6.5).text('Datum', rX, ry + 2, { lineBreak: false });
    doc.fillColor(DARK).font('Helvetica').fontSize(8).text(dateStr, rX + 28, ry + 2, { lineBreak: false });
    doc.fillColor(GRAY).font('Helvetica').fontSize(6.5).text('Unterschrift Fahrer', rX + dW + 2, ry + 2, { lineBreak: false });

    if (d.werkstatt_name) {
      y = Math.max(leftEndY, ry + 14) + 4;
      doc.fillColor(GRAY).font('Helvetica').fontSize(7)
         .text(`Gewünschte Werkstatt: ${d.werkstatt_name}` + (d.werkstatt_email ? ` · ${d.werkstatt_email}` : ''),
               L, y, { lineBreak: false, width: CW });
    }

    const footY = PH - 18;
    doc.moveTo(L, footY - 4).lineTo(PW - 20, footY - 4).strokeColor(LINE).lineWidth(0.4).stroke();
    doc.fillColor(LGRAY).font('Helvetica').fontSize(7)
       .text('IMD intern:   Eingang  |  Prüfung  |  Werkstattzuweisung  |  Freigabe  |  Versicherung',
             0, footY, { align: 'center', width: PW, lineBreak: false });

    doc.end();
  });
}

// ── POST /api/schaden ─────────────────────────────────────────────────────────
function buildFahrerConfirmationEmail({ fall_nr, kennzeichen, firma, timestamp, photoCount, hasPdf }) {
  const e = escapeHtml;
  return `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head>
  <body style="font-family:Arial,sans-serif;background:#f4f7fb;margin:0;padding:20px">
    <div style="background:#fff;border-radius:10px;padding:28px;max-width:560px;margin:0 auto;box-shadow:0 2px 12px rgba(0,0,0,.08)">
      <p style="color:#0c2461;font-size:20px;font-weight:800;margin:0 0 16px">IMD Fleet Services</p>
      <h2 style="color:#09152A;margin:0 0 8px;font-size:22px">Ihre Schadenmeldung ist eingegangen</h2>
      <p style="color:#536E94;font-size:14px;line-height:1.55;margin:0 0 20px">
        Wir haben Ihre Schadenmeldung erhalten. IMD Fleet Services uebernimmt den weiteren Ablauf.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 20px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #ECF1F8;color:#536E94">Fallnummer</td><td style="padding:10px 0;border-bottom:1px solid #ECF1F8;text-align:right;font-weight:700;color:#09152A">${e(fall_nr)}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ECF1F8;color:#536E94">Kennzeichen</td><td style="padding:10px 0;border-bottom:1px solid #ECF1F8;text-align:right;font-weight:700;color:#09152A">${e(kennzeichen || '-')}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ECF1F8;color:#536E94">Firma</td><td style="padding:10px 0;border-bottom:1px solid #ECF1F8;text-align:right;color:#09152A">${e(firma || '-')}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ECF1F8;color:#536E94">Eingang</td><td style="padding:10px 0;border-bottom:1px solid #ECF1F8;text-align:right;color:#09152A">${e(timestamp)}</td></tr>
      </table>
      <p style="background:#eef6ff;border:1px solid #cfe4ff;border-radius:8px;padding:12px 14px;color:#0c2461;font-size:13px;line-height:1.5;margin:0 0 16px">
        ${hasPdf ? 'Das unterschriebene PDF' : 'Die Schadenmeldung'} und ${photoCount} Foto(s) finden Sie im Anhang dieser E-Mail.
      </p>
      <p style="color:#536E94;font-size:13px;line-height:1.55;margin:0">
        Bitte bewahren Sie diese E-Mail auf. Den Status Ihrer Meldung koennen Sie jederzeit in der App unter "Meine Faelle" einsehen.
      </p>
    </div>
  </body></html>`;
}

router.post('/api/schaden', formLimiter, upload.array('photos', 5), async (req, res) => {
  if (!req.session || !req.session.fahrerId) {
    return res.status(401).json({ success: false, error: 'Sitzung abgelaufen. Bitte erneut einloggen.' });
  }
  const {
    firma = '', fahrer_name = '', fahrer_email = '', fahrer_telefon = '',
    kennzeichen = '', fahrzeugtyp = '', baujahr = '',
    unfall_datum = '', unfall_uhrzeit = '', unfall_ort = '',
    fahrbereit = '', polizei_gerufen = '', unfallgegner = '',
    beschreibung = ''
  } = req.body;

  const schuldfrage          = (req.body.schuldfrage          || '').trim();
  const fahrtart             = (req.body.fahrtart             || '').trim();
  const unfall_strasse       = (req.body.unfall_strasse       || '').trim();
  const unfall_plz           = (req.body.unfall_plz           || '').trim();
  const unfall_ort_name      = (req.body.unfall_ort_name      || '').trim();
  const personenschaden      = (req.body.personenschaden      || 'nein').trim();
  const polizei_aufgenommen  = (req.body.polizei_aufgenommen  || polizei_gerufen || 'nein').trim();
  const polizei_aktenzeichen = (req.body.polizei_aktenzeichen || '').trim();
  const schadenart           = (req.body.schadenart           || '').trim();
  const km                   = (req.body.km                   || '').trim();
  const opponent_holder      = (req.body.opponent_holder      || '').trim();
  const opponent_address     = (req.body.opponent_address     || '').trim();
  const opponent_lastname    = (req.body.opponent_lastname    || '').trim();
  const opponent_firstname   = (req.body.opponent_firstname   || '').trim();
  const opponent_plate       = (req.body.opponent_plate       || '').trim();
  const opponent_type        = (req.body.opponent_type        || '').trim();
  const opponent_phone       = (req.body.opponent_phone       || '').trim();
  const opponent_mobile      = (req.body.opponent_mobile      || '').trim();
  const opponent_insurance   = (req.body.opponent_insurance   || '').trim();
  const opponent_insurance_nr= (req.body.opponent_insurance_nr|| '').trim();
  const opponent_damage      = (req.body.opponent_damage      || '').trim();
  const fahrer_adresse            = (req.body.fahrer_adresse            || '').trim();
  const fahrerlaubnis             = (req.body.fahrerlaubnis             || '').trim();
  const fahrerlaubnis_datum       = (req.body.fahrerlaubnis_datum       || '').trim();
  const fahrerlaubnis_behoerde    = (req.body.fahrerlaubnis_behoerde    || '').trim();
  const fuehrerschein_nr          = (req.body.fuehrerschein_nr          || '').trim();
  const fuehrerschein_klassen     = (req.body.fuehrerschein_klassen     || '').trim();
  const alkohol                   = (req.body.alkohol                   || '').trim();
  const drogen                    = (req.body.drogen                    || '').trim();
  const blutprobe_feld            = (req.body.blutprobe_feld            || '').trim();
  const blutprobe_ergebnis        = (req.body.blutprobe_ergebnis        || '').trim();
  const blutprobe_entnommen       = (req.body.blutprobe_entnommen       || '').trim();
  const blutprobe_ergebnis_detail = (req.body.blutprobe_ergebnis_detail || '').trim();
  const werkstatt_name            = (req.body.werkstatt_name  || '').trim();
  const werkstatt_email           = (req.body.werkstatt_email || '').trim();
  const signatureBase64           = (req.body.signature       || '').trim();
  const sendFahrerCopy            = req.body.send_fahrer_copy === 'ja';
  let photoLabels = [];
  try { photoLabels = JSON.parse(req.body.photo_labels || '[]'); } catch(_) {}

  if (!fahrer_name || !fahrer_telefon || !fahrer_email || !kennzeichen || !beschreibung) {
    return res.json({ success: false, error: 'Pflichtfelder fehlen' });
  }
  if (!req.files || req.files.length === 0) {
    return res.json({ success: false, error: 'Mindestens ein Foto erforderlich' });
  }

  const ip        = req.ip || 'unbekannt';
  const timestamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
  const resend    = new Resend(process.env.RESEND_API_KEY);

  try {
    const fahrerId   = req.session.fahrerId;
    const fuhrparkId = req.session.fuhrparkId || null;

    const insertResult = await pool.query(
      `INSERT INTO schaeden
        (firma, fahrer_name, fahrer_email, fahrer_telefon, kennzeichen, fahrzeugtyp,
         baujahr, unfall_datum, unfall_uhrzeit, unfall_ort, fahrbereit, polizei_gerufen,
         unfallgegner, beschreibung, ip, fahrer_id, fuhrpark_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING id`,
      [
        firma, fahrer_name, fahrer_email, fahrer_telefon, kennzeichen, fahrzeugtyp,
        baujahr, unfall_datum, unfall_uhrzeit, unfall_ort,
        fahrbereit === 'ja', polizei_gerufen === 'ja', unfallgegner === 'ja',
        beschreibung, ip, fahrerId, fuhrparkId
      ]
    );
    const id      = insertResult.rows[0].id;
    const year    = new Date().getFullYear();
    const fall_nr = `IMD-${year}-${String(id).padStart(4, '0')}`;
    await pool.query('UPDATE schaeden SET fall_nr=$1 WHERE id=$2', [fall_nr, id]);
    await pool.query(
      `UPDATE schaeden SET
        schuldfrage=$1, fahrtart=$2, unfall_strasse=$3, unfall_plz=$4, unfall_ort_name=$5,
        personenschaden=$6, polizei_aufgenommen=$7, polizei_aktenzeichen=$8, schadenart=$9, km=$10,
        opponent_holder=$11, opponent_address=$12, opponent_lastname=$13, opponent_firstname=$14,
        opponent_plate=$15, opponent_type=$16, opponent_phone=$17, opponent_mobile=$18,
        opponent_insurance=$19, opponent_insurance_nr=$20, opponent_damage=$21,
        fahrer_adresse=$22, fahrerlaubnis=$23, fahrerlaubnis_datum=$24, fahrerlaubnis_behoerde=$25,
        fuehrerschein_nr=$26, fuehrerschein_klassen=$27, alkohol=$28, drogen=$29,
        blutprobe_feld=$30, blutprobe_ergebnis=$31, blutprobe_entnommen=$32,
        blutprobe_ergebnis_detail=$33, werkstatt_name=$34, werkstatt_email=$35,
        photo_labels=$36::jsonb, fahrer_confirmation_requested=$37
       WHERE id=$38`,
      [
        schuldfrage, fahrtart, unfall_strasse, unfall_plz, unfall_ort_name,
        personenschaden, polizei_aufgenommen, polizei_aktenzeichen, schadenart, km,
        opponent_holder, opponent_address, opponent_lastname, opponent_firstname,
        opponent_plate, opponent_type, opponent_phone, opponent_mobile,
        opponent_insurance, opponent_insurance_nr, opponent_damage,
        fahrer_adresse, fahrerlaubnis, fahrerlaubnis_datum, fahrerlaubnis_behoerde,
        fuehrerschein_nr, fuehrerschein_klassen, alkohol, drogen,
        blutprobe_feld, blutprobe_ergebnis, blutprobe_entnommen,
        blutprobe_ergebnis_detail, werkstatt_name, werkstatt_email, JSON.stringify(photoLabels || []),
        sendFahrerCopy,
        id
      ]
    );

    const attachments = req.files.map((f, i) => ({
      filename: String(f.originalname || `foto-${i + 1}.jpg`).replace(/[^\w.\- äöüÄÖÜß]/g, '_'),
      content:  f.buffer.toString('base64'),
    }));

    const fahrbereitBadge = fahrbereit === 'ja'
      ? '<span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:4px;font-weight:700">✓ Fahrbereit</span>'
      : '<span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:4px;font-weight:700">✗ NICHT fahrbereit</span>';

    const e = escapeHtml;
    const imdHtml = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;background:#f4f7fb;margin:0;padding:20px}
  .card{background:#fff;border-radius:8px;padding:32px;max-width:600px;margin:0 auto;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  h2{color:#0052A3;margin:0 0 4px}
  .fall{font-size:22px;font-weight:800;color:#09152A;margin-bottom:8px}
  .meta{color:#536E94;font-size:13px;margin-bottom:24px}
  .section{background:#0052A3;color:#fff;padding:8px 12px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-top:20px;border-radius:4px 4px 0 0}
  table{width:100%;border-collapse:collapse}
  td{padding:10px 12px;border-bottom:1px solid #ECF1F8;font-size:14px;color:#09152A;vertical-align:top}
  td.lbl{width:38%;font-weight:600;color:#2E4666}
  .footer{margin-top:24px;font-size:12px;color:#8899B4;border-top:1px solid #DDE6F0;padding-top:12px}
</style></head><body>
<div class="card">
  <h2>🚨 Neue Schadensmeldung</h2>
  <div class="fall">${e(fall_nr)}</div>
  <p class="meta">Eingegangen am ${e(timestamp)} &bull; IP: ${e(ip)}</p>
  <div class="section">Fahrer &amp; Kontakt</div>
  <table>
    <tr><td class="lbl">Fahrer</td><td>${e(fahrer_name)}</td></tr>
    <tr><td class="lbl">Firma</td><td>${e(firma || '—')}</td></tr>
    <tr><td class="lbl">Telefon</td><td>${e(fahrer_telefon)}</td></tr>
    <tr><td class="lbl">E-Mail</td><td>${e(fahrer_email)}</td></tr>
  </table>
  <div class="section">Fahrzeug</div>
  <table>
    <tr><td class="lbl">Kennzeichen</td><td>${e(kennzeichen)}</td></tr>
    <tr><td class="lbl">Fahrzeugtyp</td><td>${e(fahrzeugtyp || '—')}</td></tr>
    <tr><td class="lbl">Baujahr</td><td>${e(baujahr || '—')}</td></tr>
    <tr><td class="lbl">Fahrbereit</td><td>${fahrbereitBadge}</td></tr>
  </table>
  <div class="section">Schadensdetails</div>
  <table>
    <tr><td class="lbl">Datum</td><td>${e(unfall_datum)}${unfall_uhrzeit ? ' · ' + e(unfall_uhrzeit) : ''}</td></tr>
    <tr><td class="lbl">Unfallort</td><td>${e(unfall_ort || '—')}</td></tr>
    <tr><td class="lbl">Polizei aufgenommen</td><td>${polizei_aufgenommen === 'ja' ? 'Ja' : 'Nein'}${polizei_aktenzeichen ? ' — ' + e(polizei_aktenzeichen) : ''}</td></tr>
    <tr><td class="lbl">Personenschaden</td><td>${personenschaden === 'ja' ? '<span style="color:#991b1b;font-weight:700">Ja</span>' : 'Nein'}</td></tr>
    <tr><td class="lbl">Unfallgegner</td><td>${unfallgegner === 'ja' ? 'Ja' : 'Nein'}</td></tr>
    <tr><td class="lbl">Beschreibung</td><td>${e(beschreibung)}</td></tr>
  </table>
  ${unfallgegner === 'ja' ? `
  <div class="section">Unfallgegner</div>
  <table>
    ${opponent_holder     ? `<tr><td class="lbl">Fahrzeughalter</td><td>${e(opponent_holder)}</td></tr>` : ''}
    ${(opponent_lastname||opponent_firstname) ? `<tr><td class="lbl">Fahrername</td><td>${e(opponent_firstname)} ${e(opponent_lastname)}</td></tr>` : ''}
    ${opponent_address    ? `<tr><td class="lbl">Adresse</td><td>${e(opponent_address)}</td></tr>` : ''}
    ${opponent_plate      ? `<tr><td class="lbl">Kennzeichen</td><td>${e(opponent_plate)}</td></tr>` : ''}
    ${opponent_type       ? `<tr><td class="lbl">Fahrzeugtyp</td><td>${e(opponent_type)}</td></tr>` : ''}
    ${opponent_insurance  ? `<tr><td class="lbl">Versichert bei</td><td>${e(opponent_insurance)}</td></tr>` : ''}
    ${opponent_insurance_nr ? `<tr><td class="lbl">Versicherungsschein-Nr.</td><td>${e(opponent_insurance_nr)}</td></tr>` : ''}
    ${opponent_damage     ? `<tr><td class="lbl">Schaden Gegner</td><td>${e(opponent_damage)}</td></tr>` : ''}
  </table>` : ''}
  <div class="footer">Automatisch generiert · ${req.files.length} Foto(s) im Anhang · PDF beigefügt</div>
</div></body></html>`;

    let pdfBuffer = null;
    try {
      pdfBuffer = await generateSchadenPDF({
        fall_nr, timestamp,
        fahrer_name, fahrer_telefon, fahrer_email, firma,
        kennzeichen, fahrzeugtyp, km,
        schuldfrage, fahrtart,
        unfall_datum, unfall_uhrzeit, unfall_ort, unfall_strasse, unfall_plz, unfall_ort_name, schadenart,
        fahrbereit, personenschaden, unfallgegner,
        beschreibung, polizei_aufgenommen, polizei_aktenzeichen,
        opponent_holder, opponent_address, opponent_lastname, opponent_firstname,
        opponent_plate, opponent_type, opponent_phone, opponent_mobile,
        opponent_insurance, opponent_insurance_nr, opponent_damage,
        werkstatt_name, werkstatt_email, photoLabels, signatureBase64,
        fahrer_adresse, fahrerlaubnis, fahrerlaubnis_datum, fahrerlaubnis_behoerde,
        fuehrerschein_nr, fuehrerschein_klassen,
        alkohol, drogen, blutprobe_feld, blutprobe_ergebnis,
        blutprobe_entnommen, blutprobe_ergebnis_detail,
      });
    } catch (pdfErr) {
      console.error(`[${timestamp}] ✗ PDF error:`, pdfErr.message);
    }
    if (pdfBuffer) {
      attachments.push({ filename: `Schadenmeldung_${fall_nr}.pdf`, content: pdfBuffer });
      console.log(`[${timestamp}] ✓ PDF generated (${Math.round(pdfBuffer.length/1024)} KB)`);
    } else {
      console.warn(`[${timestamp}] ⚠ PDF skipped`);
    }

    const { error: imdErr } = await resend.emails.send({
      from:    'IMD Fleet Services <schaden@imdfleet.de>',
      to:      process.env.RECIPIENT_EMAIL,
      subject: `Neuer Schaden: ${fall_nr} - ${kennzeichen}${firma ? ' - ' + firma : ''}`,
      html:    imdHtml,
      attachments,
    });
    if (imdErr) throw new Error(imdErr.message);

    let fahrerEmailSent = false;
    if (sendFahrerCopy && fahrer_email) {
      try {
        const { error: fahrerErr } = await resend.emails.send({
          from:    'IMD Fleet Services <schaden@imdfleet.de>',
          to:      fahrer_email,
          subject: `Ihre Schadenmeldung ${fall_nr} - IMD Fleet Services`,
          html:    buildFahrerConfirmationEmail({
            fall_nr,
            kennzeichen,
            firma,
            timestamp,
            photoCount: req.files.length,
            hasPdf: Boolean(pdfBuffer),
          }),
          attachments,
        });
        if (fahrerErr) throw new Error(fahrerErr.message);
        fahrerEmailSent = true;
        await pool.query('UPDATE schaeden SET fahrer_confirmation_sent_at=NOW() WHERE id=$1', [id]);
      } catch (mailErr) {
        console.warn(`[${timestamp}] Fahrer confirmation email skipped:`, mailErr.message);
      }
    }

    console.log(`[${timestamp}] Schaden ${fall_nr} saved + emails sent`);
    res.json({ success: true, fall_nr, fahrer_email_sent: fahrerEmailSent });
  } catch (err) {
    console.error('Schaden error:', err.message);
    res.status(500).json({ success: false, error: 'Fehler bei der Verarbeitung. Bitte versuchen Sie es erneut.' });
  }
});

module.exports = router;
