"use client";

import { useCallback, useState } from 'react';

import { FlowReveal } from '@/components/common/reveal';
import { useScroll } from '@/hooks/smooth-scroll/use-scroll';
import { prefersReducedMotion } from '@/lib/scene/device';

import { NeedsBar } from './needs-bar';
import { NeedsGrid } from './needs-grid';
import { NeedsHeadline } from './needs-headline';
import { useNeedsSelection } from './use-needs-selection';

/**
 * §5 of specs/home.md — the contact CTA. The last thing on the home page before
 * the footer, and the only section that does not defer to another page.
 *
 * The composition follows a supplied agency reference: a display headline, a
 * sentence bar that assembles what the visitor needs, and a grid of options that
 * feed it. What it does **not** follow is the reference's content. That site
 * runs an eleven-item flat list of capabilities of its own invention; every
 * label here is deck slide 2 verbatim, read out of `content/services.ts` and
 * grouped by its three confirmed pillars (Rule 0). It also does not follow the
 * reference's *shape*: a Didone serif headline and a red glyph on every row are
 * that brand's, not this one. The face is Jost (`font-hero`, the display face
 * Design.md §4 assigns because the real logotype is Futura-consistent), the
 * glyphs are `--ink-faint`, and `--heat` is spent exactly once.
 *
 * **`--heat` budget.** One element per viewport (CLAUDE.md). This section spends
 * its one on the `next` button once a selection exists — which is precisely what
 * specs/home.md §5 asks for ("this is where `--heat` earns its keep"). The
 * twelve row arrows are deliberately *not* hot; making them so would be twelve
 * heat elements in one viewport for decoration.
 *
 * **Ground: none.** This section paints no background at all, deliberately. The
 * home page has exactly one ground — `main`'s `bg-scene-backdrop`, which is
 * `--cream` `#fff2db`, the same value as `sceneConfig.colors.fog`, so the CSS
 * ground and the WebGL fog are the same colour and the page reads as one
 * continuous surface from the hero through to the footer. A section that paints
 * its own ground puts a seam in that surface. This one does not, so there is
 * nothing to seam.
 *
 * That is also why the retired stripe divider is not missed here: with a single
 * continuous ground there is no boundary to draw, and separation is carried by
 * whitespace and the type ladder instead.
 *
 * **The route out.** The selection travels to `/contact` as repeated `need`
 * query params on a real `<Link>` href, not in `sessionStorage`. That means the
 * button is a working link before hydration and with JS disabled, the result is
 * shareable and back-button-safe, and `/contact` can render the recap on the
 * server. The reference does this with `sessionStorage` plus a hard navigation,
 * which is none of those things.
 *
 * Client component because the selection is client state. It is a leaf of the
 * server-rendered `HomeView`, exactly as `WorkCarousel` is.
 */

const SECTION_ID = 'needs';
const HEADING_ID = 'needs-heading';
const OPTIONS_ID = 'needs-options';

export function NeedsSection() {
  const { selected, toggle, remove, href, hasSelection, isSelected } = useNeedsSelection();
  const [pulseKey, setPulseKey] = useState(0);

  /**
   * The bar's `+`. It does not open a picker — the picker is the grid already on
   * the page, and duplicating it in a menu would be a ninth primitive. So this
   * brings the grid to the visitor and makes it wave.
   */
  const onAdd = useCallback(() => {
    const grid = document.getElementById(OPTIONS_ID);
    const lenis = useScroll.getState().lenis;

    if (grid) {
      // Centre the grid rather than top-align it, so the pulse below plays
      // fully inside the viewport instead of half off the bottom edge.
      const target =
        grid.getBoundingClientRect().top +
        window.scrollY -
        Math.max(0, (window.innerHeight - grid.getBoundingClientRect().height) / 2);

      if (lenis) {
        // ⚠️ Hand this to Lenis, never to `utils/scroll-to`. That helper flips
        // `isEnableScroll` off, which sets `html { overflow: hidden }` for 100ms
        // while it runs a native smooth scroll — so the scroll is fighting a
        // locked scroller and lands as a jerk. `work-carousel.tsx` already uses
        // this pattern; it is the one that works with the smooth-scroll layer.
        lenis.scrollTo(target, {
          duration: prefersReducedMotion() ? 0 : 1.1,
          immediate: prefersReducedMotion(),
        });
      } else {
        window.scrollTo({
          top: target,
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });
      }
    }

    setPulseKey((key) => key + 1);
  }, []);

  return (
    <section
      id={SECTION_ID}
      aria-labelledby={HEADING_ID}
      className="relative z-20 font-display text-ink"
    >
      <div className="px-[1.25rem] pt-[clamp(4rem,9vw,7rem)] pb-[clamp(4.5rem,10vw,8rem)] md:px-[4rem] lg:px-[5rem]">
        <div className="mx-auto flex w-full max-w-[96rem] flex-col items-center">
          <NeedsHeadline id={HEADING_ID} />

          <FlowReveal
            delayIn={220}
            className="mt-[clamp(2.5rem,5vw,4rem)] flex w-full justify-center"
          >
            <NeedsBar
              selected={selected}
              onRemove={remove}
              onAdd={onAdd}
              href={href}
              hasSelection={hasSelection}
            />
          </FlowReveal>

          <FlowReveal delayIn={320} className="mt-[clamp(3rem,6vw,5rem)] w-full">
            <NeedsGrid
              id={OPTIONS_ID}
              isSelected={isSelected}
              onToggle={toggle}
              pulseKey={pulseKey}
            />
          </FlowReveal>
        </div>
      </div>
    </section>
  );
}
