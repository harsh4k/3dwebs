---
tags: [tooling, hooks, enforcement]
---

# Hooks

Two hooks. They enforce the two rules whose violation would do the most damage, and which are most likely to erode under time pressure.

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

Blocks two things:

**1. Banned schema fields** — `year`, `metrics`, `outcome`, `results`, `testimonial`, `founded`, `teamSize`, `headcount`. The `Project` schema has no fields for these *by design* ([[../../architecture#5 The content system|architecture §5]]); this stops that constraint being quietly widened.

**2. Invented-fact phrasings** — founding years, tenure claims, headcounts, locations, performance metrics, unsourced client counts. Each pattern was checked against the deck and the legacy site and appears in neither.

**Scope is deliberately narrow** — `src/content/` only. Fabrication enters through content, not components, and a wider net would nag about ordinary prose.

---

## Test results

Both hooks were tested before being documented. **8/8 cases behave correctly.**

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
4. **Two, not ten.** Only rules where violation is both likely and costly earn a hook.

## Not hooked, and why

| Considered | Why not |
|---|---|
| Lint/format on save | Already handled by the global setup at `skills/Setup/Setup/claude-setup/hooks/format.mjs` |
| Block `.env` commits | Covered by `.gitignore` and the `permissions.deny` list in `.claude/settings.json` |
| Enforce file length <300 lines | A guideline with legitimate exceptions. `code-reviewer` handles it with judgement |
| Run tests on Stop | Slow, noisy, and CI already gates merges |
| Block dependency installs | `permissions` already prompts; a hard block would be obstructive |
