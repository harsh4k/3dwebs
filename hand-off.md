---
tags: [handoff, status]
---

# Hand-off

How to pick this project up cold. **This file should let you name the stack, the tokens, the motion rules, and the next three tasks without opening anything else.**

**Updated:** 2026-08-17 · **Phase:** blueprint complete, implementation not started

---

## In one paragraph

A new marketing website for **Coffee Digital**, a digital agency in India with an exceptional and largely invisible record — Cannes Cyber Lion finalist twice, Webby People's Voice, D&AD, One Show, Goafest gold, and clients including Google, Emirates, Lenovo, Motorola, Toyota, Johnson & Johnson and Domino's. Four pages (`/work`, `/services`, `/about`, `/contact`) plus a home gateway. Heavy scroll-driven motion on a warm off-white ground. **Next.js 15 + Tailwind v4 + GSAP + Lenis. No WebGL, no CMS, no component library.** The governing rule is that nothing about the client may be invented — everything traces to a 35-slide credentials deck or their live legacy site.

## Status

| | |
|---|---|
| ✅ Done | Brand extraction · reference library · all specification documents · tooling and enforcement |
| ⬜ Not started | **All implementation.** No `src/`, no `package.json`, no dependencies installed |
| ⛔ Blocked | 3 launch blockers outside our control — see [[TBD]] |

### Completed

- **Brand** — logo and stripe reconstructed to SVG from measurement and verified against the original; palette measured with full WCAG contrast matrix; complete confirmed/inferred/proposed/missing audit
- **Reference** — Trionn audited: stack fingerprinted with evidence, 37 screenshots (desktop + mobile), HTML/CSS archived, take/adapt/reject decisions recorded
- **Specs** — [[PRD]], [[Design]], [[architecture]], 7 page specs with full motion blocks
- **Tooling** — 3 agents, routing table, 2 enforcement hooks (tested 8/8), MCP evaluation
- **Register** — [[TBD]] with every known gap and its owner

### Remaining

1. Scaffold Next.js 15 + Tailwind v4 + TypeScript
2. `src/styles/tokens.css` from [[brand/palette|palette]]; fonts (Jost, Instrument Sans, Geist Mono)
3. `src/content/` — schema + the 28 projects, services, awards, clients
4. `motion/ScrollProvider` + the six primitives
5. The eight UI primitives
6. Navigation and footer
7. Pages, in order: home → work → services → about → contact
8. Asset capture (`scripts/capture-work.mjs`) for Tier A
9. Form handler + Resend
10. SEO, analytics, CI budgets
11. Pre-launch pass — [[skills/workflows/README#W5 — Pre-launch|W5]]

---

## Start here

```
1. brand/brand-audit.md    what is true about the client, and what isn't
2. PRD.md                  what must be true of the site
3. Design.md               tokens, type, motion system, responsive matrix
4. architecture.md         how the code is organised
5. pages/<page>.md         every section, fully specified, with motion
6. CLAUDE.md               the rules — read before your first change
7. brain.md                why things are the way they are
8. TBD.md                  what we still don't know
```

## Repository map

| Path | What |
|---|---|
| `creds/` | ⚠️ Source deck + logo. **Gitignored** — client logos, unreleased claims |
| `brand/` | Reconstructed logo/stripe SVGs, measured palette, source audit |
| `reference/trionn/` | Audit, 37 screenshots, archived HTML (gitignored) |
| `pages/` | 7 page specs — the implementation contract |
| `skills/` | Agents, routing, MCP evaluation, hooks, runbooks |
| `skills/Setup/` | ⚠️ **Pre-existing global setup. Not ours. Don't touch** |
| `.claude/` | Agent definitions, hooks, settings — the functional tooling |
| `src/` | ⬜ Does not exist yet |

## The things you must not change without review

1. **Rule 0 — never invent Coffee Digital information.** Everything traces to `brand/brand-audit.md` → Confirmed. This is the project's spine.
2. **The palette.** `#FFFAF3` `#FFF2DB` `#FFE5BF` `#F62440` + `--ink` `#3F2210`. Client-locked.
3. **`--heat` is never body text.** 3.86:1 — AA-large only. Not a style opinion; a measurement.
4. **Four pages.** A fifth needs a scope conversation.
5. **The project schema has no `year`, `metrics`, `outcome` or `testimonial` fields.** Deliberate. Don't widen it.
6. **The two hooks.** They enforce 1, 2 and 5 mechanically.
7. **No WebGL, no CMS, no component library.** Reasoned in [[brain]]; reopening needs new evidence.
8. **The stripe does five jobs.** A sixth needs justification in [[brain]].

## Environment

```bash
git clone https://github.com/harsh4k/coffeedigital
cd coffeedigital
# npm install          — nothing to install yet
```

**Required later:** `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `NEXT_PUBLIC_SITE_URL`. Never commit `.env*`.

**Node 24** and **Chrome** are present on this machine. Playwright is available via the npx cache — launch with `channel: 'chrome'`, since the cached version expects a headless-shell build that isn't installed.

## Commands

```bash
npm run dev            # not yet scaffolded
npm run lint && npm run build     # the definition of done
node .claude/hooks/guard-tokens.mjs        # test a hook (see skills/hooks)
node scripts/capture-work.mjs              # Tier-A asset capture
```

## Known technical debt

| Item | Severity | Note |
|---|---|---|
| Logo and stripe SVGs are **reconstructions** | Medium | Measured and visually verified, but not the originals. Request source vectors — [[TBD#S6\|S6]] |
| Wordmark exists only as a 916×85 PNG | Medium | Cropped from the deck. Needs vector |
| Tier-B projects have no confirmed provenance | **High** | ⛔ [[TBD#B3\|B3]]. Currently shown with deck imagery and no outbound link |
| Slide 14 contradicts itself | Low | Entry withheld until resolved — [[TBD#S3\|S3]] |
| Budget bands are USD-shaped in the reference | Low | Must be set in ₹ — [[TBD#S2\|S2]] |
| 5 legacy-only projects have no assets | Low | Excluded until assets exist |

## Next three tasks

1. **Ask the client the three ⛔ blockers.** They gate launch and are outside our control. B1 (logo rights) can change the shape of two sections, so it should be asked first, not last.
2. **Settle the voice decision** ([[TBD#S1|S1]]). Every line of copy depends on it, and reversing it later is expensive.
3. **Scaffold + tokens + content schema.** Everything else builds on these three, and the schema is what makes Rule 0 structural.

## Gotchas

- **Playwright:** launch with `channel: 'chrome'`. And when capturing a scroll-animated site, walk the full page first to prime ScrollTriggers — otherwise you capture hidden pre-animation states.
- **`--ink-faint` fails AA on `--cream` and `--peach`.** The Roast Ramp moves the ground under the text, so anything crossing ramp stops must use `--ink` or `--ink-muted`.
- **The modal uses `history.pushState`, not `router.push`.** Router navigation re-renders the server component and re-runs page animation. This is documented at length in [[architecture#7 /work modal + shallow routing|architecture §7]] because it's the one place a developer will otherwise reach for the router and break the page.
- **Scroll lock is `lenis.stop()`, not `overflow:hidden`** — the latter causes a layout shift.
- **The repo is public.** `creds/` and `reference/trionn/html/` are gitignored for good reasons. Consider flipping it private ([[TBD#S7|S7]]).
