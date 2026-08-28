/**
 * Public entry point.
 *
 * ```ts
 * import { mountCoffeeBackground } from "coffee-background";
 *
 * const bg = mountCoffeeBackground(document.getElementById("bg")!);
 * // later
 * bg.destroy();
 * ```
 *
 * No assets, no fetches — the whole background is generated at runtime.
 */

export { mountCoffeeBackground } from "./background";
export type { BackgroundHandle } from "./background";
export { defaultOptions } from "./options";
export type { BackgroundOptions } from "./options";
export { injectPalette, paletteTokens } from "./palette";
export { sceneConfig } from "./scene/scene.config";
export type { SceneConfig, SceneColors } from "./scene/scene.config";
