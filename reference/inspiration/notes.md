---
tags: [reference, inspiration]
---

# Inspiration — Curated, Not Collected

> **The rule for this folder:** a reference earns its place only when it answers a question we actually have. No mood-boarding, no "this looked nice". Every entry states the question, and no entry claims analysis that hasn't been done.

Related: [[../trionn/notes|trionn/notes]] · [[../README|reference/README]]

## Status key

- **🔍 Audited** — inspected first-hand; findings recorded and cited
- **📋 Queued** — named for a stated reason; **not yet inspected, so nothing is claimed about it**

---

## 🔍 Audited

### Trionn — https://trionn.com

The primary reference, audited in full. Four dedicated documents:
[[../trionn/tech-stack|tech-stack]] · [[../trionn/interactions|interactions]] · [[../trionn/breakdown|breakdown]] · [[../trionn/notes|notes]]

**Question it answers:** what does a peer studio — independent, Indian, award-featured, same four-page IA — actually ship, and on what stack?
**Headline finding:** OGL, not three.js; Next.js + Tailwind v4 + GSAP + Lenis; self-hosted on Apache.
**What we must not copy:** near-black ground, SVG connector curves on the work grid, the mascot, the marquees.

### coffeedigital.in — the client's own legacy site

Audited as a **source**, not as inspiration — findings live in [[../../brand/brand-audit|brand-audit]].

**Question it answers:** what does Coffee Digital already say about itself, and in what voice?
**Headline finding:** it supplies the tagline *"the digital branding people"*, both public emails, the eight service blurbs, and the "3C's" careers line — none of which appear in the credentials deck. It also already uses the four-page IA.

---

## 📋 Queued — with reasons, without claims

Each is listed because we have a **specific open question**. None has been inspected. **Nothing below should be treated as a finding, and no design decision may cite these until they carry an 🔍.**

| Question we need answered | Where to look | Why there |
|---|---|---|
| How do premium sites handle a **long project index** without a 25,000px scroll? | Awwwards / FWA "Sites of the Day", filtered to agency portfolios | Directly addresses our 28-project problem — the one place Trionn is weakest |
| What does a **case-study modal with shallow routing** feel like when done well? | Any studio site using `?case=` or a similar overlay pattern | Our locked `/work` decision has no audited precedent yet |
| Precedent for a **light, warm-ground** premium agency site | Awwwards, filtered to light themes | Nearly all high-motion agency sites are dark. We need proof the warm-light direction can carry the same weight |
| How is a **repeating graphic device** used as connective tissue across a whole site? | Brand-system case studies; identity-design showcases | The stripe is our central bet — worth seeing the pattern executed well before we commit |
| Reduced-motion done properly on a **motion-heavy** site | Any of the above, with `prefers-reduced-motion` forced on | Our accessibility requirement, and the thing almost every awarded site gets wrong |

### Deliberately not queued

- **Dark-themed agency sites.** We have one (Trionn) and our direction is light. More would only pull us toward the thing we're avoiding.
- **SaaS landing pages.** Wrong genre entirely.
- **Template galleries and UI kits.** These are the source of the "AI-looking layout" the brief warns against.
- **Anything WebGL-heavy.** We resolved not to ship WebGL in v1. Collecting more of it would relitigate a settled decision.

---

## Method note

When a queued item is promoted to 🔍, it gets the same treatment Trionn received: verify the stack from public payload only, capture at desktop and mobile, record the **purpose** of each pattern, and state explicitly what we would *not* copy. A reference without a "what not to copy" line is an incomplete reference.

Public sources only. No authentication, paywall, or access control is bypassed for any entry in this folder.
