---
tags: [page-spec, work]
---

# Work

Route: `/work` · Modal state: `/work?case=<slug>`
Upstream: [[../PRD|PRD]] · [[../Design|Design]] · [[../brand/brand-audit#Work — S1 slides 5–32|brand-audit]] · [[../architecture#7 /work modal + shallow routing|architecture]]

## Objective

Present 28 real projects for brands including Google, Emirates, Lenovo, Motorola, Toyota, Johnson & Johnson, Abbott and Domino's — **without overstating what we can prove about any of them.**

## User intent

*"Show me what you've actually built, and let me judge whether it's any good."*

This visitor is sceptical. They want to see work and, ideally, click through to it live.

## The central problem

The deck gives us, per project: a **name**, a **URL**, and a **4:3 slide screenshot**. That's it.

No brief. No role. No date. No outcome. No metric. No testimonial.

Most agency sites would invent the rest. **We don't.** Everything below is designed around presenting a thin but *entirely true* record convincingly — and the design work is making thinness feel like restraint rather than absence.

---

## Asset tiers

The hardest honesty problem on the site. 20 of 26 URLs return 200 — but for large brands, **the site live today is almost certainly someone else's redesign.** Screenshotting `lenovo.com` in 2026 and captioning it "our work" is a misrepresentation.

| Tier | Meaning | Imagery | Live link |
|---|---|---|---|
| **A** | Bespoke build plausibly still running Coffee Digital's work | Playwright capture, 2× DPR, 1440×900 + 390×844 | ✅ Yes |
| **B** | Large brand, site near-certainly redesigned since | **Deck crop only** — the actual historical artefact — duotoned + grained | ❌ No, until confirmed |
| **C** | Dead, blocked, or no URL ever existed | Deck crop, duotoned + grained | ❌ No |

⛔ **Tier B cannot be resolved without the client.** Which builds are still theirs is a launch blocker in [[../TBD|TBD]]. Until answered, Tier-B projects appear with deck imagery and **no outbound link**.

### The 28

| Project | Client | Tier | Live |
|---|---|---|---|
| Abbott SmartPack | Abbott | A | ✅ |
| Abbott — e-Detailers, Emailers & Landing Pages | Abbott | C | — |
| Abbott — Mobile App for HR Team | Abbott | C | — |
| Making India Heart Strong | Sun Pharma | A | ✅ |
| Synergycom USA | Synergycom | A | ✅ |
| M2P Fintech | M2P | C | — |
| Enrituals | Enrituals | A | ✅ |
| Pronto Insurance | Pronto | A | ✅ |
| Uncle Sams Kitchen | Uncle Sams Kitchen | A | ✅ |
| ⚠️ *slide-14 entry* | *unresolved* | — | **withheld** |
| Indiabulls Housing Finance | Indiabulls | C | — |
| B2X Germany | B2X | B | ⛔ |
| Electrotherm Corporate | Electrotherm | A | ✅ |
| Toyota Land Cruiser Prado | Toyota | B | ⛔ |
| Emirates Digital Campaign | Emirates | C | — |
| Lenovo | Lenovo | B | ⛔ |
| Motorola | Motorola | A | ✅ |
| Colors TV — 5 countries | Viacom18 | B | ⛔ |
| Aegon Life | Aegon | C | — |
| Lodha Palava | Lodha | A | ✅ |
| Fevicol Design Ideas | Pidilite | A | ✅ |
| Google Pixel Support | Google / B2X | C | — |
| Toyota Prius | Toyota | B | ⛔ |
| Tata Nano | Tata Motors | C | — |
| Spykar | Spykar | B | ⛔ |
| Van Heusen | Van Heusen | B | ⛔ |
| Dominos Pizza India | Domino's | B | ⛔ |
| Indiabulls Foundation | Indiabulls | A | ✅ |

⚠️ Slide 14 is titled "Uncle Sams Kitchen" but links `samskriti.in`. One is wrong. **The entry is withheld from the site** until the client resolves it ([[../TBD|TBD]]).

---

## Sections

### §1 — Header

| | |
|---|---|
| Content | `work` (h1). One line: 28 projects, and the calibre of client. `Selected work for Google, Emirates, Toyota, Abbott, Domino's and others.` |
| Layout | Left-aligned, generous top space. Stripe beneath |
| Visual | `--paper` |

### §2 — Filter

**Purpose:** make 28 projects navigable without a 25,000px scroll — the specific weakness identified in [[../reference/trionn/interactions#Page lengths|the reference]].

| | |
|---|---|
| Content | `all` · `websites` · `apps` · `campaigns` · `commerce` — derived from confirmed `deliverables`, never invented categories |
| Layout | Horizontal mono labels beneath the header; sticky on scroll |
| Behaviour | Client-side, instant, no reload. Count updates. `all` is default |
| A11y | `role="tablist"`, arrow-key navigation, `aria-live` count announcement |

```
Trigger:            Filter selected
Animation:          GSAP Flip — tiles move to new positions; leaving tiles
                    fade out, entering tiles fade + rise
Duration:           --dur-base, 30ms stagger
Easing:             --ease-out-quint
Scroll relationship: None
Desktop:            Full Flip reposition
Mobile:             Fade only — single column means positions barely change,
                    and Flip on a long list costs frames
Purpose:            Preserves object permanence, so the reader tracks that
                    tiles were filtered rather than the page being replaced
Fallback:           Reduced motion → instant re-render.
                    No-JS → all 28 render; filter is progressive enhancement
```

### §3 — Project grid

| | |
|---|---|
| Content | 28 tiles. Each: image, client, title, deliverable tags, `view case →`. Tier-A also shows `visit live site ↗` |
| Layout | Desktop 2-col **offset** — tiles never align on a row. Tablet 2-col aligned. Mobile 1-col |
| Visual | Ground walks `--paper` → `--cream` down the page. Tier-B/C imagery duotoned `--ink`/`--cream` + grain |
| Components | `WorkTile`, `Stripe`, `Media`, `Reveal` |

**Why offset:** an aligned grid of 28 tiles reads as a catalogue. Offsetting creates a vertical rhythm that rewards scrolling. **The connective device is the stripe** — explicitly *not* the hairline curves used by the reference ([[../reference/trionn/notes#What we take, adapt, reject|why]]).

```
Trigger:            Tile enters viewport
Animation:          Image mask-reveals upward from clipped bound;
                    metadata fades + rises 12px, offset 120ms
Duration:           --dur-slow, 80ms stagger between column pairs
Easing:             --ease-out-quint
Scroll relationship: On enter, once, at "top 85%"
Desktop:            Full, with per-column parallax at differing rates
Tablet:             Reveal only, no parallax
Mobile:             Reveal only, no parallax, no stagger
Purpose:            Paces a long page so tiles arrive rather than accumulate
Fallback:           All tiles visible at final position
```

### §4 — Closing CTA

Routes to [[contact]]. Copy from deck slide 34.

---

## The case modal

Locked decision: **modal with shallow routing, not `/work/[slug]` routes** ([[../PRD#8 Scope|PRD]]). Implementation contract in [[../architecture#7 /work modal + shallow routing|architecture]].

### Content — confirmed facts only

| Field | Source | Present? |
|---|---|---|
| Client | Deck | ✅ |
| Project title | Deck | ✅ |
| Deliverables | Deck + legacy site | ✅ |
| Imagery | Tier-appropriate | ✅ |
| Live link | Tier A only | Conditional |
| ~~Year~~ | — | ❌ **Not invented** |
| ~~Brief / challenge~~ | — | ❌ **Not invented** |
| ~~Outcome / metrics~~ | — | ❌ **Not invented** |
| ~~Testimonial~~ | — | ❌ **Not invented** |

The `Project` schema **has no field** for the fabricated four — the constraint is structural, not a convention ([[../architecture#5 The content system|architecture]]).

### Layout

Desktop: centred overlay, ~80vw × 80vh, image column left, metadata right, scrollable.
Mobile: full-screen sheet, slides up, image-first, metadata below.

### Behaviour

| | |
|---|---|
| Open | Tile click, or landing on `?case=slug` |
| Close | ✕ · `Esc` · backdrop click · browser Back |
| URL | `history.pushState` — **not `router.push`**, which would re-render the server component and re-run page animation |
| Share | `?case=slug` loads `/work` with the case open |
| Unknown slug | Nothing opens; URL cleaned; no error |
| Focus | Trapped while open; restored to the triggering tile on close |
| Scroll | `lenis.stop()` — not `overflow:hidden`, which causes a layout shift |

```
Trigger:            Case opened
Animation:          Desktop — stripe bands wipe across the viewport, modal
                    revealed beneath. Mobile — sheet slides up from bottom
Duration:           --dur-base (desktop) / --dur-fast (mobile)
Easing:             --ease-out-expo
Scroll relationship: None
Desktop:            Stripe wipe
Mobile:             Slide-up sheet — a stripe wipe on a phone reads as a glitch
Purpose:            The wipe marks a state change without losing the reader's
                    place; the page is still there behind it
Fallback:           Reduced motion → opacity fade, --dur-instant.
                    No-JS → tile links directly to the live site where one
                    exists; the modal is progressive enhancement
```

---

## Responsive

| | Desktop ≥1024 | Tablet 768–1023 | Mobile <768 |
|---|---|---|---|
| Filter | Sticky horizontal row | Sticky, scrollable | Horizontal scroll, sticky |
| Grid | 2-col offset + parallax | 2-col aligned | 1-col |
| Tile meta | Beneath image | Beneath image | Beneath image, tighter |
| Modal | Centred overlay | Overlay, wider | Full-screen sheet |
| Live link | Inline `↗` | Inline | Below title, ≥44px target |

## Performance

The heaviest page — **28 images is the entire budget.**

- Only the first 6 tiles load eagerly; the rest lazy with blur placeholders
- Responsive `sizes` per breakpoint; a phone never receives a desktop asset
- Largest single image **<200KB**; AVIF with WebP fallback
- `CaseModal` is `next/dynamic`, loaded on first open — not in the initial bundle
- Flip is dynamically imported with the filter, not globally
- Parallax runs on desktop only, one ScrollTrigger for the grid, not one per tile
- Explicit dimensions on every image — CLS budget is 0.05 and 28 images is where it would be lost

## Content sources

| Item | Source |
|---|---|
| 28 project names | ✅ Confirmed — deck slides 5–32 |
| Live URLs | ✅ Confirmed — deck hyperlinks, liveness verified 2026-08-17 |
| Deliverable tags | ✅ Confirmed — deck slide titles + legacy site |
| Tier-A imagery | 📸 To capture — `scripts/capture-work.mjs` |
| Tier-B/C imagery | ✅ Confirmed — deck media, art-directed |
| Filter categories | 💡 Proposed — derived from confirmed deliverables |
| Header line | 💡 Proposed — names only confirmed clients |
| Brief / outcome / metrics | ❌ **Do not exist. Do not write them.** |
