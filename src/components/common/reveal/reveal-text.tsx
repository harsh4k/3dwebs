// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import TextEngine from "spring-text-engine";

import { useActActive } from "./act-window";

import type { RevealAct } from "./act-window";
import type { ReactNode } from "react";

/**
 * Scene text reveal — the single way copy animates in this project (hard rule #1: text animation is
 * `spring-text-engine`, never a hand-rolled component).
 *
 * Two variants, both drifting up **from below** through a **blur + opacity** dissolve:
 *  - `"heading"` — **per letter**, tight stagger. For the section `<h1>`/`<h2>`s.
 *  - `"copy"` — **per word**, looser stagger. For taglines, descriptions, labels.
 *
 * **Exit is the entry played backwards.** The engine already models it that way — `*Out` *is* the
 * resting state — but only if you ask for it: **`immediateOut` defaults to `true`**, which makes
 * `playOut` fire with `immediate: true` *and* zeroes every out-delay, so the text **snaps** to hidden
 * with no motion and no stagger. `immediateOut={false}` is what turns the exit into the real reversed
 * animation, staggered like the entry.
 *
 * **Triggering.** The overlays are pinned (`fixed inset-0`), so they never enter or leave the viewport
 * and an observer fires once at mount and never again. Instead the act's on-screen window drives
 * **`enabled`** — the switch the engine plays in and out on for every non-`manual` mode. That works in
 * *both* scroll directions, which a progress trigger cannot (progress only ever increases going
 * forward, so it can never walk the animation back out).
 *
 * Springs are deliberately **soft**: low tension against high friction, so letters ease up and settle
 * without snapping or overshooting. No `overflow` clip — the blur needs to bleed past the glyph box.
 * Percentage offsets keep `In`/`Out` the same value *type* (mixing `0` with `'0%'` throws).
 */

type RevealVariant = "heading" | "copy";

interface RevealTextProps {
  /** Semantic element to render — `h1`, `h2`, `h3`, `p`, `span`… */
  tag: "h1" | "h2" | "h3" | "p" | "span" | "div";
  /** Letter-by-letter (headings) or word-by-word (copy). */
  variant?: RevealVariant;
  /** Act whose on-screen window plays it in and out. */
  act: RevealAct;
  className?: string;
  /** Stagger the whole block behind the one before it, in ms. */
  delayIn?: number;
  children: ReactNode;
}

const HIDDEN_FILTER = "blur(12px)";
const SHOWN_FILTER = "blur(0px)";
/** Slow and damped — `friction` well above `tension` means it eases in and settles, never springs. */
const SOFT = { mass: 1, tension: 88, friction: 30 };

export const RevealText = ({
  tag,
  variant = "heading",
  act,
  className,
  delayIn = 0,
  children,
}: RevealTextProps) => {
  const active = useActActive(act);

  const layer =
    variant === "heading"
      ? {
          letterOut: { y: "90%", opacity: 0, filter: HIDDEN_FILTER },
          letterIn: { y: "0%", opacity: 1, filter: SHOWN_FILTER },
          letterStagger: 22,
          letterConfig: SOFT,
        }
      : {
          wordOut: { y: "80%", opacity: 0, filter: HIDDEN_FILTER },
          wordIn: { y: "0%", opacity: 1, filter: SHOWN_FILTER },
          wordStagger: 45,
          wordConfig: SOFT,
        };

  return (
    <TextEngine
      tag={tag}
      className={className}
      mode="always"
      enabled={active}
      immediateOut={false}
      delayIn={delayIn}
      delayOut={delayIn}
      {...layer}
    >
      {children}
    </TextEngine>
  );
};
