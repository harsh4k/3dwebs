// 📖 Docs: obsidian/frontend/components/common.md

import { ShaderMaterial } from "three";
import type { Texture, WebGLRenderer, WebGLRenderTarget } from "three";
import { FullScreenQuad, Pass } from "three/examples/jsm/postprocessing/Pass.js";

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * A **screen-space wipe** between two pre-rendered views (`tWave`, `tTree`). A tilted line
 * sweeps **bottom-up** across the frame; below it the tree view is shown, above it the wave view —
 * so the tree scene is revealed *over* the (stationary) wave, like a film wipe. The edge is a
 * **clean anti-aliased cut** (no bright seam). Each layer is sampled with its own vertical
 * offset (`uWaveShift`/`uTreeShift`) so the two can drift at different speeds — a **parallax**
 * during the transition. Both inputs are HDR (HalfFloat), so the downstream bloom still keys off
 * the glowing beads on either side. The cut itself is a **clean anti-aliased edge — no bright seam
 * or scan band** on the contour (an earlier glow band read as a hard white gradient on the line).
 *
 * `uWipe` is the line's position in the tilted screen coordinate `vUv.y + (vUv.x − 0.5)·uTilt`;
 * drive it from below 0 (all wave) to above 1 (all tree).
 */
export class WipePass extends Pass {
  readonly material: ShaderMaterial;
  private readonly fsQuad: FullScreenQuad;

  constructor(tilt: number) {
    super();
    this.material = new ShaderMaterial({
      uniforms: {
        tWave: { value: null },
        tTree: { value: null },
        uWipe: { value: 0 },
        uTilt: { value: tilt },
        uAA: { value: 0.0016 },
        uWaveShift: { value: 0 },
        uTreeShift: { value: 0 },
      },
      vertexShader: VERTEX,
      fragmentShader: /* glsl */ `
        uniform sampler2D tWave;
        uniform sampler2D tTree;
        uniform float uWipe;
        uniform float uTilt;
        uniform float uAA;
        uniform float uWaveShift;
        uniform float uTreeShift;
        varying vec2 vUv;
        void main() {
          // Tilted, bottom-up sweep line. Below it (smaller coord) → the tree is revealed.
          // A tiny smoothstep anti-aliases the cut — a clean edge, no bright seam or scan band.
          float lineC = vUv.y + (vUv.x - 0.5) * uTilt;
          float m = 1.0 - smoothstep(uWipe - uAA, uWipe + uAA, lineC);
          // Each layer drifts vertically at its own rate → parallax.
          vec3 waveC = texture2D(tWave, vUv + vec2(0.0, uWaveShift)).rgb;
          vec3 treeC = texture2D(tTree, vUv + vec2(0.0, uTreeShift)).rgb;
          gl_FragColor = vec4(mix(waveC, treeC, m), 1.0);
        }
      `,
    });
    this.fsQuad = new FullScreenQuad(this.material);
  }

  /** Feed the two view textures, the sweep position, and the per-layer parallax shifts. */
  setViews(wave: Texture, tree: Texture, wipe: number, waveShift: number, treeShift: number): void {
    this.material.uniforms.tWave.value = wave;
    this.material.uniforms.tTree.value = tree;
    this.material.uniforms.uWipe.value = wipe;
    this.material.uniforms.uWaveShift.value = waveShift;
    this.material.uniforms.uTreeShift.value = treeShift;
  }

  render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget): void {
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    this.fsQuad.render(renderer);
  }

  dispose(): void {
    this.material.dispose();
    this.fsQuad.dispose();
  }
}
