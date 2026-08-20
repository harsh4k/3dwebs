"use client";

import { animated, useReducedMotion, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";

import { useActActive, type RevealAct } from "@/components/common/reveal/act-window";

const SOFT = { mass: 1, tension: 120, friction: 26 };
const INTERVAL_MS = 2400;

/**
 * Cycles the last tagline word in a clipped slot. Reduced motion holds the
 * first word (the confirmed tagline). `align-top` avoids the inline-block
 * overflow/baseline bug that let every word paint at once.
 */
export const RotatingWord = ({
  words,
  act,
}: {
  words: readonly string[];
  act: RevealAct;
}) => {
  const active = useActActive(act);
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || reduce || words.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [active, reduce, words]);

  const slide = useSpring({
    y: reduce ? 0 : -index,
    config: SOFT,
    immediate: Boolean(reduce),
  });

  const widest = words.reduce((a, b) => (a.length >= b.length ? a : b));

  return (
    <span
      className="relative inline-grid h-[1em] overflow-hidden align-top leading-none"
      aria-live="polite"
    >
      <span className="invisible col-start-1 row-start-1 h-[1em] whitespace-nowrap leading-none" aria-hidden>
        {widest}
      </span>
      <animated.span
        className="col-start-1 row-start-1 flex flex-col"
        style={{ transform: slide.y.to((value) => `translateY(${value}em)`) }}
        aria-hidden
      >
        {words.map((word) => (
          <span key={word} className="block h-[1em] shrink-0 whitespace-nowrap leading-none">
            {word}
          </span>
        ))}
      </animated.span>
      <span className="sr-only">{words[index]}</span>
    </span>
  );
};
