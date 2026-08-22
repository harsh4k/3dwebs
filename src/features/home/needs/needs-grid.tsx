"use client";

import { useEffect, useState } from 'react';

import { useDynamicInView } from '@/hooks/animation/use-dynamic-in-view';

import { needGroups, needOptions } from './needs.content';
import { CornerArrow, PlusGlyph } from './needs-glyphs';

import './needs.css';

/**
 * The twelve confirmed services, grouped by their three confirmed pillars.
 *
 * Each option is a real `<button>` with `aria-pressed`, not a styled `<div>`, so
 * the whole grid is keyboard-operable and announced as a toggle without a single
 * extra ARIA attribute.
 *
 * Selected state is signalled **three** ways — the label drops to `--ink-muted`,
 * the `+` rotates 45° into a cross, and a pill appears in the bar above. Never
 * by colour alone (CLAUDE.md accessibility rules).
 *
 * ### Motion — row stagger
 * Rows fade and rise 18px, staggered 45ms down each column.
 *
 * **Purpose:** twelve options arriving as one block is a wall, and a wall gets
 * skimmed. Staggering them draws the eye down the first column and establishes
 * that these are a *list to read* rather than a graphic to glance at — the same
 * job the headline's word stagger does one level up. 45ms sits inside Design.md
 * §9's 40–80ms sibling range, and twelve elements is exactly its stagger cap.
 *
 * ### Motion — hover
 * The row fades to 60% *and* its arrow slides 3px right. Opacity alone (which is
 * all the reference does) reads as a dimmer switch; the arrow moving is what
 * says "this is a control, and it points somewhere".
 *
 * ### Motion — click ping
 * See `needs.css`. The pill this click produces is often off-screen, so the row
 * dips and springs back to acknowledge the press locally.
 *
 * **Reduced motion** is handled per mechanism: `motion-reduce:` on the Tailwind
 * transitions, an explicit media query for the keyframes, and the stagger below
 * collapses because its transition is disabled — rows simply appear.
 *
 * **No-JS / pre-hydration:** `mounted` gates the reveal, so before hydration and
 * with JS disabled every row renders at full opacity and zero offset. Nothing
 * here is hidden by default and revealed only by animation (CLAUDE.md).
 */

/** Design.md §3 rule 3 — focus rings are `--ink`, offset clear of the row rule. */
const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink';

/** Design.md §4 — `--fs-label`: Geist Mono, uppercase, 0.08em tracking. px floors: see `site-footer.tsx`. */
const LABEL = 'font-mono text-[clamp(11px,0.7rem,12px)] uppercase tracking-[0.08em]';

/** Design.md §9 — hovers run at `--dur-fast` on `--ease-out-quint`. */
const HOVER = 'duration-[var(--dur-fast)] ease-[var(--ease-out-quint)] motion-reduce:transition-none';

/** Flat reading order across all three pillars — drives both staggers. Static, so module scope. */
const ROW_INDEX = new Map(needOptions.map((option, index) => [option.slug, index]));

/** Design.md §9: 40–80ms between siblings, capped at 12 elements. There are exactly 12. */
const STAGGER_MS = 45;

interface NeedsGridProps {
  id: string;
  isSelected: (slug: string) => boolean;
  onToggle: (slug: string) => void;
  /** Increments on each `+` press. Any change replays the pulse; 0 means "never pressed". */
  pulseKey: number;
}

export function NeedsGrid({ id, isSelected, onToggle, pulseKey }: NeedsGridProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [pulsing, setPulsing] = useState(false);
  const [ping, setPing] = useState<string | null>(null);

  // One observer for the whole grid rather than twelve — the rows stagger off a
  // shared trigger, so they have nothing to observe individually.
  const [revealed, setRevealed] = useState(false);
  const [setNode] = useDynamicInView({
    rootMargin: '0px 0px -10% 0px',
    onEnter: () => setRevealed(true),
  });

  useEffect(() => {
    if (pulseKey === 0) return;
    setPulsing(true);
    // Longest run = the keyframe plus the last row's stagger. Clearing the
    // attribute is what lets the next press restart the animation.
    const timer = window.setTimeout(() => setPulsing(false), 700 + needOptions.length * 60);
    return () => window.clearTimeout(timer);
  }, [pulseKey]);

  useEffect(() => {
    if (!ping) return;
    const timer = window.setTimeout(() => setPing(null), 450);
    return () => window.clearTimeout(timer);
  }, [ping]);

  const handleToggle = (slug: string) => {
    setPing(slug);
    onToggle(slug);
  };

  // Before hydration there is no observer and no transition, so rows must be
  // at their resting state or the content would depend on JS to be visible.
  const shown = !mounted || revealed;

  return (
    <div
      id={id}
      ref={setNode}
      data-needs-pulse={pulsing || undefined}
      className="grid w-full grid-cols-1 gap-x-[2rem] gap-y-[clamp(2rem,4vw,3rem)] md:grid-cols-2 lg:grid-cols-3"
    >
      {needGroups.map((group) => (
        <section key={group.pillarSlug} aria-labelledby={`${id}-${group.pillarSlug}`}>
          <h3 id={`${id}-${group.pillarSlug}`} className={`${LABEL} text-ink-muted`}>
            {group.pillar}
          </h3>

          <ul className="mt-[0.5rem]">
            {group.options.map((option) => {
              const selected = isSelected(option.slug);
              const index = ROW_INDEX.get(option.slug) ?? 0;
              const stagger = { animationDelay: `${index * 60}ms` };

              return (
                <li
                  key={option.slug}
                  style={{ transitionDelay: mounted ? `${index * STAGGER_MS}ms` : '0ms' }}
                  className={`transition-[opacity,transform] duration-[var(--dur-slow)] ease-[var(--ease-out-quint)] motion-reduce:transition-none ${
                    shown ? 'translate-y-0 opacity-100' : 'translate-y-[18px] opacity-0'
                  }`}
                >
                  <button
                    type="button"
                    aria-pressed={selected}
                    data-ping={ping === option.slug || undefined}
                    onClick={() => handleToggle(option.slug)}
                    className={`group grid min-h-[44px] w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[0.875rem] border-b border-overlay-line pt-[1.15rem] pb-[0.7rem] text-left transition-opacity hover:opacity-60 ${HOVER} ${FOCUS_RING}`}
                  >
                    {/* Two nested spans throughout: the outer carries the pulse
                        and ping keyframes, the inner the hover/selected
                        transform. Both write `transform`, so sharing an element
                        would put a transition and an animation on one property. */}
                    <span className="needs-part inline-block text-ink-faint" style={stagger}>
                      <span
                        className={`block transition-transform group-hover:translate-x-[3px] group-focus-visible:translate-x-[3px] motion-reduce:group-hover:translate-x-0 ${HOVER}`}
                      >
                        <CornerArrow />
                      </span>
                    </span>

                    <span
                      className={`needs-part inline-block text-[clamp(15px,1rem,19px)] font-medium leading-[1.25] tracking-[-0.01em] transition-colors ${HOVER} ${
                        selected ? 'text-ink-muted' : 'text-ink'
                      }`}
                      style={stagger}
                    >
                      {option.label}
                    </span>

                    <span className="needs-part inline-block justify-self-end" style={stagger}>
                      <span
                        className={`block transition-transform ${HOVER} ${
                          selected ? 'rotate-45 text-ink' : 'text-ink-faint group-hover:rotate-90'
                        }`}
                      >
                        <PlusGlyph />
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
