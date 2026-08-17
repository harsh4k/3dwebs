---
tags: [tooling, agents]
---

# Agents

Three new agents. **Definitions live in `.claude/agents/`** — where Claude Code actually loads them. This file records the roster and the reasoning.

Related: [[../routing|routing]] · [[../README|skills/README]]

---

## The roster

### Already existed — global setup, 7 agents

`planner` · `frontend-dev` · `backend-dev` · `code-reviewer` · `qa-verifier` · `seo-auditor` · `docs-writer`

These cover planning, implementation, review, verification, SEO, and documentation. They are not duplicated here.

### New — 3 agents

| Agent | Owns | Definition |
|---|---|---|
| **`motion-engineer`** | GSAP, ScrollTrigger, Lenis, the six primitives, animation performance, reduced motion | [[../../.claude/agents/motion-engineer\|motion-engineer]] |
| **`design-critic`** | Genericness, brand drift, hierarchy, reference-similarity, fabrication in visible copy. Read-only | [[../../.claude/agents/design-critic\|design-critic]] |
| **`reference-researcher`** | Site and stack investigation from public sources; verifying tools exist | [[../../.claude/agents/reference-researcher\|reference-researcher]] |

---

## Why only three

The brief proposed six. Three were rejected as duplicates of agents that already exist:

| Proposed | Verdict | Covered by |
|---|---|---|
| Research Agent | ✅ Built | — |
| Design Critic | ✅ Built | — |
| Motion Engineer | ✅ Built | — |
| **Frontend Architect** | ❌ Rejected | `planner` (architecture) + `frontend-dev` (implementation). A third agent would just arbitrate between them |
| **Visual QA Agent** | ❌ Rejected | `qa-verifier` + the `browser-testing-with-devtools` skill. Screenshot comparison is a *tool*, not a role |
| **Performance Agent** | ❌ Rejected | `seo-auditor` + the `performance-optimization` skill. Budgets are enforced in CI, which is more reliable than an agent remembering to look |

The brief's own instruction was *"do not create agents that duplicate each other's responsibilities."* Three of six did.

---

## Why these three earn their place

**`motion-engineer`** — motion is the largest technical risk in the project. Six primitives, a responsive matrix with 11 interactions × 4 tiers, a hard 60fps target on mid-range Android, and a reduced-motion branch that must be complete rather than merely degraded. That is a specialism, and it's where a generalist most reliably gets it wrong — usually by hiding content behind an animation that then fails to run.

**`design-critic`** — the client is a design agency. A site that looks templated or derivative doesn't just look bad, it refutes the product's own argument. This needs a reviewer whose only job is to ask *"would anyone confuse this with the reference?"* and *"does this look generated?"* — questions the person who just built it cannot ask honestly.

**`reference-researcher`** — research is where fabrication is most tempting and least visible. Describing an MCP that doesn't exist, or asserting a stack detail from impression rather than evidence, produces confident text that is simply wrong. This agent carries explicit confidence labelling and a hard rule against stating unverified things as fact.

---

## Boundaries

No agent overlaps another:

```
planner              → what to build, in what order
frontend-dev         → builds components
backend-dev          → builds the form handler and env plumbing
motion-engineer      → builds animation, and only animation
design-critic        → judges the result visually  (read-only)
code-reviewer        → judges the result as code   (read-only)
qa-verifier          → verifies it runs and passes (read-only)
seo-auditor          → verifies it is findable     (read-only)
reference-researcher → investigates the outside world
docs-writer          → keeps this documentation true
```

Four of the nine are read-only. That is deliberate: **the agents that judge cannot also edit**, so a reviewer can never quietly fix what it should be reporting.

## Invocation

Automatic, via [[../routing|routing]] and the `description` fields. Harsh should not have to name any of them.
