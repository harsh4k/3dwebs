'use client';

import { animated, type SpringValue } from '@react-spring/web';
import { Fragment } from 'react';
import type { LetterStyle } from './timeline';

export interface ScrollLettersProps {
  text: string;
  p: SpringValue<number>;
  styleFn: (progress: number, letterIndex: number, total: number) => LetterStyle;
  className?: string;
  indexOffset?: number;
  totalOverride?: number;
}

export function ScrollLetters({
  text,
  p,
  styleFn,
  className,
  indexOffset = 0,
  totalOverride,
}: ScrollLettersProps) {
  const chars = [...text];
  const total = totalOverride ?? chars.filter((c) => c !== ' ' && c !== '\n').length;

  let letterIndex = -1;
  return (
    <>
      {chars.map((ch, i) => {
        if (ch === '\n') return <br key={i} />;
        if (ch === ' ') return <Fragment key={i}>{'\u00a0'}</Fragment>;
        letterIndex += 1;
        const idx = indexOffset + letterIndex;
        return (
          <span key={i} className="inline-flex align-bottom">
            <animated.span
              className={className}
              style={{
                display: 'inline-block',
                willChange: 'transform, filter, opacity',
                transform: p.to((v) => styleFn(v, idx, total).transform),
                filter: p.to((v) => styleFn(v, idx, total).filter),
                opacity: p.to((v) => styleFn(v, idx, total).opacity),
              }}
            >
              {ch}
            </animated.span>
          </span>
        );
      })}
    </>
  );
}
