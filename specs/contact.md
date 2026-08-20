---
tags: [page-spec, contact]
---

# Contact

Route: `/contact` · Upstream: [[../PRD|PRD]] · [[../Design|Design]] · [[../architecture#9 Forms|architecture]]

## Objective

Convert interest into a qualified enquiry, with as little friction as possible — while **rendering nothing we don't actually have**.

## User intent

*"I want to talk to them."*

Highest-intent visitor on the site. Every unnecessary element between them and sending a message is a cost.

## Constraint

From [[../brand/brand-audit#❌ Missing|the audit]], the total confirmed contact data is:

- `info@coffeedigital.in`
- `careers@coffeedigital.in`

**No phone. No address. No social handles.** Not in the deck, not on the live site.

The page is therefore built so that missing data is **invisible rather than empty**. Every optional field renders only when populated ([[../architecture#Optional data — the TBD pattern|the TBD pattern]]). Filling one later is a one-line content edit with zero component changes — no "Phone: TBD", no greyed placeholder, no dead `tel:` link.

## Content hierarchy

1. An invitation, in their voice
2. The form
3. Alternatives, ranked by commitment
4. Everything else, only if it exists

---

## §1 — Header

| | |
|---|---|
| Content | Deck slide 34 copy, set large |
| Layout | Left-aligned, upper third. Stripe beneath |
| Visual | `--paper`, `--fs-display-l` |

**Copy — confirmed, verbatim:**
> Yes we'd love to work with you.
> Do care to test us,
> Throw us a challenge,
> You'd find us more than eager!

This is already the best contact copy the brand could have — playful, confident, and unmistakably human. **It is not rewritten.**

Beneath it, one proposed reassurance line: *"we usually reply within one business day."* ⚠️ Requires client confirmation that it is true — a promise we can't keep is worse than no promise ([[../TBD|TBD]]).

---

## §2 — Enquiry form

| Field | Type | Required | Options |
|---|---|---|---|
| Name | text | ✅ | |
| Email | email | ✅ | validated |
| Service | select | ✅ | The three confirmed pillars + `Something else` |
| Budget | select | — | ⚠️ bands **TBD in ₹** — see below |
| Message | textarea | ✅ | min 20 chars |
| *(honeypot)* | hidden | — | never shown, never focusable |

**Service options — from confirmed pillars ([[services]]):**
Digital Marketing & Strategy · Creative & Branding · Technology & Development · Something else

**Budget band** — adopted from research ([[../reference/trionn/interactions#9 Contact|why]]): it qualifies leads before anyone spends time on a call, at almost no cost to the sender. ⚠️ The reference's USD bands are wrong for a India-based agency serving both Indian and international clients. **Bands must be set in ₹ by the client**, with the field optional and a `Not sure yet` option so it never blocks submission. Blocker-adjacent — [[../TBD|TBD]].

### Design

Underline-only inputs per [[../Design#Form control|Design]] — a `--rule` baseline that becomes `--ink` at 2px on focus. No boxes. Labels persist above the field; **a placeholder is never the only label**.

### Validation & errors

- Inline, on blur, not on every keystroke
- Errors below the field in `--heat` at `--fs-small`, **with an icon** — never colour alone (`--heat` is AA-large only, and colour-only error signalling fails for colour-blind users)
- **Input is preserved on failure.** Nothing is ever retyped
- Errors are announced via `aria-live`

### Spam defence — no third-party script

Honeypot + submission-timing floor + per-IP rate limit. **No reCAPTCHA**: it is a third-party script, a consent surface, and an accessibility burden. This is the choice that keeps the site cookie-banner-free ([[../PRD#18 Analytics requirements|PRD]]).

### Failure path

If delivery fails, the UI degrades to a `mailto:` with the message pre-filled. **An enquiry is never silently lost.**

```
Trigger:            Field focus
Animation:          Underline scales X from the focus point outward;
                    label rises and shrinks to caption size
Duration:           --dur-fast
Easing:             --ease-out-quint
Scroll relationship: None
Desktop / Mobile:   Identical
Purpose:            Confirms focus location — critical on a page whose inputs
                    have no box to delineate them
Fallback:           Reduced motion → underline changes instantly, no scale.
                    Focus state must remain unmistakable
```

```
Trigger:            Successful submission
Animation:          Form mask-wipes out; confirmation mask-reveals in place.
                    Stripe sweeps once beneath
Duration:           --dur-base out, --dur-slow in
Easing:             --ease-out-expo
Scroll relationship: None
Desktop / Mobile:   Identical
Purpose:            Unambiguous confirmation. The commonest form failure is
                    leaving the user unsure whether it sent
Fallback:           Reduced motion → instant swap. Confirmation is also
                    announced via aria-live
```

---

## §3 — Alternatives

Ranked by commitment, lowest first.

| | |
|---|---|
| Direct email | `info@coffeedigital.in` ✅ confirmed |
| Careers | `careers@coffeedigital.in` ✅ confirmed, with the 3C's line |
| Phone | Renders **only if** `site.phone` exists |
| Address | Renders **only if** `site.address` exists |
| Socials | Renders **only if** `site.socials` is non-empty |

## §4 — Deliberately absent

| Excluded | Why |
|---|---|
| Map embed | No address exists; also a heavy third-party iframe |
| Office photography | Does not exist |
| Calendly / booking | Requires an account and a person committed to the calendar. Not confirmed |
| Live chat | Requires staffing. Third-party script, consent surface |
| Phone/address placeholders | **Empty contact slots damage trust more than absent ones** |
| WhatsApp button | Not confirmed |

---

## Responsive

| | Desktop ≥1024 | Tablet | Mobile <768 |
|---|---|---|---|
| Header | Display L, upper third | Display L | Display M |
| Form | 2-col (name/email paired) | 2-col | **Single column throughout** |
| Fields | 48px tall | 48px | **≥52px, ≥44px targets** |
| Select | Native | Native | Native — a custom select on mobile is a usability regression |
| Alternatives | Row beside form | Below form | Stacked below |
| Keyboard | — | — | `inputmode="email"` on email; correct autocomplete tokens |

## Accessibility

- Every input has a real `<label>`, programmatically associated
- Errors linked with `aria-describedby`, announced via `aria-live="polite"`
- Submit state announced; the button is disabled with `aria-busy` during send
- Full keyboard operability; visible focus at 3:1 on every ground
- Honeypot is `aria-hidden` and removed from the tab order
- **Page is usable with JS disabled** — form degrades to `mailto:`

## Performance

Shortest page on the site — target **~3 screens**.

- No imagery, no video, no map, no third-party scripts
- Form logic is the only client JS on the route
- Should be the fastest-loading page; it is the highest-intent one

## Content sources

| Item | Source |
|---|---|
| Header copy | ✅ Confirmed — deck slide 34, verbatim |
| `info@coffeedigital.in` | ✅ Confirmed — legacy site |
| `careers@coffeedigital.in` | ✅ Confirmed — legacy site |
| 3C's careers line | ✅ Confirmed — legacy site, verbatim |
| Service options | ✅ Confirmed — deck pillars |
| Budget bands | ⚠️ **TBD** — must be set in ₹ by the client |
| "reply within one business day" | 💡 Proposed — ⚠️ needs confirmation it is true |
| Phone, address, socials | ❌ **Do not exist.** Slots stay unrendered |
