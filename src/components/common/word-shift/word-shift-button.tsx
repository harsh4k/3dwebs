// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import "./word-shift.css";

import type { CSSProperties } from "react";

/**
 * The link treatment used throughout the sections below the scene.
 *
 * At rest it is a label, a hairline rule and an arrow at the right edge. On hover or focus the
 * letters slide right in a stagger, the right arrow runs out while a second arrow runs in from the
 * left, and the rule hands over from a right-anchored `scaleX(1→0)` to a left-anchored
 * `scaleX(0→1)` — so the line reads as being redrawn from the other end rather than fading.
 *
 * **Why the travel is measured rather than fixed.** The letters stop just short of the arrow, so
 * the distance depends on the rendered width of the word — which changes with the font, the
 * viewport and the string. A hardcoded value is wrong at every breakpoint but one. It is measured
 * once on mount and again on resize, written to `--shift`, and CSS does the rest; there is no
 * per-frame work and nothing runs while the button is idle.
 *
 * **Focus is a first-class trigger.** The reference is hover-only, which leaves the whole
 * interaction unavailable to a keyboard. Every rule in `word-shift.css` matches `:focus-visible`
 * alongside `:hover`, and the component carries a real focus ring on top of that — the motion is
 * decoration, not the affordance.
 *
 * Reduced motion needs no branch here: the transitions run on `--dur-*`, which `tokens.css`
 * already collapses to `--dur-instant`.
 */

interface WordShiftButtonProps {
  /** The label. Rendered per character, so keep it short. */
  text: string;
  href: string;
  /** Set for outbound links; `rel` is applied automatically. */
  external?: boolean;
  className?: string;
  /** Accessible name, when the visible label alone is not descriptive enough. */
  ariaLabel?: string;
}

/** Gap held between the last letter and the arrow at full travel. */
const ARROW_CLEARANCE_PX = 18;

const Arrow = () => (
  <svg viewBox="0 0 10 9" width="10" height="9" fill="none" aria-hidden="true" focusable="false">
    <path d="M0 4.5h8M5 1l3.5 3.5L5 8" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const WordShiftButton = ({
  text,
  href,
  external = false,
  className,
  ariaLabel,
}: WordShiftButtonProps) => {
  const rootRef = useRef<HTMLAnchorElement | null>(null);
  const wordRef = useRef<HTMLSpanElement | null>(null);
  const [shift, setShift] = useState(0);

  /* The word travels until its right edge sits one clearance short of the button's, so the letters
     come to rest against the incoming arrow instead of under it. Clamped at 0 — a word wider than
     its container must not be pushed further out of view. */
  const measure = useCallback(() => {
    const root = rootRef.current;
    const word = wordRef.current;
    if (!root || !word) return;
    const travel = root.getBoundingClientRect().right - word.getBoundingClientRect().right;
    setShift(Math.max(0, travel - ARROW_CLEARANCE_PX));
  }, []);

  useEffect(() => {
    measure();
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [measure]);

  const characters = [...text];

  return (
    <Link
      ref={rootRef}
      href={href}
      aria-label={ariaLabel}
      className={`word-shift${className ? ` ${className}` : ""}`}
      style={{ "--shift": `${shift}px` } as CSSProperties}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span className="word-shift__underline" aria-hidden="true">
        <span className="word-shift__rule word-shift__rule--right" />
        <span className="word-shift__rule word-shift__rule--left" />
      </span>

      {/* The label is split for the stagger, so it is re-announced as one string for assistive
          tech — a per-character DOM is read letter by letter otherwise. */}
      <span className="word-shift__word" ref={wordRef} aria-hidden="true">
        {characters.map((character, index) => (
          <span
            key={`${character}-${index}`}
            className="word-shift__char"
            style={{ "--i": index, "--n": characters.length } as CSSProperties}
          >
            {character}
          </span>
        ))}
      </span>
      <span className="sr-only">{text}</span>

      <span className="word-shift__arrow word-shift__arrow--right">
        <Arrow />
      </span>
      <span className="word-shift__arrow word-shift__arrow--left">
        <Arrow />
      </span>
    </Link>
  );
};
