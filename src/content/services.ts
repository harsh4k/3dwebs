import { ServicePillarSchema, validate, type ServicePillar } from './schema';

/**
 * Deck slide 2. Pillar names and all twelve items are VERBATIM and
 * confirmed — do not rewrite them.
 *
 * `proposedLine` is 💡 PROPOSED: ours, not the client's. It is written in
 * the legacy lowercase voice (brain.md D8) and is deliberately DESCRIPTIVE
 * — it says what the pillar contains, never what it achieves. No outcome,
 * no metric, no claim. Marked as Proposed in specs/services.md.
 */
const raw = [
  {
    name: 'Digital Marketing & Strategy',
    slug: 'digital-marketing-strategy',
    items: [
      'SEO (Search Engine Optimization)',
      'SEM (Search Engine Marketing)',
      'Email Campaigns & Display Banners',
      'Performance Marketing',
    ],
    proposedLine: 'search, spend, and the numbers underneath them',
  },
  {
    name: 'Creative & Branding',
    slug: 'creative-branding',
    items: [
      'Logo Design & Brand Identity',
      'Video Production & Animation',
      'Brochure, Leaflet, and Catalog Design',
      'Print & Outdoor Advertising',
    ],
    proposedLine: 'identity, film, and everything that ends up printed',
  },
  {
    name: 'Technology & Development',
    slug: 'technology-development',
    items: [
      'Website Design & Development',
      'Mobile App Development (iOS & Android)',
      'IT Servicing & Support',
      'Dedicated Resource/Team Provider',
    ],
    proposedLine: 'sites, apps, and the people who keep them running',
  },
];

export const servicePillars: ServicePillar[] = raw.map((s, i) =>
  validate(ServicePillarSchema, s, `servicePillar[${i}]`),
);
