"use client";

import { useRef } from "react";

import type { AwardBody } from "@/content/awards";

/**
 * The index down the left of Recognition — one entry per awarding organisation, driving the panel
 * on the right.
 *
 * **This is a real tablist, not a row of styled divs.** The relationship it describes — a list of
 * labels where exactly one is selected and each controls a region elsewhere on screen — is what
 * `tablist`/`tab`/`tabpanel` exists for, and announcing it correctly is most of what makes the
 * section usable without sight of it. Taking the role on obliges the arrow keys to work, so they
 * do: Left/Up and Right/Down move and wrap, Home and End jump to the ends.
 *
 * **Roving tabindex, not eleven tab stops.** Only the selected entry is reachable with Tab; the
 * rest are `tabIndex={-1}` and reached with the arrows. Otherwise a keyboard reader has to press
 * Tab eleven times to get past a single section.
 *
 * The active entry goes from dimmed to full and its marker fades in — the reference's
 * `opacity-30 → opacity-100`. **Opacity is not the only signal**: the marker appears alongside it
 * and `aria-selected` carries it programmatically, so nothing here is state-by-colour-alone.
 */

interface BodyListProps {
  bodies: AwardBody[];
  active: number;
  onSelect: (index: number) => void;
}

export const BodyList = ({ bodies, active, onSelect }: BodyListProps) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  /* Moving focus is part of the tablist contract — the arrows select *and* focus, so the reader
     stays on the entry they just moved to rather than being stranded on the old one. */
  const focus = (index: number): void => {
    const wrapped = ((index % bodies.length) + bodies.length) % bodies.length;
    onSelect(wrapped);
    refs.current[wrapped]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number): void => {
    const keys: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      Home: 0,
      End: bodies.length - 1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    focus(next);
  };

  return (
    <div role="tablist" aria-label="Awarding organisations" className="flex flex-col">
      {bodies.map((body, index) => {
        const selected = index === active;
        return (
          <button
            key={body.name}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`recognition-tab-${index}`}
            aria-selected={selected}
            aria-controls={`recognition-panel-${index}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`group flex min-h-[44px] items-center gap-[0.6rem] py-[0.35rem] text-left transition-opacity duration-[--dur-base] ease-[--ease-out-quint] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper motion-reduce:transition-none ${
              selected ? "opacity-100" : "opacity-40 hover:opacity-80"
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-px w-[1.5rem] flex-shrink-0 bg-heat transition-transform duration-[--dur-base] ease-[--ease-out-quint] motion-reduce:transition-none ${
                selected ? "scale-x-100" : "scale-x-0"
              } origin-left`}
            />
            <span className="text-[clamp(15px,1.05rem,20px)] leading-[1.3] text-paper">
              {body.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
