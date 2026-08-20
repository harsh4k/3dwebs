import { SiteSchema, validate, type Site } from './schema';

/**
 * Site-wide facts. Every value traces to brand/brand-audit.md → Confirmed.
 *
 * phone, address and socials are absent because they do not exist in any
 * source. They are `undefined`, not empty strings — components render them
 * only when present. Do not fill them in.
 */
export const site: Site = validate(
  SiteSchema,
  {
    name: 'Coffee Digital',
    // Legacy site. The confirmed tagline, lowercase as written.
    tagline: 'the digital branding people',
    email: 'info@coffeedigital.in',
    careersEmail: 'careers@coffeedigital.in',
    domain: 'coffeedigital.in',
    socials: [],
  },
  'site',
);

/**
 * Last-word cycle for the hero tagline. `people` is the confirmed tagline.
 * `partner` is the identity noun from the deck positioning line
 * ("full-stack digital partner"). `agency` is from the legacy site
 * ("the digital agency expert"). The sr-only page title stays the
 * confirmed tagline in full.
 */
export const taglineLastWords = ["people", "partner", "agency"] as const;

/** Deck slide 2, verbatim. Do not rewrite. */
export const positioning =
  "Whether you need a stunning campaign, a smart app, or a complete brand revamp, we're your full-stack digital partner — combining creativity, code, and strategy to bring your vision to life.";

/** Deck slide 34, verbatim. Line breaks are the source's. */
export const closingCopy = [
  "Yes we'd love to work with you",
  'Do care to test us,',
  'Throw us a challenge,',
  "You'd find us more than eager!",
] as const;

/**
 * The approved replacement for the superlative struck from the deck on
 * 2026-08-17 (see TBD.md → B2). Factual, and names only bodies that appear
 * in the confirmed awards list. A superlative invites "says who?" and
 * carries ASCI exposure; a list of names does not.
 */
export const awardsFraming =
  'Recognised at Cannes, One Show, D&AD, the Webby Awards, the New York Festival, and Goafest.';
