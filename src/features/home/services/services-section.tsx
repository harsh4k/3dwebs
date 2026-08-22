import Link from "next/link";

import { servicePillars } from "@/content/services";

import { IrisPanel } from "./iris-panel";
import { ServicePanel } from "./service-panel";

/**
 * Home §4 — the services chapter. Names the three pillars and routes to
 * `/services`. See `specs/home-build.md` Phase 4.
 *
 * A Server Component: the two client leaves (`IrisPanel`, `ServicePanel`) carry
 * their own `"use client"`, so the content itself is rendered on the server and
 * the section is complete in the first HTML.
 *
 * **Ground.** `--paper` (page) → `--cream` (scene) → `--peach` here, then back to
 * `--cream` for the work helix. This section is an inset chapter rather than a
 * stop on the Roast Ramp: the `--ink` field the iris opens out of is what closes
 * it off at both ends, so the step back to cream afterwards reads as leaving a
 * room, not as walking the ramp backwards.
 *
 * **Copy is entirely confirmed.** Pillar names and all twelve items are verbatim
 * from the deck via `@/content/services`; the one line per pillar is marked
 * Proposed there. `what we do` is a navigational label and asserts nothing. There
 * is deliberately no lead paragraph — `positioning` already appears twice on this
 * page (the hero overlay and the wave overlay), and the spec asks for three
 * lines, no more.
 */
export const ServicesSection = () => {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative z-20 scroll-mt-[5rem]"
    >
      {/*
        The no-JS branch. react-spring writes each reveal's `from` values as an
        inline style on the first paint, so every panel leaves the server at
        `opacity: 0`; if scripts never run, nothing would ever clear it and the
        chapter would ship blank. A stylesheet `!important` outranks a normal
        inline declaration, so this restores the rest state without touching the
        animation for everyone else — the reveal stays additive rather than
        becoming the thing that content depends on.

        The iris needs no equivalent: it only ever *adds* a `clip-path`, and it
        adds it from JavaScript, so no-JS already leaves the panel unclipped.
      */}
      <noscript>
        <style>{`.reveal-guard { opacity: 1 !important; transform: none !important; }`}</style>
      </noscript>

      <IrisPanel className="px-[1.25rem] py-[clamp(6rem,12vh,15rem)] text-ink md:px-[4rem] lg:px-[5rem]">
        <div className="mx-auto w-full max-w-[80rem]">
          <h2
            id="services-heading"
            className="font-hero text-[clamp(2rem,4.5vw,4rem)] font-light lowercase leading-[1.05] tracking-[-0.02em] text-ink"
          >
            what we do
          </h2>

          <ul className="mt-[clamp(2.5rem,6vh,4rem)] flex flex-col gap-[1.25rem]">
            {servicePillars.map((pillar, index) => (
              <ServicePanel key={pillar.slug} pillar={pillar} index={index} />
            ))}
          </ul>

          {/*
            The section's single `--heat` element, and a rule rather than type:
            heat measures 3.28:1 on peach — enough for a graphical object, nowhere
            near enough for a `--fs-label` string (Design.md §3). So the label is
            `--ink` and the heat is the line under it.
          */}
          <Link
            href="/services"
            className="group mt-[clamp(2.5rem,6vh,4rem)] inline-flex items-center gap-[0.5rem] text-[0.875rem] leading-[1.2] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[0.35rem] focus-visible:outline-ink md:text-[1rem]"
          >
            <span className="relative py-[0.35rem]">
              explore services
              {/*
                Two stacked rules rather than one that toggles. The heat line is
                always there — it is the section's heat element, and it has to be
                present on a touch device, which never reports a hover. The ink
                line above it is the wipe: it sweeps L→R on hover and on keyboard
                focus, which is the house CTA affordance (Design.md §7 Button).

                Written this way because a single rule that sits at `scale-x-0`
                until hovered has to state its rest value inside a
                `(hover: hover)` query, and that lands at the same specificity as
                the base utility — so which one wins comes down to stylesheet
                order, which is not something to depend on. Two elements, one
                property each, no ordering question.

                `scaleX` on a 1px line: paint only, nothing reflows.
              */}
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-heat" />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-ink transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-quint)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
              />
            </span>
            <span
              aria-hidden
              className="transition-[translate] duration-[var(--dur-fast)] ease-[var(--ease-out-quint)] group-hover:translate-x-[4px]"
            >
              →
            </span>
          </Link>
        </div>
      </IrisPanel>
    </section>
  );
};
