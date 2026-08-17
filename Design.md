---
tags: [design-system, tokens, motion]
---

# Design System

The visual and motion system for the Coffee Digital website.

Upstream: [[PRD]] · [[brand/palette|palette]] · [[brand/brand-audit|brand-audit]] · [[reference/trionn/notes|reference/trionn/notes]]
Downstream: [[architecture]] · [[pages/home|page specs]]

> **The governing rule:** a component may never define a colour, a duration, an easing curve, or a type size. It consumes a token. The only file permitted to contain a raw hex value is `tokens.css` — enforced by a hook, see [[skills/hooks/README|skills/hooks]].

---

## 1. Brand principles

Five principles. Each is testable, so each can be failed at review.

| # | Principle | The test |
|---|---|---|
| 1 | **Proof over promise** | Does this screen show evidence, or make a claim? Coffee Digital has Cannes, Webby, D&AD and 27 named brands. Nothing needs to be asserted |
| 2 | **The stripe is the system** | Does the connective tissue come from Coffee Digital's own asset, or from a trend? |
| 3 | **Warm, never dark** | Every ground is a warm light tone. This is the deliberate opposite of the reference |
| 4 | **Heat is rationed** | At most one `--heat` element per viewport. Scarcity is what gives it force |
| 5 | **Motion explains** | Every animation has a purpose statement. Decorative-only motion is cut |

## 2. Visual direction

**The Roast Ramp.** The page ground walks the palette as the reader scrolls — `--paper` → `--cream` → `--peach` — light to warm, the way a roast develops. One scroll-linked driver for the whole document; sections never paint their own ground.

