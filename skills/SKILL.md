---
name: webdesign-pro
description: Master-level web design skill for creating stunning, production-ready websites and UI. Use this skill whenever the user asks to design or build a website, landing page, portfolio, SaaS UI, app interface, marketing page, or any web product that needs to look visually exceptional. Trigger also when the user mentions "redesign", "UI/UX", "make it beautiful", "modern design", "professional look", "pixel perfect", or asks to improve the visual quality of any web interface. This skill covers visual strategy, layout systems, typography, color theory, component design, interaction design, and full implementation in HTML/CSS/JS or React. Always use this skill — even for "quick" design requests — because every pixel matters.
---

# Web Design Pro Skill

You are a senior product designer AND frontend engineer. Your work is indistinguishable from top-tier design agencies. You ship beautiful, functional, production-ready web interfaces — not prototypes, not lorem ipsum, not placeholder junk.

---

## Phase 1: Design Strategy (Before Writing a Single Line of Code)

Ask yourself (or the user) these questions before picking up a tool:

### 1. Context & Purpose
- What does this product/site DO? Who uses it?
- What emotion should it evoke? (Trust? Excitement? Calm? Power?)
- What's the ONE thing the user should feel or do when they land?

### 2. Visual Identity Direction
Pick a lane and commit fully. Examples:

| Direction | Feel | Key Techniques |
|-----------|------|----------------|
| **Luxury / Editorial** | Premium, slow, intentional | Serif display fonts, generous whitespace, muted palettes, full-bleed images |
| **Brutalist / Raw** | Confident, unconventional | High contrast, heavy borders, grid disruption, monospace |
| **Glassmorphism / Soft** | Modern, airy, tech | Blur layers, translucency, soft gradients, rounded corners |
| **Kinetic / Bold** | Energy, youth, startup | Motion-heavy, saturated colors, oversized type |
| **Minimal / Swiss** | Clarity, professionalism | Grid-strict, neutral palette, functional typography |
| **Dark Luxe / Neon** | Futuristic, night-mode native | Near-black background, neon accents, glows |
| **Organic / Natural** | Warm, human, approachable | Earth tones, irregular shapes, hand-drawn elements |
| **Retro / Nostalgic** | Personality, charm | Distressed textures, period-accurate type, warm palettes |

**Never mix directions randomly.** Pick one and execute with precision.

### 3. Competitive Differentiation
What makes this design UNFORGETTABLE? Identify the one signature element:
- A micro-interaction that delights
- A typography pairing no one expects
- A layout that breaks convention intentionally
- A color accent that owns the screen

---

## Phase 2: Design System Setup

Every great design starts with a solid system. Define these FIRST:

### Typography Scale
```css
/* Pick 1-2 fonts MAX. One display, one body. */
/* Display: personality font — Playfair, Syne, Archivo Black, Monument Extended, etc. */
/* Body: legibility font — DM Sans, Lato, Source Serif, etc. */

--font-display: 'Syne', sans-serif;
--font-body: 'DM Sans', sans-serif;

--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
--text-6xl:  3.75rem;   /* 60px */
--text-7xl:  4.5rem;    /* 72px */
--text-hero: clamp(3rem, 8vw, 7rem); /* Fluid hero */
```

### Color System
```css
/* PRIMARY: 1 brand color — distinctive, intentional */
/* NEUTRAL: grays that don't feel sterile */
/* ACCENT: 1 pop color for CTA and highlights */
/* SURFACE: background layers (3 levels minimum) */

--color-brand:    #FF5C35;   /* Example: bold coral */
--color-accent:   #FFD166;   /* Example: warm gold */
--color-bg:       #0A0A0F;   /* Deep dark */
--color-surface:  #13131A;   /* Card surface */
--color-border:   #1E1E2E;   /* Subtle border */
--color-text:     #F0F0F5;   /* Primary text */
--color-muted:    #7A7A9D;   /* Secondary text */
```

### Spacing System (8px base grid)
```css
--space-1:  0.25rem;   /* 4px */
--space-2:  0.5rem;    /* 8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */
```

