'use client';

import { animated, useSpring } from '@react-spring/web';
import { Zen_Kaku_Gothic_New } from 'next/font/google';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ProgressTrigger } from '@/components/animation/springs/progress-trigger';
import { ClosingStage } from '@/features/footer/closing-stage';
import { assets } from './assets';
import { showreelCopy as c } from './copy';
import { HeroCard } from './hero-card';
import { Marquee } from './marquee';
import { Portfolio } from './portfolio';
import { ServiceCard } from './service-card';
import { SphereCard } from './sphere-card';
import {
  GRID_ITEMS,
  auroraOpacity,
  cameraRigTransform,
  card1Height,
  card1Opacity,
  card1Transform,
  card1Width,
  card4Opacity,
  cardZIndex,
  carouselCtaReveal,
  carouselTransform,
  ctaReveal,
  gridItemRadius,
  gridItemTransform,
  gridOpacity,
  marqueeBlur,
  marqueeOpacity,
  sceneVisibility,
  sideCardTransform,
  stageBackdropOpacity,
  targetOpacity,
  targetRadius,
  targetTransform,
  type SceneVisibility,
} from './timeline';
import { useShowreelLayout } from './use-showreel-layout';
import { FlameBackground } from './webgl/flame-background';
import './showreel.css';

const zen = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export function ShowreelStage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const rootRef = useRef<HTMLElement>(null);
  const [rootEl, setRootEl] = useState<HTMLElement | null>(null);
  useEffect(() => setRootEl(rootRef.current), [mounted]);
  const { geo } = useShowreelLayout(rootEl);

  const trackRef = useRef<HTMLDivElement>(null);
  const [{ p }, api] = useSpring(() => ({ p: 0 }));

  const s = useMemo(
    () => ({
      aurora: p.to(auroraOpacity),
      backdrop: p.to(stageBackdropOpacity),
      marqueeOpacity: p.to(marqueeOpacity),
      marqueeBlur: p.to((v) => `blur(${marqueeBlur(v)}px)`),
      cameraRig: p.to(cameraRigTransform),
      carousel: p.to(carouselTransform),
      card1Width: p.to(card1Width),
      card1Height: p.to(card1Height),
      card1Transform: p.to(card1Transform),
      card1Opacity: p.to(card1Opacity),
      card4Opacity: p.to(card4Opacity),
      z0: p.to((v) => cardZIndex(v, 0)),
      z1: p.to((v) => cardZIndex(v, 1)),
      z2: p.to((v) => cardZIndex(v, 2)),
      z3: p.to((v) => cardZIndex(v, 3)),
      side90: p.to((v) => sideCardTransform(v, 90)),
      side180: p.to((v) => sideCardTransform(v, 180)),
      side270: p.to((v) => sideCardTransform(v, 270)),
      gridOpacity: p.to(gridOpacity),
      targetRadius: p.to((v) => `${targetRadius(v)}px`),
      targetOpacity: p.to(targetOpacity),
      ctaReveal: p.to(carouselCtaReveal),
      ctaTranslate: p.to((v) => `translateY(${(1 - carouselCtaReveal(v)) * 2.5}vh)`),
      closeReveal: p.to(ctaReveal),
    }),
    [p],
  );

  const gridTiles = useMemo(
    () =>
      GRID_ITEMS.map((item, i) => (
        <animated.div
          key={`${item.tx}-${item.ty}-${i}`}
          aria-hidden
          className="absolute top-1/2 left-1/2 z-[-1] overflow-hidden bg-cover bg-center"
          style={{
            width: item.w,
            height: item.h,
            backgroundImage: `url(${item.image})`,
            transform: gridItemTransform(item),
            borderRadius: gridItemRadius(item),
            opacity: s.gridOpacity,
          }}
        />
      )),
    [s.gridOpacity],
  );

  const [vis, setVis] = useState<SceneVisibility>(() => sceneVisibility(0));
  const visRef = useRef(vis);
  const updateVisibility = (progress: number) => {
    const next = sceneVisibility(progress);
    const prev = visRef.current;
    if (
      next.hero !== prev.hero ||
      next.aurora !== prev.aurora ||
      next.sphere !== prev.sphere ||
      next.target !== prev.target ||
      next.portfolio !== prev.portfolio
    ) {
      visRef.current = next;
      setVis(next);
    }
  };

  if (!mounted) {
    return (
      <section
        ref={rootRef}
        id="showreel"
        className={`showreel ${zen.className}`}
        aria-label="Showreel"
        style={{ height: `${geo.trackVh}vh` }}
      />
    );
  }

  return (
    <section ref={rootRef} id="showreel" className={`showreel ${zen.className}`} aria-label="Showreel">
      <animated.div aria-hidden className="pointer-events-none fixed inset-0 z-30" style={{ opacity: s.aurora }}>
        <FlameBackground className="absolute inset-0" active={vis.aurora} />
      </animated.div>

      <div ref={trackRef} className="showreel-track relative" style={{ height: `${geo.trackVh}vh` }}>
        <div className="showreel-sticky p-[4vmin]">
          <animated.div aria-hidden className="absolute inset-0 z-0 bg-white" style={{ opacity: s.backdrop }} />

          <animated.div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-0 z-[1] w-screen -translate-y-1/2"
            style={{ opacity: s.marqueeOpacity, filter: s.marqueeBlur }}
          >
            <Marquee items={c.marquee} />
          </animated.div>

          <div className="relative z-[2] flex size-full items-center justify-center" style={{ perspective: '1500px' }}>
            <animated.div className="absolute inset-0" style={{ transform: s.cameraRig, transformStyle: 'preserve-3d' }}>
              <animated.div
                className="relative flex size-full items-center justify-center"
                style={{ transform: s.carousel, transformStyle: 'preserve-3d' }}
              >
                <animated.div
                  className="sr-face absolute overflow-hidden"
                  style={{
                    width: s.card1Width,
                    height: s.card1Height,
                    transform: s.card1Transform,
                    zIndex: s.z0,
                    opacity: s.card1Opacity,
                  }}
                >
                  <HeroCard p={p} images={{ stone: assets.stone, rotated: assets.hero2 }} active={vis.hero} />
                </animated.div>

                <animated.div
                  className="sr-face absolute h-[var(--sr-card-h)] w-[var(--sr-card-w)]"
                  style={{ transform: s.side90, zIndex: s.z1, opacity: s.card1Opacity }}
                >
                  <ServiceCard
                    variant="dark"
                    url={c.card2.url}
                    pillLabel={c.card2.pillLabel}
                    pillTitle={c.card2.pillTitle}
                    leadStrong={c.card2.leadStrong}
                    bg={assets.card2}
                  />
                </animated.div>

                <animated.div
                  className="sr-face absolute h-[var(--sr-card-h)] w-[var(--sr-card-w)]"
                  style={{ transform: s.side180, zIndex: s.z2, opacity: s.card1Opacity }}
                >
                  <ServiceCard
                    variant="light"
                    url={c.card3.url}
                    searchText={c.card3.searchText}
                    leadStrong={c.card3.leadStrong}
                    bg={assets.card3}
                  />
                </animated.div>

                <animated.div
                  className="sr-face absolute flex h-[var(--sr-card-h)] w-[var(--sr-card-w)] items-center justify-center overflow-visible"
                  style={{ transform: s.side270, zIndex: s.z3, opacity: s.card4Opacity }}
                >
                  <SphereCard
                    p={p}
                    geo={geo}
                    headingTop={c.sphere.headingTop}
                    headingBottom={c.sphere.headingBottom}
                    body={c.sphere.body}
                    star={assets.star}
                    cardLabel={c.sphere.cardLabel}
                    cardUrl={c.sphere.cardUrl}
                    cardHeading={c.sphere.cardHeading}
                    active={vis.sphere}
                  />
                </animated.div>
              </animated.div>

              {gridTiles}

              <animated.div
                className="absolute top-1/2 left-1/2 z-[-1] h-screen w-screen overflow-hidden bg-[var(--paper)]"
                style={{
                  transform: targetTransform(),
                  borderRadius: s.targetRadius,
                  opacity: s.targetOpacity,
                }}
              >
                <animated.div className="absolute inset-0 z-[2] overflow-hidden" style={{ opacity: s.closeReveal }}>
                  <ClosingStage active={vis.target} />
                </animated.div>
              </animated.div>
            </animated.div>
          </div>

          <animated.div
            className="pointer-events-none absolute inset-x-0 bottom-[2vmin] z-[3] flex justify-center px-[4vmin]"
            style={{ opacity: s.ctaReveal, transform: s.ctaTranslate }}
          >
            <Link
              href={c.workHref}
              className="pointer-events-auto inline-flex items-center justify-center rounded-[var(--radius-btn)] bg-[var(--ink)] px-[4.2vmin] py-[2vmin] text-[2.1vmin] leading-none text-[var(--paper)]"
            >
              {c.carouselCta}
            </Link>
          </animated.div>
        </div>
      </div>

      <Portfolio p={p} items={c.portfolio} />

      <ProgressTrigger
        tag="span"
        trigger={trackRef as React.RefObject<HTMLElement>}
        start="top top"
        end="bottom bottom"
        className="hidden"
        frameInterval={0}
        onChange={({ progress }) => {
          api.start({ p: progress, immediate: true });
          updateVisibility(progress);
        }}
      />

      <noscript>
        <ul className="sr-portfolio-fallback">
          {c.portfolio.map((item) => (
            <li key={item.title}>
              <a href={item.href}>
                {item.title}
                <span>
                  {item.client} · {item.discipline}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </noscript>
    </section>
  );
}
