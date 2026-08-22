"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";

import { projects } from "@/content/projects";
import { prefersReducedMotion, wantsPointer } from "@/lib/scene/device";
import { CaseModal } from "@/features/work/case-modal";
import { useScroll } from "@/hooks/smooth-scroll/use-scroll";
import { setCursorHint } from "@/components/common/user-cursor/user-cursor";

import { applyBrandPalette, createCarouselConfig } from "./gl/config";
import { setWorkCarouselVisible } from "./scene-gate";
import { WorkCarouselFallback } from "./work-carousel-fallback";

const scrollRangeVh = (count: number): number => Math.max(240, count * 40);

export const WorkCarousel = () => {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(true);
  const apiRef = useRef<{ dispose: () => void; focusIndex: (index: number) => void } | null>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const count = projects.length;
  const selected = projects.find((project) => project.slug === selectedSlug) ?? null;

  const pageSlot = useCallback(() => {
    const track = trackRef.current;
    if (!track || count < 2) return 0;
    const total = track.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, -track.getBoundingClientRect().top / total)) * (count - 1) - count / 2;
  }, [count]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track || count < 2) return;
      const total = track.offsetHeight - window.innerHeight;
      const top = track.offsetTop + (index / (count - 1)) * total;
      const lenis = useScroll.getState().lenis;
      if (lenis) {
        lenis.scrollTo(top, { duration: 1.1 });
        return;
      }
      window.scrollTo({ top, behavior: "smooth" });
    },
    [count],
  );

  useEffect(() => {
    setReduce(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (reduce) return;
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry?.isIntersecting);
        pausedRef.current = !visible;
        setWorkCarouselVisible(visible);
      },
      { threshold: 0.15 },
    );
    observer.observe(stage);
    return () => {
      observer.disconnect();
      setWorkCarouselVisible(false);
    };
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    void import("./gl/scene").then(({ createCarousel }) => {
      if (cancelled || !canvas) return;
      const config = createCarouselConfig();
      applyBrandPalette(config);
      config.trail = wantsPointer();
      const api = createCarousel(canvas, {
        images: projects.map((project) => project.images[0]?.src ?? ""),
        config,
        pointer: wantsPointer(),
        trail: wantsPointer(),
        getPageSlot: pageSlot,
        isPaused: () => pausedRef.current,
        onActiveChange: setActive,
        onCardClick: (index) => {
          const project = projects[index];
          if (!project) return;
          setTrigger(canvas);
          setSelectedSlug(project.slug);
        },
      });
      apiRef.current = api;
      dispose = api.dispose;
      setReady(true);
    });

    return () => {
      cancelled = true;
      dispose?.();
      apiRef.current = null;
      setReady(false);
    };
  }, [pageSlot, reduce]);

  // Cursor hint — the canvas is the carousel's whole interactive surface, so hovering it
  // at all is the signal (per-card precision lives inside the GL scene's own pointer
  // picking and isn't exposed through its public API). Shell-only wiring: no `gl/` edits.
  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onEnter = () => setCursorHint(true);
    const onLeave = () => setCursorHint(false);
    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("pointerleave", onLeave);
    return () => {
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("pointerleave", onLeave);
      setCursorHint(false);
    };
  }, [reduce]);

  const openActive = () => {
    const project = projects[active];
    if (!project) return;
    setTrigger(stageRef.current);
    setSelectedSlug(project.slug);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      scrollToIndex(Math.min(count - 1, active + 1));
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      scrollToIndex(Math.max(0, active - 1));
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openActive();
    }
  };

  return (
    <section
      ref={trackRef}
      id="work-helix"
      aria-label="Selected work"
      className="relative z-20 bg-cream text-ink"
      style={{ height: `${scrollRangeVh(count)}vh` }}
    >
      <div
        ref={stageRef}
        className="relative sticky top-0 flex h-svh flex-col"
        tabIndex={reduce ? undefined : 0}
        onKeyDown={reduce ? undefined : onKeyDown}
      >
        <div className={`min-h-0 flex-1 ${ready && !reduce ? "hidden" : ""}`}>
          <WorkCarouselFallback projects={projects} />
        </div>
        {!reduce ? (
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 size-full ${ready ? "block" : "hidden"}`}
            aria-hidden
          />
        ) : null}
        {!reduce && ready ? (
          <div className="pointer-events-none absolute inset-x-[1.25rem] bottom-[1.5rem] z-10 md:inset-x-[1.875rem]">
            <p className="text-[0.75rem] uppercase tracking-[0.08em]">{projects[active]?.client}</p>
            <h2 className="relative mt-[0.35rem] w-fit font-display text-[1.75rem] font-extralight leading-[1.1] md:text-[2.5rem]">
              {projects[active]?.title}
              <span aria-hidden className="absolute inset-x-0 -bottom-[0.2rem] h-[0.15rem] bg-heat" />
            </h2>
            <p className="mt-[0.5rem] text-[0.8125rem] text-ink-muted">
              {projects[active]?.deliverables.join(" · ")}
            </p>
            <button
              type="button"
              className="pointer-events-auto mt-[0.85rem] min-h-[44px] text-[0.875rem] underline decoration-from-font underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              onClick={openActive}
            >
              view case
            </button>
          </div>
        ) : null}
      </div>
      <CaseModal project={selected} onClose={() => setSelectedSlug(null)} returnFocus={trigger} />
    </section>
  );
};
