---
tags: [tooling, workflows, runbooks]
---

# Workflows

Repeatable multi-step sequences. These are **runbooks** — the operational detail that [[../routing|routing]] only summarises.

---

## W1 — Capture Tier-A work imagery

The asset pipeline for `/work`. See [[../../pages/work#Asset tiers|work — asset tiers]].

```
1. Confirm liveness         curl -o /dev/null -w "%{http_code}" <url>
2. Confirm tier             Tier A only. NEVER capture Tier B without
                            client confirmation (TBD B3) — presenting a
                            brand's current site as ours is misrepresentation
3. Capture                  node scripts/capture-work.mjs --slug=<slug>
                            1440×900 @2x  +  390×844 @2x
                            walk the full page first to prime ScrollTriggers,
                            then capture — otherwise you get pre-animation
                            hidden states
4. Optimise                 node scripts/optimise-images.mjs
                            → AVIF + WebP, responsive widths, blur data
5. Place                    public/work/<slug>/<slug>-<variant>-<width>.<ext>
6. Register                 add to src/content/projects.ts
                            ← guard-fabrication.mjs runs here
7. Verify                   npm run build   (Zod validation gates it)
```

**Playwright note:** launch with `channel: 'chrome'` — the npx-cached Playwright expects a headless-shell build that isn't installed locally. This is how the 37 reference captures were taken.

---

## W2 — Add or amend a project

```
1. Verify the fact          Is it in brand/brand-audit.md → Confirmed?
                            If not, STOP. Log it in TBD.md
2. Assign a tier            A / B / C — an explicit decision, always
3. Check the URL            liveness now, not from the deck
4. Write the record         src/content/projects.ts
                            NO year, metrics, outcome or testimonial —
                            the schema has no fields for them, and the
                            hook will block them
5. Assets                   → W1
6. Verify                   npm run build && qa-verifier
```

---

## W3 — Build a page section

```
1. Read the spec            pages/<page>.md — the section is fully specified,
                            including its motion block
2. Load impeccable          before writing any code
3. Build                    frontend-dev · compose the 8 UI primitives
4. Animate                  motion-engineer · compose the 6 motion primitives
                            check Design.md §10 for the per-tier behaviour
                            BEFORE writing a tween
5. Critique                 design-critic
6. Review                   code-reviewer → qa-verifier
7. Verify in browser        browser-testing-with-devtools
                            mobile + reduced-motion + JS-disabled
```

---

## W4 — Add a reference

```
1. reference-researcher, public sources only
2. Create reference/<name>/
3. Required sections:
     - the question it answers
     - what we should learn
     - WHAT WE SHOULD NOT COPY     ← mandatory; without it the
                                     reference is incomplete
     - evidence for every technical claim
4. Label confidence: Certain / High / Inferred / Unverified
5. Update reference/README.md status table
```

---

## W5 — Pre-launch

Run in order. Any failure blocks launch.

```
1. ⛔ TBD blockers          none open (B1/B2/B3 resolved 2026-08-17).
                            Re-check TBD.md for any newly raised blocker
2. Fabrication audit        every visible claim traces to
                            brand-audit → Confirmed, or is marked Proposed
3. Performance              Lighthouse CI, throttled mobile.
                            Budgets in PRD §16
4. Accessibility            axe + manual keyboard pass + screen reader
5. Reduced motion           full pass with the preference enabled —
                            the site must be COMPLETE, not degraded
6. No-JS                    content readable, links work, form → mailto
7. Responsive               320 / 768 / 1024 / 1440 / 1920, plus 200% zoom
8. SEO                      seo-auditor
9. Confusion test           logos removed — is it distinguishable from
                            the reference? See reference/trionn/notes
10. Links                   re-run the liveness sweep; tiers still correct
```

---

## W6 — Resolve a TBD

```
1. Get the answer in writing from the owner
2. Update brand/brand-audit.md → move to Confirmed, with its source
3. Update the affected page spec(s)
4. Update src/content/  ← the component already handles presence/absence
5. Log it in TBD.md → Resolution log, with the date and who decided
6. If it was a ⛔ blocker, note it in brain.md
```

**The point of step 4:** because optional data uses the presence pattern ([[../../architecture#Optional data — the TBD pattern|architecture]]), filling a gap is a one-line content edit. No component changes, ever.
