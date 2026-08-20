// 📖 Docs: obsidian/frontend/components/common.md

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
} from "three";

import { createRandom } from "./random";
import type { MotesConfig } from "./scene.config";

export interface RisingMotes {
  points: Points<BufferGeometry, ShaderMaterial>;
  /** Per-frame: one uniform write — the whole life cycle runs in the vertex shader. */
  update: (time: number) => void;
  /** Keep the point-size attenuation correct when the drawing buffer resizes. */
  resize: (drawingBufferHeight: number) => void;
}

/** Each mote's whole loop lives in the vertex shader off `uTime`: it climbs its `uRise` span from
 *  its seeded base, sways a little, and its alpha ramps in over the first ~fifth of the climb and
 *  dissolves before the top — so a mote never pops in or out, it *appears* and *evaporates*. */
const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uRise;
  uniform float uSize;
  uniform float uScale;
  // x: phase [0,1), y: speed (cycles/s), z: sway amplitude, w: size jitter.
  attribute vec4 aSeed;
  varying float vFade;
  void main() {
    float t = fract(aSeed.x + uTime * aSeed.y);
    vec3 p = position;
    p.y += t * uRise;
    p.x += sin(uTime * 0.5 + aSeed.x * 41.0) * aSeed.z;
    p.z += cos(uTime * 0.42 + aSeed.x * 57.0) * aSeed.z;
    vFade = smoothstep(0.0, 0.18, t) * (1.0 - smoothstep(0.6, 0.95, t));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aSeed.w * (uScale / -mv.z);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    float a = smoothstep(0.5, 0.1, length(gl_PointCoord - 0.5));
    if (a < 0.02) discard;
    gl_FragColor = vec4(uColor, a * vFade * uOpacity);
  }
`;

/**
 * Sparse accent motes that **float up and dissolve** — the depth cue over the wave "terrain" and
 * the fireflies around the finale tree. Additive, tinted with the shared bloom-particle accent, and
 * **fully GPU-driven**: the CPU cost per frame is a single `uTime` uniform write, so they add life
 * without touching the frame budget (unlike the dust, whose drift is a per-mote CPU loop).
 */
export const createRisingMotes = (config: MotesConfig): RisingMotes => {
  const random = createRandom(config.seed);
  const count = config.count;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = config.center[0] + (random() * 2 - 1) * config.spreadX;
    positions[i * 3 + 1] = config.center[1];
    positions[i * 3 + 2] = config.center[2] + (random() * 2 - 1) * config.spreadZ;
    seeds[i * 4] = random();
    seeds[i * 4 + 1] = config.speed[0] + random() * (config.speed[1] - config.speed[0]);
    seeds[i * 4 + 2] = config.sway * (0.5 + random());
    seeds[i * 4 + 3] = 0.6 + random() * 0.8;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 4));

  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uRise: { value: config.rise },
      uSize: { value: config.size },
      uScale: { value: 500 },
      uColor: { value: new Color(config.color) },
      uOpacity: { value: config.opacity },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  const points = new Points(geometry, material);
  // The shader moves motes off their buffered base positions, so the static bounding sphere
  // would cull the whole system once the base box leaves the frustum.
  points.frustumCulled = false;

  return {
    points,
    update: (time: number): void => {
      material.uniforms.uTime.value = time;
    },
    resize: (drawingBufferHeight: number): void => {
      material.uniforms.uScale.value = drawingBufferHeight * 0.5;
    },
  };
};
