import { buildParticleCloud } from "./particle-cloud";
import type { LocalPoint, ParticleCloud } from "./particle-cloud";
import { createProceduralXGlyph } from "./glyph-x";
import type { GlyphConfig, MaterialFinish } from "./scene.config";

const U16_MAX = 65535;

interface PointsManifest {
  objects: {
    file: string;
    format: string;
    count: number;
    decode_offset: [number, number, number];
    decode_scale: [number, number, number];
  }[];
}

/** Evenly pick `want` indices from `source` — keeps the baked silhouette, no groove-filling jitter. */
const subsampleCount = (source: number, want: number): number =>
  Math.max(1, Math.min(source, Math.floor(want)));

/**
 * Hero glyph: a coffee-bean point cloud (`public/assets/bean/`) in the same
 * instanced-sphere language as the hand. Falls back to the procedural X if
 * the asset is missing so the lattice is never empty.
 *
 * Async because it fetches the baked binary. No `scatterDest` — the glyph
 * still flies into the corridor streamers via `updateCloud`.
 */
export const createGlyphParticles = async (
  config: GlyphConfig,
  baseColor: string,
  finish: MaterialFinish,
): Promise<ParticleCloud> => {
  try {
    return await createBeanGlyph(config, baseColor, finish);
  } catch {
    return createProceduralXGlyph(config, baseColor, finish);
  }
};

const createBeanGlyph = async (
  config: GlyphConfig,
  baseColor: string,
  finish: MaterialFinish,
): Promise<ParticleCloud> => {
  const { count, scale, particleSize, sizeJitter, rotation, center, lightDirection, bigFraction, bigScale, seed } =
    config;

  const base = "/assets/bean";
  const [manifest, binary] = await Promise.all([
    fetch(`${base}/points.manifest.json`).then((r) => {
      if (!r.ok) throw new Error("bean manifest missing");
      return r.json() as Promise<PointsManifest>;
    }),
    fetch(`${base}/points.bin`).then((r) => {
      if (!r.ok) throw new Error("bean points missing");
      return r.arrayBuffer();
    }),
  ]);

  const object = manifest.objects[0];
  if (!object || object.format !== "bin_u16") throw new Error("bean cloud format");
  const [ox, oy, oz] = object.decode_offset;
  const [sx, sy, sz] = object.decode_scale;
  const raw = new Uint16Array(binary);
  const source = Math.min(object.count, Math.floor(raw.length / 3));
  const take = subsampleCount(source, count);

  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const points: LocalPoint[] = new Array(take);

  for (let i = 0; i < take; i += 1) {
    const src = take === source ? i : Math.floor((i * source) / take);
    const px = (ox + (raw[src * 3] / U16_MAX) * sx) * scale;
    const py = (oy + (raw[src * 3 + 1] / U16_MAX) * sy) * scale;
    const pz = (oz + (raw[src * 3 + 2] / U16_MAX) * sz) * scale;
    points[i] = {
      x: px * cos + pz * sin,
      y: py,
      z: -px * sin + pz * cos,
    };
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
    extent: scale,
    seed: seed + 1,
  });
};
