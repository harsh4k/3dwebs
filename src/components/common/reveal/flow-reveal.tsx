// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import { useEffect, useState } from "react";

import { Inview } from "@/components/animation/springs/in-view";

import type { ReactNode } from "react";
import type { Tags } from "@/types/springs";

/**
 * Entrance reveal for content in **normal document flow** — sections that sit
 * below the pinned hero scene and therefore have no `RevealAct` window to gate
 * on, so neither `RevealText` nor `RevealItem` applies.
 *
 * Same spring language as `RevealItem` (fade + 30px rise, transform/opacity
 * only, no filter), built directly on `Inview` — the primitive both reveal
 * components are already built on. This is the same system, not a new one.
 *
 * `mode="once"`: flow content is read, not replayed. It should not fade in and
 * out every time it crosses the viewport edge on a scroll back-and-forth.
 *
 * No manual `prefers-reduced-motion` branch: `ReducedMotion` (mounted once at
 * the app root) flips react-spring's global `skipAnimation`, so this spring —
 * like every other one in the app — jumps straight to its resting, fully
 * visible state.
 *
 * **No-JS / pre-hydration safety.** `Inview`'s spring starts at `from`
 * (`opacity: 0`) until an `IntersectionObserver` fires. Mounting it from the
 * first paint would ship this content invisible-by-default, violating "nothing
 * may be hidden by default and revealed only by animation" and "works with JS
 * disabled" (CLAUDE.md). So children render plainly and fully visible until a
 * client-only `mounted` flag flips — byte-identical to the server output, so
 * there is no hydration mismatch and no dependency on JS for the content to
 * exist. Only then does `Inview` take over.
 *
 * ⚠️ `FooterReveal` (`src/features/footer/footer-reveal.tsx`) is the same shape,
 * written first and scoped to the footer's four zones by its own doc comment. It
 * is deliberately left alone rather than collapsed into this one — that would be
 * a refactor of working, unrelated code. If a third caller appears, collapse
 * both then.
 */

/** Matches `RevealItem`'s constants — soft, damped, no overshoot, drifts up from below. */
const FROM = { opacity: 0, y: 30 };
const TO = { opacity: 1, y: 0 };
const SOFT = { mass: 1, tension: 88, friction: 30 };

interface FlowRevealProps {
  className?: string;
  /** Stagger against sibling `FlowReveal`s in the same section — same spring, offset start. */
  delayIn?: number;
  /** Element the reveal renders as. Defaults to `div`. */
  tag?: Tags;
  children: ReactNode;
}

export function FlowReveal({ className, delayIn = 0, tag = "div", children }: FlowRevealProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const Tag = tag as "div";

  if (!mounted) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Inview tag={tag} mode="once" from={FROM} to={TO} config={SOFT} delayIn={delayIn} className={className}>
      {children}
    </Inview>
  );
}
