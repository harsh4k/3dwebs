---
tags: [brand, design-system, accessibility]
---

# Palette

Every hex on this page is either **decided by the client** or **measured from a source file**. Nothing here was picked by eye. Related: [[brand-audit]] · [[../Design|Design]] · [[../TBD|TBD]]

---

## 1. Core palette — client-locked

Four colours, supplied directly by Harsh. These supersede the earlier brown trio (`#46362F` / `#E6DBBC` / `#FFF7EC`), which is now dead and must not appear anywhere in the codebase.

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#FFFAF3` | Default page ground. The site's resting state |
| `--cream` | `#FFF2DB` | Second stop of the Roast Ramp; card and panel surfaces |
| `--peach` | `#FFE5BF` | Third stop of the Roast Ramp; the warmest section ground |
| `--heat` | `#F62440` | The one hot colour. Accent, active state, CTA fill |

## 2. Derived ink — necessary addition

The four core colours are **three grounds and one accent**. None of them can carry body text. An ink token is therefore not a stylistic preference, it is a requirement.

Rather than invent one, `--ink` is taken from the brand's own stripe device: `#3F2210` is the darkest and most-used band of the credentials-deck stripe graphic (25.14% of the artwork). It is Coffee Digital's colour already.

| Token | Hex | Source |
|---|---|---|
| `--ink` | `#3F2210` | Darkest band of the deck stripe. Body copy, headings |
| `--ink-muted` | `#6B4A33` | `--ink` lightened. Secondary copy, metadata |
| `--ink-faint` | `#8B6B52` | `--ink` lightened further. Captions **on `--paper` only** |
| `--rule` | `#9F8576` | Stripe band. The lightest line that still passes 3:1 for UI borders |
| `--hairline` | `#E8DCCB` | Decorative dividers only — never a control boundary |

## 3. Measured contrast

WCAG 2.1 ratios, computed — not estimated.

| Foreground | on `--paper` | on `--cream` | on `--peach` |
|---|---|---|---|
| `#3F2210` ink | **13.97:1** AAA | **13.11:1** AAA | **11.89:1** AAA |
| `#6B4A33` ink-muted | 7.62:1 AAA | 7.15:1 AAA | 6.49:1 AA |
| `#8B6B52` ink-faint | 4.68:1 AA | 4.39:1 ⚠️ AA-large | 3.98:1 ⚠️ AA-large |
| `#F62440` heat | 3.86:1 ⚠️ AA-large | 3.62:1 ⚠️ AA-large | 3.28:1 ⚠️ AA-large |
| `#FFFAF3` paper **on** `#F62440` heat | 3.86:1 ⚠️ AA-large | — | — |

### Rules this forces

1. **`--heat` is never body text.** It clears AA-large (3:1) and nothing more. Permitted at ≥30px regular or ≥24px bold, and for fills, rules, icons and indicators.
2. **There is no accessible small text on a `--heat` fill.** Paper-on-heat is 3.86:1. A red button with 16px text fails. Red-filled controls must use ≥24px bold, or invert to an ink label on paper with a heat border.
3. **`--ink-faint` is paper-only.** It degrades below AA on cream and peach. The Roast Ramp moves the ground beneath the text, so any component that crosses ramp stops must use `--ink` or `--ink-muted`.
4. **`--hairline` is decorative.** At 1.30:1 it cannot bound an interactive control. Use `--rule` (3.32:1) for anything focusable.
5. **Focus rings use `--ink`**, not `--heat` — the only choice that stays visible across all three grounds.

## 4. The stripe ramp — brand device, not UI colour

Measured from `ppt/media/image1.png` in the credentials deck: 186 vertical bands on a locked 11-tone ramp. Ordered by share of the artwork:

| Hex | Share | Hex | Share |
|---|---|---|---|
| `#3F2210` | 25.14% | `#935C33` | 5.42% |
| `#68380A` | 8.86% | `#B27B45` | 4.52% |
| `#CD9A61` | 7.05% | `#736655` | 4.16% |
| `#9F8576` | 6.15% | `#C6B597` | 3.80% |
| `#5D4940` | 5.79% | `#492D1A` | <1% |
| `#7F4C21` | 5.61% | | |

**These are not brand colours and must never be applied as UI colour.** They exist only inside the stripe device — see [[brand-audit#The stripe]]. Vector at `stripe/stripe.svg`.

## 5. Implementation

Declared once, in `src/styles/tokens.css`. Tailwind maps to the variables; components reference the semantic name only.

```css
:root {
  /* client-locked */
  --paper: #FFFAF3;
  --cream: #FFF2DB;
  --peach: #FFE5BF;
  --heat:  #F62440;

  /* derived from the brand stripe */
  --ink:       #3F2210;
  --ink-muted: #6B4A33;
  --ink-faint: #8B6B52;
  --rule:      #9F8576;
  --hairline:  #E8DCCB;

  /* Roast Ramp — driven by one scroll-linked ScrollTrigger */
  --ground: var(--paper);
}
```

**A raw hex literal inside `src/` is a build error**, enforced by the hook in [[../skills/hooks/README|skills/hooks]]. The only file permitted to contain hex values is `tokens.css`.

## 6. Open

- No dark mode is specified. The Roast Ramp is a light-mode concept; a dark variant would need its own ink and heat values re-derived. Deferred — see [[../TBD|TBD]].
- `--heat` has no accessible tint/shade scale yet. If red-filled controls with small labels turn out to be needed, that scale must be generated and re-measured before use.
