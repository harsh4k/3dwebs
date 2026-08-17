---
tags: [tooling, hooks, enforcement]
---

# Hooks

Four hooks. Two **enforce** the rules whose violation would do the most damage; two make the Obsidian vault behave as live project memory rather than a folder someone has to remember to open.

Scripts live in `.claude/hooks/`, wired in `.claude/settings.json`.
Related: [[../routing|routing]] · [[../../CLAUDE|CLAUDE.md]]

---

## Why hooks and not prose

[[../../CLAUDE|CLAUDE.md]] already says "never hardcode a hex" and "never invent Coffee Digital facts". Prose rules are advisory — they depend on the reader remembering them at the moment of writing.

Two failures here would be genuinely expensive:

1. **A broken design system.** One hardcoded hex becomes ten, and the token architecture stops being true. On a site whose entire visual identity rests on four locked colours, that's fatal.
2. **A fabricated client claim.** Coffee Digital's site listing a founding year, a headcount, or a project metric that doesn't exist is a factual misrepresentation about a real company. For an agency selling credibility, this is the worst available failure.

Both are worth making **mechanically impossible** rather than merely discouraged.

---

## `guard-tokens.mjs`

**Event:** `PreToolUse` on `Edit|Write` · **Scope:** `src/` only

| Blocks | Rule |
|---|---|
| Raw hex outside `src/styles/tokens.css` | [[../../Design#3 Colour\|Design §3]] |
| The retired brown palette `#46362F` `#E6DBBC` `#FFF7EC` — **anywhere, including tokens.css** | [[../../brand/palette#1 Core palette\|palette §1]] |
| `box-shadow` with any value but `none` | [[../../Design#8 Radius, elevation, borders\|Design §8]] |
| Inline `cubic-bezier()` | [[../../Design#Easing\|Design §9]] |
| Inline animation durations | [[../../Design#Duration\|Design §9]] |

**Deliberate scope limits:**
- Only `src/` — documentation and scripts are free to quote hex values
- `tokens.css` may contain hex, since that is its job
- Comments are stripped before checking, so `// e.g. #FFFAF3` doesn't trip it
- Fails **open** on any parse error — a hook bug must never block real work

## `guard-fabrication.mjs`

**Event:** `PreToolUse` on `Edit|Write` · **Scope:** `src/content/` only

Blocks three things:

**1. Banned schema fields** — `year`, `metrics`, `outcome`, `results`, `testimonial`, `founded`, `teamSize`, `headcount`. The `Project` schema has no fields for these *by design* ([[../../architecture#5 The content system|architecture §5]]); this stops that constraint being quietly widened.

**2. Invented-fact phrasings** — founding years, tenure claims, headcounts, locations, performance metrics, unsourced client counts. Each pattern was checked against the deck and the legacy site and appears in neither.

**3. The cut superlative** — *"the most awarded…"* and its softened variants (*"one of the most awarded"*, *"among India's most awarded"*). Cut on 2026-08-17 ([[../../TBD#✅ B2|TBD B2]]); the hook stops it drifting back in. The qualifier does not fix the missing basis, so the softened forms are blocked too.

**Scope is deliberately narrow** — `src/content/` only. Fabrication enters through content, not components, and a wider net would nag about ordinary prose.

---

## `vault-context.mjs`

**Event:** `SessionStart`

Reads `TBD.md` and `brain.md` and injects a compact state summary — open blockers, open section questions, the three most recent resolutions, the latest recorded decision, and whether `src/` exists yet.

This is what makes the vault **context storage** rather than passive files: every session starts knowing what is unresolved and what was already decided, instead of spending a turn asking. Output is a few hundred characters, deliberately — the documents are on disk and readable; this is a pointer, not a dump.

Phrased as factual statements, never imperatives. Imperative text in injected context reads as an out-of-band instruction and trips prompt-injection defenses — the same convention as the global `session-context.mjs`.

## `decision-log.mjs`

**Event:** `Stop`

`brain.md` has a silent failure mode: decisions get made in a session and never written down, so months later nobody remembers why the palette has an ink token or why there is no CMS.

If a decision-bearing document changed (`PRD.md`, `Design.md`, `architecture.md`, `TBD.md`, `pages/*.md`, `brand/palette.md`, `brand/brand-audit.md`) and `brain.md` did not, it emits **one line**. `TBD.md` changing is the strongest signal — it usually means something was resolved.

**It does not block**, and it says explicitly that routine edits need no entry. A nagging hook gets disabled, and a disabled hook enforces nothing.

---

## Test results

All four hooks were tested before being documented. **17/17 cases behave correctly.**

| # | Case | Expected | Result |
|---|---|---|---|
| T1 | `#FF0000` in a component | deny | ✅ denied, cites Design §3 |
| T2 | `#FFFAF3` in `tokens.css` | allow | ✅ allowed |
| T3 | Retired palette + `box-shadow` in `tokens.css` | deny both | ✅ both reported |
| T4 | Hex in `Design.md` | allow | ✅ allowed — out of scope |
| T5 | `year:` added to schema | deny | ✅ denied |
| T6 | "Founded in 2010… team of 25… based in Mumbai… increased conversions by 40%" | deny | ✅ all 5 claims reported |
| T7 | Confirmed content (`info@coffeedigital.in`, the tagline) | allow | ✅ allowed |
| T8 | `// founded in 2010` in a component | allow | ✅ allowed — out of scope |
| T9 | The cut "most awarded" superlative | deny | ✅ denied, cites TBD B2 |
| T10 | Softened variant "one of the most awarded" | deny | ✅ denied |
| T11 | The approved factual framing (six award bodies) | allow | ✅ allowed |
| T12 | `vault-context` on a clean tree | inject state | ✅ blockers, resolutions, decision count, phase |
| T13 | `decision-log`, clean tree | silent | ✅ silent |
| T14 | Page spec dirty, `brain.md` clean | note | ✅ fired |
| T15 | Page spec **and** `brain.md` dirty | silent | ✅ silent |
| T16 | `README.md` only | silent | ✅ silent — not decision-bearing |
| T17 | `TBD.md` dirty | note | ✅ fired |
| T18 | `Design.md` + page spec | note, both named | ✅ "Design.md and a page spec" |
| T19 | Clean tree | silent | ✅ silent |

### A bug this caught

T14–T16 initially inverted: the hook stayed silent when it should have fired and fired when it should not. The cause was mine — the `git()` helper `.trim()`ed the whole `git status --porcelain` output, and an unstaged modification's line begins with a space (`" M path"`). Trimming the string stripped that space from the **first** line only, shifting `slice(3)` by one character and corrupting that path. Whichever file sorted first was invisible to the hook.

Fixed by not trimming the output, filtering on line length, and handling rename arrows. Worth recording because the hook *looked* like it worked in the first casual test — Node's async stdout on Windows interleaved the output with the shell's echo, which made a real inversion look like a display artifact.

Re-run after any edit:

```bash
echo '{"tool_input":{"file_path":"src/features/x.tsx","content":"#FF0000"}}' \
  | node .claude/hooks/guard-tokens.mjs
```

---

## Design principles

1. **Fail open.** Any parse error exits silently. A hook bug must never block legitimate work.
2. **Explain, don't just refuse.** Every denial names the rule and the document to read.
3. **Narrow scope.** A hook that fires on false positives gets disabled, and then enforces nothing.
4. **Four, not ten.** Only rules where violation is both likely and costly earn a hook.
5. **Never block on a judgement call.** `guard-*` block, because their rules are absolute. `decision-log` only notes, because whether an edit constitutes a decision is a judgement the hook cannot make.

## Not hooked, and why

| Considered | Why not |
|---|---|
| Lint/format on save | Already handled by the global setup at `skills/Setup/Setup/claude-setup/hooks/format.mjs` |
| Block `.env` commits | Covered by `.gitignore` and the `permissions.deny` list in `.claude/settings.json` |
| Enforce file length <300 lines | A guideline with legitimate exceptions. `code-reviewer` handles it with judgement |
| Run tests on Stop | Slow, noisy, and CI already gates merges |
| Block dependency installs | `permissions` already prompts; a hard block would be obstructive |
