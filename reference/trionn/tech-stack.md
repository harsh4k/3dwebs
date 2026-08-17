---
tags: [reference, research, tech-stack]
---

# Trionn — Tech Stack

**URL:** https://trionn.com · **Audited:** 2026-08-17
**Method:** public HTML/CSS payload, response headers, `robots.txt`, `sitemap.xml`, and headless-browser capture. No authentication, paywall, or access control was bypassed.

Archived source in `html/`. Related: [[interactions]] · [[breakdown]] · [[notes]]

---

## Verdict table

| Layer | Finding | Confidence | Evidence |
|---|---|---|---|
| Framework | **Next.js, App Router** | Certain | `X-Powered-By: Next.js`, `x-nextjs-prerender: 1`, `__next_f` streaming payload, `next-size-adjust` meta |
| Bundler | **Turbopack** | Certain | `_next/static/chunks/turbopack-0nz662b_cli3l.js` |
| Rendering | **SSG / prerendered, ISR-ish** | High | `x-nextjs-cache: HIT`, `x-nextjs-stale-time: 300`, `Cache-Control: s-maxage=31536000` |
| Hosting | **Self-hosted, Apache 2.4.52 on Ubuntu** | Certain | `Server: Apache/2.4.52 (Ubuntu)` — **not Vercel** |
| Styling | **Tailwind CSS v4** | Certain | v4-only custom props: `--tw-translate-z`, `--tw-gradient-position`, `--tw-drop-shadow-size`; 40 `@supports` blocks |
| Smooth scroll | **Lenis** | High | 6 references in payload |
| Animation | **GSAP** | High | referenced in payload; GSAP appears in their own awards strip |
| WebGL | **OGL** — *not* three.js | High | 9 references. OGL is ~10 KB gzipped vs three.js ~150 KB |
| Carousel | **Swiper** | Certain | 25 references |
| Forms | **reCAPTCHA v3** | Certain | `recaptcha/api.js?render=6Lcy…` |
| Scheduling | **Calendly** | Certain | `calendly.com/hello-trionn/30min` |
| Analytics | **GA4** | Certain | 11 `gtag` references |
| Consent | Custom cookie banner | Certain | Visible in capture |

## Typography — four self-hosted faces

Loaded via `next/font/local`, served as `.woff2` from `_next/static/media/`:

| Face | CSS var | Licence | Role |
|---|---|---|---|
| **Familjen Grotesk** Variable | `--font-familjen` | Open (OFL) | Primary UI/body — 9 uses |
| **Neue Haas Display** Roman | `--font-neue` | **Commercial** | Display headings — 4 uses |
| **Martian Mono** Light | `--font-martian` | Open (OFL) | Labels, eyebrows, CTAs |
| **PP Editorial New** Ultralight | `--font-ppeditorial` | **Commercial** (Pangram Pangram) | Editorial accent |

Two of four are paid licences. Relevant to our own font decision — see [[../../Design|Design]].

## Design-system values, read from their CSS

**Type scale** — fluid `clamp()` with a `vw` middle term:
```
clamp(5rem,    9.164vw, 10rem  )   display XL
clamp(3.75rem, 6.614vw,  6.25rem)  display L
clamp(3.5rem,  6.349vw,  6rem  )   display M
clamp(2.5rem,  6.283vw,  5.938rem) display S
```

**Breakpoints** — Tailwind defaults (640 / 768 / 1024 / 1280 / 1536) plus bespoke 440, 600, 601, 677, 1023, 1025, 1441.

**Easing** — the signature curve is `cubic-bezier(.22, 1, .36, 1)` (**easeOutQuint**). The rest are Tailwind stock (`.4,0,.2,1`, `.4,0,1,1`, `0,0,.2,1`).

**Durations** cluster at **0.3s / 0.35s / 0.4s / 0.5s**, with outliers at 0.1, 0.15, 0.7, 0.9, 1s.

**Techniques in use:** `will-change` ×13, `backdrop-filter` ×9, `perspective` ×6, `mix-blend-mode` ×6, `aspect-ratio` ×5, `@keyframes` ×4, `transform-style`, `container-type`, `clip-path`.

## SEO & IA

- Sitemap: `/` (1.0) · `/work` (0.9, weekly) · `/about` `/services` `/trionn-story` (0.8) · `/contact` (0.7, yearly)
- `robots.txt` **allows `/work` but disallows `/work/`** — the index is indexed, individual case pages are not
- Testimonial headshots explicitly blocked from Googlebot-Image
- Dynamic OG image via App Router (`opengraph-image.jpg?opengraph-image.14tq78v25x4aa.jpg`)
- `theme-color: #040508`
- A ~29-term keywords meta tag — legacy, ignored by search engines

## What this means for Coffee Digital

1. **A site of this class does not need three.js.** The most technically ambitious element on the page — the hero — runs on a ~10 KB library. This is the strongest argument in our stack decision.
2. **Tailwind v4 + CSS custom properties is the validated styling path.** Same as our plan.
3. **`easeOutQuint` is the premium-feel default.** We adopt the curve, not their timings.
4. **They self-host on Apache.** Nothing forces Vercel; our choice stands on convenience, not necessity.
5. **They ship two commercial font licences.** Ours can be all-open — see [[../../Design|Design]].
6. **`Disallow: /work/`** is a telling admission: their case pages carry no SEO weight. Our modal approach (no separate routes) reaches the same outcome without the crawl waste.
