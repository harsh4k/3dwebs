// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import { useEffect, useRef } from "react";

import Image from "next/image";
import Link from "next/link";

import { RevealItem, RevealText } from "@/components/common/reveal";
import { waveDriftAt, waveUiOpacityAt, wipeLineAt } from "@/features/home/scene";
import { featuredProjects } from "@/content/projects";
import type { Image as WorkImage } from "@/content/schema";
import { getScrollProgress } from "@/utils/scroll-progress";

/**
 * Wave-scene overlay body — recreated from the Figma frame "Get Layers" 793:256 (styles/spacing
 * preserved, copy rewritten). Shares `SiteHeader`; cross-faded in by `ScrollFade` while the wave
 * curtain is the on-screen act. The whole block sits in the **right half** (the wave falls to the
 * lower-left): a **right-aligned heading** near the top, a **tagline**, and a **2×2 grid of work
 * cards** — four deck screenshots, full frame (`object-contain` on `bg-overlay-ink`).
 *
 * **Disappears by _clip_, not opacity** — as the tree wipes in, the overlay is clipped along the same
 * tilted wipe line, so the tree appears to cover it. **One `clip-path` on this root**, not per element:
 * the root is `inset-0`, i.e. exactly the viewport, so the wipe line's on-screen `y` (in % of viewport
 * height, from `wipeLineAt`) *is* the local percentage — no per-element geometry, nothing to cache, and
 * nothing to go stale. `none` while the line is still off the bottom.
 *
 * > It was briefly clipped **per element** to protect the cards' `backdrop-filter` (a `clip-path` on an
 * > ancestor makes it a backdrop-root and kills descendants' blur). The cards are opaque now, so that
 * > no longer applies — and per-element clipping actively broke once the reveals landed: it cached each
 * > element's `getBoundingClientRect()`, which by then included the reveal spring's `translateY`, so
 * > every local percentage was offset; and it put `clip-path` on the same elements carrying
 * > `filter: blur()`, which smeared cards clipped down to a sliver into horizontal bands over the next
 * > scene. Clipping the root keeps the animation and the clip on separate elements.
 *
 * (`HomeView` gives it no `disappear` window — the clip is what removes it.)
 */

const WORK: {
  href: string;
  num: string;
  desc: string;
  image: WorkImage;
}[] = featuredProjects.slice(0, 4).map((project) => ({
  href: "/work",
  num: project.client,
  desc: `${project.title} — ${project.deliverables.join(" · ")}`,
  image: project.images[0],
}));

