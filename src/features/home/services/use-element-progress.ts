"use client";

/**
 * Scroll progress `0 → 1` for **an element in normal flow**.
 *
 * The pinned hero sequence has its own shared reader (`@/utils/scroll-progress`)
 * measured against a fixed `scrollVh`; that one cannot serve a section further
 * down the page, because its progress is already saturated at 1 by the time this
 * section exists. So this hook measures the element itself, the same way
 * `work-carousel.tsx`'s `pageSlot` does — one `getBoundingClientRect()` per
 * frame, on the **shared** ticker (`@/lib/animation/ticker`), so a page with N
 * scroll-driven sections still runs one rAF.
 *
 * The window is expressed as two viewport fractions:
 *   `from` — where the element's top edge sits when progress is 0
 *   `to`   — where it sits when progress is 1
 * both as a fraction of viewport height, measured from the top. So
 * `from: 1, to: 0.25` means "starts when the top edge touches the bottom of the
 * viewport, finishes when it has risen to a quarter of the way down".
 *
 * `onProgress` is called only when the value actually changes, and is read live
 * through a ref so a re-rendered parent never re-subscribes.
 */

import { useEffect, useRef } from "react";

import { subscribeToTicker } from "@/lib/animation/ticker";

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

interface ElementProgressOptions {
  /** Viewport fraction (from the top) where the element's top edge sits at progress 0. */
  from?: number;
  /** Viewport fraction where it sits at progress 1. */
  to?: number;
  /** Minimum ms between samples. 0 = every frame — this is one rect read. */
  framerate?: number;
}

export const useElementProgress = (
  ref: React.RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  { from = 1, to = 0.25, framerate = 0 }: ElementProgressOptions = {},
) => {
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let last = Number.NaN;
    const unsubscribe = subscribeToTicker(
      () => {
        const vh = window.innerHeight;
        if (vh <= 0) return;
        const top = element.getBoundingClientRect().top / vh;
        // `from` is below `to` on screen, so the span is negative-going; dividing
        // by it flips the sign back and progress grows as the element rises.
        const span = from - to;
        const progress = span === 0 ? (top <= to ? 1 : 0) : clamp01((from - top) / span);
        if (progress === last) return;
        last = progress;
        onProgressRef.current(progress);
      },
      () => framerate,
    );

    return unsubscribe;
  }, [ref, from, to, framerate]);
};
