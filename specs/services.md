---
tags: [page-spec, services]
---

# Services

Route: `/services` · Upstream: [[../PRD|PRD]] · [[../Design|Design]] · [[../brand/brand-audit#Services — S1 slide 2, three pillars, verbatim|brand-audit]]

## Objective

Show the full range — from SEO to iOS apps to outdoor print — and make it clear this is a **full-stack partner**, not a single-discipline shop.

## User intent

*"I have a specific need. Do they do it, and do they do enough else that I could keep using them?"*

Two questions in one: capability match, and breadth for future work.

## The lucky finding

The deck gives **structure** — three pillars, twelve items. The legacy site gives **voice** — eight service descriptions in Coffee Digital's own words.

Combining them means this page can be written **almost entirely from confirmed copy**. Very little needs to be proposed. From [[../brand/brand-audit#✅ Confirmed|the audit]]:

> **development** — "what you believe is not possible to do in digital; we can do it, just like that"
> **branding** — "do you need your brand to look great, be recognized and positioned? exactly, call us"
> **e-commerce** — "do you know what's the best offer we have? start selling for real, with us"
> **content development** — "we can turn a Monday into a Friday because we know how to tell a story, so we can make everything happen in where nothing happens"

This voice is the reason [[../PRD#7 Brand positioning|the PRD recommends the legacy register]]. It is specific, funny, and unmistakably human — the opposite of generated copy.

## Content hierarchy

1. What they do, in one line
2. The three pillars, in depth
3. Proof that they can deliver → route to `/work`
4. Start a conversation → `/contact`

---

## §1 — Header

| | |
|---|---|
| Content | `services` (h1). The confirmed positioning line from deck slide 2 |
| Layout | Left-aligned, generous space, stripe beneath |
| Visual | `--paper`, `--fs-display-l` |

> Whether you need a stunning campaign, a smart app, or a complete brand revamp, we're your full-stack digital partner — combining creativity, code, and strategy to bring your vision to life.

---

## §2 — The three pillars

The core of the page. Three sections, each pinned on desktop while its items advance.

| Pillar | Items (verbatim, deck slide 2) | Voice source |
|---|---|---|
| **Digital Marketing & Strategy** | SEO (Search Engine Optimization) · SEM (Search Engine Marketing) · Email Campaigns & Display Banners · Performance Marketing | Legacy `seo`, `strategy & creativity` ✅ |
| **Creative & Branding** | Logo Design & Brand Identity · Video Production & Animation · Brochure, Leaflet, and Catalog Design · Print & Outdoor Advertising | Legacy `branding`, `design`, `content development` ✅ |
| **Technology & Development** | Website Design & Development · Mobile App Development (iOS & Android) · IT Servicing & Support · Dedicated Resource/Team Provider | Legacy `development`, `ux/ui`, `e-commerce` ✅ |

| | |
|---|---|
| Layout | Desktop: pillar title pins left while its four items scroll past right. Mobile: linear stack |
| Visual | Ground walks one stop per pillar — `--paper` → `--cream` → `--peach`. **The Roast Ramp is doing structural work here**, giving each pillar its own chapter |
| Components | `Stripe`, `Reveal`, `Link` |

### Motion — pillar pin

```
Trigger:            Pillar section reaches top of viewport
Animation:          Pillar title pins; items advance past it, each
                    mask-revealing on entry
Duration:           Scrubbed for the pin; --dur-base per item reveal
Easing:             --ease-linear (pin) / --ease-out-quint (items)
Scroll relationship: Pinned for the section's height
Desktop:            Full pin
Tablet:             Pin with reduced duration
Mobile:             NO PIN. Linear stack with per-item reveal — pinning on a
                    small viewport steals the whole screen and disorients
Purpose:            Holds the pillar name in view while its items are read, so
                    the reader never loses which category they are inside
Fallback:           Reduced motion → no pin, linear stack, all visible.
                    No-JS → linear stack, complete and readable
```

### Motion — ramp step

```
Trigger:            Pillar boundary crossed
Animation:          --ground steps to the next palette stop
Duration:           --dur-slow
Easing:             --ease-in-out
Scroll relationship: Triggered at boundary, not scrubbed — a discrete step
                    reads as a chapter change; a continuous fade would not
Desktop / Tablet:   Full
Mobile:             Full — this is cheap, one variable
Purpose:            Marks the change of pillar before a word is read
Fallback:           Static --paper
```

---

## §3 — Proof

**Purpose:** stop the page being a list of claims. Immediately after the capability list, show that it has been done.

| | |
|---|---|
| Content | 3–4 projects chosen to span the pillars — a campaign, a brand build, a platform. `see all 28 projects →` |
| Layout | Horizontal row desktop, stacked mobile |
| Source | Tier-A projects only ([[work#Asset tiers]]) |

This section exists because of [[../Design#1 Brand principles|principle 1 — proof over promise]]. A services page that only asserts capability is the weakest page on most agency sites.

---

## §4 — CTA

Routes to [[contact]].

---

## Deliberately absent

| Excluded | Why |
|---|---|
| Pricing / packages | Agency work is quoted. No pricing exists in any source |
| Process diagram | **No process is described anywhere.** A "Discovery → Design → Build → Launch" graphic would be pure invention — and it is the single most generic thing on agency websites |
| Timelines | Not in any source |
| Tech-stack logo wall | We sell outcomes; and it would date instantly |
| Team member attribution | No team data exists |
| Service-level comparison table | Three pillars, not three tiers. There is nothing to compare |

## Responsive

| | Desktop ≥1024 | Tablet 768–1023 | Mobile <768 |
|---|---|---|---|
| Header | Display L | Display L | Display M |
| Pillars | Pinned title + scrolling items | Reduced pin | **Linear stack, no pin** |
| Items | 2-col within pillar | 2-col | 1-col |
| Proof | Horizontal row | 2-col | Stacked |
| Ramp | Stepped per pillar | Stepped | Stepped |

## Performance

- Lightest page after `/contact` — mostly type
- ScrollTrigger pinning is desktop/tablet only; mobile creates no pin instances
- Proof imagery is the only media; lazy-loaded, 3–4 images maximum
- No pillar-level ground repaints — the ramp writes one variable

## Content sources

| Item | Source |
|---|---|
| Three pillar names | ✅ Confirmed — deck slide 2 |
| Twelve service items | ✅ Confirmed — deck slide 2, verbatim |
| Service descriptions | ✅ Confirmed — legacy site, 8 blurbs verbatim |
| Header paragraph | ✅ Confirmed — deck slide 2 |
| Items with no legacy blurb (SEM, Email Campaigns, Performance Marketing, Video Production, Print & Outdoor, IT Servicing, Dedicated Resource) | 💡 **Proposed** — must be written in the legacy voice and flagged for client review |
| Proof projects | ✅ Confirmed — deck |
| Pricing, process, timelines | ❌ **Do not exist. Do not write them.** |
