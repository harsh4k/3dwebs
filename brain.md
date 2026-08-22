---
tags: [brain, decisions, reasoning]
---

# Brain

The project's persistent reasoning. **Why** things are the way they are — including the paths not taken.

This file evolves. Append; don't rewrite history.

Related: [[PRD]] · [[Design]] · [[architecture]] · [[TBD]]

---

## Vision

Coffee Digital has an extraordinary record — Cannes, Webby, D&AD, One Show, Goafest, and clients from Google to Emirates — and a website that shows almost none of it.

**The site should be the strongest piece in the portfolio.** An agency that sells digital craft has to demonstrate it. And the proof is already there; nothing needs inventing.

## Core principles

1. **Proof over promise.** Show evidence, don't make claims. This client can afford to.
2. **Never invent.** The credentials deck and the legacy site are the only sources. A thin true section beats a rich false one.
3. **Motion explains.** Every animation has a purpose, or it doesn't ship.
4. **Performance is design.** The site should feel heavy because of experience, not payload.
5. **Mobile is a different composition**, not a smaller one.
6. **The brand already has a device.** The stripe was sitting in the deck. Use it rather than inventing a visual language.

---

## Decisions

### D1 — Light, warm ground. Not dark.

The reference is `#040508`. Nearly every high-motion agency site is dark, because dark hides imperfection and makes glow effects cheap.

Coffee Digital's supplied palette is warm off-white. **This is the single largest differentiator available, and it costs nothing.** It also happens to be harder — light grounds show every alignment error, which is fitting for a design agency's own site.

### D2 — The stripe is the system

The 186-band coffee barcode in the credentials deck is the only genuinely ownable visual asset in the brand. No competitor has it, it isn't a trend, and it's specific to the name.

It does five jobs: divider, scroll progress, page-transition wipe, tile hover mask, footer edge. **One device doing five jobs is the opposite of decoration.**

This also solves the imitation problem. The reference connects its work tiles with hairline SVG curves — the most copyable thing on their site. We connect with the stripe, which achieves the same and is unmistakably ours.

### D3 — No WebGL in v1 — ⛔ SUPERSEDED by [[#D18 — WebGL is the home page, and D3 is superseded (2026-08-22)|D18]]

> ⚠️ **This decision no longer describes the site.** The home page is a three.js
> particle sequence and the work carousel is a second WebGL scene. Kept here as
> the record of what was originally reasoned, and why it was reversed — see D18.
> Do not cite D3 as current policy.

The evidence: **the reference ships OGL (~10KB), not three.js (~150KB)** — a studio featured by Awwwards, FWA, CSSDA *and GSAP* looked at three.js and declined.

Their WebGL hero is justified: an abstract statement needs a subject. Ours doesn't — we have the stripe and the bean, both cheaper and more on-brand.

Deferred, not banned. If the site ships fast and a measurement shows benefit, one OGL effect on work-tile hover. **Behind a measurement gate, not a preference.**

### D4 — Modal, not case-study routes

Locked by Harsh. Independently supported: the reference's `robots.txt` **allows `/work` but disallows `/work/`** — they concede their case pages carry no search value.

We reach the same end state with fewer routes, less to build, and no crawl waste. And with no briefs, dates, or outcomes to publish, a full case page would be mostly empty anyway.

### D5 — No CMS

28 fixed projects, one editor, no publishing cadence. Typed static modules with Zod validation instead.

The unexpected benefit: **the schema became the enforcement mechanism for the no-fabrication rule.** There is no `metrics` field, so no one can add a metric without a deliberate, reviewable schema change. A CMS would have made fabrication a form field.

### D6 — No component library

shadcn, Radix, 21st.dev, OriginUI all rejected. Eight hand-built primitives instead.

Component-library defaults — rounded cards, bordered inputs, shadowed surfaces — are precisely the visual signature the brief calls "AI-looking". On an eight-component art-directed marketing site, a library is more code and less control.

### D7 — `--ink` `#3F2210`, derived not invented

Harsh's four colours are three grounds and one accent. Measured: `#F62440` is **3.86:1 on `#FFFAF3`** — AA-large only. There is no legible body-text colour in the set.

Rather than pick one, `--ink` was taken from the **darkest band of the brand's own stripe** — 25.14% of the artwork. It's already Coffee Digital's colour, and it measures 13.97:1. AAA.

### D8 — The legacy voice, not the deck voice

