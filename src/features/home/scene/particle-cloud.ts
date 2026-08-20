// 📖 Docs: obsidian/frontend/components/common.md

import {
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  Vector3,
} from "three";
import type { Texture, Vector3Tuple } from "three";

import { createRelaxUv } from "./pointer-relax";
import { curl } from "./curl-noise";
import { createRandom } from "./random";
import type {
  IdleConfig,
  MaterialFinish,
  PointerConfig,
  ScatterConfig,
  WaveConfig,
} from "./scene.config";

/** A point sampled inside a shape, in the cloud's local space (pre-`center`). */
export interface LocalPoint {
  x: number;
  y: number;
  z: number;
  /** Optional scatter direction (unnormalised). When set it steers the flow — the
   *  glyph uses it to send each particle along one of the X's four arms; without
   *  it the flow is pure curl noise (the hand). */
  fx?: number;
  fy?: number;
  fz?: number;
}

export interface CloudOptions {
  particleSize: number;
  sizeJitter: number;
  /** Fraction of beads that are oversized "hero" bloomers — `bigScale`× size + white glow. */
  bigFraction: number;
  /** Size multiplier for those hero beads. */
  bigScale: number;
  color: string;
  finish: MaterialFinish;
  /** World position of the cloud's origin. */
  center: Vector3Tuple;
  /** Half-extent used to normalise the per-particle `radial` value. */
  extent: number;
  /** Direction the key light comes from — the baked directional shade lights the whole
   *  form against it (front face bright, sides in shadow). */
  lightDirection: Vector3Tuple;
  /** Baked directional shade: `floor` is the shadow-side level, `dir` the extra brightness
   *  a fully light-facing particle gets. `floor + dir` should be ≤ ~1. */
  shade?: { floor: number; dir: number };
  /** Optional per-particle **form** normal (xyz, in the cloud's local/pre-`center` space).
   *  When set, the baked shade lights *these* (so the cloud reads as one solid form); else
   *  a fallback normal of `normalize(point)` is used. */
  normals?: Float32Array;
  /** Optional per-particle scatter destination in local space (xyz per instance).
   *  When set, the scatter morphs particles onto these points (the glyph's spiral
   *  strands) instead of using the curl flow. */
  scatterDest?: Float32Array;
  /** Optional per-particle flow direction (xyz per instance) — replaces curl.
   *  The glyph passes ribbon tangents so held particles flow along their ribbon. */
  flowOverride?: Float32Array;
  /** Take the cursor hover from a **simulated** per-instance texture (`pointer-relax.ts`) instead of
   *  evaluating it analytically in the shader. For clouds that are never re-`updateCloud`ed per
   *  frame and so have nowhere else to keep the easing state — i.e. the tree. */
  pointerRelax?: boolean;
  seed: number;
}

export interface ParticleCloud {
  mesh: InstancedMesh<SphereGeometry, MeshStandardMaterial>;
  /** Rest position of every particle in world space, xyz per instance. */
  basePositions: Float32Array;
  /** Baked rest colour (the form's directional shade), rgb per instance. */
  baseColors: Float32Array;
  /** Curl-flow scatter vector (direction × per-particle speed), xyz per instance. */
  flow: Float32Array;
  /** Rest scale of every particle (uniform), for the scatter fade-out. */
  baseScale: Float32Array;
  /** Per-particle bloom weight in [0, 1] — the biggest particles glow so they (and the
   *  cursor-touched ones) are the only things the bloom pass catches. */
  bloomMask: Float32Array;
  /** Per-particle scatter delay in [0, 1], for staggered strands. */
  stagger: Float32Array;
  /** Per-particle fixed offset on the tube cross-section disc (2 per instance: a, b), so each
   *  flight ribbon reads as a solid round tube. Independent of position (no sheet artefacts). */
  tubeOffset: Float32Array;
  /** Distance of each particle from the cloud centre, normalised to [0, 1]. */
  radial: Float32Array;
  glowAttribute: InstancedBufferAttribute;
  count: number;
  /** World-space Y bounds of the rest cloud — drives the bottom-up scan-in reveal. */
  minY: number;
  maxY: number;
  center: Vector3Tuple;
  /** Per-particle scatter displacement (destination − rest), or null for curl flow. */
  scatterTarget: Float32Array | null;
  /** **GPU cursor-repulsion** uniforms — the vertex shader pushes each instance out of a sphere of
   *  radius `uPointerR` around the world point `uPointer`, by `uPointerS`. Used for clouds too heavy
   *  to re-run `updateCloud` per frame (the ~150k tree): the cloud stays baked, the push is applied
   *  at render time. `uPointerS = 0` (default) = no push. */
  pointer: PointerUniforms;
  /** **GPU bottom-up scan-in** — `uScan` 0 → 1 raises a reveal line through the cloud's world-Y
   *  range, growing each bead in as it passes, the same shape as `updateCloud`'s `revealScale`.
   *  `uScan = 1` (default) = fully materialised. */
  scan: ScanUniforms;
  /** **Simulated** cursor hover (`options.pointerRelax`), or `null` when the cloud uses the
   *  analytic shader push / the CPU path. Hand the `uRelaxMap` uniform to `createPointerRelax`. */
  relax: RelaxUniforms | null;
  /** **GPU idle life** — a tinted band flowing through the cloud plus a gentle whole-form sway,
   *  computed in the vertex shader off `uTime`. This is what keeps the **baked** tree breathing
   *  (it gets no per-frame `updateCloud`), and it layers a colour drift over the CPU clouds for
   *  free. `uFlowTint` black + `uFlowAmp` 0 (the defaults) make it a no-op. */
  life: LifeUniforms;
}

interface PointerUniforms {
  uPointer: { value: Vector3 };
  uPointerR: { value: number };
  uPointerS: { value: number };
  /** Emissive tint the touched beads take, pre-multiplied by `pointerConfig.glow` — the GPU
   *  counterpart of `updateCloud`'s `pTint*`, so a hovered bead lights the same colour on both paths. */
  uPointerTint: { value: Color };
}

interface ScanUniforms {
  uScan: { value: number };
  uScanMinY: { value: number };
  uScanMaxY: { value: number };
  /** Emissive colour of the band trailing the reveal line, pre-multiplied by the cloud's
   *  `scanGlow` — the GPU counterpart of `updateCloud`'s `scanGlow*` term, so the line blooms the
   *  same pink here as on the hand. */
  uScanTint: { value: Color };
}

interface RelaxUniforms {
  /** Per-instance eased cursor state — `xyz` world displacement, `w` heat. Written by
   *  `createPointerRelax`; `null` until its first step. */
  uRelaxMap: { value: Texture | null };
}

interface LifeUniforms {
  /** Scene clock in seconds — the only per-frame write the idle life needs. */
  uTime: { value: number };
  /** Emissive colour of the flowing band, pre-multiplied by its strength. Keep the strength well
   *  below the bloom threshold so the band *tints* the beads rather than glowing. */
  uFlowTint: { value: Color };
  /** World-unit amplitude of the whole-form sway. */
  uFlowAmp: { value: number };
}

/**
 * Emissive glow patch for the **lit** particle material. The per-instance `aGlow` attribute is
 * added as pure **emissive** (via `totalEmissiveRadiance`, *after* lighting) so the glowing
 * beads read as bright light sources regardless of how they're lit — the oversized "hero"
 * beads (always-on white glow) and the touched / scattering particles. That bright emissive is
 * also what the bloom pass keys off. `MeshStandardMaterial` has no per-instance emissive, so
 * this is injected via `onBeforeCompile`.
 */
