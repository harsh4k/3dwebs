/**
 * The palette, as CSS custom properties.
 *
 * The site keeps its tokens in `src/styles/tokens.css` and its scene colours in
 * `scene.config.ts`, because three.js materials cannot read CSS variables — two files that must
 * be changed together. This package removes that duplication for the host page: the tokens are
 * *derived* from `sceneConfig`, so the page ground and the WebGL ground can never drift apart.
 *
 * Call `injectPalette()` once, or read `paletteTokens` and write your own stylesheet.
 *
 * `--heat` is never body text: it measures 3.86:1 on `--paper`, which is AA-large only.
 * Display type 30px and up, fills, rules and indicators — nothing smaller.
 */

import { sceneConfig } from "./scene/scene.config";

/** Custom-property name → value. Grounds and ink come from the scene so the two agree. */
export const paletteTokens: Record<string, string> = {
  "--paper": sceneConfig.colors.backdropTop,
  "--cream": sceneConfig.colors.fog,
  "--peach": sceneConfig.pointer.color,
  "--orange": sceneConfig.bloomParticles.color,
  "--ink": sceneConfig.colors.particle,
  // Roles.
  "--ground": sceneConfig.colors.backdropTop,
  "--background": sceneConfig.colors.backdropTop,
  "--foreground": sceneConfig.colors.particle,
  // The colour behind the canvas — the scene's fog, so the page and the scene share one ground.
  "--scene-backdrop": sceneConfig.colors.fog,
};

/** Writes the tokens onto `target` (the document root by default). Returns the element. */
export const injectPalette = (target: HTMLElement | null = null): HTMLElement => {
  const element = target ?? document.documentElement;
  for (const [name, value] of Object.entries(paletteTokens)) {
    element.style.setProperty(name, value);
  }
  return element;
};
