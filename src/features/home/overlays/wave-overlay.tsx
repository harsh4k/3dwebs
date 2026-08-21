// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import { useEffect, useRef } from "react";
import { Oswald } from "next/font/google";

import { RevealText } from "@/components/common/reveal";
import { servicePillars } from "@/content/services";
import { awardsFraming, positioning, site } from "@/content/site";
import { waveDriftAt, waveUiOpacityAt, wipeLineAt } from "@/features/home/scene";
import { getScrollProgress } from "@/utils/scroll-progress";

import { Typewriter } from "./wave-typewriter";

const poster = Oswald({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const TICKER = [site.tagline, ...servicePillars.map((pillar) => pillar.name)] as const;

/**
 * Wave-scene overlay — copy around the particle field, Trionn-style: corner
 * statements and a large baseline ticker. Facts are confirmed only.
 *
 * **Disappears by _clip_, not opacity** — as the tree wipes in, the overlay is clipped along the same
 * tilted wipe line. **One `clip-path` on this root.**
 */
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
      const progress = getScrollProgress();
      if (progress === last) return;
      last = progress;

      const { left: l, right: r } = wipeLineAt(progress);
      root.style.clipPath =
        l >= 100 && r >= 100 ? "none" : `polygon(0% 0%, 100% 0%, 100% ${r}%, 0% ${l}%)`;

      content.style.transform = `translateY(${waveDriftAt(progress)}vh)`;
      content.style.opacity = `${waveUiOpacityAt(progress)}`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 select-none text-overlay-ink">
      <div ref={contentRef} className="absolute inset-0 font-display">
        <div className="absolute left-[1.25rem] top-[4.75rem] max-w-[16rem] md:left-[1.875rem] md:top-[5.25rem] md:max-w-[22rem]">
          <RevealText
            tag="p"
            variant="copy"
            act="wave"
            className="text-[0.8125rem] font-normal uppercase leading-[1.35] tracking-[0.08em] md:text-[0.875rem]"
          >
            {site.tagline}
          </RevealText>
        </div>

        <div className="absolute right-[1.25rem] top-[4.75rem] hidden max-w-[22rem] text-right md:block md:right-[1.875rem] md:top-[5.25rem]">
          <RevealText
            tag="p"
            variant="copy"
            act="wave"
            delayIn={80}
            className="justify-end text-[0.875rem] font-light leading-[1.45] md:text-[0.9375rem]"
          >
            {positioning}
          </RevealText>
        </div>

        <div className="absolute bottom-[22vmin] left-[1.25rem] max-w-[16rem] md:bottom-[28vmin] md:left-[1.875rem] md:max-w-[20rem]">
          <RevealText
            tag="p"
            variant="copy"
            act="wave"
            delayIn={140}
            className="text-[0.8125rem] font-normal uppercase leading-[1.4] tracking-[0.08em] md:text-[0.875rem]"
          >
            {awardsFraming}
          </RevealText>
        </div>

        <div className="absolute inset-x-0 bottom-[0.75rem] overflow-hidden md:bottom-[1.15rem]">
          <h2
            className={`${poster.className} px-[1.25rem] text-[clamp(2.75rem,11vw,8.5rem)] font-bold uppercase leading-[0.85] tracking-[-0.03em] md:px-[1.875rem]`}
          >
            <Typewriter words={TICKER} act="wave" speed={65} hold={2000} />
          </h2>
        </div>
      </div>
    </div>
  );
};
