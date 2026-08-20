// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether the 3D scene is **ready to be looked at** — the signal the preloader waits on.
 *
 * "Ready" means the two async point clouds (hand, tree) have settled *and* the scene has done its
 * one-off warm-up: shaders compiled, textures uploaded, the tree pre-baked. Handing off any earlier
 * would drop the loader onto a frame that is still missing the hand, or onto the compile stall itself
 * — which is the whole thing the warm-up exists to hide.
 *
 * The scene reports progress as its two assets land, so the loader can show real movement rather than
 * a decorative timer. A **failed** asset still counts as settled: the scene is designed to run without
 * it (the `.catch` in the loaders), so a missing file must never wedge the page behind a loader.
 */

/**
 * This module also carries the **return** signal — `markPageRevealed`, fired by the preloader as its
 * veil starts to lift. Two very different things wait on it: the DOM reveal animations (the hero's
 * window opens at scroll 0, which is exactly where the page sits *behind* the loader, so without a
 * gate its whole intro played under the veil), and the scene's own **glyph materialise**, which is
 * the first thing the page shows once uncovered. Both live here rather than in either consumer,
 * because it is the same hand-off in both directions.
 */

/** Steps that gate the hand-off: the two clouds, plus the scene's own warm-up pass. */
const TOTAL_STEPS = 3;

let revealed = false;

/** Called by the preloader as it starts to leave. Idempotent. */
export const markPageRevealed = (): void => {
  revealed = true;
};

/** Whether the preloader has handed the page over. Polled per frame by the scene and the reveals —
 *  both already run a rAF loop, so a subscription would buy nothing. */
export const isPageRevealed = (): boolean => revealed;

let done = 0;
let ready = false;
const listeners = new Set<() => void>();

const notify = (): void => {
  for (const listener of listeners) listener();
};

/** Called by the scene as each gating step completes. Idempotent per call site. */
export const markSceneStep = (): void => {
  if (ready) return;
  done = Math.min(TOTAL_STEPS, done + 1);
  if (done >= TOTAL_STEPS) ready = true;
  notify();
};

/** Escape hatch: if the scene never mounts (WebGL unavailable), don't trap the page behind a loader. */
export const markSceneReady = (): void => {
  if (ready) return;
  done = TOTAL_STEPS;
  ready = true;
  notify();
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const snapshot = (): number => done;

/** Loading progress `0 → 1`. Server render is 0, so the loader is present in the first HTML. */
export const useSceneProgress = (): number => {
  const value = useSyncExternalStore(
    subscribe,
    snapshot,
    useCallback(() => 0, []),
  );
  return value / TOTAL_STEPS;
};
