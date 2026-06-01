// ─── DASHBOARD ───
const STATUS_COLORS={'Neu':'sb-gy','Angemeldet':'sb-gy','In Bearbeitung':'sb-bl','Gutachten':'sb-am','Angebot':'sb-bl','Bestätigt':'sb-gr','Ausgezahlt':'sb-gr','Abgeschlossen':'sb-gr'};
const STATUS_OPTIONS=['Neu','In Bearbeitung','Gutachten','Angebot','Bestätigt','Ausgezahlt','Abgeschlossen'];

function fmtDate(iso){if(!iso)return'—';return new Date(iso).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});}
function statusBadge(s){return`<span class="sb ${STATUS_COLORS[s]||'sb-gy'}">${s||'Neu'}</span>`;}

let _rows=[];

// mode: 'compact' | 'full' | 'fahrzeuge'
function renderSubmissions(rows,tbodyId,mode){
  _rows=rows;
  const tbody=document.getElementById(tbodyId);if(!tbody)return;
  const colspan=mode==='compact'?6:mode==='fahrzeuge'?7:9;
  if(!rows||!rows.length){tbody.innerHTML=`<tr><td colspan="${colspan}" style="text-align:center;color:var(--t3);padding:32px">Noch keine Einträge</td></tr>`;return;}
  tbody.innerHTML=rows.map(r=>{
    const fzg=[r.marke,r.modell,r.baujahr].filter(Boolean).join(' ')||'—';
    const badge=statusBadge(r.status);
    const open=`openAnfrage(${r.id})`;
    if(mode==='compact')
      return`<tr style="cursor:pointer" onclick="${open}"><td>${fmtDate(r.created_at)}</td><td><strong>${r.firma}</strong></td><td>${r.name}</td><td>${r.telefon}</td><td>${fzg}</td><td>${badge}</td></tr>`;
    if(mode==='fahrzeuge')
      return`<tr style="cursor:pointer" onclick="${open}"><td>${r.marke||'—'}</td><td>${r.modell||'—'}</td><td>${r.baujahr||'—'}</td><td>${r.km?r.km+' km':'—'}</td><td>${r.firma}</td><td>${fmtDate(r.created_at)}</td><td>${badge}</td></tr>`;
    return`<tr style="cursor:pointer" onclick="${open}"><td>${fmtDate(r.created_at)}</td><td><strong>${r.firma}</strong></td><td>${r.name}</td><td>${r.telefon}</td><td>${r.email||'—'}</td><td>${fzg}</td><td>${r.km?r.km+' km':'—'}</td><td style="max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.anmerkung||'—'}</td><td>${badge}</td></tr>`;
  }).join('');
}

// ─── ANFRAGE MODAL ───
function openAnfrage(id){
  const r=_rows.find(x=>x.id===id);if(!r)return;
  document.getElementById('editId').value=id;
  document.getElementById('editFirma').value=r.firma||'';
  document.getElementById('editName').value=r.name||'';
  document.getElementById('editTelefon').value=r.telefon||'';
  document.getElementById('editEmail').value=r.email||'';
  document.getElementById('editMarke').value=r.marke||'';
  document.getElementById('editModell').value=r.modell||'';
  document.getElementById('editBaujahr').value=r.baujahr||'';
  document.getElementById('editKm').value=r.km||'';
  document.getElementById('editAnmerkung').value=r.anmerkung||'';
  const sel=document.getElementById('editStatus');
  sel.innerHTML=STATUS_OPTIONS.map(s=>`<option${s===r.status?' selected':''}>${s}</option>`).join('');
  const modal=document.getElementById('anfrageModal');
  modal.style.display='flex';
}
function closeAnfrageModal(){document.getElementById('anfrageModal').style.display='none';}
async function saveAnfrage(){
  const id=document.getElementById('editId').value;
  const data={
    firma:document.getElementById('editFirma').value,
    name:document.getElementById('editName').value,
    telefon:document.getElementById('editTelefon').value,
    email:document.getElementById('editEmail').value,
    marke:document.getElementById('editMarke').value,
    modell:document.getElementById('editModell').value,
    baujahr:document.getElementById('editBaujahr').value,
    km:document.getElementById('editKm').value,
    anmerkung:document.getElementById('editAnmerkung').value,
    status:document.getElementById('editStatus').value,
  };
  const res=await fetch('/api/submissions/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>r.json());
  if(res.success){closeAnfrageModal();loadDashData();showToast('✓ Gespeichert');}
  else showToast('⚠ Fehler beim Speichern');
}

async function loadDashData(){
  try{
    const [stats,subs]=await Promise.all([fetch('/api/stats').then(r=>r.json()),fetch('/api/submissions').then(r=>r.json())]);
    document.getElementById('kpiTotal').textContent=stats.total??'—';
    document.getElementById('kpiToday').textContent=stats.today??'—';
    document.getElementById('kpiNeu').textContent=stats.neu??'—';
    document.getElementById('dashDate').textContent='Stand '+new Date().toLocaleDateString('de-DE');
    renderSubmissions(subs,'tblBody','compact');
    renderSubmissions(subs,'tblAll','fahrzeuge');
  }catch(e){console.error(e);}
}

async function openDash(){
  document.getElementById('dash').classList.add('open');
  document.body.style.overflow='hidden';
  const auth=await fetch('/api/check-auth').then(r=>r.json());
  if(auth.authenticated){
    document.getElementById('dashLogin').style.display='none';
    document.getElementById('dashUserLabel').textContent=auth.user;
    loadDashData();
  }else{
    document.getElementById('dashLogin').style.display='flex';
  }
}

function closeDash(){document.getElementById('dash').classList.remove('open');document.body.style.overflow='';}
function showPanel(id,el){document.querySelectorAll('.dp').forEach(p=>p.classList.remove('act'));document.getElementById(id).classList.add('act');if(el){document.querySelectorAll('.dsb-item').forEach(i=>i.classList.remove('act'));el.classList.add('act');}if(id==='dUsers')loadUsers();if(id==='dSch')loadSchaeden();if(id==='dWerk')loadWerkstaetten();if(id==='dFuhrparks')loadFuhrparks();if(id==='dFahrer'){loadFahrer();loadFuhrparkDropdown();ensureImportFuhrparks();}}

async function doLogin(){
  const u=document.getElementById('loginUser').value;
  const p=document.getElementById('loginPass').value;
  const err=document.getElementById('loginErr');
  err.style.display='none';
  const res=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})}).then(r=>r.json());
  if(res.success){document.getElementById('dashLogin').style.display='none';document.getElementById('dashUserLabel').textContent=u;loadDashData();}
  else{err.textContent=res.error||'Fehler';err.style.display='block';}
}

async function doLogout(){await fetch('/api/logout',{method:'POST'});closeDash();}

