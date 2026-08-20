// 📖 Docs: obsidian/frontend/components/common.md

import { ShaderMaterial, Vector2, WebGLRenderTarget } from "three";
import type { WebGLRenderer } from "three";
import { FullScreenQuad, Pass } from "three/examples/jsm/postprocessing/Pass.js";

import type { BloomConfig } from "./scene.config";

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Keep only pixels brighter than `threshold` (soft knee) — the bloom seed. */
const brightMaterial = () =>
  new ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, threshold: { value: 0.7 }, knee: { value: 0.05 } },
    vertexShader: VERTEX,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse; uniform float threshold; uniform float knee; varying vec2 vUv;
      void main() {
        vec4 c = texture2D(tDiffuse, vUv);
        float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
        float s = smoothstep(threshold, threshold + knee, l);
        gl_FragColor = vec4(c.rgb * s, 1.0);
      }
    `,
  });

/** Separable 9-tap Gaussian; `direction` carries the radius in pixels. */
const blurMaterial = () =>
  new ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, direction: { value: new Vector2() }, resolution: { value: new Vector2() } },
    vertexShader: VERTEX,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse; uniform vec2 direction; uniform vec2 resolution; varying vec2 vUv;
      void main() {
        vec2 px = direction / resolution;
        vec4 sum = texture2D(tDiffuse, vUv) * 0.227027;
        sum += texture2D(tDiffuse, vUv + px * 1.3846) * 0.316216;
        sum += texture2D(tDiffuse, vUv - px * 1.3846) * 0.316216;
        sum += texture2D(tDiffuse, vUv + px * 3.2308) * 0.070270;
        sum += texture2D(tDiffuse, vUv - px * 3.2308) * 0.070270;
        gl_FragColor = sum;
      }
    `,
  });

/** Additively composite the blurred bloom back over the sharp scene. */
const combineMaterial = () =>
  new ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, tBloom: { value: null }, strength: { value: 1 } },
    vertexShader: VERTEX,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse; uniform sampler2D tBloom; uniform float strength; varying vec2 vUv;
      void main() {
        vec4 base = texture2D(tDiffuse, vUv);
        vec3 bloom = texture2D(tBloom, vUv).rgb;
        gl_FragColor = vec4(base.rgb + bloom * strength, base.a);
      }
    `,
  });

/**
 * A **custom additive bloom** — a stand-in for `UnrealBloomPass`, which renders fully
 * black in this WebGL environment (see [[decisions-log]] ADR-0015). Bright pixels are
 * thresholded, blurred at half-resolution (a couple of separable-Gaussian iterations),
 * and added back over the sharp frame. The additive halo makes the white particles
 * **bloom** and softens them (a slight blur) without a fragile mip-chain / HalfFloat
 * target — it uses ordinary render targets, which the composer already proves work.
 */
export class BloomPass extends Pass {
  private readonly rtA: WebGLRenderTarget;
  private readonly rtB: WebGLRenderTarget;
  private readonly bright = brightMaterial();
  private readonly blur = blurMaterial();
  private readonly combine = combineMaterial();
  private readonly quad = new FullScreenQuad();
  private radius: number;

  constructor(config: BloomConfig) {
    super();
    this.rtA = new WebGLRenderTarget(1, 1, { depthBuffer: false });
    this.rtB = new WebGLRenderTarget(1, 1, { depthBuffer: false });
    this.radius = config.radius;
    this.setConfig(config);
  }

  /** Live-update the bloom look (threshold / strength / blur radius) — used by the dev tuning panel. */
  setConfig(config: BloomConfig): void {
    this.bright.uniforms.threshold.value = config.threshold;
    this.combine.uniforms.strength.value = config.strength;
    this.radius = config.radius;
  }

  /** Current combine strength — the scene reads it to skip the pass when it would add nothing. */
  get strengthValue(): number {
    return this.combine.uniforms.strength.value as number;
  }

  setSize(width: number, height: number): void {
    const w = Math.max(1, Math.floor(width / 2));
    const h = Math.max(1, Math.floor(height / 2));
    this.rtA.setSize(w, h);
    this.rtB.setSize(w, h);
    this.blur.uniforms.resolution.value.set(w, h);
  }

  render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget): void {
    // 1. Bright-pass the scene into rtA (half res).
    this.bright.uniforms.tDiffuse.value = readBuffer.texture;
    this.quad.material = this.bright;
    renderer.setRenderTarget(this.rtA);
    this.quad.render(renderer);

    // 2. Two separable-blur iterations (H then V) for a wide, soft halo.
    this.quad.material = this.blur;
    for (let i = 0; i < 2; i += 1) {
      const r = this.radius * (i + 1);
      this.blur.uniforms.tDiffuse.value = this.rtA.texture;
      this.blur.uniforms.direction.value.set(r, 0);
      renderer.setRenderTarget(this.rtB);
      this.quad.render(renderer);
      this.blur.uniforms.tDiffuse.value = this.rtB.texture;
      this.blur.uniforms.direction.value.set(0, r);
      renderer.setRenderTarget(this.rtA);
      this.quad.render(renderer);
    }

    // 3. Additively combine over the sharp frame.
    this.combine.uniforms.tDiffuse.value = readBuffer.texture;
    this.combine.uniforms.tBloom.value = this.rtA.texture;
    this.quad.material = this.combine;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    this.quad.render(renderer);
  }

  dispose(): void {
    this.rtA.dispose();
    this.rtB.dispose();
    this.bright.dispose();
    this.blur.dispose();
    this.combine.dispose();
    this.quad.dispose();
  }
}
