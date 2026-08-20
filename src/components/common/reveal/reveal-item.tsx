// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import { Inview } from "@/components/animation/springs/in-view";

import { useActActive } from "./act-window";

import type { RevealAct } from "./act-window";
import type { HTMLAttributes, ReactNode } from "react";
import type { Tags } from "@/types/springs";

/**
 * The **non-text** counterpart to `RevealText` — glass pills, buttons, stat blocks, work cards, the
 * contact bar. Same motion language as the copy: drifts up **from below** and fades on the same soft
 * spring, so the page reads as one system rather than text moving one way and boxes another. (The copy
 * also blurs; these blocks can't — see `FROM`/`TO`.)
 *
 * Built on `<Inview>` (hard rule #1 — spring components, no CSS transitions). Like `RevealText` it is
 * gated by the act's on-screen window through **`enabled`** rather than the viewport: the overlays are
 * pinned, so `Inview`'s observer would report them in view forever.
 *
 * **`immediateOut={false}` is what makes the exit the entry reversed** — `Inview` defaults it to `true`,
 * which sets `immediate` on the spring and snaps the element back with no motion at all.
 *
 * `index`/`count` stagger a group, and the exit runs in **reverse order** (last in, first out), so the
 * group folds back the way it came.
 */

interface RevealItemProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Semantic element to render — `li`, `div`, `p`… */
  tag?: Tags;
  /** Act whose on-screen window plays it in and out. */
  act: RevealAct;
  /** Position within a group — staggers entry, and the exit in reverse. */
  index?: number;
  /** How many items in the group, so the exit can count down from the end. */
  count?: number;
  /** Per-step stagger, ms. */
  step?: number;
  /** Extra delay in front of the whole item, ms. */
  delay?: number;
  className?: string;
  children: ReactNode;
}

/**
 * **No `filter` here — deliberately.** Any non-`none` filter (even `blur(0px)` at rest) promotes the
 * element to its own composited layer, and a promoted layer takes an **ancestor's `clip-path` a frame
 * late**: the wave cards kept rendering past the tree-wipe line while the line itself was exactly
 * right, which reads as "the mask lags". Text keeps its blur — `RevealText`'s letters/words are never
 * the thing being clipped mid-motion — but these blocks rise and fade only.
 */
const FROM = { opacity: 0, y: 30 };
const TO = { opacity: 1, y: 0 };
/** Matches `RevealText`'s spring — soft, damped, no overshoot. */
const SOFT = { mass: 1, tension: 88, friction: 30 };

export const RevealItem = ({
  tag = "div",
  act,
  index = 0,
  count = 1,
  step = 80,
  delay = 0,
  className,
  children,
  ...rest
}: RevealItemProps) => {
  const active = useActActive(act);
  return (
    <Inview
      tag={tag}
      className={className}
      mode="always"
      enabled={active}
      immediateOut={false}
      from={FROM}
      to={TO}
      config={SOFT}
      delayIn={delay + index * step}
      delayOut={delay + (count - 1 - index) * step}
      {...rest}
    >
      {children}
    </Inview>
  );
};
