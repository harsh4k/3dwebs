/**
 * MIT — adapted from Yousuf Soomro, dither-blur-carousel.
 */
import {
  Color,
  DoubleSide,
  LinearMipmapLinearFilter,
  Mesh,
  NoBlending,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
} from "three";

import { cardFragment, cardVertex } from "./shaders/card";
import { entryAspect } from "./tick";
import type { CardMesh, CarouselConfig } from "./types";

const coverRatio = (
  config: CarouselConfig,
  texture: { image: { width: number; height: number } },
) => {
  const cardAspect = config.cardWidth / config.cardHeight;
  const imageAspect = texture.image.width / texture.image.height;
  return new Vector2(
    Math.min(1, cardAspect / imageAspect),
    Math.min(1, imageAspect / cardAspect),
  );
};

export const buildCardGeometry = (config: CarouselConfig) =>
  new PlaneGeometry(config.cardWidth, config.cardHeight, 48, 24);

export const populateCards = (
  scene: { add: (mesh: CardMesh) => void },
  geometry: PlaneGeometry,
  config: CarouselConfig,
  images: readonly string[],
  backgroundLinear: Color,
  maxAnisotropy: number,
  onTextureSettled: () => void,
): CardMesh[] => {
  const loader = new TextureLoader();
  const cards: CardMesh[] = [];

  images.forEach((src, index) => {
    const material = new ShaderMaterial({
      vertexShader: cardVertex,
      fragmentShader: cardFragment,
      uniforms: {
        uMap: { value: null },
        uImageRatio: { value: new Vector2(1, 1) },
        uBackground: { value: backgroundLinear },
        uBackfaceFade: { value: config.backfaceFade },
        uFogNear: { value: config.fogNear },
        uFogFar: { value: config.fogFar },
        uFogStrength: { value: config.fogStrength },
        uProgress: { value: 0 },
        uIndex: { value: index },
        uCount: { value: images.length },
        uRadius: { value: config.radius },
        uPitch: { value: config.pitch },
        uAngleStep: { value: config.angleStep },
        uCurve: { value: config.curve },
        uShingle: { value: config.shingle },
        uVelocity: { value: 0 },
        uBend: { value: config.bend },
        uBendVertical: { value: 1 },
        uBendHorizontal: { value: 0 },
        uHover: { value: 0 },
        uDim: { value: 0 },
        uDimFade: { value: config.dimFade },
        uEntry: { value: 1 },
        uEntryScale: { value: config.entryScale },
        uEntrySoftness: { value: config.entrySoftness },
        uEntryAspect: { value: entryAspect(config) },
      },
      side: DoubleSide,
      blending: NoBlending,
    });
    const mesh = new Mesh(geometry, material) as CardMesh;
    mesh.userData = { hoverRaw: { hover: 0, dim: 0 }, entry: 1, entryOrder: index };
    mesh.frustumCulled = false;
    scene.add(mesh);
    cards.push(mesh);
    loader.load(
      src,
      (texture) => {
        texture.anisotropy = maxAnisotropy;
        texture.colorSpace = SRGBColorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = LinearMipmapLinearFilter;
        material.uniforms.uMap.value = texture;
        material.uniforms.uImageRatio.value.copy(coverRatio(config, texture));
        onTextureSettled();
      },
      undefined,
      onTextureSettled,
    );
  });

  return cards;
};
