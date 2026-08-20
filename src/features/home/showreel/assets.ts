const work = (slug: string) => `/work/${slug}/${slug}-deck.webp`;
const card = (slug: string) => `/work/${slug}/${slug}-card.webp`;

export const carouselSlugs = [
  'abbott-smartpack',
  'making-india-heart-strong',
  'synergycom-usa',
  'enrituals',
] as const;

const allWorkSlugs = [
  'abbott-smartpack',
  'making-india-heart-strong',
  'synergycom-usa',
  'enrituals',
  'pronto-insurance',
  'uncle-sams-kitchen',
  'electrotherm-corporate',
  'motorola',
  'lodha-palava',
  'fevicol-design-ideas',
  'indiabulls-foundation',
] as const;

export const assets = {
  stone: card(carouselSlugs[0]),
  hero2: card(carouselSlugs[1]),
  card2: card(carouselSlugs[2]),
  card3: card(carouselSlugs[3]),
  star: '/generated/star.svg',
  grid: allWorkSlugs.map(work),
} as const;
