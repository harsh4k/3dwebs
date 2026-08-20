// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import { animated, useSpring } from "@react-spring/web";

/**
 * The little **green "live" square** on the tree-section CTA ("Start a Project"). It **blinks** — a
 * soft opacity pulse — to read as an active/available indicator (per the Figma).
 *
 * Motion is **spring-based** (hard rule #1 — no CSS keyframes/animations): a `useSpring` that loops
 * with `reverse`, easing the opacity down and back up forever. A client leaf so the surrounding
 * `TreeOverlay` can stay a Server Component.
 */
export const LiveDot = () => {
  const style = useSpring({
    from: { opacity: 1 },
    to: { opacity: 0.2 },
    loop: { reverse: true },
    config: { tension: 90, friction: 18 },
  });
  return (
    <animated.span
      aria-hidden
      style={style}
      className="size-[0.375rem] shrink-0 bg-overlay-accent"
    />
  );
};
