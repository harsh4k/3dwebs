/**
 * The hairline field the footer is built from.
 *
 * **Generated, not drawn.** The reference footer fetches a piece of line art and turns every
 * stroked path in it into a string. Ours is computed here instead, which is both cleaner and the
 * only option available: their art is theirs. Generating it also means the field reflows to the
 * viewport instead of being a fixed-size asset that has to be scaled, and it costs no request.
 *
 * The composition is a stack of horizontal rules whose left edge follows a slow sine, so the block
 * has a soft breathing edge rather than a ruled margin, and whose right edge runs to full width.
 * The curve is deterministic — same field every render, no seeded randomness to desynchronise
 * between server and client.
 */

export interface Hairline {
  /** Index in the stack, top to bottom. */
  index: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /**
   * 0 at the top of the stack, 1 at the bottom, curved. Lines further down ring louder and
   * brighter, so the field has a gradient of liveliness rather than being uniform.
   */
  intensity: number;
}

/** Lines in the stack. Fewer on a phone — 175 hairlines on a 375px screen is a grey block. */
export const lineCount = (width: number): number => (width < 768 ? 90 : 175);

/** The viewBox the field is generated into; the SVG scales it to whatever box it lands in. */
export const FIELD_WIDTH = 1000;
export const FIELD_HEIGHT = 520;

/** How far the left edge swings, as a fraction of the field width. */
const SWING = 0.22;
/** Full sine cycles down the stack. */
const CYCLES = 1.5;

export const buildLineField = (count: number): Hairline[] => {
  const lines: Hairline[] = [];
  const step = FIELD_HEIGHT / (count - 1);

  for (let index = 0; index < count; index += 1) {
    const t = index / (count - 1);
    const y = index * step;

    /* Eased at both ends so the edge arrives and leaves smoothly instead of clipping. */
    const swing = (1 - Math.cos(t * Math.PI * 2 * CYCLES)) / 2;
    const x1 = swing * SWING * FIELD_WIDTH;

    lines.push({
      index,
      x1,
      y1: y,
      x2: FIELD_WIDTH,
      y2: y,
      /* Matches the reference's ramp shape — a gentle curve rather than a straight line, so the
         quiet end of the field stays quiet across most of it. */
      intensity: Math.pow(t, 1.25),
    });
  }

  return lines;
};

/** `d` for a straight hairline — its resting state. */
export const restPath = (line: Hairline): string =>
  `M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}`;

/**
 * `d` for a plucked hairline.
 *
 * `sin(PI * t)` pins both ends so the string is anchored where it meets the field, and
 * `sin(2PI * cycles * t + phase)` is the wave travelling along it. The result is pushed out along
 * the segment's normal, so this works for a diagonal as readily as a horizontal one.
 */
export const wavePath = (
  line: Hairline,
  amplitude: number,
  phase: number,
  cycles: number,
  segments: number,
): string => {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const length = Math.hypot(dx, dy) || 1;
  /* Unit normal — the segment direction turned a quarter turn. */
  const nx = -dy / length;
  const ny = dx / length;

  let d = "";
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const envelope = Math.sin(Math.PI * t);
    const offset = envelope * Math.sin(2 * Math.PI * cycles * t + phase) * amplitude;
    const x = line.x1 + dx * t + nx * offset;
    const y = line.y1 + dy * t + ny * offset;
    d += `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return d.trim();
};
