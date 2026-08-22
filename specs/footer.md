---
tags: [page-spec, footer, global]
---

# Global Footer

Component: `features/footer/site-footer.tsx` · Upstream: [[../Design|Design]] · [[../brand/brand-audit|brand-audit]]

## Objective

Close every page with the brand, the whole page list, and the confirmed contact routes. **One footer, used everywhere.**

## Principle

A footer is where agency sites accumulate junk — awards badges, newsletter forms, sitemap columns, "proudly built with" credits. Coffee Digital's footer carries **four zones** and nothing else.

The constraint that shapes it: we have two email addresses and no phone, no address, and no social handles ([[../brand/brand-audit#❌ Missing]]). A footer designed around data we don't have would be mostly empty. This one is designed around what we do have, and grows if data arrives.

The composition follows a supplied marketing-footer reference — brand column and blurb on the left, links to the right, a contact band, a bottom bar. The reference's address tile, phone tile, social row and legal-link row have no counterpart here; see [[#Deliberately absent]].

---

## Information architecture

| Zone | Content | Conditional? |
|---|---|---|
| 1 — Brand | Wordmark `coffee digital` · `the digital branding people` · the deck's positioning paragraph | No |
| 2 — Pages | home · work · services · about · contact | No |
| 3 — Contact | `General enquiries → info@coffeedigital.in` · `Careers → careers@coffeedigital.in` | No |
| 4 — Legal | `© <year> Coffee Digital` · `coffeedigital.in` | No |
| — Phone | | ✅ only if `site.phone` |
| — Address | | ✅ only if `site.address` |
| — Socials | | ✅ only if `site.socials.length` |

**Zone 3 is the primary CTA**, and the type ladder says so: the addresses are the largest thing on the surface after the wordmark, above the page list. A spec that names a primary CTA and then sets it smaller than the secondary navigation is decoration, not a spec.

## Layout

**Desktop:** full-bleed, `--peach` ground, in two bands separated by whitespace and the type ladder. (They were separated by a stripe divider until 2026-08-22 — brain.md D16.)

- **Masthead band.** A 12-column grid: brand block in columns 1–7 (1–6 at `lg`), page list right-aligned in columns 9–12 (10–12 at `lg`).
- **Contact band.** Two CTAs side by side from `md`, each half the well.
- **Legal row** beneath an `--overlay-line` rule.
- The document ends on flat `--peach`. There is no closing band — the 6px stripe edge was removed with the device (brain.md D16).

**Mobile:** single column throughout — brand, pages, contact stacked, legal.

The wordmark is set at **column scale**, not viewport scale, so the whole footer closes in roughly one screen.

## Visual

| | |
|---|---|
| Ground | `--peach` — the final stop of the Roast Ramp. **The footer is where the roast finishes** |
| Wordmark | **Jost 500** (`font-hero`) — the display face Design.md §4 assigns *because* the real logotype is Futura-consistent. Not the extrabold grotesque the rest of the chrome uses |
| Labels | **Geist Mono**, uppercase, `0.08em` — Design.md §4's `--fs-label` register, for the contact labels and the legal row |
| Type | `--ink` for wordmark, addresses and page links; `--ink-muted` for tagline, paragraph, labels and legal |
| Heat | The rule beneath `info@coffeedigital.in` only — one `--heat` element, 3px at address scale |
| Rules | `--overlay-line` (18% `--ink`) above the legal row. **Not `--hairline`** — that is a paper-ground token and effectively invisible on `--peach` |
| ~~Stripe~~ | ⚠️ **Removed 2026-08-22** (brain.md D16). Both stripes are gone; nothing replaces them |

## Motion

```
Trigger:            Each zone enters the viewport
Animation:          Fade + rise (opacity 0→1, y 30→0) per zone, staggered
                    80 / 160 / 320 / 400ms — brand, pages, contact, legal
                    (the 240ms slot was the stripe divider; removed, D16)
Duration:           react-spring, { mass 1, tension 88, friction 30 }
Easing:             Spring, soft and damped — no overshoot
Scroll relationship: On enter, once per page load (mode="once")
Desktop:            Per-zone reveal
Mobile:             Per-zone reveal, same cadence
Purpose:            Closes the page deliberately — the zones arrive in reading
                    order rather than as one block, so the eye is led from the
                    brand to the page list to the contact routes
Fallback:           Fully visible. FooterReveal renders children plainly
                    until it has mounted client-side, so the server markup,
                    the no-JS render and the pre-hydration render are
                    identical and complete
⚠️ Reduced motion:   ReducedMotion at the app root flips react-spring's
                    global skipAnimation; every zone lands at its resting
                    state instantly. No per-component branch needed
```

```
Trigger:            Pointer enters a contact CTA
Animation:          The trailing arrow translates 4px right — the CTA
                    primitive's documented behaviour (Design.md §7)
Duration:           300ms
Easing:             Default ease
Scroll relationship: None
Desktop:            On hover
Mobile:             No hover state. Nothing is lost: the label, the address
                    and the rule are all persistent
Purpose:            Marks the most valuable pair of links on the page
Fallback:           Static CTA, rule always present
⚠️ Accessibility:   --heat measures 3.28:1 on --peach — it clears the 3:1
                    UI-boundary threshold and fails the 4.5:1 body threshold.
                    It is therefore the **rule** and never the label. The
                    address text stays --ink (11.9:1). The careers route takes
                    --ink-faint (3.98:1) at 1px against the primary's 3px, so
                    the two are separated by weight as well as by colour
```

## Deliberately absent

| Excluded | Why |
|---|---|
| Address / phone tiles | **No address and no phone exist.** [[../TBD\|TBD]] N1, N2. The zones do not render |
| Social icons | **No handles exist.** [[../TBD\|TBD]] N3. The row does not render |
| Icon-in-a-bordered-box marks | A ninth primitive duplicating the CTA (Design.md §7), fronted by borrowed Originkit art. Replaced by the CTA primitive itself — [[../brain\|brain]] D15 |
| Skyline band | The particle band was the closing act's furniture. Retired with the redesign — [[../brain\|brain]] D15 |
| Closing headline + CTA pair | Replaced by the brand column and the contact CTAs; the mailbox *is* the call to action |
| Newsletter signup | No newsletter exists. No one to write it |
| Multi-column sitemap | Five routes. Splitting them across three columns would be a lie about the size of the IA |
| Award badges | Awards are a section of [[about]], set as a record not badges |
| Client logos | Already on home and about. A third appearance devalues them |
| "Built with…" credits | Nobody's business but ours |
| Back-to-top button | Smooth scroll and short pages make it redundant; on mobile it overlaps content |
| Privacy policy / cookie policy / terms | **Cookieless analytics means no cookie policy is required.** A privacy page can be added if the client wants one — [[../TBD\|TBD]] |

## Responsive

| | Desktop ≥1024 | Tablet 768–1023 | Mobile <768 |
|---|---|---|---|
| Masthead grid | Brand cols 1–6, pages cols 10–12 | Brand cols 1–7, pages cols 9–12 | Single column |
| Wordmark | `clamp(36px, 5vw, 60px)` | same clamp | same clamp |
| Paragraph | `clamp(14px, 0.95rem, 17px)`, capped 42ch | same | same |
| Page links | Vertical column, `clamp(15px, 1rem, 18px)` | Vertical column | Vertical column |
| Contact CTAs | Two columns | Two columns | Stacked |
| Address | `clamp(20px, 2.6vw, 36px)` | same clamp | same clamp |
| Legal | Bottom row, space-between | Bottom row | Stacked |

## Accessibility

- `<footer>` landmark with `contentinfo` role
- Contact CTAs are `mailto:` links whose accessible name reads "General enquiries info@coffeedigital.in"
- Page links are a real list inside a `<nav aria-label="Footer">`
- **Every target and every type floor is expressed in CSS px, not rem.** `globals.css` derives the root font-size from the viewport and restarts the ramp at each breakpoint, so a rem floor sawtooths: it falls to ~10px at 641px and ~11.4px again at 1025px. `min-h-[44px]` holds the WCAG target size, and `clamp(<px floor>, …)` holds Design.md §4's "never below `--fs-small`" 14px content floor. Verified at 768px: paragraph 14px, page links 15px, labels 12px, targets 44px
- Copyright year is generated at build (Server Component), not client-side
- Both address rules are `aria-hidden` — decorative
- Contrast: `--ink` on `--peach` 11.9:1, `--ink-muted` on `--peach` 6.49:1, `--heat` 3.28:1 (rule only), `--ink-faint` 3.98:1
- Visible focus on all seven interactive elements: a 2px `--ink` outline at 4px offset (Design.md §3 rule 3), offset far enough to clear the rule beneath each address
- No state is signalled by colour alone

## Performance

- Static markup. `FooterReveal` is the only client boundary and ships no assets
- No image assets at all — `/brand/stripe.svg` was the footer's last one and is deleted (brain.md D16)
- No canvas, no dynamic import, no particle engine — the redesign removed the footer's only lazy chunk
- No borrowed Originkit asset remains; the CTA arrow is a text glyph

## Content sources

| Item | Source |
|---|---|
| `coffee digital` | ✅ Confirmed — the name, lowercased for the legacy voice |
| `the digital branding people` | ✅ Confirmed — legacy site |
| Positioning paragraph | ✅ Confirmed — credentials deck slide 2, verbatim |
| `info@coffeedigital.in` | ✅ Confirmed — legacy site |
| `careers@coffeedigital.in` | ✅ Confirmed — legacy site |
| Page labels | ✅ Confirmed — the five routes |
| Copyright | ✅ Generated |
| Phone, address, socials | ❌ **Do not exist.** Zones do not render |
