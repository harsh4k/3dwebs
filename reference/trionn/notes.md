---
tags: [reference, art-direction, decisions]
---

# Trionn — Why It's Here, and Where We Diverge

**URL:** https://trionn.com · **Audited:** 2026-08-17
Related: [[tech-stack]] · [[interactions]] · [[breakdown]]

---

## Why this reference exists

It is the reference Harsh named, and it earns the slot for a specific reason: **it is the closest possible comparable.** An independent, award-featured Indian digital studio, selling design and build services to other companies, with the exact four-page information architecture we've been asked for — `/work`, `/services`, `/about`, `/contact`.

That makes it useful as a **structural** reference. It is deliberately *not* a visual reference.

## The single most valuable finding

**They ship OGL, not three.js.**

The most technically ambitious thing on their site — an interactive WebGL hero with a press-and-hold interaction — runs on a ~10 KB library. A studio whose whole pitch is technical craft, that has been featured by Awwwards, FWA, CSSDA and GSAP, looked at three.js and did not use it.

This is the evidence that settles our own 3D question. See [[../../architecture|architecture]].

## The second most valuable finding

**Their IA validates the brief.** Four pages plus a story page. `robots.txt` even disallows `/work/`, conceding that individual case pages carry no search value. Our modal-based case view reaches the same end state with less to build and less to crawl.

---

## What we take, adapt, reject

| Pattern | Verdict | Reasoning |
|---|---|---|
| Four-page IA | **Take** | Independently validated by Coffee Digital's own legacy site, which already uses it |
| `easeOutQuint` `cubic-bezier(.22,1,.36,1)` | **Take** | A curve is not ownable, and this one is genuinely the right shape for premium deceleration |
| Fluid `clamp()` type scale with a `vw` term | **Take** | Correct technique, universally applicable |
| Tailwind v4 + CSS custom properties | **Take** | Matches our plan and Harsh's global defaults |
| Budget-band selector on the contact form | **Take** | Qualifies leads before a call. Genuinely good product thinking |
| Odometer number counters | **Adapt** | The mechanism is right; our content is the awards tally, which is far stronger than "50+ projects" |
| Ground-colour change between sections | **Adapt** | They hard-invert dark↔light. Ours is the continuous, always-warm **Roast Ramp** |
| Persistent contact CTA in the nav | **Adapt** | Ours becomes the stripe-wipe menu, not a pill pair |
| Full-screen menu overlay | **Adapt** | Same purpose, our own transition device |
| **Offset `/work` grid with SVG connector curves** | **Reject the execution** | Their most recognisable signature. Copying the connectors would be plainly derivative. **Our connective tissue is the stripe** — from Coffee Digital's own deck |
| **Near-black `#040508` ground** | **Reject** | Ours is `#FFFAF3`. The strongest single anti-clone lever available |
| Infinite marquees (×2) | **Reject** | The most over-used agency device of the past five years |
| WebGL hero | **Reject for v1** | Justified for *them* — an abstract statement needs a subject. Ours has the stripe and the bean, both of which are cheaper and more on-brand |
| AI-generated mascot imagery | **Reject** | Their three-headed-lion mascot is their brand story. We have coffee, and we have 27 real client logos |
| Audio testimonials | **N/A** | Coffee Digital has no testimonials |
| Cookie consent banner | **Reject** | Cookieless analytics means no banner, and no banner overlapping content |
| Four font families, two commercial | **Reject** | Three max, all open |
| 29-term keywords meta | **Reject** | Dead weight |

---

## Where we are structurally similar — and why that's fine

Both sites will have: four pages, a work index, a services page, an about page with credibility markers, a contact form with a budget field, smooth scrolling, scroll-triggered reveals, and a full-screen menu.

That is not imitation, it is **the correct solution to the same problem**. Agency sites converge on this shape because it works. Differentiation lives in art direction, motion vocabulary, and content — not in inventing a novel place to put the contact link.

## Where we must be actively different

Four things do the real work of separating us:

1. **Ground.** They are near-black. We are warm off-white, walking a roast ramp. This is the largest perceptual difference available and it costs nothing.
2. **Connective device.** They connect with hairline SVG curves. We connect with the **stripe** from the credentials deck — a real, ownable brand asset no competitor has.
3. **Proof.** They lead with `50+` projects and `1.5K+`. We lead with **Cannes, Webby, D&AD, One Show, Goafest** and 27 named brands. Coffee Digital's proof is objectively stronger and needs no invention.
4. **Voice.** They write clipped and corporate — *"Designed to mean something."* Coffee Digital's own legacy voice is lowercase and wry — *"we can turn a Monday into a Friday"*. Using it is both more distinctive and more honest.

## The risk to watch

The brief asks for a site that feels like Trionn's *class* without being its *clone*. The failure mode is subtle: adopting enough individual patterns that the whole reads as derivative even though no single element was copied.

**The test, applied at every review:** *if you removed our logo and their logo, would anyone confuse the two pages?* Ground colour, connective device, and proof content should make the answer obviously no. Logged as a standing check in [[../../brain|brain]].
