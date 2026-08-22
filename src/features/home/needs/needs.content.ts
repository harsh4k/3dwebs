import { servicePillars } from '@/content/services';

/**
 * The selectable options for the "tell us what you need" CTA.
 *
 * ⚠️ **Rule 0.** Every label here is a *derived view* of `content/services.ts`,
 * which is deck slide 2 verbatim and confirmed. Nothing is authored in this
 * file — no shortened label, no marketing rewrite, no invented service. If the
 * list should read differently, the deck is what changes, not this module.
 *
 * The reference this section is modelled on runs a flat list of eleven
 * capabilities. Coffee Digital's confirmed taxonomy is three pillars of four,
 * so the grid is grouped by pillar instead of flattened. That is not a
 * decoration: flattening would strip the pillar names, which are themselves
 * confirmed content, and would leave the twelve items in an order that means
 * nothing.
 */
export interface NeedOption {
  /** URL-safe id. Derived, never authored — see `slugify`. */
  slug: string;
  /** Confirmed service item, verbatim from deck slide 2. */
  label: string;
}

export interface NeedGroup {
  /** Confirmed pillar name, verbatim from deck slide 2. */
  pillar: string;
  pillarSlug: string;
  options: NeedOption[];
}

/** Query key the CTA hands the selection to `/contact` on. */
export const NEEDS_PARAM = 'need';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const needGroups: NeedGroup[] = servicePillars.map((pillar) => ({
  pillar: pillar.name,
  pillarSlug: pillar.slug,
  options: pillar.items.map((label) => ({ slug: slugify(label), label })),
}));

export const needOptions: NeedOption[] = needGroups.flatMap((group) => group.options);

const BY_SLUG = new Map(needOptions.map((option) => [option.slug, option]));

/**
 * Resolve slugs arriving from the URL back to confirmed labels, preserving the
 * order they were selected in and dropping anything unrecognised. A hand-edited
 * or stale query string can therefore never put an unconfirmed string on the
 * page — the only strings this can return are the twelve in `services.ts`.
 */
export const labelsForSlugs = (slugs: readonly string[]): string[] => {
  const seen = new Set<string>();
  const labels: string[] = [];

  for (const slug of slugs) {
    const option = BY_SLUG.get(slug);
    if (!option || seen.has(option.slug)) continue;
    seen.add(option.slug);
    labels.push(option.label);
  }

  return labels;
};

/** `/contact` with the current selection attached. Empty selection → plain `/contact`. */
export const contactHref = (slugs: readonly string[]): string => {
  if (slugs.length === 0) return '/contact';

  const params = new URLSearchParams();
  for (const slug of slugs) params.append(NEEDS_PARAM, slug);

  return `/contact?${params.toString()}`;
};
