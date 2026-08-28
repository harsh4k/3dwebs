/**
 * Public options for `mountCoffeeBackground`.
 *
 * Every default here is lifted from the site's `scene.config.ts` — the same numbers that ship on
 * coffeedigital's home page, minus the figures and the scroll choreography. Change a value and
 * you change the look; there are no magic numbers anywhere else in this package.
 */

import { sceneConfig } from "./scene/scene.config";
import type { SceneColors } from "./scene/scene.config";

export interface BackgroundOptions {
  /**
   * The palette. Defaults are the locked Coffee Digital tokens: the room's gradient runs
   * paper → cream, the dust is ink, and the fog matches the gradient's bottom stop so the
   * horizon never seams. Set all five to recolour the room wholesale.
   */
  colors: Partial<SceneColors>;
  /** The one accent in the scene — the colour of the rising motes, and the only thing that blooms. */
  accent: string;
  /** Airborne dust motes. `0` disables the layer. */
  dustCount: number;
  /** Multiplier on dust mote size. Past ~2 they read as blobs rather than fine air. */
  dustSize: number;
  /**
   * Time multiplier on the dust drift. `1` is the site's rate — a float of 0.03–0.12 units/s
   * through a 34-unit column, slow enough that a still camera reads it as hanging air rather than
   * as motion. `0` freezes the motes exactly where they were seeded.
   */
  dustDrift: number;
  /** Rising accent motes. `0` disables the layer. */
  moteCount: number;
  /**
   * Film grain over the canvas — a tiled SVG noise at `mix-blend-mode: overlay`. This is what
   * breaks up 8-bit banding across the gradient; without it a very smooth cream ramp posterises
   * into visible steps on most displays. `0` removes the layer.
   */
  grain: number;
  /**
   * Warm light leaks over the canvas — raking shafts and a corner glint, drawn with CSS
   * gradients (the site paints these from WebP flares; this package fetches nothing). `0` removes
   * the layer.
   */
  lightLeak: number;
  /** Camera field of view, degrees. */
  fov: number;
  /** Camera position and look-at, in world units. */
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  /**
   * World units of slow autonomous camera drift. **Defaults to `0`** — the site's hero camera is
   * locked until scroll takes it, and any camera motion slides the whole dust field across the
   * frame, which reads as the motes racing. Their own drift is glacial by design.
   */
  drift: number;
  /** World units the camera eases toward the cursor. `0` disables the pointer listener entirely. */
  parallax: number;
  /** Selective additive bloom. The threshold sits above the dust, so only the accent motes glow. */
  bloom: { threshold: number; strength: number; radius: number };
  vignette: { offset: number; darkness: number };
  /**
   * ACES filmic tone-mapping exposure. The site runs `1`; this package defaults slightly under,
   * because the site's frame is a third dark beads and lattice and this one is bare room — at
   * equal exposure the empty version reads a stop brighter than the page it was lifted from.
   */
  exposure: number;
  /** Fog distances — motes dissolve into `colors.fog` between them. */
  fog: { near: number; far: number };
  /**
   * `"auto"` follows the device tier: DPR clamp, particle counts, bloom scale, the frame budget
   * and whether the pointer is listened to at all derive from it. `"low"` forces the mobile tier
   * on any device — useful behind heavy page content.
   */
  quality: "auto" | "low";
  /**
   * `"auto"` honours `prefers-reduced-motion`: the room still builds and renders in full, it
   * simply holds still instead of being switched off. Nothing is hidden by animation, so the
   * reduced scene is the complete scene.
   */
  motion: "auto" | "always";
  /** Pause rendering while the container is scrolled out of view. */
  pauseOffscreen: boolean;
}

const c = sceneConfig;

export const defaultOptions: BackgroundOptions = {
  colors: c.colors,
  accent: c.bloomParticles.color,
  dustCount: c.dust.count,
  dustSize: 1,
  dustDrift: 1,
  moteCount: 150,
  grain: 1,
  lightLeak: 0.5,
  fov: c.camera.fov,
  // The site's opening pose, verbatim, and held still like the site holds it at scroll 0.
  cameraPosition: [0, 12, 50],
  cameraTarget: [0, 10, 0],
  drift: 0,
  parallax: 0,
  bloom: { ...c.bloom },
  vignette: { ...c.vignette },
  exposure: c.exposure * 0.94,
  fog: { ...c.fog },
  quality: "auto",
  motion: "auto",
  pauseOffscreen: true,
};

/** One level of merge per group — enough for a flat options object, no surprises. */
export const resolveOptions = (input: Partial<BackgroundOptions> = {}): BackgroundOptions => ({
  ...defaultOptions,
  ...input,
  colors: { ...defaultOptions.colors, ...input.colors },
  bloom: { ...defaultOptions.bloom, ...input.bloom },
  vignette: { ...defaultOptions.vignette, ...input.vignette },
  fog: { ...defaultOptions.fog, ...input.fog },
});
