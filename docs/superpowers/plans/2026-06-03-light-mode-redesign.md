# Light Mode Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the IMD Fleet Services landing page (`index.html` + `style.css`) from dark navy to a professional light mode with split-screen hero (white text panel left, beton photo right), navy+blue accent system, and all 12 sections restyled.

**Architecture:** Replace `:root` CSS tokens to flip the default theme from dark to light. Update section-specific CSS classes that use hardcoded dark colors. Rewrite the hero HTML from a 2-column grid with a floating dashboard card to a split-screen layout. The dark mode toggle stays functional — a new `[data-theme="dark"]` block restores the old palette.

**Tech Stack:** Plain HTML/CSS, Node.js/Express server (`node server.js`), IBM Plex Sans font, `new_background_header.jpeg` (beton photo), `about-office.jpg` (Über uns photo).

**Key file context:**
- `style.css` — 890+ lines. `:root` tokens start at line 64. `[data-theme="light"]` overrides start at line 828. `[data-theme="dark"]` currently doesn't exist — dark is the default.
- `index.html` — Hero section starts at line 49 (`.hero-grid` = 2-col: copy left, `.hero-dash` right). Nav at line 29.
- Server runs at `http://localhost:8000`. Static files need to be in `publicAssets` in `server.js` (both `new_background_header.jpeg` and `design-assets/about-office.jpg` are already whitelisted).

---

## File Structure

**Modified files only:**
- `style.css` — tokens, nav, hero, all section classes, remove light overrides, add dark overrides
- `index.html` — hero split-screen HTML, nav logo simplification

---

### Task 1: CSS Tokens — flip to light mode default

**Files:**
- Modify: `style.css:64-100` (`:root` block)

Replace the `:root` dark palette with the new light palette. Everything token-based cascades automatically after this step.

- [ ] **Step 1: Replace the `:root` token block in `style.css`**

Find this block (lines 64–100):
```css
:root {
  /* ── New design tokens ── */
  --bg:        #1e2840;
  --bg-s:      #243350;
  --bg-deep:   #171f33;
  --bg-card:   rgba(238,242,246,0.06);
  --acc:       #C8D8E8;
  --acc-dim:   rgba(200,216,232,0.18);
  --btn-bg:    #253048;
  --amber:     #D4A840;
  --text-1:    #EEF2F6;
  --text-2:    rgba(238,242,246,0.55);
  --text-3:    rgba(238,242,246,0.28);
  --border:    rgba(238,242,246,0.10);
  --border-s:  rgba(238,242,246,0.06);
  --r:4px; ...
```

Replace the design token lines (keep everything after `--border-s` unchanged — radius, fonts, easing, legacy vars):
```css
:root {
  /* ── Light mode tokens (default) ── */
  --bg:        #ffffff;
  --bg-s:      #f5f8fc;
  --bg-deep:   #1a2540;
  --bg-footer: #0f172a;
  --bg-card:   #f8fafc;
  --navy:      #1a2540;
  --blue:      #2563eb;
  --blue-bg:   #eff6ff;
  --blue-bd:   #bfdbfe;
  --acc:       #2563eb;
  --acc-dim:   #eff6ff;
  --btn-bg:    #1a2540;
  --amber:     #D4A840;
  --text-1:    #1a2540;
  --text-2:    #475569;
  --text-3:    #94a3b8;
  --text-inv:  #ffffff;
  --border:    #e2e8f0;
  --border-s:  rgba(255,255,255,0.15);
  --r:4px; --r-md:8px; --r-lg:14px; --r-xl:20px; --r-2xl:28px;
  --fh:'IBM Plex Sans',sans-serif;
  --ease:cubic-bezier(.16,1,.3,1);
  --ease-spring:cubic-bezier(.34,1.56,.64,1);
  --ease-out:cubic-bezier(.22,1,.36,1);

  /* ── Legacy vars — kept for dashboard + inline styles ── */
  --ink:#09152A; --ink2:#142033; --ink3:#1C2D4A;
  --navy-l:#1868BC; --navy-ll:#3584D6;
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
```

- [ ] **Step 2: Update `body` background and scrollbar**

Find:
```css
body{font-family:var(--fh);background:var(--bg);color:var(--text-1);overflow-x:hidden;line-height:1.7;font-size:15px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:rgba(200,216,232,.3);border-radius:2px}
```

Replace:
```css
body{font-family:var(--fh);background:var(--bg);color:var(--text-1);overflow-x:hidden;line-height:1.7;font-size:15px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:rgba(26,37,64,.2);border-radius:2px}
```

- [ ] **Step 3: Update `.eyebrow` and `.eyebrow-white` colors**

Find:
```css
.eyebrow{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--acc);display:inline-flex;align-items:center;margin-bottom:16px}
.eyebrow-white{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(200,216,232,.6);display:inline-flex;align-items:center;margin-bottom:16px}
```

Replace:
```css
.eyebrow{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--blue);display:inline-flex;align-items:center;margin-bottom:16px}
.eyebrow-white{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(200,216,232,.7);display:inline-flex;align-items:center;margin-bottom:16px}
```

- [ ] **Step 4: Update `.h2 em` accent color**

Find:
```css
.h2 em{font-style:normal;color:var(--acc)}
.h2-white{color:var(--text-1)}.h2-white em{color:var(--acc)}
```

