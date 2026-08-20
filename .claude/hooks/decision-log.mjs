/**
 * Stop — note when a decision-bearing document changed but brain.md did not.
 *
 * brain.md is the project's persistent reasoning: what was decided, what was
 * rejected, and why. Its failure mode is silent — decisions get made in a
 * session and simply never written down, so six weeks later nobody remembers
 * why the palette has an ink token or why there is no CMS.
 *
 * This does NOT block. It emits one line, only when the heuristic actually
 * fires. A nagging hook gets disabled, and a disabled hook enforces nothing.
 *
 * The heuristic: PRD / Design / architecture / TBD / specs/ carry decisions.
 * If one of those is dirty and brain.md is not, a decision probably went
 * unrecorded. TBD.md changing is the strongest signal — it usually means
 * something was resolved.
 *
 * Fails open and silent.
 */
import { spawnSync } from "node:child_process";

const git = (args) => {
  const r = spawnSync("git", args, { encoding: "utf8", timeout: 5000 });
  return r.status === 0 ? String(r.stdout) : null;
};

if (!git(["rev-parse", "--is-inside-work-tree"])) process.exit(0);

const status = git(["status", "--porcelain"]);
if (!status || !status.trim()) process.exit(0); // clean tree, or git unavailable

// Porcelain is a two-character status field then a space, e.g. " M path",
// "?? path", "R  old -> new". The output must NOT be trimmed as a whole:
// an unstaged modification starts with a space, and trimming the string
// shifts the first line's path by one character.
const changed = status
  .split("\n")
  .filter((l) => l.length > 3)
  .map((l) => l.slice(3).trim().replace(/^"|"$/g, ""))
  .map((p) => (p.includes(" -> ") ? p.split(" -> ").pop() : p)); // renames

const brainTouched = changed.some((f) => f.endsWith("brain.md"));
if (brainTouched) process.exit(0); // already recorded

const DECISION_BEARING = [
  { re: /^PRD\.md$/, label: "PRD.md" },
  { re: /^Design\.md$/, label: "Design.md" },
  { re: /^architecture\.md$/, label: "architecture.md" },
  { re: /^TBD\.md$/, label: "TBD.md" },
  { re: /^specs\/.+\.md$/, label: "a page spec" },
  { re: /^brand\/(palette|brand-audit)\.md$/, label: "a brand document" },
];

const hits = [
  ...new Set(
    changed
      .map((f) => DECISION_BEARING.find((d) => d.re.test(f))?.label)
      .filter(Boolean),
  ),
];

if (!hits.length) process.exit(0);

const what = hits.length === 1 ? hits[0] : `${hits.slice(0, -1).join(", ")} and ${hits.at(-1)}`;

// Plain stdout, no block. Surfaced in the transcript as a note.
process.stdout.write(
  `Note: ${what} changed this session; brain.md did not. ` +
    `If a decision was made — something chosen, rejected, or discovered — brain.md is where it is recorded. ` +
    `Routine edits (typos, formatting, wording) do not need an entry.\n`,
);
