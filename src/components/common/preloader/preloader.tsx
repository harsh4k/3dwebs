// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import { animated, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";

import { markPageRevealed, useSceneProgress } from "@/features/home/scene/scene-ready";
import { site } from "@/content/site";

/**
 * Preloader — a black hold over the whole page until the 3D scene is worth looking at.
 *
 * Minimal on purpose, and in the site's own language: the black of `--overlay-solid`, the display
 * face, extra-light uppercase letter-spaced type, and one hairline rule — the same rule motif the
 * header and the hero footer use. Nothing spins.
 *
 * **It tracks a real signal, not a timer.** `useSceneProgress` reports the scene's three gating steps
 * (hand cloud, tree cloud, warm-up pass), so the rule fills against actual work and the hand-off lands
 * on a frame that is complete — after the shaders have compiled, which is the stall the warm-up exists
 * to hide. A missing asset still counts as settled, so a failed fetch can never trap the page here.
 *
 * All motion is spring-based (hard rule #1): the rule's width and the veil's fade are springs, and the
 * count is derived from the same spring value rather than a second timer, so the number can never
 * disagree with the bar. Once faded it is `pointer-events-none` and removed from the tree.
 */

const BRAND = site.name;

export const Preloader = () => {
  const progress = useSceneProgress();
  const [gone, setGone] = useState(false);

  // One spring drives the bar *and* the readout, so they can never drift apart.
  // `filled` is what the exit waits on — **not** raw progress. The spring eases, so it trails the
  // real value by a few hundred ms; leaving on the raw signal pulled the veil away while the bar was
  // still visibly mid-travel (caught it going at "063").
  const [filled, setFilled] = useState(false);
  const fill = useSpring({
    value: progress,
    // Snappy on purpose. The soft spring the rest of the site uses (tension 88) is heavily
    // overdamped — it *creeps* to the target and took ~15 s to reach 1 after the assets were
    // already in, holding the page on a loader with nothing left to load. Here the spring only has
    // to smooth three discrete jumps, so it should settle in well under a second.
    config: { mass: 1, tension: 260, friction: 34 },
  });

  // **Failsafe.** A loader that can't dismiss itself is a broken site, so once the scene reports
  // ready the exit is guaranteed even if the spring's `onRest` never arrives (a backgrounded tab
  // freezes rAF, and react-spring rides it).
  // Wait for the **bar itself** to reach full, by polling the spring on rAF.
  //
  // Two simpler approaches both failed. `onRest` runs the callback captured by the render that
  // *started* the animation, so it read a stale `progress` and the veil never left. A wall-clock
  // `setTimeout` fires in a background tab where rAF — and therefore the spring — is frozen, so it
  // yanked the veil while the bar still read 058. Polling on rAF is measured in the same clock the
  // spring runs on: it can't fire early, and it can't hang, because the spring always converges.
  const fillValue = fill.value;
  useEffect(() => {
    if (progress < 1) return;
    let raf = 0;
    const check = () => {
      if (fillValue.get() >= 0.995) {
        setFilled(true);
        return;
      }
      raf = requestAnimationFrame(check);
    };
    raf = requestAnimationFrame(check);
    return () => cancelAnimationFrame(raf);
  }, [progress, fillValue]);

  // Held a beat past the full bar, so the completed state is seen rather than snapping away.
  // `?preload` holds it open indefinitely, so the loader can be reviewed without clearing caches —
  // the same dev-flag convention as `?debug` and `?tune`.
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("preload")) return;
    if (!filled) return;
    const id = window.setTimeout(() => {
      setLeaving(true);
      // Release the show: the DOM reveals (whose hero window starts at progress 0) and the scene's
      // glyph materialise both wait on this, so neither plays out behind the veil.
      markPageRevealed();
    }, 260);
    return () => window.clearTimeout(id);
  }, [filled]);

  const veil = useSpring({
    // `from` is required: without it the spring animates *up* from 0 on mount, so the loader would
    // fade IN over the page it is supposed to be hiding. It must be opaque on the very first frame.
    from: { opacity: 1 },
    opacity: leaving ? 0 : 1,
    config: { mass: 1, tension: 70, friction: 26 },
    onRest: () => {
      if (leaving) setGone(true);
    },
  });

  if (gone) return null;

  return (
    <animated.div
      // `z-[70]` clears the whole live stack — the scene and its overlays, the header, and the
      // mobile menu's portalled panel (z-50) and close button (z-60) — but stays under the cookie
      // preferences modal (z-100), which is the only thing that may ever sit above the loader.
      className="pointer-events-none fixed inset-0 z-[70] flex flex-col items-center justify-center gap-[1.5rem] bg-overlay-solid font-display text-overlay-ink"
      style={{ ...veil, visibility: veil.opacity.to((o) => (o < 0.01 ? "hidden" : "visible")) }}
      aria-hidden={leaving}
      role="status"
      aria-live="polite"
    >
      <span className="text-[1rem] font-extralight uppercase tracking-[0.5em] indent-[0.5em] leading-none">
        {BRAND}
      </span>

      {/* The hairline rule fills left-to-right — the same 1px motif as the header's brand rules. */}
      <span aria-hidden className="relative block h-px w-[12rem] max-w-[60vw] bg-overlay-line">
        <animated.span
          className="absolute inset-y-0 left-0 block bg-overlay-ink"
          style={{ width: fill.value.to((v) => `${Math.round(v * 100)}%`) }}
        />
      </span>

      <animated.span className="text-[0.75rem] font-light tabular-nums tracking-[0.2em] text-overlay-strong">
        {fill.value.to((v) => `${String(Math.round(v * 100)).padStart(3, "0")}`)}
      </animated.span>
    </animated.div>
  );
};
