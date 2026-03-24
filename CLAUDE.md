# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TeraFuhr is a German B2B SaaS landing page for a fleet vehicle purchase service (Flottenankauf). It is a **single-file, zero-dependency static HTML application** — no build system, no package manager, no compilation step.

## Running Locally

```bash
# Serve the file locally (recommended over file:// for relative resource loading)
python3 -m http.server 8000
# Then open: http://localhost:8000/terafuhr%20%284%29.html
```

No installation or build step required. The file is production-ready as-is.

## Architecture

Everything lives in a single file: `terafuhr (4).html` (~2840 lines).

**Structure within the file:**
1. `<head>` — Google Fonts CDN (Sora, DM Sans), embedded `<style>` tag with the full design system
2. `<body>` — All HTML sections in order: Nav → Hero → Trust Bar → Process Steps → Interactive Carousel → Services → FAQ → Calculator
3. Closing `<script>` tag — all JavaScript (Intersection Observer scroll reveals, carousel logic, FAQ accordion, car brand/model dropdown, toast notifications)

**Design system (FLOTTIQ v5)** is defined via CSS custom properties at the top of the `<style>` block:
- Colors: `--navy`, `--blue`, `--green`, `--amber`, `--red`
- Typography: Sora (headings), DM Sans (body)
- Container: max-width 1160px, 48px padding

**Key JavaScript patterns:**
- `IntersectionObserver` for scroll-triggered reveal animations
- `requestAnimationFrame` for the 4-slide animated carousel (`.mgp-wrap`)
- Global functions `window.mgpToggle` / `window.mgpGoTo` control the carousel
- Car brand/model dropdown dynamically switches to a text input when "Sonstiges" is selected

## Key Sections & CSS Classes

| Section | Key class(es) |
|---|---|
| Navigation | `.nav`, `.nav__burger` |
| Hero | `.hero`, `.hero__kpi` |
| Trust bar | `.trust-bar` |
| 4-step process | `.steps`, `.step` |
| Animated carousel | `.mgp-wrap`, `.mgp-slide` |
| Services | `.services-grid` |
| FAQ accordion | `.faq`, `.faq__item` |
| Time calculator | `.zeitrechner` |

## Deployment

Drop the single HTML file onto any static host (Netlify, Vercel, GitHub Pages, S3, etc.). No build step needed.
