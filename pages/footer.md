---
tags: [page-spec, footer, global]
---

# Global Footer

Component: `features/navigation/Footer.tsx` · Upstream: [[../Design|Design]] · [[../brand/brand-audit|brand-audit]]

## Objective

Close every page with one clear action and the confirmed contact route. **One footer, used everywhere.**

## Principle

A footer is where agency sites accumulate junk — awards badges, newsletter forms, sitemap columns, "proudly built with" credits. Coffee Digital's footer carries **four things** and nothing else.

The constraint that shapes it: we have two email addresses and no phone, no address, and no social handles ([[../brand/brand-audit#❌ Missing]]). A footer designed around data we don't have would be mostly empty. This one is designed around what we do have, and grows if data arrives.

---

## Information architecture

| Zone | Content | Conditional? |
|---|---|---|
| 1 — Statement | `the digital branding people` — confirmed tagline | No |
| 2 — Contact | `info@coffeedigital.in` · `careers@coffeedigital.in` | No |
| 3 — Navigation | work · services · about · contact | No |
| 4 — Legal | `© <year> Coffee Digital` | No |
| — Phone | | ✅ only if `site.phone` |
| — Address | | ✅ only if `site.address` |
| — Socials | | ✅ only if `site.socials.length` |

**Zone 1 is the primary CTA.** The tagline is set at display scale with the email directly beneath — the footer is a contact surface first and a navigation surface second.

## Layout

**Desktop:** full-bleed, `--peach` ground. Tagline occupies the left two-thirds at `--fs-display-m`. Email beneath at `--fs-heading-l`, as a link. Nav column right. Legal row along the bottom, hairline above. A 6px stripe runs the full width of the very bottom edge — the site's last element is the brand device.

**Mobile:** single column — tagline, email, nav, legal, stripe.

## Visual

| | |
|---|---|
| Ground | `--peach` — the final stop of the Roast Ramp. **The footer is where the roast finishes** |
| Type | `--ink`, mono `--fs-label` for nav and legal |
| Heat | The email link only — one `--heat` element |
| Stripe | 6px, full-bleed, bottom edge |

## Motion

```
Trigger:            Footer enters viewport
Animation:          Tagline mask-reveals per line; stripe scales X 0→1
                    across the bottom edge, offset 200ms
Duration:           --dur-slow
Easing:             --ease-out-expo
Scroll relationship: On enter, once per page load
Desktop:            Per-line reveal
Mobile:             Per-block reveal
Purpose:            Closes the page deliberately. The stripe completing marks
                    the end of the document the way it opened the hero —
                    bookending the visit with the same device
Fallback:           Fully visible, stripe at full width
```

```
Trigger:            Pointer enters the email link
Animation:          --heat rule wipes L→R beneath; label shifts to --heat
Duration:           --dur-fast
Easing:             --ease-out-quint
Scroll relationship: None
Desktop:            On hover
Mobile:             Persistent --heat rule — no hover exists
Purpose:            Marks the single most valuable link on the page
Fallback:           Static rule, always present
⚠️ Accessibility:   --heat on the label is AA-large only. The email is set at
                    --fs-heading-l (≥24px) so it qualifies. It must not be
                    reduced below that size
```

## Deliberately absent

| Excluded | Why |
|---|---|
| Newsletter signup | No newsletter exists. No one to write it |
| Sitemap columns | Four pages. A column layout would be absurd |
| Award badges | Awards are a section of [[about]], set as a record not badges |
| Client logos | Already on home and about. A third appearance devalues them |
| "Built with…" credits | Nobody's business but ours |
| Back-to-top button | Smooth scroll and short pages make it redundant; on mobile it overlaps content |
| Privacy policy / cookie policy | **Cookieless analytics means no cookie policy is required.** A privacy page can be added if the client wants one — [[../TBD\|TBD]] |
| Social icons | **No handles exist.** The row does not render |

## Responsive

| | Desktop ≥1024 | Tablet 768–1023 | Mobile <768 |
|---|---|---|---|
| Layout | Tagline 2/3 + nav 1/3 | Tagline full, nav row | Single column |
| Tagline | `--fs-display-m` | `--fs-display-m` | `--fs-heading-l` |
| Email | `--fs-heading-l` | `--fs-heading-l` | `--fs-heading-l` — **never smaller**, per the contrast constraint |
| Nav | Vertical column | Horizontal row | Horizontal row, wrapping |
| Legal | Bottom row | Bottom row | Stacked, centred |
| Stripe | 6px | 6px | 4px |

## Accessibility

- `<footer>` landmark with `contentinfo` role
- Email links use `mailto:` with a descriptive accessible name
- Nav links are a real list inside a `<nav aria-label="Footer">`
- Copyright year is generated at build, not client-side
- Stripe is `aria-hidden` — decorative
- Targets ≥44×44px on touch

## Performance

- Static markup, no client JS beyond the shared reveal
- Stripe SVG already loaded and cached from the hero
- Below the fold on every page; the reveal animation registers on the shared ScrollTrigger batch, not its own instance

## Content sources

| Item | Source |
|---|---|
| `the digital branding people` | ✅ Confirmed — legacy site |
| `info@coffeedigital.in` | ✅ Confirmed — legacy site |
| `careers@coffeedigital.in` | ✅ Confirmed — legacy site |
| Nav labels | ✅ Confirmed — the four routes |
| Copyright | ✅ Generated |
| Phone, address, socials | ❌ **Do not exist.** Zones do not render |
