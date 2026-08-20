// 📖 Docs: obsidian/frontend/components/common.md

import {
  BufferAttribute,
  Color,
  CylinderGeometry,
  LineBasicMaterial,
  LineSegments,
  WireframeGeometry,
} from "three";

import { createRandom } from "./random";
import type { FieldConfig } from "./scene.config";

export interface ContainmentField {
  lines: LineSegments<WireframeGeometry, LineBasicMaterial>;
  /** Build state, 0 → 1: segments **draw themselves in** — staggered (bottom-biased, randomised
   *  per segment), each line growing from one end with an accent-tinted pulse as it lands.
   *  Drive it back toward 0 to dissolve the same way. Default 1 = fully built. */
  uBuild: { value: number };
  /** Scene clock in seconds — drives the **pink impulses**: a rising accent ring sweeping the
   *  cylinder plus sparse per-segment flashes, so a built lattice is never a static drawing.
   *  (The infinite `rotation.y` spin is driven by the caller off the same clock.) */
  uTime: { value: number };
}

/** Deterministic per-segment stagger (mulberry32, fixed seed) so the weave is identical every run. */
const BUILD_SEED = 20260728;

/**
 * Builds the triangulated containment field around a figure — a faint
 * holographic net floating in the haze.
 *
 * `WireframeGeometry` draws the edges of every *triangle* in the cylinder, which
 * is what produces the criss-crossed mesh look rather than a plain quad grid.
 * It writes no depth, so the net layers over the particles instead of clipping
 * them.
 *
 * The net is **brightest at its waist and fades to nothing at both ends** — with
 * the ground gone there is nothing for it to pool light on, so an unfaded base
 * would read as a hard rim floating in empty space; fading both ends leaves it a
 * weightless hologram. There is no per-vertex alpha on `LineBasicMaterial`, so a
 * shader patch multiplies the material opacity by a `sin(π·t)` falloff derived
 * from each vertex's local Y. `config.opacity` therefore sets the strength at
 * the *middle*, not the average.
 *
 * On top of that the patch carries the **build effect** (`uBuild`): every segment
 * gets a threshold from its height + a per-segment random, and as `uBuild` passes
 * it the line *draws* from its first vertex to its second (`aEnd` interpolates
 * 0 → 1 along the segment, clipped against the segment's own draw progress),
 * flashing toward the shared accent colour mid-draw. Different lines land at
 * different times — the cage weaves itself together rather than fading in as one
 * sheet, and running `uBuild` backwards unweaves it (the scroll-out dissolve that
 * replaced the old `scale.y` collapse, which read as a skew).
 */
export const createContainmentField = (
  config: FieldConfig,
  color: string,
  accent: string,
): ContainmentField => {
  const cylinder = new CylinderGeometry(
    config.radiusTop,
    config.radiusBottom,
    config.height,
    config.radialSegments,
    config.heightSegments,
    true,
  );

  const geometry = new WireframeGeometry(cylinder);
  cylinder.dispose();

  // Wireframe output is non-indexed vertex *pairs*: both vertices of a segment share one random
  // seed (so the whole line appears together) and carry their end param (0 = draw origin, 1 = tip).
  const vertexCount = geometry.attributes.position.count;
  const seeds = new Float32Array(vertexCount);
  const ends = new Float32Array(vertexCount);
  const random = createRandom(BUILD_SEED);
  for (let i = 0; i < vertexCount; i += 2) {
    const r = random();
    seeds[i] = r;
    seeds[i + 1] = r;
    ends[i] = 0;
    ends[i + 1] = 1;
  }
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  geometry.setAttribute("aEnd", new BufferAttribute(ends, 1));

  const uBuild = { value: 1 };
  const uTime = { value: 0 };

  const material = new LineBasicMaterial({
    color,
    transparent: true,
    opacity: config.opacity,
    depthWrite: false,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uFieldHeight = { value: config.height };
    shader.uniforms.uBuild = uBuild;
    shader.uniforms.uTime = uTime;
    shader.uniforms.uAccent = { value: new Color(accent) };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying float vFieldFade;\nvarying float vLineT;\nvarying float vBuildD;\nvarying float vFieldT;\nvarying float vSeed;\nuniform float uFieldHeight;\nuniform float uBuild;\nattribute float aSeed;\nattribute float aEnd;",
      )
      .replace(
        "#include <begin_vertex>",
        [
          "#include <begin_vertex>",
          "\tfloat fieldT = position.y / uFieldHeight + 0.5;",
          "\tvFieldFade = pow(clamp(sin(fieldT * 3.14159265), 0.0, 1.0), 1.5);",
          // Per-segment build threshold: biased bottom-up by height, scattered by the seed, so
          // neighbouring lines land at visibly different moments ("different lines").
          "\tfloat bThr = 0.8 * (0.45 * fieldT + 0.55 * aSeed);",
          "\tvBuildD = clamp((uBuild - bThr) / 0.2, 0.0, 1.0);",
          "\tvLineT = aEnd;",
          "\tvFieldT = fieldT;",
          "\tvSeed = aSeed;",
        ].join("\n"),
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying float vFieldFade;\nvarying float vLineT;\nvarying float vBuildD;\nvarying float vFieldT;\nvarying float vSeed;\nuniform vec3 uAccent;\nuniform float uTime;",
      )
      .replace(
        "vec4 diffuseColor = vec4( diffuse, opacity );",
        [
          // Draw the segment from its origin toward its tip as its own progress advances; ×1.25
          // overshoot so the tip is fully solid at vBuildD = 1 (no permanently-faded ends).
          "float bDraw = vBuildD * 1.25;",
          "float bA = (1.0 - smoothstep(bDraw - 0.25, bDraw, vLineT)) * smoothstep(0.0, 0.06, vBuildD);",
          // Mid-draw pulse: the landing line flashes toward the accent and slightly brighter,
          // settling to the plain white hairline once vBuildD reaches 1.
          "float bPulse = vBuildD * (1.0 - vBuildD) * 4.0;",
          // **Pink impulses** on the built lattice: a narrow accent ring rising through the
          // cylinder (`vFieldT` sweep) plus sparse per-segment random flashes — high exponents
          // keep both to brief glints, so the cage sparkles with energy without ever reading as
          // a colour change.
          "float impRing = pow(0.5 + 0.5 * sin(vFieldT * 4.0 - uTime * 0.9), 24.0);",
          "float impFlash = pow(0.5 + 0.5 * sin(uTime * 0.8 + vSeed * 97.0), 36.0);",
          "float imp = min(1.0, impRing + impFlash) * vBuildD;",
          "float accentMix = max(bPulse * 0.85, imp * 0.9);",
          "vec4 diffuseColor = vec4( mix(diffuse, uAccent, accentMix), opacity * vFieldFade * bA * (1.0 + bPulse * 1.5 + imp * 2.0) );",
        ].join("\n"),
      );
  };

  const lines = new LineSegments(geometry, material);
  lines.position.y = config.centerY;
  return { lines, uBuild, uTime };
};
