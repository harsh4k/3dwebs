import {
  Camera,
  Color,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";

import { FOG_FRAG, FOG_VERT } from "./fog-shader";

/**
 * The WebGL smoke behind the footer.
 *
 * **three.js rather than a second raw WebGL path.** The reference runs this on a bare
 * `getContext('webgl')` because three is not otherwise on its footer. Here it already is — the
 * Auralis scene and Design in Motion both pull it on `/`, and this footer only ever mounts on `/`
 * — so a hand-rolled context would be a second way of doing the same thing for no saving. This is
 * a few dozen lines against a few hundred.
 *
 * **The colours come from the token file at runtime.** `getComputedStyle` resolves each custom
 * property and `Color` parses it, so the fog is inside the brand lock, no hex appears in this
 * directory, and re-theming the site re-themes the smoke.
 *
 * **It costs nothing off-screen.** The caller gates `render` behind an `IntersectionObserver`, so
 * a reader who never reaches the bottom of the page never pays for any of it.
 */

/** Resting churn rate. The fog always moves a little, even untouched. */
const BASE_RATE = 4;
/** How much a pluck adds to the churn rate, scaled by the current pulse. */
const PULSE_RATE = 2.8;
/** Pulse decay per second-ish, applied per frame at 60fps equivalence. */
const PULSE_DECAY = 0.9;

const readColor = (token: string, into: Color): Color => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  /* An unresolvable token leaves the colour at its initial value rather than throwing — the fog
     degrades to something plainly wrong instead of taking the page down with it. */
  if (value) {
    try {
      into.set(value);
    } catch {
      /* ignore — keep the initial value */
    }
  }
  return into;
};

export interface FooterFog {
  /** Add to the smoke pulse. Hover is a nudge, click is a shove. */
  pulse: (amount: number) => void;
  /** Advance and draw one frame. `dt` in seconds. */
  render: (dt: number) => void;
  resize: () => void;
  dispose: () => void;
}

export const createFooterFog = (canvas: HTMLCanvasElement): FooterFog => {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setClearAlpha(0);

  const material = new ShaderMaterial({
    uniforms: {
      uResolution: { value: new Vector2(1, 1) },
      uMorph: { value: 0 },
      uPulse: { value: 0 },
      uBase: { value: readColor("--ink", new Color()) },
      uMid: { value: readColor("--ink-muted", new Color()) },
      uHigh: { value: readColor("--peach", new Color()) },
      uTint: { value: readColor("--heat", new Color()) },
    },
    vertexShader: FOG_VERT,
    fragmentShader: FOG_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  /* The vertex stage writes clip space directly, so the quad needs no camera transform — but
     `render` still wants a camera object, and a bare one is the cheapest thing that satisfies it. */
  const mesh = new Mesh(new PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  const camera = new Camera();

  let pulseValue = 0;
  let morph = 0;

  const resize = (): void => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    /* Capped at 1.5 rather than 2: this is a soft, low-frequency field with no edges to alias, so
       the extra pixels buy nothing visible and cost real fill rate on a phone. */
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height, false);
    (material.uniforms.uResolution.value as Vector2).set(width, height);
  };

  const render = (dt: number): void => {
    /* The pulse bleeds off geometrically, framed per-60fps-step so the decay is the same however
       fast the display runs. */
    pulseValue *= Math.pow(PULSE_DECAY, 60 * dt);
    if (pulseValue < 1e-4) pulseValue = 0;

    /* Morph is an accumulator whose *rate* responds to play — so a run of plucks keeps the smoke
       moving rather than making it flash and stop. */
    morph += (BASE_RATE + PULSE_RATE * pulseValue) * dt;

    material.uniforms.uMorph.value = morph;
    material.uniforms.uPulse.value = pulseValue;
    renderer.render(mesh, camera);
  };

  const pulse = (amount: number): void => {
    pulseValue = Math.min(1, pulseValue + amount);
  };

  const dispose = (): void => {
    mesh.geometry.dispose();
    material.dispose();
    renderer.dispose();
  };

  resize();
  return { pulse, render, resize, dispose };
};
