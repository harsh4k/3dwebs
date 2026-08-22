"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { prefersReducedMotion } from "@/lib/scene/device";

import { useElementProgress } from "./use-element-progress";

/**
 * The iris — the services chapter opens through a circular aperture cut out of
 * an `--ink` field.
 *
 * **Purpose.** It marks the boundary between the pinned scene act and the
 * services chapter. Every other boundary on this site is a wipe (the tree wipe,
 * the stripe); this one is an aperture, because what it opens onto is the range
 * of what the studio does. It is the one moment in the section, and it is the
 * only place `--ink` appears as a ground.
 *
 * Primitive: **Mask reveal** (Design.md §9). Scrubbed, so `--ease-linear` — the
 * curve is the scroll.
 *
 * **Nothing is hidden by default.** The rendered CSS carries no `clip-path` at
 * all: the peach panel covers the ink field completely, and the section is whole
 * and readable with JavaScript off, with GSAP absent, and under
 * `prefers-reduced-motion`. The clip is written *only* once this component has
 * mounted, measured, and confirmed motion is wanted — and the first value it
 * writes is derived from the real scroll position, so a section already past the
 * viewport never flashes shut.
 *
 * **Why `clip-path` and not opacity.** An aperture is a shape, and the shape is
 * the point. It is paint-only on a single element (no layout, no reflow), the
 * radius is the only thing that changes, and `will-change` is set while it moves
 * and dropped the moment it is open — so the promoted layer does not outlive the
 * animation. Design.md §9's "transform and opacity only" rule targets layout
 * thrash (`width`/`top`/`left`); a clip on one element is what the Mask reveal
 * primitive is made of.
 */

/**
 * Aperture radius at full open, as a percentage of the reference box. For
 * `circle()` a percentage resolves against `sqrt(w² + h²) / sqrt(2)`, so 70.71%
 * exactly inscribes the corners from a centred origin. The origin here is above
 * centre, so the bottom corners are further away — 90% clears them at any ratio
 * this section can take, with room to spare.
 */
const OPEN_RADIUS = 90;

/** Above centre: the aperture opens around the heading, not the middle of the list. */
const ORIGIN = "50% 45%";

const clipAt = (radius: number): string => `circle(${radius}% at ${ORIGIN})`;

interface IrisPanelProps {
  className?: string;
  children: ReactNode;
}

export const IrisPanel = ({ className = "", children }: IrisPanelProps) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  /** Mirrors whether `will-change` is currently set, so we only touch it on transitions. */
  const hintedRef = useRef(false);

  useEffect(() => {
    setEnabled(!prefersReducedMotion());
  }, []);

  useElementProgress(
    fieldRef,
    (progress) => {
      const panel = panelRef.current;
      if (!panel || !enabled) return;

      panel.style.clipPath = progress >= 1 ? "" : clipAt(progress * OPEN_RADIUS);

      // Promote only while the radius is actually moving. Left in CSS it would
      // keep a full-viewport layer alive for the rest of the page.
      const wantsHint = progress > 0 && progress < 1;
      if (wantsHint !== hintedRef.current) {
        hintedRef.current = wantsHint;
        panel.style.willChange = wantsHint ? "clip-path" : "";
      }
    },
    { from: 1, to: 0.25 },
  );

  // Reduced motion turning on mid-session (or the effect above never running)
  // must leave the panel unclipped rather than frozen part-way.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || enabled) return;
    panel.style.clipPath = "";
    panel.style.willChange = "";
    hintedRef.current = false;
  }, [enabled]);

  return (
    <div ref={fieldRef} className="relative bg-ink">
      <div ref={panelRef} className={`relative bg-peach ${className}`}>
        {children}
      </div>
    </div>
  );
};
