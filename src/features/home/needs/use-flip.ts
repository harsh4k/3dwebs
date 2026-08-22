"use client";

import { useLayoutEffect, useRef } from 'react';

import { prefersReducedMotion } from '@/lib/scene/device';
import { DUR, EASE } from '@/motion/tokens';

/**
 * FLIP (First, Last, Invert, Play) for the sentence bar.
 *
 * ### The problem it solves
 * Adding a pill re-flows the bar: the `+` button and the `next` CTA jump to new
 * positions in a single frame, and removing one snaps them back. The pill's own
 * spring cannot fix that — the pill animates while its *neighbours* teleport, so
 * the whole interaction reads as a glitch no matter how good the pill's easing is.
 *
 * ### Why not animate width
 * Because `width` is a layout property, and animating layout is a review failure
 * here (CLAUDE.md → animation rules). FLIP is the transform-only answer: measure
 * where every element sat before the change, let the browser lay out the new
 * state, then invert the difference as a `translate` and play it back to zero.
 * Layout runs once; the motion is pure transform on the compositor.
 *
 * ### Why `offsetLeft/offsetTop`, not `getBoundingClientRect()`
 * `getBoundingClientRect()` includes transforms, so measuring an element that is
 * still mid-flight returns its *animated* position — and the next FLIP inherits
 * that error and compounds it. `offsetLeft`/`offsetTop` report layout position
 * only, immune to the transform being applied. Every element in the bar shares
 * one `offsetParent`, so the deltas are directly comparable.
 *
 * ### Why the Web Animations API and not react-spring
 * The keys are dynamic — one pill per selected service — and react-spring's hooks
 * want a stable spring per key, which means either rebuilding the spring set on
 * every change or hand-managing `SpringValue` instances. `element.animate` is a
 * browser primitive rather than a second animation library: it writes transform
 * on the compositor, it lives on a **different element** from the react-spring
 * enter/leave (so the two never both write `transform`), and it cleans itself up.
 * Timings come from the Design.md §9 tokens, same as everything else.
 *
 * ### Reduced motion
 * First-class: elements are still measured and tracked, so the bookkeeping stays
 * correct and a later re-enable is not confused — but nothing plays. The layout
 * updates instantly, which is the correct reduced-motion result.
 *
 * Runs on **every** commit, deliberately and with no dependency array. The
 * re-render that matters most is the one react-spring's `useTransition` fires
 * when a leaving pill finally unmounts and its neighbours close the gap; that
 * commit changes no prop this hook could depend on. Reading two integers per
 * element is far cheaper than the reflow it smooths.
 */

/** Sub-pixel drift is not motion — animating it just burns a compositor layer. */
const THRESHOLD = 1;

export function useFlip<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null);
  const previous = useRef(new Map<string, { left: number; top: number }>());

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const reduce = prefersReducedMotion();
    const nodes = root.querySelectorAll<HTMLElement>('[data-flip]');
    const next = new Map<string, { left: number; top: number }>();

    for (const node of nodes) {
      const key = node.dataset.flip;
      if (!key) continue;

      const last = { left: node.offsetLeft, top: node.offsetTop };
      next.set(key, last);

      const first = previous.current.get(key);
      if (!first || reduce) continue;

      const dx = first.left - last.left;
      const dy = first.top - last.top;
      if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) continue;

      node.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: 'translate(0px, 0px)' },
        ],
        { duration: DUR.base, easing: EASE.outQuint, composite: 'replace' },
      );
    }

    previous.current = next;
  });

  return containerRef;
}
