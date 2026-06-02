# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full redesign of `index.html` + `style.css` to "Kalte Präzision" dark theme — deep slate background (#12161C), ice-blue accent (#C8D8E8), layered depth without glows or grid patterns.

**Architecture:** Full CSS rewrite starting from scratch. New dark design tokens added to `:root`. All legacy variable names preserved at their original values in the same `:root` block so the dashboard and `#schaden` page (which use inline styles referencing `--navy`, `--t0`, `--f2`, etc.) continue to work unchanged. Landing page section CSS is rewritten to use new dark tokens. Hero HTML is replaced; all other sections keep their HTML structure with minimal class attribute changes.

**Tech Stack:** Vanilla HTML/CSS — no build tools, no preprocessors. IBM Plex Sans font (already loaded). Changes limited to `index.html` + `style.css`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `style.css` | Full rewrite | New dark CSS system, all sections |
| `index.html` | Targeted edits | Nav class fix, hero HTML, section class changes, Kontakt inline styles |

---

### Task 1: New style.css — Foundation (Variables, Reset, Layout, Typography, Buttons, Reveal)

**Files:**
- Rewrite: `style.css` (replaces entire file content)

- [ ] **Step 1: Write new style.css foundation**

```css
/* ═══════════════════════════════════════════
   IMD Fleet Services — Kalte Präzision v1
   Font: IBM Plex Sans
   Palette: Deep Slate · Ice Blue Accent
═══════════════════════════════════════════ */
:root {
  /* ── New design tokens ── */
  --bg:        #12161C;
  --bg-s:      #161B22;
  --bg-deep:   #0E1218;
  --bg-card:   rgba(238,242,246,0.04);
  --acc:       #C8D8E8;
  --acc-dim:   rgba(200,216,232,0.18);
  --btn-bg:    #1E2E40;
  --amber:     #D4A840;
  --text-1:    #EEF2F6;
  --text-2:    rgba(238,242,246,0.55);
  --text-3:    rgba(238,242,246,0.28);
  --border:    rgba(238,242,246,0.08);
  --border-s:  rgba(238,242,246,0.05);
  --r:4px; --r-md:8px; --r-lg:14px; --r-xl:20px; --r-2xl:28px;
  --fh:'IBM Plex Sans',sans-serif;
  --ease:cubic-bezier(.16,1,.3,1);
  --ease-spring:cubic-bezier(.34,1.56,.64,1);
  --ease-out:cubic-bezier(.22,1,.36,1);

  /* ── Legacy variable values — unchanged, for dashboard + inline styles ── */
  --ink:#09152A; --ink2:#142033; --ink3:#1C2D4A;
  --navy:#0052A3; --navy-l:#1868BC; --navy-ll:#3584D6;
  --sky:#E8F1FB; --sky2:#D2E5F6; --sky3:rgba(0,82,163,.06);
  --navy-glow:rgba(0,82,163,.16);
  --green:#008F65; --green-l:#00AE78; --green-pale:#E4F4EE; --green-dim:rgba(0,143,101,.07);
  --amber-pale:#FEF1D6; --red:#CC3838; --white:#FFFFFF;
  --f0:#F6F9FC; --f1:#ECF1F8; --f2:#DDE6F0; --f3:#C4D4E6;
  --t0:#09152A; --t1:#2E4666; --t2:#536E94; --t3:#8899B4;
  --sh-xs:0 1px 3px rgba(9,21,42,.04);
  --sh-sm:0 2px 8px rgba(9,21,42,.06),0 1px 3px rgba(9,21,42,.04);
  --sh:0 6px 24px rgba(9,21,42,.08),0 2px 8px rgba(9,21,42,.04);
  --sh-lg:0 16px 56px rgba(9,21,42,.11),0 4px 16px rgba(9,21,42,.05);
  --sh-xl:0 28px 88px rgba(0,52,103,.16),0 8px 24px rgba(0,52,103,.08);
  --fb:'IBM Plex Sans',sans-serif;
}

/* ── RESET ── */
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:var(--fh);background:var(--bg);color:var(--text-1);overflow-x:hidden;line-height:1.7;font-size:15px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:rgba(200,216,232,.3);border-radius:2px}
a{text-decoration:none;color:inherit}
button{font-family:var(--fh)}
img{display:block;max-width:100%}

/* ── LAYOUT ── */
.wrap{max-width:1160px;margin:0 auto;padding:0 48px}
.section{padding:112px 0;background:var(--bg)}
.sec-light{background:var(--bg-s)}
.sec-dark{background:var(--bg-deep);position:relative;overflow:hidden}
.sec-head{margin-bottom:64px}
.sec-center{text-align:center}
.sec-center .lead{max-width:580px;margin:16px auto 0}

/* ── TAGS ── */
.tag{display:inline-flex;align-items:center;gap:7px;font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;padding:5px 14px;border-radius:100px;transition:all .2s ease}
.tag-navy,.tag-green{color:var(--acc);background:var(--acc-dim);border:1px solid rgba(200,216,232,.15)}
.tag-white{color:rgba(238,242,246,.85);background:rgba(238,242,246,.1);border:1px solid rgba(238,242,246,.18)}
.tag-grey{color:var(--text-2);background:var(--bg-card);border:1px solid var(--border)}

/* ── TYPOGRAPHY ── */
.h2{font-family:var(--fh);font-size:clamp(26px,2.8vw,44px);font-weight:800;line-height:1.08;letter-spacing:-.032em;color:var(--text-1)}
.h2 em{font-style:normal;color:var(--acc)}
.h2-white{color:var(--text-1)}.h2-white em{color:var(--acc)}
.lead{font-size:17px;color:var(--text-2);line-height:1.9;font-weight:300}
.lead-white{color:var(--text-2)}
.eyebrow{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--acc);display:inline-flex;align-items:center;margin-bottom:16px}
.eyebrow-white{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(200,216,232,.6);display:inline-flex;align-items:center;margin-bottom:16px}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;gap:9px;border:none;border-radius:var(--r);font-family:var(--fh);font-size:14px;font-weight:700;cursor:pointer;transition:transform .2s var(--ease-spring),box-shadow .2s var(--ease),background .18s ease,border-color .18s ease;white-space:nowrap;letter-spacing:-.012em}
.btn:active{transform:scale(.97)!important}
.btn-primary,.btn-green,.btn-navy{background:var(--btn-bg);color:var(--acc);border:1.5px solid rgba(200,216,232,.2);padding:14px 30px}
.btn-primary:hover,.btn-green:hover,.btn-navy:hover{background:#253d56;border-color:rgba(200,216,232,.45);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.35)}
.btn-ghost,.btn-ghost-white{background:transparent;color:var(--text-2);border:1.5px solid var(--border);padding:12px 28px}
.btn-ghost:hover,.btn-ghost-white:hover{border-color:rgba(238,242,246,.22);background:var(--bg-card);color:var(--text-1);transform:translateY(-2px)}
.btn-outline{background:transparent;color:var(--text-2);border:1.5px solid var(--border);padding:12px 24px}
.btn-outline:hover{border-color:var(--acc);color:var(--acc);background:var(--bg-card);transform:translateY(-2px)}
.btn-lg{font-size:15px;padding:17px 36px}
.btn-sm{font-size:12px;padding:7px 14px;border-radius:var(--r-md)}

/* ── REVEAL ── */
.rev{opacity:1;transform:none;transition:opacity .6s var(--ease),transform .6s var(--ease)}
.rev.in{opacity:1;transform:none}
.d1{transition-delay:.06s}.d2{transition-delay:.12s}.d3{transition-delay:.18s}
.d4{transition-delay:.24s}.d5{transition-delay:.3s}.d6{transition-delay:.36s}

/* ── MOB MENU ── */
.mob-menu{display:none;position:fixed;inset:0;z-index:299;background:var(--bg-deep);flex-direction:column;align-items:flex-start;justify-content:center;padding:80px 48px 48px;gap:24px}
.mob-menu.open{display:flex}
.mob-menu a{font-family:var(--fh);font-size:20px;font-weight:700;color:var(--text-1)}
.mob-menu a:hover{color:var(--acc)}
```

- [ ] **Step 2: Verify file was written**

