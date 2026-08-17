/**
 * PreToolUse (Edit|Write) — enforce Rule 0: never invent Coffee Digital facts.
 *
 * The credentials deck gives us names, URLs and screenshots. It gives us NO
 * founding year, headcount, location, project dates, metrics or testimonials.
 * The Project schema deliberately has no fields for them (architecture.md §5).
 *
 * This hook guards the two ways that discipline erodes:
 *   1. someone widens the schema to admit a fabricated field
 *   2. someone writes a plausible-sounding invented fact into content
 *
 * Scope is narrow on purpose — src/content/ and the page specs — so it catches
 * fabrication without nagging about ordinary prose elsewhere.
 * Fails open on any parsing problem.
 */
import { readFileSync } from "node:fs";

let raw = "";
try {
  raw = readFileSync(0, "utf8");
} catch {
  process.exit(0);
}

let input;
try {
  input = JSON.parse(raw)?.tool_input ?? {};
} catch {
  process.exit(0);
}

const path = String(input.file_path ?? "").replace(/\\/g, "/");
const body = String(input.content ?? input.new_string ?? "");
if (!path || !body) process.exit(0);

const inContent = /\/src\/content\//.test(path);
if (!inContent) process.exit(0);

const violations = [];

// 1. Schema fields that must not exist. architecture.md §5 — the constraint is
//    structural so that fabrication needs a deliberate, reviewable change.
const BANNED_FIELDS = [
  ["year", "project dates are not in any source"],
  ["metrics", "no project outcome or metric exists anywhere"],
  ["outcome", "no project outcome exists anywhere"],
  ["results", "no project results exist anywhere"],
  ["testimonial", "no testimonials exist; the PRD excludes them"],
  ["founded", "no founding year is stated in any source"],
  ["teamSize", "no headcount is stated in any source"],
  ["headcount", "no headcount is stated in any source"],
];
for (const [field, why] of BANNED_FIELDS) {
  const re = new RegExp(`(^|[\\s,{])${field}\\s*[:?]`, "m");
  if (re.test(body)) {
    violations.push(`Field \`${field}\` — ${why}. See brand/brand-audit.md → Missing.`);
  }
}

// 2. Invented-fact phrasings. Each of these has been checked against the deck
//    and the legacy site and appears in neither.
const BANNED_CLAIMS = [
  [/\b(?:founded|established|since|est\.?)\s+(?:in\s+)?(?:19|20)\d{2}/i, "a founding year"],
  [/\bfor\s+over\s+(?:a\s+decade|\d+\s+years)/i, "an unsourced tenure claim"],
  [/\bteam\s+of\s+\d+/i, "a headcount"],
  [/\b\d+\s*\+?\s*(?:designers|engineers|developers|employees|people)\b/i, "a headcount"],
  [/\bbased\s+in\s+[A-Z][a-z]+/, "a location (no address exists in any source)"],
  [/\b(?:increased|improved|grew|boosted|reduced|drove)\b[^.]{0,40}\b\d+\s*%/i, "a performance metric"],
  [/\b\d+\s*%\s*(?:increase|growth|uplift|improvement|conversion)/i, "a performance metric"],
  [/\btrusted\s+by\s+\d+/i, "an unsourced client count"],
  [/\b\d{2,}\s*\+\s*(?:clients|brands|projects)\b/i, "an unsourced count — the confirmed figures are 28 projects and 27 named marks"],
  // Cut 2026-08-17 (TBD B2). Also catches the softened variants — the
  // qualifier does not fix the missing basis.
  [/\b(?:the\s+)?most\s+awarded\b/i, "the cut 'most awarded' superlative — replaced by the factual framing naming six award bodies. See TBD.md B2"],
  [/\b(?:one\s+of|among)\s+(?:the\s+)?(?:india'?s\s+)?most\s+awarded/i, "a softened form of the cut superlative — still has no cited basis"],
];
for (const [re, what] of BANNED_CLAIMS) {
  const m = body.match(re);
  if (m) {
    violations.push(`"${m[0].trim()}" reads as ${what}. This does not exist in the credentials deck or the legacy site.`);
  }
}

if (violations.length) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          `Rule 0 — never invent Coffee Digital information. In ${path.split("/").pop()}:\n` +
          violations.map((v, i) => `  ${i + 1}. ${v}`).join("\n") +
          `\n\nIf the fact is real, add it to brand/brand-audit.md → Confirmed with its source first. ` +
          `If it is not, log the gap in TBD.md and leave the slot unrendered.`,
      },
    }),
  );
}
