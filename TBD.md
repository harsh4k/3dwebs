---
tags: [tbd, blockers, open-questions]
---

# TBD Register

Every known gap, with what's needed and who supplies it. **Nothing on this list may be invented to work around it.**

Upstream: [[brand/brand-audit#❌ Missing|brand-audit]] · [[PRD#21 Open questions|PRD]]

| Legend | Meaning |
|---|---|
| ⛔ | **Launch blocker.** The site cannot go live until resolved |
| ⚠️ | Blocks a specific section or decision |
| 📋 | Would improve the site; not blocking |

---

## ⛔ Launch blockers

**None outstanding.** All three were resolved on 2026-08-17 — see below and the [[#Resolution log|resolution log]].

### ✅ B1 — Client logo usage rights — RESOLVED

**Resolution (2026-08-17, Harsh): rights confirmed.** Coffee Digital may display the 27 client marks.
**Effect:** [[specs/home#§2 — Proof|home §2]] and [[specs/about#§3 — Clients|about §3]] ship as designed — the mark grid, not the typographic fallback.
**Standing condition:** this is a blanket confirmation, not a per-brand licence review. If any individual client objects post-launch, that mark is removed and the name retained in text — the names are confirmed facts independent of mark usage.

### ✅ B2 — "Perhaps, the most awarded team in digital media in India" — RESOLVED: CUT

**Resolution (2026-08-17, Harsh): the superlative is cut.** No sign-off was claimed, so it does not ship.
**Replacement — factual framing, every word verifiable from deck slide 3:**

> Recognised at Cannes, One Show, D&AD, the Webby Awards, the New York Festival, and Goafest.

**Why this is the better outcome:** an unqualified superlative invites the question *"says who?"* and carries ASCI exposure. Six named award bodies answer the question before it is asked. It is specific where the superlative was vague, and it cannot be challenged.
**Effect:** [[specs/about#§2 — Awards|about §2]].

### ✅ B3 — Tier-B provenance — RESOLVED: conservative handling stands

**Resolution (2026-08-17, Harsh): ship the conservative handling.** Tier-B projects show **deck imagery with no outbound link**.

⚠️ **This is a decision, not a finding.** It was not established that these sites *have* been redesigned — we chose the handling that is safe either way. B2X, Toyota (Prado & Prius), Lenovo, Colors TV, Spykar, Van Heusen and Domino's are presented via the deck screenshot, which is the genuine historical artefact of Coffee Digital's work, with no claim about the site live today.

**Promotion path:** if the client later confirms a specific build is still theirs, that project moves to Tier A — re-capture, add `liveUrl`, done. One content edit per project, no component changes.

---

## ⚠️ Section blockers

### S8 — The structural device, after the stripe

**Status:** open, non-blocking for launch but load-bearing for how the site reads.

The stripe was retired on 2026-08-22 (`brain.md` → D16) because every one of its
186 bands was a brown outside the locked palette — `#3E210F`–`#472D1D` — so the
one device the system called its connective tissue was the last thing on the site
still painting the dead trio. It is deleted, and **nothing replaced it**.

That closes a colour problem and opens a design one. Design.md principle 2 —
*"does the connective tissue come from Coffee Digital's own asset, or from a
trend?"* — now has no device behind it, and five specs (`work`, `navigation`,
`services`, `about`, `home-build`) describe boundaries, page transitions,
scroll-progress and tile-hover masks that were all going to be the stripe.

**What ships in the meantime:** separation by ground colour, whitespace and the
type ladder. On the home page the CSS ground and the WebGL fog are the same value
(`#fff2db`), so the page is one continuous surface — which is coherent, and is
deliberately not a placeholder waiting to be filled.

**Need:** a decision on whether the site wants a replacement structural device at
all, and if so what it is — drawn from a confirmed Coffee Digital asset, not
invented. The remaining owned marks are the bean (cursor, preloader) and the
wordmark.

⚠️ **Do not invent one to close this gap.** A generic divider, gradient band or
geometric motif would fail principle 2 more badly than having no device at all.

**Owner:** Harsh
**Blocks:** nothing at launch. Revisit before any work on page transitions or the
navigation progress indicator, both of which were specced as stripe wipes.


### S9 — Two animation runtimes, and the rule says one

**Status:** open, non-blocking, but it decides how every future animation is written.

[[architecture#1 Stack|architecture]] and [[CLAUDE#Animation rules|CLAUDE.md]]
both say "one animation system, not two", and both assume that system is **GSAP**.
The code says otherwise: **@react-spring/web drives 12 files** — every reveal,
the rotating word, the scroll cue, reduced motion — while **GSAP is down to a
single import**, in `use-staggered-menu.ts`.

So the rule is broken, in the opposite direction to the one the docs describe.
The animation rules still tell you to route everything through
`useGsapContext` and compose "the six motion primitives"; neither matches what
is in `src/`.

**Need:** pick one.
- **Finish the move to springs** — port the staggered menu, drop the GSAP
  dependency, rewrite the animation rules around react-spring. Cheapest, and
  matches where the code already is.
- **Go back to GSAP** — a much larger rewrite of 12 files for no user-visible gain.

**Recommendation: finish the move to springs.** One import is not a system.
**Owner:** Harsh
**Blocks:** nothing shipping, but every new animation written before this is
settled is written against a rule that is not true.

**Update 2026-08-22 — this now has a price tag.** After the bundle work
([[brain#D20 — The footer reveal leaves the spring runtime (2026-08-22)|D20]]),
GSAP is the **largest addressable item on every text page: 29.8 KB gzipped**,
for one component. `/services` is 183.7 KB, of which ~138 KB is irreducible
framework — so GSAP is roughly two thirds of everything that is actually left.

That reframes the decision. It is no longer only about consistency:
- **Port the menu to springs** → GSAP leaves the bundle entirely. `/services`
  → ~154 KB. But it is a 267-line GSAP-idiomatic timeline (paused timelines,
  staggered pre-layers, a `--sm-num-opacity` property tween, an icon spin, a text
  cycle with callbacks) driving the **primary navigation on every page**. Real
  regression risk on the one control the whole site depends on.
- **Keep GSAP** → accept ~30 KB on every route for one menu, and rewrite the
  animation rules to say GSAP owns the menu and react-spring owns everything else.

⚠️ **Do not attempt the port as a performance task.** If it happens it is a
motion-system decision with a proper before/after review of the menu, not a
bundle trim.


### ✅ S10 — The three held design decisions — RESOLVED 2026-08-22

All three were decided and shipped the same day they were raised. Harsh's call:
*"unless the design is the same and it doesn't get broken or changed, fix
everything"* — then, on seeing mobile, *"fix the mobile layout"*.

| # | Was | Decided |
|---|---|---|
| B2 | `/work` tiles cropped ~12% off each side, cutting client logos out of frame | **16/9 + `object-contain` on a `--cream` ground.** Nothing is ever cropped; the deck captures cluster 1.75:1–2.03:1, so the band is ≤6% |
| B3 | Mobile header wrapped to two lines; needed 399px against 375px | **"let's talk" is hidden below `md`.** It is the only one of the three items duplicated elsewhere (menu Contact, hero CTA); frees 118px |
| B4 | 186 nodes shipped at `opacity:0`; JS-off entry page was blank | **`mounted` guard extended to `RevealText`/`RevealItem`, and `ScrollFade` seeded from progress 0.** 186 → 6, and the 6 are decorative flares plus the three not-yet-on acts |

See [[audit-2026-08-22]] for the reasoning and the measurements behind each.


### S1 — Voice

**Need:** a decision between two confirmed registers.
- **Legacy site** — lowercase, first-person, wry. *"we can turn a Monday into a Friday"*, *"we are not Google, but…"*
- **Deck** — title case, corporate, emoji-bulleted.

**Recommendation: legacy.** It is more distinctive, unmistakably human, and supplies confirmed copy for eight service descriptions ([[specs/services#The lucky finding|services]]).
**Owner:** Harsh + Coffee Digital
**Affects:** every line of copy on the site. **Decide early** — reversing it after copy is written is expensive.

### S2 — Budget bands in ₹

**Need:** 4–6 bands appropriate to Coffee Digital's actual project sizes, in rupees.
**Owner:** Coffee Digital
**Affects:** [[specs/contact#§2 — Enquiry form|contact form]]
**Note:** the field must stay **optional** with a `Not sure yet` option — a budget question that blocks submission costs enquiries.

### S3 — Slide 14 discrepancy

**Need:** slide 14 is titled *"Uncle Sams Kitchen"* but hyperlinks `samskriti.in`. Which is correct, and is the other a separate project?
**Owner:** Coffee Digital
**Affects:** [[specs/work|work]] — the entry is **withheld from the site** until resolved.

### S4 — "We usually reply within one business day"

**Need:** confirmation this is actually true.
**Owner:** Coffee Digital
**Affects:** [[specs/contact#§1 — Header|contact]]
**Note:** a response promise that isn't kept damages trust more than making no promise. Cut it if unsure.

### S5 — Typeface licence

**Need:** decide between licensing **Futura PT** (Adobe Fonts — the brand's actual face) or shipping **Jost** (open, Futura-derived).
**Owner:** Harsh + Coffee Digital
**Affects:** [[Design#Faces|Design]]
**Default:** Jost. If Futura PT is licensed it swaps in for display only, and nothing else in the system changes.

### S6 — Original logo vector

**Need:** the source AI/SVG/EPS of the wordmark and bean pair.
**Owner:** Coffee Digital
**Affects:** [[brand/brand-audit#The logo|brand-audit]]
**Current handling:** working reconstructions at `brand/logo/bean-mark.svg` and `bean-pair.svg`, built from measurement and verified against the original by side-by-side render. Good enough to build with; the original should replace them before launch.
**Also needed:** the wordmark as vector — currently only a 916×85 PNG cropped from the deck.

### S7 — Repository visibility

**Need:** decide whether `github.com/harsh4k/coffeedigital` stays **public**.
**Owner:** Harsh
**Affects:** what may be committed. While public, `creds/` and `reference/trionn/html/` are gitignored — the credentials deck contains client logos and unreleased claims, and republishing a competitor's source isn't ours to do.
**Recommendation:** flip to private. Everything becomes versionable and the exclusions disappear.

---

### S8 — `stripe.svg` does not exist

**Need:** the 186-band stripe asset described in [[Design#Stripe|Design §7]].
**Owner:** Harsh
**Affects:** the stripe's five jobs are all unbuilt, including [[specs/home-build#MAJOR — the rule draws|home §4's "the rule is the stripe"]]. Nothing in `public/` or `src/` references a stripe today; the services panels ship a plain `--rule` hairline instead, which draws scaleX 0→1 exactly as specced but without the barcode tones.
**Recommendation:** produce the asset, then swap the hairline for it in `src/features/home/services/service-panel.tsx`. Purely additive — the motion and the geometry are already correct.

---

### S9 — Roast-ramp order around the services chapter

**Need:** decide whether the ramp should walk monotonically down the home page.
**Owner:** Harsh
**Affects:** the home page now runs `--cream` (scene backdrop) → `--peach` (services) → `--cream` (work helix, `work-carousel.tsx`) → `--heat` (footer), so the ramp steps back one stop after services.
**Current handling:** services is treated as a **self-contained inset chapter**, not a ramp stop — the `--ink` field the iris opens out of closes it off at both ends, so returning to cream afterwards reads as leaving a room rather than walking the ramp backwards.
**Recommendation:** leave as is. If a monotonic walk is wanted instead, it is one class on `work-carousel.tsx:144` (`bg-cream` → `bg-peach`) plus a re-check of the carousel's own contrast.

---

## 📋 Non-blocking gaps

| # | Missing | Effect | Handling |
|---|---|---|---|
| N1 | Phone number | No `tel:` link; no phone in footer or contact | Slot renders only when present |
| N2 | Postal address | No `LocalBusiness` schema, no map | Slot renders only when present |
| N3 | Social handles | Footer social row absent | Renders only when non-empty |
| N4 | Founding year | No "since 20XX" anywhere | Omitted |
| N5 | Team size | No headcount stat | Omitted |
| N6 | Legal entity, GST/CIN | Copyright line names "Coffee Digital" only | Sufficient |
| N7 | Project dates | `/work` shows no years | Omitted — schema has no `year` field |
| N8 | Briefs, outcomes, metrics | Case modal shows confirmed facts only | **Schema has no field for these** |
| N9 | Testimonials | No testimonial section exists | Excluded in [[PRD#8 Scope\|non-goals]] |
| N10 | Team/office photography | No such imagery on the site | Omitted |
| N11 | Legacy-only projects (Sky, Spaces, Spun Project, Golf City, Greens) | Named on the legacy site with deliverables but no URLs or imagery | Excluded until assets exist |
| N12 | Privacy policy | Not required — cookieless analytics, no cookie policy needed | Add if client wants one |
| N13 | Dark mode | Not specified; Roast Ramp is a light-mode concept | Deferred |

---

## Resolution log

Record decisions here as they land, with the date. This is the audit trail for why the site says what it says.

| Date | ID | Resolution | Decided by |
|---|---|---|---|
| 2026-08-22 | **D19** | **Dead-code cull.** 32 unreachable files (5,473 lines, 28% of `src/`) and 23.6 MB of orphaned `public/` assets deleted; `public/` 26 MB → 2.6 MB | Harsh |
| 2026-08-22 | **D18** | **WebGL adopted; D3 reversed.** The home page is three.js and the work carousel is a second GL scene. The flat 140KB JS budget is retired for per-route ceilings set at measurement | Harsh |
| 2026-08-22 | — | **First implementation audit** — [[audit-2026-08-22]]. Lint restored to green, third-party font requests 17 → 0, hero light assets −88%. Three defects held as design decisions (S10) | Harsh |
| 2026-08-22 | **D16** | **Stripe device retired.** `stripe.svg` + `src/components/common/stripe/` deleted; all five jobs cancelled; nothing replaces it. Replacement device is now open as S8 | Harsh |
| 2026-08-17 | **B1** | **Client logo rights confirmed.** The 27 marks ship as designed | Harsh |
| 2026-08-17 | **B2** | **Superlative cut.** Replaced with a factual framing naming six award bodies | Harsh |
| 2026-08-17 | **B3** | **Conservative Tier-B handling adopted** — deck imagery, no outbound link. A decision, not a finding; projects can be promoted to Tier A if provenance is later confirmed | Harsh |
| 2026-08-17 | — | Palette locked to `#FFFAF3` `#FFF2DB` `#FFE5BF` `#F62440`; `--ink` `#3F2210` derived from the brand stripe | Harsh |
| 2026-08-17 | — | `/work` uses a modal with shallow routing, not detail routes | Harsh |
| 2026-08-17 | — | Work imagery re-captured from live sites, tiered | Harsh |
| 2026-08-17 | — | Contact renders placeholders only when data exists | Harsh |
| 2026-08-17 | — | ~~No WebGL in v1~~ (**reversed 2026-08-22, D18**); no CMS; no UI component library | Harsh (plan approval) |
