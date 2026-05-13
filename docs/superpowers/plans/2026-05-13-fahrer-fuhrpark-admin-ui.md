# Fahrer & Fuhrpark Admin UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Fuhrpark and Fahrer management panels to the IMD Admin dashboard so admins can create Fuhrparks, invite Fahrer, deactivate/reactivate drivers, and trigger DSGVO anonymization — all without needing DevTools or curl.

**Architecture:** All changes live in `index.html` (HTML panels + sidebar) and `main.js` (JS functions). One small backend fix to `routes/fahrer.js` adds `has_invite_token` to the Fahrer list response and filters out anonymized rows. No new files, no new routes.

**Tech Stack:** Vanilla JS (fetch, DOM), existing CSS classes (`tbl-wrap`, `tbl-head`, `.fi`, `.fl`, `.fg`, `.btn.btn-navy`, `showPanel()`), PostgreSQL via existing API routes.

---

## File Map

| Action | File | What changes |
|---|---|---|
| Modify | `routes/fahrer.js` | Add `has_invite_token` + filter anonymized rows in GET /api/fahrer |
| Modify | `index.html` | 2 sidebar items + 2 new `<div class="dp">` panels |
| Modify | `main.js` | Extend `showPanel()` + 8 new functions |

---

## Task 1: Extend GET /api/fahrer Response

**Files:**
- Modify: `routes/fahrer.js` (lines 41–47)

The frontend needs to distinguish "Einladung offen" (invite pending) from "Inaktiv" (was active, now deactivated). The actual token must not be sent to the browser — only a boolean. Anonymized rows (vorname = 'Gelöscht') should not appear in the admin list.

- [ ] **Step 1: Update the SELECT query in `routes/fahrer.js`**

Find this block (around line 41):

```javascript
    const { rows } = await pool.query(`
      SELECT f.id, f.vorname, f.nachname, f.telefon, f.email, f.aktiv, f.created_at,
             fp.name AS fuhrpark_name, fp.id AS fuhrpark_id
      FROM fahrer f
      JOIN fuhrparks fp ON fp.id = f.fuhrpark_id
      ORDER BY f.created_at DESC
    `);
```

Replace with:

```javascript
    const { rows } = await pool.query(`
      SELECT f.id, f.vorname, f.nachname, f.telefon, f.email, f.aktiv, f.created_at,
             fp.name AS fuhrpark_name, fp.id AS fuhrpark_id,
             (f.invite_token IS NOT NULL) AS has_invite_token
      FROM fahrer f
      JOIN fuhrparks fp ON fp.id = f.fuhrpark_id
      WHERE f.vorname != 'Gelöscht'
      ORDER BY f.created_at DESC
    `);
```

- [ ] **Step 2: Verify the module loads**

```bash
node -e "const r = require('./routes/fahrer'); console.log('OK');"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add routes/fahrer.js
git commit -m "fix: expose has_invite_token + filter anonymized rows in GET /api/fahrer"
```

---

## Task 2: Sidebar Entries + showPanel Wiring

**Files:**
- Modify: `index.html` (around line 1549)
- Modify: `main.js` (line 92)

- [ ] **Step 1: Add sidebar section to `index.html`**

Find this block (around line 1549–1555):

```html
      <div class="dsb-sec">
        <div class="dsb-lbl">Fahrzeuge</div>
```

Insert a new `<div class="dsb-sec">` block **before** it:

```html
      <div class="dsb-sec">
        <div class="dsb-lbl">Fuhrpark</div>
        <div class="dsb-item" onclick="showPanel('dFuhrparks',this)"><span class="di">🏢</span><span>Fuhrparks</span></div>
        <div class="dsb-item" onclick="showPanel('dFahrer',this)"><span class="di">👤</span><span>Fahrer</span></div>
      </div>
      <div class="dsb-sec">
        <div class="dsb-lbl">Fahrzeuge</div>
```

- [ ] **Step 2: Extend `showPanel()` in `main.js`**

Find line 92 (the `showPanel` function):

```javascript
function showPanel(id,el){document.querySelectorAll('.dp').forEach(p=>p.classList.remove('act'));document.getElementById(id).classList.add('act');if(el){document.querySelectorAll('.dsb-item').forEach(i=>i.classList.remove('act'));el.classList.add('act');}if(id==='dUsers')loadUsers();if(id==='dSch')loadSchaeden();if(id==='dWerk')loadWerkstaetten();}
```

Replace with:

