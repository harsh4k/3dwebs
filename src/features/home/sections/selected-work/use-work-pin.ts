"use client";

import { useEffect, useRef } from "react";

import type { RefObject } from "react";

/**
 * The pin behind Selected Work: the section holds still while its project track scrolls sideways
 * past a fixed title panel.
 *
 * **No ScrollTrigger.** GSAP is in this bundle for exactly one thing (the staggered menu) and
 * ScrollTrigger is not registered anywhere in `src/`. `ParticleScene` already drives the whole
 * Auralis sequence off scroll progress in a rAF loop, so this uses the same mechanism rather than
 * putting a second scroll system on the same page — see brain D21.
 *
 * **The pin length is derived, not fixed.** The reference pins for a flat 200% because it shows
 * three projects. We show eleven, and a fixed runway would either crawl or blur past them
 * depending on the count. Instead the runway is one viewport-height of scroll per viewport-width
 * of track, so the sideways speed stays the same however many projects the content file holds.
 *
 * **The lag is deliberate.** The track eases toward its target rather than snapping to it, which
 * is what gives the sideways motion its weight. The reference gets that by restarting a tween every
 * frame; the same settle is one line of exponential follow, and unlike a tween it is frame-rate
 * independent.
 *
 * The hook **owns** its three refs rather than taking them as arguments. The React Compiler treats
 * anything reached through a prop as immutable, and this loop's entire job is writing transforms
 * onto those nodes — locally-created refs are the supported way to do that.
 */

interface WorkPinRefs {
  /** The tall element that gives the section its scroll length. */
  spacer: RefObject<HTMLDivElement | null>;
  /** The sticky viewport-height element inside it. */
  stage: RefObject<HTMLDivElement | null>;
  /** The flex row that translates sideways. */
  track: RefObject<HTMLDivElement | null>;
}

/** Rate of the exponential settle. Higher is tighter; 4 matches the reference's tween slope. */
const FOLLOW = 4;
/** How far a card's inner block sits below its resting place before it rises, in px. */
const CARD_RISE = 550;
/** Card centre, in viewport widths, where the rise begins easing out… */
const CARD_FAR = 1.2;
/** …and where it has fully landed. */
const CARD_NEAR = 0.5;
/** Scroll held at the end so the last card can be read before the section releases. */
const TAIL_VH = 60;

const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);

export const useWorkPin = (): WorkPinRefs => {
  const spacer = useRef<HTMLDivElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);

  /* Loop state lives in refs, not closure locals: the frame callback outlives the render that
     created it, and mutating a captured `let` from there is exactly what the compiler forbids. */
  const frameId = useRef(0);
  const trackX = useRef(0);
  const lastFrame = useRef(0);

  useEffect(() => {
    const spacerEl = spacer.current;
    const stageEl = stage.current;
    const trackEl = track.current;
    if (!spacerEl || !stageEl || !trackEl) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* Reduced motion and narrow viewports both drop the pin: the track becomes a normal vertical
       stack with every card at rest. This is a complete layout, not a disabled one — nothing is
       hidden waiting for an animation that will never run. */
    const isStacked = (): boolean => window.innerWidth < 768 || media.matches;

    const innerCards = (): HTMLElement[] =>
      Array.from(trackEl.querySelectorAll<HTMLElement>("[data-work-card-inner]"));

    /* Dropping the pin also drops the attribute, so the CSS falls back to the stacked layout —
       the same state a reader with JavaScript disabled gets. See `selected-work.css`. */
    const clearPin = (): void => {
      stageEl.removeAttribute("data-pinned");
      spacerEl.style.height = "";
      trackEl.style.transform = "";
      for (const inner of innerCards()) inner.style.transform = "";
    };

    const measure = (): void => {
      if (isStacked()) {
        clearPin();
        return;
      }
      stageEl.setAttribute("data-pinned", "true");
      /* One viewport-height of scroll per viewport-width of sideways travel, plus the tail. */
      const travel = Math.max(0, trackEl.scrollWidth - stageEl.clientWidth);
      const runwayVh = (travel / window.innerWidth) * 100;
      spacerEl.style.height = `calc(100vh + ${runwayVh + TAIL_VH}vh)`;
    };

    const frame = (now: number): void => {
      frameId.current = requestAnimationFrame(frame);
      /* Nothing is written while stacked — the CSS owns that layout entirely. */
      if (isStacked()) return;

      const dt = Math.min((now - lastFrame.current) / 1000, 0.05);
      lastFrame.current = now;

      const height = spacerEl.offsetHeight - window.innerHeight;
      const progress = height <= 0 ? 0 : clamp01((window.scrollY - spacerEl.offsetTop) / height);

      /* The tail is scroll the track does not move through — it holds at the end instead, so the
         last card can be read before the section releases. `k` therefore reaches 1 at the end of
         the runway rather than the end of the spacer. */
      const totalVh = (height / window.innerHeight) * 100;
      const runwayFraction = totalVh <= TAIL_VH ? 1 : (totalVh - TAIL_VH) / totalVh;
      const k = clamp01(progress / runwayFraction);

      const travel = Math.max(0, trackEl.scrollWidth - stageEl.clientWidth);
      trackX.current += (-k * travel - trackX.current) * (1 - Math.exp(-FOLLOW * dt));
      trackEl.style.transform = `translate3d(${trackX.current}px, 0, 0)`;

      /* Each card rises as its centre approaches the middle of the viewport. Centre is measured
         live rather than derived from an index, so it stays correct whatever the panels weigh. */
      const width = window.innerWidth;
      for (const inner of innerCards()) {
        const rect = inner.getBoundingClientRect();
        const centre = (rect.left + rect.width / 2) / width;
        const eased =
          centre > CARD_FAR
            ? 1
            : centre > CARD_NEAR
              ? Math.pow(1 - (CARD_FAR - centre) / (CARD_FAR - CARD_NEAR), 3)
              : 0;
        inner.style.transform = `translate3d(0, ${CARD_RISE * eased}px, 0)`;
      }
    };

    measure();
    lastFrame.current = performance.now();
    frameId.current = requestAnimationFrame(frame);

    const onResize = (): void => measure();
    window.addEventListener("resize", onResize);
    media.addEventListener("change", onResize);

    return () => {
      cancelAnimationFrame(frameId.current);
      window.removeEventListener("resize", onResize);
      media.removeEventListener("change", onResize);
      clearPin();
    };
  }, []);

  return { spacer, stage, track };
};
