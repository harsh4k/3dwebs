/**
 * MIT — adapted from Yousuf Soomro, dither-blur-carousel.
 */
import {
  Color,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";

import { subscribeToTicker } from "@/lib/animation/ticker";
import { clampedPixelRatio, deviceTier, frameBudgetMs } from "@/lib/scene/device";

import { createCardBuffer } from "./cardbuffer";
import { buildCardGeometry, populateCards } from "./cards";
import { hexToSRGB } from "./color";
import { createPostPipeline } from "./post";
import { createScrollController } from "./scroll";
import { centredIndex, syncComposite, updateCards } from "./tick";
import { createTrail } from "./trail";
import type { CreateCarouselOptions } from "./types";

const ENTRY_WAIT_LIMIT = 5000;

export const createCarousel = (canvas: HTMLCanvasElement, options: CreateCarouselOptions) => {
  const { images, config, pointer, trail: trailEnabled, getPageSlot, isPaused } = options;
  const renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(clampedPixelRatio(deviceTier()));
  canvas.style.touchAction = "pan-y";

  const scene = new Scene();
  const camera = new PerspectiveCamera(config.fov, 1, 0.1, 100);
  camera.position.z = config.cameraZ;
  const backgroundLinear = new Color(config.background);
  scene.background = backgroundLinear;

  const post = createPostPipeline(renderer, config, hexToSRGB(config.background));
  const scroll = createScrollController(config);
  const trail = createTrail(renderer, canvas, config, trailEnabled);
  const geometry = buildCardGeometry(config);
  let pending = images.length;
  let entryStart: number | null = null;
  let entryWait = 0;
  let beginEntry = () => {};

  const textureSettled = () => {
    if (pending === 0 || --pending > 0) return;
    window.clearTimeout(entryWait);
    beginEntry();
  };

  const cards = populateCards(
    scene,
    geometry,
    config,
    images,
    backgroundLinear,
    renderer.capabilities.getMaxAnisotropy(),
    textureSettled,
  );

  const shuffleEntryOrder = () => {
    const order = cards.map((_, index) => index);
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const swap = order[i];
      const other = order[j];
      if (swap === undefined || other === undefined) continue;
      order[i] = other;
      order[j] = swap;
    }
    cards.forEach((card, index) => {
      card.userData.entryOrder = order[index] ?? index;
    });
  };

  const parkForEntry = () => {
    shuffleEntryOrder();
    for (const card of cards) {
      card.userData.entry = 1;
      card.material.uniforms.uEntry.value = 1;
    }
  };

  beginEntry = () => {
    if (!config.entry) return;
    parkForEntry();
    entryStart = performance.now();
  };

  entryWait = window.setTimeout(() => {
    pending = 0;
    beginEntry();
  }, ENTRY_WAIT_LIMIT);

  const cardBuffer = createCardBuffer(renderer, scene, cards, config);
  post.compositeMaterial.uniforms.uCardBuffer.value = cardBuffer.texture;
  if (config.entry) parkForEntry();

  const pointerState = { x: 0, y: 0, inside: false };
  let hovered = -1;
  let travel = 0;
  let pointerSpeed = 0;
  let lastClient: { x: number; y: number } | null = null;
  let locked = -1;
  const lockOrigin = { x: 0, y: 0 };
  const press = { x: 0, y: 0 };

  const focusCard = (index: number) => {
    const count = cards.length;
    const base = index - count / 2;
    const nearest = base + Math.round((scroll.state.current - base) / count) * count;
    scroll.goTo(nearest);
  };

  const onPointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointerState.x = (event.clientX - rect.left) / rect.width;
    pointerState.y = 1 - (event.clientY - rect.top) / rect.height;
    pointerState.inside =
      pointerState.x >= 0 && pointerState.x <= 1 && pointerState.y >= 0 && pointerState.y <= 1;
    if (lastClient) {
      travel += Math.hypot(event.clientX - lastClient.x, event.clientY - lastClient.y);
    } else {
      lastClient = { x: 0, y: 0 };
    }
    lastClient.x = event.clientX;
    lastClient.y = event.clientY;
    if (locked >= 0) {
      const travelled = Math.hypot(event.clientX - lockOrigin.x, event.clientY - lockOrigin.y);
      if (travelled > config.clickSlop) locked = -1;
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    press.x = event.clientX;
    press.y = event.clientY;
    pointerSpeed = 0;
    travel = 0;
  };

  const onPointerUp = (event: PointerEvent) => {
    if (hovered < 0) return;
    const travelled = Math.hypot(event.clientX - press.x, event.clientY - press.y);
    if (travelled > config.clickSlop) return;
    locked = hovered;
    lockOrigin.x = event.clientX;
    lockOrigin.y = event.clientY;
    options.onCardClick?.(hovered);
  };

  if (pointer) {
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", () => {
      pointerState.inside = false;
    });
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
  }

  const resize = () => {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    post.setSize(width, height, renderer.getPixelRatio());
    cardBuffer.setSize(width, height);
    trail.setSize(width, height, renderer.getPixelRatio());
  };

  let activeIndex = -1;
  const budget = frameBudgetMs(deviceTier());

  const tick = () => {
    if (isPaused() || document.hidden) return;
    scroll.syncFromPage(getPageSlot());
    const progress = scroll.update();
    const total = cards.length;
    if (total === 0) return;
    const centred = centredIndex(progress, total);
    if (centred !== activeIndex) {
      activeIndex = centred;
      options.onActiveChange?.(activeIndex);
    }
    pointerSpeed += (travel - pointerSpeed) * 0.35;
    travel = 0;
    const settled = !config.hoverIntent || pointerSpeed <= config.hoverSettleSpeed;
    cardBuffer.render(camera);
    const picked =
      pointer && locked < 0 && pointerState.inside
        ? cardBuffer.pick(pointerState.x, pointerState.y)
        : -1;
    hovered = locked >= 0 ? locked : settled ? picked : hovered;
    canvas.style.cursor = hovered >= 0 ? "pointer" : "default";
    const entryElapsed = !config.entry
      ? Infinity
      : entryStart === null
        ? -Infinity
        : performance.now() - entryStart;
    updateCards(cards, config, progress, pointer ? hovered : -1, scroll.state.bendVelocity, entryElapsed);
    syncComposite(post.compositeMaterial, config);
    if (!trailEnabled) config.trail = false;
    post.compositeMaterial.uniforms.uTrail.value = trail.update();
    post.render(scene, camera);
  };

  const unsubscribe = subscribeToTicker(tick, () => budget);
  window.addEventListener("resize", resize);
  resize();

  return {
    focusIndex: focusCard,
    dispose() {
      unsubscribe();
      window.clearTimeout(entryWait);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      scroll.dispose();
      post.dispose();
      cardBuffer.dispose();
      trail.dispose();
      geometry.dispose();
      cards.forEach((card) => {
        card.material.uniforms.uMap.value?.dispose();
        card.material.dispose();
      });
      renderer.dispose();
    },
  };
};
