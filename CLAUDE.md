# CLAUDE.md — Coffee Digital

Primary AI engineering instructions for this repository. This file **overrides** general defaults. Harsh's global rules at `~/.claude/CLAUDE.md` still apply; where they conflict, this file wins.

---

## Project context

A marketing website for **Coffee Digital**, a digital agency that builds websites for other companies. Four pages — `/work`, `/services`, `/about`, `/contact` — plus a home gateway, global nav, global footer. Heavy scroll-driven motion. Small IA, high craft.

**Read before your first change:** [[PRD]] · [[Design]] · [[architecture]] · [[brand/brand-audit|brand/brand-audit]] · [[TBD]]

Status: **blueprint complete, implementation not started.** No `src/`, no `package.json` yet.

---

## Rule 0 — Never invent Coffee Digital information

The most important rule in this repository.

Every factual claim on this site must trace to [[brand/brand-audit#✅ Confirmed|brand-audit → Confirmed]]. That document is the source of truth. If a fact is not there, it does not exist.

**Never write, under any circumstance:**

- A founding year, an "established" date, or "for over a decade"
- A team size or headcount
- A city, address, or office location
- A metric, result, percentage, or outcome for any project
- A client testimonial or quote
- A project date or year
- A process, methodology, or timeline
- A pricing figure or package
- A count of clients or projects beyond what is confirmed

These do not exist in any source. If a section feels thin without them, **the section is wrong — not the facts.** Mark it in [[TBD]] and move on.

The `Project` schema in `src/content/schema.ts` deliberately **has no fields** for year, brief, outcome, metrics, or testimonial. Do not add them. That constraint is structural, and it is there on purpose.

---

## Skill & agent routing — fire without being asked

Harsh should not have to name a tool. Match the condition, load the tool.

| When the work is… | Load / delegate to | Before you write code |
|---|---|---|
| Any component, layout, styling, or visual polish | `impeccable` skill | ✅ always |
| Design-system, token, or type-scale work | `design-system` skill + [[Design]] | ✅ |
| GSAP / ScrollTrigger / Lenis / any animation | `motion-engineer` agent | ✅ |
| Reviewing a design for genericness or brand drift | `design-critic` agent | after building |
| Researching a site, stack, or reference | `reference-researcher` agent | ✅ |
| Verifying behaviour in a real browser | `browser-testing-with-devtools` skill | after building |
| Bundle size, Core Web Vitals, image weight | `performance-optimization` skill | before merge |
| Any React/Next component build | `frontend-dev` agent | — |
| Any API route, form handler, env work | `backend-dev` agent | — |
| **After any change set** | `code-reviewer`, then `qa-verifier` | ✅ always |
| Before deploy | `seo-auditor` | ✅ |
| README / CLAUDE.md / doc updates | `docs-writer` agent | — |
| Architecture or multi-file planning | `planner` agent | ✅ before building |

Run independent agents in parallel. Keep exploration inside subagents so the main context stays clean.

Full definitions and rationale in [[skills/README|skills/README]] and [[skills/routing|skills/routing]].

---

## Investigate before you modify

1. **Read the file completely** before editing it. Not a grep hit — the file.
2. **Find the existing pattern.** This codebase has eight UI primitives and six motion primitives. Whatever you need is probably a variant of one.
3. **Check the page spec.** Every section is specified in `specs/*.md`, including its motion. If the code disagrees with the spec, ask which is wrong — don't silently pick.
4. **Trace the token.** Never write a value; find the token.
5. **If a system already works, do not rewrite it.** Extend it.

---

## Brand rules

- Palette is **locked**: `#FFFAF3` `#FFF2DB` `#FFE5BF` `#F62440`, plus `--ink` `#3F2210`. The old brown trio (`#46362F` / `#E6DBBC` / `#FFF7EC`) is **dead** — it must not appear anywhere.
- **`--heat` `#F62440` is never body text.** It measures 3.86:1 on `--paper` — AA-large only. Display type ≥30px, fills, rules, indicators.
- **One `--heat` element per viewport.** Its scarcity is the point.
- The stripe device does **five jobs** ([[Design#Stripe|Design]]). A sixth needs justification in [[brain]].
- The stripe's 11 tone values are **not UI colours.** They exist only inside the stripe.

---

## Coding conventions

- TypeScript strict. No `any`. No non-null assertions without a comment explaining why.
- Functional components. Server components by default — `use client` only where genuinely needed (see [[architecture#8 Rendering & data flow|architecture]]).
- **Files stay under 300 lines.** Split into components or modules.
- Named exports. Default exports only where Next requires them.
- Co-locate: a feature's components, hooks, and types live in that feature.
- Content lives in `src/content/`, never hardcoded in a component.

## Animation rules

- **Every animation has a documented purpose** in its page spec. No purpose, no ship.
- Transform and opacity only. Animating `width`/`height`/`top`/`left` is a review failure.
- All animation goes through `useGsapContext` — never a bare `gsap.to` in a component.
- One `ScrollTrigger` per section. Kill on unmount.
- Never instantiate Lenis or call `gsap.registerPlugin` outside `ScrollProvider`.
- Compose the six motion primitives. A seventh requires an entry in [[brain]].
- `prefers-reduced-motion` is a **first-class branch**, not a disable switch — the reduced site must be complete and elegant.
- **Nothing may be hidden by default and revealed only by animation.** If GSAP fails to load, the page must be whole.

## Performance rules

Budgets in [[PRD#16 Performance requirements|PRD]] and enforced in CI. **A regression fails the build.**

- Initial JS **<140KB gzipped**. GSAP plugins are dynamically imported by the features that use them — SplitText and Flip never enter the global bundle.
- Largest image <200KB. AVIF with WebP fallback, responsive `sizes`, explicit dimensions.
- Fonts <120KB total, self-hosted, preloaded, subset.
- **Zero third-party scripts** other than analytics.
- The cursor is desktop-only and never shipped to mobile.

## Accessibility rules

WCAG 2.1 AA is a **requirement**, not an aspiration.

- Body text 4.5:1; large text and UI boundaries 3:1. Values in [[brand/palette#3 Measured contrast|palette]].
- Full keyboard operability; visible focus at 3:1 on every ground.
- Modals trap focus and restore it to the trigger.
- **Never disable pinch-zoom** — the legacy site's `user-scalable=no` is a bug we are fixing.
- Never signal state by colour alone.
- The site must work with JavaScript disabled.

## Asset rules

- Work imagery is **tiered** ([[specs/work#Asset tiers|work]]). Never present a Tier-B live capture as Coffee Digital's work.
- Brand assets in `public/brand/`; project imagery in `public/work/<slug>/`.
- Naming: `<slug>-<variant>-<width>.<ext>`.
- No stock photography. No AI-generated imagery in the shipped site.

## Dependency rules

**Every dependency needs a reason. Ask before installing anything.**

The stack is settled in [[architecture#1 Stack|architecture]]: Next.js, React, TypeScript, Tailwind v4, GSAP, Lenis, Zod, Resend. That's it.

**Explicitly rejected — do not add:** three.js, React Three Fiber, Drei, Framer Motion, shadcn/ui, Radix, any CMS, Redux/Zustand/Jotai, reCAPTCHA, lodash, moment, axios.

## Git rules

- ⚠️ **`github.com/harsh4k/coffeedigital` is currently PUBLIC.** `creds/` and `reference/trionn/html/` are gitignored — the credentials deck holds client logos and unreleased claims, and republishing a competitor's source isn't ours to do. See [[TBD#S7|TBD S7]].
- **Never commit `.env*` or any key.**
- Branch; don't commit to `main` directly.
- Don't push without Harsh's go-ahead.
- Conventional commits. Small and atomic.

## Definition of done

Nothing is "done" until **all** of these pass:

1. `npm run lint && npm run build` — clean
2. Zero TypeScript errors
3. Content validation passes (Zod)
4. Every claim traces to [[brand/brand-audit#✅ Confirmed|Confirmed]] or is marked Proposed
5. Responsive and correct at mobile, tablet, and desktop — **verified in a real browser**, not assumed
6. Works with `prefers-reduced-motion` enabled
7. Works with JavaScript disabled
8. Keyboard-operable end to end, with visible focus
9. Performance budgets met
10. No raw hex, no arbitrary spacing, no inline durations, no `box-shadow`
11. Every new animation has a purpose statement in its page spec
12. `code-reviewer` then `qa-verifier` have run

## Handling ambiguity

- **A missing fact is never a gap to fill with plausible text.** Log it in [[TBD]] and leave the slot unrendered.
- If the spec and the code disagree, **ask which is wrong.** Don't silently pick.
- If a change would touch more than three files or alter architecture, **plan first** (`planner` agent), then get approval.
- If a request conflicts with Rule 0 or the palette lock, **say so** and propose the compliant alternative.
- Prefer one targeted question over three assumptions.

## Never do

1. **Invent Coffee Digital facts.** Rule 0.
2. Use `--heat` for body text.
3. Add a colour outside the locked palette.
4. Hardcode a hex, duration, easing, or spacing value.
5. Install a dependency without asking.
6. Add a fifth page.
7. Commit `.env*`, keys, or the contents of `creds/`.
8. Rewrite a working system to "clean it up".
9. Create a component that duplicates one of the eight primitives.
10. Ship an animation without a purpose statement.
11. Hide content behind animation.
12. Disable pinch-zoom.
13. Present a Tier-B capture as Coffee Digital's work.
14. Add a `year`, `metrics`, or `testimonial` field to the project schema.
15. Push to `main` or deploy without approval.