const patchParticleShader = (
  material: MeshStandardMaterial,
  pointer: PointerUniforms,
  scan: ScanUniforms,
  relax: RelaxUniforms | null,
  life: LifeUniforms,
) => {
  // **The two variants must not share a program.** three.js keys its program cache on
  // `material.customProgramCacheKey()`, whose default is `onBeforeCompile.toString()` — and that is
  // the *same source text* for every cloud, because they all share this one closure. So the first
  // particle material to compile (the glyph, which is on screen first) wins, and the tree silently
  // draws with the glyph's program: no `aRelaxUv`, no `uRelaxMap`, a hover that simulates perfectly
  // and never moves a bead. Nothing errors — the attribute just isn't there. The scan still works,
  // which is what makes it look like a hover-specific bug.
  material.customProgramCacheKey = () => (relax ? "particle-cloud-relax" : "particle-cloud");
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPointer = pointer.uPointer;
    shader.uniforms.uPointerR = pointer.uPointerR;
    shader.uniforms.uPointerS = pointer.uPointerS;
    shader.uniforms.uPointerTint = pointer.uPointerTint;
    shader.uniforms.uScan = scan.uScan;
    shader.uniforms.uScanMinY = scan.uScanMinY;
    shader.uniforms.uScanMaxY = scan.uScanMaxY;
    shader.uniforms.uScanTint = scan.uScanTint;
    if (relax) shader.uniforms.uRelaxMap = relax.uRelaxMap;
    shader.uniforms.uTime = life.uTime;
    shader.uniforms.uFlowTint = life.uFlowTint;
    shader.uniforms.uFlowAmp = life.uFlowAmp;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute vec3 aGlow;\nvarying vec3 vGlow;\nuniform vec3 uPointer;\nuniform float uPointerR;\nuniform float uPointerS;\nuniform vec3 uPointerTint;\nuniform float uScan;\nuniform float uScanMinY;\nuniform float uScanMaxY;\nuniform vec3 uScanTint;\nuniform float uTime;\nuniform vec3 uFlowTint;\nuniform float uFlowAmp;" +
          (relax ? "\nattribute vec2 aRelaxUv;\nuniform sampler2D uRelaxMap;" : ""),
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n\tvGlow = aGlow;",
      )
      // Replace the instanced position transform so the GPU can do two things the CPU path does for
      // the lighter clouds — a **cursor repulsion** and a **bottom-up scan-in** — without re-running
      // `updateCloud` over a 150k cloud every frame.
      //
      // The repulsion is the **hero glyph's law, verbatim**: 3D world-space distance from the
      // instance's own centre to the cursor, `influence = 1 − d/radius`, displacement
      // `influence² · strength` directed radially away. (An earlier version pushed in the *view
      // plane* instead — a screen-space disc sweeps every particle at every depth behind the cursor,
      // which on a tall cloud like the tree gathered the whole column into a smooth ball.)
      //
      // The scan grows each bead in as a line rises through the cloud (`uScan` 0 → 1 over its world-Y
      // range) by scaling the sphere in local space, so the instance keeps its position and only its
      // size animates — the same shape as `updateCloud`'s `revealScale`.
      //
      // `uPointerS = 0` and `uScan = 1` (the defaults) make both terms no-ops, so the shared patch is
      // free for the CPU-driven clouds.
      .replace(
        "#include <project_vertex>",
        [
          "vec4 instCenter = vec4( 0.0, 0.0, 0.0, 1.0 );",
          "#ifdef USE_INSTANCING",
          "  instCenter = instanceMatrix * instCenter;",
          "#endif",
          "vec3 wCenter = ( modelMatrix * instCenter ).xyz;",
          // Bottom-up reveal: a crisp band, matching the hand's `scanBand`.
          "float sH = clamp( ( wCenter.y - uScanMinY ) / max( 1e-4, uScanMaxY - uScanMinY ), 0.0, 1.0 );",
          // The line runs to `1 + band`, not to 1 — otherwise `uScan = 1` ("fully materialised")
          // leaves the topmost beads exactly on the line and scales them to zero, shaving the crown
          // off every cloud including the ones that never scan.
          "float sLine = uScan * 1.05;",
          "float sDd = sLine - sH;",
          "float sRev = clamp( sDd / 0.05, 0.0, 1.0 );",
          // The **pink bloom band** trailing the line, matching `updateCloud`'s `scanGlowWidth`
          // (0.14) and its shape. Gated on the scan actually running: at rest `sLine` is 1.05, so
          // the topmost beads sit 0.05 behind the line and the crown would glow permanently.
          "float sActive = 1.0 - step( 0.9999, uScan );",
          "float sGlow = sActive * max( 0.0, 1.0 - sDd / 0.14 ) * step( 0.0, sDd );",
          "vec3 scanned = transformed * sRev;",
          "vec4 mvPosition = vec4( scanned, 1.0 );",
          "#ifdef USE_INSTANCING",
          "  mvPosition = instanceMatrix * mvPosition;",
          "#endif",
          "vec4 wPos = modelMatrix * mvPosition;",
          // **GPU idle life.** A gentle whole-form sway plus a tinted band drifting up through the
          // cloud — both off `uTime`, so even a cloud that never sees `updateCloud` (the baked
          // tree) keeps breathing. `uFlowAmp = 0` / `uFlowTint = black` (the defaults) are no-ops.
          "float lifePhase = wCenter.x * 0.23 + wCenter.y * 0.31 + wCenter.z * 0.17;",
          "wPos.xyz += uFlowAmp * vec3( sin( uTime * 0.6 + lifePhase ), sin( uTime * 0.5 + lifePhase * 1.7 ), cos( uTime * 0.7 + lifePhase * 1.3 ) );",
          "float lifeBand = 0.5 + 0.5 * sin( wCenter.y * 0.24 + wCenter.x * 0.1 - uTime * 0.5 );",
          "vGlow += uFlowTint * ( lifeBand * lifeBand * lifeBand );",
          // **Cursor repulsion.** Both forms measure from the instance centre, so every vertex of a
          // bead moves together and the bead stays a sphere.
          ...(relax
            ? [
                // Simulated: the displacement and the heat were eased over past frames by
                // `pointer-relax.ts`, so beads flow out and ooze back exactly as `updateCloud`'s do.
                "vec4 rel = texture2D( uRelaxMap, aRelaxUv );",
                "wPos.xyz += rel.xyz;",
                "vGlow = max( vGlow, uPointerTint * rel.w );",
              ]
            : [
                // Analytic: no memory, so this is only correct for clouds whose *positions* are
                // simulated on the CPU. `uPointerS = 0` (the default) makes it a no-op.
                "vec3 toC = wCenter - uPointer;",
                "float pd = length( toC );",
                "float pInf = max( 0.0, 1.0 - pd / uPointerR );",
                "wPos.xyz += normalize( toC + vec3( 1e-4 ) ) * ( pInf * pInf * uPointerS );",
                "vGlow = max( vGlow, uPointerTint * ( pInf * pInf ) * step( 0.0001, uPointerS ) );",
              ]),
          "vGlow = max( vGlow, uScanTint * sGlow );",
          "mvPosition = viewMatrix * wPos;",
          "gl_Position = projectionMatrix * mvPosition;",
        ].join("\n"),
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vGlow;")
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\n\ttotalEmissiveRadiance += vGlow;",
      );
  };
};

