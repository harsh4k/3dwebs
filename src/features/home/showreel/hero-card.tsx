'use client';

import Link from 'next/link';
import { memo, useEffect } from 'react';
import { animated, to, useSpring, type SpringValue } from '@react-spring/web';
import { showreelCopy as c } from './copy';
import { ScrollLetters } from './scroll-letters';
import {
  heroContentFade,
  heroLetterStyle,
  heroSlidePan,
  heroSliderHeight,
  heroSliderWidth,
  heroTiltFade,
  templatesLetterStyle,
} from './timeline';
import { HeroGradient } from './webgl/hero-gradient';

export const HeroCard = memo(function HeroCard({
  p,
  images,
  active = true,
}: {
  p: SpringValue<number>;
  images: { stone: string; rotated: string };
  active?: boolean;
}) {
  const [tilt, tiltApi] = useSpring(() => ({
    rx: 0,
    ry: 0,
    config: { tension: 120, friction: 20 },
  }));

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      tiltApi.start({ rx: -ny * 9, ry: nx * 12 });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [tiltApi]);

  return (
    <div className="relative size-full overflow-hidden rounded-[var(--radius-card)] bg-ink">
      <HeroGradient className="absolute inset-0 z-[1]" active={active} />

      <animated.header
        className="pointer-events-none absolute inset-0 z-[3] flex p-5 md:p-10"
        style={{ opacity: p.to(heroContentFade) }}
      >
        <h2 className="flex flex-col items-start text-left text-[clamp(1.5rem,7vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.03em] text-paper">
          {c.heroLines.map((line, i) => (
            <span key={line} className={i === 1 ? 'opacity-40' : undefined}>
              <ScrollLetters text={line} p={p} styleFn={heroLetterStyle} />
            </span>
          ))}
        </h2>
      </animated.header>

      <div className="pointer-events-none absolute inset-0 z-[7] flex items-center justify-center">
        <h3 className="text-center text-[3.6vmin] font-normal leading-tight text-paper drop-shadow-lg [transform:rotate(-90deg)]">
          <ScrollLetters text={c.browse} p={p} styleFn={(prog, i) => templatesLetterStyle(prog, i)} />
        </h3>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[6]" style={{ perspective: '1400px' }}>
        <animated.div
          className="absolute top-1/2 left-1/2 overflow-hidden rounded-[var(--radius-slider)] will-change-transform"
          style={{
            width: p.to(heroSliderWidth),
            height: p.to(heroSliderHeight),
            transform: to([p, tilt.rx, tilt.ry], (pv, rx, ry) => {
              const f = heroTiltFade(pv);
              return `translate(-50%, -50%) rotateX(${rx * f}deg) rotateY(${ry * f}deg)`;
            }),
          }}
        >
          <animated.div
            className="absolute inset-0"
            style={{ transform: p.to((v) => `translateX(${heroSlidePan(v)}%)`) }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images.stone} alt="" className="size-full object-cover object-center" decoding="async" />
          </animated.div>
          <animated.div
            className="absolute top-0 left-full size-full overflow-hidden"
            style={{ transform: p.to((v) => `translateX(${heroSlidePan(v)}%)`) }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images.rotated}
              alt=""
              className="size-full object-cover object-center [transform:rotate(-90deg)_scale(1.85)]"
              decoding="async"
            />
          </animated.div>
        </animated.div>
      </div>

      <animated.div
        className="absolute bottom-0 left-0 z-[6] flex w-full flex-col gap-6 p-5 text-paper md:p-10"
        style={{ opacity: p.to(heroContentFade) }}
      >
        <p className="max-w-[36rem] text-[0.9375rem] leading-relaxed md:text-base">{c.heroBody}</p>
        <div className="pointer-events-auto flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          <Link
            href={c.workHref}
            className="rounded-[var(--radius-btn)] border border-paper/40 px-7 py-3 text-center text-[0.9375rem]"
          >
            {c.seeWork}
          </Link>
          <a
            href={c.mailto}
            className="rounded-[var(--radius-btn)] bg-paper px-7 py-3 text-center text-[0.9375rem] font-medium text-ink"
          >
            {c.startProject}
          </a>
        </div>
      </animated.div>
    </div>
  );
});
