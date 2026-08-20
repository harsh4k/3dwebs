/** Scene perspective (px). Constant across layouts. */
export const PERSP = 1500;

export type ShowreelLayout = 'mobile' | 'tablet' | 'desktop';

export interface ShowreelGeo {
  trackVh: number;
  cardWVmin: number;
  cardHVmin: number;
  carouselRVmin: number;
  flybackVmin: number;
  heroPadVmin: number;
  heading1Vmin: number;
  heading2Vmin: number;
  sphereBodyWVmin: number;
  sphereBodyTextVmin: number;
}

const DESKTOP: ShowreelGeo = {
  trackVh: 2000,
  cardWVmin: 42,
  cardHVmin: 62,
  carouselRVmin: 27,
  flybackVmin: 40,
  heroPadVmin: 8,
  heading1Vmin: 18,
  heading2Vmin: 24,
  sphereBodyWVmin: 52,
  sphereBodyTextVmin: 2.4,
};

const TABLET: ShowreelGeo = {
  trackVh: 1700,
  cardWVmin: 54,
  cardHVmin: 80,
  carouselRVmin: 35,
  flybackVmin: 52,
  heroPadVmin: 8,
  heading1Vmin: 13,
  heading2Vmin: 16,
  sphereBodyWVmin: 64,
  sphereBodyTextVmin: 3.0,
};

const MOBILE: ShowreelGeo = {
  trackVh: 1300,
  cardWVmin: 64,
  cardHVmin: 94,
  carouselRVmin: 41,
  flybackVmin: 60,
  heroPadVmin: 8,
  heading1Vmin: 10,
  heading2Vmin: 12,
  sphereBodyWVmin: 82,
  sphereBodyTextVmin: 4.2,
};

export const GEO: Record<ShowreelLayout, ShowreelGeo> = {
  desktop: DESKTOP,
  tablet: TABLET,
  mobile: MOBILE,
};

export const DESKTOP_GEO = DESKTOP;

export const SR_VARS = {
  cardW: '--sr-card-w',
  cardH: '--sr-card-h',
  carouselR: '--sr-carousel-r',
  flyback: '--sr-flyback',
  heroPad: '--sr-hero-pad',
  heading1: '--sr-heading-1',
  heading2: '--sr-heading-2',
  sphereBodyW: '--sr-sphere-body-w',
  sphereBodyText: '--sr-sphere-body-text',
} as const;

export const geoCssVars = (g: ShowreelGeo): Record<string, string> => ({
  [SR_VARS.cardW]: `${g.cardWVmin}vmin`,
  [SR_VARS.cardH]: `${g.cardHVmin}vmin`,
  [SR_VARS.carouselR]: `${g.carouselRVmin}vmin`,
  [SR_VARS.flyback]: `${g.flybackVmin}vmin`,
  [SR_VARS.heroPad]: `${g.heroPadVmin}vmin`,
  [SR_VARS.heading1]: `${g.heading1Vmin}vmin`,
  [SR_VARS.heading2]: `${g.heading2Vmin}vmin`,
  [SR_VARS.sphereBodyW]: `${g.sphereBodyWVmin}vmin`,
  [SR_VARS.sphereBodyText]: `${g.sphereBodyTextVmin}vmin`,
});
