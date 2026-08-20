'use client';

import type { CSSProperties } from 'react';

const SQUARE_COUNT = 25;
const squares = Array.from({ length: SQUARE_COUNT }, (_, i) => i);

/**
 * Nested squares bloom — CSS stagger of scale + rotate on concentric borders.
 * Purpose: replace the particle sphere as the showreel's centrepiece without a
 * WebGL canvas. Default transform is mid-cycle so the graphic is whole if
 * animation is disabled or CSS never runs.
 */
export function NestedSquares({
  className,
  active = true,
}: {
  className?: string;
  active?: boolean;
}) {
  return (
    <div
      aria-hidden
      data-active={active ? 'true' : 'false'}
      className={`sr-nested-squares relative flex items-center justify-center ${className ?? ''}`}
    >
      {squares.map((index) => (
        <div
          key={index}
          className="sr-nested-square"
          style={{ '--i': index } as CSSProperties}
        />
      ))}
    </div>
  );
}
