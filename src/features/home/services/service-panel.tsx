"use client";

import { Inview } from "@/components/animation/springs/in-view";

import type { ServicePillar } from "@/content/schema";

/**
 * One pillar — a `--paper` panel on the section's `--peach` ground.
 *
 * **No border, no shadow, no radius** (Design.md §7 Card, §8). The panel is
 * separated from the ground by the ground itself, and from its neighbours by the
 * indent step. That indent is the one thing carried over from the Originkit hero
 * this section was adapted from: its four credit cards were dealt in a fan, and
 * three full-width rows stepping in from the left are the same gesture with the
 * overlap taken out — text has to stay readable in a way a card face does not.
 *
 * Right edges stay flush and left edges step in, so the stack reads as dealt
 * rather than as an indent hierarchy. Mobile drops the step: at 360px it would
 * eat the measure.
 *
 * `RevealText` / `RevealItem` are not usable here — both gate on `useActActive()`,
 * which reads the *pinned* scene's progress, and this section is in normal flow.
 * `<Inview>` is the same spring engine underneath, triggered by the viewport.
 *
 * **Nothing is gated on motion.** Every `<Inview>` here is `mode="once"`; if the
 * springs never run the panel is still whole, because the reveal only ever adds
 * to a state that already reads.
 */

/** Matches the reveal springs used across the site — soft, damped, no overshoot. */
const SOFT = { mass: 1, tension: 88, friction: 30 };

/**
 * Every `<Inview>` below carries this class, and `services-section.tsx` pairs it
 * with a `<noscript>` rule that forces the revealed state.
 *
 * react-spring renders `from` as an inline style on the very first paint, so
 * without the guard this panel ships to the browser at `opacity: 0` and stays
 * there if scripts never run — content hidden by default and revealed only by
 * animation, which is the one thing the motion rules forbid outright. The guard
 * is what makes the reveal *additive*: with JS the springs play, without it the
 * panel is simply already there.
 */

/**
 * The rule draws left-to-right as the panel arrives.
 *
 * *Purpose:* three pillars are deliberately equal in weight, which leaves the eye
 * nowhere to start. The drawing line gives it an order without ranking them —
 * the spec's own stated reason for the motion in Phase 4.
 */
const RULE_FROM = { transform: "scaleX(0)" };
const RULE_TO = { transform: "scaleX(1)" };

/**
 * The pillar name rises from a clipped bound, a beat behind its own rule.
 *
 * *Purpose:* binds the name to the line beneath it, so the pair arrives as one
 * object rather than as two things that happen to animate near each other.
 */
const LABEL_FROM = { transform: "translateY(0.6em)", opacity: 0 };
const LABEL_TO = { transform: "translateY(0em)", opacity: 1 };

const BODY_FROM = { transform: "translateY(0.4em)", opacity: 0 };
const BODY_TO = { transform: "translateY(0em)", opacity: 1 };

/** Per-panel indent step. Index 0 is flush; each later panel steps in one unit. */
const INDENT = ["md:ml-0", "md:ml-[3rem]", "md:ml-[6rem]"] as const;

interface ServicePanelProps {
  pillar: ServicePillar;
  index: number;
}

export const ServicePanel = ({ pillar, index }: ServicePanelProps) => {
  const stagger = index * 100;

  return (
    <li className={INDENT[index] ?? INDENT[INDENT.length - 1]}>
      {/*
        `group` drives the hover: the rule darkens and the name shifts together, so
        the whole panel reads as one target rather than the text alone.
        `transition-[translate]` and not `transition-transform` — Tailwind v4's
        `translate-*` utilities write the standalone `translate` property, which is
        also why they compose with the springs' `transform` instead of fighting it.
      */}
      <a
        href={`/services#${pillar.slug}`}
        className="group block bg-paper px-[1.25rem] py-[1.75rem] transition-[translate] duration-[var(--dur-fast)] ease-[var(--ease-out-quint)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[0.25rem] focus-visible:outline-ink md:px-[2.5rem] md:py-[2.25rem] [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-[2px]"
      >
        {/*
          The spec asks for the rule to thicken 1px → 2px on hover. It darkens
          instead: height is a layout property, and growing a hairline inside a
          panel reflows everything under it every frame of the transition
          (Design.md §9 rule 1). Colour carries the same signal for free.
        */}
        <Inview
          tag="span"
          mode="once"
          from={RULE_FROM}
          to={RULE_TO}
          config={SOFT}
          delayIn={stagger}
          className="reveal-guard block h-px origin-left bg-rule transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-quint)] group-hover:bg-ink"
        />

        {/*
          `overflow-hidden` is the clipped bound the name rises out of. It sits on a
          wrapper rather than on the animated element, so the clip never moves.
        */}
        <span className="mt-[1.25rem] block overflow-hidden">
          <Inview
            tag="h3"
            mode="once"
            from={LABEL_FROM}
            to={LABEL_TO}
            config={SOFT}
            delayIn={stagger + 100}
            className="reveal-guard font-hero text-[clamp(1.5rem,2.6vw,2.25rem)] font-light leading-[1.2] tracking-[-0.02em] text-balance text-ink transition-[translate] duration-[var(--dur-fast)] ease-[var(--ease-out-quint)] group-hover:translate-x-[4px]"
          >
            {pillar.name}
          </Inview>
        </span>

        <Inview
          tag="p"
          mode="once"
          from={BODY_FROM}
          to={BODY_TO}
          config={SOFT}
          delayIn={stagger + 180}
          className="reveal-guard mt-[0.5rem] max-w-[45ch] text-[1rem] leading-[1.6] text-pretty text-ink-muted"
        >
          {pillar.proposedLine}
        </Inview>

        <Inview
          tag="ul"
          mode="once"
          from={BODY_FROM}
          to={BODY_TO}
          config={SOFT}
          delayIn={stagger + 260}
          className="reveal-guard mt-[1.25rem] flex flex-col gap-[0.35rem] text-[0.875rem] leading-[1.5] text-ink-muted md:flex-row md:flex-wrap md:gap-x-[1.25rem]"
        >
          {pillar.items.map((item, itemIndex) => (
            <li key={item} className="flex items-baseline gap-[1.25rem]">
              {/*
                The separator is a sibling element, not a `·` inside the string and
                not a `::before`: it has to vanish when the list stacks on mobile,
                and it must never reach the accessibility tree as content.
              */}
              {itemIndex > 0 && (
                <span aria-hidden className="hidden text-ink-faint md:inline">
                  ·
                </span>
              )}
              {item}
            </li>
          ))}
        </Inview>
      </a>
    </li>
  );
};
