/**
 * PreToolUse (Edit|Write) — enforce the Coffee Digital design system.
 *
 * Design.md says "a component may never define a colour" and CLAUDE.md lists
 * hardcoded values under "Never do". Prose rules get forgotten at 2am; this
 * one is enforced by the harness.
 *
 * Blocks, inside src/ only:
 *   - raw hex literals anywhere but tokens.css
 *   - the dead brown palette, anywhere at all
 *   - box-shadow (Design.md: elevation is none)
 *   - inline cubic-bezier / raw ms durations in animation calls
 *
 * Fails open on any parsing problem — never block on our own bug.
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
// content for Write, new_string for Edit
const body = String(input.content ?? input.new_string ?? "");

if (!path || !body) process.exit(0);

// Only police THIS project. Without the root check the `/src/` test matches
// any sibling project on disk, and the hook blocks writes it has no business
// touching.
const root = String(process.env.CLAUDE_PROJECT_DIR ?? process.cwd()).replace(/\\/g, "/");
if (root && !path.toLowerCase().startsWith(root.toLowerCase())) process.exit(0);

if (!/\/src\//.test(path)) process.exit(0); // only police application code

const isTokenFile = /\/src\/styles\/tokens\.css$/.test(path);

// Strip comments so a "// e.g. #FFFAF3" note doesn't trip the check.
const code = body
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/(^|[^:])\/\/.*$/gm, "$1");

const violations = [];

// 1. The retired palette. Dead everywhere, including tokens.css.
const DEAD = /#(46362F|E6DBBC|FFF7EC)\b/i;
if (DEAD.test(code)) {
  violations.push(
    `Uses the retired brown palette (#46362F / #E6DBBC / #FFF7EC). ` +
      `The locked palette is #FFFAF3 #FFF2DB #FFE5BF #F62440 plus --ink #3F2210. See brand/palette.md.`,
  );
}

// 2. Raw hex outside tokens.css.
if (!isTokenFile) {
  const hex = code.match(/#[0-9a-fA-F]{3,8}\b/g);
  if (hex) {
    const uniq = [...new Set(hex)].slice(0, 5).join(", ");
    violations.push(
      `Hardcoded colour(s) ${uniq}. Only src/styles/tokens.css may contain raw hex — ` +
        `use a semantic token (var(--ink), var(--paper), var(--heat), …). See Design.md §3.`,
    );
  }
}

// 3. No elevation. Design.md §8: depth comes from ground shifts, not shadows.
if (/box-shadow\s*:\s*(?!none)/.test(code)) {
  violations.push(
    `box-shadow is not used in this design system. Depth comes from ground shifts, ` +
      `scale and parallax. See Design.md §8.`,
  );
}

// 4. Inline easing / duration in animation code.
if (/cubic-bezier\s*\(/.test(code) && !isTokenFile) {
  violations.push(
    `Inline cubic-bezier(). Use an easing token — --ease-out-quint, --ease-out-expo, ` +
      `--ease-in-out, --ease-linear (or EASE.* in motion/tokens.ts). See Design.md §9.`,
  );
}
if (/\b(?:duration|ease)\s*:\s*['"]?\d/.test(code)) {
  violations.push(
    `Inline animation duration. Use a duration token — DUR.instant/fast/base/slow/reveal. See Design.md §9.`,
  );
}

if (violations.length) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          `Design-system violation in ${path.split("/").pop()}:\n` +
          violations.map((v, i) => `  ${i + 1}. ${v}`).join("\n"),
      },
    }),
  );
}
// No process.exit(): on Windows, stdout to a pipe is async and exiting here
// would discard the buffer. Let node exit on its own.