// ─── USERS ───
async function loadUsers(){
  try{
    const rows=await fetch('/api/users').then(r=>r.json());
    const tbody=document.getElementById('tblUsers');if(!tbody)return;
    if(!rows.length){tbody.innerHTML='<tr><td colspan="3" style="text-align:center;color:var(--t3);padding:24px">Keine Benutzer</td></tr>';return;}
    tbody.innerHTML=rows.map(u=>`<tr><td><strong>${u.username}</strong></td><td>${fmtDate(u.created_at)}</td><td><button class="tbl-sel" style="cursor:pointer;color:var(--red)" onclick="deleteUser('${u.username}')">Löschen</button></td></tr>`).join('');
  }catch(e){console.error(e);}
}
async function addUser(){
  const u=document.getElementById('newUserName').value.trim();
  const p=document.getElementById('newUserPass').value;
  const msg=document.getElementById('userMsg');
  if(!u||!p){msg.style.cssText='display:block;color:var(--red)';msg.textContent='Benutzername und Passwort eingeben.';return;}
  const res=await fetch('/api/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})}).then(r=>r.json());
  if(res.success){msg.style.cssText='display:block;color:var(--green)';msg.textContent='Benutzer erfolgreich hinzugefügt.';document.getElementById('newUserName').value='';document.getElementById('newUserPass').value='';loadUsers();}
  else{msg.style.cssText='display:block;color:var(--red)';msg.textContent=res.error||'Fehler';}
}
async function deleteUser(username){
  if(!confirm(`Benutzer "${username}" wirklich löschen?`))return;
  const res=await fetch('/api/users/'+encodeURIComponent(username),{method:'DELETE'}).then(r=>r.json());
  if(res.success)loadUsers();
  else showToast('⚠ '+(res.error||'Fehler'));
}

// ─── SCHAEDEN ───
async function loadSchaeden() {
  const today = new Date().toLocaleDateString('de-DE', {weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  document.getElementById('dSchDate').textContent = today;
  try {
    const rows = await fetch('/api/schaeden').then(r => r.json());
    document.getElementById('schTotal').textContent = rows.length;
    document.getElementById('schNeu').textContent = rows.filter(r => r.status === 'Neu').length;
    document.getElementById('schInProgress').textContent = rows.filter(r => r.status === 'In Bearbeitung').length;
    const tbody = document.getElementById('schBody');
    tbody.innerHTML = '';
    rows.forEach(row => {
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.onclick = () => showSchDetail(row);
      const fbBadge = row.fahrbereit
        ? '<span style="background:#d1fae5;color:#065f46;font-size:11px;padding:2px 8px;border-radius:4px;font-weight:700">✓ Ja</span>'
        : '<span style="background:#fee2e2;color:#991b1b;font-size:11px;padding:2px 8px;border-radius:4px;font-weight:700">✗ Nein</span>';
      const statusColors = {'Neu':'#dbeafe','In Bearbeitung':'#fef9c3','Abgeschlossen':'#d1fae5'};
      const statusSelect = `<select onchange="patchSchadenStatus(${row.id},this.value)" onclick="event.stopPropagation()" style="font-size:11px;padding:3px 6px;border-radius:6px;border:1px solid var(--f2);background:${statusColors[row.status]||'#fff'}">
        ${['Neu','In Bearbeitung','Abgeschlossen'].map(s => `<option${s===row.status?' selected':''}>${s}</option>`).join('')}
      </select>`;
      const date = new Date(row.created_at).toLocaleDateString('de-DE');
      tr.innerHTML = `<td><strong>${row.fall_nr||'—'}</strong></td><td>${date}</td><td>${row.fahrer_name}</td><td>${row.firma||'—'}</td><td>${row.kennzeichen}</td><td>${fbBadge}</td><td>${statusSelect}</td>`;
      tbody.appendChild(tr);
    });
  } catch(e) { console.error('loadSchaeden:', e); }
}

function showSchDetail(row) {
  document.getElementById('schDetailTitle').textContent = (row.fall_nr || '—') + ' · ' + row.kennzeichen;
  document.getElementById('schDetailBody').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">
      <div><strong>Fahrer:</strong> ${row.fahrer_name}</div>
      <div><strong>Firma:</strong> ${row.firma||'—'}</div>
      <div><strong>Telefon:</strong> ${row.fahrer_telefon}</div>
      <div><strong>E-Mail:</strong> ${row.fahrer_email||'—'}</div>
      <div><strong>Kennzeichen:</strong> ${row.kennzeichen}</div>
      <div><strong>Fahrzeugtyp:</strong> ${row.fahrzeugtyp||'—'}</div>
      <div><strong>Baujahr:</strong> ${row.baujahr||'—'}</div>
      <div><strong>Fahrbereit:</strong> ${row.fahrbereit ? '✓ Ja' : '✗ Nein'}</div>
      <div><strong>Unfalldatum:</strong> ${row.unfall_datum||'—'} ${row.unfall_uhrzeit||''}</div>
      <div><strong>Unfallort:</strong> ${row.unfall_ort||'—'}</div>
      <div><strong>Polizei:</strong> ${row.polizei_gerufen ? 'Ja' : 'Nein'}</div>
      <div><strong>Unfallgegner:</strong> ${row.unfallgegner ? 'Ja' : 'Nein'}</div>
    </div>
    <div style="margin-top:12px;font-size:13px"><strong>Beschreibung:</strong><br><div style="margin-top:4px;padding:10px;background:#fff;border-radius:8px;line-height:1.6">${row.beschreibung}</div></div>`;
  document.getElementById('schDetail').style.display = 'block';
}

async function patchSchadenStatus(id, status) {
  await fetch('/api/schaeden/' + id + '/status', {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ status })
  });
}

// ─── WERKSTAETTEN ───
let _werkEditId = null;

async function loadWerkstaetten() {
  try {
    const rows = await fetch('/api/werkstaetten').then(r => r.json());
    const tbody = document.getElementById('tblWerk');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--t3)">Keine Werkstätten vorhanden.</td></tr>';
      return;
    }
    rows.forEach(w => {
      const tr = document.createElement('tr');
      const safeName = w.name.replace(/'/g, "\\'");
      tr.innerHTML = `<td><strong>${w.name}</strong></td><td>${w.plz||''} ${w.city||''}</td><td>${w.email}</td><td style="font-size:12px;color:var(--t2)">${w.services||'—'}</td><td>${w.rating||'—'}</td><td><span class="sb ${w.aktiv ? 'sb-gr' : 'sb-am'}">${w.aktiv ? 'Aktiv' : 'Inaktiv'}</span></td><td style="display:flex;gap:6px"><button class="td-btn" onclick="startEditWerkstatt(${w.id},'${safeName}','${(w.city||'').replace(/'/g,"\\'")}','${(w.plz||'').replace(/'/g,"\\'")}','${w.email.replace(/'/g,"\\'")}','${(w.services||'').replace(/'/g,"\\'")}','${w.rating||''}')">Bearbeiten</button><button class="td-btn" style="color:var(--red)" onclick="deleteWerkstatt(${w.id},'${safeName}')">Löschen</button></td>`;
      tbody.appendChild(tr);
    });
  } catch(e) { console.error('loadWerkstaetten:', e); }
}

