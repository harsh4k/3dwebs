/**
 * SessionStart — load the Obsidian vault's live state into context.
 *
 * This is what makes the vault actual context storage rather than a folder of
 * files someone has to remember to open. TBD.md holds what is unresolved and
 * brain.md holds why things are the way they are; both are read here so the
 * first prompt of a session starts informed instead of spending a turn asking.
 *
 * Deliberately compact — a few hundred characters, not a document dump. The
 * docs are on disk and readable; this is a pointer to what changed and what
 * is open.
 *
 * Fails open and silent: a missing or restructured file contributes nothing
 * rather than erroring.
 */
import { readFileSync, existsSync } from "node:fs";

const read = (p) => {
  try {
    return existsSync(p) ? readFileSync(p, "utf8") : "";
  } catch {
    return "";
  }
};

const lines = [];

// ── Open blockers and section-level questions ────────────────────────────
const tbd = read("TBD.md");
if (tbd) {
  // A resolved item is rewritten as "### ✅ B1 — …"; anything still carrying
  // the ⛔ glyph in a heading is genuinely open.
  const openBlockers = (tbd.match(/^###\s+⛔/gm) || []).length;
  const openSections = (tbd.match(/^###\s+S\d+\s+—/gm) || []).filter(Boolean).length;
  const resolvedSections = (tbd.match(/^###\s+✅\s+S\d+/gm) || []).length;

  lines.push(
    openBlockers === 0
      ? "TBD: no open launch blockers."
      : `TBD: ${openBlockers} open launch blocker(s).`,
  );
  const stillOpen = openSections - resolvedSections;
  if (stillOpen > 0) lines.push(`TBD: ${stillOpen} open section-level question(s).`);

  // Surface the most recent resolutions so decisions aren't re-litigated.
  const log = tbd.split(/##\s*Resolution log/i)[1] || "";
  const rows = (log.match(/^\|\s*\d{4}-\d{2}-\d{2}.*$/gm) || []).slice(0, 3);
  if (rows.length) {
    lines.push("Recent resolutions:");
    for (const r of rows) {
      const cells = r.split("|").map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 3) lines.push(`  ${cells[0]} ${cells[1]}: ${cells[2].slice(0, 90)}`);
    }
  }
}

// ── Latest recorded decision ─────────────────────────────────────────────
const brain = read("brain.md");
if (brain) {
  const ds = brain.match(/^###?\s+D\d+\s+—\s+(.+)$/gm) || [];
  if (ds.length) {
    const last = ds[ds.length - 1].replace(/^###?\s+/, "");
    lines.push(`brain.md: ${ds.length} recorded decisions, most recent "${last.slice(0, 80)}".`);
  }
}

// ── Implementation phase ─────────────────────────────────────────────────
lines.push(
  existsSync("src")
    ? "Implementation: src/ exists."
    : "Implementation: src/ does not exist yet; the repo is documentation only.",
);

if (lines.length) {
  // Factual statements, not imperatives — imperative phrasing in injected
  // context reads as an out-of-band instruction and trips prompt-injection
  // defenses. Matches the convention in the global session-context hook.
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: ["Coffee Digital vault state:", ...lines].join("\n"),
      },
    }),
  );
}