export const WaveOverlay = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content) return;

    let raf = 0;
    let last = Number.NaN;
    const tick = (): void => {
      raf = requestAnimationFrame(tick);
      // Derive both **independently** from the shared, frame-memoised progress — not from a value
      // another rAF writes. A writer/reader store meant this loop could run first and clip to the
      // *previous* frame's line (a one-frame skew, visible as a glitch at the wipe). See [[wipe-line]].
      const progress = getScrollProgress();
      if (progress === last) return; // idle
      last = progress;

      // **Clip — on the root, in screen space.** The root spans the viewport, so `l`/`r`
      // (viewport-height %) are already its local percentages: keep everything above the line. Off the
      // bottom → no clip at all; past the top → empty polygon, so the whole overlay is gone.
      const { left: l, right: r } = wipeLineAt(progress);
      root.style.clipPath =
        l >= 100 && r >= 100 ? "none" : `polygon(0% 0%, 100% 0%, 100% ${r}%, 0% ${l}%)`;

      // **Parallax — on the content, under the clip.** `WipePass` slides the wave view down as the
      // tree wipes in; the UI has to travel with it or it reads as detached ("the mask lags"), even
      // though the cut is exactly on the line. Must not go on the root, or the clip would move too.
      content.style.transform = `translateY(${waveDriftAt(progress)}vh)`;

      // **Retire the leftover wedge.** The line is tilted so the top-right — where the heading sits —
      // is covered *last*, leaving a bright fragment of this act floating over a tree scene that
      // already owns the frame. The clip still does the disappearing; this only fades what's left once
      // the tree dominates, so the two acts are never stacked. See [[wipe-line]].
      content.style.opacity = `${waveUiOpacityAt(progress)}`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 select-none font-display text-overlay-ink">
      {/* Content layer — drifts down with the wave view during the wipe (the clip stays on the root,
          in screen space, so the cut holds its line while this slides under it). */}
      <div ref={contentRef} className="absolute inset-0">
      {/* Heading — pinned to the top-right, right-aligned. */}
      {/* One engine **per line** (the engine's tag is a wrapping flex row, so two `block` spans inside
          a single engine would sit side by side); the `<h2>` stacks them and keeps the heading outline. */}
      {/* The engine's tag is a **wrapping flex row**, so a line that doesn't fit wraps *inside* the
          engine. Right-anchored with no left bound, that growth ran off the left edge of a phone and
          collided with the tagline below — hence a left bound here, and a size that keeps both lines
          on one row each. `whitespace-nowrap` is desktop-only for the same reason. */}
      <h2 className="absolute left-[1.25rem] right-[1.25rem] top-[4.5rem] flex flex-col items-end text-right text-[1.75rem] font-extralight uppercase leading-[1.1] md:left-auto md:right-[1.875rem] md:top-[4.75rem] md:whitespace-nowrap md:text-[4rem]">
        <RevealText tag="span" variant="heading" act="wave">
          some of what
        </RevealText>
        <RevealText tag="span" variant="heading" act="wave" delayIn={90}>
          we’ve made
        </RevealText>
      </h2>

      {/* Tagline + work grid — a right-anchored block spanning from below the header to the bottom
          margin, so the grid (`flex-1`) and its cards **stretch to the screen height**. */}
      {/* On a phone the block spans the full width and the grid stays 2×2 but shorter — the cards are
          the section's content, so they keep their shape rather than collapsing to a list. */}
      <div className="absolute bottom-[1.25rem] left-[1.25rem] right-[1.25rem] top-[10.5rem] flex flex-col md:bottom-[1.875rem] md:left-auto md:right-[1.875rem] md:top-[14.9375rem] md:w-[41.625rem] md:max-w-[calc(100vw-3.75rem)]">
        <div className="md:w-[20rem] md:max-w-full">
          <RevealText
            tag="p"
            variant="copy"
            act="wave"
            delayIn={140}
            className="text-[0.8125rem] font-light leading-[1.15] md:text-[1rem] md:leading-[1.1]"
          >
            Abbott SmartPack. Making India Heart Strong. Synergycom. Enrituals. Pronto. Uncle Sams Kitchen. Electrotherm. Motorola. Lodha Palava. Fevicol Design Ideas. Indiabulls Foundation.
          </RevealText>
        </div>

        <ul className="mt-[1.25rem] grid flex-1 grid-cols-2 grid-rows-2 gap-[0.5rem] md:mt-[2.125rem] md:gap-[1rem]">
          {WORK.map((item, i) => (
            <RevealItem
              key={`${item.num}-${item.desc}`}
              tag="li"
              act="wave"
              index={i}
              count={WORK.length}
              delay={260}
              className="relative flex h-full flex-col overflow-hidden bg-overlay-ink p-[0.625rem] leading-[1.2] text-overlay-solid md:p-[1rem]"
            >
              <Link
                href={item.href}
                className="pointer-events-auto relative flex h-full w-full flex-col justify-between"
              >
                <span className="absolute inset-0">
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="(min-width: 768px) 20.3125rem, 48vw"
                    className="object-contain"
                    priority
                  />
                </span>
                <span className="relative text-[0.75rem] font-normal md:text-[1rem]">{item.num}</span>
                <p className="relative text-[0.75rem] font-normal uppercase md:text-[1rem]">{item.desc}</p>
              </Link>
            </RevealItem>
          ))}
        </ul>
      </div>
      </div>
    </div>
  );
};