function startEditWerkstatt(id, name, city, plz, email, services, rating) {
  _werkEditId = id;
  document.getElementById('wName').value     = name;
  document.getElementById('wCity').value     = city;
  document.getElementById('wPlz').value      = plz;
  document.getElementById('wEmail').value    = email;
  document.getElementById('wServices').value = services;
  document.getElementById('wRating').value   = rating;
  document.getElementById('wSaveBtn').textContent = '💾 Speichern';
  document.getElementById('wCancelBtn').style.display = 'inline-block';
  document.getElementById('werkMsg').textContent = '';
  document.getElementById('wName').scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('wName').focus();
}

function cancelEditWerkstatt() {
  _werkEditId = null;
  ['wName','wCity','wPlz','wEmail','wServices','wRating'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('wSaveBtn').textContent = '+ Hinzufügen';
  document.getElementById('wCancelBtn').style.display = 'none';
  document.getElementById('werkMsg').textContent = '';
}

async function saveWerkstatt() {
  const name     = document.getElementById('wName').value.trim();
  const city     = document.getElementById('wCity').value.trim();
  const plz      = document.getElementById('wPlz').value.trim();
  const email    = document.getElementById('wEmail').value.trim();
  const services = document.getElementById('wServices').value.trim();
  const rating   = document.getElementById('wRating').value.trim();
  const msg      = document.getElementById('werkMsg');
  if (!name || !email) { msg.style.cssText='color:var(--red)'; msg.textContent='Name und E-Mail sind Pflichtfelder.'; return; }
  const isEdit = _werkEditId !== null;
  const url    = isEdit ? '/api/werkstaetten/' + _werkEditId : '/api/werkstaetten';
  const method = isEdit ? 'PATCH' : 'POST';
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, city, plz, email, services, rating: rating ? parseFloat(rating) : null }),
    }).then(r => r.json());
    if (res.success) {
      msg.style.cssText = 'color:var(--green)';
      msg.textContent = isEdit ? '✓ Gespeichert.' : '✓ Hinzugefügt.';
      cancelEditWerkstatt();
      loadWerkstaetten();
    } else { msg.style.cssText='color:var(--red)'; msg.textContent = res.error || 'Fehler'; }
  } catch(e) { msg.style.cssText='color:var(--red)'; msg.textContent = 'Netzwerkfehler.'; }
}

async function deleteWerkstatt(id, name) {
  if (!confirm(`Werkstatt "${name}" wirklich löschen?`)) return;
  try {
    const res = await fetch('/api/werkstaetten/' + id, { method: 'DELETE' }).then(r => r.json());
    if (res.success) { if (_werkEditId === id) cancelEditWerkstatt(); loadWerkstaetten(); }
    else showToast('⚠ ' + (res.error || 'Fehler'));
  } catch(e) { showToast('⚠ Netzwerkfehler'); }
}

// ─── FUHRPARKS ───
let _fuhrparksCache = [];

