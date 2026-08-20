'use client';

import { animated, easings, useSpring } from '@react-spring/web';
import { Fragment, memo } from 'react';

export const Marquee = memo(({ items }: { items: readonly string[] }) => {
  const [styles] = useSpring(() => ({
    from: { x: 0 },
    to: { x: -50 },
    loop: true,
    config: { duration: 25000, easing: easings.linear },
  }));

  return (
    <div className="flex w-screen overflow-hidden whitespace-nowrap">
      <animated.div className="flex items-center" style={{ transform: styles.x.to((x) => `translateX(${x}%)`) }}>
        <Strip items={items} />
        <Strip items={items} />
      </animated.div>
    </div>
  );
});
Marquee.displayName = 'Marquee';

function Strip({ items }: { items: readonly string[] }) {
  return (
    <>
      {items.map((item, i) => (
        <Fragment key={`${item}-${i}`}>
          <span className="px-[3vw] text-[7vw] tracking-[-0.03em] text-black">{item}</span>
          <span aria-hidden className="size-[1.5vw] shrink-0 translate-y-[0.8vw] rounded-full border-2 border-black" />
        </Fragment>
      ))}
    </>
  );
}
