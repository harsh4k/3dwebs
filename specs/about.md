---
tags: [page-spec, about]
---

# About

Route: `/about` · Upstream: [[../PRD|PRD]] · [[../Design|Design]] · [[../brand/brand-audit#Awards — S1 slide 3, verbatim|brand-audit]]

## Objective

Establish credibility. This page carries **the single strongest asset Coffee Digital has — the awards record** — and it is currently invisible on their live site.

## User intent

*"Are these people legitimate? Who are they, and can I trust them with a serious budget?"*

## The inversion

The reference site's `/about` is 18,033px — their second-longest page. They had to *construct* a story: an invented three-headed-lion mascot, a name etymology, a spun-off `/trionn-story` page. A 14-year-old studio's genuine differentiators were thin, so narrative filled the gap.

**Coffee Digital has the opposite problem.** Cannes Cyber Lion finalist twice. One Show Merit. Webby People's Voice *and* People's Choice. D&AD finalist. New York Festival finalist twice. A jury seat. Gold at Goafest. Clients from Google to Emirates to Johnson & Johnson.

**We have nothing to invent and no licence to invent it.** This page should be *shorter* than the reference's and hit considerably harder. Estimated depth ~6 screens against their 20.

## Content hierarchy

1. Who they are — the confirmed positioning, in their own voice
2. **The awards** — the reason to keep reading
3. The clients — breadth of trust
4. Working here — the careers line
5. Start a conversation

---

## §1 — Positioning

| | |
|---|---|
| Content | `about` (h1). The legacy self-description, verbatim |
| Layout | Single column, `--container-text` (65ch). Deliberately narrow — this is a reading passage |
| Visual | `--paper`. `--fs-body-l` |

**Copy — confirmed, legacy site, verbatim:**
> The wheel is already invented and we are not Google, but we have answers to your needs. We are the digital agency expert on creativity, design, performance and analytics; at Coffee Digital we innovate because we knock it out of the park giving you solutions to every digital need you have.

This is kept **exactly as written**. "We are not Google, but…" is precisely the kind of line that cannot be generated, and it does more for the brand than any polished rewrite would.

```
Trigger:            Section enters viewport
Animation:          Mask reveal, per line
Duration:           --dur-slow, 60ms line stagger
Easing:             --ease-out-quint
Scroll relationship: On enter, once
Desktop:            Per-line
Mobile:             Per-block
Purpose:            Paces a reading passage so it is read rather than skimmed
Fallback:           Fully visible
```

---

## §2 — Awards

**The most important section on the site after the home proof block.**

| | |
|---|---|
| Content | All ~17 confirmed awards, grouped exactly as the deck groups them: International · Asia-Pacific · India |
| Layout | Three groups, each a list of rules. Award body left, result right, hairline between. Counters above each group |
| Visual | Ground `--cream`. Award bodies at `--fs-heading-l`, results in mono `--fs-label` |
| Components | `Counter`, `Stripe`, `Reveal` |

### Presentation principle

**Set as a record, not as badges.** Award-logo grids read as decoration and invite scepticism. A typographic list — body name, category, result — reads as a citation, and citations are checkable. It also sidesteps a second logo-rights problem on top of the client-logo one.

### The framing line — ✅ resolved

The deck closes this slide with *"Perhaps, the most awarded team in digital media in India."*

**Decision (2026-08-17): the superlative is cut.** It does not ship. See [[../TBD#✅ B2|TBD B2]].

**What ships instead**, set above the award groups:

> Recognised at Cannes, One Show, D&AD, the Webby Awards, the New York Festival, and Goafest.

Every word is verifiable from deck slide 3. It is the stronger line: a superlative invites *"says who?"* and carries ASCI exposure; six named bodies answer that before it is asked. Specific beats emphatic.

**Do not reintroduce the superlative**, in this or any softened form ("one of the most awarded", "among India's most awarded"). The qualifier does not fix the problem — the claim still has no cited basis.

```
Trigger:            Each award group enters viewport
Animation:          Group counter rolls; hairlines scale X 0→1 in sequence;
                    each row's text mask-reveals as its rule completes
Duration:           Counter ~1200ms; rules --dur-base, 50ms stagger
Easing:             --ease-out-quint
Scroll relationship: On enter, once per group
Desktop:            Full sequence
Mobile:             Identical — this is the payload of the page
Purpose:            Each rule drawing itself makes the list feel enumerated,
                    reinforcing that these are counted facts, not decoration
Fallback:           Reduced motion → rules and values present, no draw.
                    No-JS → complete list, server-rendered
```

---

## §3 — Clients

| | |
|---|---|
| Content | 27 confirmed marks. Plus the five social-media clients as a named sub-group |
| Layout | Quiet grid, generous space |
| Visual | Ground `--peach`. Monochrome `--ink`, full colour on hover |

✅ **Rights confirmed** (2026-08-17) — [[../TBD#✅ B1|TBD B1]]. The mark grid ships as designed.

If any individual client objects post-launch, that mark is removed and the **name retained in text** — the names are confirmed facts independent of mark usage.

---

## §4 — Working here

The careers line becomes a **section, not a page** — the brief's own rule, applied to real content. One paragraph does not justify a route ([[../PRD#8 Scope|non-goals]]).

| | |
|---|---|
| Content | The confirmed careers line + `careers@coffeedigital.in` |
| Layout | Single column, narrow |
| Visual | `--peach`. The email is the one `--heat` element in this section |

**Copy — confirmed, legacy site, verbatim:**
> Do you have the 3C's? Creativity, Common Sense and a Capacity to learn

---

## §5 — CTA

Routes to [[contact]]. Deck slide 34 copy.

---

## Deliberately absent

| Excluded | Why |
|---|---|
| Founding year | **Not stated in any source.** "Since 2010" would be fabrication |
| Team size | Not stated. No "20+ people" |
| Team photos or bios | No such imagery exists |
| Office / location | No address in any source |
| Origin story | Not documented. Would have to be invented — the exact trap the reference fell into |
| Mission / values block | Not in any source, and generic by nature |
| Timeline or milestones | No dates exist |
| Process | Not described anywhere |

**The temptation to resist:** this page has *fewer* words than a typical agency About, and that will feel uncomfortable. It is correct. Every absent element is absent because it does not exist, and the awards are strong enough to carry the page alone.

## Responsive

| | Desktop ≥1024 | Tablet | Mobile <768 |
|---|---|---|---|
| Positioning | 65ch centred | 65ch | Full width, 20px margin |
| Awards | 3 groups, 2-col rows | 2 groups per row | Stacked, 1-col rows |
| Counters | Inline with group heading | Inline | Above group |
| Clients | 6-col grid | 4-col | 3-col |
| Careers | 65ch | 65ch | Full width |

## Performance

- Almost entirely type — should be the fastest page on the site
- Client marks from the same inlined SVG sprite as the home page; already cached
- No photography, no video
- Counters are the only JS-driven element; ~2KB of logic

## Content sources

| Item | Source |
|---|---|
| Positioning paragraph | ✅ Confirmed — legacy site, verbatim |
| ~17 awards | ✅ Confirmed — deck slide 3, verbatim |
| Award grouping | ✅ Confirmed — deck's own grouping |
| Framing line (six award bodies) | ✅ Confirmed — derived from the award list |
| ~~"Most awarded team" superlative~~ | ❌ **Cut** 2026-08-17. Do not reintroduce |
| 27 client marks | ✅ Confirmed — deck slides 4 & 33 · ✅ rights confirmed |
| Careers line | ✅ Confirmed — legacy site, verbatim |
| CTA copy | ✅ Confirmed — deck slide 34 |
| Founding year, team size, location, origin story | ❌ **Do not exist. Do not write them.** |
