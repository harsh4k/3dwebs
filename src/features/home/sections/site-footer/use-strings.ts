"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { createFooterFog } from "./footer-fog";
import { buildLineField, lineCount, restPath, wavePath } from "./line-field";

import type { Hairline } from "./line-field";
import type { RefObject } from "react";

/**
 * The plucked-hairline footer: run the cursor across the field and each line it touches rings.
 *
 * **There is no sound.** The reference pairs the visible wave with a Web Audio voice per string;
 * that half is deliberately not built — see the plan for this change set. No `AudioContext` is
 * ever constructed, which also removes the analyser that drove the fog's churn in the original, so
 * the smoke responds to the pulse alone.
 *
 * **Why the wave is written as `d` and not as a transform.** A standing wave changes the *shape*
 * of the line, not its position, so there is nothing to translate — the path is resampled. It is
 * 26 points on a line that is only redrawn while it is actually ringing, and a line whose
 * amplitude has fallen below the visible threshold is dropped from the loop entirely, so a still
 * field costs one comparison per line per frame and no DOM writes at all.
 *
 * **The hit area is a separate transparent twin.** A 0.6px hairline is impossible to hit with a
 * pointer, so each line is paired with a 12px-wide transparent copy carrying `pointer-events:
 * stroke`. The reference keeps the two in sync with a `MutationObserver` because its wave writer
 * only knows about the visible path; ours writes both in the same statement, so no observer is
 * needed.
 *
 * **Off-screen it costs nothing.** The whole loop — fog included — is gated on an
 * `IntersectionObserver`, so a reader who never reaches the bottom never pays for any of it.
 */

/** Samples along a plucked line. */
const SEGMENTS = 26;
/** Standing-wave cycles between the two fixed ends. */
const CYCLES = 2.2;

const HOVER = { amp: 7, speed: 18, decay: 0.9, smoke: 0.4 } as const;
const CLICK = { amp: 11, speed: 26, decay: 1.1, smoke: 0.9 } as const;

/** Below this the wave is not visible, so the line stops being redrawn. */
const SILENT = 0.02;
/** Standard exponential ease-out. */
const expoOut = (t: number): number => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

interface StringState {
  amp: number;
  speed: number;
  phase: number;
  /** Seconds since the pluck. */
  elapsed: number;
  decay: number;
  /** True while it still needs redrawing. */
  live: boolean;
}

interface StringsRefs {
  host: RefObject<HTMLDivElement | null>;
  canvas: RefObject<HTMLCanvasElement | null>;
  svg: RefObject<SVGSVGElement | null>;
  lines: Hairline[];
}

export const useFooterStrings = (): StringsRefs => {
  const host = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);

  /* Rendered on the client only, so the count can key off the viewport without risking a server /
     client mismatch — see the `mounted` gate in `home-footer.tsx`. */
  const [width, setWidth] = useState(1440);
  const lines = useMemo(() => buildLineField(lineCount(width)), [width]);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    const hostEl = host.current;
    const canvasEl = canvas.current;
    const svgEl = svg.current;
    if (!hostEl || !canvasEl || !svgEl) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    /* The complete reduced version of "the lines ring when you touch them" is "the lines are
       there". No loop, no fog, no listeners — the field renders as the still hairlines the markup
       already contains, which is the same thing a no-JS reader gets. */
    if (motionQuery.matches) return;

    const fog = createFooterFog(canvasEl);

    const states: StringState[] = lines.map(() => ({
      amp: 0,
      speed: 0,
      phase: 0,
      elapsed: 0,
      decay: HOVER.decay,
      live: false,
    }));

    const paths = Array.from(svgEl.querySelectorAll<SVGPathElement>("[data-string]"));
    const hits = Array.from(svgEl.querySelectorAll<SVGPathElement>("[data-string-hit]"));

    const pluck = (index: number, kind: typeof HOVER | typeof CLICK): void => {
      const state = states[index];
      if (!state) return;
      state.amp = kind.amp;
      state.speed = kind.speed;
      state.decay = kind.decay;
      state.elapsed = 0;
      state.live = true;
      fog.pulse(kind.smoke);
    };

    /* Bound on the hit twins, which are the only things in the field with a pointer surface. */
    const onOver = (event: PointerEvent): void => {
      const index = Number((event.currentTarget as SVGPathElement).dataset.index);
      pluck(index, HOVER);
    };
    const onDown = (event: PointerEvent): void => {
      const index = Number((event.currentTarget as SVGPathElement).dataset.index);
      pluck(index, CLICK);
    };

    for (const hit of hits) {
      hit.addEventListener("pointerenter", onOver);
      hit.addEventListener("pointerdown", onDown);
    }

    let frame = 0;
    let last = performance.now();
    let running = false;

    const tick = (now: number): void => {
      if (!running) return;
      frame = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      for (let i = 0; i < states.length; i += 1) {
        const state = states[i];
        if (!state.live) continue;

        state.elapsed += dt;
        state.phase += state.speed * dt;

        /* Amplitude rides the pluck down to zero over its decay window. */
        const t = Math.min(state.elapsed / state.decay, 1);
        const amplitude = state.amp * (1 - expoOut(t));

        if (amplitude <= SILENT) {
          state.live = false;
          const d = restPath(lines[i]);
          paths[i]?.setAttribute("d", d);
          hits[i]?.setAttribute("d", d);
          continue;
        }

        const d = wavePath(lines[i], amplitude, state.phase, CYCLES, SEGMENTS);
        paths[i]?.setAttribute("d", d);
        hits[i]?.setAttribute("d", d);
      }

      fog.render(dt);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !running) {
            running = true;
            last = performance.now();
            frame = requestAnimationFrame(tick);
          } else if (!entry.isIntersecting && running) {
            running = false;
            cancelAnimationFrame(frame);
          }
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(hostEl);

    const onResize = (): void => fog.resize();
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      for (const hit of hits) {
        hit.removeEventListener("pointerenter", onOver);
        hit.removeEventListener("pointerdown", onDown);
      }
      fog.dispose();
    };
  }, [lines]);

  return { host, canvas, svg, lines };
};