```javascript
function showPanel(id,el){document.querySelectorAll('.dp').forEach(p=>p.classList.remove('act'));document.getElementById(id).classList.add('act');if(el){document.querySelectorAll('.dsb-item').forEach(i=>i.classList.remove('act'));el.classList.add('act');}if(id==='dUsers')loadUsers();if(id==='dSch')loadSchaeden();if(id==='dWerk')loadWerkstaetten();if(id==='dFuhrparks')loadFuhrparks();if(id==='dFahrer'){loadFahrer();loadFuhrparkDropdown();}}
```

- [ ] **Step 3: Verify index.html and main.js are syntactically valid**

```bash
node -e "require('./main.js')" 2>&1 | head -5
```

Expected: No syntax errors (will fail on DOM access, that's fine — we only care about parse errors).

- [ ] **Step 4: Commit**

```bash
git add index.html main.js
git commit -m "feat: add Fuhrpark + Fahrer sidebar entries, wire showPanel"
```

---

## Task 3: Fuhrpark Panel + JS Functions

**Files:**
- Modify: `index.html` (before closing `</div></div>` of `dash-main` around line 1856)
- Modify: `main.js` (append after the Werkstätten section)

- [ ] **Step 1: Add the Fuhrpark panel HTML to `index.html`**

Find the closing tags of `dash-main` (around line 1856):

```html
    </div>
  </div>
</div>
```

Insert the new panel **before** the first `</div>` (which closes `dash-main`):

```html
      <div class="dp" id="dFuhrparks">
        <div class="dh">Fuhrparks</div>
        <div class="dsub">Alle Fuhrparks verwalten</div>
        <div style="display:grid;grid-template-columns:1fr 360px;gap:24px;align-items:start;margin-top:20px">
          <div class="tbl-wrap">
            <div class="tbl-head">
              <div class="tbl-title">Alle Fuhrparks</div>
              <button class="tbl-sel" onclick="loadFuhrparks()" style="cursor:pointer">↻ Aktualisieren</button>
            </div>
            <table>
              <thead><tr><th>Name</th><th>Kontakt-E-Mail</th><th>Telefon</th><th>Erstellt am</th></tr></thead>
              <tbody id="tblFuhrparks"></tbody>
            </table>
          </div>
          <div style="background:var(--f0);border-radius:12px;padding:20px">
            <div style="font-family:var(--fh);font-size:14px;font-weight:700;color:var(--t0);margin-bottom:14px">Fuhrpark anlegen</div>
            <div class="fg"><label class="fl">Name *</label><input type="text" id="fpName" class="fi" placeholder="Muster GmbH"></div>
            <div class="fg"><label class="fl">Kontakt-E-Mail</label><input type="email" id="fpEmail" class="fi" placeholder="manager@muster.de"></div>
            <div class="fg"><label class="fl">Telefon</label><input type="text" id="fpTel" class="fi" placeholder="030 123456"></div>
            <div style="display:flex;gap:10px;align-items:center;margin-top:4px">
              <button class="btn btn-navy" onclick="createFuhrpark()">Fuhrpark anlegen →</button>
              <span id="fpMsg" style="font-size:12px;display:none"></span>
            </div>
          </div>
        </div>
      </div>
```

- [ ] **Step 2: Add `loadFuhrparks()` and `createFuhrpark()` to `main.js`**

Append after the last function in the Werkstätten section (find `// ─── WERKSTAETTEN ───` or the end of `saveWerkstatt`):

```javascript
// ─── FUHRPARKS ───
async function loadFuhrparks() {
  try {
    const rows = await fetch('/api/fuhrparks').then(r => r.json());
    const tbody = document.getElementById('tblFuhrparks');
    if (!tbody) return;
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--t3);padding:24px">Keine Fuhrparks angelegt</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(fp => `
      <tr>
        <td><strong>${fp.name}</strong></td>
        <td>${fp.kontakt_email || '—'}</td>
        <td>${fp.telefon || '—'}</td>
        <td>${fmtDate(fp.created_at)}</td>
      </tr>
    `).join('');
  } catch(e) { console.error(e); }
}

async function createFuhrpark() {
  const name  = document.getElementById('fpName').value.trim();
  const email = document.getElementById('fpEmail').value.trim();
  const tel   = document.getElementById('fpTel').value.trim();
  const msg   = document.getElementById('fpMsg');
  if (!name) {
    msg.style.cssText = 'display:block;color:var(--red)';
    msg.textContent = 'Name ist Pflichtfeld.';
    return;
  }
  const res = await fetch('/api/fuhrparks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, kontakt_email: email || null, telefon: tel || null })
  }).then(r => r.json());
  if (res.id) {
    msg.style.cssText = 'display:block;color:var(--green)';
    msg.textContent = 'Fuhrpark angelegt.';
    document.getElementById('fpName').value = '';
    document.getElementById('fpEmail').value = '';
    document.getElementById('fpTel').value = '';
    loadFuhrparks();
    setTimeout(() => { msg.style.display = 'none'; }, 3000);
  } else {
    msg.style.cssText = 'display:block;color:var(--red)';
    msg.textContent = res.error || 'Fehler';
  }
}
```

- [ ] **Step 3: Open the dashboard and test**

1. Log in at `/intern`
2. Click "Fuhrparks" in the sidebar — panel should appear (empty table)
3. Fill in Name "Test GmbH" → click "Fuhrpark anlegen →"
4. Verify green success message + row appears in table
5. Try submitting without a name → verify red error message

- [ ] **Step 4: Commit**

```bash
git add index.html main.js
git commit -m "feat: add Fuhrpark panel with list + create form"
```

---

## Task 4: Fahrer Panel + JS Functions

**Files:**
- Modify: `index.html` (append second panel after dFuhrparks)
- Modify: `main.js` (append Fahrer functions after Fuhrpark functions)

- [ ] **Step 1: Add the Fahrer panel HTML to `index.html`**

Directly after the closing `</div>` of `dFuhrparks` (inserted in Task 3), add:

```html
      <div class="dp" id="dFahrer">
        <div class="dh">Fahrer</div>
        <div class="dsub">Fahrerverwaltung — Einladungen · Zugänge · DSGVO</div>
        <div style="display:grid;grid-template-columns:1fr 360px;gap:24px;align-items:start;margin-top:20px">
          <div class="tbl-wrap">
            <div class="tbl-head">
              <div class="tbl-title">Alle Fahrer</div>
              <button class="tbl-sel" onclick="loadFahrer()" style="cursor:pointer">↻ Aktualisieren</button>
            </div>
            <table>
              <thead><tr><th>Name</th><th>Fuhrpark</th><th>E-Mail</th><th>Status</th><th>Aktionen</th></tr></thead>
              <tbody id="tblFahrer"></tbody>
            </table>
          </div>
          <div style="background:var(--f0);border-radius:12px;padding:20px">
            <div style="font-family:var(--fh);font-size:14px;font-weight:700;color:var(--t0);margin-bottom:14px">Fahrer anlegen</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div class="fg"><label class="fl">Vorname *</label><input type="text" id="fVorname" class="fi" placeholder="Max"></div>
              <div class="fg"><label class="fl">Nachname *</label><input type="text" id="fNachname" class="fi" placeholder="Mustermann"></div>
            </div>
            <div class="fg"><label class="fl">E-Mail *</label><input type="email" id="fEmail" class="fi" placeholder="max@muster.de"></div>
            <div class="fg"><label class="fl">Telefon</label><input type="text" id="fTel" class="fi" placeholder="0170 1234567"></div>
            <div class="fg">
              <label class="fl">Fuhrpark *</label>
              <select id="fFuhrpark" class="fi" style="appearance:auto">
                <option value="">— Fuhrpark wählen —</option>
              </select>
            </div>
            <div style="display:flex;gap:10px;align-items:center;margin-top:4px">
              <button class="btn btn-navy" onclick="createFahrer()">Anlegen + Einladung →</button>
              <span id="fMsg" style="font-size:12px;display:none"></span>
            </div>
          </div>
        </div>
      </div>
```

- [ ] **Step 2: Add Fahrer JS functions to `main.js`**

Append after `createFuhrpark()`:

```javascript
// ─── FAHRER ───
async function loadFuhrparkDropdown() {
  try {
    const rows = await fetch('/api/fuhrparks').then(r => r.json());
    const sel = document.getElementById('fFuhrpark');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Fuhrpark wählen —</option>' +
      rows.map(fp => `<option value="${fp.id}">${fp.name}</option>`).join('');
  } catch(e) { console.error(e); }
}

async function loadFahrer() {
  try {
    const rows = await fetch('/api/fahrer').then(r => r.json());
    const tbody = document.getElementById('tblFahrer');
    if (!tbody) return;
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--t3);padding:24px">Keine Fahrer angelegt</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(f => {
      let badge;
      if (f.aktiv) {
        badge = '<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700">Aktiv</span>';
      } else if (f.has_invite_token) {
        badge = '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700">Einladung offen</span>';
      } else {
        badge = '<span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700">Inaktiv</span>';
      }
      const toggleBtn = f.aktiv
        ? `<button class="tbl-sel" style="cursor:pointer" onclick="toggleFahrerStatus(${f.id},false)" title="Deaktivieren">⏸</button>`
        : (!f.has_invite_token
            ? `<button class="tbl-sel" style="cursor:pointer" onclick="toggleFahrerStatus(${f.id},true)" title="Reaktivieren">▶</button>`
            : '');
      return `<tr>
        <td><strong>${f.vorname} ${f.nachname}</strong></td>
        <td style="color:var(--t2)">${f.fuhrpark_name}</td>
        <td style="font-size:12px;color:var(--t2)">${f.email || '—'}</td>
        <td>${badge}</td>
        <td id="fAkt${f.id}" style="white-space:nowrap;display:flex;gap:4px;align-items:center">
          ${toggleBtn}
          <button class="tbl-sel" style="cursor:pointer;color:var(--red)" onclick="deleteFahrer(${f.id})" title="DSGVO löschen">🗑</button>
        </td>
      </tr>`;
    }).join('');
  } catch(e) { console.error(e); }
}

async function createFahrer() {
  const vorname     = document.getElementById('fVorname').value.trim();
  const nachname    = document.getElementById('fNachname').value.trim();
  const email       = document.getElementById('fEmail').value.trim();
  const telefon     = document.getElementById('fTel').value.trim();
  const fuhrpark_id = document.getElementById('fFuhrpark').value;
  const msg         = document.getElementById('fMsg');
  if (!vorname || !nachname || !email || !fuhrpark_id) {
    msg.style.cssText = 'display:block;color:var(--red)';
    msg.textContent = 'Alle Pflichtfelder ausfüllen.';
    return;
  }
  const res = await fetch('/api/fahrer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vorname, nachname, email, telefon: telefon || null, fuhrpark_id: parseInt(fuhrpark_id) })
  }).then(r => r.json());
  if (res.success) {
    msg.style.cssText = 'display:block;color:var(--green)';
    msg.textContent = 'Fahrer angelegt — Einladung gesendet.';
    document.getElementById('fVorname').value = '';
    document.getElementById('fNachname').value = '';
    document.getElementById('fEmail').value = '';
    document.getElementById('fTel').value = '';
    document.getElementById('fFuhrpark').value = '';
    loadFahrer();
    setTimeout(() => { msg.style.display = 'none'; }, 4000);
  } else {
    msg.style.cssText = 'display:block;color:var(--red)';
    msg.textContent = res.error === 'E-Mail bereits vergeben'
      ? 'Diese E-Mail ist bereits registriert.'
      : (res.error || 'Fehler');
  }
}

async function toggleFahrerStatus(id, aktiv) {
  const res = await fetch(`/api/fahrer/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aktiv })
  }).then(r => r.json());
  if (res.success) loadFahrer();
  else showToast('⚠ ' + (res.error || 'Fehler'));
}