/**
 * Builds an instanced sphere cloud from points sampled inside a shape.
 *
 * Shared by the glyph and the hand: both fill a solid's interior with particles,
 * bake a directional + vertical shading gradient into each instance colour (the
 * lights alone can't shade a cloud of identical spheres), and carry a curl-flow
 * field so they can scatter into strands. See [[curl-noise]].
 */
export const buildParticleCloud = (
  points: LocalPoint[],
  options: CloudOptions,
): ParticleCloud => {
  const { particleSize, sizeJitter, bigFraction, bigScale, color, finish, center, extent, lightDirection, seed } =
    options;
  const scatterDest = options.scatterDest ?? null;
  const flowOverride = options.flowOverride ?? null;
  const normals = options.normals ?? null;
  // Only a faint directional base — real self-shadowing (see particle-scene) now carries the
  // volume, so the albedo is kept nearly flat rather than painting one side of the form dark.
  const shade = options.shade ?? { floor: 0.82, dir: 0.18 };

  // Direction *toward* the light, normalised — the form's normals are lit against it.
  const lightLength = Math.hypot(...lightDirection) || 1;
  const lightX = lightDirection[0] / lightLength;
  const lightY = lightDirection[1] / lightLength;
  const lightZ = lightDirection[2] / lightLength;

  const random = createRandom(seed);
  const total = points.length;
  // Displacement from each particle's rest point to its strand destination.
  const scatterTarget = scatterDest ? new Float32Array(total * 3) : null;

  // 8×6 segments (96 tris), down from 16×12 (384). The beads render at a few px — at that size the
  // silhouettes are indistinguishable, and the cut is ~4× off the frame's dominant vertex load
  // (every cloud pass *and* the glyph's shadow-map pass run these instances).
  const geometry = new SphereGeometry(0.5, 8, 6);
  const glowAttribute = new InstancedBufferAttribute(new Float32Array(total * 3), 3);
  geometry.setAttribute("aGlow", glowAttribute);
  // Paired with the shader variant below — the attribute and the `attribute vec2 aRelaxUv;`
  // declaration are decided by the same flag, in the same place, so they can never disagree.
  if (options.pointerRelax) geometry.setAttribute("aRelaxUv", createRelaxUv(total));

  // Lit, chalk-matte spheres: the directional key gives every sphere a soft diffuse
  // gradient (realistic shading), and the baked form shade in `instanceColor` darkens the
  // form's shadow side so the cloud reads as one solid — not a field of identical beads.
  const material = new MeshStandardMaterial({
    color,
    roughness: finish.roughness,
    metalness: finish.metalness,
  });
  material.envMapIntensity = finish.envMapIntensity;
  // GPU cursor-push uniforms — shared into the shader; `uPointerS = 0` leaves it a no-op until a
  // scene drives it (only the tree does — it's too heavy to re-run `updateCloud` per frame).
  const pointer: PointerUniforms = {
    uPointer: { value: new Vector3(0, -1e4, 0) },
    uPointerR: { value: 6 },
    uPointerS: { value: 0 },
    uPointerTint: { value: new Color(0, 0, 0) },
  };
  // GPU scan-in — `uScan = 1` is "fully materialised", so this is a no-op until a scene drives it.
  // The Y bounds are filled in below, once the rest positions have been measured.
  const scan: ScanUniforms = {
    uScan: { value: 1 },
    uScanMinY: { value: 0 },
    uScanMaxY: { value: 1 },
    uScanTint: { value: new Color(0, 0, 0) },
  };
  // Filled in by `createPointerRelax` once the scene wires one up; until then the map is null, the
  // shader samples three.js's empty texture (all zeros) and the cloud renders undisplaced.
  const relax: RelaxUniforms | null = options.pointerRelax ? { uRelaxMap: { value: null } } : null;
  // Idle life defaults to off; the scene dials each cloud's flow/sway in from `sceneConfig.life`.
  const life: LifeUniforms = {
    uTime: { value: 0 },
    uFlowTint: { value: new Color(0, 0, 0) },
    uFlowAmp: { value: 0 },
  };
  patchParticleShader(material, pointer, scan, relax, life);

  const mesh = new InstancedMesh(geometry, material, total);
  // Self-shadowing is what gives the cloud its **volume from real light**: the front/top
  // particles cast shadows onto the ones behind, below, and in the crossing's interior, so
  // those go dark because light physically doesn't reach them — not because they're tinted.
  // (Soft PCF + a normal bias keep it from speckling; see particle-scene lighting.)
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  // We reposition instances far from the mesh's origin every frame (the scatter).
  // The InstancedMesh's bounding sphere isn't recomputed for that, so frustum
  // culling would wrongly drop the whole cloud once its rest position leaves the
  // view (e.g. the camera pitching up and away). The wave field does the same.
  mesh.frustumCulled = false;

  const dummy = new Object3D();
  const color3 = new Color();
  const base = new Color(color);

  const basePositions = new Float32Array(total * 3);
  const baseColors = new Float32Array(total * 3);
  const flow = new Float32Array(total * 3);
  const baseScale = new Float32Array(total);
  const stagger = new Float32Array(total);
  const radial = new Float32Array(total);
  // Per-particle bloom weight: 1 for the oversized "hero" beads (which get the always-on white
  // glow and so bloom), 0 for everyone else. Chosen here, per particle, not by size ranking.
  const bloomMask = new Float32Array(total);
  const curlOut: [number, number, number] = [0, 0, 0];

  for (let i = 0; i < total; i += 1) {
    const { x, y, z } = points[i];
    const worldX = x + center[0];
    const worldY = y + center[1];
    const worldZ = z + center[2];

    // A random subset are oversized "hero" beads (2× by default) that carry the white glow +
    // bloom; the rest get the usual jittered size.
    const isBig = random() < bigFraction;
    bloomMask[i] = isBig ? 1 : 0;
    const scale = isBig
      ? particleSize * bigScale
      : particleSize * (1 + (random() - 0.5) * sizeJitter);
    baseScale[i] = scale;
    dummy.position.set(worldX, worldY, worldZ);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    basePositions[i * 3] = worldX;
    basePositions[i * 3 + 1] = worldY;
    basePositions[i * 3 + 2] = worldZ;

    if (scatterTarget && scatterDest) {
      scatterTarget[i * 3] = scatterDest[i * 3] - x;
      scatterTarget[i * 3 + 1] = scatterDest[i * 3 + 1] - y;
      scatterTarget[i * 3 + 2] = scatterDest[i * 3 + 2] - z;
    }

    // Directional shade of the **whole form**, baked into the albedo so the cloud reads as
    // one solid: the form normal (glyph = a smooth rounded-box normal, hand = normalize
    // (point)) is lit against the key with a soft **wrap** term — `0.5 + 0.5·(n·L)`, a
    // half-Lambert with no hard terminator — so the shadow side grades gently to `floor`
    // instead of banding. Real per-sphere lighting then adds the fine gradient on top.
    let nx = normals ? normals[i * 3] : x;
    let ny = normals ? normals[i * 3 + 1] : y;
    let nz = normals ? normals[i * 3 + 2] : z;
    const nlen = Math.hypot(nx, ny, nz) || 1;
    nx /= nlen;
    ny /= nlen;
    nz /= nlen;
    // Half-Lambert, then a `**1.7` gamma so mid-tones and the shadow side fall off deeper
    // (more volume) while the terminator stays soft — no hard band.
    const wrap = (0.5 + 0.5 * (nx * lightX + ny * lightY + nz * lightZ)) ** 1.7;
    const shadeValue = shade.floor + shade.dir * wrap + (random() - 0.5) * 0.04;
    color3.copy(base).multiplyScalar(shadeValue);
    mesh.setColorAt(i, color3);
    baseColors[i * 3] = color3.r;
    baseColors[i * 3 + 1] = color3.g;
    baseColors[i * 3 + 2] = color3.b;

    // Flow direction for the scatter. A low-frequency curl field makes nearby
    // particles move almost together, so they stay in thin coherent sheets that
    // the twist then winds into ribbons; a point may also carry an explicit
    // direction that leads, with curl as a waver.
    curl(x * 0.045, y * 0.045, z * 0.045, curlOut);
    const clen = Math.hypot(curlOut[0], curlOut[1], curlOut[2]) || 1;
    let dirX = curlOut[0] / clen;
    let dirY = curlOut[1] / clen;
    let dirZ = curlOut[2] / clen;
    if (flowOverride) {
      // Explicit per-particle flow (the glyph's ribbon tangents).
      dirX = flowOverride[i * 3];
      dirY = flowOverride[i * 3 + 1];
      dirZ = flowOverride[i * 3 + 2];
    }
    const pt = points[i];
    if (pt.fx !== undefined && pt.fy !== undefined && pt.fz !== undefined) {
      const flen = Math.hypot(pt.fx, pt.fy, pt.fz) || 1;
      dirX = pt.fx / flen + dirX * 0.28;
      dirY = pt.fy / flen + dirY * 0.28;
      dirZ = pt.fz / flen + dirZ * 0.28;
    }
    const dlen = Math.hypot(dirX, dirY, dirZ) || 1;
    // Wide speed variance stretches the strands into thin wisps of very different
    // length — the raw material the twist then spirals.
    const speed = 0.3 + random() * 2;
    flow[i * 3] = (dirX / dlen) * speed;
    flow[i * 3 + 1] = (dirY / dlen) * speed;
    flow[i * 3 + 2] = (dirZ / dlen) * speed;

    stagger[i] = random();
    radial[i] = (Math.hypot(x, y, z) || 1) / extent;
  }

  // Per-particle tube cross-section offset — a fixed random point in the **unit** disc
  // (scaled by the flight tube radius at runtime), computed with its own RNG so the main
  // loop's randoms are undisturbed. Gives each flight ribbon a solid round-tube body.
  const tubeOffset = new Float32Array(total * 2);
  const tubeRand = createRandom(seed + 7);
  for (let i = 0; i < total; i += 1) {
    const r = Math.sqrt(tubeRand()); // sqrt → uniform over the disc
    const a = tubeRand() * Math.PI * 2;
    tubeOffset[i * 2] = Math.cos(a) * r;
    tubeOffset[i * 2 + 1] = Math.sin(a) * r;
  }

  // World-space Y bounds (for the scan-in reveal).
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < total; i += 1) {
    const y = basePositions[i * 3 + 1];
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  // The scan line travels the cloud's own world-Y range, so the reveal fits the form exactly.
  scan.uScanMinY.value = minY;
  scan.uScanMaxY.value = maxY;

  return {
    mesh,
    basePositions,
    baseColors,
    flow,
    baseScale,
    bloomMask,
    stagger,
    radial,
    tubeOffset,
    glowAttribute,
    count: total,
    minY,
    maxY,
    center,
    scatterTarget,
    pointer,
    scan,
    relax,
    life,
  };
};

