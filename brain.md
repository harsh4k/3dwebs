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

### D3 — No WebGL in v1

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
- **3 launch blockers** are outside our control — logo rights, the awards superlative, Tier-B confirmation. See [[TBD]].
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

---

## Standing checks

Applied at every review, indefinitely:

1. **The confusion test.** Logos removed — is this page distinguishable from the reference?
2. **The fabrication test.** Does every visible claim trace to Confirmed?
3. **The purpose test.** Does every animation have a stated purpose?
4. **The reduced-motion test.** Is the site complete and elegant with motion off?
5. **The stripe count.** Is the stripe doing a sixth job? If so, justify it here first.

---

## Open questions

Tracked in [[TBD]]. The ones that keep me up:

- **Logo rights (B1)** is the largest single risk. If refused, the proof sections change form entirely. Worth asking *first*, not last.
- **The voice decision (S1)** should be settled before a line of copy is written. Reversing it later is expensive.
- **Tier B (B3)** may resolve to "most of these were redesigned years ago", which would shrink the honest portfolio considerably. Better to know early.

---

## Future ideas

Not commitments.

- One OGL effect on work-tile hover — behind a measurement gate
- Real case studies, if the client ever supplies briefs and outcomes
- A dark variant of the Roast Ramp — would need its own ink and heat re-derived
- The stripe as an animated favicon or OG image generator
- Print/PDF stylesheet, so the site can replace the PowerPoint entirely
