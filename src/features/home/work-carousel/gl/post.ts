/**
 * MIT — adapted from Yousuf Soomro, dither-blur-carousel.
 */
import {
  Camera,
  ClampToEdgeWrapping,
  HalfFloatType,
  LinearFilter,
  Mesh,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";

import { hexToSRGB } from "./color";
import { compositeFragment } from "./shaders/composite";
import { fullscreenVertex, streakFragment } from "./shaders/fullscreen";
import type { CarouselConfig } from "./types";

const BLUR_LEVELS = 4;

const makeTarget = (width: number, height: number) => {
  const target = new WebGLRenderTarget(Math.max(1, width), Math.max(1, height), {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat,
    type: HalfFloatType,
    depthBuffer: false,
  });
  target.texture.generateMipmaps = false;
  target.texture.wrapS = ClampToEdgeWrapping;
  target.texture.wrapT = ClampToEdgeWrapping;
  return target;
};

export const createPostPipeline = (
  renderer: WebGLRenderer,
  config: CarouselConfig,
  background: ReturnType<typeof hexToSRGB>,
) => {
  const quadScene = new Scene();
  const quadCamera = new Camera();
  const quadGeometry = new PlaneGeometry(2, 2);

  const streakMaterial = new ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: streakFragment,
    uniforms: {
      uMap: { value: null },
      uTexel: { value: new Vector2() },
      uDirection: { value: new Vector2(0, 1) },
      uSpread: { value: 1 },
    },
    depthTest: false,
    depthWrite: false,
  });

  const compositeMaterial = new ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: compositeFragment,
    uniforms: {
      uScene: { value: null },
      uCardBuffer: { value: null },
      uBlur1: { value: null },
      uBlur2: { value: null },
      uBlur3: { value: null },
      uBlur4: { value: null },
      uBackground: { value: background },
      uResolution: { value: new Vector2() },
      uFocusSize: { value: config.focusSize },
      uEdgePower: { value: config.edgePower },
      uBlurStrength: { value: config.blurStrength },
      uDitherScale: { value: config.ditherScale },
      uMaxLevels: { value: config.maxLevels },
      uMinLevels: { value: config.minLevels },
      uFadeStrength: { value: config.fadeStrength },
      uDitherAmount: { value: config.dither ? config.ditherAmount : 0 },
      uDitherStart: { value: config.ditherStart },
      uDitherPower: { value: config.ditherPower },
      uDitherDepth: { value: config.ditherDepth },
      uHoverBlur: { value: config.hoverBlur },
      uHoverBlurCurve: { value: config.hoverBlurCurve },
      uHoverDither: { value: config.hoverDither },
      uHoverDitherCurve: { value: config.hoverDitherCurve },
      uHoverDitherLevels: { value: config.hoverDitherLevels },
      uHoverDitherScale: { value: config.hoverDitherScale },
      uHoverDitherCutoff: { value: config.hoverDitherCutoff },
      uHoverClean: { value: config.hoverClean },
      uInk: { value: hexToSRGB(config.ditherInk) },
      uAccent: { value: hexToSRGB(config.ditherAccent) },
      uPaper: { value: hexToSRGB(config.ditherPaper) },
      uGamma: { value: config.ditherGamma },
      uMono: { value: config.ditherMono },
      uHoverInk: { value: hexToSRGB(config.hoverDitherInk) },
      uHoverAccent: { value: hexToSRGB(config.hoverDitherAccent) },
      uHoverPaper: { value: hexToSRGB(config.hoverDitherPaper) },
      uHoverGamma: { value: config.hoverDitherGamma },
      uHoverMono: { value: config.hoverDitherMono },
      uTrail: { value: null },
      uTrailAmount: { value: config.trail ? config.trailAmount : 0 },
      uTrailCutoff: { value: config.trailCutoff },
      uTrailWarp: { value: config.trailWarp },
      uTrailAberration: { value: config.trailAberration },
      uTrailContrast: { value: config.trailContrast },
      uTrailScale: { value: config.trailScale },
      uTrailLevels: { value: config.trailLevels },
      uTrailDissolve: { value: config.trailDissolve },
      uTrailInk: { value: hexToSRGB(config.trailInk) },
      uTrailAccent: { value: hexToSRGB(config.trailAccent) },
      uTrailPaper: { value: hexToSRGB(config.trailPaper) },
      uTrailGamma: { value: config.trailGamma },
      uTrailMono: { value: config.trailMono },
      uTrailRim: { value: config.trailRim },
      uTrailRimColor: { value: hexToSRGB(config.trailRimColor) },
      uTrailRimThickness: { value: config.trailRimThickness },
      uTrailRimSoftness: { value: config.trailRimSoftness },
      uDissolve: { value: config.ditherDissolve },
      uEntryDither: { value: config.entryDither },
      uEntryScale: { value: config.entryScale },
      uEntryLevels: { value: config.entryDitherLevels },
      uEntryDissolve: { value: config.entryDitherDissolve },
      uEntryInk: { value: hexToSRGB(config.entryDitherInk) },
      uEntryAccent: { value: hexToSRGB(config.entryDitherAccent) },
      uEntryPaper: { value: hexToSRGB(config.entryDitherPaper) },
      uEntryGamma: { value: config.entryDitherGamma },
      uEntryMono: { value: config.entryDitherMono },
      uCoupling: { value: config.coupling },
      uStageStreakEnd: { value: config.stageStreakEnd },
      uStageDitherBegin: { value: config.stageDitherBegin },
      uStageHandoff: { value: config.stageHandoff },
      uLift: { value: config.lift },
      uDepthBlur: { value: config.depthBlur },
    },
    depthTest: false,
    depthWrite: false,
  });

  const quad = new Mesh(quadGeometry, streakMaterial);
  quad.frustumCulled = false;
  quadScene.add(quad);

  let sceneTarget = new WebGLRenderTarget(1, 1, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    type: HalfFloatType,
    samples: 4,
  });
  sceneTarget.texture.generateMipmaps = false;

  let blurTargets: WebGLRenderTarget[] = [];
  let scratchTargets: WebGLRenderTarget[] = [];

  const setSize = (width: number, height: number, pixelRatio: number) => {
    const w = Math.floor(width * pixelRatio);
    const h = Math.floor(height * pixelRatio);
    sceneTarget.setSize(w, h);
    compositeMaterial.uniforms.uResolution.value.set(w, h);
    [...blurTargets, ...scratchTargets].forEach((t) => t.dispose());
    blurTargets = [];
    scratchTargets = [];
    let lw = w;
    let lh = h;
    for (let i = 0; i < BLUR_LEVELS; i += 1) {
      lw = Math.max(1, Math.floor(lw / 2));
      lh = Math.max(1, Math.floor(lh / 2));
      blurTargets.push(makeTarget(lw, lh));
      scratchTargets.push(makeTarget(lw, lh));
    }
    compositeMaterial.uniforms.uBlur1.value = blurTargets[0]?.texture ?? null;
    compositeMaterial.uniforms.uBlur2.value = blurTargets[1]?.texture ?? null;
    compositeMaterial.uniforms.uBlur3.value = blurTargets[2]?.texture ?? null;
    compositeMaterial.uniforms.uBlur4.value = blurTargets[3]?.texture ?? null;
    compositeMaterial.uniforms.uScene.value = sceneTarget.texture;
  };

  const along = new Vector2();
  const across = new Vector2();

  const blurPass = (
    source: WebGLRenderTarget,
    target: WebGLRenderTarget,
    direction: Vector2,
    spread: number,
  ) => {
    const u = streakMaterial.uniforms;
    u.uMap.value = source.texture;
    u.uTexel.value.set(1 / target.width, 1 / target.height);
    u.uDirection.value.copy(direction);
    u.uSpread.value = spread;
    renderer.setRenderTarget(target);
    renderer.render(quadScene, quadCamera);
  };

  const render = (scene: Scene, camera: Camera) => {
    renderer.setRenderTarget(sceneTarget);
    renderer.clear();
    renderer.render(scene, camera);
    const radians = (config.streakAngle * Math.PI) / 180;
    along.set(Math.cos(radians), Math.sin(radians));
    across.set(-along.y, along.x);
    quad.material = streakMaterial;
    let source: WebGLRenderTarget = sceneTarget;
    for (let i = 0; i < BLUR_LEVELS; i += 1) {
      const scratch = scratchTargets[i];
      const blur = blurTargets[i];
      if (!scratch || !blur) continue;
      blurPass(source, scratch, along, config.streakSpread);
      blurPass(scratch, blur, across, config.streakSpread * config.streakAnisotropy);
      source = blur;
    }
    quad.material = compositeMaterial;
    renderer.setRenderTarget(null);
    renderer.render(quadScene, quadCamera);
  };

  const dispose = () => {
    sceneTarget.dispose();
    [...blurTargets, ...scratchTargets].forEach((t) => t.dispose());
    quadGeometry.dispose();
    streakMaterial.dispose();
    compositeMaterial.dispose();
  };

  return { setSize, render, dispose, compositeMaterial };
};
