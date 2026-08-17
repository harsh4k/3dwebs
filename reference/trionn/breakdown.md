---
tags: [reference, layout, information-architecture]
---

# Trionn — Page-by-Page Composition

Section order and content shape for each page, from captures and the DOM payload. This is the structural input to our own page specs.
Related: [[notes]] · [[interactions]] · [[tech-stack]]

---

## Home — 6,575px desktop / 8,089px mobile

| # | Section | Content | Note |
|---|---|---|---|
| 1 | Hero | `Designed to mean something.` + two CTAs + WebGL object + `EST. 2012 / 14+ years` corner block | Statement, not a value proposition |
| 2 | Positioning | One sentence: *"Websites, AI products, brands, and systems built for clarity, scale and impact."* | Plain-language translation of the abstract hero |
| 3 | About | 3 short paragraphs + `more about us` | Teaser, defers to `/about` |
| 4 | Brand marquee | `Inspire · innovate · Impact` ×4 | Pure texture |
| 5 | **Key facts** | 3 stat cards: 50+ projects · 1.5K+ · 20+ team, plus awards logo strip | Light ground. Credibility block |
| 6 | Partners | Logo marquee ×5 | |
| 7 | **Selected work** | 3 featured projects + `view all projects` | Only 3 — restraint |
| 8 | Services | 6 service cards + 4 discipline labels + `view services` | Teaser, defers to `/services` |
| 9 | Client stories | Tabbed testimonials, some with audio | |
| 10 | Contact | Full form inline + Calendly + mailto | **Form is on the home page, not just `/contact`** |
| 11 | Footer | | |

**Read:** the home page is a **gateway with a conversion floor**. Every content section is a teaser that defers to its page — except the contact form, which is fully present. You never have to navigate to enquire.

**For us:** the same gateway logic, but our home carries a *compressed* contact block (headline + email + one CTA) rather than the full form. Coffee Digital's proof is awards, not stats — so our equivalent of §5 is the strongest section on the page. See [[../../pages/home|pages/home]].

---

## Work — 25,660px desktop / 10,600px mobile

| # | Section | Content |
|---|---|---|
| 1 | Header | Page title |
| 2 | **Offset project grid** | Two columns, vertically staggered, SVG hairline connectors, per-tile parallax |
| 3 | Closing CTA | |

Each tile: image (with small uppercase mono caption overlaid), project name, one-line description, `EXPLORE PROJECT →`.

**Read:** one idea, executed at length. Desktop is **2.4× taller than mobile** — the mobile version is a genuinely different composition, not a reflow.

**For us:** 28 projects vs their ~12 means a single long scroll would be punishing. Ours is a **filterable index with a case modal**, so depth is opt-in. See [[../../pages/work|pages/work]].

---

## Services — 6,254px

Six services, each with a title and a single sentence: AI & Intelligent Automation · Web Development · Product Design · Website & Mobile Design · WordPress Development · Branding. Grouped under four discipline labels: `A.I. · Design · Development · Branding`. Punctuated by aphorisms — *"✦ Design with intent. Built to work."*

**Read:** shortest possible service copy. One sentence each. No pricing, no process diagram, no packages.

**For us:** Coffee Digital has **three named pillars with twelve items** from the deck. The discipline-label grouping maps almost directly. See [[../../pages/services|pages/services]].

---

## About — 18,033px

The longest page after `/work`. Carries the origin story, mission, team, and the `/trionn-story` spin-off about their three-headed-lion mascot.

**Read:** they had to *build* a story — an invented mascot and a name etymology — because a 14-year-old studio's real differentiators are thin.

**For us: the exact opposite problem.** Coffee Digital's story is already extraordinary and entirely factual — Cannes, Webby, D&AD, One Show, Goafest, and clients from Google to Emirates. **We have no need to invent, and no licence to.** Our `/about` is shorter and hits harder. See [[../../pages/about|pages/about]].

---

## Contact — 3,473px desktop / 2,974px mobile

| # | Section | Content |
|---|---|---|
| 1 | Header | *"Let's build something great."* + *"we usually reply within one business day"* |
| 2 | Form | name · email · service select · message (min 20 chars) · budget band · submit |
| 3 | Alternatives | Calendly 30-min booking · plain mailto |
| 4 | Footer | |

Service options: Website Design & Development · UI/UX Design · Web Development · Mobile App Design · Branding & Identity · AI-Powered Digital Product · Something Else
Budget bands: Under $5K · $5–15K · $15–30K · $30–60K · $60K+ · Not sure yet

**Read:** the shortest page on the site, by design. Three ways to make contact, ranked by commitment. The response-time promise reduces friction at almost no cost.

**For us:** structure adopted wholesale — it is simply correct. Service options come from Coffee Digital's three pillars; budget bands need converting to ₹ and client confirmation. See [[../../pages/contact|pages/contact]].

---

## Global patterns

| Element | Behaviour |
|---|---|
| Nav | Persistent. Wordmark left; `LET'S TALK` + `MENU ☰` right; audio toggle. Full-screen overlay menu |
| Footer | Nav repeat · business enquiry (email, phone) · socials (LinkedIn, Facebook, Dribbble, Instagram) |
| CTA style | Uppercase mono label + underline rule + trailing `→` |
| Eyebrows | Lowercase or uppercase mono, small, wide-tracked — `about`, `OUR SERVICES` |
| Aphorisms | `✦`-prefixed one-liners used as section punctuation |
| Section headings | Two-line, second line indented or offset |

**The transferable structural lesson:** every content section on the home page is a *teaser that defers to its page*, and every page ends in a CTA. That discipline is what keeps a four-page site from feeling thin — and it is what we adopt.