async function loadFuhrparks(showRefreshToast = false) {
  try {
    const rows = await fetch('/api/fuhrparks').then(r => r.json());
    const tbody = document.getElementById('tblFuhrparks');
    if (!tbody) return;
    if (!Array.isArray(rows)) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--red);padding:24px">Fehler beim Laden — bitte Seite neu laden.</td></tr>';
      return;
    }
    _fuhrparksCache = rows;
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--t3);padding:24px">Keine Fuhrparks angelegt</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(fp => `
      <tr>
        <td><strong>${fp.name}</strong></td>
        <td>${fp.kontakt_email || '—'}</td>
        <td>${fp.telefon || '—'}</td>
        <td>${fmtDate(fp.created_at)}</td>
        <td><button class="td-btn" onclick="editFuhrparkById(${fp.id})">Bearbeiten</button></td>
      </tr>
    `).join('');
    if (showRefreshToast) showToast('✓ Aktualisiert');
  } catch(e) {
    console.error(e);
    const tbody = document.getElementById('tblFuhrparks');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--red);padding:24px">Fehler beim Laden — bitte Seite neu laden.</td></tr>';
  }
}

async function createFuhrpark() {
  const fpId  = document.getElementById('fpId').value;
  const name  = document.getElementById('fpName').value.trim();
  const email = document.getElementById('fpEmail').value.trim();
  const tel   = document.getElementById('fpTel').value.trim();
  const msg   = document.getElementById('fpMsg');
  if (!name) {
    msg.style.cssText = 'display:block;color:var(--red)';
    msg.textContent = 'Name ist Pflichtfeld.';
    return;
  }
  const method = fpId ? 'PATCH' : 'POST';
  const url    = fpId ? `/api/fuhrparks/${fpId}` : '/api/fuhrparks';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, kontakt_email: email || null, telefon: tel || null })
  }).then(r => r.json());
  if (res.id) {
    msg.style.cssText = 'display:block;color:var(--green)';
    msg.textContent = fpId ? 'Fuhrpark gespeichert.' : 'Fuhrpark angelegt.';
    cancelFuhrparkEdit();
    loadFuhrparks();
    setTimeout(() => { msg.style.display = 'none'; }, 3000);
  } else {
    msg.style.cssText = 'display:block;color:var(--red)';
    msg.textContent = res.error || 'Fehler';
  }
}

function editFuhrparkById(id) {
  const fp = _fuhrparksCache.find(f => f.id === id);
  if (fp) editFuhrpark(fp.id, fp.name, fp.kontakt_email || '', fp.telefon || '');
}

function editFuhrpark(id, name, email, tel) {
  document.getElementById('fpId').value    = id;
  document.getElementById('fpName').value  = name;
  document.getElementById('fpEmail').value = email;
  document.getElementById('fpTel').value   = tel;
  document.getElementById('fpFormTitle').textContent = 'Fuhrpark bearbeiten';
  document.getElementById('fpSubmitBtn').textContent = 'Änderungen speichern →';
  document.getElementById('fpCancelBtn').style.display = 'inline-flex';
  document.getElementById('fpMsg').style.display = 'none';
  document.getElementById('fpName').focus();
  document.getElementById('fpName').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function cancelFuhrparkEdit() {
  document.getElementById('fpId').value    = '';
  document.getElementById('fpName').value  = '';
  document.getElementById('fpEmail').value = '';
  document.getElementById('fpTel').value   = '';
  document.getElementById('fpFormTitle').textContent = 'Fuhrpark anlegen';
  document.getElementById('fpSubmitBtn').textContent = 'Fuhrpark anlegen →';
  document.getElementById('fpCancelBtn').style.display = 'none';
}

// ─── FAHRER ───
async function loadFuhrparkDropdown() {
  try {
    const rows = await fetch('/api/fuhrparks').then(r => r.json());
    const sel = document.getElementById('frFuhrpark');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Fuhrpark wählen —</option>' +
      rows.map(fp => `<option value="${fp.id}">${fp.name}</option>`).join('');
  } catch(e) { console.error(e); }
}

async function loadFahrer(showRefreshToast = false) {
  try {
    const rows = await fetch('/api/fahrer').then(r => r.json());
    const tbody = document.getElementById('tblFahrer');
    if (!tbody) return;
    if (!Array.isArray(rows)) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--red);padding:24px">Fehler beim Laden — bitte Seite neu laden.</td></tr>';
      return;
    }
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--t3);padding:24px">Keine Fahrer angelegt</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(f => {
      let badge;
      if (f.aktiv) {
        badge = '<span style="background:#dcfce7;color:#166534;padding:5px 12px;border-radius:20px;font-size:13px;font-weight:700">Aktiv</span>';
      } else if (f.has_invite_token) {
        badge = '<span style="background:#fef3c7;color:#92400e;padding:5px 12px;border-radius:20px;font-size:13px;font-weight:700">Einladung offen</span>';
      } else {
        badge = '<span style="background:#fee2e2;color:#991b1b;padding:5px 12px;border-radius:20px;font-size:13px;font-weight:700">Inaktiv</span>';
      }
      const toggleBtn = f.aktiv
        ? `<button class="td-btn" onclick="toggleFahrerStatus(${f.id},false)">Pause</button>`
        : (!f.has_invite_token
            ? `<button class="td-btn" onclick="toggleFahrerStatus(${f.id},true)">Aktivieren</button>`
            : '');
      return `<tr>
        <td><strong>${f.vorname} ${f.nachname}</strong></td>
        <td>${f.fuhrpark_name}</td>
        <td>${f.email || '—'}</td>
        <td>${badge}</td>
        <td id="fAkt${f.id}"><div style="display:flex;gap:6px;align-items:center">
          ${toggleBtn}
          <button class="td-btn" style="color:var(--red);border-color:rgba(220,38,38,.3)" onclick="deleteFahrer(${f.id})">Löschen</button>
        </div></td>
      </tr>`;
    }).join('');
    if (showRefreshToast) showToast('✓ Aktualisiert');
  } catch(e) {
    console.error(e);
    const tbody = document.getElementById('tblFahrer');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--red);padding:24px">Fehler beim Laden — bitte Seite neu laden.</td></tr>';
  }
}

async function createFahrer() {
  const vorname     = document.getElementById('frVorname').value.trim();
  const nachname    = document.getElementById('frNachname').value.trim();
  const email       = document.getElementById('frEmail').value.trim();
  const telefon     = document.getElementById('frTel').value.trim();
  const fuhrpark_id = document.getElementById('frFuhrpark').value;
  const msg         = document.getElementById('frMsg');
  if (!vorname) { msg.style.cssText='display:block;color:var(--red)'; msg.textContent='Vorname fehlt.'; return; }
  if (!nachname) { msg.style.cssText='display:block;color:var(--red)'; msg.textContent='Nachname fehlt.'; return; }
  if (!email) { msg.style.cssText='display:block;color:var(--red)'; msg.textContent='E-Mail fehlt.'; return; }
  if (!fuhrpark_id) { msg.style.cssText='display:block;color:var(--red)'; msg.textContent='Bitte Fuhrpark auswählen.'; return; }
  try {
    const res = await fetch('/api/fahrer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vorname, nachname, email, telefon: telefon || null, fuhrpark_id: parseInt(fuhrpark_id) })
    }).then(r => r.json());
    if (res.success) {
      msg.style.cssText = 'display:block;color:var(--green)';
      msg.textContent = 'Fahrer angelegt — Einladung gesendet.';
      document.getElementById('frVorname').value = '';
      document.getElementById('frNachname').value = '';
      document.getElementById('frEmail').value = '';
      document.getElementById('frTel').value = '';
      document.getElementById('frFuhrpark').value = '';
      loadFahrer();
      setTimeout(() => { msg.style.display = 'none'; }, 4000);
    } else {
      msg.style.cssText = 'display:block;color:var(--red)';
      msg.textContent = res.error === 'E-Mail bereits vergeben'
        ? 'Diese E-Mail ist bereits registriert.'
        : (res.error || 'Fehler');
    }
  } catch(e) {
    console.error(e);
    msg.style.cssText = 'display:block;color:var(--red)';
    msg.textContent = 'Netzwerkfehler. Bitte erneut versuchen.';
  }
}

async function ensureImportFuhrparks() {
  const sel = document.getElementById('frImportFuhrpark');
  if (!sel || sel.options.length > 1) return;
  try {
    const rows = await fetch('/api/fuhrparks').then(r => r.json());
    sel.innerHTML = '<option value="">-- Fuhrpark waehlen --</option>' +
      rows.map(fp => `<option value="${fp.id}">${fp.name}</option>`).join('');
  } catch(e) { console.error(e); }
}

function normalizeImportHeader(value) {
  return String(value || '').toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '')
    .replace(/[ä]/g, 'ae')
    .replace(/[ö]/g, 'oe')
    .replace(/[ü]/g, 'ue')
    .replace(/[ß]/g, 'ss');
}

function pickImportValue(row, names) {
  for (const [key, value] of Object.entries(row)) {
    if (names.includes(normalizeImportHeader(key))) return String(value || '').trim();
  }
  return '';
}

function mapFahrerImportRows(rows) {
  return rows.map(row => ({
    vorname: pickImportValue(row, ['vorname', 'firstname', 'first']),
    nachname: pickImportValue(row, ['nachname', 'lastname', 'name', 'surname']),
    email: pickImportValue(row, ['email', 'emailadresse', 'emailaddress', 'emailaddress', 'mail']),
    telefon: pickImportValue(row, ['telefon', 'phone', 'tel', 'mobil', 'mobile', 'handy']),
  })).filter(f => f.vorname || f.nachname || f.email || f.telefon);
}

function downloadFahrerImportTemplate() {
  if (typeof XLSX === 'undefined') { showToast('XLSX-Bibliothek nicht geladen'); return; }
  const rows = [{ Vorname: 'Max', Nachname: 'Mustermann', 'E-Mail': 'max@muster.de', Telefon: '0170 1234567' }];
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Fahrer');
  XLSX.writeFile(wb, 'fahrer-import-vorlage.xlsx');
}

async function importFahrerExcel() {
  await ensureImportFuhrparks();
  const fuhrparkId = document.getElementById('frImportFuhrpark').value;
  const file = document.getElementById('frImportFile').files[0];
  const msg = document.getElementById('frImportMsg');
  const resultEl = document.getElementById('frImportResult');
  const btn = document.getElementById('frImportBtn');
  resultEl.style.display = 'none';
  resultEl.innerHTML = '';
  if (!fuhrparkId) { msg.style.cssText='display:block;color:var(--red)'; msg.textContent='Bitte Fuhrpark auswählen.'; return; }
  if (!file) { msg.style.cssText='display:block;color:var(--red)'; msg.textContent='Bitte Excel- oder CSV-Datei auswählen.'; return; }
  if (typeof XLSX === 'undefined') { msg.style.cssText='display:block;color:var(--red)'; msg.textContent='XLSX-Bibliothek nicht geladen.'; return; }
  try {
    btn.disabled = true;
    msg.style.cssText='display:block;color:var(--t2)';
    msg.textContent='Datei wird gelesen ...';
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const fahrer = mapFahrerImportRows(XLSX.utils.sheet_to_json(ws, { defval: '' }));
    if (!fahrer.length) { msg.style.cssText='display:block;color:var(--red)'; msg.textContent='Keine Fahrer gefunden. Bitte Spalten prüfen.'; return; }
    if (fahrer.length > 200) { msg.style.cssText='display:block;color:var(--red)'; msg.textContent='Maximal 200 Fahrer pro Import erlaubt.'; return; }
    msg.textContent=`${fahrer.length} Fahrer werden importiert ...`;
    const res = await fetch('/api/fahrer/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fuhrpark_id: parseInt(fuhrparkId, 10), fahrer })
    }).then(r => r.json());
    if (!res.success) { msg.style.cssText='display:block;color:var(--red)'; msg.textContent = res.error || 'Import fehlgeschlagen.'; return; }
    msg.style.cssText='display:block;color:var(--green)';
    msg.textContent = `${res.created} Fahrer angelegt, ${res.failed} Fehler.`;
    const failed = (res.results || []).filter(r => !r.success);
    if (failed.length) {
      resultEl.style.display = 'block';
      resultEl.style.cssText = 'display:block;margin-top:14px;font-size:13px;line-height:1.55;color:var(--red);background:#fff0f0;border:1px solid #fecaca;border-radius:10px;padding:12px';
      resultEl.innerHTML = '<strong>Nicht importiert:</strong><br>' + failed.slice(0, 20).map(r => `Zeile ${r.row}: ${r.email || 'ohne E-Mail'} - ${r.error}`).join('<br>');
    }
    document.getElementById('frImportFile').value = '';
    loadFahrer();
  } catch(e) {
    console.error(e);
    msg.style.cssText='display:block;color:var(--red)';
    msg.textContent='Import fehlgeschlagen. Bitte Datei prüfen.';
  } finally {
    btn.disabled = false;
  }
}

async function toggleFahrerStatus(id, aktiv) {
  try {
    const res = await fetch(`/api/fahrer/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aktiv })
    }).then(r => r.json());
    if (res.success) loadFahrer();
    else showToast('⚠ ' + (res.error || 'Fehler'));
  } catch(e) { console.error(e); showToast('⚠ Netzwerkfehler'); }
}

