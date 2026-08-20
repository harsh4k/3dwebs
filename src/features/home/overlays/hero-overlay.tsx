import Link from 'next/link';

import { RotatingWord } from '@/features/home/overlays/rotating-word';
import { RevealItem, RevealText } from '@/components/common/reveal';
import { servicePillars } from '@/content/services';
import { positioning, site, taglineLastWords } from '@/content/site';

const TAGS = servicePillars;

const CTA_CLASS =
  'whitespace-nowrap text-[0.6875rem] font-normal uppercase leading-[1.1] tracking-[0.08em] underline decoration-from-font underline-offset-4 transition-opacity hover:opacity-70 md:text-[0.75rem]';

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
        <ul aria-label="Services" className="pointer-events-auto flex flex-col gap-[0.375rem]">
          {TAGS.map((pillar, i) => (
            <RevealItem
              key={pillar.slug}
              act="hero"
              tag="li"
              index={i}
              count={TAGS.length}
              delay={720}
              className="text-[0.6875rem] font-light uppercase leading-[1.2] tracking-[0.06em] md:text-[0.75rem]"
            >
              <Link href={`/services#${pillar.slug}`} className="pointer-events-auto underline-offset-4 hover:underline">
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
            className="text-[0.75rem] font-normal leading-[1.45] md:text-[0.8125rem]"
          >
            {positioning}
          </RevealText>
        </div>
      </div>
    </div>
  );
};
