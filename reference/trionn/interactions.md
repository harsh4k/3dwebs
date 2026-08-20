---
tags: [reference, motion, interaction-design]
---

# Trionn — Interaction Breakdown

Observed via headless capture at 1440×900 and 390×844, plus CSS analysis. Screenshots in `screenshots/`.
Related: [[tech-stack]] · [[breakdown]] · [[notes]]

> Read this as a **catalogue of patterns and their purposes**, not a list to implement. Which we take, adapt, or reject is decided in [[notes#What we take, adapt, reject]].

---

## Page lengths — the scroll budget

| Page | Desktop height | Mobile height | Ratio to viewport |
|---|---|---|---|
| Home | 6,575px | 8,089px | ~7 screens |
| **Work** | **25,660px** | 10,600px | **~28 screens** |
| About | 18,033px | — | ~20 screens |
| Story | 9,180px | — | ~10 screens |
| Services | 6,254px | — | ~7 screens |
| Contact | 3,473px | 2,974px | ~4 screens |

**The finding that matters:** their `/work` is 28 screens deep on desktop but only 11 on mobile — mobile isn't a squeezed desktop, it's a different composition. And Contact is deliberately short. Both principles carry into our specs.

---

## 1. Loading & entry

| Aspect | Observation |
|---|---|
| Smooth scroll | Lenis, initialised globally; native scroll is overridden site-wide |
| Hero entry | Display type reveals per-glyph with a **blur + opacity** transition — caught mid-flight in `home-desktop-00.png`, where some glyphs are still blurred. Consistent with GSAP SplitText |
| Scroll cue | Circled ↓ pinned bottom-left |

## 2. The hero — WebGL

`home-desktop-00.png`. A dark faceted 3D lattice sits centre-frame with thin light filaments radiating outward, plus a faint warm-orange internal glow.

- Prompt reads **"HOLD TO 💥 BLAST · DARE ⚡ TO TOUCH THE LINES"** — a *press-and-hold* interaction, not hover
- Rendered with **OGL**, ~10 KB
- **Purpose:** gives an abstract brand statement something to be *about*, and rewards curiosity with a hidden interaction

**Assessment:** the one genuinely justified WebGL use on the site. It is the hero, it is interactive, and it carries brand meaning. Everything else on the page is DOM.

## 3. Scroll-linked section grounds

`home-desktop-04.png` shows the "Key facts" section on a **light grey ground** while the hero is near-black. The site inverts ground colour between sections.

**Purpose:** chapter punctuation — the reader feels a change of subject before reading a word.

**Our version:** the same principle, executed continuously rather than as a hard flip. The Roast Ramp walks `--paper` → `--cream` → `--peach` — warm, and always light. See [[../../Design|Design]].

## 4. Number counters

Three stat cards, each with an **odometer-style digit roll** (the raw `0123456789` column is visible in the DOM payload — digits stack vertically and translate on the Y axis).

- Values: `50+` projects, `1.5K+`, `20+` team
- Middle card sets its counter inside a white circle
- Outer cards are **skewed on a 3D axis** (`perspective` + `transform-style` in the CSS), the left leaning one way, the right the other

**Purpose:** makes numbers feel *counted* rather than typed. **Directly applicable** — Coffee Digital's awards tally is its strongest asset. See [[../../specs/about|specs/about]].

## 5. `/work` — the offset grid

`work-desktop-01.png`. The signature layout.

- Two columns, **vertically offset** so tiles never align on a row
- **Thin SVG hairline curves connect tiles**, arcing from one to the next like a circuit trace
- Tiles sit at differing scroll depths → parallax at differing rates
- Each tile: image, title, one-line description, `EXPLORE PROJECT →` with a rule that presumably animates on hover
- Overlaid caption text sits *inside* the image, small, uppercase, mono

**Purpose:** the offset + connectors turn a grid into a *path*, so a 28-screen page reads as a journey rather than a list.

**Assessment:** the most copyable-looking idea on the site, and therefore the one to be most careful with. Connector lines between tiles would read as direct imitation. **Our equivalent uses the stripe as the connective device** — it is ours, it comes from the credentials deck, and it does the same job. See [[notes#What we take, adapt, reject]].

## 6. Testimonials

Named tab labels (`Luxury presence`, `credible`, `Fast resume`, `Technis`, `Ventigence`) switch quote panels. Three of five carry a `▷ Listen to him!` control — actual **audio testimonials**.

**Purpose:** audio is far harder to fake than text, so it buys credibility.
**Not applicable:** Coffee Digital has no testimonials at all. See [[../../brand/brand-audit#❌ Missing]].

## 7. Marquees

Two: an `Inspire · innovate · Impact` text marquee repeated 4×, and a partner-logo marquee repeated 5×. Both are horizontal infinite loops.

**Assessment:** competent but generic — a marquee is the single most over-used agency device of the last five years. **We use it at most once**, and only where the content is genuinely a list without hierarchy.

## 8. Navigation

- Persistent: wordmark left; `LET'S TALK` pill + `MENU ☰` pill right; plus a small audio-mute toggle
- Menu opens a full overlay carrying nav, business enquiry details, and socials
- Nav labels appear **doubled** in the DOM (`WorkWork`, `ServicesServices`) — the standard two-layer setup for a hover swap where one copy translates up as the other follows

**Purpose:** persistent contact access from any scroll depth. Sound.

## 9. Contact

Form: name, email, service select, message (min 20 chars), budget band, submit — plus reCAPTCHA v3, a Calendly alternative, and a plain mailto fallback. Budget bands: Under $5K / $5–15K / $15–30K / $30–60K / $60K+ / Not sure yet.

**Purpose:** the budget selector qualifies leads before a call. **Strongly applicable** — see [[../../specs/contact|specs/contact]].

## 10. Cursor & micro-interactions

- Underlined CTAs with a trailing `→`, rule beneath the label
- Hover states use `mix-blend-mode` (×6) and `backdrop-filter` (×9)
- `will-change` ×13 — deliberate GPU-layer promotion

---

## Defects worth learning from

1. **The cookie banner overlaps content.** In `home-desktop-04.png` it sits directly across the "90% of our clients…" line, and in `work-desktop-01.png` across a project title. A consent UI that obscures the content it's asking consent for is a real failure. **Our answer: cookieless analytics, so no banner exists.**
2. **`/work` at 25,660px** is a long commitment with no visible skip affordance. **Our answer: `/work` opens as a filterable index; depth is opt-in through the case modal.**
3. **A 29-term keywords meta tag** is dead weight — search engines ignored it a decade ago.
4. **Four font families**, two of them commercially licensed, on a marketing site. Our budget is three at most, all open.
