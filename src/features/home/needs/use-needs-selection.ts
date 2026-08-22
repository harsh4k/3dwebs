"use client";

import { useCallback, useMemo, useState } from 'react';

import { contactHref, needOptions, type NeedOption } from './needs.content';

const BY_SLUG = new Map(needOptions.map((option) => [option.slug, option]));

/**
 * The CTA's one piece of state: which confirmed services the visitor has
 * picked, in the order they picked them.
 *
 * Insertion order is kept deliberately. The bar reads as a sentence — "i need a
 * …" — so the pills must appear in the order they were chosen, not in the order
 * the grid happens to list them. A `Set` would lose that; an array plus a
 * membership test keeps it and stays trivially serialisable into the URL.
 */
export function useNeedsSelection() {
  const [slugs, setSlugs] = useState<readonly string[]>([]);

  const toggle = useCallback((slug: string) => {
    if (!BY_SLUG.has(slug)) return;
    setSlugs((current) =>
      current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug],
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setSlugs((current) => current.filter((s) => s !== slug));
  }, []);

  const selected = useMemo(
    () =>
      slugs
        .map((slug) => BY_SLUG.get(slug))
        .filter((option): option is NeedOption => option !== undefined),
    [slugs],
  );

  const href = useMemo(() => contactHref(slugs), [slugs]);

  return {
    slugs,
    selected,
    toggle,
    remove,
    href,
    hasSelection: slugs.length > 0,
    isSelected: useCallback((slug: string) => slugs.includes(slug), [slugs]),
  };
}
