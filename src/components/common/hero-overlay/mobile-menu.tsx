// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import { animated, useSpring, useTransition } from "@react-spring/web";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * The header's **mobile navigation** — a burger that opens a full-screen black panel.
 *
 * Only mounted below `md`; the desktop header shows its two inline navs instead. The panel reuses the
 * preloader's language — the black of `--overlay-solid`, extra-light letter-spaced display type,
 * hairline rules — so the two full-screen moments on the site look like the same object.
 *
 * All motion is spring-based (hard rule #1): the burger's two rules cross into an X, the panel fades
 * and lifts in, and the links stagger via `useTransition`. Nothing here is a CSS transition.
 *
 * While open the page behind is locked (`overflow: hidden` on `<html>`) so the pinned 3D scene doesn't
 * scroll under the panel, and `Escape` closes it.
 */

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  items: readonly NavLink[];
  cta: NavLink;
}

export const MobileMenu = ({ items, cta }: MobileMenuProps) => {
  const [open, setOpen] = useState(false);
  // The panel is **portalled to `<body>`**: the header carries `backdrop-filter`, which makes it a
  // containing block for `position: fixed` descendants — rendered in place, `inset-0` would resolve
  // against the 3.25rem header and the panel would be a black strip under the bar.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock the page while the panel owns the screen — the scene is scroll-driven, so a stray scroll
  // behind the panel would fly the camera somewhere unrelated.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const panel = useSpring({
    opacity: open ? 1 : 0,
    y: open ? 0 : -12,
    config: { mass: 1, tension: 90, friction: 28 },
  });

  // Top and bottom rules of the burger converge and cross into an X.
  const top = useSpring({
    y: open ? 3 : 0,
    rotate: open ? 45 : 0,
    config: { mass: 1, tension: 180, friction: 22 },
  });
  const bottom = useSpring({
    y: open ? -3 : 0,
    rotate: open ? -45 : 0,
    config: { mass: 1, tension: 180, friction: 22 },
  });

  const links = useTransition(open ? [...items, cta] : [], {
    keys: (item: NavLink) => item.label,
    from: { opacity: 0, y: 16 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: 8 },
    trail: 55,
    config: { mass: 1, tension: 95, friction: 28 },
  });

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        // Above the panel so it stays tappable as the close control.
        className="relative z-[60] flex size-[1.75rem] flex-col items-center justify-center gap-[0.375rem]"
      >
        <animated.span style={top} className="block h-px w-[1.25rem] bg-overlay-ink" />
        <animated.span style={bottom} className="block h-px w-[1.25rem] bg-overlay-ink" />
      </button>

      {mounted &&
        createPortal(
          <>
            {/* Close control. Portalled with the panel, not left in the header: the pinned scene
                container is `isolation: isolate`, so the header's `z-20` is scoped *inside* it and
                can never rise above a body-level panel. Positioned to land exactly where the burger
                was, so the morph reads as one control. */}
            <animated.button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              style={{
                opacity: panel.opacity,
                pointerEvents: open ? "auto" : "none",
              }}
              className="fixed right-[1.25rem] top-0 z-[60] flex h-[3.25rem] w-[1.75rem] flex-col items-center justify-center gap-[0.375rem] md:hidden"
            >
              <animated.span style={top} className="block h-px w-[1.25rem] bg-overlay-ink" />
              <animated.span style={bottom} className="block h-px w-[1.25rem] bg-overlay-ink" />
            </animated.button>
            <animated.nav
            aria-label="Mobile"
            style={{
              ...panel,
              visibility: panel.opacity.to((o) => (o < 0.01 ? "hidden" : "visible")),
            }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-[1.75rem] bg-overlay-solid font-display text-overlay-ink md:hidden"
          >
            {links((style, item) => (
              <animated.a
                style={style}
                href={item.href}
                onClick={() => setOpen(false)}
                className={
                  item.label === cta.label
                    ? "text-[1.5rem] font-light uppercase tracking-[0.2em] underline decoration-from-font underline-offset-4"
                    : "text-[1.5rem] font-extralight uppercase tracking-[0.2em]"
                }
              >
                {item.label}
              </animated.a>
            ))}
            </animated.nav>
          </>,
          document.body,
        )}
    </div>
  );
};
