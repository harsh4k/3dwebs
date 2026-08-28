// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import { createContext, useContext, useMemo } from "react";

import { useDynamicInView } from "@/hooks/animation/use-dynamic-in-view";

import type { ElementType, ReactNode } from "react";

/**
 * The trigger for reveals that live **below** the pinned scene.
 *
 * `useActActive` cannot serve these. `ACT_WINDOW` is expressed in *scene* progress — 0 to 1 across
 * the pinned Auralis sequence — and every section from Design in Motion down sits past progress 1,
 * in ordinary document flow. They enter and leave the viewport the normal way, so an
 * IntersectionObserver is the correct switch and the act window is simply the wrong instrument.
 *
 * One observer per **section**, not per element. The reference extracts create an
 * `IntersectionObserver` for every `[data-blur-reveal]` and every `[data-fade-in-on-scroll]` node on
 * the page; a section with a heading, a caption and six cards pays for eight. Here the section
 * observes itself once and publishes the boolean through context, so a group that reveals together
 * is triggered together — which is also what makes the staggers line up, since every member reads
 * the same flip on the same frame.
 *
 * Like the act window this is a **switch, not a latch**: it goes false again when the section
 * leaves, so `immediateOut={false}` reveals play their exit and replay on the way back — matching
 * the behaviour of every reveal above it in the page.
 */

const RevealScopeContext = createContext<boolean | null>(null);

/**
 * `true` while the enclosing `<RevealScope>` is on screen.
 *
 * Returns `false` outside a provider rather than throwing: `RevealText`/`RevealItem` call this
 * unconditionally to satisfy the rules of hooks, and only *read* it when `act="scope"`.
 */
export const useRevealScope = (): boolean => useContext(RevealScopeContext) ?? false;

interface RevealScopeProps {
  /** Semantic element to render — `section`, `footer`, `div`… */
  tag?: ElementType;
  className?: string;
  /**
   * How far into the viewport the section must come before its reveals arm.
   * The default is the `start: 'top 90%'` the reference sections use, expressed as a margin.
   */
  rootMargin?: string;
  children: ReactNode;
}

export const RevealScope = ({
  tag,
  className,
  rootMargin = "0px 0px -10% 0px",
  children,
}: RevealScopeProps) => {
  const options = useMemo(() => ({ rootMargin }), [rootMargin]);
  const [targetRef, inView] = useDynamicInView(options);

  const Tag = (tag ?? "section") as "section";

  return (
    <Tag ref={targetRef} className={className}>
      <RevealScopeContext.Provider value={inView}>{children}</RevealScopeContext.Provider>
    </Tag>
  );
};
