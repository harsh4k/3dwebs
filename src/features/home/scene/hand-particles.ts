// 📖 Docs: obsidian/frontend/components/common.md

import { buildParticleCloud } from "./particle-cloud";
import type { LocalPoint, ParticleCloud } from "./particle-cloud";
import { createRandom } from "./random";
import type { HandConfig, MaterialFinish, WaveConfig } from "./scene.config";

/**
 * A **wave-curtain destination** per hand particle: a **clean vertical grid** (across
 * X, up Y) the hand's particles settle onto. Returned as the cloud's `scatterDest`
 * (local to the hand centre), so `updateCloud`'s wave branch can route each particle
 * from its hand rest, through the tornado, onto its exact grid cell. One particle per
 * cell in order (no jitter) — the honest grid the reference asks for. The scramble that
 * makes the transition look like dispersal comes from the tornado, not the layout.
 */
const buildWaveDestinations = (
  count: number,
  wave: WaveConfig,
  handCenter: [number, number, number],
): Float32Array => {
  const dest = new Float32Array(count * 3);
  const { columns, rows, spacing, center, tilt, yaw } = wave;
  const halfCols = (columns - 1) / 2;
  const halfRows = (rows - 1) / 2;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  for (let i = 0; i < count; i += 1) {
    const gx = i % columns;
    const gy = Math.floor(i / columns);
    const ox = (gx - halfCols) * spacing; // across the plane
    const dy = (gy - halfRows) * spacing;
    // Tilt the plane back: as it goes up (dy) it rises less and recedes in depth.
    const oyy = dy * cosT;
    const ozT = -dy * sinT;
    // Yaw about vertical: swing the across-axis into depth so the plane recedes
    // diagonally (one side comes near, the other sinks into the fog).
    const wx = center[0] + ox * cosY + ozT * sinY;
    const wy = center[1] + oyy;
    const wz = center[2] - ox * sinY + ozT * cosY;
    // Local to the hand centre — `scatterTarget` is measured from the local point.
    dest[i * 3] = wx - handCenter[0];
    dest[i * 3 + 1] = wy - handCenter[1];
    dest[i * 3 + 2] = wz - handCenter[2];
  }
  return dest;
};

/** Manifest shipped alongside the quantised point cloud. */
interface PointsManifest {
  objects: {
    file: string;
    format: string;
    count: number;
    decode_offset: [number, number, number];
    decode_scale: [number, number, number];
  }[];
}

const U16_MAX = 65535;

/**
 * Loads the hand as a **point cloud baked from a real model** (`public/assets/hand/`)
 * rather than the earlier procedural SDF. The binary is `bin_u16`: three uint16s
 * per point, each decoded as `offset + (u16 / 65535) · scale` (params in the
 * manifest), giving normalised model coordinates (Y up). Points are scaled to the
 * scene and handed to [[particle-cloud]], so the hand shares the glyph's exact
 * particle style.
 *
 * Async because it fetches the asset; the caller adds the mesh once it resolves.
 */
export const createHandParticles = async (
  config: HandConfig,
  wave: WaveConfig,
  baseColor: string,
  finish: MaterialFinish,
): Promise<ParticleCloud> => {
  const {
    scale,
    particleSize,
    sizeJitter,
    center,
    lightDirection,
    bigFraction,
    bigScale,
    rotation,
    density,
    seed,
  } = config;

  const base = "/assets/hand";
  const [manifest, binary] = await Promise.all([
    fetch(`${base}/points.manifest.json`).then((r) => r.json() as Promise<PointsManifest>),
    fetch(`${base}/points.bin`).then((r) => r.arrayBuffer()),
  ]);

  const object = manifest.objects[0];
  const [ox, oy, oz] = object.decode_offset;
  const [sx, sy, sz] = object.decode_scale;
  const raw = new Uint16Array(binary);
  const source = Math.min(object.count, Math.floor(raw.length / 3));

  // Turn the whole hand about Y (x/z rotate, y stays).
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  // Upsample: each loaded point spawns `density` particles — the first exact, the rest jittered
  // a little around it — so the hand reads denser (more balls) than the baked cloud's count.
  const dup = Math.max(1, Math.floor(density));
  const rand = createRandom(seed + 5);
  // Spread the copies a bit wider at high density so they fill gaps rather than clump.
  const jitter = particleSize * (1.5 + dup * 0.3);

  const points: LocalPoint[] = new Array(source * dup);
  let w = 0;
  for (let i = 0; i < source; i += 1) {
    const px = (ox + (raw[i * 3] / U16_MAX) * sx) * scale;
    const py = (oy + (raw[i * 3 + 1] / U16_MAX) * sy) * scale;
    const pz = (oz + (raw[i * 3 + 2] / U16_MAX) * sz) * scale;
    for (let d = 0; d < dup; d += 1) {
      const jx = d === 0 ? 0 : (rand() - 0.5) * jitter;
      const jy = d === 0 ? 0 : (rand() - 0.5) * jitter;
      const jz = d === 0 ? 0 : (rand() - 0.5) * jitter;
      const x = px + jx;
      const z = pz + jz;
      points[w] = {
        x: x * cos + z * sin,
        y: py + jy,
        z: -x * sin + z * cos,
      };
      w += 1;
    }
  }
  const count = points.length;

  return buildParticleCloud(points, {
    particleSize,
    sizeJitter,
    bigFraction,
    bigScale,
    color: baseColor,
    finish,
    center,
    lightDirection,
    // The model is normalised to a height of 2 (Y in [-1, 1]); half-height × scale.
    extent: scale,
    // The hand's own particles crumble through a tornado onto these wave-curtain grid
    // destinations in the final phase (see `updateCloud`'s wave branch).
    scatterDest: buildWaveDestinations(count, wave, center),
    seed: seed + 1,
  });
};
