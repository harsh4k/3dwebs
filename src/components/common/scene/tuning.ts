// 📖 Docs: obsidian/frontend/components/common.md
import { sceneConfig } from "./scene.config";

/**
 * **Live, mutable tuning values** for the pink bloom particles — a tiny shared store the scene reads
 * **every frame** and the `TuningPanel` (a dev control panel) writes. Seeded from `sceneConfig` so the
 * defaults match the committed look; edits are runtime-only (not persisted). See
 * [[design-system]] / the `bloomParticles` + `bloom` config for what these drive.
 */
export const tuning = {
  /** The particle **bloom pass** (see `BloomPass`). */
  bloom: {
    threshold: sceneConfig.bloom.threshold,
    strength: sceneConfig.bloom.strength,
    radius: sceneConfig.bloom.radius,
  },
  /** The **pink bloom particles'** emissive colour + strength (scatter burst / vortex / hand scan). */
  pink: {
    color: sceneConfig.bloomParticles.color,
    glow: sceneConfig.bloomParticles.glow,
  },
};
