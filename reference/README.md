---
tags: [reference, index]
---

# Reference Library

Research inputs for the Coffee Digital website. Every item here exists to answer a question, and every claim cites where it came from.

Up: [[../README|Project README]] · Feeds: [[../Design|Design]] · [[../architecture|architecture]] · [[../PRD|PRD]]

## Contents

```
reference/
├── trionn/              the primary reference, audited in full
│   ├── tech-stack.md    what they ship, with evidence      ← start here
│   ├── interactions.md  motion inventory + page depths
│   ├── breakdown.md     section-by-section composition
│   ├── notes.md         take / adapt / reject decisions    ← the important one
│   ├── screenshots/     37 captures, desktop + mobile
│   └── html/            archived HTML + CSS (gitignored)
└── inspiration/
    └── notes.md         curated shortlist, with status flags
```

## The three findings that changed the plan

1. **Trionn ships OGL (~10 KB), not three.js (~150 KB).** The most technically ambitious element on a peer studio's site runs on a tiny library. This settled our 3D question — no WebGL in v1. → [[trionn/tech-stack|tech-stack]]
2. **Their `robots.txt` allows `/work` but disallows `/work/`.** They concede their case pages carry no search value — which independently validates our modal-based case view. → [[trionn/tech-stack#SEO & IA]]
3. **`/work` is 25,660px on desktop but 10,600px on mobile.** Mobile is a different composition, not a reflow. That principle is now a requirement in [[../Design|Design]]. → [[trionn/interactions#Page lengths]]

## How to use this folder

**Do:** cite it. Any motion, layout or stack decision that traces to research should link to the specific document and section.

**Don't:** treat it as a design target. The standing test in [[trionn/notes#The risk to watch]] — *would anyone confuse our page with theirs?* — is a review gate, not a suggestion.

## Provenance & ethics

- All findings come from **publicly accessible sources**: rendered HTML, linked CSS, response headers, `robots.txt`, `sitemap.xml`, and headless-browser capture of public URLs.
- **No authentication, paywall, rate limit, or access control was bypassed.** No source maps were reconstructed, no private endpoints touched.
- Archived HTML/CSS in `trionn/html/` is kept **locally for study and is gitignored** — the project repo is public, and republishing another company's source is not ours to do. Our own written analysis is committed; their code is not.
- Screenshots are third-party marketing pages retained for design research.

## Status

| Item | Status | Audited |
|---|---|---|
| Trionn | 🔍 Complete | 2026-08-17 |
| coffeedigital.in (legacy) | 🔍 Complete → [[../brand/brand-audit|brand-audit]] | 2026-08-17 |
| Inspiration shortlist | 📋 5 queued, 0 audited | — |
