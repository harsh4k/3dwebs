/**
 * Coffee Digital — portable ambient background.
 *
 * The atmospheric layer of coffeedigital's WebGL home page and nothing else:
 *
 *   a fogged vertical-gradient room · airborne dust that floats and sways ·
 *   sparse accent motes that rise and evaporate · ACES filmic tone mapping,
 *   selective additive bloom and a vignette over the top.
 *
 * **Zero assets.** No models, no point clouds, no textures, no fonts, no network requests of any
 * kind — every particle is generated at runtime from a seeded PRNG, so the layout is identical on
 * every load. Drop it behind any page, point it at a container, done.
 *
 * What was deliberately left behind: the site's figures (the bean mark, the trophy, the tree),
 * their containment lattices and the scroll film that drives them. Those need a pinned stage and
 * baked geometry; a background needs neither.
 *
 * The scene renders whole on the first frame. Nothing is hidden and revealed only by animation,
 * and `prefers-reduced-motion` holds the room still rather than switching it off.
 */

import {
  ACESFilmicToneMapping,
  Fog,
  Material,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { VignetteShader } from "three/examples/jsm/shaders/VignetteShader.js";

import { createBackdrop } from "./scene/backdrop";
import { BloomPass } from "./scene/bloom-pass";
import { clampedPixelRatio, deviceTier, frameBudgetMs, viewScale, wantsPointer } from "./scene/device";
import type { DeviceTier } from "./scene/device";
import { createDust } from "./scene/dust";
import { createRisingMotes } from "./scene/rising-motes";
import { sceneConfig } from "./scene/scene.config";
import { createGrain, createLightLeak } from "./overlays";
import { resolveOptions } from "./options";
import type { BackgroundOptions } from "./options";

export interface BackgroundHandle {
  /** Stop the loop and free every GPU resource. The canvas is removed from the container. */
  destroy: () => void;
  /** Pause / resume rendering — e.g. while a modal owns the screen. */
  setPaused: (paused: boolean) => void;
  /** The live renderer, or `null` when WebGL was unavailable and nothing was mounted. */
  renderer: WebGLRenderer | null;
}

/** Frees every GPU resource reachable from the scene graph. */
const disposeScene = (root: Object3D): void => {
  root.traverse((object) => {
    const mesh = object as Partial<Mesh>;
    if (mesh.geometry) mesh.geometry.dispose();
    if (!mesh.material) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const entry of materials) {
      const material = entry as Material & { map?: Texture | null };
      material.map?.dispose();
      material.dispose();
    }
  });
};

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Mounts the background into `container` (which should be positioned and sized — the canvas
 * fills it). Returns a handle; call `destroy()` when the host element goes away.
 */