function deleteFahrer(id) {
  const cell = document.getElementById('fAkt' + id);
  if (!cell) return;
  cell.innerHTML = `<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
    <span style="font-size:13px;color:var(--red);font-weight:600">Wirklich anonymisieren?</span>
    <button class="td-btn" style="color:var(--red);border-color:rgba(220,38,38,.3)" onclick="confirmDeleteFahrer(${id})">Ja, löschen</button>
    <button class="td-btn" onclick="loadFahrer()">Abbrechen</button>
  </div>`;
}

async function confirmDeleteFahrer(id) {
  const res = await fetch(`/api/fahrer/${id}`, { method: 'DELETE' }).then(r => r.json());
  if (res.success) { showToast('✓ Fahrer anonymisiert (DSGVO Art. 17)'); loadFahrer(); }
  else showToast('⚠ ' + (res.error || 'Fehler'));
}

// ─── EXCEL EXPORT ───
function exportExcel(){
  if(typeof XLSX==='undefined'){showToast('⚠ XLSX-Bibliothek nicht geladen');return;}
  fetch('/api/submissions').then(r=>r.json()).then(rows=>{
    const data=rows.map(r=>({
      'Datum':fmtDate(r.created_at),'Firma':r.firma,'Ansprechpartner':r.name,
      'Telefon':r.telefon,'E-Mail':r.email||'','Marke':r.marke||'',
      'Modell':r.modell||'','Baujahr':r.baujahr||'','KM':r.km||'',
      'Anmerkung':r.anmerkung||'','Status':r.status
    }));
    const ws=XLSX.utils.json_to_sheet(data);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'Anfragen');
    XLSX.writeFile(wb,'IMD_Anfragen_'+new Date().toISOString().split('T')[0]+'.xlsx');
  }).catch(()=>showToast('⚠ Fehler beim Exportieren'));
}

// ─── VERTRÄGE ───
async function exportVertrag() {
  const ag_firma = document.getElementById('vAGFirma').value.trim();
  const datum    = document.getElementById('vDatum').value;
  const msg      = document.getElementById('vertragMsg');

  if (!ag_firma || !datum) {
    msg.style.cssText = 'display:inline;color:var(--red)';
    msg.textContent   = 'Pflichtfelder: Firma und Datum ausfüllen.';
    return;
  }
  msg.style.display = 'none';

  const body = {
    an_firmierung: document.getElementById('vAN').value.trim() || 'IMD Fleet Services',
    ag_firma,
    ort_an: document.getElementById('vOrtAN').value.trim(),
    ort_ag: document.getElementById('vOrtAG').value.trim(),
    datum,
  };

  try {
    const res = await fetch('/api/vertrag/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error); }

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const safeName = ag_firma.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_');
    a.href     = url;
    a.download = `Rahmenvertrag_${safeName}.docx`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Vertrag exportiert');
  } catch (err) {
    msg.style.cssText = 'display:inline;color:var(--red)';
    msg.textContent   = '⚠ Fehler: ' + err.message;
  }
}

// ─── PROZESS ANIMATION ───
let prozessAnimated=false;
function checkProzess(){
  const wrap=document.getElementById('prozessWrap');
  if(!wrap||prozessAnimated) return;
  const rect=wrap.getBoundingClientRect();
  if(rect.top<window.innerHeight*0.75){
    prozessAnimated=true;
    setTimeout(()=>{
      const fill=document.getElementById('prozessLineFill');
      if(fill) fill.classList.add('animate');
    },100);
    ['ps1','ps2','ps3','ps4'].forEach((id,i)=>{
      setTimeout(()=>{const el=document.getElementById(id);if(el) el.classList.add('in');},150+i*220);
    });
  }
}
window.addEventListener('scroll',checkProzess,{passive:true});
window.addEventListener('load',checkProzess);

// ─── COUNTUP ANIMATION ───
function animateCountup(el) {
  var target = parseFloat(el.dataset.countup);
  var prefix = el.dataset.prefix || '';
  var suffix = el.dataset.suffix || '';
  var duration = 1600;
  var start = performance.now();
  var isDecimal = target % 1 !== 0;

  function step(now) {
    var progress = Math.min((now - start) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = eased * target;
    el.textContent = prefix + (isDecimal ? current.toFixed(1).replace('.',',') : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

document.querySelectorAll('.stat-num[data-countup]').forEach(function(el) {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        animateCountup(el);
        obs.disconnect();
      }
    });
  }, { threshold: 0.5 });
  obs.observe(el);
});

