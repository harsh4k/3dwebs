'use client';

import { animated, type SpringValue } from '@react-spring/web';
import { memo, useEffect, useState } from 'react';
import { useWindowSize } from '@/hooks/use-window-size';
import type { ShowreelGeo } from './geometry';
import { ScrollLetters } from './scroll-letters';
import {
  blackScreenTransform,
  blockLetterStyle,
  sphereBodyReveal,
  sphereLogoOpacity,
  sphereLogoTransform,
  sphereScale,
  sphereSceneScale,
  starMaskSize,
} from './timeline';
import { NestedSquares } from './nested-squares';

export const SphereCard = memo(function SphereCard({
  p,
  geo,
  headingTop,
  headingBottom,
  body,
  star,
  cardLabel,
  cardUrl,
  cardHeading,
  active = true,
}: {
  p: SpringValue<number>;
  geo: ShowreelGeo;
  headingTop: string;
  headingBottom: readonly string[];
  body: readonly string[];
  star: string;
  cardLabel: string;
  cardUrl: string;
  cardHeading: string;
  active?: boolean;
}) {
  const { width, height } = useWindowSize();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const vmin = mounted ? Math.min(width || 1, height || 1) / 100 : 0;

  const maskStyle = {
    WebkitMaskImage: `url(${star})`,
    maskImage: `url(${star})`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  } as const;

  const topLen = [...headingTop].filter((c) => c !== ' ').length;
  const lineLens = headingBottom.map((l) => [...l].filter((ch) => ch !== ' ').length);
  const total = topLen + lineLens.reduce((a, b) => a + b, 0);
  const offsets = [topLen];
  lineLens.slice(0, -1).forEach((len, i) => {
    const prev = offsets[i] ?? topLen;
    offsets.push(prev + len);
  });

  return (
    <div className="size-full">
      <div
        aria-hidden
        className="absolute inset-0 overflow-hidden rounded-[var(--radius-card)]"
        style={{ background: 'var(--card-violet)' }}
      >
        <div className="flex size-full flex-col p-[3.2vmin] font-sans text-[var(--paper)]">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-dark)] px-[1.8vmin] py-[0.8vmin] text-[1.4vmin] tracking-[0.02em] backdrop-blur-[10px]">
              {cardLabel}
            </span>
            <span className="text-[1.5vmin] tracking-[0.02em] opacity-85">{cardUrl}</span>
          </div>
          <h3 className="mt-auto max-w-[88%] text-[4.4vmin] leading-[1.05] font-normal">{cardHeading}</h3>
        </div>
      </div>

      <animated.div
        className="absolute top-1/2 left-1/2 h-[300vh] w-[300vw] bg-ink"
        style={{
          ...maskStyle,
          WebkitMaskSize: p.to(starMaskSize),
          maskSize: p.to(starMaskSize),
          transform: p.to((v) => blackScreenTransform(v, vmin, geo)),
        }}
      >
        <animated.div
          className="absolute top-1/2 left-1/2 h-screen w-screen"
          style={{
            transform: p.to((v) => `translate(-50%, -50%) scale(${sphereSceneScale(v, vmin, geo)})`),
          }}
        >
          <animated.div
            className="absolute top-1/2 left-1/2 z-[2] size-full"
            style={{
              transform: p.to((v) => `translate(-50%, -50%) scale(${sphereScale(v)})`),
            }}
          >
            <div className="absolute inset-0 z-[2] flex items-center justify-center">
              <NestedSquares active={active} />
            </div>
          </animated.div>

          <animated.span
            aria-hidden
            className="absolute top-1/2 left-1/2 z-[3] h-[12vh] w-[12vh] bg-paper"
            style={{
              ...maskStyle,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              transform: p.to(sphereLogoTransform),
              opacity: p.to(sphereLogoOpacity),
            }}
          />

          <h2 className="pointer-events-none absolute top-[4vmin] left-[4vmin] z-[4] m-0 text-left text-[var(--sr-heading-1)] leading-[0.85] font-normal whitespace-nowrap text-paper">
            <ScrollLetters text={headingTop} p={p} styleFn={blockLetterStyle} indexOffset={0} totalOverride={total} />
          </h2>

          <h2 className="pointer-events-none absolute right-[4vmin] bottom-[4vmin] z-[4] m-0 flex flex-col items-end text-right text-[var(--sr-heading-2)] leading-[0.85] font-normal whitespace-nowrap text-paper">
            {headingBottom.map((line, i) => (
              <span key={line}>
                <ScrollLetters
                  text={line}
                  p={p}
                  styleFn={blockLetterStyle}
                  indexOffset={offsets[i] ?? 0}
                  totalOverride={total}
                />
              </span>
            ))}
          </h2>

          <animated.div
            className="pointer-events-none absolute bottom-[5vmin] left-[4vmin] z-[4] flex max-w-[var(--sr-sphere-body-w)] flex-col gap-[1.8vmin] text-left text-[var(--sr-sphere-body-text)] leading-[1.45] font-light text-paper"
            style={{
              opacity: p.to(sphereBodyReveal),
              transform: p.to((v) => `translateY(${(1 - sphereBodyReveal(v)) * 2.5}vmin)`),
            }}
          >
            {body.map((para) => (
              <p key={para} className="m-0">
                {para}
              </p>
            ))}
          </animated.div>
        </animated.div>
      </animated.div>
    </div>
  );
});
