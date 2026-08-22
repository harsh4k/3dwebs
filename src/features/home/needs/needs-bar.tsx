"use client";

import { animated, useTransition } from '@react-spring/web';
import Link from 'next/link';

import { PlusGlyph } from './needs-glyphs';
import { useFlip } from './use-flip';

import type { NeedOption } from './needs.content';

/**
 * The sentence bar — "i need a …" plus one pill per selected service, an add
 * affordance, and the route out to `/contact`.
 *
 * ### Motion — pill pop (specs/home.md §5)
 * A pill springs in from 0.6 scale with a slight overshoot and shrinks back out
 * when removed.
 *
 * **Purpose:** the grid that feeds this bar sits below it, so a selection made
 * down there has to announce itself up here or the click reads as inert. The
 * overshoot is the acknowledgement. Removal animates too — the reference this is
 * modelled on pops pills in and snaps them out, which reads as a glitch rather
 * than as a decision being undone.
 *
 * ### Motion — bar reflow (FLIP)
 * **The pill's own spring is only half the job.** Adding a pill re-flows the bar,
 * and without help the `+` and `next` teleport to their new positions in one
 * frame — so the interaction still felt broken even with the pop animating
 * correctly. Every repositionable child is marked `data-flip`, and `useFlip`
 * inverts the layout delta into a transform so they *glide* instead. See that
 * hook for why this is transform-only rather than an animated width.
 *
 * Each pill is therefore **two** elements: an outer `div` that FLIP translates,
 * and an inner `animated.button` that react-spring scales. Both would otherwise
 * write `transform` on the same node and clobber each other.
 *
 * **Reduced motion:** global `skipAnimation` at the app root lands the springs
 * instantly, and `useFlip` skips its playback — the layout simply updates.
 *
 * ### The route out
 * `next` is a real `<Link>` to `/contact`, always — never an `aria-disabled` dead
 * end. With no selection it goes to the plain contact page, which is a perfectly
 * good outcome and the only one available with JS off. What a selection buys is
 * `--heat`: the button fills, and the section's single hot element arrives as the
 * reward for having answered. That inverts the reference's disabled-until-valid
 * gate into a positive one, and it is why the heat budget is spent here rather
 * than on the twelve row glyphs.
 *
 * ⚠️ `--paper` on `--heat` measures 3.86:1 — AA-large only. The label is
 * therefore ≥24px semibold, as specs/home.md §5 requires. Do not shrink it.
 */

/** Overshoot on the way in — this spring is an acknowledgement, so it should be felt. */
const PILL_IN = { mass: 0.8, tension: 340, friction: 18 };
/** No overshoot on the way out: a removal should read as decisive, not bouncy. */
const PILL_OUT = { mass: 0.6, tension: 420, friction: 32 };

/** Control height floor is a real 44px touch target — px, not rem. See `site-footer.tsx`. */
const CONTROL = 'min-h-[44px] h-[clamp(44px,3.4rem,56px)]';

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink';

const BODY = 'text-[clamp(15px,1rem,19px)] font-medium leading-[1.25] tracking-[-0.01em]';

/** Design.md §9 — hovers and small state changes run at `--dur-fast` on `--ease-out-quint`. */
const HOVER = 'duration-[var(--dur-fast)] ease-[var(--ease-out-quint)] motion-reduce:transition-none';

interface NeedsBarProps {
  selected: NeedOption[];
  onRemove: (slug: string) => void;
  onAdd: () => void;
  href: string;
  hasSelection: boolean;
}

export function NeedsBar({ selected, onRemove, onAdd, href, hasSelection }: NeedsBarProps) {
  const barRef = useFlip<HTMLDivElement>();

  const pills = useTransition(selected, {
    keys: (option: NeedOption) => option.slug,
    from: { opacity: 0, scale: 0.6 },
    enter: { opacity: 1, scale: 1, config: PILL_IN },
    leave: { opacity: 0, scale: 0.8, config: PILL_OUT },
  });

  return (
    <div
      ref={barRef}
      data-has-selection={hasSelection || undefined}
      className="flex w-full max-w-[min(100%,760px)] flex-wrap items-center gap-[0.75rem] rounded-[1.5rem] bg-peach px-[1rem] py-[0.75rem]"
    >
      <span className={`order-1 inline-flex items-center px-[0.25rem] ${CONTROL} ${BODY} text-ink`}>
        i need a
      </span>

      {/* `sr-only` live region: the pills are the visual answer, this is the
          announced one. Without it a screen-reader user toggling a row in the
          grid gets `aria-pressed` and nothing about the sentence changing. */}
      <span aria-live="polite" className="sr-only">
        {selected.length === 0
          ? 'Nothing selected yet.'
          : `Selected: ${selected.map((option) => option.label).join(', ')}.`}
      </span>

      {pills((style, option) => (
        <div data-flip={option.slug} className="order-3 max-w-full">
          <animated.button
            type="button"
            style={style}
            onClick={() => onRemove(option.slug)}
            aria-label={`Remove ${option.label}`}
            className={`group inline-flex ${CONTROL} max-w-full items-center gap-[0.5rem] rounded-[0.75rem] bg-paper px-[1rem] text-ink transition-opacity hover:opacity-70 ${HOVER} ${BODY} ${FOCUS_RING}`}
          >
            <span className="truncate">{option.label}</span>
            {/* The same plus glyph, rotated into a cross — one drawing, two jobs.
                On hover it keeps turning, so the control previews the removal. */}
            <span
              className={`block shrink-0 rotate-45 transition-transform group-hover:rotate-135 group-focus-visible:rotate-135 motion-reduce:group-hover:rotate-45 ${HOVER}`}
            >
              <PlusGlyph />
            </span>
          </animated.button>
        </div>
      ))}

      <div data-flip="__add" className="order-2 shrink-0 sm:order-4">
        <button
          type="button"
          onClick={onAdd}
          aria-label="Show what you can choose from"
          className={`group inline-flex aspect-square ${CONTROL} items-center justify-center rounded-[0.75rem] bg-paper text-ink transition-transform hover:scale-[1.08] ${HOVER} motion-reduce:hover:scale-100 ${FOCUS_RING}`}
        >
          {/* Quarter turn on hover: the glyph says "there is more", and turning
              it is the cheapest way to say the button does something. */}
          <span
            className={`block transition-transform group-hover:rotate-90 group-focus-visible:rotate-90 motion-reduce:group-hover:rotate-0 ${HOVER}`}
          >
            <PlusGlyph />
          </span>
        </button>
      </div>

      <div data-flip="__next" className="order-5 w-full shrink-0 sm:ml-auto sm:w-auto">
        <Link
          href={href}
          className={`group inline-flex ${CONTROL} w-full items-center justify-center gap-[0.5rem] rounded-[0.75rem] px-[1.5rem] text-[clamp(24px,1.5rem,26px)] font-semibold leading-none tracking-[-0.01em] transition-[background-color,color,transform] hover:scale-[1.03] ${HOVER} motion-reduce:hover:scale-100 ${FOCUS_RING} ${
            hasSelection ? 'bg-heat text-paper' : 'bg-paper text-ink-faint'
          }`}
        >
          next
          <span
            aria-hidden
            className={`inline-block translate-y-[-0.02em] transition-transform group-hover:translate-x-[5px] group-focus-visible:translate-x-[5px] motion-reduce:group-hover:translate-x-0 ${HOVER}`}
          >
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
