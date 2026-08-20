// 📖 Docs: obsidian/frontend/components/common.md

import {
  Color,
  DataTexture,
  FloatType,
  InstancedBufferAttribute,
  NearestFilter,
  RGBAFormat,
  ShaderMaterial,
  Vector3,
  WebGLRenderTarget,
  HalfFloatType,
} from "three";
import type { Texture, WebGLRenderer } from "three";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";

import type { PointerConfig } from "./scene.config";

/**
 * **Cursor repulsion with memory, for clouds too heavy to simulate on the CPU.**
 *
 * `updateCloud`'s hover isn't a formula — it's a *simulation*. Each bead eases toward
 * `rest + push(cursor)` at `relax` while the cursor is on it and drifts back at the much slower
 * `returnRelax` once it leaves, so beads flow out of the way and then ooze back. That per-particle
 * memory is the entire feel of the effect, and a stateless shader can't have it: evaluating the push
 * analytically every frame gives a rigid hole welded to the cursor, which is what the tree had.
 *
 * So the state lives in a **ping-pong float texture** — one texel per bead, `xyz` = its current
 * world displacement, `w` = its current heat (the violet emissive) — advanced by one fullscreen pass
 * per frame. The law in that pass is `updateCloud`'s, line for line; only the substrate differs.
 * At the tree's ~150k that pass is a 388×388 draw (trivial), against a ~90 ms JS block and a 9.6 MB
 * matrix re-upload for the CPU path.
 *
 * The cloud's vertex shader then samples the texture through a per-instance `aRelaxUv` attribute.
 * See [[decisions-log]] ADR-0036.
 */

/** One texel per instance, in the smallest square that fits them. */
const textureSize = (count: number): number => Math.ceil(Math.sqrt(count));

/**
 * The `aRelaxUv` attribute — each instance's texel centre in the state texture.
 *
 * **Built by `buildParticleCloud`, not here**, and unconditionally for any cloud that opts into
 * `pointerRelax`. The shader variant declares `aRelaxUv` the moment the option is set, so deriving
 * the attribute from anything else (whether a simulator was created, whether the device has a
 * pointer, when an async loader resolved) lets the two disagree — and a vertex shader reading a
 * missing attribute doesn't fail, it silently reads zero and the hover is simply dead.
 */
export const createRelaxUv = (count: number): InstancedBufferAttribute => {
  const size = textureSize(count);
  const data = new Float32Array(count * 2);
  for (let i = 0; i < count; i += 1) {
    // Texel centres: sampled with NearestFilter, but centring keeps it exact under any driver
    // rounding.
    data[i * 2] = ((i % size) + 0.5) / size;
    data[i * 2 + 1] = (Math.floor(i / size) + 0.5) / size;
  }
  return new InstancedBufferAttribute(data, 2);
};

export interface PointerRelax {
  /** Advance the simulation one frame. `pointer` is the cursor in **world** space, or `null`
   *  when it's away — which is not "freeze", it's "everything returns". */
  step: (renderer: WebGLRenderer, pointer: Vector3 | null) => void;
  /** `?debug` only: read the state back off the GPU. This simulation is the one part of the scene
   *  with no DOM and no CPU-side mirror, so without a readback there is no way to tell a working
   *  hover from a dead one except by eye. Costly (a stall) — never call it in a frame loop. */
  debugStats: (renderer: WebGLRenderer) => { maxDisplacement: number; maxHeat: number };
  dispose: () => void;
}

/** IEEE 754 half → float, for reading back a `HalfFloatType` target. */
const fromHalf = (h: number): number => {
  const sign = (h & 0x8000) === 0 ? 1 : -1;
  const exponent = (h & 0x7c00) >> 10;
  const fraction = h & 0x03ff;
  if (exponent === 0) return sign * 2 ** -14 * (fraction / 1024);
  if (exponent === 0x1f) return fraction === 0 ? sign * Infinity : NaN;
  return sign * 2 ** (exponent - 15) * (1 + fraction / 1024);
};

/**
 * @param basePositions Rest position of every bead in **world** space (xyz per instance) — the same
 *   array `updateCloud` measures from, so both paths agree on where a bead lives.
 * @param config The shared `pointer` config; the radius/strength/relax values are read live, so
 *   tuning them at runtime works exactly as it does for the CPU clouds.
 * @param uniform The material's `uRelaxMap` uniform. The simulator writes the current read-side
 *   texture into it after every step, so ping-pong stays an implementation detail.
 */
