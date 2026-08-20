// 📖 Docs: obsidian/frontend/components/common.md

import { buildParticleCloud } from "./particle-cloud";
import type { LocalPoint, ParticleCloud } from "./particle-cloud";
import { createRandom } from "./random";
import type { GlyphConfig, MaterialFinish } from "./scene.config";

/** Cosine/sine of 45° — the two bars are mirrored about the vertical axis. */
const DIAGONAL = Math.SQRT1_2;

/** Edge sharpness of the baked form normal (see the rounded-box blend below). Higher →
 *  flatter faces with tighter edges; lower → rounder, softer form shading. */
const SHARP = 3;

/**
 * Builds the volumetric glyph — an "X" filled with thousands of small spheres.
 *
 * Points are rejection-sampled inside the union of two crossing bars, filling
 * the letterform's **interior** as well as its surface so the cloud reads as a
 * volume. A small fraction is kept just outside, eroding the silhouette into
 * loose debris. The whole glyph is then turned about the vertical Y axis by
 * `config.rotation`, so it reads in 3D rather than face-on. Shading, the emissive
 * channel, and the twisting curl-flow scatter are handled by [[particle-cloud]].
 */
export const createGlyphParticles = (
  config: GlyphConfig,
  baseColor: string,
  finish: MaterialFinish,
): ParticleCloud => {
  const {
    count,
    barLength,
    barWidth,
    barDepth,
    particleSize,
    sizeJitter,
    edgeNoise,
    spill,
    spillChance,
    rotation,
    center,
    lightDirection,
    bigFraction,
    bigScale,
    seed,
  } = config;

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

    // Rotate the sample into each bar's local frame (±45°).
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

    // Form normal — a *smooth* rounded-box normal for the chosen bar, so the baked shade
    // grades continuously across the form instead of snapping to a handful of flat faces
    // (which read as hard cel bands). The three box faces (width ±, length ±, depth ±)
    // each contribute their outward normal weighted by how close the point is to that face
    // (`frac^SHARP`); summing + normalising rounds the edges. `wDir`/`lDir` are the bar's
    // width/length axes in (x,y): bar A is at +45°, B at −45°.
    const useA = inA || (!inB && Math.abs(aY) <= Math.abs(bY));
    const cw = useA ? aX : bX;
    const cl = useA ? aY : bY;
    const fw = Math.abs(cw) / halfWidth;
    const fl = Math.abs(cl) / halfLength;
    const fd = Math.abs(z) / halfDepth;
    // Outward face normals (unit) in (x, y): width face along ±(cos45, ±sin45), length
    // face along the perpendicular; sign picks the near face.
    const sw = Math.sign(cw) || 1;
    const sl = Math.sign(cl) || 1;
    const sd = Math.sign(z) || 1;
    const wnx = sw * DIAGONAL;
    const wny = sw * (useA ? DIAGONAL : -DIAGONAL);
    const lnx = sl * (useA ? -DIAGONAL : DIAGONAL);
    const lny = sl * DIAGONAL;
    // Edge sharpness: higher keeps flatter faces, lower rounds them more.
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

    // Turn about the Y axis (x/z rotate, y stays). No per-point flow — the
    // scatter uses the shared curl field so it reads as organic twisting strands.
    points.push({
      x: jx * cos + jz * sin,
      y: jy,
      z: -jx * sin + jz * cos,
    });
    // Y-rotate the normal the same way (normals aren't translated).
    normalList.push(snx * cos + snz * sin, sny, -snx * sin + snz * cos);
  }

  // No `scatterDest`/`flowOverride`: the glyph no longer forms intermediate corkscrew ribbons
  // — it reassembles **directly** into the world-space flight corridor streamers (driven by
  // `updateCloud`'s flight branch). See [[particle-cloud]] / the flight section of the docs.
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
