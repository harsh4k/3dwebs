import Link from 'next/link';

import { RotatingWord } from '@/features/home/overlays/rotating-word';
import { ScrollCue } from '@/features/home/overlays/scroll-cue';
import { RevealItem, RevealText } from '@/components/common/reveal';
import { servicePillars } from '@/content/services';
import { positioning, site, taglineLastWords } from '@/content/site';

const TAGS = servicePillars;

/**
 * `inline-flex` + `min-h-[2.75rem]` because these two are the hero's only calls to action and their
 * boxes were **18px tall** — a text baseline, not a target. Height is claimed rather than padding
 * added, so the underline stays welded to the text; the row simply centres a taller box. Desktop
 * drops back to the natural height, where a pointer makes 18px perfectly hittable.
 */
const CTA_CLASS =
  'inline-flex min-h-[2.75rem] items-center whitespace-nowrap text-[0.8125rem] font-normal uppercase leading-[1.1] tracking-[0.08em] underline decoration-from-font underline-offset-4 transition-opacity hover:opacity-70 md:min-h-0 md:text-[0.875rem]';

/**
 * Hero copy sits in the corners so the glyph keeps the centre. Tagline + CTAs
 * anchor the **left**; services and the positioning line hold the bottom.
 * The last tagline word cycles (people / partner / agency) in a clipped slot.
 */
export const HeroOverlay = () => {
  return (
    <div className="pointer-events-none absolute inset-0 select-none font-display text-overlay-ink">
      <div className="absolute left-[1.25rem] right-[1.25rem] top-[5.5rem] flex flex-col items-start md:right-auto md:left-[1.875rem] md:w-[26rem] md:max-w-[40vw]">
        <p className="flex flex-col items-start text-left text-[1.5rem] font-extralight uppercase leading-[1.08] tracking-[-0.03em] md:text-[2.5rem]">
          <RevealText tag="span" variant="heading" act="hero">
            the digital
          </RevealText>
          <span className="flex justify-start gap-[0.35em]">
            <RevealText tag="span" variant="heading" act="hero" delayIn={90}>
              branding
            </RevealText>
            <RotatingWord words={taglineLastWords} act="hero" />
          </span>
        </p>

        <div className="pointer-events-auto mt-[1.25rem] flex flex-wrap items-center justify-start gap-x-[1.75rem] gap-y-[0.625rem] md:mt-[1.375rem]">
          <RevealItem act="hero" index={0} count={2} delay={420}>
            <a href={`mailto:${site.email}`} className={CTA_CLASS}>
              start a project
              <span aria-hidden className="text-heat">
                {' '}
                →
              </span>
            </a>
          </RevealItem>
          <RevealItem act="hero" index={1} count={2} delay={420}>
            <Link href="/work" className={CTA_CLASS}>
              see the work
              <span aria-hidden> →</span>
            </Link>
          </RevealItem>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-[1.25rem] px-[1.25rem] pb-[1.25rem] md:flex-row md:items-end md:justify-between md:gap-[2rem] md:px-[1.875rem] md:pb-[1.875rem]">
        {/* The scroll cue used to be an absolutely-positioned sibling at `bottom-[6.5rem]`. That
            clears this row on desktop, where it is `flex-row` and only one line tall — but on
            mobile the row stacks, grows to ~200px, and the fixed offset dropped the cue straight
            on top of the positioning paragraph. Moving it inside the row makes it the first item
            of the mobile column, so it can never collide however the paragraph wraps.
            From `md` up it goes back to `absolute` at the same `bottom-[7rem]`, measured against
            this row's box — whose bottom edge is the viewport's — so desktop is unchanged, and
            being out of flow it leaves the two remaining children to `justify-between` as before. */}
        <div className="flex justify-center md:absolute md:inset-x-0 md:bottom-[7rem]">
          <RevealItem act="hero" delay={200}>
            <span className="flex flex-col items-center gap-[0.375rem] text-[0.6875rem] uppercase leading-[1.1] tracking-[0.14em] text-overlay-ink/70">
              scroll
              <ScrollCue />
            </span>
          </RevealItem>
        </div>

        <ul aria-label="Services" className="pointer-events-auto flex flex-col gap-[0.375rem]">
          {TAGS.map((pillar, i) => (
            <RevealItem
              key={pillar.slug}
              act="hero"
              tag="li"
              index={i}
              count={TAGS.length}
              delay={720}
              className="text-[0.8125rem] font-light uppercase leading-[1.2] tracking-[0.06em] md:text-[0.875rem]"
            >
              {/* 24px, not the 44px the two hero CTAs get. These are a secondary three-line set
                  sitting directly on the scene, and at 44 each the block grew ~80px, floated up
                  over the beans and read as a loose list rather than a typographic stack. 24px is
                  the WCAG 2.2 AA floor (2.5.8), roughly fills the existing line pitch, and costs
                  the composition almost nothing. The primary actions still get the full 44. */}
              <Link
                href={`/services#${pillar.slug}`}
                className="pointer-events-auto inline-flex min-h-[1.5rem] items-center underline-offset-4 hover:underline md:min-h-0"
              >
                {pillar.name}
              </Link>
            </RevealItem>
          ))}
        </ul>

        <div className="md:w-[22rem] md:max-w-[36vw]">
          <RevealText
            act="hero"
            tag="p"
            variant="copy"
            delayIn={980}
            className="text-[0.875rem] font-normal leading-[1.45] md:text-[0.9375rem]"
          >
            {positioning}
          </RevealText>
        </div>
      </div>
    </div>
  );
};