**The Stripe.** The 186-band coffee barcode from the credentials deck ([[brand/brand-audit#The stripe]]) is the structural motif. It does five jobs and no more: section divider, scroll-progress indicator, page-transition wipe, work-tile hover mask, and footer edge. One device, five jobs — the opposite of decoration.

**The Bean.** The logo's half-filled counter is the cursor state and the loading indicator — a bean that fills.

**Typographic scale as drama.** With a restrained palette and no shadows, hierarchy is carried almost entirely by type size, weight, and space. Display type is genuinely large.

**Rules, not boxes.** Structure comes from hairlines and ground shifts. Cards, borders, and shadows are avoided — they are the visual signature of template design.

## 3. Colour

Complete token set, measured contrast, and usage rules live in **[[brand/palette|brand/palette]]**. Do not duplicate values here.

The three rules that constrain every component:

1. `--heat` `#F62440` reaches **AA-large only** (3.86:1 on paper). Never body text, never a small label on a heat fill.
2. `--ink-faint` degrades below AA on `--cream` and `--peach`. Any component that crosses ramp stops uses `--ink` or `--ink-muted`.
3. Focus rings use `--ink` — the only value that stays visible across all three grounds.

## 4. Typography

### Faces

| Role | Face | Licence | Why |
|---|---|---|---|
| Display | **Jost** Variable | SIL OFL | Geometric sans directly derived from Futura. The brand deck sets Futura Medium and the wordmark is Futura-consistent — this is the closest legal match |
| Text | **Instrument Sans** Variable | SIL OFL | Neutral, highly legible at small sizes. Deliberately *not* Inter, which reads as a default |
| Mono | **Geist Mono** | SIL OFL | Labels, eyebrows, metadata, project tags. Carries the "built, not decorated" register |

All three are open-licence and variable or single-weight — no commercial licence, no per-domain fee. If the client licenses **Futura PT**, it replaces Jost for display and nothing else changes ([[TBD]]).

Self-hosted, preloaded, `font-display: swap`, subset to Latin. Budget: **<120KB total**.

### Scale

Fluid, with a `vw` middle term so type breathes between breakpoints instead of stepping.

| Token | Clamp | Face / weight | Use |
|---|---|---|---|
| `--fs-display-xl` | `clamp(3.5rem, 9vw, 9rem)` | Jost 500 | Home hero only |
| `--fs-display-l` | `clamp(2.75rem, 6.5vw, 6rem)` | Jost 500 | Page titles |
| `--fs-display-m` | `clamp(2rem, 4.5vw, 4rem)` | Jost 500 | Section headings |
| `--fs-heading-l` | `clamp(1.5rem, 2.6vw, 2.25rem)` | Jost 500 | Subsections, project titles |
| `--fs-heading-m` | `clamp(1.25rem, 1.8vw, 1.5rem)` | Instrument 600 | Card titles |
| `--fs-body-l` | `clamp(1.0625rem, 1.2vw, 1.25rem)` | Instrument 400 | Lead paragraphs |
| `--fs-body` | `1rem` | Instrument 400 | Body |
| `--fs-small` | `0.875rem` | Instrument 400 | Captions, metadata |
| `--fs-label` | `0.75rem` | Geist Mono 400 | Eyebrows, tags, CTAs — uppercase, `0.08em` tracking |

**Never below `--fs-small` for content.** `--fs-label` is for short strings only.

### Rules

- Line height: `1.05` display · `1.2` headings · `1.6` body
- Tracking: `-0.02em` display · `0` body · `+0.08em` mono labels
- Measure: **65ch maximum** on body text
- `text-wrap: balance` on headings; `text-wrap: pretty` on body
- Numerals: tabular in counters so digits don't jitter mid-roll

## 5. Space

4px base unit. Named steps only — arbitrary values are a review failure.

| Token | px | Use |
|---|---|---|
| `--space-2xs` | 4 | Icon gaps |
| `--space-xs` | 8 | Tight pairs |
| `--space-sm` | 16 | Default element gap |
| `--space-md` | 24 | Related groups |
| `--space-lg` | 40 | Subsection separation |
| `--space-xl` | 64 | Block separation |
| `--space-2xl` | 96 | Section padding, mobile |
| `--space-3xl` | 160 | Section padding, desktop |
| `--space-4xl` | 240 | Major chapter breaks |

Vertical section rhythm is fluid: `clamp(var(--space-2xl), 12vh, var(--space-4xl))`. Generous space is a primary tool here — it is what separates art-directed from templated.

## 6. Grid, containers, breakpoints

| Breakpoint | Min width | Columns | Gutter | Margin |
|---|---|---|---|---|
| `sm` mobile | 320 | 4 | 16 | 20 |
| `md` tablet | 768 | 8 | 24 | 40 |
| `lg` desktop | 1024 | 12 | 24 | 64 |
| `xl` wide | 1280 | 12 | 32 | 80 |
| `2xl` max | 1536 | 12 | 32 | auto |

Containers: `--container-text` 65ch · `--container-content` 1280px · `--container-wide` 1536px · `--container-full` 100vw (stripe, ramp, media only).

**Mobile-first.** Every rule is written for `sm` and extended upward.

## 7. Components

Eight primitives. If a ninth is proposed, it must first be proven not to be a variant of one of these.

### Button / CTA

Default is a **mono label with an animated rule and a trailing `→`** — not a filled box.

| Variant | Appearance | Note |
|---|---|---|
| Primary | Mono uppercase label, `--ink`, 1px rule beneath, `→` | Rule wipes L→R on hover; `→` translates 4px |
| Heat | Same, `--heat` label and rule | **Max one per viewport** |
| Filled | `--heat` ground, `--paper` label | ⚠️ **Requires ≥24px bold** — see [[brand/palette#Rules this forces]]. Use sparingly |

Touch target ≥44×44px regardless of visual size.

### Link

Inline links are `--ink` with a 1px underline at 0.35 opacity that reaches full opacity on hover. Never colour-only — that fails for colour-blind readers.

### Navigation

See [[pages/navigation|pages/navigation]].

### Card

Only on `/work` tiles and service pillars. **No border, no shadow, no radius.** An image, a rule, and type. Separation comes from space and the ground.

### Image

`--radius-none`. 16:10 for project tiles, 3:2 for portrait contexts. Always explicit dimensions. Tier-C imagery carries a duotone in `--ink`/`--cream` plus grain so low resolution reads as art direction ([[pages/work#Asset tiers]]).

### Form control

Underline-only inputs — a 1px `--rule` baseline that becomes `--ink` on focus, 2px. No boxes. Labels persist above the field; placeholders are never the only label. Errors sit below in `--heat` at `--fs-small` **with an icon**, never colour alone.

### Stripe

The signature primitive. `stripe.svg`, 186 bands, `preserveAspectRatio="none"` so it stretches to any ratio.

| Use | Form |
|---|---|
| Section divider | 3px tall, full-bleed |
| Scroll progress | 2px, fixed top, scaled on X by scroll fraction |
| Page transition | Full-screen, bands wiping in sequence |
| Tile hover mask | Bands sweeping across the image |
| Footer edge | 6px, full-bleed |

### Cursor

Desktop, fine-pointer only. The bean mark follows with easing and scales on interactive elements. **Purely decorative** — it never conveys state that isn't also in the DOM, and it is disabled for coarse pointers and reduced motion.

## 8. Radius, elevation, borders

- **Radius:** `0` everywhere except pills (`9999px`) and the bean (circular). The brand is geometric; rounded corners would soften it into genericness.
- **Elevation:** none. **No box shadows anywhere.** Depth comes from ground shifts, scale, and parallax. Shadows on a warm light ground read as muddy and cheap.
- **Borders:** hairlines only. `--rule` for anything interactive (3.32:1), `--hairline` for decorative dividers.

## 9. Motion system

### Easing

| Token | Curve | Use |
|---|---|---|
| `--ease-out-quint` | `cubic-bezier(0.22, 1, 0.36, 1)` | **Primary.** Entrances, reveals, hovers |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Large-travel reveals, page transitions |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | State changes that reverse |
| `--ease-linear` | `linear` | Scroll-scrubbed motion **only** |

`--ease-out-quint` is adopted from research ([[reference/trionn/tech-stack#Design-system values]]) — a bezier curve is not ownable, and this is the right shape for premium deceleration.

### Duration

| Token | ms | Use |
|---|---|---|
| `--dur-instant` | 120 | Focus, active, reduced-motion fallback |
| `--dur-fast` | 240 | Hover, small state changes |
| `--dur-base` | 400 | Standard entrances |
| `--dur-slow` | 640 | Section reveals |
| `--dur-reveal` | 900 | Hero, page transition |

Scroll-scrubbed motion has no duration — it is bound to scroll position.
Stagger: 40–80ms between siblings, capped at **12 elements**; beyond that, stagger the group.

### Primitives

Six named animations. All motion composes from these; a seventh requires justification in [[brain]].

| Primitive | Mechanism | Purpose |
|---|---|---|
| **Mask reveal** | Text/image rises from a clipped bound, per line or per block | Establishes reading order |
| **Stripe wipe** | Stripe bands sweep in sequence across a region | Marks a boundary — section, page, or state |
| **Roast ramp** | `--ground` interpolates across palette stops, scrubbed | Signals chapter progress |
| **Counter** | Digit columns translate on Y to a target value | Makes a number feel counted |
| **Parallax** | Layers translate at differing scroll rates | Creates depth and spatial continuity |
| **Magnetic** | Element eases toward the pointer within a radius | Signals "this is interactive" |

### Rules

1. Transform and opacity only. Animating `width`, `height`, `top`, `left` is a review failure.
2. One `ScrollTrigger` per section, created inside `gsap.context()`, killed on unmount.
3. `will-change` is applied *at animation start and removed at end* — never left in CSS.
4. Motion never gates content. If animation never runs, the page is complete and readable.
5. Motion is interruptible. Scrolling away mid-animation must never leave a stuck state.
6. No animation blocks first paint.

## 10. Responsive motion matrix

**Mobile is not desktop scaled down.** Every scroll-driven interaction has a defined behaviour per tier.

| Interaction | Desktop | Tablet | Mobile | Reduced motion |
|---|---|---|---|---|
| Smooth scroll | Lenis | Lenis | **Native** — Lenis off; it fights momentum scrolling and costs battery | Native |
| Roast ramp | Scrubbed, continuous | Scrubbed | **Stepped per section** — cheaper, no repaint on every frame | Static `--paper` |
| Text reveal | Per-line mask, staggered | Per-line | **Per-block** fade+rise — per-line is imperceptible at this size | Instant, visible |
| Work grid | Offset columns, per-tile parallax | 2-col, no parallax | **Single column, no parallax** | Static |
| Case modal | Centred overlay, stripe wipe in | Overlay | **Full-screen sheet, slides up** | Instant, opacity only |
| Stripe divider | Scrubbed scale-X | Scrubbed | **Static** | Static |
| Counters | Odometer roll on enter | Roll | Roll (once) | **Final value, no roll** |
| Cursor | Bean cursor + magnetic | None | None | None |
| Page transition | Stripe wipe | Stripe wipe | **Fade**, 200ms | Fade, 120ms |
| Nav menu | Stripe-wipe overlay | Wipe | **Slide-up sheet** | Instant |
| Hover states | Full | Tap equivalent | Tap equivalent | Instant |

### Reduced motion is a first-class branch

`prefers-reduced-motion: reduce` must produce a **complete, elegant, fully usable site** — not a broken one:

- Lenis disabled; native scroll restored
- All scroll-linked motion resolves to its **end state**, immediately and visibly
- Transitions become ≤120ms opacity fades
- Counters display final values
- Cursor and magnetic effects disabled
- **Nothing is hidden.** Any element whose visibility depends on animation must default to visible

## 11. Implementation

```
src/styles/
├── tokens.css      the only file allowed to contain raw values
├── reset.css
├── fonts.css
└── global.css
```

Tailwind maps to the tokens; components reference semantic names only.

**Review failures — automatic, no discussion:**
- A raw hex outside `tokens.css`
- An arbitrary spacing value not on the scale
- A duration or easing curve written inline
- A `box-shadow`
- An animation without a purpose statement in its page spec
- `--heat` on body text
- A component that reaches past its own boundary to restyle a child
