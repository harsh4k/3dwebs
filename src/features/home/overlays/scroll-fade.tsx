// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import { animated, useSpring } from "@react-spring/web";
import { useEffect } from "react";

import { getScrollProgress } from "@/utils/scroll-progress";

import type { ReactNode } from "react";

/**
 * Cross-fades a section overlay with the scroll — so each scene's UI (the X hero, the hand
 * section, …) is only visible while its scene is on screen. Reads the shared, frame-memoised
 * `getScrollProgress()` on a per-frame rAF (the same cadence the scene reads it, so the fade tracks
 * the camera — and one measurement is shared by every caller instead of each forcing its own
 * layout; see [[scroll-progress]]), maps progress to an
 * opacity that ramps up over `appear` and back down over `disappear` (both `[start, end]` windows
 * in **real** scroll progress 0–1), and sets it immediately (the smoothstep windows are what make
 * it smooth). Hidden (`visibility: hidden`) when fully faded so it never intercepts the pointer.
 */
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (t: number): number => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
/** Ramp 0→1 across [a, b]; a step at `a` when the window has zero width. */
const ramp = (p: number, [a, b]: [number, number]): number =>
  b > a ? smoothstep((p - a) / (b - a)) : p >= a ? 1 : 0;

interface ScrollFadeProps {
  /** [start, end] progress window over which the overlay fades **in**. */
  appear: [number, number];
  /**
   * [start, end] progress window over which it fades **out**. **Omit it entirely** for overlays that
   * never fade out — the last act (the tree), or ones that leave another way (the wave UI, which the
   * tree wipe clips away).
   *
   * Do **not** try to express "never" as a zero-width window like `[1, 1]`: `ramp` treats a zero-width
   * window as a **step at `start`** (that's what makes `appear={[0, 0]}` mean "on from the beginning"),
   * so `[1, 1]` actually means *fully faded out at progress 1* — the overlay blanked at the very bottom
   * of the page, and Lenis settling onto/off that exact value made it blink.
   */
  disappear?: [number, number];
  className?: string;
  children: ReactNode;
}

/** The overlay's opacity at a given progress — the one place the two windows are combined. */
const opacityAt = (
  p: number,
  appear: [number, number],
  disappear?: [number, number],
): number => Math.max(0, Math.min(ramp(p, appear), disappear ? 1 - ramp(p, disappear) : 1));

export const ScrollFade = ({ appear, disappear, className, children }: ScrollFadeProps) => {
  /*
   * Seeded at the opacity for **progress 0**, not a flat `0`.
   *
   * A flat `0` meant every overlay — including the hero, whose `appear={[0, 0]}` says "on from
   * the beginning" — was server-rendered at `opacity:0;visibility:hidden` and only corrected on
   * the first rAF. Two consequences: the hero overlay popped in a frame late on every load, and
   * with JavaScript disabled all four wrappers stayed hidden forever, so `/` was a blank cream
   * page no matter what the children rendered.
   *
   * `opacityAt(0, …)` is not a special case for the hero — it is the same window maths the rAF
   * runs, asked for the position the page actually loads at. It resolves to 1 for the hero and 0
   * for the hand, wave and tree acts, which is the correct no-JS composition: the first act
   * visible, the later ones not stacked on top of it.
   */
  const initial = opacityAt(0, appear, disappear);
  const [style, api] = useSpring(() => ({ opacity: initial }));

  useEffect(() => {
    let raf = 0;
    let last = Number.NaN;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      // Shared, frame-memoised — see [[scroll-progress]]. Measuring it here (four `ScrollFade`s do)
      // meant a forced layout per instance per frame, interleaved with these springs' style writes.
      const p = getScrollProgress();
      if (p === last) return;
      last = p;
      api.start({ opacity: opacityAt(p, appear, disappear), immediate: true });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [api, appear, disappear]);

  return (
    <animated.div
      className={className}
      style={{
        opacity: style.opacity,
        visibility: style.opacity.to((o) => (o < 0.01 ? "hidden" : "visible")),
      }}
    >
      {children}
    </animated.div>
  );
};