// ─── CALCULATOR ───
function calcUpdate(){
  const cAnzahl=document.getElementById('cAnzahl');
  if(!cAnzahl)return;
  const cStd=document.getElementById('cStd');
  const cSatz=document.getElementById('cSatz');
  const cPreis=document.getElementById('cPreis');
  if(!cStd||!cSatz||!cPreis)return;
  const n=+cAnzahl.value||5;
  const s=+cStd.value||8;
  const rate=+cSatz.value||65;
  const price=+cPreis.value||22000;
  document.getElementById('cAnzahlLbl').textContent=n+(n===1?' Fahrzeug':' Fahrzeuge');
  document.getElementById('cStdLbl').textContent=s+' Std./Fzg.';
  const oldH=n*s,newH=n*0.3,saved=Math.round(oldH-newH);
  const kosten=Math.round(saved*rate),bonus=Math.round(n*price*0.094);
  document.getElementById('calcRes').classList.add('show');
  document.getElementById('cSavedH').textContent=saved+'h';
  document.getElementById('cOldH').textContent=oldH+'h';
  document.getElementById('cNewH').textContent=Math.round(newH*10)/10+'h';
  document.getElementById('cB1').textContent=saved+' Stunden';
  document.getElementById('cB2').textContent=kosten.toLocaleString('de-DE')+' €';
  document.getElementById('cB3').textContent='~ '+bonus.toLocaleString('de-DE')+' €';
  document.getElementById('cTotal').textContent='~ '+(kosten+bonus).toLocaleString('de-DE')+' €';
}
window.addEventListener('load',calcUpdate);

// ─── FAQ ───
function toggleFaq(el){
  const wasOpen=el.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(f=>f.classList.remove('open'));
  if(!wasOpen) el.classList.add('open');
}

// ─── FORM ───
let step=1;
const stitles={1:['Fahrzeugdaten','Schritt 1 von 3 — Grunddaten Ihres Fahrzeugs'],2:['Fahrzeugzustand & Ansprechpartner','Schritt 2 von 3'],3:['Kontaktdaten','Schritt 3 von 3 — Ihre Kontaktinformationen']};
const barW={1:'33.3%',2:'66.6%',3:'100%'};
function goStep(n){
  if(n===2&&(!document.getElementById('fMarke').value||!document.getElementById('fModell').value||!document.getElementById('fJahr').value||!document.getElementById('fKm').value)){showToast('⚠ Bitte alle Pflichtfelder ausfüllen.');return;}
  if(n===3&&(!document.getElementById('fVorname').value||!document.getElementById('fNachname').value||!document.getElementById('fTelOrt').value)){showToast('⚠ Bitte Ansprechpartner vor Ort ausfüllen.');return;}
  document.getElementById('fp'+step).classList.remove('act');
  document.getElementById('fp'+n).classList.add('act');
  step=n;
  [1,2,3].forEach(i=>{
    const sp=document.getElementById('sp'+i);
    sp.className='spill '+(i<n?'done':i===n?'act':'todo');
  });
  document.getElementById('fstit').textContent=stitles[n][0];
  document.getElementById('fssub').textContent=stitles[n][1];
  document.getElementById('formBar').style.width=barW[n];
  if(n===3) setMinDate();
}
function toggleChk(id,el){document.getElementById(id).classList.toggle('on',el.checked);}
function toggleConsent(wrapId,inputId){const inp=document.getElementById(inputId);inp.checked=!inp.checked;document.getElementById(wrapId).classList.toggle('on',inp.checked);}
function submitForm(){
  if(!document.getElementById('fFirma').value||!document.getElementById('fName').value||!document.getElementById('fTel').value){showToast('⚠ Pflichtfelder ausfüllen.');return;}
  if(!document.getElementById('fC1').checked){showToast('⚠ Bitte den Bedingungen zustimmen.');return;}
  if(!document.getElementById('fC2').checked){showToast('⚠ Bitte der Datenschutzerklärung zustimmen.');return;}
  const btn = document.querySelector('.btn-submit');
  if(btn){btn.disabled=true;btn.textContent='Wird gesendet...';}
  const fd = new FormData();
  fd.append('firma',   document.getElementById('fFirma').value||'');
  fd.append('name',    document.getElementById('fName').value||'');
  fd.append('email',   document.getElementById('fEmail').value||'');
  fd.append('telefon', document.getElementById('fTel').value||'');
  fd.append('marke',   document.getElementById('fMarke').value||'');
  fd.append('modell',  document.getElementById('fModell')?.value||'');
  fd.append('baujahr', document.getElementById('fBaujahr')?.value||'');
  fd.append('km',      document.getElementById('fKm')?.value||'');
  fd.append('fahrzeuge','');
  fd.append('anmerkung', document.getElementById('fHinweise')?.value||'');
  fd.append('consent', '1');
  fetch('/submit',{method:'POST',body:fd})
    .then(r=>r.json())
    .then(data=>{
      if(data.success){
        document.getElementById('fp3').classList.remove('act');
        document.getElementById('fOk').classList.add('show');
        document.getElementById('formBar').style.width='100%';
        showToast('✓ Fahrzeug angemeldet!');
      } else {
        showToast('⚠ Fehler: '+(data.error||'Bitte erneut versuchen.'));
        if(btn){btn.disabled=false;btn.innerHTML='Fahrzeug anmelden ✓';}
      }
    })
    .catch(()=>{
      showToast('⚠ Netzwerkfehler. Bitte erneut versuchen.');
      if(btn){btn.disabled=false;btn.innerHTML='Fahrzeug anmelden ✓';}
    });
}
function setMinDate(){
  const d=new Date();let added=0;
  while(added<3){d.setDate(d.getDate()+1);if(d.getDay()!==0&&d.getDay()!==6)added++;}
  const iso=d.toISOString().split('T')[0];
  const el=document.getElementById('fTermin');
  el.min=iso;if(!el.value)el.value=iso;
  document.getElementById('terminHint').textContent='Frühester Termin: '+d.toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long'});
}

