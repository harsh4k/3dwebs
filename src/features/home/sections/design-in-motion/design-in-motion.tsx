"use client";

import Image from "next/image";
import { useMemo } from "react";

import { RevealScope, RevealText } from "@/components/common/reveal";
import { WordShiftButton } from "@/components/common/word-shift";
import { projects } from "@/content/projects";

import "./design-in-motion.css";

import { grid as gridConfig } from "./design-in-motion.config";
import { useMotionScene } from "./use-motion-scene";

/**
 * Design in Motion — the deck stills ride a helix through the camera, land in a grid, and the
 * section closes under five belts.
 *
 * **Purpose statement** (animation rule: no purpose, no ship). The section's whole claim is that
 * this studio can make things move, so the claim is made by moving rather than by asserting it —
 * the reader is shown the capability instead of told about it, which also means nothing here has
 * to be a sentence that Rule 0 would have to check. The helix specifically carries the work
 * through *depth* before Selected Work carries it *across*; two sections of sideways travel in a
 * row would read as one long conveyor belt.
 *
 * ⚠️ **The headline is 💡 PROPOSED — ours, not the client's.** "work in / motion" is descriptive
 * (it names what is on screen) and carries no claim, no metric and no date, so it is clear of
 * Rule 0. It still needs an entry in TBD before launch, like every other line of copy we wrote
 * rather than transcribed.
 *
 * The imagery is the credentials-deck stills, which Selected Work also uses further down. That
 * overlap is a known and accepted trade — see the plan for this change set. The helix shows them
 * curved, in motion and at speed, so they read as texture here and as evidence there.
 */

export const DesignInMotion = () => {
  /* Stable across renders: this array is the hook's only dependency, and a fresh one every render
     would tear down and rebuild the whole WebGL scene. */
  const sources = useMemo(() => projects.map((project) => project.images[0].src), []);

  const { spacer, stage, canvas, title, belts } = useMotionScene(sources);

  const fallback = projects.slice(0, gridConfig.count);

  return (
    <RevealScope tag="section" className="relative bg-cream text-ink">
      <h2 className="sr-only">Work in motion</h2>

      <div ref={spacer} className="relative">
        <div ref={stage} className="dim-stage">
          <canvas ref={canvas} className="dim-canvas" aria-hidden="true" />

          <div className="relative mx-auto flex min-h-[60vh] w-full max-w-[80rem] flex-col justify-center px-[1.25rem] py-[clamp(4rem,10vw,7rem)] md:px-[4rem]">
            <div ref={title} className="dim-title">
              <RevealText
                tag="p"
                act="scope"
                variant="copy"
                className="font-mono text-[clamp(12px,0.75rem,13px)] uppercase tracking-[0.08em] text-ink-muted"
              >
                In motion
              </RevealText>

              <p className="dim-title__line dim-title__line--lead mt-[1rem] font-hero text-[clamp(44px,9vw,120px)] font-medium lowercase leading-[0.9] tracking-[-0.02em]">
                work in
              </p>
              <p className="dim-title__line dim-title__line--trail text-right font-hero text-[clamp(44px,9vw,120px)] font-medium lowercase leading-[0.9] tracking-[-0.02em] text-heat">
                motion
              </p>
            </div>

            {/* The static layout. Default state — see `design-in-motion.css`. */}
            <div className="dim-fallback mt-[clamp(2.5rem,6vw,4rem)]">
              {fallback.map((project) => (
                <Image
                  key={project.slug}
                  src={project.images[0].src}
                  alt={project.images[0].alt}
                  width={project.images[0].width}
                  height={project.images[0].height}
                  sizes="(max-width: 767px) 50vw, 33vw"
                  className="h-auto w-full rounded-[8px]"
                />
              ))}
            </div>

            <div className="mt-[clamp(2.5rem,5vw,3.5rem)] w-56">
              <WordShiftButton text="Our services" href="/services" />
            </div>
          </div>

          <div ref={belts} className="dim-belts" aria-hidden="true" />
        </div>
      </div>
    </RevealScope>
  );
};
