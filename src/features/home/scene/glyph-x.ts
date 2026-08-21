import { buildParticleCloud } from "./particle-cloud";
import type { LocalPoint, ParticleCloud } from "./particle-cloud";
import { createRandom } from "./random";
import type { GlyphConfig, MaterialFinish } from "./scene.config";

/** Cosine/sine of 45° — the two bars are mirrored about the vertical axis. */
const DIAGONAL = Math.SQRT1_2;
const SHARP = 3;

/** Solid used only if the bean point cloud fails to load. */
const X_SOLID = {
  barLength: 16.8,
  barWidth: 3.1,
  barDepth: 3.4,
  edgeNoise: 0.5,
  spill: 1.1,
  spillChance: 0.045,
} as const;

/**
 * Procedural volumetric X — the original hero form. Kept as a fallback so a
 * missing `public/assets/bean` never leaves the lattice empty.
 */
export const createProceduralXGlyph = (
  config: GlyphConfig,
  baseColor: string,
  finish: MaterialFinish,
): ParticleCloud => {
  const { count, particleSize, sizeJitter, rotation, center, lightDirection, bigFraction, bigScale, seed } =
    config;
  const { barLength, barWidth, barDepth, edgeNoise, spill, spillChance } = X_SOLID;

  const random = createRandom(seed);
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  const halfWidth = barWidth / 2;
  const halfLength = barLength / 2;
  const halfDepth = barDepth / 2;

  const extent = (halfLength + halfWidth) * DIAGONAL + spill + edgeNoise;
  const depthExtent = halfDepth + spill * 0.5;

  const points: LocalPoint[] = [];
  const normalList: number[] = [];
  const maxAttempts = count * 60;
  let attempts = 0;

  while (points.length < count && attempts < maxAttempts) {
    attempts += 1;

    const x = (random() * 2 - 1) * extent;
    const y = (random() * 2 - 1) * extent;
    const z = (random() * 2 - 1) * depthExtent;

    const aX = DIAGONAL * (x + y);
    const aY = DIAGONAL * (y - x);
    const bX = DIAGONAL * (x - y);
    const bY = DIAGONAL * (x + y);

    const inA = Math.abs(aX) <= halfWidth && Math.abs(aY) <= halfLength;
    const inB = Math.abs(bX) <= halfWidth && Math.abs(bY) <= halfLength;
    const inSolid = Math.abs(z) <= halfDepth && (inA || inB);

    let keep = inSolid;
    if (!keep) {
      const inSpill =
        Math.abs(z) <= halfDepth + spill * 0.5 &&
        ((Math.abs(aX) <= halfWidth + spill && Math.abs(aY) <= halfLength + spill) ||
          (Math.abs(bX) <= halfWidth + spill && Math.abs(bY) <= halfLength + spill));
      keep = inSpill && random() < spillChance;
    }
    if (!keep) continue;

    const useA = inA || (!inB && Math.abs(aY) <= Math.abs(bY));
    const cw = useA ? aX : bX;
    const cl = useA ? aY : bY;
    const fw = Math.abs(cw) / halfWidth;
    const fl = Math.abs(cl) / halfLength;
    const fd = Math.abs(z) / halfDepth;
    const sw = Math.sign(cw) || 1;
    const sl = Math.sign(cl) || 1;
    const sd = Math.sign(z) || 1;
    const wnx = sw * DIAGONAL;
    const wny = sw * (useA ? DIAGONAL : -DIAGONAL);
    const lnx = sl * (useA ? -DIAGONAL : DIAGONAL);
    const lny = sl * DIAGONAL;
    const ww = fw ** SHARP;
    const wl = fl ** SHARP;
    const wd = fd ** SHARP;
    let snx = wnx * ww + lnx * wl;
    let sny = wny * ww + lny * wl;
    let snz = sd * wd;
    const slen = Math.hypot(snx, sny, snz) || 1;
    snx /= slen;
    sny /= slen;
    snz /= slen;

    const jx = x + (random() - 0.5) * edgeNoise;
    const jy = y + (random() - 0.5) * edgeNoise;
    const jz = z + (random() - 0.5) * edgeNoise;

    points.push({
      x: jx * cos + jz * sin,
      y: jy,
      z: -jx * sin + jz * cos,
    });
    normalList.push(snx * cos + snz * sin, sny, -snx * sin + snz * cos);
  }

  return buildParticleCloud(points, {
    particleSize,
    sizeJitter,
    bigFraction,
    bigScale,
    color: baseColor,
    finish,
    center,
    extent,
    lightDirection,
    normals: new Float32Array(normalList),
    seed: seed + 1,
  });
};
