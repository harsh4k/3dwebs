"use client";

import Image from "next/image";

import { HoverBlur } from "@/components/common/hover-blur";
import { RevealItem, RevealText } from "@/components/common/reveal";

import type { Project } from "@/content/schema";

/**
 * One panel of the Selected Work track.
 *
 * The outer element holds the panel's width; the inner one carries the rise, because the pin
 * writes a `translate3d` to it every frame and must not fight the layout. That split is the whole
 * reason for `data-work-card-inner` — the loop needs a stable handle that is never also the thing
 * being sized.
 *
 * The rule down the left edge draws itself as the card arrives. It is a `scaleY` on a hairline,
 * not a `height` transition — animating height is a review failure here.
 */

interface WorkCardProps {
  project: Project;
  index: number;
  count: number;
}

export const WorkCard = ({ project, index, count }: WorkCardProps) => {
  const image = project.images[0];
  const label = `${project.client} — ${project.title}`;

  return (
    <article className="work-card work-panel relative px-6 md:px-10">
      <div data-work-card-inner className="work-card__inner flex h-full flex-col justify-center">
        {/* The drawing rule. Purely decorative — the card is fully legible without it. */}
        <span aria-hidden className="work-card__rule absolute inset-y-10 left-0 w-px bg-hairline" />

        <RevealItem act="scope" index={index} count={count} className="relative w-full">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 767px) 86vw, 50vw"
            className="h-auto w-full object-cover"
          />
        </RevealItem>

        <div className="mt-6 flex items-end justify-between gap-6">
          <div>
            <RevealText tag="h3" act="scope" variant="heading" className="text-2xl md:text-3xl">
              {project.title}
            </RevealText>
            <RevealText
              tag="p"
              act="scope"
              variant="copy"
              delayIn={80}
              className="mt-2 text-sm text-ink-muted"
            >
              {`${project.client} · ${project.deliverables.join(", ")}`}
            </RevealText>
          </div>

          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group shrink-0 text-sm"
              aria-label={`Visit ${label}`}
            >
              <HoverBlur text="Visit site" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
};