const pointerTint = new Color();
const scatterTint = new Color();

export interface CloudUpdate {
  /** Cursor position in world space, or null when the pointer is away. */
  pointer: Vector3 | null;
  pointerConfig: PointerConfig;
  /** Cursor influence multiplier — faded to 0 as the scroll scatter takes over. */
  pointerGate: number;
  /** Scroll scatter amount in [0, 1]. */
  scatter: number;
  scatterConfig: ScatterConfig;
  /** 0→1: morph the formed ribbons into world-space streamers strung along the flight
   *  corridor, so the camera flies through them (parallax, no lag, no lens-locked spin). */
  flight?: number;
  /** 0→1: as the camera reaches the hand, the streamers dissolve (fade + shrink). */
  exit?: number;
  /** Idle life (per-particle shimmer + sparse always-on bloom points). Applied in
   *  every state so no figure is ever fully static. */
  idle?: IdleConfig;
  /** **Intro assembly** in [0, 1]: every particle flies in from a scattered launch point around
   *  `assembleFrom` (roughly the camera) and settles onto its rest position, staggered per
   *  particle — the site's opening move. 1 (or absent) = fully assembled, a no-op. */
  assemble?: number;
  /** World point the launch cloud scatters around — the hero camera's start pose. */
  assembleFrom?: Vector3Tuple;
  /** Scale of the launch scatter around that point (multiplies each particle's flow vector). */
  assembleSpread?: number;
  /** Peak emissive of the pink comet trail a particle carries mid-flight (shares the scan
   *  band's tint, so the intro and the reveals read as one effect). */
  assembleGlow?: number;
  /** Bottom-up **scan-in reveal** in [0, 1]: 0 = hidden, 1 = fully materialised. Particles
   *  below the rising scan line are shown; a bright bloom band rides the line (movie scan). */
  scan?: number;
  /** Strength of the scan line's white bloom. */
  scanGlow?: number;
  /** Tilt of the reveal line as a Y-slope per world-unit X — slants the mask's top edge
   *  (0 = level). */
  scanTilt?: number;
  /** Hand → wave transform in [0, 1]. Swirls each particle from its rest position,
   *  through a vortex, onto its `scatterTarget` curtain cell, which then ripples. */
  wave?: number;
  waveConfig?: WaveConfig;
  /** Fraction of particles held **hidden until the wave forms** (0 = none). Lets the hand read as a
   *  sparser cloud without changing the instance count, so the wave curtain it becomes keeps every
   *  bead — and its `columns × rows` grid still covers them. The held-back beads grow in early in
   *  the transform, under cover of the vortex. */
  sparse?: number;
  /** Land on every target in **one call** instead of easing toward it. For clouds that are updated
   *  once and then only rendered (the tree) — see the note at the ease. */
  immediate?: boolean;
  /** Elapsed time in seconds — drives the ribbons' continuous drift/wander. */
  time: number;
}

/**
 * Per-frame update: cursor repulsion (gated) and scroll-driven strand scatter,
 * combined into one target position per particle, plus the emissive glow.
 *
 * Writes straight into the instance buffers — the spheres carry only a uniform
 * scale and a translation, so only the three translation slots per matrix need
 * touching. Recomposing the matrices would not hold 60 fps at this count.
 */
