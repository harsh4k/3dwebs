/**
 * MIT — adapted from Yousuf Soomro, dither-blur-carousel.
 */
import {
  Camera,
  LinearFilter,
  NoBlending,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";

import { bayerGLSL, revealGLSL } from "./shaders/dither";
import { cardVertex } from "./shaders/card";
import type { CardMesh, CarouselConfig } from "./types";

const cardBufferFragment = /* glsl */ `
  uniform float uPickId;
  uniform float uDim;
  uniform float uHover;
  varying vec2 vUv;
  ${bayerGLSL}
  ${revealGLSL}
  void main() {
    if (entryHidden(vUv)) discard;
    gl_FragColor = vec4(uPickId, uDim, uHover, 1.0 - uEntry);
  }
`;

export const createCardBuffer = (
  renderer: WebGLRenderer,
  scene: Scene,
  cards: CardMesh[],
  config: CarouselConfig,
) => {
  const target = new WebGLRenderTarget(1, 1, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    type: UnsignedByteType,
  });
  target.texture.generateMipmaps = false;

  cards.forEach((card, index) => {
    card.userData.bufferMaterial = new ShaderMaterial({
      vertexShader: cardVertex,
      fragmentShader: cardBufferFragment,
      uniforms: {
        ...card.material.uniforms,
        uPickId: { value: (index + 1) / 255 },
      },
      side: card.material.side,
      blending: NoBlending,
    });
  });

  const pixel = new Uint8Array(4);

  const setSize = (width: number, height: number) => {
    target.setSize(
      Math.max(1, Math.floor(width * config.cardBufferScale)),
      Math.max(1, Math.floor(height * config.cardBufferScale)),
    );
  };

  const render = (camera: Camera) => {
    const background = scene.background;
    scene.background = null;
    for (const card of cards) {
      card.userData.visibleMaterial = card.material;
      const buffer = card.userData.bufferMaterial;
      if (buffer) card.material = buffer;
    }
    renderer.setRenderTarget(target);
    renderer.setClearColor(0x000000, 1);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    for (const card of cards) {
      const visible = card.userData.visibleMaterial;
      if (visible) card.material = visible;
    }
    scene.background = background;
  };

  const pick = (x: number, y: number): number => {
    const px = Math.min(target.width - 1, Math.max(0, Math.floor(x * target.width)));
    const py = Math.min(target.height - 1, Math.max(0, Math.floor(y * target.height)));
    renderer.readRenderTargetPixels(target, px, py, 1, 1, pixel);
    return pixel[0] === 0 ? -1 : pixel[0] - 1;
  };

  const dispose = () => {
    target.dispose();
    cards.forEach((card) => card.userData.bufferMaterial?.dispose());
  };

  return { setSize, render, pick, dispose, texture: target.texture };
};
