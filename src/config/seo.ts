/**
 * Site-wide configuration — the single source of truth for SEO.
 *
 * Name, tagline and description trace to src/content (brand-audit Confirmed).
 * There is no Twitter/X handle in any source, so that field is omitted.
 */
import { positioning, site } from '@/content/site';
import { publicEnv } from '@/env';

export const siteConfig = {
  name: site.name,
  description: positioning,
  url: publicEnv.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  author: site.name,
  themeColor: '#000000',
} as const;
