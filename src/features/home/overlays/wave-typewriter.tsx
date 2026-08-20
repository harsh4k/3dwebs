"use client";

import { animated, useReducedMotion, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";

import { useActActive, type RevealAct } from "@/components/common/reveal/act-window";

type TypewriterProps = {
  words: readonly string[];
  act: RevealAct;
  speed?: number;
  hold?: number;
};

/**
 * Cycles through confirmed phrases: types, holds, deletes. Pauses while its
 * act is off-screen. Reduced motion shows the first phrase in full.
 */
export const Typewriter = ({
  words,
  act,
  speed = 70,
  hold = 2200,
}: TypewriterProps) => {
  const active = useActActive(act);
  const reduce = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const current = words[wordIndex] ?? "";

  useEffect(() => {
    if (reduce || !active || words.length === 0) return;

    if (!deleting && charIndex === current.length) {
      const pause = window.setTimeout(() => setDeleting(true), hold);
      return () => window.clearTimeout(pause);
    }

    if (deleting && charIndex === 0) {
      setDeleting(false);
      setWordIndex((index) => (index + 1) % words.length);
      return;
    }

    const tick = window.setTimeout(
      () => setCharIndex((index) => index + (deleting ? -1 : 1)),
      deleting ? speed / 2 : speed,
    );
    return () => window.clearTimeout(tick);
  }, [active, reduce, deleting, charIndex, current.length, hold, speed, words.length]);

  const cursor = useSpring({
    from: { opacity: 1 },
    to: { opacity: 0.15 },
    loop: { reverse: true },
    config: { tension: 180, friction: 18 },
    pause: reduce || !active,
  });

  if (words.length === 0) return null;

  const text = reduce || !active ? (words[0] ?? "") : current.slice(0, Math.max(0, charIndex));

  return (
    <span className="whitespace-nowrap">
      {text}
      <animated.span aria-hidden className="ml-[0.12em] inline-block text-heat" style={cursor}>
        |
      </animated.span>
    </span>
  );
};
