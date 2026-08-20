/**
 * Shared scroll progress `0 → 1` for the pinned Auralis sequence — **computed at most once per
 * frame**, no matter how many callers ask for it.
 *
 * Progress is measured against `sequence.scrollVh` only. Later acts (the showreel) add their own
 * height to the document and must not stretch this film — otherwise the tree never arrives before
 * the pinned canvas is handed off.
 *
 * The result is memoised per frame using `document.timeline.currentTime`. Callers still run their
 * own rAF — this only dedupes the measurement.
 */

import { sceneConfig } from '@/components/common/scene/scene.config';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Scrollable distance in px for the Auralis sequence; `-1` = needs re-measuring. */
let scrollMax = -1;
let observer: ResizeObserver | null = null;

const measure = (): number => {
  const vh = window.innerHeight;
  scrollMax = Math.max(1, (sceneConfig.sequence.scrollVh / 100) * vh - vh);
  return scrollMax;
};

const ensureObserver = (): void => {
  if (observer || typeof ResizeObserver === 'undefined') return;
  observer = new ResizeObserver(() => {
    scrollMax = -1;
  });
  observer.observe(document.documentElement);
};

let cachedProgress = 0;
let cachedAt: number | null = null;

/** Scroll progress `0 → 1` through the pinned Auralis sequence. */
export const getScrollProgress = (): number => {
  ensureObserver();
  const now = document.timeline.currentTime;
  const stamp = typeof now === 'number' ? now : null;
  if (stamp !== null && stamp === cachedAt) return cachedProgress;
  const max = scrollMax < 0 ? measure() : scrollMax;
  cachedProgress = max > 0 ? clamp01(window.scrollY / max) : 0;
  cachedAt = stamp;
  return cachedProgress;
};
