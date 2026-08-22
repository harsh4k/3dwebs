"use client";

import { animated, useReducedMotion, useSpring } from "@react-spring/web";

/**
 * The small down-chevron nudge under the hero's "scroll" label. A looping,
 * transform-only bounce — cadence matches `LiveDot`'s ambient pulse since
 * there's no shared duration/easing token to pull from. A client leaf so
 * `HeroOverlay` can stay a Server Component.
 */
export const ScrollCue = () => {
  const reduce = useReducedMotion();
  const style = useSpring({
    y: reduce ? 0 : 0.25,
    loop: reduce ? false : { reverse: true },
    immediate: Boolean(reduce),
    config: { tension: 90, friction: 18 },
  });
  return (
    <animated.span
      aria-hidden
      style={{ transform: style.y.to((v) => `translateY(${v}rem)`) }}
      className="inline-block"
    >
      ↓
    </animated.span>
  );
};