// ─── NAV ───
function updateNavState(){const nav=document.getElementById('nav');if(!nav)return;const hero=document.querySelector('.concrete-exact-active');const concrete=nav.classList.contains('nav-hidden-for-concrete')&&hero;if(concrete){const active=scrollY>6;nav.classList.toggle('sc',active);nav.classList.toggle('concrete-nav-over-hero',active&&scrollY<hero.offsetHeight-84);return;}nav.classList.toggle('sc',scrollY>50);nav.classList.remove('concrete-nav-over-hero');}
window.addEventListener('scroll',updateNavState,{passive:true});
window.addEventListener('load',updateNavState);
function toggleMob(){const m=document.getElementById('mobMenu'),b=document.getElementById('burger');m.classList.toggle('open');b.classList.toggle('open');document.body.style.overflow=m.classList.contains('open')?'hidden':'';}
function closeMob(){document.getElementById('mobMenu').classList.remove('open');document.getElementById('burger').classList.remove('open');document.body.style.overflow='';}
function goTo(id){document.getElementById(id).scrollIntoView({behavior:'smooth'});}

// ─── ANIMATED EXPLAINER ───
(function(){
  const SLIDES = document.querySelectorAll('.mgp-slide');
  if(!SLIDES.length)return;
  const TICKS  = document.querySelectorAll('.mgp-tl-tick');
  const FILL   = document.getElementById('mgpTlFill');
  const TIMER  = document.getElementById('mgpTimer');
  const DURATIONS = [5000,7000,7000,8000,8000,6000]; // ms per slide
  const TOTAL_MS  = DURATIONS.reduce((a,b)=>a+b,0);

  let cur=0, playing=false, elapsed=0, lastTs=null, rafId=null;

  function showSlide(n, skipAnim){
    SLIDES.forEach((s,i)=>{
      s.classList.remove('active','exit');
      if(i!==n) s.style.position='absolute';
    });
    const slide = SLIDES[n];
    slide.classList.add('active');
    slide.style.position='relative';

    // Re-trigger CSS animations by cloning + replacing animated children
    if(!skipAnim){
      slide.querySelectorAll('[class*="mgp-anim-"]').forEach(el=>{
        el.style.animation='none';
        el.offsetHeight; // reflow
        el.style.animation='';
      });
      // Re-trigger route + truck SVG
      slide.querySelectorAll('.mgp-route, .mgp-truck-move').forEach(el=>{
        el.style.animation='none';
        el.offsetHeight;
        el.style.animation='';
      });
      // Re-trigger bars
      slide.querySelectorAll('.mgp-val-bar').forEach(el=>{
        el.style.setProperty('--pct', el.style.getPropertyValue('--pct'));
        el.querySelectorAll('::after');
      });
      // Progress bar fill animation
      const pBar = slide.querySelector('.mgp-form-progress-fill');
      if(pBar){ pBar.style.width='0%'; setTimeout(()=>pBar.style.width='33%',200); }
    }

    // Update ticks
    TICKS.forEach((t,i)=>t.classList.toggle('active',i===n));

    // Update fill
    const fillPct = (n / (SLIDES.length-1)) * 100;
    if(FILL) FILL.style.width = fillPct+'%';

    cur = n;
  }

  function formatTime(ms){
    const s=Math.floor(ms/1000), m=Math.floor(s/60);
    return m+':'+(s%60).toString().padStart(2,'0');
  }

  function frame(ts){
    if(!lastTs) lastTs=ts;
    const dt = ts-lastTs; lastTs=ts;

    if(playing){
      elapsed = Math.min(elapsed+dt, TOTAL_MS);

      // Which slide?
      let acc=0, newSlide=0;
      for(let i=0;i<DURATIONS.length;i++){
        if(elapsed <= acc+DURATIONS[i]){ newSlide=i; break; }
        acc+=DURATIONS[i];
        newSlide=DURATIONS.length-1;
      }
      if(newSlide !== cur) showSlide(newSlide);

      // Fill within current slide
      let slideStart=0;
      for(let i=0;i<cur;i++) slideStart+=DURATIONS[i];
      const slideProg = (elapsed-slideStart)/DURATIONS[cur];
      const totalProg = elapsed/TOTAL_MS;
      if(FILL) FILL.style.width=(totalProg*100)+'%';
      if(TIMER) TIMER.textContent=formatTime(elapsed)+' / '+formatTime(TOTAL_MS);

      if(elapsed>=TOTAL_MS){ playing=false; setUI(false); }
    }

    rafId=requestAnimationFrame(frame);
  }

  function setUI(isPlaying){
    document.getElementById('mgpPlayIco').style.display=isPlaying?'none':'';
    document.getElementById('mgpPauseIco').style.display=isPlaying?'':'none';
    document.getElementById('mgpPlayLbl').textContent=isPlaying?'Pause':'Abspielen';
  }

  function mgpToggle(){
    if(elapsed>=TOTAL_MS){ elapsed=0; showSlide(0); }
    playing=!playing; lastTs=null; setUI(playing);
  }
  function mgpGoTo(n){
    // jump elapsed to start of that slide
    let acc=0; for(let i=0;i<n;i++) acc+=DURATIONS[i];
    elapsed=acc; lastTs=null;
    showSlide(n);
    if(FILL) FILL.style.width=(acc/TOTAL_MS*100)+'%';
  }
  window.mgpToggle=mgpToggle;
  window.mgpGoTo=mgpGoTo;

  // Init
  showSlide(0, true);
  rafId=requestAnimationFrame(frame);

  // Auto-play on scroll into view
  const wrap=document.querySelector('.mgp-wrap');
  if(wrap){
    new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting && !playing && elapsed===0){
          playing=true; lastTs=null; setUI(true);
        }
      });
    },{threshold:0.4}).observe(wrap);
  }
})();


