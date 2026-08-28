"use client";

import { useEffect, useRef } from "react";
import {
  MathUtils,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  WebGLRenderer,
  type Texture,
} from "three";

import {
  HELIX_LENGTH,
  MOBILE_MAX,
  PIN_VH,
  TABLET_MAX,
  belts as beltConfig,
  camera as cameraConfig,
  grid as gridConfig,
  helix,
  phase,
} from "./design-in-motion.config";
import { createGrid } from "./grid";
import { createHelixGuides, createHelixTrain, trainSpan } from "./helix";

import type { RefObject } from "react";

/**
 * The pin and the WebGL sequence behind Design in Motion.
 *
 * **No ScrollTrigger.** GSAP is in this bundle for one thing (the staggered menu) and
 * ScrollTrigger is registered nowhere in `src/`. `ParticleScene` drives the whole Auralis sequence
 * off scroll progress in a rAF loop and `useWorkPin` does the same for the work track, so this is
 * the third consumer of the house pattern rather than a second scroll system on one page.
 *
 * **The pin is a tall spacer plus `position: sticky`,** and the phases are fractions of the
 * distance scrolled through it. They overlap deliberately — the grid starts arriving while the
 * last cards are still crossing — so the section reads as one move, not three.
 *
 * **Reduced motion and narrow viewports never start it.** `design-in-motion.css` defaults to a
 * static grid of the same stills and this hook only sets `data-pinned` once it has decided the
 * viewport is wide enough and motion is welcome, so the reduced, no-JS and pre-hydration readers
 * all get the same complete layout. Nothing is hidden waiting on WebGL.
 */

interface MotionSceneRefs {
  spacer: RefObject<HTMLDivElement | null>;
  stage: RefObject<HTMLDivElement | null>;
  canvas: RefObject<HTMLCanvasElement | null>;
  /** Holds the two headline halves, which slide apart on scrub. */
  title: RefObject<HTMLDivElement | null>;
  /** Empty; the closing belts are written into it. */
  belts: RefObject<HTMLDivElement | null>;
}

const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);
/** Maps `value` from one range onto 0..1, clamped. */
const span = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

/** Rate of the train's exponential settle, and of the hover scale. Higher is tighter. */
const FOLLOW = 6;
const HOVER_FOLLOW = 8;