export const updateCloud = (cloud: ParticleCloud, update: CloudUpdate): void => {
  const {
    mesh,
    basePositions,
    baseColors,
    flow,
    baseScale,
    bloomMask,
    stagger,
    radial,
    tubeOffset,
    glowAttribute,
    count,
    minY,
    maxY,
    center,
    scatterTarget,
  } = cloud;
  const { pointer, pointerConfig, pointerGate, scatter, scatterConfig, time } = update;
  const idle = update.idle ?? null;
  // Flight: morph the formed ribbons into camera-relative perimeter streamers; exit: fly them
  // out + fade as the camera arrives. Both eased.
  const flight = update.flight ?? 0;
  const exit = update.exit ?? 0;
  const flightEased = flight * flight * (3 - 2 * flight);
  const flighting = flightEased > 0.0001;
  const wave = update.wave ?? 0;
  const waveConfig = update.waveConfig ?? null;
  const centerX = center[0];
  const centerY = center[1];
  const centerZ = center[2];

  const matrix = mesh.instanceMatrix.array as Float32Array;
  const glow = glowAttribute.array as Float32Array;

  pointerTint.set(pointerConfig.color);
  const pTintR = pointerTint.r * pointerConfig.glow;
  const pTintG = pointerTint.g * pointerConfig.glow;
  const pTintB = pointerTint.b * pointerConfig.glow;

  scatterTint.set(scatterConfig.color);
  const sTintR = scatterTint.r * scatterConfig.glow;
  const sTintG = scatterTint.g * scatterConfig.glow;
  const sTintB = scatterTint.b * scatterConfig.glow;

  // Idle life — a slow, super-smooth shimmer in every state, plus the always-on glow on
  // the biggest particles (the only things — with the cursor-touched ones — that bloom).
  const idleAmp = idle ? idle.amplitude : 0;
  const idleSpeed = idle ? idle.speed : 0;
  const idleRelax = idle ? idle.relax : 0;
  const bigGlow = idle ? idle.bigGlow : 0;
  const immediate = update.immediate ?? false;

  const { radius, strength, relax, returnRelax } = pointerConfig;
  const {
    distance,
    radial: radialPush,
    stagger: staggerSpan,
    twist,
    drift,
    wander,
    towardCamera,
    flight: flightCfg,
  } = scatterConfig;
  const scattering = scatter > 0.0001;

  // Flight corridor constants (the ribbons are strung along it in world space; the camera
  // flies through). Per-ribbon variation breaks any clean ring so the roll doesn't read as a
  // "rotating circle". `exit` dissolves them (fade + shrink), not a uniform shift.
  const flRibbons = Math.max(1, flightCfg.ribbons);
  const flAxisY = flightCfg.axisY;
  const flZStart = flightCfg.zStart;
  const flZSpan = flightCfg.zEnd - flightCfg.zStart;
  const flRadius = flightCfg.radius;
  const flBend = flightCfg.bend;
  const flBendWaves = flightCfg.bendWaves;
  const flTurn = flightCfg.turn;
  const flSpeed = flightCfg.speed;
  const flSpread = flightCfg.spread;
  const flThickness = flightCfg.thickness;
  const flVScale = flightCfg.vScale;
  const flExitDist = flightCfg.exitDistance;
  const flExitCurve = flightCfg.exitCurve;
  const flExitLift = flightCfg.exitLift;
  const flExitSpan = flightCfg.exitSpan;
  const TAU = Math.PI * 2;
  // Continuous ambient motion for the held ribbons (independent of scroll).
  const driftAngle = time * drift;
  const driftCos = Math.cos(driftAngle);
  const driftSin = Math.sin(driftAngle);

  // Hand → wave transform. `waveEased` is the travel [0,1]; the morph routes through a vertical
  // vortex/whirlwind (see the `v*` constants + the `waving` branch below).
  const waving = wave > 0.0001 && !!scatterTarget && !!waveConfig;
  const waveEased = wave * wave * (3 - 2 * wave);
  // **Sparse hand, full wave.** The hand *is* the wave — same instances — so thinning it by lowering
  // the count would thin the curtain too (and break the `columns × rows` grid that has to cover
  // them). Instead a fixed slice of beads is held at zero scale until the transform starts, then
  // grown in over its first third, where the vortex is at its busiest and nothing reads as popping.
  const sparse = update.sparse ?? 0;
  const sparseIn = sparse > 0 ? Math.min(1, waveEased / 0.35) : 1;
  const wAmp = waveConfig ? waveConfig.amplitude : 0;
  const wFreqX = waveConfig ? waveConfig.freqX : 0;
  const wFreqY = waveConfig ? waveConfig.freqY : 0;
  const wSpeed = waveConfig ? waveConfig.speed : 0;
  const wSizeBoost = waveConfig ? waveConfig.sizeBoost : 1;
  const wTrough = waveConfig ? waveConfig.troughShade : 0;
  const wLift = waveConfig ? waveConfig.lift : 0;
  const wInvAmp = wAmp > 0 ? 1 / (2 * wAmp) : 0;
  // Grid metrics for the edge fade (dissolve the wave's borders, no hard line). The grid
  // is tilted + yawed, so we invert those to recover a particle's grid-local position.
  const wCenterX = waveConfig ? waveConfig.center[0] : 0;
  const wCenterY = waveConfig ? waveConfig.center[1] : 0;
  const wCosT = waveConfig ? Math.cos(waveConfig.tilt) : 1;
  const wSinT = waveConfig ? Math.sin(waveConfig.tilt) : 0;
  const wCosY = waveConfig ? Math.cos(waveConfig.yaw) : 1;
  const wSinY = waveConfig ? Math.sin(waveConfig.yaw) : 0;
  const wHalfW = waveConfig ? ((waveConfig.columns - 1) / 2) * waveConfig.spacing : 1;
  const wHalfH = waveConfig ? ((waveConfig.rows - 1) / 2) * waveConfig.spacing : 1;
  const wEdge = waveConfig ? waveConfig.edgeFade : 0;
  const wEdgeStart = 1 - wEdge;
  // The morph routes through **several meandering bright streams** (a few dense glowing spines
  // snaking up dust halos — see scene.config). Pure trig / cheap hashes → cheap at 33k.
  const vortex = waveConfig ? waveConfig.vortex : null;
  const vStrength = vortex ? vortex.strength : 0;
  const vPlateau = vortex ? vortex.plateau : 1;
  const vStrands = vortex ? vortex.strands : 1;
  const vSpread = vortex ? vortex.spread : 0;
  const vRadius = vortex ? vortex.radius : 0;
  const vHeight = vortex ? vortex.height : 0;
  const vMeander = vortex ? vortex.meander : 0;
  const vMeanderFreq = vortex ? vortex.meanderFreq : 0;
  const vCoreBias = vortex ? vortex.coreBias : 1;
  const vTwist = vortex ? vortex.twist : 0;
  const vSpin = vortex ? vortex.spin : 0;
  const vStagger = vortex ? vortex.stagger : 0;
  const vFlash = vortex ? vortex.flash : 0;
  // Vertical axis of the column: the hand's own X/Z. The streams are spread symmetrically about
  // it (so the group stays centred), rising from the hand's base upward.
  const vAxisX = centerX;
  const vAxisZ = centerZ;
  const vBaseY = minY;
  const vStrandStep = vStrands > 1 ? 1 / (vStrands - 1) : 0; // spread fraction per stream
  const vStaggerDenom = Math.max(0.0001, 1 - vStagger); // normalises the staggered progress
  const vAngT = time * vSpin; // the halo swirl
  const vMeanderT = time * vSpin * 0.5; // slow drift of the snakes

  // Intro assembly: particles fly in from around `assembleFrom` onto their rest spots. The flow
  // field doubles as the randomised launch direction (× its per-particle speed), so neighbours
  // stream in as loose currents rather than a uniform shell.
  const assemble = update.assemble ?? 1;
  const asmFrom = update.assembleFrom ?? null;
  const assembling = assemble < 1 && asmFrom !== null;
  const asmSpread = update.assembleSpread ?? 10;
  const asmGlow = update.assembleGlow ?? 0;
  const ASM_SPAN = 0.6; // span of per-particle start delays — how long the arrival trickles

  // Scan-in reveal (bottom-up materialise, like a movie body scan). `scan` 1 = fully revealed
  // (the default → no effect). Particles below the rising line are shown; a bright white bloom
  // band trails the line.
  const scan = update.scan ?? 1;
  const scanGlowStrength = update.scanGlow ?? 0;
  // Tilt of the reveal line, as a Y-slope per world-unit X — the mask's top edge rides at a
  // slight angle instead of dead level (0 = horizontal, the hand's default).
  const scanTilt = update.scanTilt ?? 0;
  const scanning = scan < 0.9999;
  const scanSpanY = maxY - minY || 1;
  const scanBand = 0.05; // reveal ramp (fraction of height) — a crisp line
  const scanGlowWidth = 0.14; // trailing white-bloom band (fraction of height)

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const offset = i * 16;

    const baseX = basePositions[i3];
    const baseY = basePositions[i3 + 1];
    const baseZ = basePositions[i3 + 2];

    let targetX = baseX;
    let targetY = baseY;
    let targetZ = baseZ;

    // Scroll scatter: strands burst out along the curl flow, staggered so they
    // don't all leave at once. `radialPush` biases the swirl outward so the
    // figure opens up and the camera can pass through its centre. As each strand
    // reaches full extension it shrinks to nothing, so the camera flies through
    // cleared space rather than into a dense pile.
    let bloom = 0;
    let fade = 1;
    let waveShade = 1;
    let waveSize = 1;
    let waveLift = 0;
    // This particle's assembly progress (1 = landed) — read again below for its scale/glow.
    let asmProgress = 1;
    if (assembling && asmFrom) {
      // Staggered per particle: `stagger` spreads the launches over `ASM_SPAN` of the window, so
      // the X knits together particle by particle instead of arriving as one block.
      const a0 = stagger[i] * ASM_SPAN;
      const raw = (assemble - a0) / (1 - ASM_SPAN);
      const al = raw < 0 ? 0 : raw > 1 ? 1 : raw;
      // Smootherstep — eases off the launch and settles into place with no snap.
      const ae = al * al * al * (al * (al * 6 - 15) + 10);
      const sx = asmFrom[0] + flow[i3] * asmSpread;
      const sy = asmFrom[1] + flow[i3 + 1] * asmSpread;
      const sz = asmFrom[2] + flow[i3 + 2] * asmSpread;
      targetX = sx + (baseX - sx) * ae;
      targetY = sy + (baseY - sy) * ae;
      targetZ = sz + (baseZ - sz) * ae;
      asmProgress = al;
    } else if (scattering && flighting) {
      // The X reassembles **directly** into the thick corridor streamers — no intermediate
      // corkscrew-ribbon state. Each particle blends from its X rest position straight to its
      // spot on a world-space streamer strung along the flight corridor; the camera flies
      // *through* the corridor (real parallax — no lag, no lens-locked ring rotation). Each
      // ribbon is an asymmetric snaking band (varied radius/phase + a helical turn + tube
      // thickness), so the set never reads as a clean rotating circle.
      const ribbon = i % flRibbons;
      const t = stagger[i]; // rest param along the ribbon, 0 = tip (near), 1 = far end
      const hash = Math.sin(ribbon * 127.1) * 43758.5453;
      const rnd = hash - Math.floor(hash);
      const phase = ribbon * 2.3999632 + rnd * TAU;
      const rBase = flRadius * (0.55 + 0.9 * rnd);
      const sideSign = Math.cos(phase) >= 0 ? 1 : -1; // the ribbon's exit side
      const toA = tubeOffset[i * 2] * flThickness;
      const toB = tubeOffset[i * 2 + 1] * flThickness;

      // Exit **stream** (tip-driven). The tip is the ribbon's **far end** (param 1, out by the
      // hand — the end that's actually in frame; the near end is behind the camera by now).
      // `hp` is how far the tip has been pulled out. Each particle at rest-param `t` shifts
      // toward the tip → `pShift`: while `pShift ≤ 1` it's still on the corridor (sliding toward
      // the tip); once `pShift > 1` it has passed the tip onto the exit extension. So the WHOLE
      // ribbon flows to where the tip went — the tip leads and the body follows its path,
      // instead of the middle pivoting. (`hp = 0` pre-exit → the undeformed corridor.)
      const hp = exit * flExitSpan;
      const pShift = t + hp;
      const p = pShift < 1 ? pShift : 1; // corridor param, clamped at the far tip

      // Corridor centreline (+ round-tube offset) evaluated at `p`.
      const angP =
        phase + p * flTurn + Math.sin(p * flBendWaves * TAU + time * flSpeed + phase) * flBend;
      const cosP = Math.cos(angP);
      const sinP = Math.sin(angP);
      const radP =
        rBase *
        (1 + p * flSpread) *
        (1 + 0.3 * Math.sin(p * flBendWaves * TAU * 0.7 + time * flSpeed * 1.3 + phase));
      let fx = cosP * radP + cosP * toA - sinP * toB;
      let fy = flAxisY + (sinP * radP + sinP * toA + cosP * toB) * flVScale;
      let fz = flZStart + p * flZSpan;

      // Past the tip: fly out along a **smooth** arc — no sharp corners. The heading turns
      // *gradually from the corridor's own direction* (−Z, into the scene) to the ribbon's side
      // via a smoothstep (zero slope at u=0 → tangent-matched to the corridor at the join, so
      // no ~90° kink), and the vertical rises **monotonically** (an `sin(u·π)` arc used to dip
      // back to corridor height at u=1 → a downward V; a monotonic rise avoids that cusp).
      if (pShift > 1) {
        const u = pShift - 1; // distance past the tip
        const un = u < 1 ? u : 1;
        const uc = un * un * (3 - 2 * un); // smoothstep — smooth at both ends
        // Turn a symmetric ±90° from −Z (the corridor's own heading) to the ribbon's side:
        // +X ends at 0, −X ends at −π (the short way), so neither over-rotates into a tight
        // spiral cusp.
        const th = -Math.PI / 2 + sideSign * (Math.PI / 2) * uc;
        const dist = u * flExitDist;
        fx += Math.cos(th) * dist;
        fz += Math.sin(th) * dist;
        fy += uc * flExitLift;
      }

      // Soft floor: ease curves away from the ground with a smooth (softplus) lower bound
      // instead of a hard clamp, which produced a sharp V where a curve hit `y = 1`.
      if (fy < 16) fy = 1 + 2.5 * Math.log(1 + Math.exp((fy - 1) / 2.5));

      // Global fade at the very end of the exit (whole ribbon stays visible through the stream,
      // then fades together once it's mostly off-frame — so the tip clearly leads, no
      // middle-origin illusion from an early per-particle fade).
      if (exit > 0) {
        const gf = Math.min(1, Math.max(0, (exit - 0.72) / 0.28));
        fade = 1 - gf * gf * (3 - 2 * gf);
      }

      // Blend rest → corridor by the assemble progress, so the X streams straight into the
      // curves.
      targetX = baseX + (fx - baseX) * flightEased;
      targetY = baseY + (fy - baseY) * flightEased;
      targetZ = baseZ + (fz - baseZ) * flightEased;
      bloom = Math.min(1, flightEased * 1.6) * (1 - radial[i] * 0.5);
    } else if (scattering) {
      // Legacy curl/strand scatter (kept for any scatter cloud without the flight corridor).
      const start = stagger[i] * staggerSpan;
      const amt = Math.min(1, Math.max(0, (scatter - start) / (1 - staggerSpan)));
      const shape = Math.min(1, amt / 0.55);
      const shapeEased = shape * shape * (3 - 2 * shape);
      if (shapeEased > 0) {
        let sx: number;
        let sy: number;
        let sz: number;
        if (scatterTarget) {
          sx = scatterTarget[i3] * shapeEased;
          sy = scatterTarget[i3 + 1] * shapeEased;
          sz = scatterTarget[i3 + 2] * shapeEased;
        } else {
          const reach = shapeEased * distance;
          sx = flow[i3] * reach + (baseX - centerX) * shapeEased * radialPush;
          sy = flow[i3 + 1] * reach + (baseY - centerY) * shapeEased * radialPush;
          sz = flow[i3 + 2] * reach + (baseZ - centerZ) * shapeEased * radialPush;
          const twistAngle = Math.hypot(sx, sy, sz) * twist;
          const tc = Math.cos(twistAngle);
          const ts = Math.sin(twistAngle);
          const rx = sx * tc + sz * ts;
          sz = -sx * ts + sz * tc;
          sx = rx;
        }
        const wob = Math.sin(time * 1.4 + stagger[i] * 6.2831853) * wander * shapeEased;
        sx += flow[i3] * wob;
        sy += flow[i3 + 1] * wob;
        sz += flow[i3 + 2] * wob;
        if (sz > 0) sz *= towardCamera;
        targetX += sx;
        targetY += sy;
        targetZ += sz;
        const ddx = targetX - centerX;
        const ddz = targetZ - centerZ;
        const spin = shapeEased;
        const rc = 1 + (driftCos - 1) * spin;
        const rs = driftSin * spin;
        targetX = centerX + ddx * rc + ddz * rs;
        targetZ = centerZ - ddx * rs + ddz * rc;
        bloom = Math.min(1, shapeEased * 1.6) * (1 - radial[i] * 0.5);
        fade = 1 - Math.max(0, (amt - 0.75) / 0.25);
      }
    } else if (waving) {
      // The hand's own particles are swept up through **several meandering bright streams** and
      // then settle onto their wave-curtain grid cell (`scatterTarget`) as the curtain ripples.
      // Same particles, same colours — a real transform, not new particles fading in.
      const curtainX = baseX + scatterTarget![i3];
      const curtainY = baseY + scatterTarget![i3 + 1];
      const curtainZ = baseZ + scatterTarget![i3 + 2];
      // Per-particle **staggered** progress: each particle starts its hand→curve→wave journey a
      // little later (`ph`), so the three states blend seamlessly instead of the whole cloud
      // moving in lockstep. `we` is this particle's own eased travel; all reach 1 at `wave` = 1.
      const ph = (((i * 20261) % 1000) / 1000) * vStagger;
      const wlRaw = (wave - ph) / vStaggerDenom;
      const wl = wlRaw < 0 ? 0 : wlRaw > 1 ? 1 : wlRaw;
      // Smootherstep (quintic) — zero 1st & 2nd derivatives at both ends, so the particle eases
      // off the hand and settles into the wave more gently than a cubic smoothstep would.
      const we = wl * wl * wl * (wl * (wl * 6 - 15) + 10);
      // This particle's pull onto the streams: 0 at the ends of its own journey, peaking mid.
      const vpk = Math.min(1, Math.sin(Math.PI * we) * vPlateau) * vStrength;
      // Depth ripple, growing in as the particle reaches the curtain.
      const rip =
        (wAmp * Math.sin(curtainX * wFreqX + time * wSpeed) +
          wAmp * Math.sin(curtainY * wFreqY + time * wSpeed * 0.8)) *
        we;
      // Base travel from the hand rest to the rippling curtain cell.
      let px = baseX + (curtainX - baseX) * we;
      let py = baseY + (curtainY - baseY) * we;
      let pz = baseZ + (curtainZ + rip - baseZ) * we;
      // Streams: each particle belongs to one of `vStrands` curves, whose base is spread across X
      // (symmetric about the axis) and whose spine **snakes** side-to-side up the height (S-curve,
      // its own phase per curve). The particle wraps that spine at a radius biased toward the
      // centre (`rj^coreBias` → dense bright core + thinning dust halo), swirling slowly around it.
      // Only Y grows with height, so the streams rise **up**. Pure trig / cheap hashes → cheap at 33k.
      let vCore = 0;
      if (vpk > 0.0001) {
        const strand = i % vStrands;
        const sideT = strand * vStrandStep - 0.5; // −0.5…0.5 → which curve
        const hY = ((i * 2654435761) % 1000) / 1000; // height fraction [0,1)
        const rj = ((i * 40503) % 997) / 997; // radial fraction (0 = on the spine)
        const ha = ((i * 12289) % 1009) / 1009; // angle fraction
        const mp = hY * vMeanderFreq * TAU + strand * 1.7; // own snake phase per curve
        const spineX = vAxisX + sideT * vSpread + Math.sin(mp + vMeanderT) * vMeander;
        const spineZ = vAxisZ + sideT * vSpread * 0.3 + Math.sin(mp * 0.6 + 1.7 + vMeanderT) * vMeander * 0.5;
        const r = vRadius * Math.pow(rj, vCoreBias); // dense core, diffuse halo
        const ang = ha * TAU + hY * vTwist + vAngT;
        const vx = spineX + Math.cos(ang) * r;
        const vy = vBaseY + hY * vHeight;
        const vz = spineZ + Math.sin(ang) * r;
        px += (vx - px) * vpk;
        py += (vy - py) * vpk;
        pz += (vz - pz) * vpk;
        vCore = 1 - rj; // brightest on the spine
      }
      targetX = px;
      targetY = py;
      targetZ = pz;
      // Pink glow, brightest along the spines and fading into the dust halo (reuses the
      // scatter bloom path → `sTint`).
      bloom = vpk * vFlash * (0.12 + 0.88 * vCore);
      waveSize = 1 + (wSizeBoost - 1) * we;
      // Edge fade: shrink particles toward the grid's borders so the wave dissolves
      // instead of ending in a hard line. Recover the grid-local coords (undo tilt+yaw):
      // dy from height, then the across offset `ox`, normalised to [-1,1] over the extent.
      if (wEdge > 0) {
        const dyLocal = (curtainY - wCenterY) / wCosT;
        const ozT = -dyLocal * wSinT;
        const ox = (curtainX - wCenterX - ozT * wSinY) / wCosY;
        const edge = Math.max(Math.abs(ox) / wHalfW, Math.abs(dyLocal) / wHalfH);
        if (edge > wEdgeStart) {
          const t = Math.min(1, (edge - wEdgeStart) / wEdge);
          waveSize *= 1 - t * t * (3 - 2 * t);
        }
      }
      // Troughs darken so the sparse grid reads on the light backdrop.
      waveShade = 1 - wTrough * (0.5 - Math.min(0.5, Math.max(-0.5, rip * wInvAmp))) * we;
      // White emissive lift: the settled curtain is far and obliquely lit, so the white beads read
      // dark grey — floor their emissive up to the hand/X bright-white range (below the bloom
      // threshold → brightens, no glow). Ramp in over the **back half** of each particle's journey
      // (like the albedo→white lerp) so the mid-transition streams keep their pink bloom.
      const lr = we < 0.5 ? 0 : (we - 0.5) / 0.5;
      waveLift = wLift * lr * lr * (3 - 2 * lr);
    }

    // Cursor repulsion (idle, faded out while scattering).
    let influence = 0;
    if (pointer && pointerGate > 0.001) {
      const dx = baseX - pointer.x;
      const dy = baseY - pointer.y;
      const dz = baseZ - pointer.z;
      const d = Math.hypot(dx, dy, dz);
      if (d < radius) {
        influence = (1 - d / radius) * pointerGate;
        const push = (influence * influence * strength) / (d || 0.0001);
        targetX += dx * push;
        targetY += dy * push;
        targetZ += dz * push;
      }
    }

    // Idle shimmer: a slow, super-smooth per-particle wander (staggered by phase) added
    // on top of whatever state the particle is in, so nothing is ever frozen — and it
    // adds a little floating depth. Kept slow (`idle.speed`) so it never looks fast.
    if (idleAmp > 0) {
      const phase = stagger[i] * 6.2831853;
      targetX += Math.sin(time * idleSpeed + phase) * idleAmp;
      targetY += Math.sin(time * idleSpeed * 1.3 + phase * 1.7) * idleAmp;
      targetZ += Math.cos(time * idleSpeed * 0.8 + phase) * idleAmp;
    }
    // Only the biggest particles glow (so only they, and the cursor-touched ones, bloom).
    // Faded out through the wave transform so the clean grid has no stray highlights.
    const bloomGlowVal = bloomMask[i] * bigGlow * (1 - waveEased);

    // Scan-in reveal: particles below the rising line grow in; a pink bloom band trails it (tinted
    // below, where `scanGlowVal` is fed into the emissive with the shared bloom-particle colour).
    let revealScale = 1;
    let scanGlowVal = 0;
    if (scanning) {
      // Height along the reveal, 0 at the bottom → 1 at the top, with an optional X-tilt so the
      // line is slanted: one side reveals a touch before the other.
      const h = (baseY - minY - (baseX - centerX) * scanTilt) / scanSpanY;
      const dd = scan - h; // >0 revealed, <0 not yet
      revealScale = dd <= 0 ? 0 : dd < scanBand ? dd / scanBand : 1;
      if (dd >= 0 && dd < scanGlowWidth) scanGlowVal = (1 - dd / scanGlowWidth) * scanGlowStrength;
    }

    // Intro assembly: a particle waiting to launch is hidden; in flight it rides slightly small
    // and carries the pink comet trail (peaking mid-flight, via the shared scan-tint path); it
    // lands at full size with the trail burnt out.
    if (assembling) {
      revealScale = asmProgress <= 0 ? 0 : 0.55 + 0.45 * asmProgress;
      scanGlowVal = Math.sin(Math.PI * asmProgress) * asmGlow;
    }

    // Idle shimmer needs a floor on the easing or the slow wander is over-damped
    // at rest; cursor/scatter/wave still use their (higher) relax.
    let ease = influence > 0 || scattering || waving ? relax : returnRelax;
    if (ease < idleRelax) ease = idleRelax;
    // Flight streamers snap tighter to their target so they don't trail behind (the "lag"):
    // their world position barely moves frame-to-frame, so a high ease reads as locked, not
    // jittery.
    if (flighting) ease = Math.max(ease, 0.6 * flightEased);
    // Scan reveal must be crisp, not a slow ease-in.
    if (scanning) ease = Math.max(ease, 0.3);
    // The fly-in tracks its (fast-moving) interpolated target closely, or the streams lag into mush.
    if (assembling) ease = Math.max(ease, 0.4);
    // **Bake-once clouds must land on their target in a single call.** Every value here *approaches*
    // its target by `ease` per call, which assumes a per-frame loop. The tree is updated exactly once
    // at load, so at the idle floor of 0.05 it kept 5 % of everything — most visibly its hero beads'
    // emissive, which sat at 0.25 against a bloom threshold of 3.5 and so never glowed at all.
    if (immediate) ease = 1;
    matrix[offset + 12] += (targetX - matrix[offset + 12]) * ease;
    matrix[offset + 13] += (targetY - matrix[offset + 13]) * ease;
    matrix[offset + 14] += (targetZ - matrix[offset + 14]) * ease;

    // Uniform scale lives on the matrix diagonal (rotation is identity for
    // spheres). Ease it toward the faded size so particles dissolve on the
    // strand's tail and rebuild on scroll-up; wave particles grow into the curtain.
    // Held-back beads (see `sparse`): a stable per-index hash, so the same slice is hidden every
    // frame and the thinning never crawls. Same hash family as the vortex's `hY`/`rj`, uncorrelated
    // with `stagger` so the gaps don't line up with the scatter order.
    const sparseScale =
      sparse > 0 && ((i * 2246822519) % 1000) / 1000 < sparse ? sparseIn : 1;
    const targetScale = baseScale[i] * fade * waveSize * revealScale * sparseScale;
    // **Un-revealed particles snap to exactly zero — never eased.** Easing only moves the scale a
    // fraction (`ease`) toward the target per call, so a cloud sitting at its fully-formed pose that
    // is suddenly shown with `scan = 0` would still be at ~70 % size on its first frame and shrink
    // away over the next dozen — reading as the form **appearing and then dissolving** right before
    // its real scan-in. That happens whenever the cloud is revealed from a formed state: on the first
    // scroll past the hand, and again on every approach from above (it isn't updated while hidden, so
    // its matrices stay formed). Revealed particles still ease, so the reveal itself keeps its ramp
    // and the hand-off at `scan = 1` stays smooth.
    // A held-back bead snaps to zero for the same reason an un-revealed one does: it enters the act
    // from a fully-formed pose, and easing would show it shrinking away over a dozen frames.
    const s =
      ((scanning || assembling) && revealScale === 0) || sparseScale === 0
        ? 0
        : matrix[offset] + (targetScale - matrix[offset]) * ease;
    matrix[offset] = s;
    matrix[offset + 5] = s;
    matrix[offset + 10] = s;

    const heat = influence * influence;
    // The scan-in band glows **pink** — tinted with the shared bloom-particle colour (`scatterTint`)
    // so it matches the scatter burst / vortex streams instead of being a plain white band.
    const scanGlowR = scatterTint.r * scanGlowVal;
    const scanGlowG = scatterTint.g * scanGlowVal;
    const scanGlowB = scatterTint.b * scanGlowVal;
    const targetR = Math.max(pTintR * heat, sTintR * bloom, bloomGlowVal, scanGlowR, waveLift);
    const targetG = Math.max(pTintG * heat, sTintG * bloom, bloomGlowVal, scanGlowG, waveLift);
    const targetB = Math.max(pTintB * heat, sTintB * bloom, bloomGlowVal, scanGlowB, waveLift);
    glow[i3] += (targetR - glow[i3]) * ease;
    glow[i3 + 1] += (targetG - glow[i3 + 1]) * ease;
    glow[i3 + 2] += (targetB - glow[i3 + 2]) * ease;

    // Fade albedo toward black as a particle blooms, so the emissive purple
    // isn't diluted by the white base colour. `waveShade` darkens wave troughs.
    const keep = (1 - Math.min(1, bloom) * 0.85) * waveShade;
    let colR = baseColors[i3] * keep;
    let colG = baseColors[i3 + 1] * keep;
    let colB = baseColors[i3 + 2] * keep;
    // The morphed wave is pure white — but only lerp the albedo to white in the **second half**
    // of the transform, so mid-transition the curves stay dark-albedo and read **pink** (the
    // `bloom`-driven emissive dominates); white takes over as they settle into the wave.
    if (waving) {
      const wl = Math.max(0, (waveEased - 0.5) / 0.5);
      const wlE = wl * wl * (3 - 2 * wl);
      colR += (1 - colR) * wlE;
      colG += (1 - colG) * wlE;
      colB += (1 - colB) * wlE;
    }
    if (mesh.instanceColor) {
      const c = mesh.instanceColor.array as Float32Array;
      c[i3] += (colR - c[i3]) * ease;
      c[i3 + 1] += (colG - c[i3 + 1]) * ease;
      c[i3 + 2] += (colB - c[i3 + 2]) * ease;
    }
  }

  mesh.instanceMatrix.needsUpdate = true;
  glowAttribute.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
};