// ─── MODELL DROPDOWN ───
const MODELLE = {
  'BMW': ['1er (118i / 118d)','2er Active Tourer','2er Gran Coupé','3er (320i / 320d / 330d / 330e)','3er Touring','4er Gran Coupé','5er (520d / 530d / 530e)','5er Touring','6er Gran Turismo','7er','X1','X2','X3 (xDrive20d / xDrive30d / xDrive30e)','X4','X5','X6','X7','iX1','iX3','iX','i4','i5','i7','M2','M3','M4','M5'],
  'Mercedes-Benz': ['A-Klasse (A180 / A200 / A220d)','B-Klasse','C-Klasse (C200 / C220d / C300)','C-Klasse T-Modell','E-Klasse (E200 / E220d / E300)','E-Klasse T-Modell','E-Klasse All-Terrain','S-Klasse','CLA','CLS','GLA','GLB','GLC','GLC Coupé','GLE','GLS','EQA','EQB','EQC','EQE','EQS','Sprinter','Vito','V-Klasse'],
  'Audi': ['A1','A3 Sportback (35 TFSI / 35 TDI / 40 TDI)','A3 Limousine','A4 Avant (35 TDI / 40 TDI)','A4 Allroad','A5 Sportback','A6 Avant (40 TDI / 45 TDI)','A6 Allroad','A7','A8','Q2','Q3','Q3 Sportback','Q4 e-tron','Q5','Q5 Sportback','Q7','Q8','Q8 e-tron','e-tron GT'],
  'Volkswagen': ['Polo','Golf (1.0 TSI / 1.5 TSI / 2.0 TDI / GTE / GTI)','Golf Variant','Passat (1.5 TSI / 2.0 TDI / GTE)','Passat Variant','Arteon','Arteon Shooting Brake','T-Roc','Tiguan','Tiguan Allspace','Touareg','Touran','ID.3','ID.4','ID.5','ID.7','Caddy','Transporter T6.1','Multivan T7'],
  'Skoda': ['Fabia','Octavia (1.0 TSI / 1.5 TSI / 2.0 TDI)','Octavia Combi','Octavia iV','Superb (1.5 TSI / 2.0 TDI)','Superb Combi','Kamiq','Karoq','Kodiaq','Enyaq iV','Enyaq Coupé iV'],
  'Ford': ['Fiesta','Focus (1.0 EcoBoost / 1.5 EcoBlue / PHEV)','Focus Turnier','Kuga (1.5 EcoBoost / PHEV / FHEV)','Puma','Mustang Mach-E','Galaxy','S-Max','Transit Custom','Transit','Tourneo Custom'],
  'Opel': ['Corsa','Astra (1.2 Turbo / 1.5 Diesel / PHEV)','Astra Sports Tourer','Insignia (1.5 Diesel / 2.0 Diesel)','Insignia Sports Tourer','Crossland','Mokka','Mokka-e','Grandland','Grandland PHEV','Vivaro','Zafira Life'],
  'Toyota': ['Yaris','Yaris Cross','Corolla (1.8 Hybrid / 2.0 GR SPORT)','Corolla Touring Sports','C-HR','C-HR Plug-in Hybrid','RAV4 Hybrid','RAV4 Plug-in Hybrid','Highlander Hybrid','Land Cruiser','bZ4X','Proace','Proace Verso'],
  'Volvo': ['V60 (B3 / B4 / B5 / Recharge)','V60 Cross Country','V90 (B4 / B5 / Recharge)','V90 Cross Country','S60','S90','XC40 (B4 / Recharge)','XC60 (B4 / B5 / Recharge)','XC90 (B5 / Recharge)','C40 Recharge'],
  'Porsche': ['Macan','Macan EV','Cayenne (E-Hybrid / Turbo)','Cayenne Coupé','Panamera (4 E-Hybrid / Turbo)','Panamera Sport Turismo','Taycan (4S / GTS / Turbo)','Taycan Cross Turismo','911 Carrera','718 Boxster','718 Cayman'],
  'Renault': ['Clio','Mégane (TCe / E-Tech)','Mégane E-Tech Electric','Captur (TCe / E-Tech Plug-in)','Kadjar','Koleos','Zoe','Arkana','Kangoo','Trafic','Master'],
  'Andere': ['— Modell eingeben —'],
};

function populateModels(marke) {
  // Remove any previously injected free-text input
  const existing = document.getElementById('fModell');
  if (existing && existing.tagName === 'INPUT') {
    const sel = document.createElement('select');
    sel.className = 'fsel';
    sel.id = 'fModell';
    existing.parentNode.replaceChild(sel, existing);
  }
  const sel = document.getElementById('fModell');
  if (!sel) return;
  sel.innerHTML = '';
  if (!marke || !MODELLE[marke]) {
    sel.innerHTML = '<option value="">— erst Marke wählen —</option>';
    sel.disabled = true;
    sel.style.opacity = '.5';
    return;
  }
  if (marke === 'Andere') {
    // Replace dropdown with free text input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'fi';
    input.id = 'fModell';
    input.placeholder = 'Modell eingeben';
    sel.parentNode.replaceChild(input, sel);
    return;
  }
  const placeholder = document.createElement('option');
  placeholder.value = ''; placeholder.textContent = '— Modell wählen —';
  sel.appendChild(placeholder);
  MODELLE[marke].forEach(m => {
    const opt = document.createElement('option');
    opt.value = m; opt.textContent = m;
    sel.appendChild(opt);
  });
  sel.disabled = false;
  sel.style.opacity = '1';
}

function showToast(msg){const t=document.createElement('div');
  t.className='toast';t.textContent=msg;document.body.appendChild(t);
  setTimeout(()=>t.classList.add('show'),10);
  setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),400)},3200);
}

// Scroll reveal — make all animated elements visible
function revealAll() {
  document.querySelectorAll('.wf-step,.rev,.pstep,.mgp-anim-up,.mgp-anim-scale').forEach(el => {
    el.classList.add('in');
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

// IntersectionObserver for scroll animations
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.wf-step, .rev, .pstep').forEach(el => io.observe(el));

// Nav scroll behavior
window.addEventListener('scroll', updateNavState, {passive: true});

// Mob menu
function toggleMob() {
  document.getElementById('mobMenu').classList.toggle('open');
  document.querySelector('.nav-mob-toggle').classList.toggle('open');
}
function closeMob() {
  document.getElementById('mobMenu').classList.remove('open');
  document.querySelector('.nav-mob-toggle')?.classList.remove('open');
}

// Scroll to section
function goTo(id) {
  closeMob();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({behavior:'smooth'});
}

function openPwaVideo() {
  const modal = document.getElementById('pwa-videoModal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closePwaVideo() {
  const modal = document.getElementById('pwa-videoModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Dashboard (employee only — triggered via Ctrl+Shift+D)
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    openDash();
  }
  if (e.key === 'Escape') { closeDash(); }
});

// Zeitrechner
function calcZeit() {
  const n = parseInt(document.getElementById('anzahl')?.value) || 5;
  const days = Math.max(1, Math.round(n * 0.8));
  const saved = Math.round(n * 3.5);
  const el = document.getElementById('calc-result');
  if (el) el.textContent = `${days} Werktage · ${saved} Stunden gespart`;
}


// Prozess animation trigger on load
window.addEventListener('load', () => {
  revealAll();
  const fill = document.getElementById('prozessLineFill');
  if (fill) setTimeout(() => fill.style.width = '100%', 500);
});

// Also reveal on DOMContentLoaded
document.addEventListener('DOMContentLoaded', revealAll);

// ─── AUTO-OPEN DASHBOARD ON /intern ───
if (window.location.pathname === '/intern') {
  window.addEventListener('load', openDash);
}