### Radius & Shadow
```css
--radius-sm:  4px;
--radius-md:  8px;
--radius-lg:  16px;
--radius-xl:  24px;
--radius-full: 9999px;

--shadow-sm:  0 1px 3px rgba(0,0,0,0.3);
--shadow-md:  0 4px 16px rgba(0,0,0,0.4);
--shadow-lg:  0 16px 48px rgba(0,0,0,0.5);
--shadow-glow: 0 0 40px rgba(255, 92, 53, 0.25); /* Brand color glow */
```

---

## Phase 3: Layout Patterns

### Hero Sections
Never use a centered headline + subtext + button as your only option. Vary:
- **Split layout**: Text left, visual right (or reversed)
- **Full-bleed**: Background video/image, overlay text
- **Oversized type**: Giant letters that bleed off screen
- **Interactive**: Canvas animation, particle field, 3D element
- **Asymmetric grid**: Text off-center, image breaking the fold

### Navigation
- Sticky nav with blur backdrop: `backdrop-filter: blur(16px)`
- Mobile: slide-in drawer, NOT a dropdown
- Logo left, links center (desktop), CTA button right
- Active state must be visible and distinctive

### Cards
- Never flat white rectangles on white backgrounds
- Add: subtle border, glass effect, or colored gradient top
- Hover: lift with box-shadow AND slight translateY(-4px)
- Content hierarchy: label → title → body → action

### Grid Systems
```css
/* 12-column grid, max container width */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 5vw, 4rem);
}

.grid-12 { display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--space-6); }
.col-4 { grid-column: span 4; }
.col-6 { grid-column: span 6; }
.col-8 { grid-column: span 8; }
```

---

## Phase 4: Motion & Interaction Design

### Core Principles
- Motion should have **meaning**: reveal, transition, respond
- Prefer **CSS transitions** for hover states (faster, no JS)
- Use **JS animations** only for scroll triggers and complex sequences
- Timing: `ease-out` for entering elements, `ease-in` for exiting

### Essential Micro-interactions
```css
/* Button hover */
.btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
.btn:active {
  transform: translateY(0);
}

/* Link underline animation */
.nav-link {
  position: relative;
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0;
  width: 0; height: 2px;
  background: var(--color-brand);
  transition: width 0.3s ease;
}
.nav-link:hover::after { width: 100%; }

/* Card lift */
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
}
```

### Scroll-triggered Animations (JS)
```javascript
// Intersection Observer — fade in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
```
```css
[data-animate] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
[data-animate].visible {
  opacity: 1;
  transform: translateY(0);
}
/* Staggered: add data-delay="0.1", "0.2", etc. and read with JS */
```

### Loading States
- Skeleton screens > spinners for content placeholders
- Optimistic UI: update state before API returns
- Progress indicators for multi-step flows

---

## Phase 5: Component Library

### Buttons
```css
/* Primary */
.btn-primary {
  background: var(--color-brand);
  color: white;
  padding: 0.75rem 1.75rem;
  border-radius: var(--radius-full);
  font-weight: 600;
  letter-spacing: 0.01em;
  border: none;
  cursor: pointer;
}

/* Ghost */
.btn-ghost {
  background: transparent;
  border: 1.5px solid var(--color-border);
  color: var(--color-text);
  padding: 0.75rem 1.75rem;
  border-radius: var(--radius-full);
}
.btn-ghost:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
}
```

### Form Inputs
```css
.input {
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  color: var(--color-text);
  font-size: var(--text-base);
  width: 100%;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.input:focus {
  outline: none;
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(255,92,53,0.15);
}
.input::placeholder { color: var(--color-muted); }
```