export const createPointerRelax = (
  basePositions: Float32Array,
  config: PointerConfig,
  uniform: { value: Texture | null },
): PointerRelax => {
  const count = Math.floor(basePositions.length / 3);
  const size = textureSize(count);
  const texels = size * size;

  // Rest positions, uploaded once. Full float: these are world coordinates in the tens, and the
  // displacement is compared against them — half precision would quantise the influence ramp.
  const positionData = new Float32Array(texels * 4);
  for (let i = 0; i < count; i += 1) {
    positionData[i * 4] = basePositions[i * 3];
    positionData[i * 4 + 1] = basePositions[i * 3 + 1];
    positionData[i * 4 + 2] = basePositions[i * 3 + 2];
  }
  const positions = new DataTexture(positionData, size, size, RGBAFormat, FloatType);
  positions.minFilter = NearestFilter;
  positions.magFilter = NearestFilter;
  positions.needsUpdate = true;

  // Half float is plenty for a displacement bounded by `strength` (6 units) and a heat in [0,1],
  // and unlike full float it is a guaranteed-renderable format everywhere WebGL2 is.
  const targetOptions = {
    type: HalfFloatType,
    format: RGBAFormat,
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  };
  let read = new WebGLRenderTarget(size, size, targetOptions);
  let write = new WebGLRenderTarget(size, size, targetOptions);

  const material = new ShaderMaterial({
    uniforms: {
      tPos: { value: positions },
      tPrev: { value: null as Texture | null },
      uPointer: { value: new Vector3() },
      uRadius: { value: config.radius },
      uStrength: { value: config.strength },
      uRelax: { value: config.relax },
      uReturn: { value: config.returnRelax },
      // 0 while the cursor is away: influence goes to zero everywhere, so every bead is on the
      // slow return ramp — the same thing `pointer === null` does in `updateCloud`.
      uGate: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tPos;
      uniform sampler2D tPrev;
      uniform vec3 uPointer;
      uniform float uRadius;
      uniform float uStrength;
      uniform float uRelax;
      uniform float uReturn;
      uniform float uGate;
      varying vec2 vUv;
      void main() {
        vec3 rest = texture2D(tPos, vUv).xyz;
        vec4 prev = texture2D(tPrev, vUv);
        // updateCloud, verbatim: influence = 1 - d/radius inside the radius, displacement
        // influence^2 * strength along the outward radial, heat = influence^2.
        vec3 toC = rest - uPointer;
        float d = length(toC);
        float inf = d < uRadius ? (1.0 - d / uRadius) * uGate : 0.0;
        vec3 target = toC * ((inf * inf * uStrength) / max(d, 1e-4));
        // ...and its easing: fast while the cursor is on the bead, much slower on the way back.
        // mix(a, b, t) IS a += (b - a) * t.
        float ease = inf > 0.0 ? uRelax : uReturn;
        gl_FragColor = vec4(mix(prev.xyz, target, ease), mix(prev.w, inf * inf, ease));
      }
    `,
  });
  const quad = new FullScreenQuad(material);

  // The first read is from an untouched render target, whose contents are undefined. Clear both
  // once, on the first step, when a renderer is finally in hand.
  let cleared = false;
  const clearColor = new Color();

  const step = (renderer: WebGLRenderer, pointer: Vector3 | null): void => {
    const previousTarget = renderer.getRenderTarget();
    if (!cleared) {
      cleared = true;
      // Restore **colour and alpha**: `setClearColor` writes both, so restoring only the alpha
      // leaves the renderer clearing black for the rest of the session.
      const previousColor = renderer.getClearColor(clearColor).getHex();
      const previousAlpha = renderer.getClearAlpha();
      renderer.setClearColor(0x000000, 0);
      for (const target of [read, write]) {
        renderer.setRenderTarget(target);
        renderer.clear(true, false, false);
      }
      renderer.setClearColor(previousColor, previousAlpha);
    }

    material.uniforms.uRadius.value = config.radius;
    material.uniforms.uStrength.value = config.strength;
    material.uniforms.uRelax.value = config.relax;
    material.uniforms.uReturn.value = config.returnRelax;
    material.uniforms.uGate.value = pointer ? 1 : 0;
    if (pointer) material.uniforms.uPointer.value.copy(pointer);
    material.uniforms.tPrev.value = read.texture;

    renderer.setRenderTarget(write);
    quad.render(renderer);
    renderer.setRenderTarget(previousTarget);

    const swap = read;
    read = write;
    write = swap;
    uniform.value = read.texture;
  };

  const debugStats = (renderer: WebGLRenderer): { maxDisplacement: number; maxHeat: number } => {
    const buffer = new Uint16Array(texels * 4);
    renderer.readRenderTargetPixels(read, 0, 0, size, size, buffer);
    let maxDisplacement = 0;
    let maxHeat = 0;
    for (let i = 0; i < texels; i += 1) {
      const x = fromHalf(buffer[i * 4]);
      const y = fromHalf(buffer[i * 4 + 1]);
      const z = fromHalf(buffer[i * 4 + 2]);
      const heat = fromHalf(buffer[i * 4 + 3]);
      const length = Math.hypot(x, y, z);
      if (length > maxDisplacement) maxDisplacement = length;
      if (heat > maxHeat) maxHeat = heat;
    }
    return { maxDisplacement, maxHeat };
  };

  const dispose = (): void => {
    positions.dispose();
    read.dispose();
    write.dispose();
    material.dispose();
    quad.dispose();
  };

  return { step, debugStats, dispose };
};
