---
tags: [tooling, routing, automation]
---

# Routing — Tools That Fire Without Being Asked

> **The requirement, in Harsh's words:** *"use them by default for respective situation — I shouldn't call it out for you."*

This is the contract. Match the condition, load the tool. No prompting required.

Related: [[README|skills/README]] · [[../CLAUDE#Skill & agent routing|CLAUDE.md]]

---

## How auto-invocation actually works

Three mechanisms, in descending order of reliability:

| Mechanism | Enforced by | Reliability |
|---|---|---|
| **Hooks** in `.claude/settings.json` | The harness | **Absolute** — cannot be forgotten |
| **Agent `description` fields** with "Use PROACTIVELY" | Model routing | High |
| **The routing table** in [[../CLAUDE\|CLAUDE.md]] | Instruction-following | Good |

Rules that must never be violated belong in the first tier. Rules about *which specialist to use* belong in the second and third.

---

## The table

### By work type

| Condition | Tool | Timing |
|---|---|---|
| Building/editing any component, layout, or styling | `impeccable` skill | **Before** writing code |
| Token, type-scale, or design-system work | `design-system` skill + [[../Design\|Design]] | Before |
| Any GSAP / ScrollTrigger / Lenis / animation work | `motion-engineer` agent | Before |
| Naming a motion effect precisely | `animation-vocabulary` skill | During |
| Any React / Next component implementation | `frontend-dev` agent | — |
| Any API route, form handler, or env work | `backend-dev` agent | — |
| Architecture, or a change touching >3 files | `planner` agent | **Before** building |

### By verification need

| Condition | Tool | Timing |
|---|---|---|
| Section or page finished | `design-critic` agent | After building, before review |
| Any change set complete | `code-reviewer` → then `qa-verifier` | **Always**, in that order |
| Needs real-browser verification | `browser-testing-with-devtools` skill | After building |
| Bundle size, CWV, image weight | `performance-optimization` skill | Before merge |
| Before any deploy | `seo-auditor` agent | Before deploy |
| UX evaluation pass | `ui-ux-pro-max` skill | On request or before launch |

### By research need

| Condition | Tool |
|---|---|
| Investigating a site, stack, library, or MCP | `reference-researcher` agent |
| Scraping or searching the web | `firecrawl` skill |
| Adding to the reference library | `reference-researcher` + [[../reference/README\|reference/README]] standards |
| Checking brand consistency | `brand` skill + [[../brand/brand-audit\|brand-audit]] |

### By documentation need

| Condition | Tool |
|---|---|
| README, CLAUDE.md, or doc updates | `docs-writer` agent |
| Obsidian vault structure | `obsidian-vault` skill |

---

## Enforced automatically — no agent involved

These fire from `.claude/settings.json` on every `Edit` and `Write`. They cannot be skipped.

| Trigger | Hook | Result |
|---|---|---|
| Raw hex written into `src/` outside `tokens.css` | `guard-tokens.mjs` | **Blocked** |
| Retired brown palette used anywhere | `guard-tokens.mjs` | **Blocked** |
| `box-shadow` written | `guard-tokens.mjs` | **Blocked** |
| Inline `cubic-bezier()` or raw duration | `guard-tokens.mjs` | **Blocked** |
| Banned schema field added (`year`, `metrics`, `outcome`, `testimonial`, …) | `guard-fabrication.mjs` | **Blocked** |
| Invented-fact phrasing in `src/content/` | `guard-fabrication.mjs` | **Blocked** |

---

## Standard sequences

**Building a page section**
```
impeccable → [motion-engineer if animated] → build
  → design-critic → code-reviewer → qa-verifier
```

**Adding a project to /work**
```
reference-researcher (verify URL liveness + tier)
  → update content/projects.ts        ← guard-fabrication runs
  → capture assets                     ← scripts/capture-work.mjs
  → qa-verifier
```

**Before deploy**
```
qa-verifier → performance-optimization → seo-auditor
  → browser-testing-with-devtools (mobile + reduced-motion + JS-disabled)
```

**Adding a reference**
```
reference-researcher → reference/<name>/
  → must include a "what NOT to copy" section
```

---

## Deliberately not routed

| Not used | Why |
|---|---|
| `shadcn` skill | We build our own eight primitives ([[../architecture#Rejected, and why\|architecture]]) |
| `dataviz` | No charts on this site |
| `slides` | No presentations |
| Mobbin MCP | Requires a paid plan — see [[mcps/README\|mcps]] |
| Any CMS tooling | No CMS |
| Supabase / database agents | No backend beyond one form handler |

---

## Verifying it works

Auto-invocation is a **behavioural** claim, so test it behaviourally:

1. Start a fresh session in this repo.
2. Ask: *"add a hero section to the services page."*
3. **Expected:** `impeccable` loads unprompted; `pages/services.md` is read before any code; `code-reviewer` runs afterwards without being asked.
4. Then try writing `color: #FF0000` into a component. **Expected:** blocked by `guard-tokens.mjs` with a message pointing at `Design.md §3`.

If step 3 doesn't happen, the routing table in [[../CLAUDE|CLAUDE.md]] needs to be more specific. If step 4 doesn't happen, the hook is misconfigured — check the paths in `.claude/settings.json`.
