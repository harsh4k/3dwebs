/**
 * MIT — adapted from Yousuf Soomro, dither-blur-carousel.
 * Numeric tunables only. Palette hex is applied from CSS tokens at mount
 * (see applyBrandPalette) so tokens.css remains the source of truth.
 */
import { cssColorToHex } from "./color";
import type { CarouselConfig } from "./types";

const INK = "#3f2210";
const PAPER = "#fffaf3";
const CREAM = "#fff2db";

export const createCarouselConfig = (): CarouselConfig => ({
  radius: 3.8,
  pitch: 1.27,
  angleStep: 0.8,
  curve: 1.0,
  cardWidth: 3.2,
  cardHeight: 1.6,
  shingle: 0.055,
  backfaceFade: 0,
  fogNear: 8.0,
  fogFar: 20.6,
  fogStrength: 1.0,
  depthBlur: 1.0,
  lift: 0,
  cameraZ: 10,
  fov: 48,
  wheelStrength: 0.0022,
  dragStrength: 0.007,
  ease: 0.075,
  autoSpin: 0.0,
  snap: false,
  snapSpeed: 0.02,
  snapDelay: 300,
  snapStiffness: 0.04,
  snapDamping: 0.54,
  entry: true,
  entryDuration: 1050,
  entryStagger: 60,
  entryCurve: 1.0,
  entrySoftness: 0.45,
  entryScale: 9.5,
  entryRound: 1,
  entrySpin: 9.4,
  entrySpinDuration: 2400,
  entryEaseIn: 0.29,
  entryEaseOut: 0.94,
  entryDither: 0.45,
  entryDitherLevels: 4,
  entryDitherDissolve: 1.0,
  entryDitherInk: INK,
  entryDitherAccent: PAPER,
  entryDitherPaper: INK,
  entryDitherGamma: 1.5,
  entryDitherMono: 0.25,
  hoverInEase: 0.095,
  hoverOutEase: 0.07,
  hoverCurve: 0.95,
  dimFade: 0.67,
  hoverClean: 1.0,
  hoverIntent: true,
  hoverSettleSpeed: 8,
  focusFalloff: 0.7,
  hoverBlur: 0.13,
  hoverBlurCurve: 1.0,
  hoverDither: 0.3,
  hoverDitherCurve: 1.9,
  hoverDitherLevels: 8,
  hoverDitherScale: 10,
  hoverDitherCutoff: 0.22,
  hoverDitherInk: INK,
  hoverDitherAccent: PAPER,
  hoverDitherPaper: INK,
  hoverDitherGamma: 1.8,
  hoverDitherMono: 0.22,
  clickToFocus: false,
  clickSlop: 6,
  focusDuration: 1300,
  focusEaseIn: 0.35,
  focusEaseOut: 0.98,
  cardBufferScale: 0.5,
  bend: 2.7,
  bendMode: "horizontal",
  bendEase: 0.12,
  bendMaxVelocity: 0.07,
  focusSize: 0.25,
  edgePower: 1.65,
  blurStrength: 0.47,
  streakAngle: 90,
  streakSpread: 4.5,
  streakAnisotropy: 0,
  coupling: 0.55,
  stageStreakEnd: 0.55,
  stageDitherBegin: 0.45,
  stageHandoff: 0.75,
  dither: true,
  ditherAmount: 0.77,
  ditherStart: 0.64,
  ditherPower: 1.25,
  ditherDepth: 1.0,
  ditherScale: 7.5,
  maxLevels: 8,
  minLevels: 8,
  fadeStrength: 0,
  ditherInk: INK,
  ditherAccent: PAPER,
  ditherPaper: INK,
  ditherGamma: 1.8,
  ditherMono: 0.22,
  ditherDissolve: 0,
  trail: true,
  trailRadius: 132,
  trailSpeedInfluence: 1,
  trailSpeedRange: 6,
  trailDecay: 0.962,
  trailDissipate: 1.6,
  trailSmoothing: 0.24,
  trailIdleDelay: 220,
  trailIdleDecay: 0.869,
  trailIdleDrift: false,
  trailAmount: 0.78,
  trailCutoff: 0.125,
  trailWarp: 0.36,
  trailAberration: 0,
  trailContrast: 0.77,
  trailScale: 8.5,
  trailLevels: 6,
  trailDissolve: 1.0,
  trailInk: INK,
  trailAccent: PAPER,
  trailPaper: INK,
  trailGamma: 2.0,
  trailMono: 0.29,
  trailRim: 0,
  trailRimColor: PAPER,
  trailRimThickness: 0.3,
  trailRimSoftness: 0.45,
  background: CREAM,
});

/** Pulls --ink / --paper / --cream from the document so WebGL matches tokens.css. */
export const applyBrandPalette = (config: CarouselConfig): void => {
  const css = getComputedStyle(document.documentElement);
  const ink = cssColorToHex(css.getPropertyValue("--ink"), INK);
  const paper = cssColorToHex(css.getPropertyValue("--paper"), PAPER);
  const cream = cssColorToHex(css.getPropertyValue("--cream"), CREAM);

  config.background = cream;
  config.ditherInk = ink;
  config.ditherAccent = paper;
  config.ditherPaper = ink;
  config.hoverDitherInk = ink;
  config.hoverDitherAccent = paper;
  config.hoverDitherPaper = ink;
  config.entryDitherInk = ink;
  config.entryDitherAccent = paper;
  config.entryDitherPaper = ink;
  config.trailInk = ink;
  config.trailAccent = paper;
  config.trailPaper = ink;
  config.trailRimColor = paper;
};
