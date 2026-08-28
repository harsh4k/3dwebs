"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The crossfade index behind Recognition.
 *
 * The reference drives its slider with Swiper configured as a fade — `effect: 'fade'`,
 * `crossFade: true`, `loop: true`, `speed: 600`, `autoplay: 5000` with `disableOnInteraction:
 * false` and `pauseOnMouseEnter`. **Swiper does not cross.** Because the effect is a fade and not
 * a slide, `loop` never needs Swiper's duplicate-slide machinery, and what is left once you take
 * that away is modular arithmetic over a stack of panels — which is this file. Pulling ~100KB in
 * to run `((i % n) + n) % n` would be the same trade that put the spring runtime on four text
 * pages (brain D20).
 *
 * The crossfade itself is CSS (`recognition.css`); this hook only owns *which* panel is live.
 *
 * **Interaction resets the timer, it never kills it.** That is `disableOnInteraction: false`, and
 * it matters: a reader who clicks one awarding body has expressed interest in the section, not a
 * wish for it to stop moving forever.
 *
 * **Reduced motion stops the auto-advance entirely.** Not because the fade is a problem — it is
 * an opacity change — but because content that advances on its own is exactly what a reader who
 * asked for less motion is asking to be spared, and WCAG 2.2.2 wants a way out of it. The section
 * stays complete: every panel is still reachable from the list and the arrows, and the reader
 * chooses when. Hover and focus pause it for everyone else.
 */

/** Matches the reference's `autoplay.delay`. */
const AUTOPLAY_MS = 5000;

interface Crossfade {
  active: number;
  /** Go to an absolute index; wraps in both directions. */
  goTo: (index: number) => void;
  /** Step by ±1. */
  step: (delta: number) => void;
  /** Bind to the deck: pauses while the pointer is inside or focus is within. */
  hold: () => void;
  release: () => void;
}

export const useCrossfade = (count: number): Crossfade => {
  const [active, setActive] = useState(0);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paused = useRef(false);
  /* Read once per schedule rather than captured, so a reader who flips the OS setting mid-visit
     gets the new behaviour on the next tick instead of on the next reload. */
  const prefersReduced = useRef(false);

  const clear = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  /* `setActive` takes the updater form so the timeout never closes over a stale index — the
     callback outlives the render that scheduled it. */
  const schedule = useCallback(() => {
    clear();
    if (paused.current || prefersReduced.current || count < 2) return;
    timer.current = setTimeout(() => {
      setActive((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
  }, [clear, count]);

  const goTo = useCallback(
    (index: number) => {
      setActive(((index % count) + count) % count);
      schedule();
    },
    [count, schedule],
  );

  const step = useCallback((delta: number) => goTo(active + delta), [active, goTo]);

  const hold = useCallback(() => {
    paused.current = true;
    clear();
  }, [clear]);

  const release = useCallback(() => {
    paused.current = false;
    schedule();
  }, [schedule]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReduced.current = media.matches;

    const onChange = (): void => {
      prefersReduced.current = media.matches;
      schedule();
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [schedule]);

  /* Re-armed whenever `active` moves, including the auto-advance's own step — that is what makes
     it a loop rather than a single tick. */
  useEffect(() => {
    schedule();
    return clear;
  }, [active, schedule, clear]);

  return { active, goTo, step, hold, release };
};
