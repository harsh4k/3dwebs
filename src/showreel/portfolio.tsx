'use client';

import { animated, type SpringValue } from '@react-spring/web';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { pfTrackTransform, portfolioTransform } from './timeline';

export type PortfolioItem = {
  title: string;
  client: string;
  discipline: string;
  image: string;
  href: string;
};

export const Portfolio = memo(function Portfolio({
  p,
  items,
}: {
  p: SpringValue<number>;
  items: readonly PortfolioItem[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxPan, setMaxPan] = useState(0);
  const sectionTransform = useMemo(() => p.to(portfolioTransform), [p]);
  const trackTransform = useMemo(() => p.to((v) => pfTrackTransform(v, maxPan)), [p, maxPan]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      const vp = el.parentElement;
      if (!vp) return;
      const rightGap = (2.5 * Math.min(window.innerWidth, window.innerHeight)) / 100;
      const next = Math.max(0, el.scrollWidth - vp.clientWidth + rightGap);
      setMaxPan((prev) => (prev === next ? prev : next));
    };
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <animated.section
      className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-center overflow-hidden pt-[var(--pf-section-pt)] pb-[var(--pf-section-pb)] text-[var(--paper-alt)] will-change-transform"
      style={{ transform: sectionTransform }}
    >
      <div className="relative z-[1] overflow-hidden">
        <animated.div
          ref={trackRef}
          className="flex h-[var(--pf-card-h)] items-stretch gap-[var(--pf-gap)] pl-[var(--pf-gap)] will-change-transform"
          style={{ transform: trackTransform }}
        >
          {items.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="pointer-events-auto relative flex h-full w-[var(--pf-card-w)] max-w-[56rem] shrink-0 flex-col justify-between overflow-hidden rounded-[var(--radius-pf)] bg-[var(--pf-card)] p-[3.5vmin] text-white [backface-visibility:hidden] [transform:translateZ(0)]"
            >
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt=""
                  className="absolute inset-0 z-0 size-full object-cover"
                  decoding="async"
                />
              ) : null}
              <div className="absolute inset-0 z-1 bg-[linear-gradient(to_top,rgb(0_0_0_/_0.7)_0%,transparent_68%)]" />
              <p className="relative z-2 text-[1.7vmin] opacity-90">
                {item.client} · {item.discipline}
              </p>
              <h3 className="relative z-2 m-0 max-w-[85%] text-[clamp(1.25rem,4.2vw,3.75rem)] leading-[0.95] font-normal tracking-[-0.03em]">
                {item.title}
              </h3>
            </a>
          ))}
        </animated.div>
      </div>
    </animated.section>
  );
});