Two confirmed registers exist. The deck is title-case corporate. The legacy site is lowercase and wry: *"we are not Google, but…"*, *"we can turn a Monday into a Friday"*, *"exactly, call us"*.

**The legacy voice cannot be generated** — that is exactly what makes it valuable. It also supplies confirmed copy for eight service descriptions, which turned `/services` from mostly-proposed into mostly-confirmed.

⚠️ Pending client sign-off — [[TBD#S1|TBD S1]].

### D9 — Careers is a section, not a page

The "3C's" line is one paragraph. The brief's own rule — *if it deserves to exist but doesn't justify a page, make it a section* — applies directly. It lives in `/about`.

### D10 — Cookieless analytics

No consent banner. Partly principle, partly observation: the reference's cookie banner **overlaps its own content** in two of our captures, sitting across a headline and a project title. A consent UI obscuring the content it asks consent for is a real failure.

The cheapest fix is not needing one.

### D11 — Hooks over prose for the two rules that matter

CLAUDE.md already forbids hardcoded hex and invented facts. Prose rules are advisory. The two failures that would be most damaging — a broken token system and a fabricated claim about a real company — are now **mechanically blocked**. 8/8 test cases pass.

---

## Deliberately rejected

| Rejected | Why |
|---|---|
| three.js / R3F / Drei | ~200KB to serve one hover effect. Evidence says even the reference declined |
| Any CMS | Fixed content; and the schema-as-enforcement benefit would be lost |
| shadcn / Radix / 21st.dev / OriginUI | Their defaults are the "AI-looking" tell |
| Framer Motion | Would duplicate GSAP. One animation system |
| reCAPTCHA | A third-party script and a consent surface |
| A fifth page (blog, careers, team, process) | No content exists for any of them |
| A process diagram | **Nothing in the sources describes a process.** Pure invention, and the single most generic thing on agency sites |
| Testimonials | None exist |
| Marquees (>1) | The most over-used agency device of the last five years |
| Award badge grids | Set awards as a record; badges invite scepticism and add a second logo-rights problem |
| Mobbin MCP | Real and official, but an app-UI library — wrong genre — and paid |
| Motion.dev / OriginKit MCPs | **Do not exist as official servers.** Recorded as unverified rather than described |
| 3 of the 6 proposed agents | Duplicated `planner`, `qa-verifier`, `seo-auditor` |
| Blanket re-capture of client sites | Would present other agencies' current work as ours |

---

## Constraints

- **The deck gives names, URLs and screenshots. Nothing else.** No briefs, dates, outcomes, metrics or testimonials exist anywhere.
- **No phone, address, or social handles** exist in any source.
- ~~3 launch blockers outside our control~~ — **all resolved 2026-08-17**, see [[#D12 — The three blockers, resolved (2026-08-17)|D12]]. One residual constraint survives: **Tier-B provenance is still factually unknown**, which is why those projects carry no outbound link.
- **`#F62440` is AA-large only.** It permanently constrains where red can appear.
- **Work imagery is low-resolution** for anything not re-capturable — max 500KB, many under 100KB, cropped from a 4:3 deck.
- **The repo is public**, which constrains what may be committed.

---

## Discoveries

Things found during research that changed the plan:

1. **The legacy site is live and is a richer source than the deck.** It has the tagline, both emails, the About copy, eight service blurbs, and the careers line — none of which are in the credentials deck. It nearly wasn't checked.
2. **The deck contains a real brand device.** The stripe wasn't in the brief. It became the centre of the art direction.
3. **The logo's second bean is mirrored, not rotated.** Only found by measuring the terminal gap angles — 2–16° on the first, 162–178° on the second. The first reconstruction was wrong and looked it.
4. **The reference ships OGL, not three.js.** The single most decision-changing finding of the whole audit.
5. **Their `/work` is 25,660px on desktop but 10,600px on mobile** — mobile is a genuinely different composition. Now a requirement in [[Design#10 Responsive motion matrix|Design §10]].
6. **The palette has no ink.** Only surfaced by computing contrast rather than eyeballing it.
7. **It's 28 projects, not 24.** Slides 5–32. The first count was wrong.
8. **Slide 14 contradicts itself** — titled "Uncle Sams Kitchen", links `samskriti.in`.
9. **Most of the "trending skills" were already installed**, and two of three named MCPs don't exist.

---

## Lessons

- **Measure, don't eyeball.** Every important finding here — the mirrored bean, the missing ink, the contrast failures, the 28-vs-24 count — came from measurement. Impressions were wrong every time.
- **Check the client's existing site before the brief's reference.** More was learned from `coffeedigital.in` than from any amount of competitor analysis.
- **Verify before describing.** Two MCPs in the brief don't exist. Writing them up plausibly would have been the same failure class as inventing a testimonial.
- **Constraints are content.** "No metrics exist" isn't an obstacle to design around — it's what makes the schema-as-enforcement idea work.
- **A test that looks like it passed hasn't necessarily passed.** `decision-log.mjs` shipped inverted in its first version — silent when it should fire, firing when it should be silent. The cause was `.trim()` on `git status --porcelain` output, which strips the leading space from an unstaged modification's first line and shifts `slice(3)` by one character, so whichever file sorted first was invisible. The first test run *appeared* fine only because Node's async stdout on Windows interleaved the hook's output with the shell's echo, making a real inversion look like a display artifact. Re-running with captured output exposed it immediately. **When output ordering looks odd, capture it before dismissing it.**

---

## Standing checks

Applied at every review, indefinitely:

1. **The confusion test.** Logos removed — is this page distinguishable from the reference?
2. **The fabrication test.** Does every visible claim trace to Confirmed?
3. **The purpose test.** Does every animation have a stated purpose?
4. **The reduced-motion test.** Is the site complete and elegant with motion off?
5. **The stripe count.** Is the stripe doing a sixth job? If so, justify it here first.

---

## D12 — The three blockers, resolved (2026-08-17)

**B1 — logo rights: confirmed.** The 27 marks ship as designed. The typographic fallback is retired, though the principle behind it survives as the post-launch remedy: if a client objects, drop the mark and keep the name, because the names are confirmed facts independent of mark usage.

**B2 — the superlative: cut.** *"Perhaps, the most awarded team in digital media in India"* does not ship. Replaced with *"Recognised at Cannes, One Show, D&AD, the Webby Awards, the New York Festival, and Goafest."*

This is the more interesting of the three, because **the constraint improved the work**. A superlative invites *"says who?"* and carries ASCI exposure. Six named bodies answer the question before it's asked, and cannot be challenged. The risk wasn't mitigated — it was eliminated, and the line got better. Softened variants ("one of the most awarded", "among India's most awarded") are also out: the qualifier doesn't fix the absent basis.

**B3 — Tier-B provenance: conservative handling adopted.** Deck imagery, no outbound link.

⚠️ **Worth being precise about what this is.** We did not learn that Lenovo, Domino's, Colors, Spykar, Van Heusen, Toyota or B2X have been redesigned. We chose the handling that is correct whether they have or not: the deck screenshot is the genuine historical artefact, and showing it makes no claim about the site live today. Linking out *would* make that claim, so we don't.

The fact remains unknown, and the docs should keep saying so. The `tier` field means promotion stays a one-line content edit if provenance is ever confirmed — which is exactly why it's in the schema.

**Pattern across all three:** the honest handling was cheaper than the risky one, and in B2's case produced better copy. Worth remembering the next time a constraint looks like a loss.

## D13 — Obsidian direct, no MCP (2026-08-17)

**Rejected `mcp-obsidian`.** It reaches a vault over HTTP through a running Obsidian instance plus the Local REST API community plugin. Here the vault **is** the working directory — the same files, already fully readable and writable. It would have added a dependency, two failure modes (app closed, plugin dead) and four setup steps for zero capability.

Same test that rejected Mobbin: relevance over capability, fewer is better.

**What actually mattered was configuring the vault**, which was running on pure defaults:

- **90% of the vault was noise.** 276 of 308 markdown files came from `skills/Setup/` — the global setup, not project content. Search, graph and quick-switcher were all competing with it. Excluded; the index is now 32 files, all ours.
- **Link rot was one drag away.** `alwaysUpdateLinks` was off, so moving any note in the Obsidian UI would silently break its inbound links. This vault has 303 of them, and `Design` alone has 41 pointing at it.

**Two hooks make the vault live memory rather than passive files:** `vault-context.mjs` reads open blockers and recent decisions into every session start; `decision-log.mjs` notes when a decision-bearing document changed but `brain.md` didn't.

The second one exists because this file's failure mode is silence — decisions get made and simply never written down. It does not block, because whether an edit constitutes a decision is a judgement a hook cannot make.

**Lesson recorded separately below:** the first version of `decision-log.mjs` was inverted by a one-character parsing bug, and the first test *looked* like it passed.

---

## D14 — A 7th motion primitive: the skyline particle field (2026-08-21)

The footer's skyline band (`SkylineBand`) got an interactive layer: a canvas
particle field sampled from the same artwork, roaming gently at rest and
scattering away from the cursor within a radius — ported (not copied) from
Originkit hero-25's `svgparticle.tsx`/`particle-band.tsx`, cut from ~450 lines
to the roam+random-repulsion subset that config actually exercises, into
`src/features/footer/particle-skyline/`.

**Why this needs a 7th primitive rather than composing the existing six.**
Mask reveal, stripe wipe, roast ramp, counter, parallax, magnetic are all GSAP
tweens (or, for `FooterReveal`, react-spring springs) toward a declarative end
state — `gsap.to(el, { opacity: 1 })` has a start, an end, and a duration. A
particle field sampled from an image, with per-particle idle drift and a
physics response to a moving cursor position, has no end state — it runs
continuously, every frame, for as long as it's visible. There is no tween to
compose it from. This is exactly the bar CLAUDE.md's animation rule sets: "a
seventh requires an entry in brain.md justifying it."

**Scope discipline applied going in, not after the fact:**
- No `hoverTargetSelector`/`hoverExcludeSelector` ancestor-hover mechanic —
  that exists in the source to serve hero-25's `data-hero` whole-hero
  assemble/scatter interaction, which this footer has no equivalent of. Its
  absence also removes the `hide`-fade and assemble/scatter state machine
  entirely, since nothing else in the tuned config exercises them.
- No `outside` repulsion mode, no extra/padding particle states, no
  multi-colour — dead branches for `hoverType: "roam"` + `repulsionMode:
  "random"`, the only combination `particle-band.tsx` actually configures.
- `particleColor: "single"` collapses per-particle colour/alpha to two
  constants (the ink RGB, the roam opacity) — no colour or alpha field on the
  particle type at all.
- Zero new dependencies. Native Canvas 2D, the existing shared rAF ticker
  (`src/lib/animation/ticker.ts`, already used by the WebGL scene), and the
  existing `useLoopInView` IntersectionObserver-gated loop hook.
- Strict TypeScript throughout — the source has both `any` and `@ts-nocheck`
  file-wide; neither survived the port.

**Progressive enhancement, not a replacement.** `SkylineBand` — the static
mask, server-rendered, zero JS — still renders unconditionally. The particle
canvas is dynamically imported (`next/dynamic`, `ssr: false`) and layered on
top only once three things are true client-side: not reduced-motion, a
desktop/hover/fine pointer, and the chunk has actually resolved. Nothing
regresses for no-JS, reduced-motion, or mobile visitors — they see exactly
what `SkylineBand` rendered before this feature existed.

---

## D15 — The footer returns to a static close, and D14 is retired (2026-08-21)

The footer was rebuilt on a supplied marketing-footer reference: brand column
and blurb left, page list right, a horizontal contact strip, a hairline bottom
bar, stripe full-bleed along the bottom edge. What it replaced was the centred
"closing act" ported from Originkit hero-25 — badge, display headline,
highlighted word, CTA pair, skyline band, viewport-wide wordmark.

**D14 is retired.** `SkylineBand`, `SkylineStack` and the whole
`particle-skyline/` engine are gone from the footer, and the 7th motion
primitive goes with them. The primitive count returns to six.

The reason is not that the particle field was bad. It is that it was *that
footer's* furniture. The closing act was a full-height stage: a headline
needed a horizon under it, and the band gave the composition a floor. The new
footer is a directory — four zones on a grid, closing in roughly one screen —
and a decorative skyline in the middle of it is a texture with nothing to
support. Keeping it would have meant keeping a lazy chunk, a canvas, an rAF
loop and a 7th primitive to hold up a band that no longer had a job.

**What the reference could not bring with it.** Its address tile, phone tile,
four social icons and legal-link row all describe data Coffee Digital does not
have (brand-audit → Missing; TBD N1–N3) or pages that do not exist. Rule 0
means those zones are absent rather than filled. The contact strip keeps the
reference's tile *shape* and carries only the two confirmed mailboxes.

**Where `--heat` landed.** One element, as always: a 3px rule under
`info@coffeedigital.in`. It is persistent rather than hover-revealed — heat
measures 3.28:1 on peach, which clears the 3:1 UI-boundary threshold and fails
the 4.5:1 body threshold, so it can be the rule and never the label; and a
hover-only rule would not exist on touch at all. The careers route takes
`--ink-faint` at 1px, so primary and secondary differ by weight as well as by
colour.

### What the design review changed

The first build of this footer shipped a two-up **icon-in-a-bordered-box**
contact tile, and a wordmark in Outfit ExtraBold. Review caught both, and both
were wrong for the same underlying reason: the reference was being followed past
the point where this project's own system had an answer.

- **The tile was a ninth primitive.** Design.md §7 defines the CTA as *"a mono
  label with an animated rule and a trailing → — not a filled box"*, and says a
  ninth must first be proven not to be a variant of one of the eight. The tile
  was that primitive wearing different furniture — and the chevron inside the box
  was borrowed Originkit marketing-kit art. It is now the primitive as specified.
  `closing-marks.tsx` is deleted with it; **no borrowed asset remains in the
  footer**, the arrow is a text glyph.
- **The wordmark was in the wrong face.** Design.md §4 assigns display to Jost
  *because the logotype is Futura-consistent*, and the real mark
  (`public/brand/wordmark.png`) is light geometric. Extrabold at `-0.03em`
  misrepresented it. Now Jost 500 via `font-hero` — which, until this change, was
  loaded in `layout.tsx` and used by exactly zero components.
- **The hierarchy contradicted its own spec.** `specs/footer.md` called Zone 3
  the primary CTA while the addresses were set smaller than the page list. The
  addresses are now the largest thing after the wordmark.
- **The mono register was missing.** Every string was `font-display`, with
  `uppercase tracking` simulating labels. Geist Mono was already being fetched in
  `globals.css`; it just had no `--font-mono` mapping in `@theme`. It does now,
  and the contact labels and legal row use it.

**Two smaller corrections came with it.**

- The stripe moved from the top of the footer to the very bottom edge, which is
  where `specs/footer.md` always said it went. The site's last element is now the
  brand device. A second instance takes the stripe's **section-divider** job
  (Design.md §7, job 1 of 5) between the masthead and the contact band — that is
  what closes the void the two-pole masthead opens, and it is a sanctioned job,
  not a sixth one. `StripeDivider` is a sibling of `StripeEdge` rather than a prop
  on it, because that component's doc scopes it to one job on purpose.
- Dividers moved from `--hairline` to `--overlay-line`. `--hairline` is a
  paper-ground token; on `--peach` it is very nearly invisible, so the old
  footer's rules were decorative in name only.

### The rem trap, and why this file writes px

Worth recording because it will recur in every component, not just this one.

`globals.css` derives the root font-size from the viewport, and **each breakpoint
restarts the ramp**. So a rem value does not descend monotonically with the
viewport — it sawtooths. The root is ~10px at 641px, climbs to 16px at 1024px,
then drops to ~11.4px again at 1025px.

Consequences found in this footer, all of them silent:

- `min-h-11` (2.75rem) resolves to ~28px on tablet widths, where WCAG wants 44.
- `text-[0.95rem]` renders 13.5px on a 1280px laptop and 11.4px at 768px, under
  Design.md §4's "never below `--fs-small`" 14px floor.
- `h-[0.25rem] md:h-[0.375rem]` on the stripe produced ~7px at 639px, 2.7px at
  700px and 4.5px at 768px — the responsive "step" ran **backwards** through the
  middle of the range.
- `h-[0.125rem]` vs `h-px` for the two address rules collapsed to 1.25px vs 1px
  on tablet, so the non-colour differentiator evaporated exactly where it mattered.

**Rule going forward: any quantity with a real floor — touch targets, type
minimums, hairline and stripe weights — is written in CSS px.** Everything else
stays rem and keeps scaling. In this footer that means `min-h-[44px]`, `h-[3px]`,
and `clamp(<px floor>, <fluid ideal>, <px cap>)` on every content string.

**The root cause is upstream and still open.** `src/styles/tokens.css` is 39
lines and defines **colour only**. Design.md's type scale (§4), 4px space scale
(§5), durations and easings (§9) were never implemented, which is why no
component in this repo consumes `--fs-*`, `--space-*`, `--dur-*` or `--ease-*` —
they don't exist. Until they do, every component re-derives its own scale in
arbitrary bracket values, and this class of bug stays live site-wide. Building
that token layer is the single highest-leverage cleanup left.

---

## D16 — The stripe device is retired (2026-08-22)

**The 186-band stripe is gone from the site.** `public/brand/stripe.svg` and
`src/components/common/stripe/` are deleted. Nothing replaces it.

**Why.** Every band in that artwork is a brown: `#3E210F` through `#472D1D`,
with `#3F2210` the most-used at 25.14%. None of them are in the locked palette.
So the one device the system called its "connective tissue" was, in practice,
the only thing on the site still painting the dead brown trio — the exact
palette the lock exists to keep out. It read as the old website every place it
appeared. Design.md §7 protected it with a five-jobs rule; that rule was
protecting the wrong thing.

**What went.** Two of the five jobs were built and both are now removed: the 3px
section divider between the footer's masthead row and its contact band, and the
6px footer edge as the document's last element. The other three (scroll
progress, page-transition wipe, tile-hover mask) were never built and are now
cancelled rather than pending.

**What replaces it: nothing.** Considered and rejected — a solid `--rule` /
`--ink` band (keeps the device's shape but the shape was never the point), and a
hard-stop segmented band across the locked palette (would have spent `--heat`
in a decorative rule, twice per page). Sections now separate by **ground colour
and whitespace alone**. In the footer neither stripe was load-bearing: the
masthead and the contact band are already far apart vertically, and the document
ending on flat `--peach` is a cleaner close than ending on a band.

**Consequence for §5 of specs/home.md.** The needs section paints **no ground of
its own**. The home page has one ground — `main`'s `bg-scene-backdrop`, `--cream`
`#fff2db`, which is also `sceneConfig.colors.fog`, so the CSS surface and the
WebGL fog are the same colour and the page is continuous from hero to footer.
Losing the divider is therefore not a loss: there is no boundary to draw between
two halves of one surface. Separation is whitespace and the type ladder.
`--paper` was tried for that section and reverted — it introduced exactly the
seam the single ground exists to avoid.

**`--ink` is unaffected.** `#3F2210` was *derived* from the stripe's darkest
band ([[brand/palette]] §2). That derivation is history, not a dependency; the
token stays exactly as it is, as does the rest of the locked palette.

⚠️ **This leaves a real gap.** Design.md principle 2 was "the stripe is the
system" — the test for whether connective tissue came from Coffee Digital's own
asset rather than from a trend. That test now has no device behind it. The
remaining owned marks are the bean (cursor, preloader) and the roast ramp.
Whether the site needs a replacement structural device, and what it is, is
**open** — logged in [[TBD]]. Do not invent one to fill the hole; a site that
separates by ground and type is coherent, and that is what ships until there is
a decision.

---

## D17 — The motion token layer exists (2026-08-22)

**Design.md §9's easings and durations are now real.** They live in
`src/styles/tokens.css` as `--ease-out-quint` / `--ease-out-expo` /
`--ease-in-out` / `--ease-linear` and `--dur-instant` → `--dur-reveal`, verbatim
from the spec. `src/motion/tokens.ts` exposes the same values to JavaScript by
**reading them off the document at runtime**, so there is exactly one definition
of each curve and no drift.

**Why now.** `.claude/hooks/guard-tokens.mjs` blocks any inline `cubic-bezier()`
outside `src/styles/tokens.css` and points at "`EASE.*` in `motion/tokens.ts`" —
a file that did not exist. The guard was enforcing a layer nobody had built, so
the first animation that needed a named curve could not be written at all. This
is the exact debt the *Lessons* section above describes: tokens specified,
never implemented, every component re-deriving its own values in bracket
literals.

**Why `motion/tokens.ts` reads CSS instead of holding the numbers.** The Web
Animations API cannot resolve a custom property — `element.animate` needs a
literal easing string — so JavaScript needs the value somehow. Duplicating the
curves would create two sources of truth and would itself trip the guard.
Reading `getComputedStyle(document.documentElement)` once and caching it keeps
`tokens.css` authoritative. Fallbacks are deliberately generic keywords
(`ease-out`), not copies of the real curves: if the token layer ever fails to
load, motion should degrade to something plainly wrong-but-sane rather than
silently pretend to be on-brand.

⚠️ **Still outstanding:** the type scale (`--fs-*`) and the 4px space scale
(`--space-*`). Those remain the larger half of the cleanup, and until they land
components keep writing `clamp()` and bracket spacing by hand. This decision
does not close that.

---

## D18 — WebGL is the home page, and D3 is superseded (2026-08-22)

**This is a ratification, not a proposal.** The code made this decision over
several commits; the documents never caught up. D18 records what was actually
built and closes the gap.

### What is true

The home page is a **three.js** scene. `src/features/home/scene/` is a
scroll-driven particle sequence — a glyph that scatters, a hand, a wave, a tree
— with curl noise, a bloom pass, a wipe pass and a baked point cloud
(`public/assets/bean/points.bin`). The work carousel is a **second** WebGL
scene with its own shaders (`work-carousel/gl/`), including a Bayer-dither
reveal. `three` is imported in 18 files.

D3 said none of this would exist. Three documents still repeated "No WebGL":
[[README]], [[hand-off]] and the [[TBD#Resolution log|TBD resolution log]]
("No WebGL in v1 — Harsh (plan approval)"). All three were wrong on 2026-08-22
and are now corrected.

### Why the reversal stands

D3's reasoning was *"an abstract statement needs a subject; ours doesn't — we
have the stripe and the bean."* **That premise died with the stripe** ([[#D16 — The stripe device is retired (2026-08-22)|D16]]).
The device that was supposed to carry the site's connective tissue was deleted
because every one of its 186 bands was off-palette. What replaced it is the
particle scene, and the subject it renders is the **bean** — the one owned mark
that survived. So the scene is not a trend import; it is the brand asset D3
named, animated.

The cost D3 feared is real and is now measured, not guessed — see the budget
section below. It is accepted with open eyes.

### What this costs, measured (2026-08-22, production build, gzipped)

| Route | Initial JS | Old budget | Note |
|---|---|---|---|
| `/` | **474.5 KB** | 140 KB | three.js is 124.9 KB of it |
| `/work` | **313.1 KB** | 140 KB | second GL scene |
| `/services`, `/about` | **242.3 KB** | 140 KB | text stubs — no GL, still over |

**The 140KB budget is retired.** It was set for a no-WebGL site and cannot be
met by this one; quoting it in CI would only teach everyone to ignore the build.
Replaced by honest per-route ceilings in [[PRD#16 Performance requirements|PRD]],
set at today's measurement so a *regression* still fails even though the
absolute numbers are high.

⚠️ **The stub-page number is the one to be angry about.** `/services` and
`/about` render a heading and a list, load no WebGL, and still ship 242 KB —
that is the global layout (`ScrollProvider`/Lenis/`AdaptiveGrid`) mounting on
every route. That is a genuine, fixable regression and it is the first
performance task, not the home page.

### What is *not* reopened

three.js earned its place on the home page. That is not licence to add a fourth
runtime. **Still rejected:** R3F, Drei, Framer Motion, a CMS, a component
library. `@react-three/fiber` was installed but imported nowhere — removed on
2026-08-22.

---

## D19 — The dead-code cull (2026-08-22)

An audit walked the import graph from all 14 App Router entry points. **32 of
168 source files were unreachable — 5,473 lines, 28% of `src/`.** All were
deleted. What went, and why it was there:

| Removed | Lines | Why it existed |
|---|---|---|
| `src/components/originkit/` | 2,713 | Vendored third-party hero ("hero-25"). **Never committed, never imported.** Backed up outside the repo before deletion |
| `src/features/home/showreel/` | 1,982 | Superseded by the work carousel in `44df624`; dropped from `home.tsx` and never removed |
| `src/features/footer/` (`closing-stage`, `hands-scene`, `assets`) | 383 | The closing act retired by [[#D15 — The footer returns to a static close, and D14 is retired (2026-08-21)|D15]] |
| orphan hooks + `live-dot`, `hash-link`, `progress-trigger` | 395 | Left behind by earlier refactors |

Also removed: **23.6 MB** of unreferenced `public/` assets — `public/hero/`
(22 MB of video belonging to the showreel) and `public/generated/`.
`public/` went from 26 MB to 2.6 MB.

Two conflicting Tailwind `@theme` blocks came out with the originkit code. Both
were imported by `globals.css`, both redefined `--font-sans` and all twelve
breakpoints, and the *dead* one won on import order. Nothing live referenced a
single token from either.

**The lesson worth keeping:** every one of these was reachable-looking. The
showreel had 27 files and a `noscript` block; the originkit hero was 2,700 lines
of plausible code. Nothing but an import-graph walk distinguishes that from live
code, and grep does not — `grep showreel src/` returns hits from comments long
after the last import is gone. Walk the graph from the entry points.

---

## D20 — The footer reveal leaves the spring runtime (2026-08-22)

**Rule touched:** *"spring components, no CSS transitions"* and *"compose the six
motion primitives"*. This is the brain.md entry those rules require.

### The problem

`SiteFooter` is the **global** footer — it renders on `/work`, `/services`,
`/about` and `/contact`. Its entrance reveal ran on `@react-spring/web` through
`Inview`, and `ReducedMotion` (mounted in the root layout) imported the same
package purely to flip its global `skipAnimation`.

Between them they put **~50KB gzipped of spring runtime on four routes that use
a spring for nothing else.** `/services` renders a heading and a list, and cost
204KB to do it.

### The decision

The footer reveal is now a **CSS transition driven by an IntersectionObserver**,
and `ReducedMotion` moved from the root layout into `HomeView`.

The motion is a soft, critically-damped spring with no overshoot — `opacity 0→1`
and `y 30→0`, config `{mass: 1, tension: 88, friction: 30}`. `--ease-out-quint`
reproduces that closely enough to be hard to tell apart side by side. A physics
engine buys interruptibility and reversibility; this reveal is `mode="once"` and
is never interrupted or reversed, so it was paying for neither.

**Springs stay everywhere else.** The home scene, the overlays and the act-window
system genuinely need interruptible, reversible motion, and they run on a route
that already carries the runtime. This is not a migration away from react-spring
— it is one component that was on the wrong side of a route boundary.

### Result

| Route | Before (modern) | After |
|---|---|---|
| `/services`, `/about` | 203.8KB | **183.7KB** |
| `/work` | 274.5KB | **254.4KB** |
| `/` | 436.1KB | 435.4KB (unchanged — it keeps the runtime) |

### Two things the rewrite got right that the spring version had wrong

1. **No first-paint flash.** The old shape rendered visible, then hid, then
   animated in, because arming happened in an effect after paint. The new one
   measures first: anything **already on screen at mount stays visible and never
   animates**. Only below-the-fold elements are hidden and armed, and they are
   off-screen while it happens.
2. **Nothing can be stranded.** Caught in verification, not shipped: a
   `rootMargin` of `0 0 -10% 0` shrinks the observer's viewport, and the
   copyright line comes to rest inside that dead band at the bottom of a fully
   scrolled page — so it sat at `opacity: 0` **permanently**, with no scroll left
   to fix it. Content hidden by animation, which is the exact failure the hard
   rule exists to prevent. Plain intersection fires marginally earlier and cannot
   strand anything.

⚠️ **`ReducedMotion` now mounts in `HomeView`, not the layout.** If another route
introduces a spring, it must mount `<ReducedMotion />` too or
`prefers-reduced-motion` is silently ignored there. `FooterReveal` handles its
own reduced-motion branch (it never arms), so it does not depend on it.

### What is left, and why it stopped here

`/services` is now **183.7KB**: ~138KB of irreducible React + react-dom + App
Router runtime, **29.8KB of GSAP**, 7KB Lenis, 9KB Zustand.

GSAP is now the largest addressable item on every text page, and it has exactly
**one** consumer — the staggered menu's open/close timeline. But that is 267
lines of GSAP-idiomatic work (paused timelines, staggered pre-layers, a custom
`--sm-num-opacity` property tween, an icon spin, a text cycle with callbacks)
driving the site's primary navigation. Porting it is a rewrite with real
regression risk on the one control every page depends on, and it is the
substance of the open [[TBD#S9|S9]] decision rather than a bundle tweak.
**Left for that decision, deliberately.**

---

## Open questions

Tracked in [[TBD]]. Now that the blockers are closed:

- **The voice decision (S1)** is the highest-leverage question left. It should be settled before a line of copy is written; reversing it later is expensive.
- **Tier-B provenance** is closed as a *decision* but still open as a *fact*. If the client ever volunteers which builds are still theirs, several projects gain a live link and the portfolio gets stronger.
- **Contact data (N1–N3)** — phone, address, socials. Not blocking, because the presence pattern means each is a one-line edit whenever it arrives.

---

## Future ideas

Not commitments.

- One OGL effect on work-tile hover — behind a measurement gate
- Real case studies, if the client ever supplies briefs and outcomes
- A dark variant of the Roast Ramp — would need its own ink and heat re-derived
- The stripe as an animated favicon or OG image generator
- Print/PDF stylesheet, so the site can replace the PowerPoint entirely
