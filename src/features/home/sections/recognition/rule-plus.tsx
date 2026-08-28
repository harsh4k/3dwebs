"use client";

import { useEffect, useRef } from "react";

/**
 * The hairline that draws itself across the section, with a `+` riding it.
 *
 * Two behaviours, in sequence, transcribed from the reference's rule block:
 *
 *  1. **The scrub.** From the moment the rule's top edge touches the bottom of the viewport until
 *     it reaches the middle, the line grows `0 → 100%` and the `+` turns `0 → 360°`. In the
 *     original those are two scrubbed tweens (`start: 'top bottom'`, `end: 'top center'`); the
 *     same window is `(vh − top) / (vh / 2)` clamped to 0…1, read in the shared rAF loop. No
 *     ScrollTrigger — see `use-work-pin.ts` for why this codebase does its own scroll arithmetic.
 *  2. **The follow.** Once the rule is fully drawn the `+` tracks the cursor horizontally,
 *     clamped so it never overhangs either end, and eases back to centre when the pointer leaves.
 *
 * **Why the `+` is the one thing on this section carrying `--heat`.** The palette allows one heat
 * element per viewport and this is it: a 16px glyph is well under the 30px display floor for heat
 * *type*, but this is a stroked mark, not text — it is a fill, which is the other permitted use.
 * It also never carries meaning on its own, so nothing is signalled by colour alone.
 *
 * **No-JS and reduced motion both get the finished rule.** The server renders it at full width
 * and `data-armed` is only set once the loop is running, so a reader without JavaScript sees a
 * drawn rule rather than a gap. Under `prefers-reduced-motion` the CSS pins it to 100% and the
 * loop below never starts, so the `+` sits at centre, still and legible.
 */

const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);

export const RulePlus = ({ className }: { className?: string }) => {
  const root = useRef<HTMLSpanElement | null>(null);
  const plus = useRef<SVGSVGElement | null>(null);

  const frame = useRef(0);
  /** Degrees the scrub has turned the `+` to; the follow keeps whatever it landed on. */
  const rotation = useRef(0);
  /** The `+`'s resting centre, measured lazily on first move — see the reference's `home`. */
  const home = useRef<number | null>(null);

  useEffect(() => {
    const rootEl = root.current;
    const plusEl = plus.current;
    if (!rootEl || !plusEl) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    rootEl.setAttribute("data-armed", "true");

    const tick = (): void => {
      frame.current = requestAnimationFrame(tick);

      const top = rootEl.getBoundingClientRect().top;
      const progress = clamp01((window.innerHeight - top) / (window.innerHeight / 2));

      rootEl.style.setProperty("--rule-width", `${progress * 100}%`);
      rotation.current = 360 * progress;

      const following = progress >= 1;
      /* While the scrub runs the `+` must land exactly where the scroll puts it, so it is written
         with no transition; the follow adds one back through `data-following`. */
      if (!following) {
        rootEl.removeAttribute("data-following");
        home.current = null;
        plusEl.style.transform = `translateX(0px) rotate(${rotation.current}deg)`;
      } else {
        rootEl.setAttribute("data-following", "true");
      }
    };

    /* The cursor-follow is a pointer affordance and nothing depends on it, so it is bound only
       for devices that actually hover — on touch it would fire once on tap and stick. */
    const canHover = window.matchMedia("(hover: hover)").matches;

    const onMove = (event: PointerEvent): void => {
      if (rootEl.getAttribute("data-following") !== "true") return;
      const box = rootEl.getBoundingClientRect();

      if (home.current === null) {
        const plusBox = plusEl.getBoundingClientRect();
        home.current = plusBox.left - box.left + plusBox.width / 2;
      }

      const half = plusEl.getBoundingClientRect().width / 2;
      const min = half;
      const max = box.width - half;
      const cursor = event.clientX - box.left;
      const target = max >= min ? Math.min(Math.max(cursor, min), max) : box.width / 2;

      plusEl.style.transform = `translateX(${target - home.current}px) rotate(${rotation.current}deg)`;
    };

    const onLeave = (): void => {
      home.current = null;
      plusEl.style.transform = `translateX(0px) rotate(${rotation.current}deg)`;
    };

    if (canHover) {
      rootEl.addEventListener("pointermove", onMove);
      rootEl.addEventListener("pointerleave", onLeave);
    }

    frame.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame.current);
      rootEl.removeEventListener("pointermove", onMove);
      rootEl.removeEventListener("pointerleave", onLeave);
      rootEl.removeAttribute("data-armed");
      rootEl.removeAttribute("data-following");
    };
  }, []);

  return (
    <span
      ref={root}
      aria-hidden="true"
      className={`recognition-rule${className ? ` ${className}` : ""}`}
    >
      <span className="recognition-rule__line" />
      <svg
        ref={plus}
        className="recognition-rule__plus"
        viewBox="0 0 13 13"
        fill="none"
        focusable="false"
      >
        <line x1="6.5" y1="0" x2="6.5" y2="13" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="6.5" x2="13" y2="6.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    </span>
  );
};
