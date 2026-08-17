---
tags: [tooling, agents, skills, mcp]
---

# Skills, Agents, MCPs & Hooks

The tooling layer for the Coffee Digital project.

Related: [[routing]] · [[agents/README|agents]] · [[mcps/README|mcps]] · [[hooks/README|hooks]] · [[../CLAUDE|CLAUDE.md]]

---

## The finding that shaped this folder

The brief asked for research into "trending skills like brand, ui/ux pro max, impeccable, superpowers" and "mobbin mcp, originkit mcp, motion.dev mcp".

**Most of it is already installed, and two of the three named MCPs don't exist.**

So the work here was never installation. It is **routing** — making the right tool fire without being asked — plus **enforcement**, so the rules that matter don't depend on anyone remembering them.

## What's here

```
skills/
├── README.md      this file — the audit and rationale
├── routing.md     condition → tool. The auto-invocation contract
├── agents/        the 3 new agents, and why the other 7 already exist
├── mcps/          MCP evaluation, verified-existing only
├── hooks/         2 enforcement + 2 vault-memory hooks
├── workflows/     repeatable multi-step sequences
└── Setup/         ⚠️ pre-existing 544-file global setup — NOT ours, do not duplicate
```

⚠️ **`skills/Setup/` was already in this repo before the project started.** It is Harsh's global Claude setup — agent definitions, hook scripts, and a 500-file skills library. This folder **extends** it; it does not replace or duplicate it. The hook scripts in `Setup/Setup/claude-setup/hooks/` were the template for ours.

---

## Skills audit

Checked against the live skill registry. **Nothing needs installing.**

| Skill the brief named | Status | Used for |
|---|---|---|
| `impeccable` | ✅ Installed | **Primary.** Any component, layout, or visual polish work |
| `ui-ux-pro-max` | ✅ Installed | UX evaluation passes |
| `brand` | ✅ Installed | Brand consistency checks against [[../brand/brand-audit\|brand-audit]] |
| `using-superpowers` | ✅ Installed | Meta-skill for skill discovery |

Also present and relevant, not named in the brief:

| Skill | Used for |
|---|---|
| `design-system` | Token architecture — feeds [[../Design\|Design]] |
| `animation-vocabulary` | Naming motion effects precisely in the page specs |
| `browser-testing-with-devtools` | Verifying behaviour in a real browser |
| `performance-optimization` | Enforcing the budgets in [[../PRD#16 Performance requirements\|PRD §16]] |
| `frontend-ui-engineering` | Production component patterns |
| `obsidian-vault` | This documentation set |
| `firecrawl` | Reference research |
| `design-taste-frontend`, `high-end-visual-design`, `emil-design-eng` | Anti-generic design critique |

**Deliberately not used:** `shadcn` (we build our own primitives), `dataviz` (no charts), `slides` (no decks).

---

## Agents

Harsh's global setup already defines **seven**: `planner`, `frontend-dev`, `backend-dev`, `code-reviewer`, `qa-verifier`, `seo-auditor`, `docs-writer`.

The brief proposed six new ones. **Three were rejected as duplicates:**

| Proposed | Verdict |
|---|---|
| Research Agent | ✅ **Built** as `reference-researcher` |
| Design Critic | ✅ **Built** as `design-critic` |
| Motion Engineer | ✅ **Built** as `motion-engineer` |
| Frontend Architect | ❌ Duplicate of `planner` + `frontend-dev` |
| Visual QA Agent | ❌ Duplicate of `qa-verifier` + `browser-testing-with-devtools` |
| Performance Agent | ❌ Duplicate of `seo-auditor` + `performance-optimization` |

Definitions live in `.claude/agents/` where Claude Code actually loads them. Rationale in [[agents/README|agents/README]].

---

## MCPs

Full evaluation in [[mcps/README|mcps/README]]. Summary:

**Already connected and useful here:** Figma, Chrome DevTools, Playwright, Firecrawl, GitHub, filesystem, memory, sequential-thinking, Higgsfield.

**Named in the brief:**

| MCP | Reality |
|---|---|
| **Mobbin** | ✅ Real and official (`api.mobbin.com/mcp`). **Requires a paid Mobbin Pro plan** — recommend only if already subscribed |
| **Motion.dev** | ⚠️ No official server exists. Community repo only. **Skip** — we use GSAP, not Motion |
| **OriginUI / OriginKit** | ❌ No official MCP found. **Skip** |

**Not installing anything new.** The connected set covers every need this project has.

---

## Hooks

Four. Two enforce the rules most likely to erode under time pressure; two make the Obsidian vault behave as live project memory. All tested — 17/17 cases pass.

| Hook | Event | Does |
|---|---|---|
| `guard-tokens.mjs` | `PreToolUse` | **Blocks** raw hex outside `tokens.css`, the retired brown palette, `box-shadow`, inline easings and durations |
| `guard-fabrication.mjs` | `PreToolUse` | **Blocks** banned schema fields, invented-fact phrasings, and the cut "most awarded" superlative |
| `vault-context.mjs` | `SessionStart` | Injects open blockers, recent resolutions and the latest decision from the vault |
| `decision-log.mjs` | `Stop` | Notes when a decision-bearing doc changed but `brain.md` did not. Never blocks |

Detail and test results in [[hooks/README|hooks/README]]. Wired in `.claude/settings.json`.

**Why hooks rather than prose:** [[../CLAUDE|CLAUDE.md]] already says "never hardcode a hex" and "never invent facts". Prose rules are advisory. A hook is not. The two rules whose violation would be most damaging — a broken design system and a fabricated client claim — are worth making mechanically impossible.

---

## Principles applied

1. **Don't install what's already installed.** The audit came before any recommendation.
2. **Don't fabricate tool names.** Every MCP was verified to exist. Two of three named in the brief do not, and they are marked as such rather than written up.
3. **Don't build duplicate agents.** Three of six proposed agents already existed under another name.
4. **Prefer official over popular.** Mobbin's official server over the unofficial scraper; no community Motion.dev server.
5. **Enforce mechanically what matters most.** Four hooks, not ten — and only the two absolute rules block.
6. **Route, don't remind.** [[routing]] exists so Harsh never has to name a tool.
