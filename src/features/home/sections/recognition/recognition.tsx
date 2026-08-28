"use client";

import { RevealScope, RevealText } from "@/components/common/reveal";
import { WordShiftButton } from "@/components/common/word-shift";
import { awardBodies } from "@/content/awards";
import { awardsFraming } from "@/content/site";

import "./recognition.css";

import { BodyList } from "./body-list";
import { RulePlus } from "./rule-plus";
import { useCrossfade } from "./use-crossfade";

/**
 * Recognition — the awarding bodies down the left, their citations crossfading on the right.
 *
 * **Why this is not "client stories".** The reference section in this slot is a testimonial
 * slider, and Coffee Digital has **no testimonials**. `brand-audit.md` → Confirmed has no such
 * section and `content/schema.ts` deliberately has no field for one; writing five plausible quotes
 * is the exact failure Rule 0 exists to prevent. The *mechanism* — a list on the left indexing a
 * crossfading panel on the right — is worth keeping and we have real content for it, so the slot
 * carries the awards instead. Every word on screen is transcribed from credentials deck slide 3
 * by way of `content/awards.ts`. See brain D21.
 *
 * If real testimonials ever arrive, this is the same component with a different array.
 *
 * **Purpose statement** (animation rule: no purpose, no ship). Thirty awards printed as a list is
 * a wall nobody reads; one citation at a time, held for five seconds, is read. The crossfade is
 * doing editorial work — it rations the evidence so each line is actually taken in — rather than
 * decorating a list that would have been fine static. The rule drawing itself across the section
 * is the second act of the same idea: it measures the reader's arrival, so the section starts
 * when they get there instead of having already happened.
 *
 * **The dark ground is deliberate and it is inside the palette lock.** `--ink` is a locked token,
 * and this is the page's one dark stop: it gives Design in Motion's closing belts something to
 * wipe *to*, and it separates the two work sections either side of it by ground rather than by a
 * device — which is what replaced the retired stripe (brain D16). `--paper` on `--ink` is far
 * above the 4.5:1 body threshold. `--heat` appears once, as the `+` on the rule.
 *
 * **No-JS.** The first panel is `data-active` from the server and every other panel is in the
 * markup, laid out and merely transparent — so the section renders one complete citation, the
 * whole body list and the drawn rule with JavaScript off. Nothing is hidden waiting on animation.
 */

export const Recognition = () => {
  const { active, goTo, step, hold, release } = useCrossfade(awardBodies.length);

  return (
    <RevealScope tag="section" className="relative bg-ink text-paper">
      <h2 className="sr-only">Recognition</h2>

      <div className="mx-auto w-full max-w-[80rem] px-[1.25rem] py-[clamp(4rem,10vw,8rem)] md:px-[4rem]">
        <RevealText
          tag="p"
          act="scope"
          variant="copy"
          className="font-mono text-[clamp(12px,0.75rem,13px)] uppercase tracking-[0.08em] text-peach"
        >
          Recognition
        </RevealText>

        <RevealText
          tag="p"
          act="scope"
          variant="copy"
          delayIn={120}
          className="mt-[1.5rem] max-w-[34ch] text-[clamp(20px,2.2vw,32px)] leading-[1.25] text-paper text-pretty"
        >
          {awardsFraming}
        </RevealText>

        <RulePlus className="mt-[clamp(3rem,7vw,5rem)]" />

        <div
          className="mt-[clamp(2.5rem,6vw,4rem)] grid grid-cols-1 gap-[clamp(2.5rem,5vw,4rem)] md:grid-cols-12"
          onMouseEnter={hold}
          onMouseLeave={release}
          onFocusCapture={hold}
          onBlurCapture={release}
        >
          <div className="md:col-span-5 lg:col-span-4">
            <BodyList bodies={awardBodies} active={active} onSelect={goTo} />
          </div>

          <div className="md:col-span-7 md:col-start-6 lg:col-span-7 lg:col-start-6">
            <div className="recognition-deck">
              {awardBodies.map((body, index) => (
                <div
                  key={body.name}
                  id={`recognition-panel-${index}`}
                  role="tabpanel"
                  aria-labelledby={`recognition-tab-${index}`}
                  data-active={index === active}
                  className="recognition-panel"
                >
                  <ul className="flex flex-col gap-[1.1rem]">
                    {body.lines.map((line) => (
                      <li
                        key={line}
                        className="text-[clamp(18px,2vw,28px)] leading-[1.3] text-paper text-pretty"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>

                  {/* Rendered only where there is a figure to print. A jury seat has `count: 0`
                      because a seat is a credential, not a win — `awards.ts` is explicit that this
                      distinction is why the total is 30 and not 31 — so the line stands alone
                      rather than being dressed up as an award. */}
                  {body.count > 0 && (
                    <p className="mt-[1.75rem] font-mono text-[clamp(12px,0.75rem,13px)] uppercase tracking-[0.08em] text-peach">
                      {body.count === 1 ? "1 award" : `${body.count} awards`}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-[clamp(2.5rem,5vw,3.5rem)] flex items-center gap-[1rem]">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous organisation"
                className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-peach/40 text-paper transition-colors duration-[--dur-fast] ease-[--ease-out-quint] hover:border-peach focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper motion-reduce:transition-none"
              >
                <span aria-hidden="true">&#8592;</span>
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next organisation"
                className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-peach/40 text-paper transition-colors duration-[--dur-fast] ease-[--ease-out-quint] hover:border-peach focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper motion-reduce:transition-none"
              >
                <span aria-hidden="true">&#8594;</span>
              </button>

              {/* Position, in text. The dimmed/full styling in the list is a colour signal; this
                  is the same information in a form that survives without it. */}
              <p aria-live="polite" className="font-mono text-[clamp(12px,0.75rem,13px)] uppercase tracking-[0.08em] text-peach">
                {active + 1} / {awardBodies.length}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-[clamp(3rem,7vw,5rem)] w-56">
          <WordShiftButton text="About us" href="/about" />
        </div>
      </div>
    </RevealScope>
  );
};