export const mountCoffeeBackground = (
  container: HTMLElement,
  input: Partial<BackgroundOptions> = {},
): BackgroundHandle => {
  const options = resolveOptions(input);
  const colors = { ...sceneConfig.colors, ...options.colors };

  const tier: DeviceTier = options.quality === "low" ? "mobile" : deviceTier();
  const isMobile = tier === "mobile";
  const still = options.motion === "auto" && prefersReducedMotion();
  const pointerEnabled = wantsPointer(tier) && !still && options.parallax > 0;

  // --- Renderer ----------------------------------------------------------
  // A page can hit the browser's WebGL context limit; `WebGLRenderer` throws in that case and
  // the host page must survive it. No canvas, no loop, an inert handle.
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      // Everything visible renders through the composer's targets, which carry no MSAA samples,
      // so `antialias` would multisample only the final full-screen quad — real bandwidth, zero
      // smoothing. The DPR clamp and the soft particle sprites carry the edges instead.
      antialias: false,
      // The backdrop mesh fills the canvas, so there is nothing to blend against the page.
      alpha: false,
      stencil: false,
      // Nothing here casts a shadow, so the depth buffer buys nothing either.
      depth: false,
      powerPreference: isMobile ? "default" : "high-performance",
    });
  } catch {
    return { destroy: () => {}, setPaused: () => {}, renderer: null };
  }

  renderer.setPixelRatio(clampedPixelRatio(tier));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = options.exposure;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  // --- Overlays ----------------------------------------------------------
  // The grain and the light leaks are DOM layers over the canvas, not passes in the composer —
  // exactly as on the site. `mix-blend-mode` against the page is the whole point: an overlay
  // blend re-contrasts the ground, which a post pass inside the WebGL frame cannot do.
  // They need the container to establish a containing block for their absolute positioning.
  if (getComputedStyle(container).position === "static") container.style.position = "relative";
  // The leak lights with the warm end of the palette (`fog`, the cream) and shades with the ink:
  // lighting with the near-white `backdropTop` pulled the warmth out of everything it touched.
  const overlays = [
    createLightLeak(options.lightLeak, colors.fog, colors.particle),
    createGrain(options.grain),
  ];
  for (const overlay of overlays) {
    if (overlay) container.appendChild(overlay);
  }

  const scene = new Scene();
  scene.fog = new Fog(colors.fog, options.fog.near, options.fog.far);

  const camera = new PerspectiveCamera(options.fov, 1, 0.1, 600);
  const cameraHome = new Vector3(...options.cameraPosition);
  const cameraTarget = new Vector3(...options.cameraTarget);
  camera.position.copy(cameraHome);
  camera.lookAt(cameraTarget);

  // --- The room ----------------------------------------------------------
  // A large inverted sphere carrying a vertical gradient. A flat `scene.background` colour reads
  // as a void; the gradient is what makes the space feel like a lit room. The fog colour equals
  // the gradient's bottom stop, so the horizon line never seams.
  scene.add(createBackdrop(colors.backdropTop, colors.backdropBottom));

  // --- Atmosphere --------------------------------------------------------
  const dust =
    options.dustCount > 0
      ? createDust(
          {
            ...sceneConfig.dust,
            count: Math.round(options.dustCount * (isMobile ? 0.45 : 1)),
            size: sceneConfig.dust.size * options.dustSize,
          },
          colors.dust,
          { color: colors.fog, near: options.fog.near, far: options.fog.far },
        )
      : null;
  if (dust) scene.add(dust.points);

  // Sparse rising sparks — the one place the accent appears. Fully GPU-driven: the per-frame
  // cost is a single `uTime` uniform write, so they add life without touching the frame budget
  // (unlike the dust, whose drift is a per-mote CPU loop).
  const motes =
    options.moteCount > 0
      ? createRisingMotes({
          ...sceneConfig.waveMotes,
          count: Math.round(options.moteCount * (isMobile ? 0.5 : 1)),
          center: [cameraTarget.x, 0, cameraTarget.z],
          spreadX: 30,
          spreadZ: 22,
          rise: 34,
          color: options.accent,
        })
      : null;
  if (motes) scene.add(motes.points);

  // --- Post-processing ---------------------------------------------------
  // The bloom threshold sits above the dust and the backdrop and below the accent motes, so only
  // the motes glow — a scene-wide haze is exactly what got bloom removed from the site once.
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // `viewScale` keeps a look tuned on a 1080-tall window from blowing out on a short one:
  // point sizes and glow are set in device px, so they occupy a larger fraction of a short screen.
  const bloomScale = (isMobile ? 0.5 : 1) * viewScale();
  const bloomPass = new BloomPass({
    ...options.bloom,
    strength: options.bloom.strength * bloomScale,
    radius: options.bloom.radius * (isMobile ? 0.5 : 1),
  });
  composer.addPass(bloomPass);
  const vignette = new ShaderPass(VignetteShader);
  vignette.uniforms.offset.value = options.vignette.offset;
  vignette.uniforms.darkness.value = options.vignette.darkness;
  composer.addPass(vignette);
  composer.addPass(new OutputPass());

  // --- Cursor parallax ---------------------------------------------------
  // Not attached at all on touch — not "attached and ignored". Without a cursor there is nothing
  // to ease toward, and an unmoved pointer would resolve to the centre of the screen forever.
  const pointerNdc = new Vector2();
  const eased = new Vector2();
  let pointerInside = false;

  const handlePointerMove = (event: PointerEvent): void => {
    const bounds = container.getBoundingClientRect();
    pointerNdc.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    pointerInside = true;
  };
  const handlePointerOut = (): void => {
    pointerInside = false;
  };
  if (pointerEnabled) {
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerOut, { passive: true });
  }

  // --- Sizing ------------------------------------------------------------
  let lastWidth = 0;
  let lastHeight = 0;
  let dirty = true;
  const applySize = (): void => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;
    if (width === lastWidth && height === lastHeight) return;
    lastWidth = width;
    lastHeight = height;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    // The composer owns its own targets — left at raw DPR it renders the whole post chain at
    // full resolution and throws the extra pixels away in the final blit.
    composer.setSize(width, height);
    composer.setPixelRatio(clampedPixelRatio(tier));
    const bufferHeight = renderer.getContext().drawingBufferHeight;
    dust?.resize(bufferHeight);
    motes?.resize(bufferHeight);
    dirty = true;
  };

  const resizeObserver =
    typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => applySize());
  resizeObserver?.observe(container);
  applySize();

  // --- Visibility --------------------------------------------------------
  let onScreen = true;
  const intersectionObserver =
    options.pauseOffscreen && typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          (entries) => {
            onScreen = entries.some((entry) => entry.isIntersecting);
          },
          { rootMargin: "128px" },
        )
      : null;
  intersectionObserver?.observe(container);

  // --- Loop --------------------------------------------------------------
  const budget = frameBudgetMs(tier);
  const start = performance.now();
  let raf = 0;
  let last = start;
  let paused = false;
  let disposed = false;

  const frame = (now: number): void => {
    raf = requestAnimationFrame(frame);
    if (paused || !onScreen) return;
    if (now - last <= budget) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const time = (now - start) / 1000;

    if (still) {
      // Reduced motion: the complete room, rendered once and then only when invalidated.
      if (!dirty) return;
      dirty = false;
      composer.render();
      return;
    }

    // The dust drifts at the site's rate by default; `dustDrift: 0` freezes it outright.
    dust?.update(time * options.dustDrift);
    motes?.update(time);

    // The camera breathes: a very slow figure-eight around its home pose, plus a few world units
    // eased toward the cursor. Frame-rate-independent low-pass, so it glides after the pointer
    // and decays back to centre when it leaves.
    const k = 1 - Math.pow(0.94, dt * 60);
    eased.x += ((pointerInside ? pointerNdc.x : 0) - eased.x) * k;
    eased.y += ((pointerInside ? pointerNdc.y : 0) - eased.y) * k;
    const drift = options.drift;
    camera.position.set(
      cameraHome.x + Math.sin(time * 0.08) * drift + eased.x * options.parallax,
      cameraHome.y + Math.sin(time * 0.11) * drift * 0.6 + eased.y * options.parallax * 0.5,
      cameraHome.z,
    );
    camera.lookAt(cameraTarget);

    composer.render();
  };
  raf = requestAnimationFrame(frame);

  // --- Teardown ----------------------------------------------------------
  const destroy = (): void => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    if (pointerEnabled) {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
    }
    composer.dispose();
    disposeScene(scene);
    renderer.dispose();
    renderer.domElement.remove();
    for (const overlay of overlays) overlay?.remove();
  };

  return {
    destroy,
    setPaused: (value: boolean) => {
      paused = value;
      last = performance.now();
    },
    renderer,
  };
};
