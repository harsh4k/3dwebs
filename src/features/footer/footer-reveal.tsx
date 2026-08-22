// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import { useEffect, useRef, useState } from "react";

import type { ReactNode } from "react";

/**
 * The footer's entrance reveal — a fade + rise on the four footer zones, staggered.
 *
 * **Why this one is not a spring.** Every other reveal in the app runs on `@react-spring/web`,
 * and this did too, through `Inview`. But `SiteFooter` is the *global* footer: it renders on
 * `/work`, `/services`, `/about` and `/contact`, none of which use a spring for anything else.
 * So this single fade was pulling the whole spring runtime — **~50KB gzipped** — onto four routes
 * whose entire job is to render a heading and a list. That is most of why a text page cost 204KB
 * ([[audit-2026-08-22#B1]]). The motion is a soft, critically-damped spring with no overshoot,
 * which `--ease-out-quint` reproduces closely enough that the two are hard to tell apart side by
 * side — so the physics engine was buying nothing here that a transition does not.
 *
 * Springs remain correct on the home page, where the scene, the overlays and the act-window
 * system genuinely need interruptible, reversible motion. See [[TBD#S9]].
 *
 * **No-JS / pre-hydration.** Children render visible. Nothing is ever hidden by default, so with
 * JavaScript off the footer is simply present — no `opacity:0` shipped in the HTML.
 *
 * **No first-paint flash.** The old shape rendered visible, then hid, then animated in, because
 * arming happened in an effect after the element had already painted. Here the effect measures
 * first: anything **already on screen at mount stays visible and never animates** — it has been
 * seen, so revealing it would be a lie. Only elements still below the fold are hidden and armed,
 * and those are off-screen while it happens, so the swap is invisible.
 */

/** Matches `RevealItem`'s spring in feel — drifts up from below, no overshoot. */
const RISE_PX = 30;

interface FooterRevealProps {
  className?: string;
  /** Stagger against sibling `FooterReveal`s in the same footer, in ms. */
  delayIn?: number;
  children: ReactNode;
}

export function FooterReveal({ className, delayIn = 0, children }: FooterRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  /** `null` = never armed, so it renders plainly. This is the server and no-JS state. */
  const [hidden, setHidden] = useState<boolean | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Reduced motion is a branch, not a disable switch — but the *complete* reduced version of
       "content fades up as you reach it" is "content is already there". Never arming leaves the
       footer fully rendered and static, which is the whole behaviour, correctly. Handled here
       rather than in CSS because the transition is an inline style and a media query cannot
       reach it. `ReducedMotion` no longer covers this component — it only flips react-spring. */
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return; // already seen — leave it alone

    setHidden(true);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setHidden(false);
          io.disconnect();
        }
      },
      /* No negative bottom margin. `-10%` reads as "wait until it is properly on screen", but it
         shrinks the observer's viewport, and anything that only ever comes to rest inside that
         dead band can never intersect. The copyright line does exactly that: at the very bottom
         of a fully scrolled page it sits in the last 4% of the viewport, so it stayed at
         `opacity: 0` permanently — content hidden by animation, with no scroll left to fix it.
         Plain intersection fires slightly earlier and cannot strand anything. */
      { rootMargin: "0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      data-reveal={hidden === null ? undefined : hidden ? "out" : "in"}
      style={
        hidden === null
          ? undefined
          : {
              opacity: hidden ? 0 : 1,
              transform: hidden ? `translate3d(0, ${RISE_PX}px, 0)` : "translate3d(0, 0, 0)",
              transition: `opacity var(--dur-reveal) var(--ease-out-quint) ${delayIn}ms, transform var(--dur-reveal) var(--ease-out-quint) ${delayIn}ms`,
              willChange: hidden ? "opacity, transform" : undefined,
            }
      }
    >
      {children}
    </div>
  );
}