export const useMotionScene = (sources: string[]): MotionSceneRefs => {
  const spacer = useRef<HTMLDivElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const title = useRef<HTMLDivElement | null>(null);
  const belts = useRef<HTMLDivElement | null>(null);

  const frame = useRef(0);
  const lastFrame = useRef(0);
  /* The train eases toward its target rather than snapping to it frame by frame, which is what
     gives the travel its weight. Exponential, so it is frame-rate independent. */
  const nose = useRef(0);

  useEffect(() => {
    const spacerEl = spacer.current;
    const stageEl = stage.current;
    const canvasEl = canvas.current;
    const titleEl = title.current;
    const beltsEl = belts.current;
    if (!spacerEl || !stageEl || !canvasEl || !titleEl || !beltsEl) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isStatic = (): boolean => window.innerWidth < MOBILE_MAX || motionQuery.matches;
    if (isStatic()) return;

    let disposed = false;
    const textures: Texture[] = [];

    const renderer = new WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
    renderer.setClearAlpha(0);
    const scene = new Scene();
    const view = new PerspectiveCamera(cameraConfig.fov.desktop, 1, 0.1, 200);

    /* Generic keyword fallback rather than a copy of the token's value — if the token layer ever
       fails to load, the guides should degrade to something plainly wrong-looking rather than
       silently pretend to be on-brand. Same rule as `motion/tokens.ts`. */
    const ruleColor =
      getComputedStyle(document.documentElement).getPropertyValue("--rule").trim() || "gray";

    let train = createHelixTrain([]);
    let gridScene = createGrid([]);
    const guides = createHelixGuides(ruleColor);
    scene.add(train.group, guides.group, gridScene.group);

    /* The belts are DOM, not WebGL — they are flat rectangles of one colour, and a div wiping up
       costs nothing where five more textured planes would. */
    const beltEls: HTMLElement[] = [];
    for (let i = 0; i < beltConfig.count; i += 1) {
      const belt = document.createElement("div");
      belt.className = "dim-belt";
      beltsEl.appendChild(belt);
      beltEls.push(belt);
    }

    const pointer = new Vector2(-2, -2);
    const raycaster = new Raycaster();
    const onPointerMove = (event: PointerEvent): void => {
      const box = canvasEl.getBoundingClientRect();
      pointer.set(
        ((event.clientX - box.left) / box.width) * 2 - 1,
        -((event.clientY - box.top) / box.height) * 2 + 1,
      );
    };
    const onPointerLeave = (): void => {
      pointer.set(-2, -2);
    };

    const resize = (): void => {
      const width = stageEl.clientWidth;
      const height = stageEl.clientHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);

      const mobile = window.innerWidth < MOBILE_MAX;
      const tablet = window.innerWidth < TABLET_MAX;
      const distance = mobile
        ? cameraConfig.distance.mobile
        : tablet
          ? cameraConfig.distance.tablet
          : cameraConfig.distance.desktop;
      const fov = mobile
        ? cameraConfig.fov.mobile
        : tablet
          ? cameraConfig.fov.tablet
          : cameraConfig.fov.desktop;

      view.fov = fov;
      view.aspect = width / Math.max(1, height);
      view.position.set(0, 0, distance);
      view.lookAt(0, 0, 0);
      view.updateProjectionMatrix();

      /* World units visible at the origin plane, so the grid is laid out in the space the camera
         actually shows rather than in guessed numbers. */
      const visibleHeight = 2 * distance * Math.tan(MathUtils.degToRad(fov) / 2);
      const visibleWidth = visibleHeight * view.aspect;
      gridScene.layout(visibleWidth, visibleHeight, mobile, height / visibleHeight);

      stageEl.setAttribute("data-pinned", "true");
      spacerEl.style.height = `${mobile ? PIN_VH.mobile : PIN_VH.desktop}vh`;
    };

    const trainLength = trainSpan(sources.length);
    const travel = HELIX_LENGTH + trainLength;

    const tick = (now: number): void => {
      frame.current = requestAnimationFrame(tick);
      if (isStatic()) return;

      const dt = Math.min((now - lastFrame.current) / 1000, 0.05);
      lastFrame.current = now;

      const height = spacerEl.offsetHeight - window.innerHeight;
      const progress =
        height <= 0 ? 0 : clamp01((window.scrollY - spacerEl.offsetTop) / height);

      /* ── phase 1 — the helix ─────────────────────────────────────────── */
      const helixProgress = span(progress, 0, phase.helixEnd);
      const target = -trainLength + helixProgress * travel;
      nose.current += (target - nose.current) * (1 - Math.exp(-FOLLOW * dt));
      train.update(nose.current);
      guides.update(nose.current + trainLength);

      const helixVisible = helixProgress < 1;
      train.group.visible = helixVisible;
      guides.group.visible = helixVisible;

      /* Raycast only while the cards are on screen, and only against the visible ones. */
      if (helixVisible) {
        raycaster.setFromCamera(pointer, view);
        const hits = raycaster.intersectObjects(
          train.cards.filter((card) => card.mesh.visible).map((card) => card.mesh),
          false,
        );
        const hovered = hits[0]?.object;
        for (const card of train.cards) {
          const wanted = card.mesh === hovered ? helix.hoverScale : 1;
          card.scale += (wanted - card.scale) * (1 - Math.exp(-HOVER_FOLLOW * dt));
        }
      }

      /* ── phase 2 — the grid ──────────────────────────────────────────── */
      const gridProgress = span(progress, phase.gridStart, phase.gridEnd);
      gridScene.group.visible = gridProgress > 0;
      if (gridScene.group.visible) gridScene.update(gridProgress, dt);

      /* ── the headline halves ─────────────────────────────────────────── */
      titleEl.style.setProperty("--split", `${span(progress, 0, phase.gridStart)}`);

      /* ── phase 3 — the belts ─────────────────────────────────────────── */
      const beltProgress = span(progress, phase.beltStart, 1);
      beltEls.forEach((belt, index) => {
        /* Lowest first: the last belt in the DOM sits at the bottom. */
        const order = beltEls.length - 1 - index;
        const window_ = Math.max(1e-3, 1 - order * beltConfig.stagger);
        belt.style.transform = `scaleY(${clamp01((beltProgress - order * beltConfig.stagger) / window_)})`;
      });

      renderer.render(scene, view);
    };

    /* Textures load after the scene exists, so a slow image never blocks the pin from measuring. */
    const loader = new TextureLoader();
    Promise.all(
      sources.map(
        (src) =>
          new Promise<Texture>((resolve, reject) => {
            loader.load(src, resolve, undefined, reject);
          }),
      ),
    )
      .then((loaded) => {
        if (disposed) {
          for (const texture of loaded) texture.dispose();
          return;
        }
        for (const texture of loaded) {
          texture.colorSpace = SRGBColorSpace;
          textures.push(texture);
        }

        scene.remove(train.group, gridScene.group);
        train.dispose();
        gridScene.dispose();
        train = createHelixTrain(textures);
        gridScene = createGrid(textures.slice(0, gridConfig.count));
        scene.add(train.group, gridScene.group);
        resize();
      })
      .catch(() => {
        /* A failed texture must not strand the section — the fallback grid is still in the markup
           underneath, so dropping the pin returns the reader to a complete layout. */
        stageEl.removeAttribute("data-pinned");
        spacerEl.style.height = "";
      });

    resize();
    lastFrame.current = performance.now();
    frame.current = requestAnimationFrame(tick);

    window.addEventListener("resize", resize);
    motionQuery.addEventListener("change", resize);
    canvasEl.addEventListener("pointermove", onPointerMove);
    canvasEl.addEventListener("pointerleave", onPointerLeave);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame.current);
      window.removeEventListener("resize", resize);
      motionQuery.removeEventListener("change", resize);
      canvasEl.removeEventListener("pointermove", onPointerMove);
      canvasEl.removeEventListener("pointerleave", onPointerLeave);
      train.dispose();
      guides.dispose();
      gridScene.dispose();
      for (const texture of textures) texture.dispose();
      renderer.dispose();
      for (const belt of beltEls) belt.remove();
      stageEl.removeAttribute("data-pinned");
      spacerEl.style.height = "";
    };
  }, [sources]);

  return { spacer, stage, canvas, title, belts };
};
