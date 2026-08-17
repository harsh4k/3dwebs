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
**Effect:** [[pages/home#§2 — Proof|home §2]] and [[pages/about#§3 — Clients|about §3]] ship as designed — the mark grid, not the typographic fallback.
**Standing condition:** this is a blanket confirmation, not a per-brand licence review. If any individual client objects post-launch, that mark is removed and the name retained in text — the names are confirmed facts independent of mark usage.

### ✅ B2 — "Perhaps, the most awarded team in digital media in India" — RESOLVED: CUT

**Resolution (2026-08-17, Harsh): the superlative is cut.** No sign-off was claimed, so it does not ship.
**Replacement — factual framing, every word verifiable from deck slide 3:**

> Recognised at Cannes, One Show, D&AD, the Webby Awards, the New York Festival, and Goafest.

**Why this is the better outcome:** an unqualified superlative invites the question *"says who?"* and carries ASCI exposure. Six named award bodies answer the question before it is asked. It is specific where the superlative was vague, and it cannot be challenged.
**Effect:** [[pages/about#§2 — Awards|about §2]].

### ✅ B3 — Tier-B provenance — RESOLVED: conservative handling stands

**Resolution (2026-08-17, Harsh): ship the conservative handling.** Tier-B projects show **deck imagery with no outbound link**.

⚠️ **This is a decision, not a finding.** It was not established that these sites *have* been redesigned — we chose the handling that is safe either way. B2X, Toyota (Prado & Prius), Lenovo, Colors TV, Spykar, Van Heusen and Domino's are presented via the deck screenshot, which is the genuine historical artefact of Coffee Digital's work, with no claim about the site live today.

**Promotion path:** if the client later confirms a specific build is still theirs, that project moves to Tier A — re-capture, add `liveUrl`, done. One content edit per project, no component changes.

---

## ⚠️ Section blockers

### S1 — Voice

**Need:** a decision between two confirmed registers.
- **Legacy site** — lowercase, first-person, wry. *"we can turn a Monday into a Friday"*, *"we are not Google, but…"*
- **Deck** — title case, corporate, emoji-bulleted.

**Recommendation: legacy.** It is more distinctive, unmistakably human, and supplies confirmed copy for eight service descriptions ([[pages/services#The lucky finding|services]]).
**Owner:** Harsh + Coffee Digital
**Affects:** every line of copy on the site. **Decide early** — reversing it after copy is written is expensive.

### S2 — Budget bands in ₹

**Need:** 4–6 bands appropriate to Coffee Digital's actual project sizes, in rupees.
**Owner:** Coffee Digital
**Affects:** [[pages/contact#§2 — Enquiry form|contact form]]
**Note:** the field must stay **optional** with a `Not sure yet` option — a budget question that blocks submission costs enquiries.

### S3 — Slide 14 discrepancy

**Need:** slide 14 is titled *"Uncle Sams Kitchen"* but hyperlinks `samskriti.in`. Which is correct, and is the other a separate project?
**Owner:** Coffee Digital
**Affects:** [[pages/work|work]] — the entry is **withheld from the site** until resolved.

### S4 — "We usually reply within one business day"

**Need:** confirmation this is actually true.
**Owner:** Coffee Digital
**Affects:** [[pages/contact#§1 — Header|contact]]
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
| 2026-08-17 | **B1** | **Client logo rights confirmed.** The 27 marks ship as designed | Harsh |
| 2026-08-17 | **B2** | **Superlative cut.** Replaced with a factual framing naming six award bodies | Harsh |
| 2026-08-17 | **B3** | **Conservative Tier-B handling adopted** — deck imagery, no outbound link. A decision, not a finding; projects can be promoted to Tier A if provenance is later confirmed | Harsh |
| 2026-08-17 | — | Palette locked to `#FFFAF3` `#FFF2DB` `#FFE5BF` `#F62440`; `--ink` `#3F2210` derived from the brand stripe | Harsh |
| 2026-08-17 | — | `/work` uses a modal with shallow routing, not detail routes | Harsh |
| 2026-08-17 | — | Work imagery re-captured from live sites, tiered | Harsh |
| 2026-08-17 | — | Contact renders placeholders only when data exists | Harsh |
| 2026-08-17 | — | No WebGL in v1; no CMS; no UI component library | Harsh (plan approval) |