Run: `node server.js` then open `http://localhost:8000`  
Expected: Page background is `#12161C` (very dark slate). All text/buttons may look broken — that's expected since only the foundation is written.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: write new CSS foundation — dark design tokens, reset, layout, buttons"
```

---

### Task 2: CSS — Navigation

**Files:**
- Edit: `style.css` (append)
- Edit: `index.html` (remove `nav-hidden-for-concrete` from nav class)

- [ ] **Step 1: Remove nav-hidden-for-concrete from nav element**

In `index.html`, line 28, change:
```html
<nav id="nav" class="nav-hidden-for-concrete">
```
to:
```html
<nav id="nav">
```

- [ ] **Step 2: Append nav CSS to style.css**

```css
/* ══════════════ NAV ══════════════ */
nav{position:fixed;inset:0 0 auto;z-index:300;height:88px;display:flex;align-items:center;transition:all .35s var(--ease);background:transparent}
nav.sc{background:var(--bg-deep);backdrop-filter:blur(20px);box-shadow:0 1px 0 var(--border)}
.nav-in{width:100%;max-width:1160px;margin:0 auto;padding:0 48px;display:flex;align-items:center;gap:16px}
.nav-logo{display:flex;align-items:center;gap:9px;cursor:pointer;flex-shrink:0;background:transparent}
.nav-logo img{width:clamp(138px,10vw,178px);height:auto;display:block;object-fit:contain}
nav .logo-dark{display:none}
nav .logo-light{display:block}
nav.sc .logo-dark{display:block}
nav.sc .logo-light{display:none}
.nav-links{display:flex;gap:28px;list-style:none;flex:1;justify-content:center}
.nav-links a{font-family:var(--fh);font-size:12px;font-weight:600;color:var(--text-2);letter-spacing:.01em;transition:color .2s var(--ease);position:relative;padding-bottom:2px}
.nav-links a::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1.5px;background:var(--acc);border-radius:1px;transition:width .22s var(--ease)}
.nav-links a:hover{color:var(--text-1)}
.nav-links a:hover::after{width:100%}
nav.sc .nav-links a{color:var(--text-2)}
nav.sc .nav-links a:hover{color:var(--text-1)}
.nav-cta{background:var(--btn-bg);color:var(--acc);border:1.5px solid rgba(200,216,232,.2);padding:9px 20px;border-radius:var(--r-xl);font-family:var(--fh);font-size:13px;font-weight:700;cursor:pointer;transition:all .18s ease;flex-shrink:0;margin-left:auto}
.nav-cta:hover{background:#253d56;border-color:rgba(200,216,232,.4);transform:translateY(-1px)}
.nav-cta:active{transform:scale(.97)}
.burger{display:none;flex-direction:column;gap:4px;background:none;border:none;cursor:pointer;padding:4px;margin-left:auto}
.burger span{display:block;width:20px;height:1.5px;background:var(--text-1);transition:all .3s}
.burger.open span:nth-child(1){transform:rotate(45deg) translate(4px,4px)}
.burger.open span:nth-child(2){opacity:0}
.burger.open span:nth-child(3){transform:rotate(-45deg) translate(4px,-4px)}
```

- [ ] **Step 3: Verify nav renders**

Reload `http://localhost:8000`. Expected: nav is transparent over hero, links visible, CTA button with ice-blue border. On scroll, nav becomes `--bg-deep` solid.

- [ ] **Step 4: Commit**

```bash
git add style.css index.html
git commit -m "feat: dark nav — transparent on hero, bg-deep on scroll, no nav-hidden-for-concrete"
```

---

### Task 3: HTML Hero Rewrite + Section Class Fixes

**Files:**
- Edit: `index.html`

- [ ] **Step 1: Replace hero section (lines 44–88) and move trust-bar inside it**

Replace everything from `<!-- ═════════════════════ HERO ═════════════════════ -->` through the closing `</div>` of the trust-bar block (the `</div>` at line 99) with:

```html
<!-- ═════════════════════ HERO ═════════════════════ -->
<section class="hero" id="top">
  <div class="wrap">
    <div class="hero-grid">
      <div class="hero-copy">
        <div class="hero-eyebrow">
          <div class="hero-eyebrow-dot"></div>
          <span class="hero-eyebrow-text">IMD Fleet Services · Flottenankauf · Bundesweit</span>
        </div>
        <h1 class="hero-h1">
          Professioneller<br>
          Flottenankauf für<br>
          <span>Ihr Unternehmen.</span>
        </h1>
        <p class="hero-sub">IMD Fleet Services übernimmt Abholung, Vorbereitung, Gutachten und Auszahlung Ihrer Firmenfahrzeuge — vollständig digital und ohne Aufwand für Ihren Fuhrpark.</p>
        <div class="hero-proof">
          <div class="hero-proof-icon">✓</div>
          <div class="hero-proof-text"><strong>Garantierter Mindestpreis durch unabhängiges Wertgutachten</strong> – häufig sogar mit zusätzlichem Bonus über dem HEK-Wert. Schriftlich zugesichert.</div>
        </div>
        <div class="hero-btns">
          <button class="btn btn-primary btn-lg" onclick="goTo('anmelden')">Fahrzeug anmelden</button>
          <button class="btn btn-ghost btn-lg" onclick="goTo('prozess')">So funktioniert es →</button>
        </div>
        <div class="hero-kpi">
          <div class="hkpi"><div class="hkpi-val">2 Min.</div><div class="hkpi-lbl">Anmeldung</div></div>
          <div class="hkpi"><div class="hkpi-val hkpi-acc">HEK+</div><div class="hkpi-lbl">Garantierter Mindestpreis</div></div>
          <div class="hkpi"><div class="hkpi-val">100%</div><div class="hkpi-lbl">Digital & sicher</div></div>
        </div>
      </div>
      <div class="hero-dash">
        <div class="hero-dash-card">
          <div class="hdc-header">
            <span class="hdc-title">Fleet Dashboard</span>
            <span class="hdc-live"><span class="hdc-dot"></span>Live</span>
          </div>
          <div class="hdc-kpis">
            <div class="hdc-kpi">
              <div class="hdc-kpi-val">14</div>
              <div class="hdc-kpi-lbl">Aktive Fahrzeuge</div>
              <div class="hdc-kpi-note">↑ +3 diesen Monat</div>
            </div>
            <div class="hdc-kpi">
              <div class="hdc-kpi-val hdc-acc">HEK+</div>
              <div class="hdc-kpi-lbl">Mindestpreis</div>
              <div class="hdc-kpi-note">Ø +9,4 % Bonus</div>
            </div>
          </div>
          <div class="hdc-vehicles">
            <div class="hdc-veh hdc-veh-acc">
              <div class="hdc-veh-name">VW Crafter · 2021</div>
              <div class="hdc-veh-status">✓ Ausgezahlt</div>
            </div>
            <div class="hdc-veh hdc-veh-amber">
              <div class="hdc-veh-name">Mercedes Sprinter · 2022</div>
              <div class="hdc-veh-status hdc-amber">⏳ Gutachten läuft</div>
            </div>
            <div class="hdc-veh hdc-veh-muted">
              <div class="hdc-veh-name">Ford Transit · 2020</div>
              <div class="hdc-veh-status hdc-muted">→ Abholung geplant</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="trust-bar">
    <div class="trust-inner">
      <div class="ti rev d1"><div class="ti-check">✓</div><div><div class="ti-label">Wertgutachten<span class="ti-sub">Revisionssicher · GKK</span></div></div></div>
      <div class="ti rev d2"><div class="ti-check">✓</div><div><div class="ti-label">HEK-Mindestpreis<span class="ti-sub">Zugesichert</span></div></div></div>
      <div class="ti rev d3"><div class="ti-check">✓</div><div><div class="ti-label">Bonus möglich<span class="ti-sub">Je nach Marktsituation</span></div></div></div>
      <div class="ti rev d4"><div class="ti-check">✓</div><div><div class="ti-label">Abholung bundesweit<span class="ti-sub">Wir kommen zu Ihnen</span></div></div></div>
      <div class="ti rev d5"><div class="ti-check">✓</div><div><div class="ti-label">100% digital<span class="ti-sub">Kein Papierkram</span></div></div></div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Fix section class attributes for correct alternating backgrounds**

In `index.html`, make these class changes:

| Line | Element | Old class | New class |
|---|---|---|---|
| `#prozess` | `<section>` | `"section sec-light"` | `"section"` |
| `#rechner` | `<section>` | `"section"` | `"section sec-light"` |
| `#faq` | `<section>` | `"section sec-light"` | `"section"` |
| `#anmelden` | `<section>` | `"section"` | `"section sec-light"` |
| `#zielgruppe` | `<section>` | `"section sec-light"` | `"section"` |

- [ ] **Step 3: Verify HTML parses**

Run `node server.js`. Open `http://localhost:8000`. Expected: Hero area shows with dark background. Dashboard card visible on right. Trust bar visible below hero with dark bg. No JS errors in console.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: replace hero HTML with grid layout, move trust-bar inside hero, fix section classes"
```

---

### Task 4: CSS — Hero + Trust Bar

**Files:**
- Edit: `style.css` (append)

- [ ] **Step 1: Append hero + trust bar CSS to style.css**

```css
/* ══════════════ HERO ══════════════ */
.hero{min-height:100vh;background:var(--bg);display:flex;flex-direction:column;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(200,216,232,.025) 0%,transparent 50%,rgba(200,216,232,.015) 100%);pointer-events:none}
.hero .wrap{width:100%;padding-top:88px}
.hero-grid{display:grid;grid-template-columns:1fr 400px;gap:64px;align-items:center;padding:56px 0 52px}
.hero-copy{display:flex;flex-direction:column}
/* Eyebrow */
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;margin-bottom:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:100px;padding:5px 14px;align-self:flex-start}
.hero-eyebrow-dot{width:7px;height:7px;border-radius:50%;background:#4ade80;flex-shrink:0;animation:heDotPulse 3s ease-in-out infinite}
@keyframes heDotPulse{0%,100%{box-shadow:0 0 0 2px rgba(74,222,128,.15)}50%{box-shadow:0 0 0 5px rgba(74,222,128,.06)}}
.hero-eyebrow-text{font-family:var(--fh);font-size:10px;font-weight:600;color:var(--text-2);letter-spacing:.12em;text-transform:uppercase}
/* H1 */
.hero-h1{font-family:var(--fh);font-size:clamp(38px,4vw,60px);font-weight:800;line-height:1.04;letter-spacing:-.04em;color:var(--text-1);margin-bottom:20px}
.hero-h1 span{color:var(--acc)}
/* Sub */
.hero-sub{font-size:17px;color:var(--text-2);line-height:1.85;max-width:500px;margin-bottom:24px;font-weight:300}
/* Proof box */
.hero-proof{display:flex;align-items:flex-start;gap:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);padding:14px 18px;margin-bottom:32px;max-width:500px}
.hero-proof-icon{font-size:16px;flex-shrink:0;margin-top:1px;color:var(--acc)}
.hero-proof-text{font-size:13px;color:var(--text-2);line-height:1.65}
.hero-proof-text strong{color:var(--text-1)}
/* Buttons */
.hero-btns{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:44px}
/* KPI strip */
.hero-kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border-radius:var(--r-md);overflow:hidden;border:1px solid var(--border)}
.hkpi{background:var(--bg-s);padding:18px 20px;transition:background .22s}
.hkpi:hover{background:rgba(238,242,246,.04)}
.hkpi-val{font-family:var(--fh);font-size:24px;font-weight:800;color:var(--text-1);letter-spacing:-.035em}
.hkpi-val.hkpi-acc{color:var(--acc)}
.hkpi-lbl{font-family:var(--fh);font-size:9px;font-weight:600;color:var(--text-3);margin-top:4px;text-transform:uppercase;letter-spacing:.14em}
.hkpi-ico{display:none}
/* Dashboard card */
.hero-dash{display:flex;align-items:center;justify-content:center}
.hero-dash-card{background:rgba(22,27,34,.9);border:1px solid rgba(200,216,232,.10);border-radius:var(--r-2xl);padding:24px;backdrop-filter:blur(20px);box-shadow:0 24px 72px rgba(0,0,0,.4),0 8px 24px rgba(0,0,0,.2);width:100%;animation:hdcFloat 9s ease-in-out infinite}
@keyframes hdcFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.hdc-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.hdc-title{font-family:var(--fh);font-size:10px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.16em}
.hdc-live{display:flex;align-items:center;gap:5px;font-family:var(--fh);font-size:10px;font-weight:600;color:#4ade80}
.hdc-dot{width:5px;height:5px;border-radius:50%;background:#4ade80;animation:heDotPulse 2.5s infinite}
.hdc-kpis{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
.hdc-kpi{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:12px 14px}
.hdc-kpi-val{font-family:var(--fh);font-size:20px;font-weight:800;color:var(--text-1);letter-spacing:-.03em}
.hdc-kpi-val.hdc-acc{color:var(--acc)}
.hdc-kpi-lbl{font-family:var(--fh);font-size:9px;color:var(--text-3);text-transform:uppercase;letter-spacing:.12em;margin-top:2px}
.hdc-kpi-note{font-size:10px;color:#4ade80;margin-top:3px;font-weight:600}
.hdc-vehicles{display:flex;flex-direction:column;gap:6px}
.hdc-veh{display:flex;align-items:center;justify-content:space-between;background:var(--bg-card);border-radius:var(--r-md);padding:10px 12px 10px 15px;border:1px solid var(--border);position:relative;overflow:hidden}
.hdc-veh::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px}
.hdc-veh-acc::before{background:var(--acc)}
.hdc-veh-amber::before{background:var(--amber)}
.hdc-veh-muted::before{background:var(--border)}
.hdc-veh-name{font-family:var(--fh);font-size:12px;font-weight:600;color:var(--text-1)}
.hdc-veh-status{font-size:10px;font-weight:600;color:var(--text-3)}
.hdc-veh-status.hdc-amber{color:var(--amber)}
.hdc-veh-status.hdc-muted{color:var(--text-3)}

/* ══════════════ TRUST BAR ══════════════ */
.trust-bar{background:var(--bg-deep);border-top:1px solid var(--border)}
.trust-inner{max-width:1160px;margin:0 auto;padding:0 48px;display:grid;grid-template-columns:repeat(5,1fr)}
.ti{display:flex;align-items:center;gap:10px;padding:16px;border-right:1px solid var(--border);transition:background .2s}
.ti:last-child{border-right:none}
.ti:hover{background:rgba(238,242,246,.03)}
.ti-check{width:26px;height:26px;background:var(--acc-dim);border:1px solid rgba(200,216,232,.15);border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--acc);flex-shrink:0;line-height:1}
.ti-label{font-family:var(--fh);font-size:11px;font-weight:700;color:var(--text-1);line-height:1.35}
.ti-sub{display:block;font-family:var(--fh);font-size:10px;font-weight:400;color:var(--text-3);margin-top:2px}
```

- [ ] **Step 2: Verify hero appearance**

Reload `http://localhost:8000`. Expected:
- Hero: dark slate background, two-column layout, dashboard card on right with ice-blue accents
- Trust bar: bg-deep background, 5 items with square checkmarks
- Nav overlays hero with transparent bg

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: hero + trust bar CSS — two-column grid, dashboard card, dark trust bar"
```

---

### Task 5: CSS — Service + Prozess

**Files:**
- Edit: `style.css` (append)

- [ ] **Step 1: Append Service CSS**

```css
/* ══════════════ SERVICE ══════════════ */
.svc-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
.svc-list{margin-top:28px}
.svc-item{display:flex;gap:14px;padding:15px 0;border-bottom:1px solid var(--border)}
.svc-item:last-child{border-bottom:none}
.svc-ck{width:20px;height:20px;background:var(--acc-dim);border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--acc);flex-shrink:0;margin-top:3px;line-height:1}
.svc-lbl{font-family:var(--fh);font-size:14px;font-weight:700;color:var(--text-1)}
.svc-desc{font-size:13px;color:var(--text-2);margin-top:2px;line-height:1.6}
.included-card{background:var(--bg-deep);border:1px solid var(--border);border-radius:var(--r-2xl);padding:40px}
.ic-eyebrow{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--text-3);margin-bottom:14px}
.ic-h{font-family:var(--fh);font-size:22px;font-weight:800;color:var(--text-1);line-height:1.2;margin-bottom:6px;letter-spacing:-.02em}
.ic-h sup{font-size:.46em;vertical-align:super;margin-left:2px}
.ic-h sup a{color:var(--acc);text-decoration:none;cursor:pointer;display:inline-flex}
.ic-h sup a:hover{color:var(--text-1)}
.ic-note{font-size:13px;color:var(--text-3);margin-bottom:24px;line-height:1.6}
.ic-items{display:flex;flex-direction:column;gap:8px}
.ic-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg-card);border-radius:var(--r-md);border:1px solid var(--border)}
.ic-dot{width:5px;height:5px;border-radius:50%;background:var(--acc);flex-shrink:0}
.ic-item-text{font-size:13px;color:var(--text-2);font-weight:500}
.ic-foot{display:block;font-size:11px;color:var(--text-3);margin-top:16px;text-decoration:none;transition:color .2s}
.ic-foot:hover{color:var(--acc)}
```

- [ ] **Step 2: Append Prozess (Workflow) CSS**

```css
/* ══════════════ PROZESS ══════════════ */
.wf-wrap{position:relative;margin:0 0 24px}
.wf-line{position:absolute;top:72px;left:0;right:0;height:2px;background:var(--border);z-index:0}
.wf-line-fill{height:100%;background:var(--acc);width:0;transition:width 1.5s var(--ease-out)}
.wf-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;position:relative;z-index:1}
.wf-step{display:flex;flex-direction:column}
.wf-card{background:var(--bg-s);border:1px solid var(--border);border-radius:var(--r-lg);padding:24px;display:flex;flex-direction:column;gap:8px;transition:border-color .2s,background .2s}
.wf-card:hover{border-color:rgba(200,216,232,.2);background:rgba(238,242,246,.03)}
.wf-card-top{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.wf-num-badge{font-family:var(--fh);font-size:11px;font-weight:800;letter-spacing:.06em;padding:3px 8px;border-radius:3px}
.wf-num-you{background:var(--acc-dim);color:var(--acc)}
.wf-num-us,.wf-num-done{background:var(--bg-card);color:var(--text-2)}
.wf-actor-pill{font-family:var(--fh);font-size:10px;font-weight:700;padding:2px 8px;border-radius:100px;letter-spacing:.04em}
.wf-actor-you{background:var(--acc-dim);color:var(--acc);border:1px solid rgba(200,216,232,.15)}
.wf-actor-us,.wf-actor-done{background:var(--bg-card);color:var(--text-2);border:1px solid var(--border)}
.wf-ico{font-size:24px;margin:4px 0}
.wf-title{font-family:var(--fh);font-size:15px;font-weight:800;color:var(--text-1);letter-spacing:-.02em}
.wf-desc{font-size:13px;color:var(--text-2);line-height:1.65}
.wf-details{display:flex;flex-direction:column;gap:4px;margin-top:4px}
.wf-detail-item{font-size:12px;color:var(--text-3)}
.wf-time{font-family:var(--fh);font-size:11px;color:var(--acc);font-weight:600;margin-top:4px}
.wf-arrow{display:flex;align-items:center;justify-content:flex-end;padding:0 4px;color:var(--text-3);margin-top:8px}
.wf-legend{display:flex;gap:20px;align-items:center;flex-wrap:wrap;justify-content:center}
.wf-legend-item{display:flex;align-items:center;gap:6px;font-family:var(--fh);font-size:11px;color:var(--text-2);font-weight:500}
.wf-legend-dot{width:8px;height:8px;border-radius:50%}
.wf-legend-you{background:var(--acc)}
.wf-legend-us{background:var(--text-3)}
.wf-legend-done{background:var(--text-2)}
```

- [ ] **Step 3: Verify Service + Prozess**

Reload and scroll to `#service` and `#prozess`. Expected:
- Service: `--bg-s` dark background, ice-blue checkmarks, dark "included" card
- Prozess: `--bg` (same as body), workflow cards with dark borders

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "feat: service + prozess section CSS — dark cards, ice-blue accents"
```

---

### Task 6: CSS — Explainer (MGP Player)

**Files:**
- Edit: `style.css` (append)

- [ ] **Step 1: Append explainer CSS**

```css
/* ══════════════ EXPLAINER (MGP) ══════════════ */
.mgp-wrap{border:1px solid var(--border);border-radius:var(--r-2xl);overflow:hidden;background:var(--bg-deep)}
.mgp-stage{position:relative;height:340px;overflow:hidden}
.mgp-slide{position:absolute;inset:0;display:none;animation:mgpIn .35s var(--ease-out)}
.mgp-slide.active{display:flex}
@keyframes mgpIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}
.mgp-bg{position:absolute;inset:0;z-index:0}
.mgp-bg-intro{background:linear-gradient(135deg,var(--bg-deep) 0%,var(--bg-s) 100%)}
.mgp-bg-step1{background:linear-gradient(135deg,#0f1c2a 0%,var(--bg-s) 100%)}
.mgp-bg-step2{background:linear-gradient(135deg,#111820 0%,var(--bg-s) 100%)}
.mgp-bg-step3{background:linear-gradient(135deg,#0d1822 0%,var(--bg-s) 100%)}
.mgp-bg-step4{background:linear-gradient(135deg,#0f1e2c 0%,var(--bg-s) 100%)}
.mgp-bg-end{background:linear-gradient(135deg,var(--bg-deep) 0%,var(--btn-bg) 100%)}
.mgp-content{position:relative;z-index:1;display:flex;align-items:center;padding:32px 48px;gap:48px;width:100%;height:100%}
.mgp-controls{display:flex;align-items:center;gap:12px;padding:14px 20px;border-top:1px solid var(--border);background:var(--bg-s)}
.mgp-btn{display:inline-flex;align-items:center;gap:6px;background:var(--bg-card);border:1px solid var(--border);color:var(--text-1);padding:8px 14px;border-radius:var(--r-md);font-family:var(--fh);font-size:12px;font-weight:600;cursor:pointer;transition:all .18s ease}
.mgp-btn:hover{border-color:rgba(200,216,232,.2);background:rgba(238,242,246,.06)}
.mgp-btn-play{background:var(--btn-bg);border-color:rgba(200,216,232,.2);color:var(--acc)}
.mgp-btn-play:hover{background:#253d56;border-color:rgba(200,216,232,.4)}
.mgp-btn-sm{padding:7px 10px}
.mgp-timeline-bar{flex:1;position:relative;height:4px;background:var(--border);border-radius:2px;cursor:pointer}
.mgp-tl-fill{position:absolute;left:0;top:0;bottom:0;background:var(--acc);border-radius:2px;transition:width .3s var(--ease-out)}
.mgp-tl-dots{position:absolute;inset:0;display:flex;align-items:center;justify-content:space-between;padding:0 2px}
.mgp-tl-tick{width:8px;height:8px;border-radius:50%;background:var(--border);border:1.5px solid var(--bg-s);cursor:pointer;transition:all .2s;position:relative;flex-shrink:0}
.mgp-tl-tick.active,.mgp-tl-tick:hover{background:var(--acc)}
.mgp-tl-tick span{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);font-family:var(--fh);font-size:9px;font-weight:700;color:var(--text-3);white-space:nowrap;letter-spacing:.08em;pointer-events:none}
.mgp-timer{font-family:var(--fh);font-size:11px;font-weight:600;color:var(--text-3);white-space:nowrap;flex-shrink:0}
/* Slide content classes used by existing HTML */
.mgp-kicker{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);margin-bottom:10px}
.mgp-h2{font-family:var(--fh);font-size:clamp(22px,2.2vw,32px);font-weight:800;color:var(--text-1);line-height:1.1;letter-spacing:-.03em;margin-bottom:12px}
.mgp-p{font-size:14px;color:var(--text-2);line-height:1.75}
.mgp-icon-big{font-size:56px;opacity:.9}
```

- [ ] **Step 2: Verify explainer**

Scroll to `#explainer`. Expected: Player with dark bg-deep background, ice-blue progress bar, dark controls bar. Play/pause buttons styled with btn-bg color.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: explainer section CSS — dark MGP player with ice-blue progress"
```

---

### Task 7: CSS — Warum wir

**Files:**
- Edit: `style.css` (append)

- [ ] **Step 1: Append Warum wir CSS**

```css
/* ══════════════ WARUM WIR ══════════════ */
.wk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:36px}
.wk{background:var(--bg-s);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden}
.wk-head{display:flex;align-items:center;gap:12px;padding:18px 20px;border-bottom:1px solid var(--border)}
.wk-head.bad{background:rgba(238,242,246,.02)}
.wk-head.good{background:var(--acc-dim)}
.wk-ico{width:36px;height:36px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.wk-ico.bad{background:rgba(238,242,246,.06);color:var(--text-3)}
.wk-ico.good{background:rgba(200,216,232,.15);color:var(--acc)}
.wk-name{font-family:var(--fh);font-size:14px;font-weight:800;color:var(--text-1)}
.wk-sub{font-size:11px;color:var(--text-3);margin-top:1px}
.wk-body{padding:16px 20px;display:flex;flex-direction:column;gap:10px}
.wk-row{display:flex;gap:10px;align-items:flex-start}
.wk-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}
.wk-dot.bad{background:rgba(238,242,246,.2)}
.wk-dot.good{background:var(--acc)}
.wk-text{font-size:13px;color:var(--text-2);line-height:1.6}
.wk-text strong{color:var(--text-1);font-weight:700}
/* Comparison table */
.ver-wrap{overflow-x:auto}
.ver-tbl{width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden}
.ver-tbl th,.ver-tbl td{padding:12px 16px;text-align:left;font-family:var(--fh);font-size:12px;border-bottom:1px solid var(--border)}
.ver-tbl th{font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--text-3);background:var(--bg-deep)}
.ver-tbl th.best{color:var(--acc);background:rgba(200,216,232,.06)}
.ver-tbl th.old{color:var(--text-3)}
.ver-tbl td{color:var(--text-2);background:var(--bg-s)}
.ver-tbl td.best{background:rgba(200,216,232,.04)}
.ver-tbl td.old{background:var(--bg)}
.ver-tbl tbody tr:hover td{background:rgba(238,242,246,.03)}
.vno{color:var(--text-3)}.vno-s{font-size:11px;color:var(--text-3);margin-left:4px}
.vok{color:var(--acc)}.vok-s{font-size:11px;color:var(--acc);margin-left:4px;font-weight:600}
/* Alleinstellungsmerkmale */
.allein-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:16px}
.allein{display:flex;gap:16px;background:var(--bg-s);border:1px solid var(--border);border-radius:var(--r-lg);padding:22px}
.allein-ico{font-size:24px;flex-shrink:0;margin-top:2px}
.allein-title{font-family:var(--fh);font-size:14px;font-weight:800;color:var(--text-1);margin-bottom:6px;letter-spacing:-.01em}
.allein-text{font-size:13px;color:var(--text-2);line-height:1.7}
```

- [ ] **Step 2: Verify Warum wir**

Scroll to `#warum`. Expected: 3 comparison cards (2 grey/bad, 1 ice-blue/good for IMD), comparison table, 4 USP cards.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: warum wir section CSS — comparison cards, table, USP grid"
```

---

### Task 8: CSS — Über uns

**Files:**
- Edit: `style.css` (append)

- [ ] **Step 1: Append Über uns CSS**

```css
/* ══════════════ ÜBER UNS ══════════════ */
.ub-intro-grid{display:grid;grid-template-columns:1fr 400px;gap:60px;align-items:start;margin-bottom:0}
/* Stat grid (inline styles in HTML — CSS support) */
.stat-num{font-family:var(--fh);font-size:44px;font-weight:800;color:var(--text-1);letter-spacing:-.04em;line-height:1}
/* Gründer-Card */
.founder-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-2xl);padding:28px;display:flex;flex-direction:column;gap:18px}
.founder-avatar{display:flex;align-items:center;gap:14px}
.founder-avatar-img{width:88px;height:88px;border-radius:50%;object-fit:cover;border:2px solid rgba(200,216,232,.2);flex-shrink:0}
.founder-info{display:flex;flex-direction:column;gap:3px}
.founder-name{font-family:var(--fh);font-size:15px;font-weight:800;color:var(--text-1);letter-spacing:-.02em}
.founder-role{font-size:12px;color:var(--text-3)}
.founder-quote{font-size:14px;color:var(--text-2);line-height:1.75;font-style:italic;border-left:2px solid var(--acc);padding-left:14px}
/* Prinzip-Karten */
.prinzip-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-xl);padding:28px 24px;display:flex;flex-direction:column;gap:10px}
.prinzip-icon{width:42px;height:42px;border-radius:var(--r-lg);background:var(--acc-dim);border:1px solid rgba(200,216,232,.2);display:flex;align-items:center;justify-content:center;color:var(--acc);margin-bottom:2px;flex-shrink:0}
.prinzip-title{font-family:var(--fh);font-size:16px;font-weight:800;color:var(--text-1);letter-spacing:-.02em;line-height:1.2}
.prinzip-sub{font-family:var(--fh);font-size:11px;font-weight:600;color:var(--text-3);letter-spacing:.01em}
.prinzip-text{font-size:13px;color:var(--text-2);line-height:1.75}
```

- [ ] **Step 2: Fix dark-section inline styles in Über uns**

The `#ueber-uns` section is `sec-dark` and already has a dark background. Some inline styles use `var(--green-l)` for the border-left color. These keep their old values (green). To align with new design, add this CSS override to fix the quote border to use `--acc` and the stat grid numbers that use `var(--green-l)`:

