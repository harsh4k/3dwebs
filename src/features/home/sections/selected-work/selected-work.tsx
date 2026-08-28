"use client";

import { RevealScope, RevealText } from "@/components/common/reveal";
import { WordShiftButton } from "@/components/common/word-shift";
import { featuredProjects, TOTAL_PROJECTS } from "@/content/projects";

import "./selected-work.css";

import { useWorkPin } from "./use-work-pin";
import { WorkCard } from "./work-card";

/**
 * Selected work — the project track scrolls sideways past a held title panel while the section
 * itself stays put, then releases to the footer.
 *
 * **Purpose statement** (animation rule: no purpose, no ship). The horizontal move does the job a
 * grid cannot: it makes the reader travel the length of the portfolio rather than take it in at a
 * glance, so eleven projects register as a body of work instead of a wall of thumbnails. The
 * per-card rise is what keeps that from being a conveyor belt — each panel arrives, rather than
 * simply being there.
 *
 * Below 768px, and under `prefers-reduced-motion`, the pin is dropped and the track becomes a
 * vertical stack. That branch is complete on its own terms — every card is at rest and legible,
 * nothing waits on an animation — which is the first-class-branch rule, not a disable switch.
 *
 * The count line is the only claim in the section and it reads from `TOTAL_PROJECTS`, which traces
 * to the credentials deck. Nothing here invents a metric.
 */

export const SelectedWork = () => {
  const { spacer, stage, track } = useWorkPin();

  const count = featuredProjects.length;

  return (
    <RevealScope tag="section" className="relative bg-paper text-ink">
      <h2 className="sr-only">Selected work</h2>

      <div ref={spacer} className="relative">
        <div ref={stage} className="work-stage flex items-center">
          <div ref={track} className="work-track">
            {/* Title panel — held at the left while the cards run past it. */}
            <div className="work-panel flex flex-col justify-center px-6 md:px-10">
              <RevealText
                tag="p"
                act="scope"
                variant="copy"
                className="font-mono text-sm uppercase tracking-widest text-ink-faint"
              >
                Selected work
              </RevealText>
              <RevealText
                tag="p"
                act="scope"
                variant="heading"
                delayIn={120}
                className="mt-4 text-4xl leading-[1.05] md:text-6xl"
              >
                Work we put our name to
              </RevealText>
              <RevealText
                tag="p"
                act="scope"
                variant="copy"
                delayIn={240}
                className="mt-6 max-w-md text-ink-muted"
              >
                {`${count} of ${TOTAL_PROJECTS} projects, shown in full.`}
              </RevealText>
            </div>

            {featuredProjects.map((project, index) => (
              <WorkCard key={project.slug} project={project} index={index} count={count} />
            ))}

            {/* Closing panel — the handoff out of the track. */}
            <div className="work-panel flex flex-col justify-center px-6 md:px-10">
              <RevealText tag="p" act="scope" variant="heading" className="text-3xl md:text-5xl">
                See the rest
              </RevealText>
              <div className="mt-8 w-56">
                <WordShiftButton text="All work" href="/work" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </RevealScope>
  );
};
