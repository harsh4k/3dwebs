// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import { useCallback, useSyncExternalStore } from "react";

import { isPageRevealed } from "@/components/common/scene/scene-ready";
import { getScrollProgress } from "@/utils/scroll-progress";

/**
 * Which act is currently **on screen**, as a boolean per act — the switch the reveal animations play
 * in and out on.
 *
 * **Why a boolean and not scroll progress.** The reveals need to play **in** when an act arrives and
 * **out — the same animation reversed — when it leaves**, in *both* scroll directions. A progress-driven
 * trigger can't do that: scroll progress only ever increases while moving forward, so it can never walk
 * an animation back out. Both engines here already expose the right switch — `TextEngine` and `<Inview>`
 * play in/out off their **`enabled`** prop (for every mode except `manual`, which is banned) — and since
 * the overlays are pinned they're permanently "in view", so `enabled` is the only thing gating them.
 *
 * One rAF for all of them: components subscribe through `useSyncExternalStore`, and the loop only runs
 * while something is subscribed. Progress itself comes from the shared frame-memoised reader, so this
 * costs one `scrollY` read per frame no matter how many reveals are mounted.
 */

export type RevealAct = "hero" | "hand" | "wave" | "tree";

/**
 * Each act's on-screen window in real scroll progress. Ends a touch **before** the matching
 * `ScrollFade` starts its opacity fade, so the reveal's own exit is what you actually see and the block
 * fade only mops up behind it.
 */
const ACT_WINDOW: Record<RevealAct, [number, number]> = {
  hero: [0, 0.04],
  hand: [0.35, 0.46],
  wave: [0.61, 0.955],
  tree: [0.94, 1],
};

const ACTS = Object.keys(ACT_WINDOW) as RevealAct[];

const state: Record<RevealAct, boolean> = { hero: false, hand: false, wave: false, tree: false };

const listeners = new Set<() => void>();
let raf = 0;

/** Recompute every act from the current scroll. Returns whether anything flipped. */
const evaluate = (): boolean => {
  const p = getScrollProgress();
  // Nothing plays until the preloader is gone — the hero's window starts at progress 0, which is
  // exactly where the page sits behind the veil, so its intro would otherwise have played out
  // unseen and the page would appear already assembled. Read per frame off the shared hand-off
  // signal (`scene-ready.ts`); this loop is already running, so polling costs nothing.
  const revealed = isPageRevealed();
  let changed = false;
  for (const act of ACTS) {
    const [from, to] = ACT_WINDOW[act];
    const next = revealed && p >= from && p <= to;
    if (state[act] !== next) {
      state[act] = next;
      changed = true;
    }
  }
  return changed;
};

const notify = (): void => {
  for (const listener of listeners) listener();
};

const tick = (): void => {
  raf = requestAnimationFrame(tick);
  if (evaluate()) notify();
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  if (listeners.size === 1) raf = requestAnimationFrame(tick);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) cancelAnimationFrame(raf);
  };
};

/** `true` while the act is the one on screen. Drives the reveals' `enabled`. */
export const useActActive = (act: RevealAct): boolean => {
  const snapshot = useCallback(() => state[act], [act]);
  // Server render: nothing is active — the page starts behind the preloader, so every reveal is in
  // its `Out` state in the first HTML and plays *in* once the veil lifts.
  const server = useCallback(() => false, []);
  return useSyncExternalStore(subscribe, snapshot, server);
};
