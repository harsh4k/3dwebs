---
tags: [tooling, mcp]
---

# MCP Evaluation

Every server assessed against the brief's criteria. **Verified to exist before being written up** — no fabricated names, no invented capabilities.

Related: [[../README|skills/README]] · [[../routing|routing]]

**Verified:** 2026-08-17

---

## Recommendation

**Install nothing new.** The already-connected set covers every need this project has. Of the three MCPs the brief named, one is real but paid, and two do not exist as official servers.

---

## Named in the brief

### Mobbin — ✅ real, official, paid

```
Official source:  github.com/mobbin/mobbin-mcp-server · api.mobbin.com/mcp
Purpose:          621,500+ real app screens and 142,200+ flows as design reference
Problem it solves: grounding UI decisions in real products rather than imagination
Why this project: weak fit. Mobbin is an app-UI library; we're building a
                  marketing site. Our reference need is agency websites,
                  which Mobbin does not cover
Alternative:      Firecrawl + Playwright, already connected, which is exactly
                  how the Trionn audit was done
Cost:             Requires a paid Mobbin Pro plan. Free accounts cannot reach
                  the MCP endpoint
Permissions:      Browser OAuth, remote HTTP
Maintenance:      Official, in beta
Risk:             Low
Recommended:      ❌ Not for this project. Reconsider only if already subscribed
```

### Motion.dev — ⚠️ no official server

```
Official source:  NONE FOUND. Only a community project
                  (Abhishekrajpurohit/motion-dev-mcp)
Purpose:          would generate Motion animation code
Why this project: none. We use GSAP, not Motion — an explicit decision in
                  architecture.md ("one animation system, not two")
Risk:             Unofficial code-generating server with no maintenance guarantee
Recommended:      ❌ Skip. Wrong library, and no official source
```

### OriginUI / OriginKit — ❌ does not exist

```
Official source:  NONE FOUND
Recommended:      ❌ Skip. Also moot — we build our own primitives rather
                  than using a component library (architecture.md)
```

> **On this:** two of three MCPs named in the brief don't exist as official servers. Rather than describe them plausibly, they are recorded here as unverified. Inventing an MCP's capabilities would be the same failure class as inventing a client testimonial.

---

## Connected and used

| MCP | Used for | Recommendation |
|---|---|---|
| **Playwright** | Trionn capture; Tier-A work capture; visual regression; keyboard and reduced-motion passes | ✅ **Essential** — already did the heavy lifting |
| **Chrome DevTools** | Performance traces, Lighthouse, console and network inspection against the budgets in [[../../PRD#16 Performance requirements\|PRD §16]] | ✅ **Essential** |
| **Firecrawl** | Reference research; stack fingerprinting | ✅ **Used** — the Trionn audit |
| **GitHub** | Repo, PRs, CI | ✅ **Essential** |
| **filesystem** | File ops outside the working directory | ✅ Present |
| **Figma** | Only if the client supplies design files or we build a Figma library from the tokens | 🟡 **Situational** |
| **Higgsfield** | Image/video/3D generation — **texture and grain overlays** for Tier-B/C art direction | 🟡 **Situational**, see below |
| **memory**, **sequential-thinking** | General reasoning support | ✅ Present |

### On Higgsfield and generated assets

Higgsfield is connected and is the practical answer to "where do we create assets" for **abstract texture only** — grain, paper, and duotone overlays used to make low-resolution deck crops read as deliberate art direction.

**It is never used for anything representational.** No generated photography, no generated people, no generated project imagery. Every project visual is either a real capture or the real deck artefact. The reference site uses AI-generated mascot imagery; we explicitly rejected that ([[../../reference/trionn/notes#What we take, adapt, reject|why]]).

---

## Needs authorization

These are configured but unauthenticated. **This session cannot run OAuth** — authorize via claude.ai connector settings, or `claude mcp` / `/mcp` in an interactive session.

| MCP | Would be used for | Priority |
|---|---|---|
| **Vercel** | Deployment, preview URLs, build logs | 🟡 Useful at deploy time |
| **Sentry** | Error monitoring post-launch | 🟢 Optional |
| Atlassian, Google Calendar | Not needed here | ⚪ Skip |

---

## Deliberately not installed

| MCP | Why not |
|---|---|
| Supabase / Postgres | No database. One form handler, no persistence |
| Slack, Notion, Gmail, Drive | Not part of this workflow |
| Lovable | We're building this properly, not generating it |
| Brave Search / other search | `WebSearch` + Firecrawl already cover it |
| Cloudflare | Deploying to Vercel |
| Any unofficial community server | Supply-chain risk that no capability here justifies |

## Evaluation principles

1. **Verify existence first.** Two named MCPs failed this and are recorded as not found.
2. **Official over popular.** Mobbin's official server over the unofficial scraper.
3. **Relevance over capability.** Mobbin is genuinely impressive and genuinely wrong for a marketing site.
4. **Minimum permissions.** No server gets more scope than the task needs.
5. **Fewer is better.** Every connected MCP is context and a supply-chain surface.
