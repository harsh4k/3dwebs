---
tags: [handoff, status]
---

# Hand-off

How to pick this project up cold. **This file should let you name the stack, the tokens, the motion rules, and the next three tasks without opening anything else.**

**Updated:** 2026-08-22 · **Phase:** home + `/work` built; three pages are stubs

---

## In one paragraph

A new marketing website for **Coffee Digital**, a digital agency in India with an exceptional and largely invisible record — Cannes Cyber Lion finalist twice, Webby People's Voice, D&AD, One Show, Goafest gold, and clients including Google, Emirates, Lenovo, Motorola, Toyota, Johnson & Johnson and Domino's. Four pages (`/work`, `/services`, `/about`, `/contact`) plus a home gateway. Heavy scroll-driven motion on a warm off-white ground. **Next.js 16.2 + Tailwind v4 + three.js + react-spring + Lenis + Zod. No CMS, no component library.** The governing rule is that nothing about the client may be invented — everything traces to a 35-slide credentials deck or their live legacy site.

⚠️ **If you remember this project as "no WebGL", that changed.** The home page
is a three.js particle sequence and the work carousel is a second GL scene. The
reversal is reasoned in [[brain#D18 — WebGL is the home page, and D3 is superseded (2026-08-22)|brain D18]].

## Status

| | |
|---|---|
| ✅ Built | Home (WebGL hero sequence → work carousel → needs CTA → footer) · `/work` grid + case modal · global nav + footer · content layer + Zod · SEO/OG/sitemap/robots |
| 🟡 Stubs | `/services`, `/about`, `/contact` — a shared `InnerPage` shell with real content but none of the specced composition |
| ✅ Green | `npm run lint`, `npm run typecheck`, `npm run build` all clean (2026-08-22) |
| ✅ Unblocked | **All 3 launch blockers resolved 2026-08-17** |
| ⚠️ Known defects | [[audit-2026-08-22]] — 6 open, 3 of them design decisions rather than patches |

### Completed

- **Brand** — logo reconstructed to SVG from measurement; palette measured with full WCAG contrast matrix; complete confirmed/inferred/proposed/missing audit
- **Reference** — Trionn audited: stack fingerprinted with evidence, 37 screenshots, take/adapt/reject decisions recorded
- **Specs** — [[PRD]], [[Design]], [[architecture]], 7 page specs with full motion blocks
- **Implementation** — 136 source files. The scene (curl noise, bloom, wipe, baked point clouds), the dither-reveal carousel, reveal primitives, staggered menu, content layer
- **Tooling** — 3 agents, routing table, 2 enforcement hooks, MCP evaluation
- **Audit + cull** — first full audit 2026-08-22; 32 dead files and 23.6 MB of orphaned assets removed

### Remaining

1. **Fix the stub-page bundle** — `/services` and `/about` ship 242 KB gzipped for a heading and a list ([[audit-2026-08-22#B1|B1]]). Highest-value performance work
2. **Settle the three open design decisions** — `/work` tile crop, mobile header, no-JS hero ([[audit-2026-08-22#B2|B2]]–[[audit-2026-08-22#B4|B4]])
3. **Build `/services`, `/about`, `/contact`** to their specs
4. Enquiry form + Resend (specified, not installed)
5. Resolve the GSAP-vs-react-spring split ([[TBD#S9|S9]])
6. Type + space scales (`--fs-*`, `--space-*`) — still outstanding from [[brain#D17 — The motion token layer exists (2026-08-22)|D17]]
7. Analytics, CI budget enforcement
8. Pre-launch pass — [[skills/workflows/README#W5 — Pre-launch|W5]]

---

## Start here

```
1. brand/brand-audit.md    what is true about the client, and what isn't
2. PRD.md                  what must be true of the site
3. Design.md               tokens, type, motion system, responsive matrix
4. architecture.md         how the code is organised
5. specs/<page>.md         every section, fully specified, with motion
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
| `specs/` | 7 page specs — the implementation contract |
| `skills/` | Agents, routing, MCP evaluation, hooks, runbooks |
| `skills/Setup/` | ⚠️ **Pre-existing global setup. Not ours. Don't touch** |
| `.claude/` | Agent definitions, hooks, settings — the functional tooling |
| `src/` | The app. `features/` per page, `components/common/` primitives, `content/` typed data, `motion/` scroll provider |
| `src/features/home/scene/` | The three.js hero sequence — curl noise, bloom, wipe, baked point clouds |
| `src/features/home/work-carousel/gl/` | The second GL scene: dither-reveal work carousel |
| `public/assets/` | Baked point clouds (`.bin`), hero light flares, logo |

## The things you must not change without review

1. **Rule 0 — never invent Coffee Digital information.** Everything traces to `brand/brand-audit.md` → Confirmed. This is the project's spine.
2. **The palette.** `#FFFAF3` `#FFF2DB` `#FFE5BF` `#F62440` + `--ink` `#3F2210`. Client-locked.
3. **`--heat` is never body text.** 3.86:1 — AA-large only. Not a style opinion; a measurement.
4. **Four pages.** A fifth needs a scope conversation.
5. **The project schema has no `year`, `metrics`, `outcome` or `testimonial` fields.** Deliberate. Don't widen it.
6. **The two hooks.** They enforce 1, 2 and 5 mechanically.
7. **No CMS, no component library, no vendored UI kits.** Reasoned in [[brain]]; reopening needs new evidence. ~~No WebGL~~ — reversed, see [[brain#D18 — WebGL is the home page, and D3 is superseded (2026-08-22)|D18]].
8. ⚠️ **The stripe device is retired** (brain.md D16) — deleted, all five jobs cancelled, **nothing replaces it**. Do not rebuild it and do not invent a substitute; whether the site needs a structural device is open in [[TBD]].

## Environment

```bash
git clone https://github.com/harsh4k/coffeedigital
cd coffeedigital
npm install
npm run dev            # http://localhost:3000
```

**Required later:** `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `NEXT_PUBLIC_SITE_URL`. Never commit `.env*`.

**Node 24** and **Chrome** are present on this machine. Playwright is available via the npx cache — launch with `channel: 'chrome'`, since the cached version expects a headless-shell build that isn't installed.

## Commands

```bash
npm run dev                                # http://localhost:3000
npm run lint && npm run typecheck && npm run build   # the definition of done
npm run bake:bean                          # re-bake the hero point cloud from reference/e.glb
npm run bake:trophy                        # re-bake the second-act trophy
node .claude/hooks/guard-tokens.mjs        # test a hook (see skills/hooks)
```

## Known technical debt

| Item | Severity | Note |
|---|---|---|
| Logo and stripe SVGs are **reconstructions** | Medium | Measured and visually verified, but not the originals. Request source vectors — [[TBD#S6\|S6]] |
| Wordmark exists only as a 916×85 PNG | Medium | Cropped from the deck. Needs vector |
| Tier-B provenance is still unknown | Medium | **Handled, not solved.** Deck imagery, no outbound link, no claim about the current site — safe either way. Promote to Tier A if provenance is ever confirmed. [[TBD#✅ B3\|B3]] |
| Slide 14 contradicts itself | Low | Entry withheld until resolved — [[TBD#S3\|S3]] |
| Budget bands are USD-shaped in the reference | Low | Must be set in ₹ — [[TBD#S2\|S2]] |
| 5 legacy-only projects have no assets | Low | Excluded until assets exist |

## Next three tasks

1. **Settle the voice decision** ([[TBD#S1|S1]]). Now the highest-leverage open question — every line of copy depends on it, and reversing it after copy is written is expensive. Recommendation: the legacy lowercase register.
2. **Scaffold + tokens + content schema.** Everything else builds on these three, and the schema is what makes Rule 0 structural.
3. **Build home → work.** Home sets the motion vocabulary; work is the hardest page and will surface any weakness in the primitives early.

## Gotchas

- **Playwright:** launch with `channel: 'chrome'`. And when capturing a scroll-animated site, walk the full page first to prime ScrollTriggers — otherwise you capture hidden pre-animation states.
- **`--ink-faint` fails AA on `--cream` and `--peach`.** The Roast Ramp moves the ground under the text, so anything crossing ramp stops must use `--ink` or `--ink-muted`.
- **The modal uses `history.pushState`, not `router.push`.** Router navigation re-renders the server component and re-runs page animation. This is documented at length in [[architecture#7 /work modal + shallow routing|architecture §7]] because it's the one place a developer will otherwise reach for the router and break the page.
- **Scroll lock is `lenis.stop()`, not `overflow:hidden`** — the latter causes a layout shift.
- **The repo is public.** `creds/` and `reference/trionn/html/` are gitignored for good reasons. Consider flipping it private ([[TBD#S7|S7]]).