Replace (no change needed — `var(--acc)` now maps to `--blue` #2563eb via token):
```css
.h2 em{font-style:normal;color:var(--blue)}
.h2-white{color:#ffffff}.h2-white em{color:#c8d8e8}
```

- [ ] **Step 5: Update `.btn-primary` / `.btn-ghost`**

Find:
```css
.btn-primary,.btn-green,.btn-navy{background:var(--btn-bg);color:var(--acc);border:1.5px solid rgba(200,216,232,.2);padding:14px 30px}
.btn-primary:hover,.btn-green:hover,.btn-navy:hover{background:#253d56;border-color:rgba(200,216,232,.45);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.35)}
.btn-ghost,.btn-ghost-white{background:transparent;color:var(--text-2);border:1.5px solid var(--border);padding:12px 28px}
.btn-ghost:hover,.btn-ghost-white:hover{border-color:rgba(238,242,246,.22);background:var(--bg-card);color:var(--text-1);transform:translateY(-2px)}
```

Replace:
```css
.btn-primary,.btn-green,.btn-navy{background:var(--navy);color:#fff;border:1.5px solid transparent;padding:14px 30px}
.btn-primary:hover,.btn-green:hover,.btn-navy:hover{background:#0f172a;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.18)}
.btn-ghost,.btn-ghost-white{background:transparent;color:var(--blue);border:1.5px solid var(--blue);padding:12px 28px}
.btn-ghost:hover,.btn-ghost-white:hover{background:var(--blue-bg);color:var(--blue);border-color:var(--blue);transform:translateY(-2px)}
```

- [ ] **Step 6: Update `.tag-*` colors**

Find:
```css
.tag-navy,.tag-green{color:var(--acc);background:var(--acc-dim);border:1px solid rgba(200,216,232,.15)}
.tag-white{color:rgba(238,242,246,.85);background:rgba(238,242,246,.1);border:1px solid rgba(238,242,246,.18)}
.tag-grey{color:var(--text-2);background:var(--bg-card);border:1px solid var(--border)}
```

Replace:
```css
.tag-navy,.tag-green{color:var(--blue);background:var(--blue-bg);border:1px solid var(--blue-bd)}
.tag-white{color:rgba(200,216,232,.9);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18)}
.tag-grey{color:var(--text-2);background:var(--bg-card);border:1px solid var(--border)}
```

- [ ] **Step 7: Add `[data-theme="dark"]` block to preserve dark mode toggle**

Find the existing `[data-theme="light"]` block (around line 828). **Before** it, insert this new block:

```css
/* ── Dark mode override ── */
[data-theme="dark"]{
  --bg:#1e2840;--bg-s:#243350;--bg-deep:#171f33;--bg-card:rgba(238,242,246,.06);
  --navy:#253048;--blue:#C8D8E8;--blue-bg:rgba(200,216,232,.18);--blue-bd:rgba(200,216,232,.2);
  --acc:#C8D8E8;--acc-dim:rgba(200,216,232,.18);--btn-bg:#253048;
  --text-1:#EEF2F6;--text-2:rgba(238,242,246,.55);--text-3:rgba(238,242,246,.28);
  --border:rgba(238,242,246,.10);--border-s:rgba(238,242,246,.06)
}
[data-theme="dark"] body{background:var(--bg);color:var(--text-1)}
[data-theme="dark"] ::-webkit-scrollbar-thumb{background:rgba(200,216,232,.3)}
```

- [ ] **Step 8: Start server and verify basic token cascade**

```bash
node server.js
```

Open `http://localhost:8000`. The page should now have a white background. Sections with `var(--bg)` = white, `var(--bg-s)` = #f5f8fc. Text should be dark navy. If it looks like a broken mess, check that no step had a typo in token names.

- [ ] **Step 9: Commit**

```bash
git add style.css
git commit -m "Switch CSS to light mode default tokens"
```

---

### Task 2: Nav — always white

**Files:**
- Modify: `style.css:226-248` (nav block)
- Modify: `index.html:31` (nav logo)

- [ ] **Step 1: Rewrite nav CSS**

Find:
```css
nav{position:fixed;inset:0 0 auto;z-index:300;height:88px;display:flex;align-items:center;transition:all .35s var(--ease);background:transparent}
nav.sc{background:var(--bg-deep);backdrop-filter:blur(20px);box-shadow:0 1px 0 var(--border)}
```

Replace:
```css
nav{position:fixed;inset:0 0 auto;z-index:300;height:72px;display:flex;align-items:center;background:#fff;border-bottom:1px solid var(--border);box-shadow:0 1px 6px rgba(9,21,42,.04)}
nav.sc{background:#fff;box-shadow:0 2px 12px rgba(9,21,42,.07)}
```

- [ ] **Step 2: Update nav link colors**

Find:
```css
.nav-links a{font-family:var(--fh);font-size:12px;font-weight:600;color:var(--text-2);letter-spacing:.01em;transition:color .2s var(--ease);position:relative;padding-bottom:2px}
.nav-links a::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1.5px;background:var(--acc);border-radius:1px;transition:width .22s var(--ease)}
.nav-links a:hover{color:var(--text-1)}
.nav-links a:hover::after{width:100%}
nav.sc .nav-links a{color:var(--text-2)}
nav.sc .nav-links a:hover{color:var(--text-1)}
```

Replace:
```css
.nav-links a{font-family:var(--fh);font-size:13px;font-weight:500;color:var(--text-2);letter-spacing:.01em;transition:color .2s var(--ease);position:relative;padding-bottom:2px}
.nav-links a::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1.5px;background:var(--blue);border-radius:1px;transition:width .22s var(--ease)}
.nav-links a:hover{color:var(--text-1)}
.nav-links a:hover::after{width:100%}
nav.sc .nav-links a{color:var(--text-2)}
nav.sc .nav-links a:hover{color:var(--text-1)}
```

- [ ] **Step 3: Update nav CTA button**

Find:
```css
.nav-cta{background:var(--btn-bg);color:var(--acc);border:1.5px solid rgba(200,216,232,.2);padding:9px 20px;border-radius:var(--r-xl);font-family:var(--fh);font-size:13px;font-weight:700;cursor:pointer;transition:all .18s ease;flex-shrink:0;margin-left:auto}
.nav-cta:hover{background:#253d56;border-color:rgba(200,216,232,.4);transform:translateY(-1px)}
```

Replace:
```css
.nav-cta{background:var(--navy);color:#fff;border:1.5px solid transparent;padding:9px 22px;border-radius:var(--r);font-family:var(--fh);font-size:13px;font-weight:700;cursor:pointer;transition:all .18s ease;flex-shrink:0;margin-left:auto}
.nav-cta:hover{background:#0f172a;transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.15)}
```

- [ ] **Step 4: Simplify logo in `index.html`**

Find (line 31):
```html
<div class="nav-logo" onclick="window.scrollTo({top:0,behavior:'smooth'})" style="cursor:pointer"><img class="logo-img logo-img-dark" src="logo_dark.png" alt="IMD Fleet Services"/><img class="logo-img logo-img-light" src="logo_light.png" alt="IMD Fleet Services"/></div>
```

Replace:
```html
<div class="nav-logo" onclick="window.scrollTo({top:0,behavior:'smooth'})" style="cursor:pointer"><img class="logo-img" src="logo_dark.png" alt="IMD Fleet Services"/></div>
```

- [ ] **Step 5: Update `.mob-menu` for light-default**

Find:
```css
.mob-menu{display:none;position:fixed;inset:0;z-index:299;background:var(--bg-deep);flex-direction:column;align-items:flex-start;justify-content:center;padding:80px 48px 48px;gap:24px}
.mob-menu.open{display:flex}
.mob-menu a{font-family:var(--fh);font-size:20px;font-weight:700;color:var(--text-1)}
.mob-menu a:hover{color:var(--acc)}
```

Replace:
```css
.mob-menu{display:none;position:fixed;inset:0;z-index:299;background:#fff;flex-direction:column;align-items:flex-start;justify-content:center;padding:80px 48px 48px;gap:24px;border-top:1px solid var(--border)}
.mob-menu.open{display:flex}
.mob-menu a{font-family:var(--fh);font-size:20px;font-weight:700;color:var(--text-1)}
.mob-menu a:hover{color:var(--blue)}
```

- [ ] **Step 6: Update hero top padding** (nav is now 72px, was 88px)

Find:
```css
.hero .wrap{width:100%;padding-top:88px}
```

Replace:
```css
.hero .wrap{width:100%;padding-top:72px}
```

- [ ] **Step 7: Update `.logo-img-light` / `.logo-img-dark` CSS**

Find:
```css
.logo-img-light{display:none}
.logo-img-dark{display:block}
```

Replace:
```css
.logo-img-light{display:none}
.logo-img-dark{display:block}
.logo-img{width:clamp(120px,9vw,160px);height:auto;display:block;object-fit:contain}
```

- [ ] **Step 8: Verify nav visually**

Open `http://localhost:8000`. Nav should be white with dark text, navy "Fahrzeug anmelden" button. No color change on scroll (it just gets a slightly stronger shadow).

- [ ] **Step 9: Commit**

```bash
git add style.css index.html
git commit -m "Nav always-white, update CTA button to navy"
```

---

### Task 3: Hero — split-screen HTML + CSS

**Files:**
- Modify: `index.html:49-123` (hero section)
- Modify: `style.css:110-165` (hero + dashboard CSS)

- [ ] **Step 1: Rewrite hero section HTML in `index.html`**

Find the entire hero section (lines 49–123):
```html
<!-- ═════════════════════ HERO ═════════════════════ -->
<section class="hero" id="top">
  <div class="wrap">
    <div class="hero-grid">
      <div class="hero-copy">
        ...
      </div>
      <div class="hero-dash">
        <div class="hero-dash-card">
          ...
        </div>
      </div>
    </div>
  </div>
  <div class="trust-bar">
    ...
  </div>
</section>
```

Replace the entire hero section (from `<!-- HERO -->` comment through `</section>`) with:

```html
<!-- ═════════════════════ HERO ═════════════════════ -->
<section class="hero" id="top">
  <div class="hero-split">

    <!-- LEFT: white copy panel -->
    <div class="hero-copy">
      <div class="hero-eyebrow">
        <span class="hero-eyebrow-dot"></span>
        <span class="hero-eyebrow-text">WIR KAUFEN IHRE DIENST- UND FIRMENFAHRZEUGE</span>
      </div>
      <h1 class="hero-h1">
        Einfach.<br>
        Digital.<br>
        <span>Zuverlässig.</span>
      </h1>
      <p class="hero-sub">IMD Fleet Services kauft Ihre Dienst- und Firmenfahrzeuge bundesweit an — transparent, schnell und ohne Aufwand für Sie.</p>
      <div class="hero-btns">
        <button class="btn btn-primary btn-lg" onclick="goTo('anmelden')">Fahrzeug anbieten →</button>
        <button class="btn btn-ghost btn-lg" onclick="goTo('prozess')">Mehr erfahren →</button>
      </div>
      <div class="hero-kpi">
        <div class="hkpi"><div class="hkpi-val">48h</div><div class="hkpi-lbl">Angebot i.d.R.</div></div>
        <div class="hkpi"><div class="hkpi-val">24h</div><div class="hkpi-lbl">Abholung nach Zusage</div></div>
        <div class="hkpi"><div class="hkpi-val">100%</div><div class="hkpi-lbl">Kostenlos für Sie</div></div>
      </div>
    </div>

    <!-- RIGHT: beton photo -->
    <div class="hero-photo" aria-hidden="true"></div>

  </div>
  <div class="trust-bar">
    <div class="trust-inner">
      <div class="ti rev d1"><div class="ti-check">✓</div><div><div class="ti-label">Schnelle Abwicklung<span class="ti-sub">Angebot in 48h</span></div></div></div>
      <div class="ti rev d2"><div class="ti-check">✓</div><div><div class="ti-label">Kostenlose Abholung<span class="ti-sub">Bundesweit</span></div></div></div>
      <div class="ti rev d3"><div class="ti-check">✓</div><div><div class="ti-label">Direkte Auszahlung<span class="ti-sub">Nach Übergabe</span></div></div></div>
      <div class="ti rev d4"><div class="ti-check">✓</div><div><div class="ti-label">100% Sicherheit<span class="ti-sub">DSGVO-konform & fair</span></div></div></div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Rewrite hero CSS in `style.css`**

Find the hero CSS block (lines 110–165, from `.hero{` through the last `.hdc-*` rule):
```css
.hero{min-height:100vh;background:linear-gradient(...
...
.hdc-veh-status.hdc-muted{color:var(--text-3)}
```

Replace the entire block with:

```css
/* ══════════════ HERO ══════════════ */
.hero{display:flex;flex-direction:column;min-height:100vh}
.hero-split{display:grid;grid-template-columns:1fr 1fr;flex:1;min-height:calc(100vh - 64px)}

/* Left copy panel */
.hero-copy{background:linear-gradient(135deg,#f0f5fb 0%,#e8eef8 100%);padding:80px 64px 64px;display:flex;flex-direction:column;justify-content:center}

/* Right beton photo */
.hero-photo{background:url('new_background_header.jpeg') center/cover;position:relative}
.hero-photo::before{content:'';position:absolute;left:0;top:0;bottom:0;width:48px;background:linear-gradient(to right,#edf2f8,transparent);pointer-events:none}

/* Eyebrow badge */
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;margin-bottom:28px;background:var(--blue-bg);border:1px solid var(--blue-bd);border-radius:100px;padding:5px 14px;align-self:flex-start}
.hero-eyebrow-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;flex-shrink:0;animation:heDotPulse 3s ease-in-out infinite}
@keyframes heDotPulse{0%,100%{box-shadow:0 0 0 2px rgba(34,197,94,.15)}50%{box-shadow:0 0 0 5px rgba(34,197,94,.06)}}
.hero-eyebrow-text{font-family:var(--fh);font-size:10px;font-weight:700;color:var(--blue);letter-spacing:.10em;text-transform:uppercase}

/* H1 */
.hero-h1{font-family:var(--fh);font-size:clamp(38px,4vw,60px);font-weight:800;line-height:1.04;letter-spacing:-.04em;color:var(--text-1);margin-bottom:20px}
.hero-h1 span{color:var(--blue)}

/* Sub */
.hero-sub{font-size:16px;color:var(--text-2);line-height:1.75;max-width:460px;margin-bottom:32px}

/* Buttons */
.hero-btns{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:44px}

/* KPI strip */
.hero-kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border-radius:var(--r-md);overflow:hidden;border:1px solid var(--border);max-width:460px}
.hkpi{background:#fff;padding:16px 20px;transition:background .22s}
.hkpi:hover{background:var(--bg-s)}
.hkpi-val{font-family:var(--fh);font-size:22px;font-weight:800;color:var(--text-1);letter-spacing:-.035em}
.hkpi-lbl{font-family:var(--fh);font-size:9px;font-weight:600;color:var(--text-3);margin-top:4px;text-transform:uppercase;letter-spacing:.12em}

/* ══════════════ TRUST BAR ══════════════ */
.trust-bar{background:var(--bg-deep);border-top:1px solid rgba(255,255,255,.06)}
.trust-inner{max-width:1160px;margin:0 auto;padding:0 48px;display:grid;grid-template-columns:repeat(4,1fr)}
.ti{display:flex;align-items:center;gap:10px;padding:18px 16px;border-right:1px solid rgba(255,255,255,.08);transition:background .2s}
.ti:last-child{border-right:none}
.ti:hover{background:rgba(255,255,255,.03)}
.ti-check{width:24px;height:24px;background:rgba(200,216,232,.15);border:1px solid rgba(200,216,232,.2);border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#c8d8e8;flex-shrink:0;line-height:1}
.ti-label{font-family:var(--fh);font-size:11px;font-weight:700;color:#eef2f6;line-height:1.35}
.ti-sub{display:block;font-family:var(--fh);font-size:10px;font-weight:400;color:rgba(238,242,246,.5);margin-top:2px}
```

- [ ] **Step 3: Verify hero visually**

Open `http://localhost:8000`. You should see:
- Left panel: light blue-gray gradient, dark navy H1, blue "Einfach. Digital. **Zuverlässig.**" (last word in blue), two buttons, 3 KPI boxes
- Right panel: `new_background_header.jpeg` filling the full right half, IMD concrete logo visible
- Below: dark navy trust bar with 4 checkmark items

- [ ] **Step 4: Commit**

```bash
git add style.css index.html
git commit -m "Hero split-screen: white copy panel + beton photo"
```

---

### Task 4: Service + Prozess sections

**Files:**
- Modify: `style.css:250-299` (`.svc-*`, `.wf-*` blocks)

- [ ] **Step 1: Update Service section CSS**

Find and replace the `.svc-*` and `.included-card` block:
```css
.svc-ck{width:20px;height:20px;background:var(--acc-dim);border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--acc);flex-shrink:0;margin-top:3px;line-height:1}
.svc-lbl{font-family:var(--fh);font-size:14px;font-weight:700;color:var(--text-1)}
.svc-desc{font-size:13px;color:var(--text-2);margin-top:2px;line-height:1.6}
.included-card{background:var(--bg-deep);border:1px solid var(--border);border-radius:var(--r-2xl);padding:40px}
.ic-eyebrow{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--text-3);margin-bottom:14px}
.ic-h{font-family:var(--fh);font-size:22px;font-weight:800;color:var(--text-1);line-height:1.2;margin-bottom:6px;letter-spacing:-.02em}
.ic-h sup a{color:var(--acc);text-decoration:none;cursor:pointer;display:inline-flex}
.ic-h sup a:hover{color:var(--text-1)}
.ic-items{display:flex;flex-direction:column;gap:8px}
.ic-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg-card);border-radius:var(--r-md);border:1px solid var(--border)}
.ic-dot{width:5px;height:5px;border-radius:50%;background:var(--acc);flex-shrink:0}
.ic-item-text{font-size:13px;color:var(--text-2);font-weight:500}
.ic-foot{display:block;font-size:11px;color:var(--text-3);margin-top:16px;text-decoration:none;transition:color .2s}
.ic-foot:hover{color:var(--acc)}
```

Replace:
```css
.svc-ck{width:20px;height:20px;background:var(--blue-bg);border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--blue);flex-shrink:0;margin-top:3px;line-height:1}
.svc-lbl{font-family:var(--fh);font-size:14px;font-weight:700;color:var(--text-1)}
.svc-desc{font-size:13px;color:var(--text-2);margin-top:2px;line-height:1.6}
.included-card{background:var(--bg-deep);border:1px solid rgba(255,255,255,.08);border-radius:var(--r-2xl);padding:40px}
.ic-eyebrow{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(238,242,246,.5);margin-bottom:14px}
.ic-h{font-family:var(--fh);font-size:22px;font-weight:800;color:#fff;line-height:1.2;margin-bottom:6px;letter-spacing:-.02em}
.ic-h sup a{color:#c8d8e8;text-decoration:none;cursor:pointer;display:inline-flex}
.ic-h sup a:hover{color:#fff}
.ic-items{display:flex;flex-direction:column;gap:8px}
.ic-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,.06);border-radius:var(--r-md);border:1px solid rgba(255,255,255,.1)}
.ic-dot{width:5px;height:5px;border-radius:50%;background:#c8d8e8;flex-shrink:0}
.ic-item-text{font-size:13px;color:rgba(238,242,246,.75);font-weight:500}
.ic-foot{display:block;font-size:11px;color:rgba(238,242,246,.4);margin-top:16px;text-decoration:none;transition:color .2s}
.ic-foot:hover{color:#c8d8e8}
```

- [ ] **Step 2: Update Prozess/Workflow CSS**

Find the workflow step colors (`.wf-num-you`, `.wf-num-us`, `.wf-actor-you`, `.wf-actor-us`, `.wf-time`, `.wf-ico`):
```css
.wf-num-you{background:var(--acc-dim);color:var(--acc)}
.wf-num-us,.wf-num-done{background:var(--bg-card);color:var(--text-2)}
.wf-actor-you{background:var(--acc-dim);color:var(--acc);border:1px solid rgba(200,216,232,.15)}
.wf-actor-us,.wf-actor-done{background:var(--bg-card);color:var(--text-2);border:1px solid var(--border)}
.wf-ico{width:36px;height:36px;margin:4px 0;color:var(--acc);flex-shrink:0}.wf-ico svg{width:100%;height:100%}
.wf-time{font-family:var(--fh);font-size:11px;color:var(--acc);font-weight:600;margin-top:4px}
```

Replace:
```css
.wf-num-you{background:var(--navy);color:#fff}
.wf-num-us,.wf-num-done{background:var(--bg-s);color:var(--text-2);border:1px solid var(--border)}
.wf-actor-you{background:var(--navy);color:#fff;border:1px solid transparent}
.wf-actor-us,.wf-actor-done{background:var(--bg-card);color:var(--text-2);border:1px solid var(--border)}
.wf-ico{width:36px;height:36px;margin:4px 0;color:var(--blue);flex-shrink:0}.wf-ico svg{width:100%;height:100%}
.wf-time{font-family:var(--fh);font-size:11px;color:var(--blue);font-weight:600;margin-top:4px}
```

Also update `.wf-line-fill`:
```css
.wf-line-fill{height:100%;background:var(--acc);width:0;transition:width 1.5s var(--ease-out)}
```
Replace:
```css
.wf-line-fill{height:100%;background:var(--blue);width:0;transition:width 1.5s var(--ease-out)}
```

- [ ] **Step 3: Verify Service + Prozess visually**

Open `http://localhost:8000`. Scroll to Service section (light gray `#f5f8fc`). Checkmarks should be blue. The "Vollservice" card should have a dark navy background with light text. Scroll to Prozess — step badges should be navy on "Sie" steps.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "Light-mode styles for Service and Prozess sections"
```

---

### Task 5: Explainer Player — light theme

**Files:**
- Modify: `style.css:301-420` (`.mgp-*` block)

The player has hardcoded dark colors throughout. Update to a consistent dark-navy player that works in light mode context (the player stays dark by design — it's a contained dark component on a light page).

- [ ] **Step 1: Update player wrapper and stage backgrounds**

Find:
```css
.mgp-wrap{border:1px solid var(--border);border-radius:var(--r-2xl);overflow:hidden;background:var(--bg)}
.mgp-bg-intro{background:linear-gradient(135deg,var(--bg-deep) 0%,var(--bg-s) 100%)}
.mgp-bg-step1{background:linear-gradient(135deg,#1e2840 0%,#2a3a56 100%)}
.mgp-bg-step2{background:linear-gradient(135deg,#1c2840 0%,#283858 100%)}
.mgp-bg-step3{background:linear-gradient(135deg,#1a2640 0%,#263660 100%)}
.mgp-bg-step4{background:linear-gradient(135deg,#1e2a44 0%,#2c3e5c 100%)}
.mgp-bg-step{background:linear-gradient(135deg,#1e2840 0%,#2a3a56 100%)}
.mgp-bg-outro,.mgp-bg-end{background:linear-gradient(135deg,var(--bg-deep) 0%,var(--btn-bg) 100%)}
```

Replace:
```css
.mgp-wrap{border:1px solid var(--border);border-radius:var(--r-2xl);overflow:hidden;background:#1a2540}
.mgp-bg-intro{background:linear-gradient(135deg,#0f172a 0%,#1e2f52 100%)}
.mgp-bg-step1{background:linear-gradient(135deg,#1e2840 0%,#2a3a56 100%)}
.mgp-bg-step2{background:linear-gradient(135deg,#1c2840 0%,#283858 100%)}
.mgp-bg-step3{background:linear-gradient(135deg,#1a2640 0%,#263660 100%)}
.mgp-bg-step4{background:linear-gradient(135deg,#1e2a44 0%,#2c3e5c 100%)}
.mgp-bg-step{background:linear-gradient(135deg,#1e2840 0%,#2a3a56 100%)}
.mgp-bg-outro,.mgp-bg-end{background:linear-gradient(135deg,#0f172a 0%,#1a2540 100%)}
```

- [ ] **Step 2: Update player controls and buttons**

Find:
```css
.mgp-controls{display:flex;align-items:center;gap:12px;padding:12px 20px;border-top:2px solid rgba(238,242,246,.1);background:#171f33}
.mgp-btn{display:inline-flex;align-items:center;gap:6px;background:#243350;border:1px solid rgba(238,242,246,.18);color:var(--text-1);padding:8px 14px;border-radius:var(--r-md);font-family:var(--fh);font-size:12px;font-weight:600;cursor:pointer;transition:all .18s ease;box-shadow:0 1px 4px rgba(0,0,0,.4)}
.mgp-btn:hover{border-color:rgba(200,216,232,.35);background:#2d3d5c}
.mgp-btn-play{background:var(--acc);border:1px solid transparent;color:#0a0e14;font-weight:700;box-shadow:0 2px 10px rgba(200,216,232,.25)}
.mgp-btn-play:hover{background:#dce9f4;box-shadow:0 4px 16px rgba(200,216,232,.35)}
```

Replace:
```css
.mgp-controls{display:flex;align-items:center;gap:12px;padding:12px 20px;border-top:2px solid rgba(255,255,255,.08);background:#0f172a}
.mgp-btn{display:inline-flex;align-items:center;gap:6px;background:#1e2f52;border:1px solid rgba(255,255,255,.15);color:#eef2f6;padding:8px 14px;border-radius:var(--r-md);font-family:var(--fh);font-size:12px;font-weight:600;cursor:pointer;transition:all .18s ease;box-shadow:0 1px 4px rgba(0,0,0,.4)}
.mgp-btn:hover{border-color:rgba(200,216,232,.35);background:#253d5c}
.mgp-btn-play{background:#2563eb;border:1px solid transparent;color:#fff;font-weight:700;box-shadow:0 2px 10px rgba(37,99,235,.35)}
.mgp-btn-play:hover{background:#1d4ed8;box-shadow:0 4px 16px rgba(37,99,235,.45)}
```

- [ ] **Step 3: Update player content text tokens**

Find the `.mgp-kicker` and `.mgp-accent` lines:
```css
.mgp-kicker{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);margin-bottom:10px}
.mgp-accent-white,.mgp-accent{color:var(--acc)}
```

Replace:
```css
.mgp-kicker{font-family:var(--fh);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#c8d8e8;margin-bottom:10px}
.mgp-accent-white,.mgp-accent{color:#c8d8e8}
```

- [ ] **Step 4: Update timeline colors**

Find:
```css
.mgp-tl-fill{position:absolute;left:0;top:0;bottom:0;background:var(--acc);border-radius:2px;transition:width .3s var(--ease-out)}
.mgp-tl-tick.active,.mgp-tl-tick:hover{background:var(--acc);border-color:var(--acc)}
```

Replace:
```css
.mgp-tl-fill{position:absolute;left:0;top:0;bottom:0;background:#2563eb;border-radius:2px;transition:width .3s var(--ease-out)}
.mgp-tl-tick.active,.mgp-tl-tick:hover{background:#2563eb;border-color:#2563eb}
```

- [ ] **Step 5: Remove `[data-theme="light"] .mgp-wrap` pin (no longer needed)**

Find (around line 886):
```css
[data-theme="light"] .mgp-wrap{--bg:#1e2840;--bg-s:#243350;--bg-deep:#171f33;--bg-card:rgba(238,242,246,.06);--acc:#C8D8E8;--acc-dim:rgba(200,216,232,.18);--btn-bg:#253048;--text-1:#EEF2F6;--text-2:rgba(238,242,246,.55);--text-3:rgba(238,242,246,.28);--border:rgba(238,242,246,.10);--border-s:rgba(238,242,246,.06)}
```

Delete this entire line.

- [ ] **Step 6: Verify Explainer visually**

Scroll to Explainer section. The player should have a dark navy exterior, blue play button, dark interior slides. Controls bar at bottom is very dark.

- [ ] **Step 7: Commit**

```bash
git add style.css
git commit -m "Explainer player: explicit dark theme, blue play button"
```

---

### Task 6: Warum wir + Über uns sections

**Files:**
- Modify: `style.css:1-63` (`.wk-*`, `.ver-*`, `.allein-*`, `.ub-*`, `.founder-*`, `.prinzip-*`)
- Modify: `index.html` (Über uns section — add `about-office.jpg`)

- [ ] **Step 1: Update Warum wir comparison cards (`.wk-*`)**

Find:
```css
.wk-head.bad{background:rgba(238,242,246,.02)}
.wk-head.good{background:var(--acc-dim)}
.wk-ico.bad{background:rgba(238,242,246,.06);color:var(--text-3)}
.wk-ico.good{background:rgba(200,216,232,.15);color:var(--acc)}
.wk-dot.bad{background:rgba(238,242,246,.2)}
.wk-dot.good{background:var(--acc)}
```

Replace:
```css
.wk-head.bad{background:rgba(9,21,42,.02)}
.wk-head.good{background:var(--blue-bg)}
.wk-ico.bad{background:var(--bg-s);color:var(--text-3)}
.wk-ico.good{background:var(--blue-bg);color:var(--blue)}
.wk-dot.bad{background:var(--border)}
.wk-dot.good{background:var(--blue)}
```

- [ ] **Step 2: Update Vergleichstabelle (`.ver-tbl`)**

Find:
```css
.ver-tbl th{font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--text-3);background:var(--bg-deep)}
.ver-tbl th.best{color:var(--acc);background:rgba(200,216,232,.06)}
.ver-tbl th.old{color:var(--text-3)}
.ver-tbl td{color:var(--text-2);background:var(--bg-s)}
.ver-tbl td.best{background:rgba(200,216,232,.04)}
.ver-tbl td.old{background:var(--bg)}
```

Replace:
```css
.ver-tbl th{font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--text-3);background:var(--bg-deep);color:rgba(238,242,246,.6)}
.ver-tbl th.best{color:#c8d8e8;background:rgba(37,99,235,.15)}
.ver-tbl th.old{color:rgba(238,242,246,.4)}
.ver-tbl td{color:var(--text-2);background:var(--bg-s)}
.ver-tbl td.best{background:var(--blue-bg)}
.ver-tbl td.old{background:var(--bg)}
```

- [ ] **Step 3: Update Alleinstellungsmerkmale cards**

Find:
```css
.allein{display:flex;gap:16px;background:var(--bg-s);border:1px solid var(--border);border-radius:var(--r-lg);padding:22px}
```

No change needed — `var(--bg-s)` and `var(--border)` now resolve to light values.

- [ ] **Step 4: Update Über uns — HTML (add photo)**

In `index.html`, find the Über uns section (line ~933). Find the `.ub-intro-grid` div. The current grid has text on the right — add the `about-office.jpg` photo on the left.

Find the opening of `#ueber-uns`:
```html
<section class="section sec-dark" id="ueber-uns">
  <div class="wrap">
    <div class="ub-intro-grid">
```

This section already has a two-column grid (`.ub-intro-grid: 1fr 400px`). Look at the first `<div>` inside `.ub-intro-grid`. Add the photo as the second column (or replace the existing right column if it's just stats). 

Read lines 933–970 of `index.html` first to understand the exact structure, then wrap the existing left column in a photo+text structure:

After `<div class="ub-intro-grid">`, add before the first child:
```html
<div class="ub-photo-col">
  <img src="design-assets/about-office.jpg" alt="IMD Fleet Services Büro" class="ub-photo" loading="lazy">
</div>
```

- [ ] **Step 5: Add `.ub-photo-col` and `.ub-photo` CSS**

Add to the `/* ══════════════ ÜBER UNS ══════════════ */` section in `style.css`:
```css
.ub-photo-col{flex-shrink:0}
.ub-photo{width:100%;max-width:460px;border-radius:12px;object-fit:cover;display:block}
.ub-intro-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;margin-bottom:0}
```

- [ ] **Step 6: Remove `[data-theme="light"] #ueber-uns` pin**

Find (around line 888):
```css
[data-theme="light"] #ueber-uns{--bg:#1e2840;--bg-s:...}
```

Delete this entire line. (The section uses `.sec-dark` which sets `background:var(--bg-deep)` = #1a2540, correct regardless of theme.)

- [ ] **Step 7: Update Über uns internal CSS**

Find:
```css
.stat-num{font-family:var(--fh);font-size:44px;font-weight:800;color:var(--text-1);letter-spacing:-.04em;line-height:1}
.founder-quote{font-size:14px;color:var(--text-2);line-height:1.75;font-style:italic;border-left:2px solid var(--acc);padding-left:14px}
.prinzip-icon{width:42px;height:42px;border-radius:var(--r-lg);background:var(--acc-dim);border:1px solid rgba(200,216,232,.2);display:flex;align-items:center;justify-content:center;color:var(--acc);margin-bottom:2px;flex-shrink:0}
#ueber-uns [data-countup]{color:var(--acc)!important}
```

Replace:
```css
.stat-num{font-family:var(--fh);font-size:44px;font-weight:800;color:#fff;letter-spacing:-.04em;line-height:1}
.founder-quote{font-size:14px;color:rgba(238,242,246,.7);line-height:1.75;font-style:italic;border-left:2px solid #c8d8e8;padding-left:14px}
.prinzip-icon{width:42px;height:42px;border-radius:var(--r-lg);background:rgba(200,216,232,.12);border:1px solid rgba(200,216,232,.2);display:flex;align-items:center;justify-content:center;color:#c8d8e8;margin-bottom:2px;flex-shrink:0}
#ueber-uns [data-countup]{color:#c8d8e8!important}
```

- [ ] **Step 8: Verify both sections visually**

"Warum wir" section: comparison cards should have blue accents, table header dark navy with light text. "Über uns" section: office photo left, text right, all on dark background — looks rich and professional.

- [ ] **Step 9: Commit**

```bash
git add style.css index.html
git commit -m "Warum wir light tokens, Über uns dark section with office photo"
```

---

### Task 7: Expertise + Zielgruppe + Rechner + FAQ

**Files:**
- Modify: `style.css` (stat display, persona cards, slider, accordion)

- [ ] **Step 1: Update Expertise stat display**

Find `.stat-num` (already updated in Task 6 for Über uns). Also look for any inline styles on stat numbers in `index.html` — they use `color:var(--acc)` for the accent. These will now render as blue (#2563eb) which is correct.

In `index.html` around the expertise section (line ~1026), the stats likely use `data-countup` attributes. Verify that accent numbers render in blue.

No CSS change needed — `var(--acc)` = #2563eb (blue) in light mode.

- [ ] **Step 2: Update Zielgruppe persona cards**

Search `style.css` for `.zg-` classes. If they exist, update `var(--acc)` references to use blue. If persona cards are built with generic `.bg-card`/`.border` classes, no change needed — tokens handle it.

```bash
grep -n "\.zg-" style.css
```

If `.zg-*` classes reference `var(--acc)` directly for icons, change to `var(--blue)`.

- [ ] **Step 3: Update Rechner (Zeitrechner) slider**

Find slider-related CSS. Search:
```bash
grep -n "slider\|rechner\|range\|accent-color" style.css
```

Find `accent-color` line. Ensure it reads:
```css
accent-color: var(--blue);
```

Also find the result/output box:
```css
/* result box */
background:var(--acc-dim); /* or similar */
```

Replace to use:
```css
background: var(--blue-bg);
border: 1px solid var(--blue-bd);
```

And the result number color to `var(--blue)` or `var(--text-1)` (weight 800).

- [ ] **Step 4: Update FAQ accordion**

Find `.faq-*` or `.acc-*` CSS classes:
```bash
grep -n "\.faq\|\.acc-" style.css
```

Update:
- Open-state left border: `border-left: 3px solid var(--blue)`
- Chevron icon color: `color: var(--blue)`
- Active item background: `background: #fff` (was dark)
- Question text: `color: var(--text-1)` weight 600
- Answer text: `color: var(--text-2)`

- [ ] **Step 5: Verify Expertise → FAQ visually**

Scroll through each section. Stats in Expertise should be large dark navy numbers. Rechner slider thumb should be blue. FAQ accordion items should be white cards with blue left border when open.

- [ ] **Step 6: Commit**

```bash
git add style.css
git commit -m "Light-mode styles: Expertise, Zielgruppe, Rechner, FAQ"
```

---

### Task 8: Anmelden form + Footer

**Files:**
- Modify: `style.css` (form fields on dark bg, footer)

- [ ] **Step 1: Update Anmelden form section**

Find form field CSS. Search:
```bash
grep -n "\.form-\|\.field-\|\.input-\|#anmelden" style.css
```

The Anmelden section uses `.sec-light` (or `.section`) background. Per spec, it should be `--bg-deep` (dark). Check `index.html` line ~1215:
```html
<section class="section sec-light" id="anmelden">
```

Change class in HTML:
```html
<section class="section sec-dark" id="anmelden">
```

Then update form field CSS for dark background:
```css
/* Form fields on dark background */
#anmelden .form-field,
#anmelden input,
#anmelden select,
#anmelden textarea {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff;
  border-radius: 6px;
}
#anmelden input::placeholder,
#anmelden textarea::placeholder {
  color: rgba(255,255,255,0.35);
}
#anmelden .btn-primary {
  background: var(--blue);
  border-color: transparent;
}
#anmelden .btn-primary:hover {
  background: #1d4ed8;
}
#anmelden .h2,
#anmelden .eyebrow,
#anmelden .lead {
  color: #fff;
}
#anmelden .eyebrow { color: rgba(200,216,232,.8); }
#anmelden .lead { color: rgba(255,255,255,.65); }
```

- [ ] **Step 2: Update Footer CSS**

Search for footer CSS:
```bash
grep -n "\.footer\|footer " style.css
```

Find footer block and update background to `var(--bg-footer)` (#0f172a):
```css
footer { background: #0f172a; }
.footer-col-title { color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 16px; }
.footer-link, footer a { color: #94a3b8; transition: color .2s; }
.footer-link:hover, footer a:hover { color: #fff; }
.footer-divider { border-top: 1px solid rgba(255,255,255,.06); }
.footer-copy { color: #475569; font-size: 12px; }
```

In `index.html`, find the footer logo img tag and ensure it uses `logo_light.png` (white version):
```html
<img src="logo_light.png" alt="IMD Fleet Services" ...>
```

- [ ] **Step 3: Verify Anmelden + Footer visually**

Anmelden section should now be dark navy with light-bordered form fields and a blue submit button. Footer should be very dark (#0f172a) with muted gray links.

- [ ] **Step 4: Commit**

```bash
git add style.css index.html
git commit -m "Anmelden dark form section, footer dark background"
```

---

### Task 9: Clean up obsolete light-mode overrides

**Files:**
- Modify: `style.css` (remove old `[data-theme="light"]` block, verify `[data-theme="dark"]` works)

- [ ] **Step 1: Identify what's left in `[data-theme="light"]` block**

Read `style.css` lines 828–890. The block contains overrides for: body, scrollbar, nav, logo swap, buttons, theme-pill, hero, hdc-*, trust bar, mob-menu, tags, h2, mgp-wrap pin (already removed), #ueber-uns pin (already removed).

- [ ] **Step 2: Remove the entire `[data-theme="light"]` block**

Delete lines from `[data-theme="light"]{` through the end of the block (the closing `}` for `#ueber-uns`). These overrides are no longer needed because light is now the default.

Keep the `[data-theme="dark"]` block added in Task 1.

- [ ] **Step 3: Add dark mode nav override**

In the `[data-theme="dark"]` block, add:
```css
[data-theme="dark"] nav{background:#1a2540;border-bottom-color:rgba(255,255,255,.08)}
[data-theme="dark"] nav.sc{background:#1a2540}
[data-theme="dark"] .nav-cta{background:#253048;color:#c8d8e8;border-color:rgba(200,216,232,.2)}
[data-theme="dark"] .nav-links a{color:rgba(238,242,246,.55)}
[data-theme="dark"] .nav-links a:hover{color:#eef2f6}
[data-theme="dark"] .mob-menu{background:#1a2540}
[data-theme="dark"] .mob-menu a{color:#eef2f6}
[data-theme="dark"] .hero-copy{background:linear-gradient(135deg,#1e2840 0%,#243350 100%)}
[data-theme="dark"] .hero-photo::before{background:linear-gradient(to right,#1e2840,transparent)}
[data-theme="dark"] .hero-h1{color:#eef2f6}
[data-theme="dark"] .hero-h1 span{color:#c8d8e8}
[data-theme="dark"] .hero-sub{color:rgba(238,242,246,.55)}
[data-theme="dark"] .hkpi{background:#243350}
[data-theme="dark"] .hkpi:hover{background:rgba(238,242,246,.04)}
```

- [ ] **Step 4: Test dark mode toggle**

Click the moon icon in the nav. The page should switch to dark navy. Click the sun icon — it should return to light mode. Both modes should look reasonable.

- [ ] **Step 5: Final full-page visual check**

Start server fresh:
```bash
node server.js
```

Scroll through all 12 sections in light mode. Checklist:
- [ ] Nav: white, sticky, dark navy CTA button
- [ ] Hero: split-screen, beton visible right, KPI strip
- [ ] Trust Bar: dark navy, 4 checkmarks
- [ ] Service (#f5f8fc): blue checkmarks, dark "Vollservice" card
- [ ] Prozess (white): navy step badges, blue icons
- [ ] Explainer (white bg): dark player contained within
- [ ] Warum wir (#f5f8fc): blue accent cards
- [ ] Über uns (dark): office photo left, text right
- [ ] Expertise (white): large stats, partner logos
- [ ] Zielgruppe (#f5f8fc): clean persona cards
- [ ] Rechner (white): blue slider
- [ ] FAQ (#f5f8fc): white accordion, blue open-state
- [ ] Anmelden (dark): form on dark bg, blue submit
- [ ] Footer (very dark): gray links

- [ ] **Step 6: Test on mobile (resize browser to 375px)**

Check hero: right panel should stack below left panel, full width. KPI strip should become single column. Trust bar should wrap.

- [ ] **Step 7: Final commit**

```bash
git add style.css index.html
git commit -m "Remove obsolete light overrides, add dark mode toggle support"
```

---

## Mobile Responsive Fixes

### Task 10: Hero + Trust Bar mobile

**Files:**
- Modify: `style.css` (hero mobile breakpoints)

- [ ] **Step 1: Add hero mobile breakpoint**

Find the existing `@media(max-width:860px)` block and add/update hero rules:

```css
@media(max-width:860px){
  .hero-split{grid-template-columns:1fr;min-height:auto}
  .hero-copy{padding:96px 32px 48px}
  .hero-photo{height:260px;order:2}
  .hero-photo::before{width:100%;height:40px;top:0;bottom:auto;background:linear-gradient(to bottom,#f0f5fb,transparent)}
  .trust-inner{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:600px){
  .hero-h1{font-size:clamp(30px,8vw,38px)}
  .hero-copy{padding:80px 24px 40px}
  .hero-btns{flex-direction:column;align-items:stretch}
  .hero-btns .btn{text-align:center;justify-content:center}
  .hero-kpi{grid-template-columns:1fr}
  .trust-inner{grid-template-columns:1fr;padding:0 24px}
}
```

- [ ] **Step 2: Verify on mobile viewport**

Resize browser to 375px width. Hero left panel should show full-width, beton photo below it as a banner-height image. Trust bar items should stack.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "Hero mobile responsive: stack columns, photo below"
```
