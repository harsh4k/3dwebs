---
tags: [page-spec, home]
---

# Home

Route: `/` · Upstream: [[../PRD|PRD]] · [[../Design|Design]] · [[../brand/brand-audit|brand-audit]]

## Objective

Establish who Coffee Digital is, prove it in one screen of evidence, and route to all four pages. **The home page is a gateway, not a fifth content page** — every section is a teaser that defers to its page, except the contact CTA.

## User intent

*"I've been sent a link / found them in a search. Are these people any good, and who else have they worked for?"*

The visitor is making a hire-or-skip judgement in well under a minute.

## Content hierarchy

1. Who they are — identity, tagline, the mark
2. **Proof** — awards and clients. The strongest asset, placed second
3. What they've made — 4 featured projects
4. What they do — 3 pillars
5. How to start — contact

## Section challenge

The brief proposed seven sections. Two were cut:

| Proposed | Verdict |
|---|---|
| Hero | **Keep** |
| Brand statement | **Merged into §2.** A standalone statement section with no evidence beneath it is a claim, and [[../Design#1 Brand principles\|principle 1]] is proof over promise |
| Selected work | **Keep** |
| Services introduction | **Keep** — reduced to three lines |
| About / positioning moment | **Cut.** It would duplicate §2 and §5. The positioning line lives in the hero; the credibility lives in the proof section |
| CTA | **Keep** |
| Footer | **Keep** — global, see [[footer]] |

Six sections. Estimated depth **~5 screens desktop**, well under the reference's 7.

---

## §1 — Hero

**Purpose:** identity in one screen; establish the stripe and the bean as the site's vocabulary.

| | |
|---|---|
| Content | Wordmark. `the digital branding people` (confirmed tagline). Positioning line from the deck. Two CTAs: `see the work →`, `start a project →` |
| Layout | Full viewport. Display type upper-left on a 12-col grid. Stripe as a full-bleed band along the bottom edge |
| Visual | Ground is the GetLayers flower-field loop (`--media-ground` fallback). Type `--media-ink`. One `--heat` element only: the `→` on the primary CTA |
| Assets | `bean-pair.svg`, `stripe.svg`, wordmark, `public/hero/flower-field-*` |
| Components | `Stripe`, `Button`, `Reveal`, `Cursor` |

**Copy — confirmed, do not rewrite:**
> the digital branding people
>
> Whether you need a stunning campaign, a smart app, or a complete brand revamp, we're your full-stack digital partner — combining creativity, code, and strategy to bring your vision to life.

Source: [[../brand/brand-audit#✅ Confirmed]]. The tagline is from the legacy site, the paragraph from deck slide 2.

### Motion — hero reveal

```
Trigger:            Page load, after fonts settle
Animation:          Mask reveal per line; lines rise from a clipped bound.
                    Stripe scales X from 0 → 1 beneath, offset 200ms
Duration:           ~dur-reveal (900ms) — tunable
Easing:             --ease-out-expo
Scroll relationship: None. Time-based, once
Desktop:            Per-line, 80ms stagger
Mobile:             Per-block — per-line is imperceptible at this size
Purpose:            Establishes reading order and introduces the stripe as
                    the site's connective device in the first two seconds
Fallback:           Reduced motion → fully visible immediately, no transform.
                    No-JS → visible; this is the default CSS state
```

### Motion — bean cursor

```
Trigger:            Pointer move, fine pointers only
Animation:          Bean mark follows with eased lag; scales 1 → 1.8 over
                    interactive elements and inverts to --heat
Duration:           ~240ms follow constant — tunable
Easing:             --ease-out-quint
Scroll relationship: None
Desktop:            Active
Mobile / tablet:    Not rendered. Never shipped to coarse pointers
Purpose:            Brand presence + a continuous interactive-affordance hint
Fallback:           Decorative only. Every state it shows also exists in the
                    DOM. Disabled for reduced motion
```

---

## §2 — Proof

**The most important section on the site.** Coffee Digital's awards and client roster are objectively stronger than any competitor's, and both are currently invisible.

| | |
|---|---|
| Content | Three counters — international awards, national awards, named brands. The 27 client marks. Award-body names |
| Layout | Counters on a 3-col row (stacked on mobile), client marks in a quiet grid below |
| Visual | Ground has walked to `--cream`. Counters at `--fs-display-m`. Marks monochrome `--ink`, going full colour on hover |
| Assets | 27 client logos — ✅ **rights confirmed** 2026-08-17, [[../TBD#✅ B1\|TBD B1]] |
| Components | `Counter`, `Reveal`, `Stripe` |

**Counter values — derived by counting [[../brand/brand-audit#Awards — S1 slide 3, verbatim|confirmed awards]], not invented.** The exact figures are locked during implementation against that list, and each counter carries a plain-text caption naming the bodies, so the number is never an unsupported claim.

The mark grid ships as designed. If any individual client objects post-launch, that mark is removed and the **name retained in text**.

### Motion — counter roll

```
Trigger:            Section enters viewport, once
Animation:          Digit columns translate on Y to target. Tabular numerals
                    so width never jitters
Duration:           ~1200ms, staggered 120ms between counters — tunable
Easing:             --ease-out-quint
Scroll relationship: Fires on enter; not scrubbed
Desktop / Mobile:   Identical — this is the payload, it runs everywhere
Purpose:            Makes the number feel counted rather than asserted.
                    Directly serves "proof over promise"
Fallback:           Reduced motion → final value rendered immediately.
                    No-JS → final value is the server-rendered content
```

### Motion — client marks

```
Trigger:            Section enters viewport
Animation:          Marks fade + rise, staggered by grid position
Duration:           --dur-base, 40ms stagger, capped at 12 then grouped
Easing:             --ease-out-quint
Scroll relationship: On enter
Desktop:            Hover restores full colour
Mobile:             Full colour on entry — no hover exists to reveal it
Purpose:            Recognition. A visitor scanning for a familiar name
                    finds one fast
Fallback:           Static, full colour, fully visible
```

---

## §3 — Selected work

**Purpose:** show four projects, prove range, route to `/work`.

| | |
|---|---|
| Content | 4 featured projects — `featured: true` in `content/projects.ts`. Client, title, deliverables, image. `see all 28 projects →` |
| Layout | Desktop: 2-col offset grid, tiles at differing scroll depths. Mobile: single column |
| Visual | Ground `--cream`. Stripe divides tiles |
| Assets | Tier-A imagery only — the home page never shows a Tier-B capture ([[work#Asset tiers]]) |
| Components | `WorkTile`, `Stripe`, `Reveal` |

**Featured selection** favours Tier A with a live URL and category spread. Candidates: Abbott SmartPack, Sun Pharma "Making India Heart Strong", Lodha Palava, Pidilite Fevicol Design Ideas.

### Motion — tile parallax

```
Trigger:            Scroll
Animation:          Tiles translate Y at differing rates (±6% — tunable);
                    images scale 1.06 → 1.0 across their pass
Duration:           None — scrubbed
Easing:             --ease-linear (mandatory for scrubbed motion)
Scroll relationship: Scrubbed, bound to scroll position
Desktop:            Full, differential rates per column
Tablet:             2-col, no parallax
Mobile:             Single column, no parallax — the effect is invisible on a
                    narrow viewport and costs frames
Purpose:            Depth and spatial continuity; makes the grid a space
                    rather than a list
Fallback:           Static positions. Layout is complete without it
```

### Motion — stripe hover mask

```
Trigger:            Pointer enters a tile (desktop) / tile enters viewport (mobile)
Animation:          Stripe bands sweep L→R across the image, sequenced,
                    revealing a higher-contrast treatment beneath
Duration:           --dur-base, 20ms band stagger
Easing:             --ease-out-quint
Scroll relationship: None
Desktop:            On hover
Mobile:             Plays once on enter — hover doesn't exist
Purpose:            The brand device doing interaction work. Signals the tile
                    is interactive using Coffee Digital's own asset
Fallback:           Static image at final treatment
```

---

## §3b — Work helix (post-sequence)

**Purpose:** after the particle sequence, let the visitor browse every *confirmed* project in `content/projects.ts` without inventing the withheld remainder of the 28. Recession on the helix means not the card in focus — already seen above, or not yet reached below.

| | |
|---|---|
| Content | All confirmed projects. Client, title, deliverables. Click opens the case modal. Count is `projects.length`, not the deck total. |
| Layout | Sticky `100svh` stage inside a track of `max(200, n × 28)` vh. Document scroll maps to helix slot `0…n−1`. |
| Visual | Ground `--cream`. Dither palettes read `--ink` / `--paper` from tokens. One `--heat` rule under the active title. |
| Assets | Deck imagery from each project. No live Tier-B links. |
| Components | `WorkCarousel`, `CaseModal` |

```
Trigger:            Document scroll through the section (Lenis)
Animation:          Cards ride a vertical helix; off-focus cards dissolve
                    into ordered dither + directional blur. Entry plays once.
Duration:           Scrubbed to scroll; entry ~2.4s spin
Easing:             Helix lerp + snap from the dither-blur reference
Scroll relationship: Page scroll drives slot. Drag/click-to-focus stay on the canvas.
Desktop:            Hover rack-focus + cursor trail
Tablet / Mobile:    Scroll-driven helix only — no trail, no hover
Purpose:            Makes a long set of projects a single spatial object
                    instead of a catalogue dump after the 3D sequence
Fallback:           Reduced motion and no-JS → stacked list of the same
                    projects, fully visible. WebGL is enhancement.
```

The wave overlay teaser stays. `/work` stays the archive.

---

## §4 — Services

**Purpose:** name the three pillars, route to `/services`. Three lines, no more.

| | |
|---|---|
| Content | The three confirmed pillars, one line each. `explore services →` |
| Layout | Three stacked rows, full-width, hairline-separated |
| Visual | Ground has walked to `--peach` |
| Components | `Reveal`, `Link` |

**Copy — pillar names verbatim from the deck:** Digital Marketing & Strategy · Creative & Branding · Technology & Development. The single supporting line per pillar is **Proposed** and marked as such in [[services]].

### Motion — row reveal

```
Trigger:            Each row enters viewport
Animation:          Hairline scales X 0→1; label mask-reveals from beneath
Duration:           --dur-slow, 100ms row stagger
Easing:             --ease-out-quint
Scroll relationship: On enter, once
Desktop / Mobile:   Same — cheap and legible at any size
Purpose:            The rule draws the eye to each pillar in sequence,
                    enforcing reading order on otherwise equal items
Fallback:           Rules and labels present and visible
```

---

## §5 — Contact CTA

**Purpose:** convert. The only section that does not defer to another page.

| | |
|---|---|
| Content | Deck closing copy. `info@coffeedigital.in`. `start a project →` |
| Layout | Full-bleed. Display type centred, email beneath |
| Visual | Ground `--peach`. **This is where `--heat` earns its keep** — the CTA is the hottest element on the page |
| Components | `Button`, `Stripe` |

**Copy — confirmed, deck slide 34:**
> Do care to test us,
> Throw us a challenge,
> You'd find us more than eager!

### Motion — heat wipe

```
Trigger:            Pointer enters CTA (desktop) / tap (mobile)
Animation:          --heat fills the button from the pointer's entry edge;
                    label inverts to --paper
Duration:           --dur-fast
Easing:             --ease-out-quint
Scroll relationship: None
Desktop:            Direction follows entry edge
Mobile:             Fill from left on tap
Purpose:            The single hottest interaction on the page marks the
                    single most important action
Fallback:           Static --heat rule beneath the label
⚠️ Accessibility:   Label on a filled --heat ground must be ≥24px bold —
                    paper-on-heat is 3.86:1. See brand/palette
```

---

## Scroll behaviour — the Roast Ramp

The page-level device, running the length of the document.

```
Trigger:            Document scroll
Animation:          --ground interpolates --paper → --cream → --peach
Duration:           None — scrubbed
Easing:             --ease-linear
Scroll relationship: Scrubbed across full document height
Desktop:            Continuous interpolation
Tablet:             Continuous
Mobile:             Stepped per section — continuous repaint is too costly
Purpose:            Chapter progress made physical. The reader feels how far
                    through they are without a progress bar
Fallback:           Reduced motion → static --paper throughout
Implementation:     ONE ScrollTrigger writing ONE CSS variable on :root.
                    Not one trigger per section
```

## Responsive

| | Desktop ≥1024 | Tablet 768–1023 | Mobile <768 |
|---|---|---|---|
| Hero | Full viewport, per-line reveal | Full viewport | 90vh, per-block reveal |
| Proof | 3-col counters, 6-col mark grid | 3-col, 4-col grid | Stacked, 3-col grid |
| Work helix | Sticky viewport, scroll-driven | Same, no trail | Same, no trail |
| Services | Full-width rows | Full-width rows | Full-width rows |
| CTA | Full-bleed display | Full-bleed | Reduced display size |
| Cursor | Bean | None | None |

## Performance

- Hero is the LCP element — **text, not an image**, so LCP is font-load bound. Fonts preloaded, `swap`.
- Client marks are SVG, inlined as a sprite — 27 separate requests would be indefensible.
- Work imagery lazy-loads below the fold with blur placeholders.
- The ramp writes one variable; no section paints its own ground.
- Work helix WebGL is dynamically imported and paused off-screen; the particle canvas pauses while the helix is in view.
- Reduced-motion visitors get the project list without the helix.

## Content sources

| Section | Source |
|---|---|
| Hero tagline | ✅ Confirmed — legacy site |
| Hero paragraph | ✅ Confirmed — deck slide 2 |
| Proof counters | ✅ Derived by counting confirmed awards |
| Client marks | ✅ Confirmed — deck slide 4 · ✅ rights confirmed |
| Featured projects | ✅ Confirmed — deck slides 5–32 |
| Service pillars | ✅ Confirmed — deck slide 2 |
| Service one-liners | 💡 Proposed |
| CTA copy | ✅ Confirmed — deck slide 34 |
| Email | ✅ Confirmed — legacy site |
