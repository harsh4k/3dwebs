import { ProjectSchema, validate, type Project } from './schema';

/**
 * The eleven live-tier projects from credentials deck slides 5–32.
 * Palava has no outbound link (the microsite 301s to Lodha corporate).
 * Imagery is the 4:3 screenshot from the credentials deck — not a live capture,
 * not generated.
 */
const deck = (slug: string, alt: string, width: number, height: number) => ({
  src: `/work/${slug}/${slug}-deck.webp`,
  alt,
  width,
  height,
});

const raw = [
  {
    slug: 'abbott-smartpack',
    client: 'Abbott',
    title: 'SmartPack',
    deliverables: ['Website design', 'Development'],
    tier: 'A' as const,
    liveUrl: 'https://abbottsmartpack.in/',
    featured: true,
    images: [deck('abbott-smartpack', 'Credentials-deck screenshot of Abbott SmartPack.', 1731, 992)],
  },
  {
    slug: 'making-india-heart-strong',
    client: 'Sun Pharma',
    title: 'Making India Heart Strong',
    deliverables: ['Campaign microsite', 'Development'],
    tier: 'A' as const,
    liveUrl: 'https://makingindiaheartstrong.com/',
    featured: true,
    images: [
      deck(
        'making-india-heart-strong',
        'Credentials-deck screenshot of Making India Heart Strong.',
        1669,
        853,
      ),
    ],
  },
  {
    slug: 'synergycom-usa',
    client: 'Synergycom',
    title: 'Synergycom USA',
    deliverables: ['Website'],
    tier: 'A' as const,
    liveUrl: 'https://synergycom.com/',
    featured: true,
    images: [deck('synergycom-usa', 'Credentials-deck screenshot of Synergycom USA.', 1660, 818)],
  },
  {
    slug: 'enrituals',
    client: 'Enrituals',
    title: 'Enrituals',
    deliverables: ['Website'],
    tier: 'A' as const,
    liveUrl: 'https://coffeedigital.in/enrituals-merge/',
    featured: true,
    images: [deck('enrituals', 'Credentials-deck screenshot of Enrituals.', 1538, 826)],
  },
  {
    slug: 'pronto-insurance',
    client: 'Pronto',
    title: 'Pronto Insurance',
    deliverables: ['Website'],
    tier: 'A' as const,
    liveUrl: 'https://prontoinsurance.com/',
    featured: true,
    images: [deck('pronto-insurance', 'Credentials-deck screenshot of Pronto Insurance.', 1366, 700)],
  },
  {
    slug: 'uncle-sams-kitchen',
    client: 'Uncle Sams Kitchen',
    title: 'Uncle Sams Kitchen',
    deliverables: ['Website'],
    tier: 'A' as const,
    liveUrl: 'https://unclesamskitchen.com/',
    featured: true,
    images: [deck('uncle-sams-kitchen', 'Credentials-deck screenshot of Uncle Sams Kitchen.', 1442, 814)],
  },
  {
    slug: 'electrotherm-corporate',
    client: 'Electrotherm',
    title: 'Electrotherm Corporate',
    deliverables: ['Website'],
    tier: 'A' as const,
    liveUrl: 'https://electrotherm.com/',
    featured: true,
    images: [
      deck('electrotherm-corporate', 'Credentials-deck screenshot of Electrotherm Corporate.', 1538, 826),
    ],
  },
  {
    slug: 'motorola',
    client: 'Motorola',
    title: 'Motorola',
    deliverables: ['Website'],
    tier: 'A' as const,
    liveUrl: 'https://coffeedigital.in/moto/',
    featured: true,
    images: [deck('motorola', 'Credentials-deck screenshot of Motorola.', 1245, 670)],
  },
  {
    slug: 'lodha-palava',
    client: 'Lodha',
    title: 'Lodha Palava',
    deliverables: ['Website'],
    tier: 'A' as const,
    featured: true,
    images: [deck('lodha-palava', 'Credentials-deck screenshot of Lodha Palava.', 1000, 536)],
  },
  {
    slug: 'fevicol-design-ideas',
    client: 'Pidilite',
    title: 'Fevicol Design Ideas',
    deliverables: ['Website design', 'Development', 'Content platform'],
    tier: 'A' as const,
    liveUrl: 'https://www.fevicoldesignideas.com/',
    featured: true,
    images: [deck('fevicol-design-ideas', 'Credentials-deck screenshot of Fevicol Design Ideas.', 900, 482)],
  },
  {
    slug: 'indiabulls-foundation',
    client: 'Indiabulls',
    title: 'Indiabulls Foundation',
    deliverables: ['Website'],
    tier: 'A' as const,
    liveUrl: 'https://indiabullsfoundation.com/',
    featured: true,
    images: [
      deck('indiabulls-foundation', 'Credentials-deck screenshot of Indiabulls Foundation.', 1538, 826),
    ],
  },
];

export const projects: Project[] = raw.map((p, i) => validate(ProjectSchema, p, `project[${i}]`));

export const featuredProjects = projects.filter((p) => p.featured);

/** Confirmed from the credentials deck: 28 entries across slides 5–32. */
export const TOTAL_PROJECTS = 28;
