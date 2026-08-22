---
tags: [page-spec, navigation, global]
---

> ⚠️ **The stripe device is retired** (2026-08-22, see `brain.md` → D16).
> `public/brand/stripe.svg` and `src/components/common/stripe/` are deleted, and all
> five of its jobs are cancelled — every band in that artwork was a brown outside the
> locked palette. **Any mention of the stripe below is historical. Do not build it, and
> do not invent a replacement device** — whether one is needed is open in `TBD.md`.
> Separation is now carried by ground colour, whitespace and the type ladder; on the
> home page the CSS ground and the WebGL fog are the same value (`#fff2db`), so the
> page is one continuous surface.

# Global Navigation

Component: `features/navigation/` · Upstream: [[../Design|Design]] · [[../PRD#12 Interaction requirements|PRD]]

## Objective

Move between four pages from any scroll depth, and feel like part of the experience rather than a navbar pasted on top — **without ever costing usability for that ambition.**

## Principle

Navigation is the one component that must work perfectly on every device, at every scroll position, for every input method, with animation on or off. **It is where "sophisticated interaction design" is most tempting and most dangerous.**

Where art direction and usability conflict here, usability wins. That rule is not negotiable.

---

## Desktop (≥1024px)

### Resting state

| Element | Position | Treatment |
|---|---|---|
| Wordmark | Top left | `coffee digital` lockup, `--ink`. Links to `/` |
| Nav links | Top right | `work` · `services` · `about` — mono `--fs-label`, uppercase |
| CTA | Far right | `start a project →`. The one `--heat` element in the bar |
| Progress | Top edge, full width | 2px stripe, scaled X by scroll fraction |

**No full-screen menu on desktop.** Four destinations fit in a bar. Hiding them behind a hamburger would be style at the cost of a click — the exact trade this page rejects.

### Scroll behaviour

```
Trigger:            Scroll direction change
Animation:          Bar translates Y out on scroll-down past 120px;
                    returns on scroll-up. Ground gains a --paper backdrop
                    with a hairline once past the hero
Duration:           --dur-fast
Easing:             --ease-out-quint
Scroll relationship: Direction-triggered, not scrubbed
Desktop:            Hide on down, show on up
Mobile:             Same
Purpose:            Returns vertical space while reading; restores navigation
                    the instant the reader looks for it (scrolling up is the
                    universal "I want to go somewhere" signal)
Fallback:           Reduced motion → bar is always visible, no translation
```

### Link hover

```
Trigger:            Pointer enters link
Animation:          Label translates up and out; a duplicate rises into place
                    from below. Rule wipes L→R beneath
Duration:           --dur-fast
Easing:             --ease-out-quint
Scroll relationship: None
Desktop:            Full
Mobile:             Not applicable
Purpose:            Confirms the target under the pointer
Fallback:           Underline appears instantly. Focus-visible shows the same
                    state — the affordance never depends on hover
```

### Active state

The current page's label sits at `--ink` full weight with a persistent rule; others at `--ink-muted`. `aria-current="page"` is set. **Never colour-only** — weight and rule carry it too.

---

## Mobile & tablet (<1024px)

### Resting state

Wordmark left, `menu` label right (a **word, not a hamburger icon** — the word is unambiguous and needs no learned convention). Progress stripe on the top edge.

### The menu

Full-screen sheet, sliding up.

```
Trigger:            menu tapped
Animation:          Sheet slides up from bottom; stripe bands wipe across
                    the top edge as it arrives. Links stagger in
Duration:           --dur-base sheet, 60ms link stagger
Easing:             --ease-out-expo
Scroll relationship: None
Mobile / Tablet:    Slide-up sheet
Desktop:            Not used
Purpose:            A sheet is the platform-native pattern for a modal
                    surface on touch; it arrives from the thumb, not the
                    top of a 6-inch screen
Fallback:           Reduced motion → instant open, no slide, no stagger
```

### Menu contents

Four links (`work` · `services` · `about` · `contact`), then `info@coffeedigital.in`, then the socials row **only if data exists**.

### Menu behaviour

| | |
|---|---|
| Close | ✕ · `Esc` · tapping a link · Back |
| Focus | Trapped while open; restored to the `menu` trigger on close |
| Scroll | `lenis.stop()`, not `overflow:hidden` — avoids the layout shift |
| ARIA | `aria-expanded` on trigger, `role="dialog"` + `aria-modal` on sheet |

---

## Page transitions

```
Trigger:            Internal navigation
Animation:          Stripe bands wipe across the viewport in sequence,
                    covering, then uncovering on the new route
Duration:           --dur-reveal total, roughly half out and half in
Easing:             --ease-out-expo
Scroll relationship: None
Desktop:            Full stripe wipe
Tablet:             Stripe wipe
Mobile:             200ms fade — a full-screen wipe on a phone reads as a
                    render glitch, and it delays a reader who is often on a
                    worse connection
Reduced motion:     120ms opacity fade
Purpose:            Spatial continuity — the reader understands they moved
                    rather than that the page broke. The brand device does
                    the work
Fallback:           No-JS → ordinary browser navigation. Nothing depends on it
⚠️ Constraint:      The transition must never delay content readiness. If the
                    route resolves first, the wipe shortens — it never gates
```

## Logo behaviour

Links to `/`. On `/` it scroll-restores to top instead. On hover, the bean pair's lower arcs animate toward closing (a bean "filling") — `--dur-fast`, `--ease-out-quint`, decorative, disabled for reduced motion.

## Accessibility

| ID | Requirement |
|---|---|
| N1 | `<nav>` landmark with `aria-label="Primary"` |
| N2 | Skip-to-content link, first in tab order, visible on focus |
| N3 | Full keyboard operability; logical tab order |
| N4 | Focus visible at 3:1 against every ground |
| N5 | `aria-current="page"` on the active link |
| N6 | Menu: `aria-expanded`, `role="dialog"`, `aria-modal`, focus trap, focus restore |
| N7 | Targets ≥44×44px on touch |
| N8 | **Navigation works fully with JS disabled** — it is links in a bar. The mobile menu degrades to a visible link list |
| N9 | Progress stripe is `aria-hidden` — decorative |

## Responsive summary

| | Desktop ≥1024 | Tablet 768–1023 | Mobile <768 |
|---|---|---|---|
| Pattern | Persistent bar, links visible | Bar + `menu` | Bar + `menu` |
| Menu | None | Slide-up sheet | Slide-up sheet |
| CTA | In bar | In sheet | In sheet |
| Transition | Stripe wipe | Stripe wipe | Fade |
| Progress | 2px stripe | 2px | 2px |

## Performance

- Nav is in the initial bundle — it is above the fold on every route. Kept minimal.
- Progress stripe is one CSS variable driven by the existing ramp ScrollTrigger. **No second scroll listener.**
- The menu sheet is `next/dynamic`, loaded on first open — desktop users never download it.
- Transition uses the already-loaded stripe SVG.
