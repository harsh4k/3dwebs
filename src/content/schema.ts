import { z } from 'zod';

/**
 * Content schemas. Validated at build — invalid content fails the build.
 *
 * RULE 0: the schema is the enforcement mechanism for the no-fabrication
 * rule. There is deliberately NO field for year, brief, outcome, metrics,
 * or testimonial. None of those exist in any source, so the schema cannot
 * express them. Do not add them.
 */

/**
 * A — bespoke build plausibly still running Coffee Digital's work.
 *     Live capture, outbound link permitted.
 * B — large brand; provenance of the current live site is NOT established.
 *     Deck imagery only, no outbound link.
 * C — dead, blocked, or no URL ever existed. Deck imagery only.
 */
export const AssetTier = z.enum(['A', 'B', 'C']);
export type AssetTier = z.infer<typeof AssetTier>;

export const ImageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export type Image = z.infer<typeof ImageSchema>;

export const ProjectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    client: z.string().min(1),
    title: z.string().min(1),
    deliverables: z.array(z.string().min(1)).min(1),
    tier: AssetTier,
    images: z.array(ImageSchema).min(1),
    liveUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
  })
  .strict()
  .refine((p) => p.tier === 'A' || p.liveUrl === undefined, {
    message:
      'Only Tier-A projects may carry a liveUrl. A Tier-B/C link would present work of unestablished provenance as current.',
    path: ['liveUrl'],
  });
export type Project = z.infer<typeof ProjectSchema>;

/** Region as printed on deck slide 3. Not re-bucketed — the source's own split. */
export const AwardRegion = z.enum(['international', 'asia-pacific', 'india']);
export type AwardRegion = z.infer<typeof AwardRegion>;

export const AwardSchema = z
  .object({
    /** Verbatim line from deck slide 3. Never paraphrased. */
    line: z.string().min(1),
    region: AwardRegion,
    /** The awarding organisation, for the "bodies" counter. */
    body: z.string().min(1),
    /** How many individual awards this line represents when expanded. */
    count: z.number().int().positive(),
    /** A jury seat is a credential, not an award. Excluded from award totals. */
    isAward: z.boolean().default(true),
  })
  .strict();
export type Award = z.infer<typeof AwardSchema>;

export const ClientSchema = z
  .object({
    name: z.string().min(1),
    /** Where the mark appears in the deck. Spykar appears in both. */
    source: z.array(z.enum(['logo-plate', 'social-media'])).min(1),
    /** Absent until the mark exists as a vector. Renders as text meanwhile. */
    mark: z.string().optional(),
  })
  .strict();
export type Client = z.infer<typeof ClientSchema>;

export const ServicePillarSchema = z
  .object({
    /** Verbatim from deck slide 2. */
    name: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    items: z.array(z.string().min(1)).min(1),
    /** PROPOSED copy — ours, not the client's. Must be marked as such. */
    proposedLine: z.string().min(1),
  })
  .strict();
export type ServicePillar = z.infer<typeof ServicePillarSchema>;

/**
 * Fields that do not exist in any source are `undefined`, and components
 * render them only when present. They are not empty strings — the absence
 * is the fact.
 */
export const SiteSchema = z
  .object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    email: z.string().email(),
    careersEmail: z.string().email(),
    domain: z.string().min(1),
    phone: z.string().optional(),
    address: z.string().optional(),
    socials: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
  })
  .strict();
export type Site = z.infer<typeof SiteSchema>;

/**
 * Throws at build if content is invalid. A bad fact is a broken build.
 *
 * Generic over the schema rather than over a single type: `.default()`
 * makes a schema's input and output types differ (the field is optional
 * going in, guaranteed coming out), and `z.ZodType<T>` collapses both to
 * T. `z.infer<S>` reads the OUTPUT type, which is what callers receive.
 */
export function validate<S extends z.ZodTypeAny>(
  schema: S,
  data: unknown,
  label: string,
): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Content validation failed for ${label}:\n${result.error.message}`);
  }
  return result.data;
}
