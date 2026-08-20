// 📖 Docs: obsidian/frontend/components/common.md

import { buildParticleCloud } from "./particle-cloud";
import type { LocalPoint, ParticleCloud } from "./particle-cloud";
import { createRandom } from "./random";
import type { MaterialFinish, TreeConfig } from "./scene.config";

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
 * Loads the tree as a **point cloud baked from a real model** (`public/assets/tree/`),
 * the same `bin_u16` format as the hand (three uint16s per point, decoded as
 * `offset + (u16 / 65535) · scale`). It's the final tableau: it stands inside its own lattice
 * below the wave and **reveals bottom-up through an angled mask** (the scan-in reveal in
 * [[particle-cloud]], slanted via `scanTilt`). Unlike the hand it has no wave destinations —
 * it doesn't morph, it just materialises — so `scatterDest` is left unset.
 *
 * Async because it fetches the asset; the caller adds the mesh once it resolves.
 */
export const createTreeParticles = async (
  config: TreeConfig,
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

  const base = "/assets/tree";
  const [manifest, binary] = await Promise.all([
    fetch(`${base}/points.manifest.json`).then((r) => r.json() as Promise<PointsManifest>),
    fetch(`${base}/points.bin`).then((r) => r.arrayBuffer()),
  ]);

  const object = manifest.objects[0];
  const [ox, oy, oz] = object.decode_offset;
  const [sx, sy, sz] = object.decode_scale;
  const raw = new Uint16Array(binary);
  const source = Math.min(object.count, Math.floor(raw.length / 3));

  // Turn the whole tree about Y (x/z rotate, y stays).
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  // Upsample: each loaded point spawns `density` particles — the first exact, the rest jittered
  // a little around it — so the tree reads denser than the baked cloud's count.
  const dup = Math.max(1, Math.floor(density));
  const rand = createRandom(seed + 5);
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
    // The tree is baked once and never re-`updateCloud`ed (it's ~150k — a full pass is a ~90 ms JS
    // block), so its hover easing has to live in a texture rather than in the instance matrices.
    pointerRelax: true,
    seed: seed + 1,
  });
};