```css
#ueber-uns .founder-quote{border-left-color:var(--acc)}
#ueber-uns [data-countup]{color:var(--acc)!important}
```

- [ ] **Step 3: Verify Über uns**

Scroll to `#ueber-uns`. Expected: Dark deep background, founder card with semi-transparent background, ice-blue quote border, three principle cards with ice-blue icons.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "feat: über uns section CSS — founder card, prinzip cards, dark stat grid"
```

---

### Task 9: CSS — Expertise + Zielgruppe

**Files:**
- Edit: `style.css` (append)

- [ ] **Step 1: Append Expertise CSS**

```css
/* ══════════════ EXPERTISE ══════════════ */
.exp-stats{display:flex;align-items:center;justify-content:center;background:var(--bg-deep);border:1px solid var(--border);border-radius:var(--r-2xl);overflow:hidden;margin-top:56px;margin-bottom:52px}
.exp-stat{flex:1;padding:36px 32px;text-align:center}
.exp-stat-divider{width:1px;height:80px;background:var(--border);flex-shrink:0}
.exp-stat-val{font-family:var(--fh);font-size:48px;font-weight:800;color:var(--acc);letter-spacing:-.04em;line-height:1;margin-bottom:8px}
.exp-stat-lbl{font-family:var(--fh);font-size:13px;font-weight:700;color:var(--text-1);margin-bottom:5px}
.exp-stat-sub{font-size:12px;color:var(--text-3);line-height:1.5}
.exp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.exp-card{background:var(--bg-deep);border:1px solid var(--border);border-radius:var(--r-2xl);padding:28px;display:flex;flex-direction:column;gap:12px}
.exp-card-icon{width:44px;height:44px;border-radius:var(--r-lg);background:var(--acc-dim);border:1px solid rgba(200,216,232,.2);display:flex;align-items:center;justify-content:center;color:var(--acc);flex-shrink:0}
.exp-card-title{font-family:var(--fh);font-size:15px;font-weight:800;color:var(--text-1);letter-spacing:-.02em}
.exp-card-text{font-size:13px;color:var(--text-2);line-height:1.8}
```

- [ ] **Step 2: Append Zielgruppe CSS**

```css
/* ══════════════ ZIELGRUPPE ══════════════ */
.ziel-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start}
.branchen{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:28px}
.branche{display:flex;align-items:center;gap:12px;background:var(--bg-s);border:1px solid var(--border);border-radius:var(--r-lg);padding:14px 16px}
.branche-ico{width:36px;height:36px;border-radius:var(--r-md);background:var(--acc-dim);display:flex;align-items:center;justify-content:center;color:var(--acc);flex-shrink:0}
.branche-name{font-family:var(--fh);font-size:13px;font-weight:700;color:var(--text-1)}
.branche-sub{font-size:11px;color:var(--text-3);margin-top:1px}
/* Persona card */
.persona{background:var(--bg-s);border:1px solid var(--border);border-radius:var(--r-2xl);padding:28px;display:flex;flex-direction:column;gap:16px}
.pe-label{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--text-3)}
.pe-avatar{font-size:48px;line-height:1}
.pe-name{font-family:var(--fh);font-size:18px;font-weight:800;color:var(--text-1);letter-spacing:-.02em}
.pe-role{font-size:12px;color:var(--text-3)}
.pe-qs{display:flex;flex-direction:column;gap:12px;padding-top:8px;border-top:1px solid var(--border)}
.pe-q{background:var(--bg-deep);border-radius:var(--r-md);padding:14px 16px;border:1px solid var(--border)}
.pe-q-q{font-size:13px;color:var(--text-2);font-style:italic;margin-bottom:6px}
.pe-q-a{font-size:12px;color:var(--acc);font-weight:600;line-height:1.5}
.pe-footer{font-size:12px;color:var(--text-3);line-height:1.6;padding-top:8px;border-top:1px solid var(--border)}
.pe-footer strong{color:var(--text-2)}
```

- [ ] **Step 3: Verify Expertise + Zielgruppe**

Scroll to `#expertise` and `#zielgruppe`. Expected: Expertise shows `--bg-s` background with stat bar (ice-blue values) and 3 dark cards. Zielgruppe shows persona card with dark Q&A items.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "feat: expertise + zielgruppe section CSS — dark stat bar, persona card"
```

---

### Task 10: CSS — Zeitrechner + FAQ

**Files:**
- Edit: `style.css` (append)

- [ ] **Step 1: Append Zeitrechner CSS**

```css
/* ══════════════ ZEITRECHNER ══════════════ */
.calc-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start}
.calc-box{background:var(--bg-deep);border:1px solid var(--border);border-radius:var(--r-2xl);padding:32px}
.calc-box-title{font-family:var(--fh);font-size:15px;font-weight:800;color:var(--text-1);margin-bottom:4px}
.calc-box-sub{font-size:13px;color:var(--text-3);margin-bottom:24px}
.cfield{margin-bottom:20px}
.cfield-label,.cfield label.cfield-label{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--text-3);display:block;margin-bottom:10px}
.crange{-webkit-appearance:none;appearance:none;width:100%;height:4px;border-radius:2px;background:var(--border);outline:none;cursor:pointer}
.crange::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:var(--acc);cursor:pointer;box-shadow:0 0 0 3px rgba(200,216,232,.2)}
.crange::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:var(--acc);cursor:pointer;border:none}
.crange-row{display:flex;justify-content:space-between;margin-top:8px}
.crange-hint{font-family:var(--fh);font-size:10px;color:var(--text-3)}
.crange-val{font-family:var(--fh);font-size:12px;font-weight:700;color:var(--acc)}
.cnum{width:100%;background:var(--bg-s);border:1px solid var(--border);border-radius:var(--r-md);color:var(--text-1);padding:10px 14px;font-family:var(--fh);font-size:15px;font-weight:600;outline:none;transition:border-color .2s}
.cnum:focus{border-color:rgba(200,216,232,.35)}
/* Result panel */
.calc-result{background:var(--bg-deep);border:1px solid var(--border);border-radius:var(--r-2xl);padding:32px;display:flex;flex-direction:column;gap:16px}
.cr-hero{text-align:center;padding:20px 0;border-bottom:1px solid var(--border)}
.cr-h-label{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--text-3);margin-bottom:8px}
.cr-h-val{font-family:var(--fh);font-size:52px;font-weight:800;color:var(--acc);letter-spacing:-.04em;line-height:1}
.cr-h-unit{font-size:13px;color:var(--text-3);margin-top:4px}
.cr-compare{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cr-cmp{background:var(--bg-s);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;text-align:center}
.cr-cmp.new{border-color:rgba(200,216,232,.2);background:var(--acc-dim)}
.cr-cmp-lbl{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text-3);margin-bottom:6px}
.cr-cmp-lbl.new{color:var(--acc)}
.cr-cmp-val{font-family:var(--fh);font-size:28px;font-weight:800;color:var(--text-2);letter-spacing:-.03em}
.cr-cmp-val.new{color:var(--acc)}
.cr-cmp-sub{font-size:11px;color:var(--text-3);margin-top:3px}
.cr-rows{display:flex;flex-direction:column;gap:8px}
.cr-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg-s);border-radius:var(--r-md);border:1px solid var(--border)}
.cr-row.total{background:var(--acc-dim);border-color:rgba(200,216,232,.2)}
.crr-label{font-size:13px;color:var(--text-2)}
.crr-label.total{color:var(--text-1);font-weight:700}
.crr-val{font-family:var(--fh);font-size:14px;font-weight:700;color:var(--acc)}
.cr-note{font-size:11px;color:var(--text-3)}
```

- [ ] **Step 2: Append FAQ CSS**

```css
/* ══════════════ FAQ ══════════════ */
.faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.faq-item{background:var(--bg-s);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;transition:border-color .2s;cursor:pointer}
.faq-item:hover,.faq-item.open{border-color:rgba(200,216,232,.2)}
.faq-q{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px}
.faq-q-text{font-family:var(--fh);font-size:14px;font-weight:700;color:var(--text-1);line-height:1.4}
.faq-icon{font-family:var(--fh);font-size:18px;color:var(--text-3);flex-shrink:0;line-height:1;transition:transform .2s var(--ease)}
.faq-item.open .faq-icon{transform:rotate(45deg);color:var(--acc)}
.faq-a{max-height:0;overflow:hidden;transition:max-height .35s var(--ease)}
.faq-item.open .faq-a{max-height:300px}
.faq-a-inner{padding:0 20px 18px;font-size:13px;color:var(--text-2);line-height:1.8;border-top:1px solid var(--border)}
```

- [ ] **Step 3: Verify Zeitrechner + FAQ**

Scroll to `#rechner` and `#faq`. Expected: Calc sliders styled with ice-blue thumb, result panel shows ice-blue value. FAQ items expand on click with ice-blue + icon.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "feat: zeitrechner + FAQ section CSS — dark calc, ice-blue results, accordion"
```

---

### Task 11: CSS — Formular

**Files:**
- Edit: `style.css` (append)

- [ ] **Step 1: Append Formular CSS**

```css
/* ══════════════ FORMULAR ══════════════ */
.form-grid{display:grid;grid-template-columns:1fr 1.1fr;gap:48px;align-items:start}
.form-sticky{position:sticky;top:112px}
.form-trust{display:flex;flex-direction:column;gap:10px;margin-top:20px}
.form-ti{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text-2)}
.form-ti-ico{font-size:16px;width:24px;text-align:center;flex-shrink:0}
/* Multi-step form card */
.form-card{background:var(--bg-deep);border:1px solid var(--border);border-radius:var(--r-2xl);overflow:hidden}
.form-bar{height:3px;background:var(--acc-dim);transition:width .4s var(--ease-out)}
.form-hd{padding:24px 28px;border-bottom:1px solid var(--border)}
.step-pills{display:flex;gap:6px;margin-bottom:16px}
.spill{display:inline-flex;align-items:center;gap:7px;font-family:var(--fh);font-size:11px;font-weight:600;padding:5px 12px;border-radius:100px;transition:all .2s;color:var(--text-3);background:var(--bg-card);border:1px solid var(--border)}
.spill.act{color:var(--acc);background:var(--acc-dim);border-color:rgba(200,216,232,.2)}
.spill-n{width:18px;height:18px;border-radius:50%;background:currentColor;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:var(--bg-deep);flex-shrink:0}
.spill.act .spill-n{background:var(--acc);color:var(--bg-deep)}
.form-step-title{font-family:var(--fh);font-size:16px;font-weight:800;color:var(--text-1)}
.form-step-sub{font-size:12px;color:var(--text-3);margin-top:3px}
.form-body{padding:24px 28px}
.fpanel{display:none}.fpanel.act{display:block}
/* Fields */
.fg{margin-bottom:16px}
.fg2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.fl{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--text-3);display:block;margin-bottom:5px}
.fl em{color:rgba(200,216,232,.6);font-style:normal}
.fi{width:100%;background:var(--bg-s);border:1px solid var(--border);border-radius:var(--r-md);color:var(--text-1);padding:10px 14px;font-family:var(--fh);font-size:14px;outline:none;transition:border-color .2s;-webkit-appearance:none;appearance:none}
.fi:focus{border-color:rgba(200,216,232,.35)}
.fi::placeholder{color:var(--text-3)}
.fsel{width:100%;background:var(--bg-s);border:1px solid var(--border);border-radius:var(--r-md);color:var(--text-1);padding:10px 14px;font-family:var(--fh);font-size:14px;outline:none;cursor:pointer;-webkit-appearance:none;appearance:none;transition:border-color .2s}
.fsel:focus{border-color:rgba(200,216,232,.35)}
.ftxt{width:100%;background:var(--bg-s);border:1px solid var(--border);border-radius:var(--r-md);color:var(--text-1);padding:10px 14px;font-family:var(--fh);font-size:14px;outline:none;resize:vertical;min-height:90px;transition:border-color .2s}
.ftxt:focus{border-color:rgba(200,216,232,.35)}
.fhint{font-size:11px;color:var(--text-3);margin-top:5px}
/* Checkboxes */
.chk-wrap{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px}
.chk{display:flex;align-items:center;gap:8px;background:var(--bg-s);border:1px solid var(--border);border-radius:var(--r-md);padding:10px 12px;cursor:pointer;font-size:13px;color:var(--text-2);transition:all .2s}
.chk.on{border-color:rgba(200,216,232,.3);background:var(--acc-dim);color:var(--text-1)}
.chk input{width:14px;height:14px;accent-color:var(--acc);cursor:pointer}
/* Divider in form */
.fdivider{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;margin-bottom:16px}
.fdiv-label{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--text-3);margin-bottom:12px}
/* Consent */
.consent{display:flex;align-items:flex-start;gap:10px;background:var(--bg-s);border:1px solid var(--border);border-radius:var(--r-md);padding:12px 14px;cursor:pointer;font-size:12px;color:var(--text-2);margin-bottom:8px;transition:border-color .2s;line-height:1.6}
.consent.on{border-color:rgba(200,216,232,.25)}
.consent a{color:var(--acc);text-decoration:underline}
.consent input{width:14px;height:14px;accent-color:var(--acc);cursor:pointer;flex-shrink:0;margin-top:2px}
/* Navigation buttons */
.form-nav{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)}
.btn-next,.btn-submit{background:var(--btn-bg);color:var(--acc);border:1.5px solid rgba(200,216,232,.2);padding:11px 24px;border-radius:var(--r);font-family:var(--fh);font-size:13px;font-weight:700;cursor:pointer;transition:all .18s}
.btn-next:hover,.btn-submit:hover{background:#253d56;border-color:rgba(200,216,232,.4)}
.btn-back{background:transparent;color:var(--text-3);border:1.5px solid var(--border);padding:11px 20px;border-radius:var(--r);font-family:var(--fh);font-size:13px;font-weight:600;cursor:pointer;transition:all .18s}
.btn-back:hover{color:var(--text-1);border-color:rgba(238,242,246,.2)}
/* Success state */
.form-success{display:none;text-align:center;padding:40px 20px}
.form-success-ico{font-size:48px;margin-bottom:16px}
.form-success-title{font-family:var(--fh);font-size:20px;font-weight:800;color:var(--text-1);margin-bottom:12px}
.form-success-text{font-size:14px;color:var(--text-2);line-height:1.8}
```

- [ ] **Step 2: Verify Formular**

Scroll to `#anmelden`. Expected: Form card on `--bg-deep`, ice-blue step pills, dark input fields, progress bar. Multi-step navigation works (click Weiter →).

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: formular section CSS — dark multi-step form, ice-blue step pills"
```

---

### Task 12: HTML Kontakt Cleanup + CSS Kontakt + CTA + Footer

**Files:**
- Edit: `index.html` (Kontakt inline styles)
- Edit: `style.css` (append)

- [ ] **Step 1: Update Kontakt section inline styles**

In `index.html`, find the `#kontakt` section (around line 1335). Replace each contact detail card's inline style. Change the 4 contact item divs from:
```html
style="display:flex;align-items:center;gap:14px;padding:14px 18px;background:#fff;border:1.5px solid var(--f2);border-radius:var(--r-lg);transition:border-color .2s" onmouseover="this.style.borderColor='var(--navy)'" onmouseout="this.style.borderColor='var(--f2)'"
```
to:
```html
class="contact-card"
```

Change the icon wrapper divs from:
```html
style="width:40px;height:40px;background:var(--sky);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0"
```
to:
```html
class="contact-card-ico"
```

Change the quick contact form container from:
```html
style="background:#fff;border:1.5px solid var(--f2);border-radius:var(--r-xl);padding:24px"
```
to:
```html
class="contact-form-box"
```

Change the map container from:
```html
style="background:#fff;border:1.5px solid var(--f2);border-radius:var(--r-2xl);overflow:hidden;box-shadow:var(--sh-lg)"
```
to:
```html
class="contact-map-box"
```

Change the map header from:
```html
style="padding:18px 22px;border-bottom:1px solid var(--f2);display:flex;align-items:center;gap:12px"
```
to:
```html
style="padding:18px 22px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px"
```

Change the map header icon wrapper from:
```html
style="width:36px;height:36px;background:var(--sky);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px"
```
to:
```html
class="contact-card-ico"
```

Change the "Bundesweit aktiv" badge from:
```html
style="background:var(--green-pale);border:1px solid rgba(0,149,106,.2);color:var(--green);font-family:var(--fh);font-size:10px;font-weight:700;padding:4px 10px;border-radius:100px"
```
to:
```html
class="contact-active-badge"
```

Change the service coverage city items from:
```html
style="text-align:center;padding:10px 8px;background:var(--f0);border-radius:var(--r-lg)"
```
to:
```html
class="coverage-city"
```

Change the "Bundesweit" coverage item from:
```html
style="text-align:center;padding:10px 8px;background:var(--green-pale);border:1px solid rgba(0,149,106,.15);border-radius:var(--r-lg)"
```
to:
```html
class="coverage-city coverage-city-accent"
```

Change city name labels from:
```html
style="font-family:var(--fh);font-size:10px;font-weight:700;color:var(--t0)"
```
to:
```html
class="coverage-city-name"
```

Change the Bundesweit label from:
```html
style="font-family:var(--fh);font-size:10px;font-weight:700;color:var(--green)"
```
to:
```html
class="coverage-city-name coverage-city-name-acc"
```

Change the map footer service coverage label from:
```html
style="font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--t2);margin-bottom:12px"
```
to:
```html
style="font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--text-3);margin-bottom:12px"
```

Change the map footer coverage grid from:
```html
style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px"
```
to:
```html
class="coverage-grid"
```

Change Schnellanfrage form label from:
```html
style="font-family:var(--fh);font-size:14px;font-weight:700;color:var(--t0);margin-bottom:16px"
```
to:
```html
style="font-family:var(--fh);font-size:14px;font-weight:700;color:var(--text-1);margin-bottom:16px"
```

Change field label inline styles from `color:var(--t2)` to `color:var(--text-3)` and from `color:var(--t0)` to `color:var(--text-1)` throughout the Kontakt section.

- [ ] **Step 2: Append Kontakt + CTA + Footer CSS**

```css
/* ══════════════ KONTAKT ══════════════ */
.contact-card{display:flex;align-items:center;gap:14px;padding:14px 18px;background:var(--bg-deep);border:1px solid var(--border);border-radius:var(--r-lg);transition:border-color .2s}
.contact-card:hover{border-color:rgba(200,216,232,.2)}
.contact-card-ico{width:40px;height:40px;background:var(--acc-dim);border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.contact-form-box{background:var(--bg-deep);border:1px solid var(--border);border-radius:var(--r-xl);padding:24px}
.contact-map-box{background:var(--bg-deep);border:1px solid var(--border);border-radius:var(--r-2xl);overflow:hidden}
.contact-active-badge{background:var(--acc-dim);border:1px solid rgba(200,216,232,.2);color:var(--acc);font-family:var(--fh);font-size:10px;font-weight:700;padding:4px 10px;border-radius:100px}
.coverage-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.coverage-city{text-align:center;padding:10px 8px;background:var(--bg-s);border-radius:var(--r-md)}
.coverage-city-accent{background:var(--acc-dim);border:1px solid rgba(200,216,232,.15)}
.coverage-city-name{font-family:var(--fh);font-size:10px;font-weight:700;color:var(--text-1)}
.coverage-city-name-acc{color:var(--acc)}

/* ══════════════ CTA ══════════════ */
.cta-sec{background:var(--bg-deep);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.cta-inner{max-width:800px;margin:0 auto;padding:80px 48px;text-align:center}

/* ══════════════ FOOTER ══════════════ */
footer{background:var(--bg-deep);border-top:1px solid var(--border);padding:64px 0 0}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:32px;margin-bottom:40px}
.f-col h5{font-family:var(--fh);font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--text-3);margin-bottom:16px}
.f-col ul{list-style:none;display:flex;flex-direction:column;gap:10px}
.f-col a{font-size:13px;color:var(--text-2);transition:color .2s}
.f-col a:hover{color:var(--acc)}
.fb-desc{font-size:13px;color:var(--text-3);line-height:1.7;margin-bottom:16px}
.fb-badges{display:flex;flex-wrap:wrap;gap:6px}
.fb-badge{font-family:var(--fh);font-size:10px;font-weight:600;color:var(--text-3);background:var(--bg-card);border:1px solid var(--border);padding:4px 10px;border-radius:100px}
.footer-legal-note{font-size:11px;color:var(--text-3);line-height:1.7;padding:20px 0;border-top:1px solid var(--border)}
.footer-bottom{display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-top:1px solid var(--border)}
.f-copy{font-size:12px;color:var(--text-3)}
.f-links{display:flex;gap:20px}
.f-links a{font-size:12px;color:var(--text-3);transition:color .2s}
.f-links a:hover{color:var(--acc)}
```

- [ ] **Step 3: Verify Kontakt + CTA + Footer**

Scroll to `#kontakt`, CTA, and footer. Expected: All contact cards dark with ice-blue hover border, map panel dark, CTA section bg-deep, footer dark with muted links.

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: kontakt HTML cleanup + kontakt/CTA/footer CSS — full dark theme"
```

---

### Task 13: CSS — Dashboard (Preserved) + Toast + Responsive

**Files:**
- Edit: `style.css` (append)

- [ ] **Step 1: Append dashboard CSS (unchanged from original)**

The dashboard is inside `#dash{position:fixed;inset:0;z-index:400}` which fully overlays the landing page. It uses old variable names (`--navy`, `--t0`, `--f2`, etc.) which are still set to their original light-theme values in `:root`. Copy the following verbatim:

```css
/* ══════════════ DASHBOARD ══════════════ */
#dash{display:none;position:fixed;inset:0;z-index:400;background:var(--f0);flex-direction:column;overflow:hidden}
#dash.open{display:flex}
.dash-nav{background:#fff;border-bottom:1px solid var(--f2);height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 28px;flex-shrink:0}
.dash-logo{display:flex;align-items:center;gap:10px}
.dash-logo-ico{width:30px;height:30px;background:var(--navy);border-radius:8px;display:flex;align-items:center;justify-content:center}
.dash-logo-name{font-family:var(--fh);font-size:15px;font-weight:800;color:var(--t0)}
.dash-logo-name em{color:var(--navy);font-style:normal}
.dash-close{background:none;border:1.5px solid var(--f2);color:var(--t2);padding:8px 16px;border-radius:var(--r-lg);font-family:var(--fh);font-size:13px;cursor:pointer;transition:all .2s}
.dash-close:hover{border-color:var(--t2);color:var(--t0)}
.dash-body{display:flex;flex:1;overflow:hidden}
.dash-sb{width:240px;background:#fff;border-right:1px solid var(--f2);padding:16px 0;flex-shrink:0;overflow-y:auto}
.dsb-sec{margin-bottom:6px}
.dsb-lbl{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--t3);padding:8px 18px 6px}
.dsb-item{display:flex;align-items:center;gap:10px;padding:11px 18px;font-family:var(--fh);font-size:13px;font-weight:500;color:var(--t2);cursor:pointer;transition:all .18s;border-left:3px solid transparent}
.dsb-item:hover{color:var(--t0);background:var(--f0)}
.dsb-item.act{color:var(--navy);background:var(--sky);border-left-color:var(--navy);font-weight:700}
.dsb-item .di{font-size:15px;width:20px;text-align:center}
.dash-main{flex:1;overflow-y:auto;padding:36px}
.dp{display:none}.dp.act{display:block}
.dh{font-family:var(--fh);font-size:24px;font-weight:800;color:var(--t0);letter-spacing:-.02em}
.dsub{font-size:14px;color:var(--t2);margin-top:4px;margin-bottom:28px}
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
.kpi{background:#fff;border:1.5px solid var(--f2);border-radius:var(--r-xl);padding:20px 22px}
.kpi-lbl{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--t3);margin-bottom:8px}
.kpi-val{font-family:var(--fh);font-size:28px;font-weight:800;color:var(--t0);letter-spacing:-.03em}
.kpi-delta{font-size:12px;margin-top:5px}
.kpi-delta.up{color:var(--green)}.kpi-delta.flat{color:var(--t3)}
.tbl-wrap{background:#fff;border:1.5px solid var(--f2);border-radius:var(--r-xl);overflow:hidden}
.tbl-head{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid var(--f2);flex-wrap:wrap;gap:10px}
.tbl-title{font-family:var(--fh);font-size:15px;font-weight:700;color:var(--t0)}
.tbl-sel{background:var(--f0);border:1.5px solid var(--f2);color:var(--t2);padding:8px 14px;border-radius:var(--r-lg);font-family:var(--fh);font-size:12px;cursor:pointer;-webkit-appearance:none;appearance:none;outline:none;transition:border-color .2s ease,color .2s ease}
.tbl-sel:hover{border-color:var(--f3);color:var(--t1)}
table{width:100%;border-collapse:collapse}
thead tr{background:var(--f0)}
th{padding:12px 18px;text-align:left;font-family:var(--fh);font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--t3);white-space:nowrap}
td{padding:15px 18px;font-size:14px;color:var(--t2);border-top:1px solid var(--f2);vertical-align:middle}
td strong{color:var(--t0);font-weight:600}
tbody tr:hover td{background:var(--f0)}
.sb{display:inline-flex;align-items:center;padding:2px 8px;border-radius:100px;font-family:var(--fh);font-size:9px;font-weight:700}
.sb-bl{background:var(--sky);color:var(--navy)}.sb-gr{background:var(--green-pale);color:var(--green)}
.sb-am{background:var(--amber-pale);color:#92400E}.sb-gy{background:var(--f1);color:var(--t3);border:1px solid var(--f2)}
.td-btn{background:none;border:1.5px solid var(--f2);color:var(--t2);padding:6px 12px;border-radius:var(--r-lg);font-family:var(--fh);font-size:12px;cursor:pointer;transition:all .18s}
.td-btn:hover{border-color:var(--navy);color:var(--navy)}
.det-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.det-card{background:#fff;border:1.5px solid var(--f2);border-radius:var(--r-lg);padding:18px}
.dc-lbl{font-family:var(--fh);font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--t3);margin-bottom:11px}
.dc-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--f1)}
.dc-row:last-child{border-bottom:none}
.dc-k{font-size:11px;color:var(--t2)}.dc-v{font-family:var(--fh);font-size:12px;font-weight:600;color:var(--t0)}
.dc-v.g{color:var(--green)}.dc-v.b{color:var(--navy)}
.proc-track{display:flex;flex-direction:column}
.ptrack-step{display:flex;gap:11px}
.ptl{display:flex;flex-direction:column;align-items:center}
.ptdot{width:11px;height:11px;border-radius:50%;flex-shrink:0;margin-top:3px}
.ptdot.done{background:var(--green)}.ptdot.now{background:var(--navy);box-shadow:0 0 0 4px var(--sky)}.ptdot.todo{background:var(--f2);border:2px solid var(--f3)}
.ptline{width:2px;flex:1;min-height:18px;margin-top:3px;background:var(--f2)}
.ptline.done{background:var(--green)}
.ptrack-step:last-child .ptline{display:none}
.ptbody{padding-bottom:13px}
.pttitle{font-family:var(--fh);font-size:12px;font-weight:600;color:var(--t0)}
.ptdate{font-size:11px;color:var(--t2);margin-top:2px}
.tp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}
.tp-card{background:#fff;border:1.5px solid var(--f2);border-radius:var(--r-lg);padding:20px}
.tp-card.feat{background:var(--ink2);border-color:var(--ink2)}
.tp-ico{font-size:22px;margin-bottom:10px}
.tp-lbl{font-family:var(--fh);font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--navy);margin-bottom:4px}
.tp-card.feat .tp-lbl{color:rgba(255,255,255,.4)}
.tp-val{font-family:var(--fh);font-size:24px;font-weight:800;color:var(--t0);letter-spacing:-.03em;margin-bottom:3px}
.tp-card.feat .tp-val{color:#90C8F0}
.tp-title{font-family:var(--fh);font-size:12px;font-weight:700;color:var(--t0);margin-bottom:6px}
.tp-card.feat .tp-title{color:#fff}
.tp-text{font-size:11px;color:var(--t2);line-height:1.65}
.tp-card.feat .tp-text{color:rgba(255,255,255,.45)}
.gl-box{margin-top:16px;background:#fff;border:1.5px solid var(--f2);border-radius:var(--r-xl);overflow:hidden}
.gl-head{background:var(--sky);border-bottom:1px solid var(--sky2);padding:10px 18px;font-family:var(--fh);font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--navy);display:flex;align-items:center;gap:7px}
.gl-grid{display:grid;grid-template-columns:repeat(4,1fr)}
.gl-item{padding:14px 16px;border-right:1px solid var(--f2)}
.gl-item:last-child{border-right:none}
.gl-abbr{font-family:var(--fh);font-size:22px;font-weight:800;color:var(--navy);line-height:1;margin-bottom:3px;letter-spacing:-.02em}
.gl-name{font-family:var(--fh);font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--t0);margin-bottom:4px}
.gl-desc{font-size:11px;color:var(--t2);line-height:1.55}
.gl-desc strong{color:var(--t0)}
.bed-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.bed{display:flex;gap:10px;padding:13px 14px;border-radius:var(--r-lg);border:1.5px solid}
.bed.ok{background:var(--green-pale);border-color:rgba(0,149,106,.18)}.bed.warn{background:var(--amber-pale);border-color:rgba(232,144,10,.25)}
.bed-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:4px}
.bed-dot.ok{background:var(--green)}.bed-dot.warn{background:var(--amber)}
.bed-title{font-family:var(--fh);font-size:12px;font-weight:700;color:var(--t0);margin-bottom:2px}
.bed-text{font-size:11px;color:var(--t2);line-height:1.6}
#dash .fi,#dash .fsel,#dash select.fi{font-size:15px;padding:12px 15px;background:#fff;border:1.5px solid var(--f2);color:var(--t0)}
#dash .fi:focus,#dash .fsel:focus{border-color:var(--navy)}
#dash .fl{font-size:11px;letter-spacing:.12em;color:var(--t2)}
#dash .fg{margin-bottom:18px}
#dash .dh{font-size:24px}
#dash .btn-navy{font-size:15px;padding:14px 28px;background:var(--navy);color:#fff;border:none}
#dash .btn-navy:hover{background:var(--navy-l)}
```

- [ ] **Step 2: Append Toast CSS**

```css
/* ══════════════ TOAST ══════════════ */
.toast{position:fixed;bottom:18px;right:18px;z-index:9999;background:var(--bg-deep);color:var(--text-1);border:1px solid var(--border);border-radius:var(--r-lg);padding:11px 16px;font-family:var(--fh);font-size:12px;font-weight:600;display:flex;align-items:center;gap:8px;box-shadow:var(--sh-xl);transform:translateY(60px);opacity:0;transition:all .4s var(--ease);pointer-events:none}
.toast.show{transform:translateY(0);opacity:1}
.toast-ico{color:var(--acc)}
```

- [ ] **Step 3: Append responsive CSS**

```css
/* ══════════════ RESPONSIVE ══════════════ */
@media(max-width:1060px){
  .hero-grid{grid-template-columns:1fr;gap:48px}
  .hero-dash{display:none}
  .svc-grid,.ziel-grid,.calc-grid,.form-grid{grid-template-columns:1fr;gap:40px}
  .ub-intro-grid{grid-template-columns:1fr}
  #kontakt .wrap > div{grid-template-columns:1fr!important}
  .form-sticky{position:static}
  .wk-grid{grid-template-columns:1fr}
  .allein-grid{grid-template-columns:1fr}
  .footer-grid{grid-template-columns:1fr 1fr;gap:28px}
  .det-grid{grid-template-columns:1fr}
  .kpi-row{grid-template-columns:1fr 1fr}
  .gl-grid{grid-template-columns:1fr 1fr}
  .tp-grid{grid-template-columns:1fr 1fr}
  .exp-stats{flex-direction:column}
  .exp-stat-divider{width:80px;height:1px}
  .exp-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:860px){
  .nav-links,.nav-cta{display:none}.burger{display:flex}
  .trust-inner{grid-template-columns:1fr 1fr}
  .ti{border-right:none;border-bottom:1px solid var(--border)}
  .wf-steps{grid-template-columns:1fr 1fr}
  .wf-line{display:none}
  .wf-arrow{display:none}
  .faq-grid{grid-template-columns:1fr}
  .wrap,.nav-in,.trust-inner,.cta-inner{padding-left:24px;padding-right:24px}
  .branchen{grid-template-columns:1fr}
}
@media(max-width:720px){
  .exp-grid{grid-template-columns:1fr}
}
@media(max-width:600px){
  .hero-h1{font-size:36px}
  .hero-kpi{flex-direction:column}
  .hkpi{border-bottom:1px solid var(--border)}
  .hero-btns{flex-direction:column}
  .fg2{display:flex;flex-direction:column}
  .chk-wrap{grid-template-columns:1fr}
  .wf-steps{grid-template-columns:1fr}
  .ver-wrap{overflow-x:auto}
  .cr-compare{grid-template-columns:1fr}
  .footer-grid{grid-template-columns:1fr}
  .coverage-grid{grid-template-columns:1fr 1fr}
  .trust-inner{grid-template-columns:1fr}
  .allein-grid{grid-template-columns:1fr}
  .dash-sb{width:56px}
  .dsb-lbl,.dsb-item span:not(.di){display:none}
  .dsb-item{justify-content:center;padding:10px}
  .kpi-row{grid-template-columns:1fr 1fr}
  th:nth-child(n+5),td:nth-child(n+5){display:none}
}
@media(max-width:480px){
  .wrap{padding-left:20px;padding-right:20px}
  .nav-in{padding-left:20px;padding-right:20px}
  .hkpi{padding:14px 10px}
  .hkpi-val{font-size:20px}
}
```

- [ ] **Step 4: Append Schaden page CSS (read from original file and preserve)**

Read `style.css` lines 1323–1342 from the original file and append verbatim. These are the `.scd-hero`, `.scd-cards` rules used by `schaden.html`. They are independent of the landing page redesign and should be unchanged.

Run:
```bash
node -e "const fs=require('fs');const lines=fs.readFileSync('style.css','utf8').split('\n');console.log(lines.slice(0,50).join('\n'))"
```
Then identify the schaden section (searching for `/* ══════════════════ SCHADEN PAGE`) and append it.

**Note:** At this point the new `style.css` no longer contains the old experimental hero CSS (`.hero-service-panel`, `.hero-image-panel`, `.hero-brief-*`, etc.) from lines 1344–3008 of the original. Those are deleted as part of the full rewrite.

- [ ] **Step 5: Verify dashboard and toast**

1. Open `http://localhost:8000`
2. Navigate to `/intern` in the browser
3. Log in with the DASH_USER credentials from `.env`
4. Expected: Dashboard shows white/light theme (unchanged from before redesign)
5. Click "← Website" button to return to landing page

- [ ] **Step 6: Commit**

```bash
git add style.css
git commit -m "feat: preserve dashboard CSS + toast + responsive + schaden CSS"
```

---

### Task 14: Final QA + Version Bump

**Files:**
- Edit: `index.html` (stylesheet version string)

- [ ] **Step 1: Update stylesheet version string**

In `index.html` line 11, change:
```html
<link rel="stylesheet" href="style.css?v=hero-concrete-system-7">
```
to:
```html
<link rel="stylesheet" href="style.css?v=kalte-praezision-1">
```

- [ ] **Step 2: Full visual QA checklist**

Start server (`node server.js`) and open `http://localhost:8000`. Test each section:

| Section | Check |
|---|---|
| Nav (transparent) | Transparent over hero, links visible, CTA with ice-blue border |
| Nav (scrolled) | `--bg-deep` solid, logo switches to dark, links still readable |
| Nav (mobile) | Hamburger appears at 860px, mob-menu opens with dark bg |
| Hero | 2-column grid, dashboard card on right, trust bar at bottom |
| Trust bar | 5 items horizontal, `--bg-deep` bg, square checkmark icons |
| Service | `--bg-s` bg, ice-blue checkmarks, dark "included" card |
| Prozess | `--bg` default, 4 workflow cards, ice-blue line fill on scroll |
| Explainer | `--bg-s`, MGP player controls styled dark |
| Warum wir | `--bg`, 3 comparison cards, table, 4 USP cards |
| Über uns | `--bg-deep` (sec-dark), founder card, stat grid, prinzip cards |
| Expertise | `--bg-s`, ice-blue stat values, 3 dark exp-cards |
| Zielgruppe | `--bg`, 4 branche cards, persona card with dark Q&A |
| Zeitrechner | `--bg-s`, ice-blue slider, dark result panel |
| FAQ | `--bg`, accordion opens/closes, ice-blue + icon |
| Formular | `--bg-s`, multi-step form dark, step pills ice-blue |
| Kontakt | `--bg`, dark contact cards, dark map panel |
| CTA | `--bg-deep`, centered CTA block |
| Footer | `--bg-deep`, muted link columns |
| Dashboard | `http://localhost:8000/intern` — light theme unchanged |

- [ ] **Step 3: Check for console errors**

Open browser DevTools → Console. Expected: 0 errors. If any CSS variable undefined warnings appear, fix the missing rule.

- [ ] **Step 4: Check mobile (resize to 375px)**

Use DevTools device emulation at 375px width. Expected: Hero stacks vertically, nav shows burger menu, trust bar collapses to 1 column, all sections readable.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: version bump + final QA — homepage redesign Kalte Präzision complete"
```

---

## Self-Review

**Spec coverage:**
- ✓ Hero: New HTML with grid layout, dashboard card, trust bar inside section
- ✓ Nav: Transparent on hero, `--bg-deep` on scroll, logo switching, no `nav-hidden-for-concrete`
- ✓ Color palette: New tokens (`--bg`, `--bg-s`, `--bg-deep`, `--acc`, etc.) throughout
- ✓ No glows, no grid patterns — confirmed in hero background (linear gradient only)
- ✓ Section backgrounds alternate per spec table
- ✓ Backward compat: legacy variables kept at original values in `:root`
- ✓ Dashboard CSS preserved intact
- ✓ Kontakt inline styles cleaned up

**Placeholder scan:** No TBD, TODO, or "implement later" entries found. Task 13 Step 4 references "read lines 1323–1342" which is a specific, bounded operation — not a placeholder.

**Type consistency:** CSS class names match HTML class names throughout. `hkpi-ico{display:none}` hides the legacy icon div that remains in older HTML but was removed from the new hero HTML.