### Badges & Tags
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.badge-brand { background: rgba(255,92,53,0.15); color: var(--color-brand); }
.badge-success { background: rgba(34,197,94,0.15); color: #22c55e; }
```

---

## Phase 6: Responsive Design

### Breakpoints
```css
/* Mobile first */
/* sm:  640px  — large phones */
/* md:  768px  — tablets */
/* lg:  1024px — laptops */
/* xl:  1280px — desktops */
/* 2xl: 1536px — wide screens */

@media (max-width: 768px) {
  /* Stack columns, increase tap targets (min 44px), hide decorative elements */
  /* Hero font: clamp(2rem, 8vw, 4rem) */
  /* Navigation: hamburger menu */
  /* Cards: full-width */
}
```

### Mobile-Specific Rules
- Tap targets: minimum 44×44px
- No hover-dependent interactions (provide tap alternatives)
- Bottom navigation for apps (thumb-reachable)
- Reduce motion for `prefers-reduced-motion`
- Test with real device OR Chrome DevTools device mode

---

## Phase 7: Performance & Polish

### Image Optimization
- Use `<img loading="lazy">` for below-fold images
- Provide `width` and `height` attributes to prevent layout shift
- Use WebP format when possible
- CSS gradients instead of simple gradient images

### Font Loading
```html
<!-- Preconnect for Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- Add display=swap to avoid FOIT -->
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
```

### Critical CSS Patterns
```css
/* Prevent layout shift */
img { display: block; max-width: 100%; height: auto; }

/* Smooth scrolling */
html { scroll-behavior: smooth; }

/* Better font rendering */
body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

/* Box sizing reset */
*, *::before, *::after { box-sizing: border-box; }

/* Remove default margin */
body, h1, h2, h3, h4, p, figure, blockquote, dl, dd { margin: 0; }
```

---

## Phase 8: Accessibility Baseline

Non-negotiable rules:
- **Color contrast**: WCAG AA minimum (4.5:1 for text, 3:1 for large text)
- **Focus states**: Never `outline: none` without a replacement
- **Alt text**: All meaningful images
- **ARIA labels**: All icon-only buttons
- **Keyboard navigation**: Tab order must be logical
- **Screen reader**: Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`)

```css
/* Accessible focus ring */
:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 3px;
}
```

---

## Fonts to Use (by mood)

| Mood | Display Font | Body Font |
|------|-------------|-----------|
| Bold/Modern | Syne, Archivo Black, Space Grotesk | DM Sans, Inter |
| Luxury/Editorial | Playfair Display, Cormorant | Lato, Source Serif 4 |
| Techy/Futuristic | Orbitron, Rajdhani | JetBrains Mono, Fira Code |
| Friendly/Startup | Nunito, Poppins | Open Sans, Rubik |
| Brutalist | Monument Extended (local), IBM Plex | IBM Plex Mono |
| Classic/Timeless | EB Garamond, Libre Baskerville | Libre Franklin |
| Retro | VT323, Press Start 2P | Inconsolata |

---

## Anti-Patterns to NEVER Use

❌ Purple gradient on white background (overused AI default)  
❌ Inter + gray text on white + rounded-2xl cards (generic SaaS look)  
❌ Emoji as design elements in professional contexts  
❌ Full-page background: pure white (#fff) or pure black (#000) — use near-white or near-black  
❌ Box shadow on every element  
❌ Animations that serve no purpose  
❌ 8 different font sizes without a scale  
❌ Mixing 3+ typefaces  
❌ CTA buttons that look like links  
❌ Form labels that disappear on focus (placeholder-only labels)  
❌ Footer with just "© 2024" and nothing else  
❌ Navigation with 7+ items (use dropdowns or restructure IA)  

---

## Checklist Before Shipping

- [ ] Typography scale consistent across all elements
- [ ] Color contrast passes WCAG AA
- [ ] All interactive elements have hover AND focus states
- [ ] Responsive: tested at 375px, 768px, 1280px
- [ ] No orphaned words in headlines (use `&nbsp;` or `max-width`)
- [ ] Images have alt text
- [ ] Loading states for async content
- [ ] Animations respect `prefers-reduced-motion`
- [ ] CTA is above the fold on mobile
- [ ] Page title and meta description set
- [ ] Favicon present
- [ ] No console errors

---

## Quick Reference: Hero Section Template

```html
<section class="hero">
  <div class="container">
    <div class="hero-eyebrow">
      <span class="badge badge-brand">New · Version 2.0</span>
    </div>
    <h1 class="hero-title">
      The headline that<br>
      <span class="text-brand">changes everything.</span>
    </h1>
    <p class="hero-subtitle">
      One powerful sentence. What the product does. Who it's for. No fluff.
    </p>
    <div class="hero-actions">
      <a href="#" class="btn btn-primary">Get Started Free →</a>
      <a href="#" class="btn btn-ghost">See how it works</a>
    </div>
  </div>
  <!-- Background: gradient mesh, SVG pattern, or canvas animation -->
  <div class="hero-bg" aria-hidden="true"></div>
</section>
```

---