function deleteFahrer(id) {
  const cell = document.getElementById('fAkt' + id);
  if (!cell) return;
  cell.innerHTML = `
    <span style="font-size:11px;color:var(--red);font-weight:600">Wirklich anonymisieren?</span>
    <button class="tbl-sel" style="cursor:pointer;color:var(--red)" onclick="confirmDeleteFahrer(${id})">Ja</button>
    <button class="tbl-sel" style="cursor:pointer" onclick="loadFahrer()">Nein</button>
  `;
}

async function confirmDeleteFahrer(id) {
  const res = await fetch(`/api/fahrer/${id}`, { method: 'DELETE' }).then(r => r.json());
  if (res.success) { showToast('✓ Fahrer anonymisiert (DSGVO Art. 17)'); loadFahrer(); }
  else showToast('⚠ ' + (res.error || 'Fehler'));
}
```

- [ ] **Step 3: Test the complete Fahrer flow**

1. Click "Fahrer" in sidebar — panel appears (empty table, form visible)
2. Verify Fuhrpark dropdown is populated with existing Fuhrparks
3. Fill in Vorname / Nachname / E-Mail / Fuhrpark → click "Anlegen + Einladung →"
4. Verify success message + Fahrer appears in table with badge "Einladung offen"
5. Check that invite email was received
6. Activate account via email link — badge changes to "Aktiv" after table refresh
7. Click ⏸ next to an active Fahrer — badge changes to "Inaktiv"
8. Click ▶ to reactivate — badge changes back to "Aktiv"
9. Click 🗑 — inline confirmation appears ("Wirklich anonymisieren? Ja Nein")
10. Click "Nein" — buttons restore
11. Click 🗑 again → "Ja" — Fahrer disappears from table, toast appears

- [ ] **Step 4: Commit**

```bash
git add index.html main.js
git commit -m "feat: add Fahrer panel with list, create form, deactivate + DSGVO delete"
```
