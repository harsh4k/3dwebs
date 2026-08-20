/**
 * MIT — adapted from Yousuf Soomro, dither-blur-carousel.
 * Per-frame helix, hover, and composite uniform updates.
 */
import type { ShaderMaterial } from "three";

import type { CardMesh, CarouselConfig } from "./types";

const BEND_WEIGHTS = {
  vertical: [1, 0],
  horizontal: [0, 1],
  both: [0.7, 0.7],
} as const;

export const approach = (current: number, target: number, config: CarouselConfig): number => {
  const rate = target > current ? config.hoverInEase : config.hoverOutEase;
  return current + (target - current) * rate;
};

export const entryAspect = (config: CarouselConfig): number => {
  const aspect = config.cardWidth / config.cardHeight;
  return 1 + (aspect - 1) * config.entryRound;
};

export const smoothstep = (edge0: number, edge1: number, x: number): number => {
  if (edge1 <= edge0) return x <= edge0 ? 0 : 1;
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

export const centredIndex = (progress: number, total: number): number => {
  const centred = Math.round(progress + total / 2);
  return ((centred % total) + total) % total;
};

export const slotOf = (index: number, progress: number, count: number): number => {
  const slot = (index - progress) % count;
  return slot < 0 ? slot + count : slot;
};

export const updateCards = (
  cards: CardMesh[],
  config: CarouselConfig,
  progress: number,
  hovered: number,
  bendVelocity: number,
  entryElapsed: number,
) => {
  const count = cards.length;
  const anyHovered = hovered >= 0;
  const hoveredSlot = anyHovered ? slotOf(hovered, progress, count) : 0;
  const weights = BEND_WEIGHTS[config.bendMode];

  for (const [index, card] of cards.entries()) {
    const u = card.material.uniforms;
    const isHovered = index === hovered;
    const raw = card.userData.hoverRaw;
    const slot = slotOf(index, progress, count);
    const separation = anyHovered ? Math.abs(slot - hoveredSlot) : 0;
    const dimTarget = anyHovered ? smoothstep(0, config.focusFalloff, separation) : 0;
    raw.hover = approach(raw.hover, isHovered ? 1 : 0, config);
    raw.dim = approach(raw.dim, dimTarget, config);
    const local = Math.min(
      1,
      Math.max(
        0,
        (entryElapsed - card.userData.entryOrder * config.entryStagger) /
          Math.max(1, config.entryDuration),
      ),
    );
    card.userData.entry = Math.min(
      card.userData.entry,
      1 - smoothstep(0, 1, Math.pow(local, config.entryCurve)),
    );
    u.uHover.value = Math.pow(raw.hover, config.hoverCurve);
    u.uDim.value = Math.pow(raw.dim, config.hoverCurve);
    u.uDimFade.value = config.dimFade;
    u.uEntry.value = card.userData.entry;
    u.uEntryScale.value = config.entryScale;
    u.uEntrySoftness.value = config.entrySoftness;
    u.uEntryAspect.value = entryAspect(config);
    u.uProgress.value = progress;
    u.uRadius.value = config.radius;
    u.uPitch.value = config.pitch;
    u.uAngleStep.value = config.angleStep;
    u.uCurve.value = config.curve;
    u.uShingle.value = config.shingle;
    u.uVelocity.value = bendVelocity;
    u.uBend.value = config.bend;
    u.uBendVertical.value = weights[0];
    u.uBendHorizontal.value = weights[1];
    u.uBackfaceFade.value = config.backfaceFade;
    u.uFogNear.value = config.fogNear;
    u.uFogFar.value = config.fogFar;
    u.uFogStrength.value = config.fogStrength;
  }
};

export const syncComposite = (material: ShaderMaterial, config: CarouselConfig) => {
  const c = material.uniforms;
  c.uFocusSize.value = config.focusSize;
  c.uEdgePower.value = config.edgePower;
  c.uBlurStrength.value = config.blurStrength;
  c.uDitherScale.value = config.ditherScale;
  c.uMaxLevels.value = config.maxLevels;
  c.uMinLevels.value = config.minLevels;
  c.uFadeStrength.value = config.fadeStrength;
  c.uDitherAmount.value = config.dither ? config.ditherAmount : 0;
  c.uDitherStart.value = config.ditherStart;
  c.uDitherPower.value = config.ditherPower;
  c.uDitherDepth.value = config.ditherDepth;
  c.uGamma.value = config.ditherGamma;
  c.uMono.value = config.ditherMono;
  c.uDissolve.value = config.ditherDissolve;
  c.uHoverBlur.value = config.hoverBlur;
  c.uHoverBlurCurve.value = config.hoverBlurCurve;
  c.uHoverDither.value = config.hoverDither;
  c.uHoverDitherCurve.value = config.hoverDitherCurve;
  c.uHoverDitherLevels.value = config.hoverDitherLevels;
  c.uHoverDitherScale.value = config.hoverDitherScale;
  c.uHoverDitherCutoff.value = config.hoverDitherCutoff;
  c.uHoverGamma.value = config.hoverDitherGamma;
  c.uHoverMono.value = config.hoverDitherMono;
  c.uTrailAmount.value = config.trail ? config.trailAmount : 0;
  c.uTrailCutoff.value = config.trailCutoff;
  c.uTrailWarp.value = config.trailWarp;
  c.uTrailAberration.value = config.trailAberration;
  c.uTrailContrast.value = config.trailContrast;
  c.uTrailScale.value = config.trailScale;
  c.uTrailLevels.value = config.trailLevels;
  c.uTrailDissolve.value = config.trailDissolve;
  c.uTrailGamma.value = config.trailGamma;
  c.uTrailMono.value = config.trailMono;
  c.uTrailRim.value = config.trailRim;
  c.uTrailRimThickness.value = config.trailRimThickness;
  c.uTrailRimSoftness.value = config.trailRimSoftness;
  c.uEntryDither.value = config.entry ? config.entryDither : 0;
  c.uEntryScale.value = config.entryScale;
  c.uEntryLevels.value = config.entryDitherLevels;
  c.uEntryDissolve.value = config.entryDitherDissolve;
  c.uEntryGamma.value = config.entryDitherGamma;
  c.uEntryMono.value = config.entryDitherMono;
  c.uHoverClean.value = config.hoverClean;
  c.uCoupling.value = config.coupling;
  c.uStageStreakEnd.value = config.stageStreakEnd;
  c.uStageDitherBegin.value = config.stageDitherBegin;
  c.uStageHandoff.value = config.stageHandoff;
  c.uLift.value = config.lift;
  c.uDepthBlur.value = config.depthBlur;
};
