// 📖 Docs: obsidian/frontend/components/common.md

import { sceneConfig } from "./scene.config";

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

export interface WipeLine {
  /** The line's `y` at the viewport's left edge, in % of viewport height. */
  left: number;
  /** The line's `y` at the viewport's right edge, in % of viewport height. */
  right: number;
}

/**
 * Where the **tree wipe line** sits on screen at a given scroll progress — the tilted line `WipePass`
 * sweeps to reveal the tree over the wave, expressed as its `y` (in % of viewport height) at the
 * viewport's left and right edges, so any `x` can be lerped between them. Values above `100` mean the
 * line is still below the screen (nothing cut yet); below `0` means it has passed off the top
 * (everything cut).
 *
 * Mirrors the shader: `lineC = vUv.y + (vUv.x − 0.5)·wipeTilt`, `uWipe = −0.3 + w·1.6`.
 *
 * **A pure function of progress, deliberately — not a shared mutable value.** `HeroLights` (which
 * masks its flares to this line) and `WaveOverlay` (which clips its elements to it) both need it every
 * frame from *separate* rAF loops. Passing it through a store made one a writer and the other a
 * reader, so the reader could run first and use the **previous frame's** line — a one-frame skew that
 * shows up as a visible glitch at the wipe boundary. Deriving it independently from the shared,
 * frame-memoised `getScrollProgress()` makes both sides compute the *same* value in the same frame
 * with no ordering dependency at all.
 */
export const wipeLineAt = (progress: number): WipeLine => {
  const { wipeRange, wipeTilt } = sceneConfig.sequence;
  const w = clamp01((progress - wipeRange[0]) / (wipeRange[1] - wipeRange[0]));
  const uWipe = -0.3 + w * 1.6;
  return {
    left: (1 - uWipe - 0.5 * wipeTilt) * 100,
    right: (1 - uWipe + 0.5 * wipeTilt) * 100,
  };
};

/**
 * How far the **wave view drifts down** during the wipe, in % of viewport height.
 *
 * `WipePass` samples the wave layer at `vUv + (0, wipeWaveDrop·w)` — a higher `v` takes the pixel from
 * further up the texture, so the wave scene slides **down** as the tree wipes in (it and the tree drift
 * at different rates, which is what reads as depth). The wave **UI** has to travel with it: left
 * standing still while the scene beneath it slides away, the overlay looks detached — the "the mask
 * lags while scrolling" symptom, even though the cut itself is exactly on the line.
 *
 * Apply it to the overlay's *content*, never to the element carrying the clip — the clip is in screen
 * space and must stay on the line while the content moves under it.
 */
export const waveDriftAt = (progress: number): number => {
  const { wipeRange, wipeWaveDrop } = sceneConfig.sequence;
  const w = clamp01((progress - wipeRange[0]) / (wipeRange[1] - wipeRange[0]));
  return wipeWaveDrop * w * 100;
};

/**
 * Where the wave UI starts / finishes receding, as a fraction of the wipe (`w`). Tuned to the
 * heading's own geometry: it sits in the top-right, whose region the tilted line reaches around
 * `w ≈ 0.64–0.75`, so the fade is spent by then and the UI never outlives its own patch of screen.
 * Before `0.45` — most of the wipe — it stays fully solid.
 */
const UI_RECEDE: [number, number] = [0.45, 0.72];

/**
 * Opacity for the wave **UI** across the wipe, `1 → 0` over the back half.
 *
 * The wipe line is tilted so the **top-right corner is covered last** — which is exactly where this
 * overlay's heading sits, so a bright fragment of it survived until the very end, floating over a tree
 * scene that had already taken the rest of the frame. Two acts stacked on screen at once.
 *
 * The clip still does the disappearing and still sits **exactly** on the scene's line — this only
 * retires whatever sliver is left once the tree owns most of the frame, so the overlay recedes with its
 * own scene instead of hanging on in the last wedge.
 */
export const waveUiOpacityAt = (progress: number): number => {
  const { wipeRange } = sceneConfig.sequence;
  const w = clamp01((progress - wipeRange[0]) / (wipeRange[1] - wipeRange[0]));
  const t = clamp01((w - UI_RECEDE[0]) / (UI_RECEDE[1] - UI_RECEDE[0]));
  return 1 - t * t * (3 - 2 * t); // smoothstep out
};
