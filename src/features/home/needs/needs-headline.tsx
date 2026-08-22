"use client";

import { animated, useTrail } from '@react-spring/web';
import { useEffect, useState } from 'react';

import { useDynamicInView } from '@/hooks/animation/use-dynamic-in-view';

/**
 * The CTA headline, revealed word by word.
 *
 * ### Motion — word rise (specs/home.md §5)
 * Each word sits in its own `overflow-clip` mask and rises from 110% below with
 * a 6° tilt that unwinds to flat, staggered 80ms down the line. Transform and
 * opacity only; the mask is static.
 *
 * **Purpose:** the headline is the section's only instruction, and it is one
 * sentence long. Revealing it as a single block gives the eye nowhere to start.
 * Staggering it word by word paces the sentence at reading speed, so the visitor
 * finishes reading it at roughly the moment the grid below settles — which is
 * when they are being asked to act. The tilt is what stops it reading as a
 * generic slide-up: the words pivot about their bottom-left corner, as if
 * hinging into place off the baseline.
 *
 * The 80ms cadence is the same interval the footer staggers its zones on
 * (`FooterReveal`), so the two closing surfaces share a timing grammar.
 *
 * **Reduced motion:** no branch needed. `ReducedMotion` at the app root flips
 * react-spring's global `skipAnimation`, so the trail lands instantly at rest.
 *
 * **No-JS / pre-hydration:** renders as a plain, fully visible `<h2>` until
 * `mounted` flips — identical to the server output. Nothing here is hidden by
 * default and revealed only by animation (CLAUDE.md).
 *
 * The split is by **word, not letter**. `RevealText`'s heading variant splits to
 * letters, which is right at hero scale over the particle scene; at this size,
 * over a flat ground, per-letter reads as an effect rather than as reading, and
 * it would put ~20 spring instances on screen for one line of type.
 */

/** Lowercase to match the brand voice already shipped in the footer wordmark and nav. */
const TEXT = 'tell us what you need.';
const WORDS = TEXT.split(' ');

const HIDDEN = { opacity: 0, transform: 'translateY(110%) rotate(6deg)' };
const SHOWN = { opacity: 1, transform: 'translateY(0%) rotate(0deg)' };

/** Softer and slower than the reveal springs — this is the largest thing on the page. */
const CONFIG = { mass: 1, tension: 120, friction: 26 };

const HEADING_CLASS =
  'max-w-[16ch] text-balance text-center font-hero text-[clamp(40px,8.5vw,132px)] font-medium lowercase leading-[0.92] tracking-[-0.02em] text-ink';

export function NeedsHeadline({ id }: { id: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Latch: the sentence is read once, not replayed on every scroll pass, so the
  // observer only ever flips this on.
  const [played, setPlayed] = useState(false);

  // Fires a little before the heading is fully on screen, so the last word has
  // landed by the time the reader reaches it.
  const [setNode] = useDynamicInView({
    rootMargin: '0px 0px -12% 0px',
    onEnter: () => setPlayed(true),
  });

  const active = mounted && played;

  const trail = useTrail(WORDS.length, {
    from: HIDDEN,
    to: active ? SHOWN : HIDDEN,
    config: CONFIG,
    delay: active ? 80 : 0,
  });

  if (!mounted) {
    return (
      <h2 id={id} className={HEADING_CLASS}>
        {TEXT}
      </h2>
    );
  }

  return (
    <h2 id={id} ref={setNode} aria-label={TEXT} className={HEADING_CLASS}>
      <span aria-hidden>
        {trail.map((style, index) => (
          // The mask. `overflow-clip` (not `hidden`) so it never creates a
          // scroll container. Bottom padding gives descenders room inside the
          // clip; the negative margin takes it back out of the line box.
          <span
            key={WORDS[index]}
            className="mr-[0.26em] inline-block overflow-clip pb-[0.14em] align-bottom last:mr-0"
            style={{ marginBottom: '-0.14em' }}
          >
            <animated.span
              className="inline-block will-change-transform"
              style={{ ...style, transformOrigin: '0% 100%' }}
            >
              {WORDS[index]}
            </animated.span>
          </span>
        ))}
      </span>
    </h2>
  );
}
