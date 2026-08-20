// 📖 Docs: obsidian/frontend/components/common.md

import { BufferAttribute, BufferGeometry, Color, Points, ShaderMaterial } from "three";

import { createRandom } from "./random";
import type { DustConfig } from "./scene.config";

export interface Dust {
  points: Points<BufferGeometry, ShaderMaterial>;
  /** Per-frame drift — floats the motes up and sways them, so the air feels alive. */
  update: (time: number) => void;
  /** Keep the point-size attenuation correct when the drawing buffer resizes. */
  resize: (drawingBufferHeight: number) => void;
}

/** Soft round mote with a **chromatic-dispersion** fringe: the R/G/B channels are
 *  sampled at a small diagonal offset, so each mote splits light like a tiny prism —
 *  a warm edge on one side, a cool edge on the other. Plus linear fog so far motes fade. */
const VERTEX = /* glsl */ `
  uniform float uSize;
  uniform float uScale;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (uScale / -mv.z);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uDispersion;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vDepth;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    vec2 off = vec2(uDispersion, -uDispersion);
    float aR = smoothstep(0.5, 0.08, length(uv + off));
    float aG = smoothstep(0.5, 0.08, length(uv));
    float aB = smoothstep(0.5, 0.08, length(uv - off));
    float a = max(aR, max(aG, aB));
    if (a < 0.02) discard;
    vec3 col = uColor * vec3(aR, aG, aB);
    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    col = mix(col, uFogColor, fog);
    gl_FragColor = vec4(col, a * uOpacity * (1.0 - fog * 0.6));
  }
`;

/**
 * Builds the airborne dust motes. They give the empty air a sense of scale and depth —
 * without them the fog reads as a flat backdrop rather than a volume the glyph sits in.
 * The motes are **round** with a **chromatic-dispersion** fringe (a custom point shader)
 * and **drift** continuously (float up + sway) via `update`.
 */
export const createDust = (
  config: DustConfig,
  color: string,
  fog: { color: string; near: number; far: number },
): Dust => {
  const random = createRandom(config.seed);
  const count = config.count;
  // `home` is the static rest position; `positions` is the live buffer (they must be
  // separate arrays, or `live = live + sway` accumulates and flings the motes to infinity).
  const home = new Float32Array(count * 3);
  const positions = new Float32Array(count * 3);
  const rise = new Float32Array(count);
  const swayPhase = new Float32Array(count);
  const swayAmp = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    home[i * 3] = (random() * 2 - 1) * config.spread;
    home[i * 3 + 1] = random() * config.height;
    home[i * 3 + 2] = (random() * 2 - 1) * config.spread;
    positions.set(home.subarray(i * 3, i * 3 + 3), i * 3);
    // Very slow float + sway — super-smooth drift that adds depth, never fast.
    rise[i] = 0.03 + random() * 0.09;
    swayPhase[i] = random() * Math.PI * 2;
    swayAmp[i] = 0.3 + random() * 0.9;
  }

  const geometry = new BufferGeometry();
  const positionAttr = new BufferAttribute(positions, 3);
  geometry.setAttribute("position", positionAttr);

  const material = new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(color) },
      uOpacity: { value: config.opacity },
      uSize: { value: config.size },
      uScale: { value: 500 },
      uDispersion: { value: config.dispersion },
      uFogColor: { value: new Color(fog.color) },
      uFogNear: { value: fog.near },
      uFogFar: { value: fog.far },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
  });

  const points = new Points(geometry, material);

  const update = (time: number): void => {
    for (let i = 0; i < count; i += 1) {
      // Float up from the static home and recycle; a gentle sine sway in X and Z.
      let y = (home[i * 3 + 1] + time * rise[i]) % config.height;
      if (y < 0) y += config.height;
      positions[i * 3] = home[i * 3] + Math.sin(time * 0.08 + swayPhase[i]) * swayAmp[i];
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = home[i * 3 + 2] + Math.cos(time * 0.065 + swayPhase[i]) * swayAmp[i];
    }
    positionAttr.needsUpdate = true;
  };

  const resize = (drawingBufferHeight: number): void => {
    material.uniforms.uScale.value = drawingBufferHeight * 0.5;
  };

  return { points, update, resize };
};
