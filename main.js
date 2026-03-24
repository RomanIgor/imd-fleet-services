// ─── DATA ───
const vehicles=[
  {id:1,name:'BMW 320d xDrive',year:2021,km:'45.200',firma:'TechCorp GmbH',hek:'22.400',bonus:'800',ek:'23.200',status:'Angebot',sb:'sb-bl'},
  {id:2,name:'Audi A4 Avant TDI',year:2022,km:'38.100',firma:'Pharma AG',hek:'19.800',bonus:'1.000',ek:'20.800',status:'Bestätigt',sb:'sb-gr'},
  {id:3,name:'VW Passat GTE',year:2023,km:'29.500',firma:'IT Solutions',hek:'18.200',bonus:'0',ek:'18.200',status:'Gutachten',sb:'sb-am'},
  {id:4,name:'Mercedes C 220d',year:2020,km:'61.000',firma:'Beratung & Co',hek:'18.400',bonus:'1.200',ek:'19.600',status:'Ausgezahlt',sb:'sb-gr'},
  {id:5,name:'BMW X3 20d xDrive',year:2021,km:'52.400',firma:'Pharma AG',hek:'26.800',bonus:'2.100',ek:'28.900',status:'Ausgezahlt',sb:'sb-gr'},
  {id:6,name:'Skoda Octavia RS',year:2022,km:'18.300',firma:'Versicherungs AG',hek:'15.900',bonus:'400',ek:'16.300',status:'Logistik',sb:'sb-bl'},
  {id:7,name:'Ford Kuga Titanium',year:2021,km:'44.000',firma:'Bau-Holding GmbH',hek:'14.200',bonus:'0',ek:'14.200',status:'Angemeldet',sb:'sb-gy'},
];
function makeRows8(list){return list.map(v=>`<tr><td><strong>${v.name}</strong></td><td>${v.year}</td><td>${v.km} km</td><td style="color:var(--green);font-weight:600">${v.hek} €</td><td style="color:var(--navy)">${v.bonus!=='0'?'+'+v.bonus+' €':'—'}</td><td style="font-weight:700">${v.ek} €</td><td><span class="sb ${v.sb}">${v.status}</span></td><td><button class="td-btn" onclick="showPanel('dDet',null)">Detail</button></td></tr>`).join('');}
function makeRows6(list){return list.map(v=>`<tr><td><strong>${v.name}</strong></td><td>${v.year}</td><td>${v.km} km</td><td>${v.firma}</td><td><span class="sb ${v.sb}">${v.status}</span></td><td><button class="td-btn" onclick="showPanel('dDet',null)">Öffnen</button></td></tr>`).join('');}
function filterTbl(val){document.getElementById('tblBody').innerHTML=makeRows8(val?vehicles.filter(v=>v.status===val):vehicles);}

// ─── DASHBOARD ───
function openDash(){document.getElementById('dash').classList.add('open');document.body.style.overflow='hidden';document.getElementById('tblBody').innerHTML=makeRows8(vehicles);document.getElementById('tblAll').innerHTML=makeRows6(vehicles);}
function closeDash(){document.getElementById('dash').classList.remove('open');document.body.style.overflow='';}
function showPanel(id,el){document.querySelectorAll('.dp').forEach(p=>p.classList.remove('act'));document.getElementById(id).classList.add('act');if(el){document.querySelectorAll('.dsb-item').forEach(i=>i.classList.remove('act'));el.classList.add('act');}}

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

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Prozess animation trigger on load
window.addEventListener('load', () => {
  revealAll();
  const fill = document.getElementById('prozessLineFill');
  if (fill) setTimeout(() => fill.style.width = '100%', 500);
});

// Also reveal on DOMContentLoaded
document.addEventListener('DOMContentLoaded', revealAll);

// ─── COUNTUP ANIMATION ───
(function(){
  const stats = document.querySelectorAll('.stat-num[data-countup]');
  if(!stats.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const el = entry.target;
      const target = parseFloat(el.dataset.countup);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const isDecimal = target % 1 !== 0;
      const duration = 1400;
      const steps = 60;
      const step = duration / steps;
      let current = 0;
      let frame = 0;
      const timer = setInterval(() => {
        frame++;
        current = target * (frame / steps);
        if(frame >= steps){ current = target; clearInterval(timer); }
        el.textContent = prefix + (isDecimal ? current.toFixed(1).replace('.',',') : Math.round(current)) + suffix;
      }, step);
    });
  }, { threshold: 0.4 });
  stats.forEach(el => obs.observe(el));
})();