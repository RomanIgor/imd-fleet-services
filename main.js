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
function showPanel(id,el){document.querySelectorAll('.dp').forEach(p=>p.classList.remove('act'));document.getElementById(id).classList.add('act');if(el){document.querySelectorAll('.dsb-item').forEach(i=>i.classList.remove('act'));el.classList.add('act');}if(id==='dUsers')loadUsers();}

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
  const n=+document.getElementById('cAnzahl').value||5;
  const s=+document.getElementById('cStd').value||8;
  const rate=+document.getElementById('cSatz').value||65;
  const price=+document.getElementById('cPreis').value||22000;
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
window.addEventListener('scroll',()=>document.getElementById('nav').classList.toggle('sc',scrollY>50),{passive:true});
function toggleMob(){const m=document.getElementById('mobMenu'),b=document.getElementById('burger');m.classList.toggle('open');b.classList.toggle('open');document.body.style.overflow=m.classList.contains('open')?'hidden':'';}
function closeMob(){document.getElementById('mobMenu').classList.remove('open');document.getElementById('burger').classList.remove('open');document.body.style.overflow='';}
function goTo(id){document.getElementById(id).scrollIntoView({behavior:'smooth'});}

// ─── ANIMATED EXPLAINER ───
(function(){
  const SLIDES = document.querySelectorAll('.mgp-slide');
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
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('sc', scrollY > 50);
}, {passive: true});

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