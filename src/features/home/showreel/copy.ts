import { featuredProjects } from '@/content/projects';
import { servicePillars } from '@/content/services';
import { awardsFraming, positioning, site } from '@/content/site';
import { carouselSlugs } from './assets';

const pillar = (i: number) => servicePillars[i];

export const showreelCopy = {
  heroLines: ['the digital', 'branding people'] as const,
  browse: 'see the\nwork',
  heroBody: positioning,
  seeWork: 'see the work',
  startProject: 'start a project',
  mailto: `mailto:${site.email}`,
  workHref: '/work',
  workIndexHref: '/work',
  marquee: [
    pillar(0)?.name ?? '',
    pillar(1)?.name ?? '',
    pillar(2)?.name ?? '',
    site.tagline,
  ],
  card2: {
    href: `/services#${pillar(0)?.slug ?? ''}`,
    client: pillar(0)?.name ?? '',
    title: pillar(0)?.proposedLine ?? '',
  },
  card3: {
    href: `/services#${pillar(1)?.slug ?? ''}`,
    client: pillar(1)?.name ?? '',
    title: pillar(1)?.proposedLine ?? '',
  },
  sphere: {
    headingTop: 'the digital',
    headingBottom: ['branding', 'people'] as const,
    body: [positioning, awardsFraming] as const,
    cardLabel: pillar(2)?.name ?? '',
    cardUrl: site.domain,
    cardHeading: pillar(2)?.proposedLine ?? '',
  },
  carouselCta: 'see the work',
  portfolio: featuredProjects
    .filter((project) => !(carouselSlugs as readonly string[]).includes(project.slug))
    .map((project) => ({
      title: project.title,
      client: project.client,
      discipline: project.deliverables.join(' · '),
      image: project.images[0]?.src ?? '',
      href: `/work?case=${project.slug}`,
    })),
} as const;
