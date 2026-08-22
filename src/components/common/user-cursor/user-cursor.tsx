"use client";

import { animated, useReducedMotion, useSpring } from "@react-spring/web";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { site } from "@/content/site";

const ARROW = { mass: 0.6, tension: 380, friction: 32 };
const LABEL = { mass: 0.7, tension: 220, friction: 26 };
const PRESS = { mass: 0.5, tension: 500, friction: 28 };
const SIZE = 31;
const LABEL_OX = SIZE * 0.9;
const LABEL_OY = SIZE * 0.2 + 6;
const TILT = 25;
const HOVER_SCALE = 1.12;
const CHROME =
  ".staggered-menu-header, .staggered-menu-panel, .sm-toggle, .sm-logo, .sm-talk, .sm-header-actions";

/**
 * Hover-hint store — lets a sibling feature (currently just the work carousel) tell the
 * cursor to swap its label and scale up over an interactive surface. Same module-scope
 * store + `useSyncExternalStore` idiom `act-window.ts` already uses elsewhere in this
 * codebase for this exact kind of cross-component signal — no context, no provider.
 * (`scene-gate.ts` is a different, non-reactive polled getter/setter — not the same
 * pattern, don't cite it as precedent for this one.)
 */
let cursorHint = false;
const hintListeners = new Set<() => void>();

export const setCursorHint = (active: boolean): void => {
  if (cursorHint === active) return;
  cursorHint = active;
  hintListeners.forEach((listener) => listener());
};

const subscribeHint = (listener: () => void) => {
  hintListeners.add(listener);
  return () => hintListeners.delete(listener);
};

const getHintSnapshot = () => cursorHint;
const getHintServerSnapshot = () => false;

/**
 * Homepage pointer — Originkit UserCursor, ported to react-spring (Framer
 * Motion is rejected here). Fine pointers only. Label is the confirmed name,
 * unless a hinted surface (the work carousel) swaps it for "view".
 */
export const UserCursor = () => {
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const hint = useSyncExternalStore(subscribeHint, getHintSnapshot, getHintServerSnapshot);
  const last = useRef<{ x: number; y: number; t: number } | null>(null);

  const [arrow, arrowApi] = useSpring(() => ({ x: -9999, y: -9999, config: ARROW }));
  const [label, labelApi] = useSpring(() => ({ x: -9999, y: -9999, rotate: 0, config: LABEL }));
  const scale = useSpring({ scale: pressed ? 0.92 : hint ? HOVER_SCALE : 1, config: PRESS });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia("(pointer: fine)");
    const sync = () => setFine(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!fine || reduce) return;
    document.body.classList.add("user-cursor-on");
    return () => document.body.classList.remove("user-cursor-on");
  }, [fine, reduce]);

  useEffect(() => {
    if (!fine || reduce) return;

    const onMove = (event: MouseEvent) => {
      const overChrome = Boolean(
        event.target instanceof Element && event.target.closest(CHROME),
      );
      if (overChrome) {
        setVisible(false);
        last.current = null;
        return;
      }
      const x = event.clientX;
      const y = event.clientY;
      const now = performance.now();
      const prev = last.current;
      let tilt = 0;
      if (prev) {
        const dt = Math.max(1, now - prev.t);
        const vx = ((x - prev.x) / dt) * 1000;
        const vy = ((y - prev.y) / dt) * 1000;
        const norm = Math.min(1, Math.hypot(vx, vy) / 1500);
        tilt = (vx === 0 ? 0 : vx > 0 ? 1 : -1) * norm * TILT;
      }
      last.current = { x, y, t: now };
      arrowApi.start({ x, y });
      labelApi.start({ x: x + LABEL_OX, y: y + LABEL_OY, rotate: tilt });
      setVisible(true);
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => {
      setVisible(false);
      last.current = null;
      labelApi.start({ rotate: 0 });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      setPressed(false);
    };
  }, [fine, reduce, arrowApi, labelApi]);

  if (!fine || reduce) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[35]"
      aria-hidden
      style={{ opacity: visible ? 1 : 0 }}
    >
      <animated.div
        className="absolute top-0 left-0 origin-[0%_50%] rounded-full bg-paper px-2.5 py-1.5 font-display text-xs font-semibold leading-none text-ink"
        style={{ x: label.x, y: label.y, rotate: label.rotate, scale: scale.scale }}
      >
        {hint ? "view" : site.name}
      </animated.div>
      <animated.div
        className="absolute top-0 left-0 origin-[0%_0%] text-ink"
        style={{ x: arrow.x, y: arrow.y, scale: scale.scale, width: SIZE, height: SIZE }}
      >
        <svg
          width={SIZE}
          height={SIZE}
          viewBox="0 0 28 28"
          fill="none"
          className="block overflow-visible"
        >
          <path
            d="M5 3 L23 14 L14 16 L11 24 Z"
            fill="currentColor"
            stroke="currentColor"
            strokeOpacity={0.18}
            strokeWidth={0.6}
            strokeLinejoin="round"
          />
        </svg>
      </animated.div>
    </div>
  );
};
